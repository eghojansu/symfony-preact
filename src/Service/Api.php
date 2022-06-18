<?php

namespace App\Service;

use App\Exception\FormViolationException;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Serializer\SerializerInterface;

class Api
{
    public function __construct(
        private FormFactoryInterface $formFactory,
        private SerializerInterface $serializer,
        private RouterInterface $router,
        private RequestStack $requestStack,
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
            'Data has been saved',
            true,
            null,
            $headers,
        );
    }

    public function handleJsonForm(
        string $type,
        $data = null,
        array $options = null,
        Request &$request = null,
    ): FormInterface {
        $defaults = array(
            'csrf_protection' => false,
        );

        if (!$request) {
            $request = $this->requestStack->getCurrentRequest();
        }

        $form = $this->formFactory->create(
            $type,
            $data,
            ($options ?? array()) + $defaults,
        );
        $submittedData = (
            'json' === $request->getContentType() ?
                json_decode($request->getContent(), true) :
                $request->request->all()
        );

        $form->submit($submittedData);

        if ($form->isSubmitted() && !$form->isValid()) {
            throw new FormViolationException($form);
        }

        return $form;
    }
}