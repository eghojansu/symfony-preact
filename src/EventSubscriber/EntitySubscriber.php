<?php

namespace App\EventSubscriber;

use App\DependencyInjection\Awareness\UserAware;
use App\Entity\Concern\AuditableInterface;
use App\Entity\Csuser;
use Doctrine\Bundle\DoctrineBundle\EventSubscriber\EventSubscriberInterface;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Events;
use Doctrine\ORM\UnitOfWork;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Symfony\Contracts\Service\ServiceSubscriberInterface;
use Symfony\Contracts\Service\ServiceSubscriberTrait;

class EntitySubscriber implements EventSubscriberInterface, ServiceSubscriberInterface
{
    use ServiceSubscriberTrait, UserAware;

    public function getSubscribedEvents()
    {
        return array(
            Events::prePersist,
        );
    }

    public function prePersist(LifecycleEventArgs $args)
    {
        $entity = $args->getObject();

        if ($entity instanceof AuditableInterface && $entity->isAuditable()) {
            $this->touch($entity, $this->getUserValue($args->getObjectManager()));
        }
    }

    private function touch(AuditableInterface $entity, Csuser|null $user): void
    {
        $now = new \DateTime();

        if (null === $entity->getCreatedAt()) {
            $entity->setCreatedAt($now);
        }

        if (null === $entity->getUpdatedAt()) {
            $entity->setUpdatedAt($now);
        }

        if (null === $entity->getCreatedBy() && $user) {
            $entity->setCreatedBy($user);
        }

        if (null === $entity->getUpdatedBy() && $user) {
            $entity->setUpdatedBy($user);
        }
    }

    private function getUserValue(EntityManagerInterface $manager): Csuser|null
    {
        $user = $this->user();

        if ($user && !$manager->contains($user) && UnitOfWork::STATE_MANAGED !== $manager->getUnitOfWork()->getEntityState($user)) {
            $manager->persist($user);
        }

        return $user;
    }

    private function getNow(): \DateTime
    {
        return new \DateTime();
    }
}