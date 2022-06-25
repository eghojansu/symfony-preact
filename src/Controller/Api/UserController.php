<?php

namespace App\Controller\Api;

use App\Entity\Csuser;
use App\Form\UserAccessType;
use App\Form\UserType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/user')]
#[IsGranted('ROLE_ADMIN')]
class UserController extends Controller
{
    #[Route('', methods: 'GET')]
    public function home()
    {
        return $this->api->paginate(Csuser::class, array(
            'id <>' => 'su',
            'id <> self id' => $this->user->getId(),
        ));
    }

    #[Route('', methods: 'POST')]
    public function store()
    {
        $this->api->handleJson(UserType::class, new Csuser(), true, array(
            'validation_groups' => array('Default', 'create'),
        ));

        return $this->api->saved();
    }

    #[Route('/{user}', methods: 'PUT')]
    public function update(Csuser $user)
    {
        $this->api->handleJson(UserType::class, $user, false, array(
            'method' => 'PUT',
        ));

        return $this->api->saved();
    }

    #[Route('/{user}', methods: 'DELETE')]
    public function delete(Csuser $user)
    {
        $this->removeEntity($user);

        return $this->api->removed();
    }

    #[Route('/{user}/access', methods: 'PATCH')]
    public function access(Csuser $user, UserPasswordHasherInterface $hasher)
    {
        $this->api->handleJson(
            UserAccessType::class,
            $user,
            static function (Csuser $user) use ($hasher) {
                if ($user->getNewPassword()) {
                    $user->setPassword(
                        $hasher->hashPassword($user, $user->getNewPassword()),
                    );
                }
            },
            array('method' => 'PATCH'),
        );

        return $this->api->saved();
    }
}