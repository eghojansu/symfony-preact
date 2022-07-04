<?php

namespace App\Service;

use App\Entity\Cshist;
use App\Entity\Csuser;
use App\Form\AccountType;
use App\Form\AccountPasswordType;
use Doctrine\ORM\EntityManagerInterface;
use App\Extension\API\Rest;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class Account
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private TokenStorageInterface $tokenStorage,
        private JWTTokenManagerInterface $jwtManager,
        private RequestContext $requestContext,
        private Rest $api,
    ) {}

    public function getProfile(): array
    {
        $user = $this->requestContext->currentUser();

        return array(
            'name' => $user->getName(),
            'email' => $user->getEmail(),
        );
    }

    public function record(
        string $activity,
        array $payload = null,
        bool $active = null,
        Csuser $user = null,
        Request $request = null,
    ): Cshist {
        $req = $request ?? $this->requestContext->request();
        $info = sprintf('%s %s', $req->getMethod(), $req->getPathInfo());

        $history = new Cshist();
        $history->setName($activity);
        $history->setActive($active);
        $history->setPayload($payload);
        $history->setIp($req->getClientIp());
        $history->setAgent($req->headers->get('User-Agent'));
        $history->setRequest($info);
        $history->setUser($user ?? $this->requestContext->currentUser());
        $history->setRecordDate(new \DateTime());

        $this->em->persist($history);
        $this->em->flush();

        return $history;
    }

    public function profileUpdate(): void
    {
        $this->api->handleSave(AccountType::class, $this->requestContext->currentUser());
    }

    public function passwordUpdate(): void
    {
        $this->api->handleSave(
            AccountPasswordType::class,
            $this->requestContext->currentUser(),
            fn (Csuser $user) => $user->setPassword(
                $this->passwordHasher->hashPassword(
                    $user,
                    $user->getNewPassword(),
                ),
            ),
        );
    }
}