<?php

namespace App\Controller;

use App\Entity\Csuser;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

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
}