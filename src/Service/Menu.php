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
        return $roots ? $this->buildTree(
            $roots,
            $this->repo->getMenu(),
            'client',
            $activable,
        ) : array();
    }

    public function getAll(string ...$roots): array
    {
        return $roots ? $this->buildTree(
            $roots,
            $this->repo->findAll(),
        ) : array();
    }

    private function serializeForClient(
        Csmenu $menu,
        string $parent,
        array $items,
        bool $activable,
    ): array {
        return array(
            'id' => $menu->getId(),
            'url' => $menu->getPath(),
            'text' => $menu->getName(),
            'hint' => $menu->getHint(),
            'icon' => $menu->getIcon(),
            'order' => $menu->getPriority(),
            'attrs' => $menu->getAttrs(),
            'active' => $activable && $this->active($menu, $items),
        ) + compact('parent', 'items');
    }

    private function serializeForEditing(
        Csmenu $menu,
        string $parent,
        array $items,
    ): array {
        return array(
            'id' => $menu->getId(),
            'path' => $menu->getPath(),
            'name' => $menu->getName(),
            'hint' => $menu->getHint(),
            'icon' => $menu->getIcon(),
            'order' => $menu->getPriority(),
            'active' => $menu->isActive(),
            'hidden' => $menu->isHidden(),
            'roles' => $menu->getRoles(),
        ) + compact('parent', 'items');
    }

    private function buildTree(
        array $roots,
        array $rows,
        string $target = 'editing',
        bool $activable = false,
    ): array {
        return Utils::reduce(
            $roots,
            fn (array|null $menu, string $root) => array_merge($menu ?? array(), array(
                $root => $this->build($root, $rows, $target, $activable),
            )),
        );
    }

    private function build(string $parent, array $rows, string $target, bool $activable): array
    {
        $menu = Utils::reduce(
            $rows,
            function (
                array $menu,
                Csmenu $row,
                $key,
                array $rows,
            ) use ($parent, $target, $activable) {
                if (
                    $parent !== $row->getParent()?->getId()
                    || $this->skip($row)
                ) {
                    return $menu;
                }

                $items = $this->build($row->getId(), $rows, $target, $activable);

                $menu[$row->getId()] = match($target) {
                    'editing' => $this->serializeForEditing($row, $parent, $items),
                    default => $this->serializeForClient($row, $parent, $items, $activable),
                };

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