<?php

namespace App\Controller\API;

use App\Entity\TestBuku;
use App\Form\TestBukuType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/buku')]
#[IsGranted('bkview')]
class TestBukuController extends Controller
{
    #[Route('', methods: 'GET')]
    public function home()
    {
        return $this->api->handlePagination(TestBuku::class);
    }

    #[Route('', methods: 'POST')]
    #[IsGranted('bkcreate')]
    public function store()
    {
        return $this->api->handleSave(TestBukuType::class, new TestBuku(), true);
    }

    #[Route('/{buku}', methods: 'PUT')]
    #[IsGranted('bkupdate')]
    public function update(TestBuku $buku)
    {
        return $this->api->handleSave(TestBukuType::class, $buku, false, array(
            'method' => 'PUT',
        ));
    }

    #[Route('/{buku}', methods: 'DELETE')]
    #[IsGranted('bkdelete')]
    public function delete(TestBuku $buku)
    {
        return $this->api->handleRemove($buku, 'bkdestroy');
    }

    #[Route('/{buku}/restore', methods: 'PATCH')]
    #[IsGranted('bkrestore')]
    public function restore(TestBuku $buku)
    {
        return $this->api->handleRestore($buku);
    }
}