<?php

namespace App\Controller;

use App\Project;
use Symfony\Component\Routing\Annotation\Route;

class MainController extends Controller
{
    #[Route('/', name: 'home', methods: 'GET')]
    public function home(Project $project)
    {
        $user = $this->getUser();
        $appInfo = array(
            'name' => $project->getName(),
            'alias' => $project->getAlias(),
            'desc' => $project->getDescription(),
            'owner' => $project->getOwner(),
            'year' => $project->getYear(),
            'user' => $user ? array('id' => 'user') : null,
        );

        return $this->render('main.html.twig', compact('appInfo'));
    }
}