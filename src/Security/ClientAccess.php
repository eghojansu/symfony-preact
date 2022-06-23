<?php

namespace App\Security;

use Symfony\Component\Security\Core\Security;

class ClientAccess
{
    public function __construct(
        private Security $security,
    ) {}

    public function isGranted(string $path)
    {
        $rules = self::rules();

        return !isset($rules[$path]) || $this->security->isGranted($rules[$path]);
    }

    private static function rules(): array
    {
        return array(
            '/dashboard/adm/user' => 'ROLE_ADMIN',
            '/dashboard/adm/menu' => 'ROLE_ADMIN',
        );
    }
}