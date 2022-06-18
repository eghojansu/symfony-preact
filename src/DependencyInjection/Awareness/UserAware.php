<?php

namespace App\DependencyInjection\Awareness;

use App\Entity\Csuser;
use Symfony\Contracts\Service\Attribute\SubscribedService;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

trait UserAware
{
    #[SubscribedService()]
    private function tokenStorage(): TokenStorageInterface
    {
        return $this->container->get(__CLASS__.'::'.__FUNCTION__);
    }

    private function user(): Csuser|null
    {
        /** @var Csuser|null */
        $user = $this->tokenStorage()->getToken()?->getUser();

        return $user;
    }
}