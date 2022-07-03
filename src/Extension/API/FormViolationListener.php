<?php

namespace App\Extension\API;

use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\KernelEvents;

#[AutoconfigureTag('kernel.event_listener', array(
    'event' => KernelEvents::EXCEPTION,
))]
class FormViolationListener
{
    public function __invoke(ExceptionEvent $event)
    {
        $error = $event->getThrowable();

        if (!$error instanceof FormViolationException) {
            return;
        }

        $event->setResponse(static::createResponse($error));
    }

    private static function createResponse(FormViolationException $error): JsonResponse
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
