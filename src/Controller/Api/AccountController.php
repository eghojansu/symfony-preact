<?php

namespace App\Controller\Api;

use App\Service\Menu;
use App\Utils;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/account')]
class AccountController extends Controller
{
    #[Route('', methods: 'GET')]
    public function home()
    {
        return $this->message('Welcome, ' . $this->user()->getName());
    }

    #[Route('/menu', methods: 'GET')]
    public function menu(Menu $menu)
    {
        return $this->api($menu->getTree(false, ...Utils::split(
            $this->request()->query->get('roots'),
        )));
    }
}