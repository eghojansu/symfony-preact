<?php

namespace App\Controller\Api;

use App\Controller\Controller as BaseController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

abstract class Controller extends BaseController
{
    protected function api(
        array|\JsonSerializable $data = null,
        string $message = null,
        bool $success = true,
        int $code = null,
        array $headers = null,
    ): JsonResponse {
        $payload = compact('success') + array_filter(compact('message', 'data'));
        $status = $code ?? ($success ? Response::HTTP_OK : Response::HTTP_UNPROCESSABLE_ENTITY);

        return $this->json($payload, $status, $headers ?? array());
    }

    protected function message(
        string $message = null,
        array|\JsonSerializable $data = null,
        bool $success = true,
        int $code = null,
        array $headers = null,
    ): JsonResponse {
        return $this->api($data, $message, $success, $code, $headers);
    }
}