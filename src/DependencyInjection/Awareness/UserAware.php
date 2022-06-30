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
    private $_user;

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

    private function user(): Csuser|null
    {
        return $this->_user ?? (
            $this->_user = ($token = $this->userToken()) ? $this->userRepository()->findUser($token->getUserIdentifier()) : null
        );
    }

    private function userToken(): JWTUser|null
    {
        return $this->tokenStorage()->getToken()?->getUser();
    }
}