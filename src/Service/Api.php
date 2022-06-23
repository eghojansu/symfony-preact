<?php

namespace App\Service;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Exception\FormViolationException;
use App\Utils;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Serializer\SerializerInterface;

class Api
{
    const MIN_PAGE_SIZE = 15;
    const MAX_PAGE_SIZE = 75;

    public function __construct(
        private FormFactoryInterface $formFactory,
        private SerializerInterface $serializer,
        private RouterInterface $router,
        private RequestStack $requestStack,
        private EntityManagerInterface $em,
    ) {}

    public function json(
        mixed $data,
        int $status = 200,
        array $headers = null,
        array $context = null,
    ): JsonResponse {
        $json = $this->serializer->serialize($data, 'json', array_merge(array(
            'json_encode_options' => JsonResponse::DEFAULT_ENCODING_OPTIONS,
        ), $context ?? array()));

        return new JsonResponse($json, $status, $headers ?? array(), true);
    }

    public function rest(
        mixed $data = null,
        string $message = null,
        bool $success = true,
        int $code = null,
        array $headers = null,
    ): JsonResponse {
        $payload = compact('success') + array_filter(compact('message', 'data'));
        $status = $code ?? ($success ? Response::HTTP_OK : Response::HTTP_UNPROCESSABLE_ENTITY);

        return $this->json($payload, $status, $headers ?? array());
    }

    public function message(
        string $message = null,
        mixed $data = null,
        bool $success = true,
        int $code = null,
        array $headers = null,
    ): JsonResponse {
        return $this->rest($data, $message, $success, $code, $headers);
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

        return $this->rest(
            ($data ?? array()) + $add,
            'Data has been ' . $done,
            true,
            null,
            $headers,
        );
    }

    public function handleJson(
        string $formType,
        object $data,
        callable|bool $persist = false,
        array $options = null,
        Request &$request = null,
    ): void {
        $this->handleJsonForm($formType, $data, $options, $request);

        if ($persist) {
            if (is_callable($persist)) {
                $persist($data, $this->em);
            } else {
                $this->em->persist($data);
            }
        }

        $this->em->flush();
    }

    public function handleJsonForm(
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

    public function paginate(string $entity, array $filters = null, \Closure $modify = null): JsonResponse
    {
        $request = $this->requestStack->getCurrentRequest();
        $page = max(1, $request->query->getInt('page'));
        $size = min(self::MAX_PAGE_SIZE, max(self::MIN_PAGE_SIZE, $request->query->getInt('size')));
        $offset = ($page - 1) * $size;

        /** @var EntityRepository */
        $repo = $this->em->getRepository($entity);
        $qb = $repo->createQueryBuilder('a')->orderBy('a.id');

        if ($filters) {
            $qb->andWhere(
                $qb->expr()->andX(
                    ...Utils::map(
                        $filters,
                        static function ($value, $key) use ($qb) {
                            list($prop, $opr) = explode(' ', $key) + array(1 => null);
                            $name = $prop;

                            if (false === strpos($prop, '.')) {
                                $prop = 'a.' . $prop;
                            } else {
                                $name = strrchr($prop, '.');
                            }

                            $id = ':' . $name;

                            return match($opr) {
                                '<>', '!=' => $qb->setParameter($name, $value)->expr()->neq($prop, $id),
                                default => $qb->setParameter($name, $value)->expr()->eq($prop, $id),
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

        return $this->rest(compact('items', 'page', 'size', 'next', 'prev', 'total', 'pages'));
    }
}