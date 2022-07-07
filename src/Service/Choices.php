<?php

namespace App\Service;

use App\Entity\Csrole;
use App\Entity\Csuser;
use App\Extension\Utils;
use App\Repository\CsroleRepository;
use Symfony\Component\Security\Core\Security;

class Choices
{
    public function __construct(
        private Security $security,
        private CsroleRepository $roles,
    ) {}

    public function support(string $name): bool
    {
        return method_exists($this, $name);
    }

    public function getChoices(string $name): array
    {
        return match($name) {
            'roles' => $this->roles(),
            default => array(),
        };
    }

    public function roles()
    {
        $roles = Utils::reduce(
            $this->roles->findAll(),
            static fn (array $roles, Csrole $role) => $roles + array(
                $role->getId() => $role->getDescription(),
            ),
            array(),
        );

        if ($this->security->isGranted('ROLE_ADMIN')) {
            $roles['Administrator'] = 'ROLE_ADMIN';
        }

        if ($this->security->isGranted('ROLE_ROOT')) {
            $roles['Root'] = 'ROLE_ROOT';
        }

        return $roles;
    }
}