<?php

namespace App\Repository;

use App\Entity\Csmenu;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Csmenu>
 *
 * @method Csmenu|null find($id, $lockMode = null, $lockVersion = null)
 * @method Csmenu|null findOneBy(array $criteria, array $orderBy = null)
 * @method Csmenu[]    findAll()
 * @method Csmenu[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class CsmenuRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Csmenu::class);
    }

    public function add(Csmenu $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Csmenu $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
        * @return Csmenu[] Returns an array of Csmenu objects
        */
    public function getMenu(): array
    {
        $qb = $this->createQueryBuilder('a');
        $qb->where(
            $qb->expr()->andX(
                $qb->expr()->orX(
                    $qb->expr()->isNull('a.hidden'),
                    $qb->expr()->eq('a.hidden', ':hidden')
                ),
                $qb->expr()->eq('a.active', ':active')
            )
        );
        $qb->setParameters(array(
            'active' => true,
            'hidden' => false,
        ));

        return $qb->getQuery()->getResult();
    }

    public function findMenu(string $path): ?Csmenu
    {
        $qb = $this->createQueryBuilder('a');
        $qb->where(
            $qb->expr()->andX(
                $qb->expr()->eq('a.active', ':active'),
                $qb->expr()->eq('a.path', ':path'),
            )
        );
        $qb->setParameters(array(
            'active' => true,
        ) + compact('path'));

        return $qb->getQuery()->getOneOrNullResult();
    }
}
