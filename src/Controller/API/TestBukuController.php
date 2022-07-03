<?php

namespace App\Controller\API;

use App\Entity\TestBuku;
use App\Form\TestBukuType;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/buku')]
class TestBukuController extends Controller
{
    #[Route('', methods: 'GET')]
    public function home()
    {
        return $this->api->handlePagination(TestBuku::class);
    }

    #[Route('', methods: 'POST')]
    public function store()
    {
        return $this->api->handleSave(TestBukuType::class, new TestBuku(), true);
    }

    #[Route('/{buku}', methods: 'PUT')]
    public function update(TestBuku $buku)
    {
        return $this->api->handleSave(TestBukuType::class, $buku, false, array(
            'method' => 'PUT',
        ));
    }

    #[Route('/{buku}', methods: 'DELETE')]
    public function delete(TestBuku $buku)
    {
        return $this->api->handleRemove($buku);
    }

    #[Route('/{buku}/restore', methods: 'PATCH')]
    public function restore(TestBuku $buku)
    {
        return $this->api->handleRestore($buku);
    }
}