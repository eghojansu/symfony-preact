<?php

namespace App\Controller;

use App\Entity\Csuser;
use App\Extension\Utils;
use App\Service\Account;
use App\Repository\CsuserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Lexik\Bundle\JWTAuthenticationBundle\Security\User\JWTUser;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

/**
 * @property Csuser $currentUser
 * @property JWTUser $user
 * @property Account $account
 * @property Request $request
 * @property EntityManagerInterface $em
 */
abstract class Controller extends AbstractController
{
    public static function getSubscribedServices(): array
    {
        return static::subscribing() + parent::getSubscribedServices() + array(
            'em' => EntityManagerInterface::class,
            'account' => Account::class,
        );
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

    protected function someGranted(string ...$checks): bool
    {
        return Utils::some(
            Utils::flatten($checks),
            fn (string $role) => $this->isGranted($role),
        );
    }

    protected function _getCurrentUser(): Csuser
    {
        /** @var CsuserRepository */
        $repo = $this->em->getRepository(Csuser::class);

        /** @var Csuser|null */
        $user = $repo->findUser($this->user->getUserIdentifier());

        if (!$user) {
            throw $this->createAccessDeniedException();
        }

        return $user;
    }

    protected function _getUser(): JWTUser
    {
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