<?php

namespace App\Service;

use App\Entity\Csuser;
use App\Form\AccountType;
use App\Form\AccountPasswordType;
use Doctrine\ORM\EntityManagerInterface;
use App\DependencyInjection\Awareness\UserAware;
use Symfony\Contracts\Service\ServiceSubscriberTrait;
use Symfony\Contracts\Service\ServiceSubscriberInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class Account implements ServiceSubscriberInterface
{
    use ServiceSubscriberTrait, UserAware;

    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
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