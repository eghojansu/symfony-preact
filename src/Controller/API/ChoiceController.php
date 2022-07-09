<?php

namespace App\Controller\API;

use App\Service\Choices;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

#[Route('/api/data')]
class ChoiceController extends Controller
{
    #[Route('/{choice}', methods: 'GET')]
    #[IsGranted('ROLE_EDITOR')]
    public function choice(Choices $choices, string $choice)
    {
        if (!$choices->support($choice)) {
            throw $this->createNotFoundException();
        }

        return $this->api->source($choices->getChoices($choice));
    }
}