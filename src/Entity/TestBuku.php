<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use App\Repository\TestBukuRepository;
use App\Extension\Auditable\AuditableInterface;
use App\Extension\Auditable\AuditableTrait;
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

    use AuditableTrait;

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
