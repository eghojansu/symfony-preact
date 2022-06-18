<?php

namespace App\Controller;

use App\Entity\Csuser;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;

/**
 * @property Csuser $user
 * @property Request $request
 */
abstract class Controller extends AbstractController
{
    public static function getSubscribedServices(): array
    {
        return static::subscribing() + parent::getSubscribedServices();
    }

    protected static function subscribing(): array
    {
        return array();
    }

    public function __get($name)
    {
        if (method_exists($this, $getter = '_get' . $name)) {
            return $this->$getter();
        }

        return $this->container->get($name);
    }

    protected function _getUser(): Csuser
    {
        /** @var Csuser */
        $user = $this->getUser();

        if (!$user) {
            throw $this->createAccessDeniedException();
        }

        return $user;
    }

    protected function _getRequest(): Request
    {
        /** @var Request */
        $request = $this->container->get('request_stack')->getCurrentRequest();

        return $request;
    }
}