<?php

namespace App\Controller;

use App\Project;
use Symfony\Component\Routing\Annotation\Route;

class MainController extends Controller
{
    #[Route('/', name: 'home', methods: 'GET')]
    public function home(Project $project)
    {
        return $this->render('main.html.twig', compact('project'));
    }
}