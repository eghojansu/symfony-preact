<?php

namespace App\Controller\API;

use App\Entity\Csrole;
use App\Form\MenuType;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

#[Route('/api/authorization')]
#[IsGranted('ROLE_ADMIN')]
class RoleController extends Controller
{
    #[Route('', methods: 'GET')]
    public function home()
    {
        return $this->api->handlePagination(Csrole::class);
    }

    #[Route('', methods: 'POST')]
    public function store()
    {
        throw $this->createNotFoundException();
        return $this->api->handleSave(
            MenuType::class,
            new Csmenu(),
            static function (Csmenu $menu, $em) use ($repo) {
                $menu->setPriority($repo->getNextChildPriority($menu->getParent()));
                $em->persist($menu);
            },
            array(
                'validation_groups' => array('Default', 'create'),
            ),
        );
    }

    #[Route('/{module}', methods: 'PUT')]
    public function update(Csrole $module)
    {
        throw $this->createNotFoundException();
        return $this->api->handleSave(MenuType::class, $menu, false, array(
            'method' => 'PUT',
        ));
    }

    #[Route('/{module}', methods: 'DELETE')]
    public function delete(Csrole $module)
    {
        throw $this->createNotFoundException();
        $repo->removeSorted($menu);

        return $this->api->removed();
    }
}