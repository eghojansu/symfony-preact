<?php

namespace App\DependencyInjection\Awareness;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Contracts\Service\Attribute\SubscribedService;

trait RequestAware
{
    #[SubscribedService()]
    private function requestStack(): RequestStack
    {
        return $this->container->get(__METHOD__);
    }

    private function request(): Request
    {
        return $this->requestStack()->getCurrentRequest();
    }
}