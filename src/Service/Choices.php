<?php

namespace App\Service;

use App\Entity\Csuser;
use Symfony\Component\Security\Core\Security;

class Choices
{
    public function __construct(
        private Security $security,
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
        $roles = array(
            Csuser::ROLE_ADMIN => 'ROLE_ADMIN',
        );

        if ($this->security->isGranted('ROLE_ROOT')) {
            $roles[Csuser::ROLE_ROOT] = 'ROLE_ROOT';
        }

        return $roles;
    }
}