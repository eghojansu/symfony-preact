<?php

namespace App\Extension\API;

use App\Extension\Utils;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Form\FormInterface;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\RouterInterface;
use App\Extension\Auditable\AuditableInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Serializer\SerializerInterface;

class Rest
{
    const MIN_PAGE_SIZE = 15;
    const MAX_PAGE_SIZE = 75;

    public function __construct(
        private FormFactoryInterface $formFactory,
        private SerializerInterface $serializer,
        private RouterInterface $router,
        private RequestStack $requestStack,
        private EntityManagerInterface $em,
        private Security $security,
    ) {}

    public function json(
        mixed $data,
        int $status = null,
        array $headers = null,
        array $context = null,
    ): JsonResponse {
        $json = $this->serializer->serialize($data, 'json', array_merge(array(
            'json_encode_options' => JsonResponse::DEFAULT_ENCODING_OPTIONS,
        ), $context ?? array()));

        return new JsonResponse($json, $status ?? Response::HTTP_OK, $headers ?? array(), true);
    }

    public function source(
        mixed $items = null,
        string $message = null,
        array $headers = null,
    ): JsonResponse {
        $payload = array_filter(compact('message', 'items'));

        return $this->json($payload, null, $headers);
    }

    public function data(
        mixed $data = null,
        string $message = null,
        bool $success = true,
        int $code = null,
        array $headers = null,
    ): JsonResponse {
        $payload = compact('success') + array_filter(compact('message', 'data'));
        $status = $code ?? ($success ? Response::HTTP_OK : Response::HTTP_UNPROCESSABLE_ENTITY);

        return $this->json($payload, $status, $headers);
    }

    public function message(
        string $message = null,
        mixed $data = null,
        bool $success = true,
        int $code = null,
        array $headers = null,
    ): JsonResponse {
        return $this->data($data, $message, $success, $code, $headers);
    }

    public function saved(
        string|array|bool $action = null,
        mixed $data = null,
        array $headers = null,
    ): JsonResponse {
        return $this->done(__FUNCTION__, $action, $data, $headers);
    }

    public function removed(
        string|array|bool $action = null,
        mixed $data = null,
        array $headers = null,
    ): JsonResponse {
        return $this->done(__FUNCTION__, $action, $data, $headers);
    }

    public function done(
        string $done,
        string|array|bool $action = null,
        mixed $data = null,
        array $headers = null,
    ): JsonResponse {
        $add = array();

        if (is_bool($action)) {
            $add['refresh'] = $action;
        } elseif (is_string($action)) {
            $add['redirect'] = $action;
        } elseif ($action) {
            $add['redirect'] = $this->router->generate(...$action);
        }

        return $this->data(
            ($data ?? array()) + $add,
            'Data has been ' . $done,
            true,
            null,
            $headers,
        );
    }

    public function handlePagination(
        string $entity,
        array $filters = null,
        \Closure $modify = null,
    ): JsonResponse {
        return $this->data($this->paginate($entity, $filters, $modify));
    }

    public function handleRemove(
        object $entity,
        string|array|bool $action = null,
        mixed $data = null,
        array $headers = null,
    ): JsonResponse {
        $this->remove($entity);

        return $this->removed($action, $data, $headers);
    }

    public function handleRestore(
        AuditableInterface $entity,
        string|array|bool $action = null,
        mixed $data = null,
        array $headers = null,
    ): JsonResponse {
        $this->restore($entity);

        return $this->done('restored', $action, $data, $headers);
    }

    public function handleSave(
        string $formType,
        object $data,
        callable|bool $persist = false,
        array $options = null,
        string|array|bool $action = null,
        array $headers = null,
    ): JsonResponse {
        $this->save($formType, $data, $persist, $options);

        return $this->saved($action, null, $headers);
    }

    public function createForm(
        string $type,
        object|array $data = null,
        array $options = null,
        Request &$request = null,
    ): FormInterface {
        $defaults = array(
            'csrf_protection' => false,
        );

        if (!$request) {
            $request = $this->requestStack->getCurrentRequest();
        }

        $isJson = 'json' === $request->getContentType();
        $submittedData = $isJson ? json_decode($request->getContent(), true) : $request->request->all();
        $form = $this->formFactory->create($type, $data, ($options ?? array()) + $defaults);

        $form->submit($submittedData);

        if ($form->isSubmitted() && !$form->isValid()) {
            throw new FormViolationException($form);
        }

        return $form;
    }

    public function save(
        string $formType,
        object $data,
        callable|bool $persist = false,
        array $options = null,
        Request &$request = null,
    ): void {
        $this->createForm($formType, $data, $options, $request);

        if ($persist) {
            if (is_callable($persist)) {
                $persist($data, $this->em);
            } else {
                $this->em->persist($data);
            }
        }

        $this->em->flush();
    }

    public function restore(AuditableInterface $entity): void
    {
        if (!$entity->getDeletedAt()) {
            return;
        }

        $entity->setDeletedAt(null);

        $this->em->flush();
    }

    public function remove(object $entity): void
    {
        $this->em->remove($entity);
        $this->em->flush();
    }

    public function paginate(
        string $entity,
        array $filters = null,
        \Closure $modify = null,
    ): array {
        $request = $this->requestStack->getCurrentRequest();
        $trash = $request->query->getBoolean('trash');
        $page = max(1, $request->query->getInt('page'));
        $size = min(self::MAX_PAGE_SIZE, max(self::MIN_PAGE_SIZE, $request->query->getInt('size')));
        $offset = ($page - 1) * $size;

        /** @var EntityRepository */
        $repo = $this->em->getRepository($entity);
        $qb = $repo->createQueryBuilder('a')->orderBy('a.id');

        if (
            $trash
            && is_subclass_of($entity, AuditableInterface::class)
            && $this->security->isGranted('ROLE_RESTORE')
        ) {
            $this->em->getFilters()->disable('auditable');

            $qb->andWhere($qb->expr()->isNotNull('a.deletedAt'));
        }

        if ($filters) {
            $pos = 1;
            $qb->andWhere(
                $qb->expr()->andX(
                    ...Utils::map(
                        $filters,
                        static function ($value, $key) use ($qb, &$pos) {
                            list($prop, $opr) = explode(' ', $key) + array(1 => null);

                            if (false === strpos($prop, '.')) {
                                $prop = 'a.' . $prop;
                            }

                            return match($opr) {
                                '<>', '!=' => $qb
                                    ->setParameter($pos, $value)
                                    ->expr()->neq($prop, '?' . ($pos++)),
                                default => $qb
                                    ->setParameter($pos, $value)
                                    ->expr()->eq($prop, '?' . ($pos++)),
                            };
                        },
                        false,
                    ),
                ),
            );
        }

        if ($modify) {
            $modify($qb);
        }

        $items = new Paginator($qb->getQuery());
        $total = count($items);
        $pages = ceil($total / $size);
        $prev = max(1, $page - 1);
        $next = min($pages, $page + 1);

        $items->getQuery()
            ->setFirstResult($offset)
            ->setMaxResults($size)
        ;

        return compact('items', 'page', 'size', 'next', 'prev', 'total', 'pages');
    }
}