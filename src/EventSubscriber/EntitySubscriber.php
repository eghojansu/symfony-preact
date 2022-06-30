<?php

namespace App\EventSubscriber;

use App\Entity\Csuser;
use Doctrine\ORM\Events;
use Doctrine\ORM\UnitOfWork;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Concern\AuditableInterface;
use App\DependencyInjection\Awareness\UserAware;
use Symfony\Contracts\Service\ServiceSubscriberTrait;
use Symfony\Contracts\Service\ServiceSubscriberInterface;
use Doctrine\Bundle\DoctrineBundle\EventSubscriber\EventSubscriberInterface;
use Doctrine\ORM\Event\OnFlushEventArgs;

class EntitySubscriber implements EventSubscriberInterface, ServiceSubscriberInterface
{
    use ServiceSubscriberTrait, UserAware;

    public function getSubscribedEvents()
    {
        return array(
            Events::onFlush,
        );
    }

    public function onFlush(OnFlushEventArgs $args)
    {
        $em = $args->getEntityManager();
        $uow = $em->getUnitOfWork();
        $now = new \DateTime();
        $user = $this->user();

        foreach ($uow->getScheduledEntityInsertions() as $entity) {
            if ($entity instanceof AuditableInterface && $entity->isAuditable()) {
                $this->touch($entity, $user, $now);

                if ($entity->getCreatedBy()) {
                    $meta = $em->getClassMetadata(get_class($entity));

                    $uow->recomputeSingleEntityChangeSet($meta, $entity);
                }
            }
        }

        foreach ($uow->getScheduledEntityUpdates() as $entity) {
            if ($entity instanceof AuditableInterface && $entity->isAuditable()) {
                $this->touchUpdate($entity, $user, $now);

                $meta = $em->getClassMetadata(get_class($entity));

                $uow->recomputeSingleEntityChangeSet($meta, $entity);
            }
        }

        foreach ($uow->getScheduledEntityDeletions() as $entity) {
            if (
                $entity instanceof AuditableInterface
                && $entity->isAuditable()
                && !$entity->getDeletedAt()
            ) {
                $em->persist($entity);

                $updates = $this->touchDelete($entity, $user, $now);

                $uow->scheduleExtraUpdate($entity, $updates);
            }
        }
    }

    private function touch(
        AuditableInterface $entity,
        Csuser|null $user,
        \DateTime $ts,
    ): void {
        if (null === $entity->getCreatedAt()) {
            $entity->setCreatedAt($ts);
        }

        if (null === $entity->getCreatedBy() && $user) {
            $entity->setCreatedBy($user);
        }

        $this->touchUpdate($entity, $user, $ts, false);
    }

    private function touchUpdate(
        AuditableInterface $entity,
        Csuser|null $user,
        \DateTime $ts,
        bool $editing = true,
    ): void {
        if ($editing || null === $entity->getUpdatedAt()) {
            $entity->setUpdatedAt($ts);
        }

        if (
            ($editing || null === $entity->getUpdatedBy())
            && $user
        ) {
            $entity->setUpdatedBy($user);
        }
    }

    private function touchDelete(
        AuditableInterface $entity,
        Csuser|null $user,
        \DateTime $now,
    ): array {
        $updates = array(
            'deletedAt' => array($entity->getDeletedAt(), $now),
        );

        $entity->setDeletedAt($now);

        if ($user) {
            $updates['deletedBy'] = array($entity->getDeletedBy(), $user);

            $entity->setDeletedBy($user);
        }

        return $updates;
    }
}