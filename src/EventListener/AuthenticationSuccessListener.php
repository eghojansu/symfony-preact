<?php

namespace App\EventListener;

use App\Service\Account;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;

#[AutoconfigureTag('kernel.event_listener', array(
    'event' => Events::AUTHENTICATION_SUCCESS,
))]
class AuthenticationSuccessListener
{
    public function __construct(
        private Account $account
    ) {}

    public function __invoke()
    {
        $this->account->record('login');
    }
}