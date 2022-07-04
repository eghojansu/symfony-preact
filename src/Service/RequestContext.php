<?php

namespace App\Service;

use App\Entity\Csuser;
use App\Repository\CsuserRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Lexik\Bundle\JWTAuthenticationBundle\Security\User\JWTUser;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class RequestContext
{
    /** @var Csuser */
    private $user;

    public function __construct(
        private TokenStorageInterface $tokenStorage,
        private RequestStack $requestStack,
        private CsuserRepository $repo,
    ) {}

    public function request(): Request
    {
        return $this->requestStack->getCurrentRequest();
    }

    public function currentUser(): Csuser|null
    {
        if (!$this->user) {
            $user = $this->user();

            if ($user && !$user instanceof Csuser) {
                $user = $this->repo->findUser($user->getUserIdentifier());
            }

            $this->user = $user;
        }

        return $this->user;
    }

    public function user(): JWTUser|Csuser|null
    {
        return $this->tokenStorage->getToken()?->getUser();
    }
}