<?php

namespace App\Controller;

use App\Entity\Csuser;
use App\Repository\CsuserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Lexik\Bundle\JWTAuthenticationBundle\Security\User\JWTUser;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

/**
 * @property Csuser $user
 * @property JWTUser $userToken
 * @property Request $request
 * @property EntityManagerInterface $em
 */
abstract class Controller extends AbstractController
{
    public static function getSubscribedServices(): array
    {
        return static::subscribing() + parent::getSubscribedServices() + array(
            'em' => EntityManagerInterface::class,
        );
    }

    protected static function subscribing(): array
    {
        return array();
    }

    protected function removeEntity(object $entity): void
    {
        $this->em->remove($entity);
        $this->em->flush();
    }

    public function __get($name)
    {
        if (method_exists($this, $getter = '_get' . $name)) {
            return $this->$getter();
        }

        return $this->container->get($name);
    }

    protected function _getUser(): Csuser
    {
        /** @var CsuserRepository */
        $repo = $this->em->getRepository(Csuser::class);

        /** @var Csuser|null */
        $user = $repo->findUser($this->userToken->getUserIdentifier());

        if (!$user) {
            throw $this->createAccessDeniedException();
        }

        return $user;
    }

    protected function _getUserToken(): JWTUser
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