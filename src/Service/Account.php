<?php

namespace App\Service;

use App\Form\AccountProfileType;
use App\Form\AccountPasswordType;
use Doctrine\ORM\EntityManagerInterface;
use App\DependencyInjection\Awareness\UserAware;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Contracts\Service\ServiceSubscriberTrait;
use Symfony\Contracts\Service\ServiceSubscriberInterface;

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
        $user = $this->user();

        $this->api->handleJsonForm(AccountProfileType::class, $user);
        $this->em->flush();
    }

    public function passwordUpdate(): void
    {
        $user = $this->user();

        $this->api->handleJsonForm(AccountPasswordType::class, $user);
        $user->setPassword($this->passwordHasher->hashPassword($user, $user->getNewPassword()));

        $this->em->flush();
    }
}