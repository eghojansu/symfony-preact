<?php

namespace App\Controller\Api;

use App\Service\Menu;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

#[Route('/api/menu')]
#[IsGranted('ROLE_ADMIN')]
class MenuController extends Controller
{
    #[Route('', methods: 'GET')]
    public function menu(Menu $menu)
    {
        return $this->api->rest($menu->getTree(false, 'top', 'db'));
    }
}