<?php

namespace App\Controller\API;

use App\Entity\Csmenu;
use App\Form\MenuType;
use App\Extension\RBAC\Menu;
use App\Repository\CsmenuRepository;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

#[Route('/api/menu')]
#[IsGranted('ROLE_ROOT')]
class MenuController extends Controller
{
    #[Route('', methods: 'GET')]
    public function menu(Menu $menu)
    {
        return $this->api->data($menu->getEditingTree());
    }

    #[Route('', methods: 'POST')]
    public function store(CsmenuRepository $repo)
    {
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

    #[Route('/{menu}', methods: 'PUT')]
    public function update(Csmenu $menu)
    {
        return $this->api->handleSave(MenuType::class, $menu, false, array(
            'method' => 'PUT',
        ));
    }

    #[Route('/{menu}', methods: 'DELETE')]
    public function delete(Csmenu $menu, CsmenuRepository $repo)
    {
        $repo->removeSorted($menu);

        return $this->api->removed();
    }

    #[Route('/{menu}/sort', methods: 'PATCH')]
    public function sort(Csmenu $menu, CsmenuRepository $repo)
    {
        $repo->reSort($menu, $this->request->query->get('dir'));

        return $this->api->saved();
    }
}