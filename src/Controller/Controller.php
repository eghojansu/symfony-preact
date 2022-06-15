<?php

namespace App\Controller;

use App\Entity\Csuser;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;

abstract class Controller extends AbstractController
{
    protected function user(): Csuser
    {
        /** @var Csuser */
        $user = $this->getUser();

        if (!$user) {
            throw $this->createAccessDeniedException();
        }

        return $user;
    }

    protected function request(): Request
    {
        /** @var Request */
        $request = $this->container->get('request_stack')->getCurrentRequest();

        return $request;
    }
}