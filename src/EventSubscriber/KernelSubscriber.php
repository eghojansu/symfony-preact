<?php

namespace App\EventSubscriber;

use App\Exception\FormViolationException;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class KernelSubscriber implements EventSubscriberInterface
{
    public function onKernelException(ExceptionEvent $event): void
    {
        $error = $event->getThrowable();
        $response = match(true) {
            $error instanceof FormViolationException => static::createFormViolationResponse($error),
            default => null,
        };

        if ($response) {
            $event->setResponse($response);
        }
    }

    public static function getSubscribedEvents(): array
    {
        return [
            'kernel.exception' => 'onKernelException',
        ];
    }

    private static function createFormViolationResponse(FormViolationException $error): JsonResponse
    {
        $errors = static::formErrors($error->getForm());

        return new JsonResponse(
            array(
                'message' => $error->getMessage(),
                'errors' => $errors,
            ),
            $error->getStatusCode(),
            $error->getHeaders(),
        );
    }

    private static function formErrors(FormInterface $form): array
    {
        $errors = array();

        foreach ($form->getErrors() as $error) {
            $errors[] = $error->getMessage();
        }

        foreach ($form->all() as $childForm) {
            if ($childForm instanceof FormInterface) {
                if ($childErrors = static::formErrors($childForm)) {
                    $errors[$childForm->getName()] = $childErrors;
                }
            }
        }

        return $errors;
    }
}
