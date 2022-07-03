<?php

namespace App\Extension\RBAC;

use App\Entity\Csmenu;
use App\Extension\Utils;
use App\Repository\CsmenuRepository;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\HttpFoundation\RequestStack;

class Menu
{
    public function __construct(
        private CsmenuRepository $repo,
        private Security $security,
        private RequestStack $requestStack,
    ) {}

    public static function create(
        int $priority,
        string $id,
        string $name,
        string $path = null,
        string $icon = null,
        string|array $roles = null,
        Csmenu $parent = null,
        string $matcher = null,
        string $hint = null,
        bool $active = true,
        array $attrs = null,
    ): Csmenu {
        $menu = new Csmenu();
        $menu->setPriority($priority);
        $menu->setId($id);
        $menu->setName($name);
        $menu->setPath($path);
        $menu->setIcon($icon);
        $menu->setHint($hint);
        $menu->setRoles(Utils::split($roles));
        $menu->setActive($active);
        $menu->setMatcher($matcher);
        $menu->setParent($parent);
        $menu->setAttrs($attrs);

        return $menu;
    }

    public static function createFromArray(array $menu): Csmenu
    {
        return static::create(
            $menu['priority'],
            $menu['id'],
            $menu['name'],
            $menu['path'] ?? null,
            $menu['icon'] ?? null,
            $menu['roles'] ?? null,
            $menu['parent'] ?? null,
            $menu['matcher'] ?? null,
            $menu['hint'] ?? null,
            $menu['active'] ?? true,
            $menu['attrs'] ?? null,
        );
    }

    public static function createModule(
        string $id = null,
        string $name = null,
        string $path = null,
        string|array $roles = null,
        Csmenu $parent = null,
        string $matcher = null,
    ): Csmenu {
        $menu = new Csmenu();
        $menu->setId($id ?? Utils::random());
        $menu->setName($name ?? Utils::truncate($path, 75));
        $menu->setPath($path);
        $menu->setRoles(Utils::split($roles));
        $menu->setActive(true);
        $menu->setHidden(true);
        $menu->setMatcher($matcher);
        $menu->setParent($parent);

        return $menu;
    }

    public static function createModuleFromArray(array $module): Csmenu
    {
        return static::createModule(
            $module['id'] ?? null,
            $module['name'] ?? null,
            $module['path'] ?? null,
            $module['roles'] ?? null,
            $module['parent'] ?? null,
            $module['matcher'] ?? null,
        );
    }

    public function isGranted(string $path): bool
    {
        $menu = $this->repo->findMenu($path);

        return !$menu || !$this->skip($menu);
    }

    public function getTree(bool $activable): array
    {
        return $this->buildTree(
            array(Csmenu::ROOT_DASHBOARD, Csmenu::ROOT_TOP),
            $this->repo->getMenu(),
            'client',
            $activable,
        );
    }

    public function getEditingTree(): array
    {
        return $this->buildTree(
            array(Csmenu::ROOT_DASHBOARD, Csmenu::ROOT_TOP),
            $this->repo->findAll(),
        );
    }

    public function toEntities(array $tree, Csmenu $parent = null): array
    {
        $priority = 1;

        return Utils::reduce(
            $tree,
            function (array $entities, array $item, string|int $id) use ($parent, &$priority) {
                $menu = static::createFromArray(array_replace(array(
                    'id' => is_int($id) ? Utils::random(8) : $id,
                    'priority' => $priority++,
                ), $item, array(
                    'parent' => $parent,
                )));

                $entities[$menu->getId()] = $menu;

                return $entities + $this->toEntities(
                    $item['items'] ?? array(),
                    $menu,
                );
            },
            array(),
        );
    }

    public function toModuleEntities(array $tree, Csmenu $parent = null): array
    {
        $withParent = $parent ?? $this->repo->find(Csmenu::ROOT_MODULE) ?? static::createModule(
            Csmenu::ROOT_MODULE,
        );

        return Utils::reduce(
            $tree,
            function (array $entities, array $item, string|int $id) use ($withParent, &$priority) {
                $menu = static::createFromArray(array_replace(array(
                    'id' => is_int($id) ? Utils::random(8) : $id,
                ), $item, array(
                    'parent' => $withParent,
                )));

                $entities[$menu->getId()] = $menu;

                return $entities + $this->toEntities(
                    $item['items'] ?? array(),
                    $menu,
                );
            },
            array(),
        );
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
        return false;
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