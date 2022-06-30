<?php

namespace App\Entity;

use App\Entity\Concern\Auditable;
use App\Entity\Concern\AuditableInterface;
use App\Repository\TestBukuRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: TestBukuRepository::class)]
class TestBuku implements AuditableInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private $id;

    #[ORM\Column(type: 'string', length: 255)]
    #[Assert\NotBlank()]
    #[Assert\Length(min: 5)]
    private $nama;

    #[ORM\Column(type: 'integer')]
    #[Assert\NotBlank()]
    private $harga;

    use Auditable;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNama(): ?string
    {
        return $this->nama;
    }

    public function setNama(string $nama): self
    {
        $this->nama = $nama;

        return $this;
    }

    public function getHarga(): ?int
    {
        return $this->harga;
    }

    public function setHarga(int $harga): self
    {
        $this->harga = $harga;

        return $this;
    }
}
