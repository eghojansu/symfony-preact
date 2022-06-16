<?php

namespace App\Service;

use App\Entity\Csmenu;
use App\Repository\CsmenuRepository;
use App\Utils;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Security;

class Menu
{
    public function __construct(
        private EntityManagerInterface $em,
        private Security $security,
        private RequestStack $requestStack,
    ) {}

    public function getTree(bool $activable, string ...$roots): array
    {
        $rows = $roots ? $this->repo()->findAll() : array();

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

    private function skip(Csmenu $row): bool
    {
        return (
            $row->getRoles()
            && Utils::all(
                $row->getRoles(),
                fn (string $role) => !$this->security->isGranted($role),
            )
        );
    }

    private function active(Csmenu $row, array $children): bool
    {
        $path = $this->requestStack->getCurrentRequest()->getPathInfo();

        return (
            (
                $row->getPath()
                && preg_match(
                    $row->getMatcher() ?? '/^' . preg_quote($row->getPath(), '/') . '/',
                    $path
                )
            )
            || Utils::some(
                $children,
                static fn (array $child) => $child['active'],
            )
        );
    }

    private function repo(): CsmenuRepository
    {
        /** @var CsmenuRepository */
        $repo = $this->em->getRepository(Csmenu::class);

        return $repo;
    }
}