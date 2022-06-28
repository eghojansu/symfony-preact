<?php

namespace App\Service;

use App\Entity\Cshist;
use App\Entity\Csuser;
use App\Form\AccountType;
use App\Form\AccountPasswordType;
use Doctrine\ORM\EntityManagerInterface;
use App\DependencyInjection\Awareness\UserAware;
use App\DependencyInjection\Awareness\RequestAware;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Contracts\Service\ServiceSubscriberTrait;
use Symfony\Contracts\Service\ServiceSubscriberInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class Account implements ServiceSubscriberInterface
{
    use ServiceSubscriberTrait, UserAware, RequestAware;

    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private TokenStorageInterface $tokenStorage,
        private JWTTokenManagerInterface $jwtManager,
        private Api $api,
    ) {}

    public function getProfile(): array
    {
        $user = $this->user();

        return array(
            'name' => $user->getName(),
            'email' => $user->getEmail(),
        );
    }

    public function record(
        string $activity,
        array $payload = null,
        bool $active = null,
        Request $request = null,
    ): Cshist {
        $req = $request ?? $this->request();
        $info = sprintf('%s %s', $req->getMethod(), $req->getPathInfo());

        $history = new Cshist();
        $history->setName($activity);
        $history->setActive($active);
        $history->setPayload($payload);
        $history->setIp($req->getClientIp());
        $history->setAgent($req->headers->get('User-Agent'));
        $history->setRequest($info);
        $history->setUser($this->user());
        $history->setRecordDate(new \DateTime());

        $this->em->persist($history);
        $this->em->flush();

        return $history;
    }

    public function profileUpdate(): void
    {
        $this->api->handleJson(AccountType::class, $this->user());
    }

    public function passwordUpdate(): void
    {
        $this->api->handleJson(
            AccountPasswordType::class,
            $this->user(),
            fn (Csuser $user) => $user->setPassword(
                $this->passwordHasher->hashPassword(
                    $user,
                    $user->getNewPassword(),
                ),
            ),
        );
    }
}