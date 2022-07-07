<?php

namespace App\Entity;

use App\Extension\Auditable\AuditableInterface;
use App\Extension\Auditable\AuditableTrait;
use App\Repository\CsroleRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CsroleRepository::class)]
class Csrole implements AuditableInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue('NONE')]
    #[ORM\Column(type: 'string', length: 10, name: 'role')]
    private $id;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private $description;

    #[ORM\ManyToMany(targetEntity: Csmod::class, inversedBy: 'roles')]
    #[ORM\JoinTable('csrolem')]
    #[ORM\JoinColumn('role', 'role')]
    #[ORM\InverseJoinColumn('modid', 'modid')]
    private $modules;

    #[ORM\ManyToMany(targetEntity: Csuser::class, mappedBy: 'rbRoles')]
    #[ORM\JoinColumn(name: 'role', referencedColumnName: 'role')]
    private $users;

    use AuditableTrait;

    public function __construct()
    {
        $this->modules = new ArrayCollection();
        $this->users = new ArrayCollection();
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function setId(string $id): self
    {
        $this->id = $id;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;

        return $this;
    }

    /**
     * @return Collection<int, Csmod>
     */
    public function getModules(): Collection
    {
        return $this->modules;
    }

    public function addModule(Csmod $module): self
    {
        if (!$this->modules->contains($module)) {
            $this->modules[] = $module;
        }

        return $this;
    }

    public function removeModule(Csmod $module): self
    {
        $this->modules->removeElement($module);

        return $this;
    }

    /**
     * @return Collection<int, Csuser>
     */
    public function getUsers(): Collection
    {
        return $this->users;
    }

    public function addUser(Csuser $user): self
    {
        if (!$this->users->contains($user)) {
            $this->users[] = $user;
            $user->addRbRole($this);
        }

        return $this;
    }

    public function removeUser(Csuser $user): self
    {
        if ($this->users->removeElement($user)) {
            $user->removeRbRole($this);
        }

        return $this;
    }
}
