<?php

namespace App\Controller\Api;

use App\Entity\Csuser;
use App\Form\UserType;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/user')]
class UserController extends Controller
{
    #[Route('', methods: 'GET')]
    public function home()
    {
        return $this->api->paginate(Csuser::class);
    }

    #[Route('', methods: 'POST')]
    public function store()
    {
        $this->api->handleJson(UserType::class, new Csuser(), true);

        return $this->api->saved();
    }

    #[Route('/{user}', methods: 'DELETE')]
    public function delete(Csuser $user)
    {
        $this->em->remove($user);
        $this->em->flush();

        return $this->api->removed();
    }
}