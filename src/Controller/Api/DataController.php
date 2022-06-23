<?php

namespace App\Controller\Api;

use App\Entity\Csuser;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

#[Route('/api/data')]
class DataController extends Controller
{
    #[Route('/roles', methods: 'GET')]
    #[IsGranted('ROLE_ADMIN')]
    public function roles()
    {
        return $this->api->rest(array(
            'items' => array_filter(
                Csuser::ROLES,
                static fn (string $role) => 'ROLE_ROOT' !== $role,
            ),
        ));
    }
}