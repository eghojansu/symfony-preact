<?php

namespace App\Controller\API;

use App\Extension\RBAC\Menu;
use App\Extension\Utils;
use App\Repository\CshistRepository;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/account')]
class AccountController extends Controller
{
    #[Route('', methods: 'GET')]
    public function home()
    {
        return $this->api->message('Welcome, you are authenticated');
    }

    #[Route('/menu', methods: 'GET')]
    public function menu(Menu $menu)
    {
        return $this->api->data($menu->getTree(false));
    }

    #[Route('/profile', methods: 'GET')]
    public function profile()
    {
        return $this->api->data($this->account->getProfile());
    }

    #[Route('/update', methods: 'POST')]
    public function update()
    {
        $this->account->profileUpdate();

        return $this->api->saved();
    }

    #[Route('/password', methods: 'POST')]
    public function password()
    {
        $this->account->passwordUpdate();

        return $this->api->saved();
    }

    #[Route('/logout', methods: 'POST')]
    public function logout()
    {
        $this->account->record('logout');

        return $this->api->message('You have been logged out');
    }

    #[Route('/access', methods: 'GET')]
    public function access(Menu $menu)
    {
        $paths = $this->request->get('paths');
        $granted = array_reduce(
            Utils::split($paths),
            fn (array $granted, string $path) => (
                $granted + array(
                    $path => match(true) {
                        str_starts_with($path, '/') => $menu->isGranted($path),
                        default => (
                            $this->isGranted('ROLE_' . strtoupper($path)) ||
                            $this->isGranted($path)
                        ),
                    },
                )
            ),
            array(),
        );

        return $this->api->data(compact('granted'));
    }

    #[Route('/activities', methods: 'GET')]
    public function activities(CshistRepository $repo)
    {
        $items = $repo->getUserActivities($this->currentUser);

        return $this->api->data(compact('items'));
    }
}