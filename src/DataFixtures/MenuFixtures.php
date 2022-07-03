<?php

namespace App\DataFixtures;

use App\Entity\Csmenu;
use App\Extension\Utils;
use App\Extension\RBAC\Menu;
use Doctrine\Persistence\ObjectManager;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Symfony\Component\Yaml\Yaml;

class MenuFixtures extends Fixture
{
    public function __construct(
        private Menu $menu,
    ) {}

    public function load(ObjectManager $manager): void
    {
        Utils::walk(
            $this->menu->toEntities(
                self::getMenu('db') + self::getMenu('top'),
            ),
            static fn (Csmenu $menu) => $manager->persist($menu),
        );

        $manager->flush();
    }

    private static function getMenu(string $name): array
    {
        return Yaml::parseFile(__DIR__ . '/data/menu_' . $name . '.yml');
    }
}
