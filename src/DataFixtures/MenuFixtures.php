<?php

namespace App\DataFixtures;

use App\Utils;
use App\Entity\Csmenu;
use Doctrine\Persistence\ObjectManager;
use Doctrine\Bundle\FixturesBundle\Fixture;

class MenuFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        Utils::walk(
            self::buildMenu(),
            static fn (Csmenu $menu) => $manager->persist($menu),
        );

        $manager->flush();
    }

    private static function buildMenu(): array
    {
        $menu = array();
        $menu['db'] = Csmenu::create(0, 'db', 'Dashboard Menu');
        $menu['db.home'] = Csmenu::create(1, 'db.home', 'Dashboard', '/dashboard', 'house', null, $menu['db']);
        $menu['adm'] = Csmenu::create(2, 'adm', 'Administration', null, 'gear', 'ROLE_ADMIN', $menu['db']);
        $menu[] = Csmenu::create(1, 'adm.user', 'Users', '/dashboard/adm/user', 'people', null, $menu['adm']);
        $menu[] = Csmenu::create(2, 'adm.menu', 'Menu', '/dashboard/adm/menu', 'menu-up', null, $menu['adm']);

        $menu['top'] = Csmenu::create(0, 'top', 'Top Menu');
        $menu['ac'] = Csmenu::create(1, 'ac', 'Account', null, 'person', null, $menu['top']);
        $menu[] = Csmenu::create(1, 'ac.acc', 'Profile', '/dashboard/account', 'person-circle', null, $menu['ac']);
        $menu[] = Csmenu::create(2, 'ac.key', 'Password', '/dashboard/account/password', 'key', null, $menu['ac']);
        $menu[] = Csmenu::create(3, 'ac.out', 'Logout', null, 'power', null, $menu['ac'])->setAttrs(array('class' => 'text-danger', 'data-action' => 'logout'));

        return $menu;
    }
}
