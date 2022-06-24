<?php

namespace App\Service;

use App\Entity\Csmenu;
use App\Repository\CsmenuRepository;
use App\Utils;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Security;

class Menu
{
    public function __construct(
        private CsmenuRepository $repo,
        private Security $security,
        private RequestStack $requestStack,
    ) {}

    public function isGranted(string $path): bool
    {
        $menu = $this->repo->findMenu($path);

        return !$menu || !$this->skip($menu);
    }

    public function getTree(bool $activable, string ...$roots): array
    {
        $rows = $roots ? $this->repo->getMenu() : array();

        return Utils::reduce(
            $roots,
            fn (array|null $menu, string $root) => array_merge($menu ?? array(), array(
                $root => $this->build($root, $rows, $activable),
            )),
        );
    }

    private function build(string $parent, array $rows, bool $activable): array
    {
        $menu = Utils::reduce(
            $rows,
            function (
                array $menu,
                Csmenu $row,
                $key,
                array $rows,
            ) use ($parent, $activable) {
                if (
                    $parent !== $row->getParent()?->getId()
                    || $this->skip($row)
                ) {
                    return $menu;
                }

                $items = $this->build($row->getId(), $rows, $activable);
                $active = $activable && $this->active($row, $items);

                $menu[$row->getId()] = array(
                    'id' => $row->getId(),
                    'url' => $row->getPath(),
                    'text' => $row->getName(),
                    'hint' => $row->getHint(),
                    'icon' => $row->getIcon(),
                    'order' => $row->getPriority(),
                    'attrs' => $row->getAttrs(),
                ) + compact('active', 'parent', 'items');

                return $menu;
            },
            array(),
        );

        uasort(
            $menu,
            static fn (array $a, array $b) => $a['order'] <=> $b['order'],
        );

        return $menu;
    }

    private function skip(Csmenu $menu): bool
    {
        return (
            $menu->getRoles()
            && Utils::all(
                $menu->getRoles(),
                fn (string $role) => !$this->security->isGranted($role),
            )
        );
    }

    private function isMatch(Csmenu $menu, string $path = null): bool
    {
        return (
            $menu->getPath()
            && preg_match(
                $menu->getMatcher() ?? '/^' . preg_quote($menu->getPath(), '/') . '/',
                $path ?? $this->requestStack->getCurrentRequest()->getPathInfo(),
            )
        );
    }

    private function active(Csmenu $menu, array $children): bool
    {
        return (
            $this->isMatch($menu) || Utils::some(
                $children,
                static fn (array $child) => $child['active'],
            )
        );
    }
}