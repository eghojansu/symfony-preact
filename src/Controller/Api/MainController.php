<?php

namespace App\Controller\Api;

use Symfony\Component\Routing\Annotation\Route;

#[Route('/api')]
class MainController extends Controller
{
    #[Route('', methods: 'GET')]
    public function home()
    {
        return $this->message('Welcome, ' . $this->user()->getName());
    }
}