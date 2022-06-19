<?php

namespace App\Entity;

use App\Entity\Concern\CurrentUser;
use App\Utils;
use Doctrine\ORM\Mapping as ORM;
use App\Repository\CsuserRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Serializer\Annotation\Ignore;

#[ORM\Entity(repositoryClass: CsuserRepository::class)]
class Csuser implements UserInterface, PasswordAuthenticatedUserInterface
{
    const ROLES = array(
        'Admin' => 'ROLE_ADMIN',
        'Root' => 'ROLE_ROOT',
    );

    #[ORM\Id]
    #[ORM\GeneratedValue('NONE')]
    #[ORM\Column(type: 'string', length: 8, name: 'userid')]
    #[Assert\NotBlank()]
    #[Assert\Length(min: 5, max: 8)]
    private $id;

    #[ORM\Column(type: 'string', length: 32)]
    #[Assert\NotBlank(groups: array('Default', 'profile'))]
    #[Assert\Length(max: 32, groups: array('Default', 'profile'))]
    private $name;

    #[ORM\Column(type: 'string', length: 128, nullable: true)]
    #[Assert\Length(max: 128, groups: array('Default', 'profile'))]
    #[Assert\Email( groups: array('Default', 'profile'))]
    private $email;

    #[ORM\Column(type: 'string', length: 128, nullable: true)]
    #[Ignore]
    private $password;

    #[ORM\Column(type: 'boolean', nullable: true)]
    private $active;

    #[ORM\Column(type: 'simple_array', nullable: true)]
    #[Assert\Choice(choices: self::ROLES, groups: array('security'))]
    private $roles = [];

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Cshist::class)]
    #[Ignore]
    private $histories;

    #[Assert\NotBlank(groups: array('password', 'security'))]
    #[Assert\Length(min: 5, groups: array('password', 'security'))]
    #[Ignore]
    private $newPassword;

    use CurrentUser;

    public function __construct()
    {
        $this->histories = new ArrayCollection();
    }

    public static function create(
        string $id,
        string $name = null,
        string $email = null,
        string|array $roles = null,
        bool $active = null,
    ): static {
        $user = new static();
        $user->setId($id);
        $user->setName($name ?? $id);
        $user->setEmail($email);
        $user->setRoles(Utils::split($roles));
        $user->setActive($active);

        return $user;
    }

    #[Ignore]
    public function getUserIdentifier(): string
    {
        return $this->getId();
    }

    public function eraseCredentials()
    {
        // remove what?
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function setId(string $id): static
    {
        $this->id = $id;

        return $this;
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

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(?string $password): self
    {
        $this->password = $password;

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

    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';

        return $roles;
    }

    public function setRoles(?array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @return Collection<int, Cshist>
     */
    public function getHistories(): Collection
    {
        return $this->histories;
    }

    public function addHistory(Cshist $hist): self
    {
        if (!$this->histories->contains($hist)) {
            $this->histories[] = $hist;
            $hist->setUser($this);
        }

        return $this;
    }

    public function removeHistory(Cshist $hist): self
    {
        if ($this->histories->removeElement($hist)) {
            // set the owning side to null (unless already changed)
            if ($hist->getUser() === $this) {
                $hist->setUser(null);
            }
        }

        return $this;
    }

    public function getNewPassword(): string|null
    {
        return $this->newPassword;
    }

    public function setNewPassword(string|null $newPassword): static
    {
        $this->newPassword = $newPassword;

        return $this;
    }
}
