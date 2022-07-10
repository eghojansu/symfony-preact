<?php

namespace App\Controller\API;

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
        return $this->api->handlePagination(Csuser::class, array(
            'id <>' => 'su',
            'id <> self id' => $this->user->getUserIdentifier(),
        ));
    }

    #[Route('', methods: 'POST')]
    public function store()
    {
        return $this->api->handleSave(UserType::class, new Csuser(), true, array(
            'validation_groups' => array('Default', 'create'),
        ));
    }

    #[Route('/{user}', methods: 'PUT')]
    public function update(Csuser $user)
    {
        return $this->api->handleSave(UserType::class, $user, false, array(
            'method' => 'PUT',
        ));
    }

    #[Route('/{user}', methods: 'DELETE', defaults: array('_destroy' => true))]
    public function delete(Csuser $user)
    {
        return $this->api->handleRemove($user, 'usrdestroy');
    }

    #[Route('/{user}/restore', methods: 'PATCH', defaults: array('_restore' => true))]
    public function restore(Csuser $user)
    {
        return $this->api->handleRestore($user);
    }

    #[Route('/{user}/access', methods: 'PATCH')]
    public function access(Csuser $user, UserPasswordHasherInterface $hasher)
    {
        return $this->api->handleSave(
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
    }
}