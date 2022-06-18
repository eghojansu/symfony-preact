<?php

namespace App\Exception;

use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class FormViolationException extends HttpException
{
    public function __construct(
        private FormInterface $form,
        array $headers = null,
        \Throwable $previous = null,
    ) {
        parent::__construct(
            Response::HTTP_UNPROCESSABLE_ENTITY,
            'There was validation errors',
            $previous,
            $headers ?? array(),
            $code ?? 0,
        );
    }

    public function getForm(): FormInterface
    {
        return $this->form;
    }
}