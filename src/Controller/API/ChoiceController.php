<?php

namespace App\Controller\API;

use App\Service\Choices;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

#[Route('/api/data')]
class ChoiceController extends Controller
{
    public function __construct(
        private Choices $choices,
    ) {}

    #[Route('/roles', methods: 'GET')]
    #[IsGranted('ROLE_ADMIN')]
    public function roles()
    {
        return $this->api->source($this->choices->roles());
    }
}