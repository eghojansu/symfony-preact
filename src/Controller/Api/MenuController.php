<?php

namespace App\Controller\Api;

use App\Utils;
use App\Service\Menu;
use App\Entity\Csmenu;
use App\Form\MenuType;
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
        return $this->api->rest($menu->getAll(...Utils::split(
            $this->request->query->get('roots'),
        )));
    }

    #[Route('', methods: 'POST')]
    public function store(CsmenuRepository $repo)
    {
        $this->api->handleJson(
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

        return $this->api->saved();
    }

    #[Route('/{menu}', methods: 'PUT')]
    public function update(Csmenu $menu)
    {
        $this->api->handleJson(MenuType::class, $menu, false, array(
            'method' => 'PUT',
        ));

        return $this->api->saved();
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