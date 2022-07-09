<?php

namespace App\Controller\API;

use App\Entity\TestBuku;
use App\Form\TestBukuType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/buku')]
class TestBukuController extends Controller
{
    #[Route('', methods: 'GET')]
    #[IsGranted('bkview')]
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

    #[Route('/{buku}', methods: 'DELETE', defaults: array('_destroy' => true))]
    #[IsGranted('bkdelete')]
    public function delete(TestBuku $buku)
    {
        return $this->api->handleRemove($buku);
    }

    #[Route('/{buku}/restore', methods: 'PATCH', defaults: array('_restore' => true))]
    public function restore(TestBuku $buku)
    {
        return $this->api->handleRestore($buku);
    }
}