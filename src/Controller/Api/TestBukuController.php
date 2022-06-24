<?php

namespace App\Controller\Api;

use App\Entity\TestBuku;
use App\Form\TestBukuType;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/buku')]
class TestBukuController extends Controller
{
    #[Route('', methods: 'GET')]
    public function home()
    {
        return $this->api->paginate(TestBuku::class);
    }

    #[Route('', methods: 'POST')]
    public function store()
    {
        $this->api->handleJson(TestBukuType::class, new TestBuku(), true);

        return $this->api->saved();
    }

    #[Route('/{buku}', methods: 'PUT')]
    public function update(TestBuku $buku)
    {
        $this->api->handleJson(TestBukuType::class, $buku, false, array(
            'method' => 'PUT',
        ));

        return $this->api->saved();
    }

    #[Route('/{buku}', methods: 'DELETE')]
    public function delete(TestBuku $buku)
    {
        $this->removeEntity($buku);

        return $this->api->removed();
    }
}