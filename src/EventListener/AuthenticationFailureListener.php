<?php

namespace App\EventListener;

use App\Service\Account;
use App\Repository\CsuserRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationFailureEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;

#[AutoconfigureTag('kernel.event_listener', array(
    'event' => Events::AUTHENTICATION_FAILURE,
))]
class AuthenticationFailureListener
{
    public function __construct(
        private Account $account,
        private CsuserRepository $repo
    ) {}

    public function __invoke(AuthenticationFailureEvent $event)
    {
        $user = null;
        $payload = $event->getRequest()->getContent();

        if ($payload) {
            $data = json_decode($payload, true);

            $user = isset($data['username']) ? $this->repo->find($data['username']) : null;
        }

        $this->account->record('login attempt', null, null, $user);
    }
}