<?php

namespace App\Entity\Concern;

use App\Validator as CustomAssert;
use Symfony\Component\Serializer\Annotation\Ignore;
use Symfony\Component\Validator\Constraints as Assert;

trait CurrentUser
{
    #[Assert\NotBlank(groups: array('current_user'))]
    #[CustomAssert\UserPassword(groups: array('current_user'))]
    #[Ignore]
    private $currentPassword;

    public function getCurrentPassword(): string|null
    {
        return $this->currentPassword;
    }

    public function setCurrentPassword(string|null $currentPassword): static
    {
        $this->currentPassword = $currentPassword;

        return $this;
    }
}