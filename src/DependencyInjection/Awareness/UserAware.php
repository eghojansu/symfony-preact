<?php

namespace App\DependencyInjection\Awareness;

use App\Entity\Csuser;
use App\Repository\CsuserRepository;
use Symfony\Contracts\Service\Attribute\SubscribedService;
use Lexik\Bundle\JWTAuthenticationBundle\Security\User\JWTUser;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

trait UserAware
{
    /** @var Csuser */
    private $_currentUser;

    #[SubscribedService()]
    private function tokenStorage(): TokenStorageInterface
    {
        return $this->container->get(__CLASS__.'::'.__FUNCTION__);
    }

    #[SubscribedService()]
    private function userRepository(): CsuserRepository
    {
        return $this->container->get(__CLASS__.'::'.__FUNCTION__);
    }

    private function currentUser(): Csuser|null
    {
        return $this->_currentUser ?? (
            $this->_user = ($token = $this->user()) ? $this->userRepository()->findUser($token->getUserIdentifier()) : null
        );
    }

    private function user(): JWTUser|null
    {
        return $this->tokenStorage()->getToken()?->getUser();
    }
}