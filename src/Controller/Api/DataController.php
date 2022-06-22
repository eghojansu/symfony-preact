<?php

namespace App\Controller\Api;

use App\Entity\Csuser;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/data')]
class DataController extends Controller
{
    #[Route('/roles', methods: 'GET')]
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