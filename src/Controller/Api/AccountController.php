<?php

namespace App\Controller\Api;

use App\Service\Account;
use App\Service\Menu;
use App\Utils;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/account')]
class AccountController extends Controller
{
    #[Route('', methods: 'GET')]
    public function home()
    {
        return $this->api->message('Welcome, ' . $this->user->getName());
    }

    #[Route('/menu', methods: 'GET')]
    public function menu(Menu $menu)
    {
        return $this->api->rest($menu->getTree(false, ...Utils::split(
            $this->request->query->get('roots'),
        )));
    }

    #[Route('/profile', methods: 'GET')]
    public function profile(Account $account)
    {
        return $this->api->rest($account->getProfile());
    }

    #[Route('/update', methods: 'POST')]
    public function update(Account $account)
    {
        $account->profileUpdate();

        return $this->api->saved();
    }

    #[Route('/password', methods: 'POST')]
    public function password(Account $account)
    {
        $account->passwordUpdate();

        return $this->api->saved();
    }
}