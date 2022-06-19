<?php

namespace App\Controller\Api;

use App\Entity\Csuser;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/user')]
class UserController extends Controller
{
    #[Route('', methods: 'GET')]
    public function home()
    {
        return $this->api->paginate(Csuser::class);
    }
}