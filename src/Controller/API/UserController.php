<?php

namespace App\Controller\API;

use App\Entity\Csuser;
use App\Form\UserAccessType;
use App\Form\UserType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/user')]
class UserController extends Controller
{
    #[Route('', methods: 'GET')]
    #[IsGranted('usrview')]
    public function home()
    {
        return $this->api->handlePagination(Csuser::class, array(
            'id <>' => 'su',
            'id <> self id' => $this->user->getUserIdentifier(),
        ));
    }

    #[Route('', methods: 'POST')]
    #[IsGranted('usrcreate')]
    public function store()
    {
        return $this->api->handleSave(UserType::class, new Csuser(), true, array(
            'validation_groups' => array('Default', 'create'),
        ));
    }

    #[Route('/{user}', methods: 'PUT')]
    #[IsGranted('usrupdate')]
    public function update(Csuser $user)
    {
        return $this->api->handleSave(UserType::class, $user, false, array(
            'method' => 'PUT',
        ));
    }

    #[Route('/{user}', methods: 'DELETE', defaults: array('_destroy' => true))]
    #[IsGranted('usrdelete')]
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
    #[IsGranted('usraccess')]
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