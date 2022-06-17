<?php

namespace App\Entity;

use App\Repository\CshistRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CshistRepository::class)]
class Cshist
{
    #[ORM\Id]
    #[ORM\GeneratedValue('CUSTOM')]
    #[ORM\CustomIdGenerator('App\\Generator\\UniqidGenerator')]
    #[ORM\Column(type: 'string', length: 8, name: 'uniqid')]
    private $id;

    #[ORM\Column(type: 'string', length: 64)]
    private $name;

    #[ORM\Column(type: 'string', length: 64)]
    private $ip;

    #[ORM\Column(type: 'string', length: 255)]
    private $agent;

    #[ORM\Column(type: 'json', nullable: true)]
    private $payload = [];

    #[ORM\Column(type: 'boolean', nullable: true)]
    private $active;

    #[ORM\ManyToOne(targetEntity: Csuser::class, inversedBy: 'histories')]
    #[ORM\JoinColumn(referencedColumnName: 'userid')]
    private $user;

    public function getId(): string
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getIp(): ?string
    {
        return $this->ip;
    }

    public function setIp(string $ip): self
    {
        $this->ip = $ip;

        return $this;
    }

    public function getAgent(): ?string
    {
        return $this->agent;
    }

    public function setAgent(string $agent): self
    {
        $this->agent = $agent;

        return $this;
    }

    public function getPayload(): ?array
    {
        return $this->payload;
    }

    public function setPayload(?array $payload): self
    {
        $this->payload = $payload;

        return $this;
    }

    public function isActive(): ?bool
    {
        return $this->active;
    }

    public function setActive(?bool $active): self
    {
        $this->active = $active;

        return $this;
    }

    public function getUser(): ?Csuser
    {
        return $this->user;
    }

    public function setUser(?Csuser $user): self
    {
        $this->user = $user;

        return $this;
    }
}