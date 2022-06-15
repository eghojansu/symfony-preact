<?php

namespace App\Generator;

use App\Utils;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Id\AbstractIdGenerator;

class UniqidGenerator extends AbstractIdGenerator
{
    public function generateId(EntityManagerInterface $em, $entity)
    {
        return Utils::random(8);
    }
}