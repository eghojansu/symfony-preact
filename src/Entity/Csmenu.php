<?php

namespace App\Entity;

use App\Utils;
use Doctrine\ORM\Mapping as ORM;
use App\Repository\CsmenuRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

#[ORM\Entity(repositoryClass: CsmenuRepository::class)]
#[UniqueEntity('id', groups: array('create'))]
class Csmenu
{
    #[ORM\Id]
    #[ORM\GeneratedValue('NONE')]
    #[ORM\Column(type: 'string', length: 10, name: 'menuid')]
    #[Assert\NotBlank(groups: array('create'))]
    #[Assert\Length(max: 10, groups: array('create'))]
    private $id;

    #[ORM\Column(type: 'string', length: 64)]
    #[Assert\NotBlank()]
    #[Assert\Length(max: 64)]
    private $name;

    #[ORM\Column(type: 'string', length: 128, nullable: true)]
    #[Assert\Length(max: 128)]
    private $hint;

    #[ORM\Column(type: 'boolean', nullable: true)]
    private $active;

    #[ORM\Column(type: 'boolean', nullable: true)]
    private $hidden;

    #[ORM\Column(type: 'string', length: 64, nullable: true)]
    #[Assert\Length(max: 64)]
    private $icon;

    #[ORM\Column(type: 'string', length: 128, nullable: true)]
    #[Assert\Length(max: 128)]
    private $path;

    #[ORM\Column(type: 'string', length: 128, nullable: true)]
    #[Assert\Length(max: 128)]
    private $matcher;

    #[ORM\ManyToOne(targetEntity: self::class, inversedBy: 'children')]
    #[ORM\JoinColumn(name: 'parent_id', referencedColumnName: 'menuid')]
    private $parent;

    #[ORM\OneToMany(targetEntity: self::class, mappedBy: 'parent', cascade: array('remove'))]
    #[ORM\OrderBy(array('priority' => 'ASC'))]
    private $children;

    #[ORM\Column(type: 'simple_array', nullable: true)]
    #[Assert\Choice(callback: array(Csuser::class, 'getRoleOptions'), multiple: true, groups: array('access'))]
    private $roles = [];

    #[ORM\Column(type: 'smallint', nullable: true)]
    private $priority;

    #[ORM\Column(type: 'json', nullable: true)]
    private $attrs = [];

    public function __construct()
    {
        $this->children = new ArrayCollection();
    }

    public static function create(
        int $priority,
        string $id,
        string $name,
        string $path = null,
        string $icon = null,
        string|array $roles = null,
        self $parent = null,
        string $matcher = null,
        string $hint = null,
        bool $active = true,
    ): static {
        $menu = new static();
        $menu->setPriority($priority);
        $menu->setId($id);
        $menu->setName($name);
        $menu->setPath($path);
        $menu->setIcon($icon);
        $menu->setHint($hint);
        $menu->setRoles(Utils::split($roles));
        $menu->setActive($active);
        $menu->setMatcher($matcher);
        $menu->setParent($parent);

        return $menu;
    }

    public static function createRule(
        string $path,
        string|array $roles,
        self $parent = null,
        string $name = null,
        string $id = null,
        string $matcher = null,
    ): static {
        $menu = new static();
        $menu->setId($id ?? Utils::random());
        $menu->setName($name ?? Utils::truncate($path, 75));
        $menu->setPath($path);
        $menu->setRoles(Utils::split($roles));
        $menu->setActive(true);
        $menu->setHidden(true);
        $menu->setMatcher($matcher);
        $menu->setParent($parent);

        return $menu;
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

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getHint(): ?string
    {
        return $this->hint;
    }

    public function setHint(?string $hint): self
    {
        $this->hint = $hint;

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

    public function isHidden(): ?bool
    {
        return $this->hidden;
    }

    public function setHidden(?bool $hidden): self
    {
        $this->hidden = $hidden;

        return $this;
    }

    public function getIcon(): ?string
    {
        return $this->icon;
    }

    public function setIcon(?string $icon): self
    {
        $this->icon = $icon;

        return $this;
    }

    public function getPath(): ?string
    {
        return $this->path;
    }

    public function setPath(?string $path): self
    {
        $this->path = $path;

        return $this;
    }

    public function getMatcher(): ?string
    {
        return $this->matcher;
    }

    public function setMatcher(?string $matcher): self
    {
        $this->matcher = $matcher;

        return $this;
    }

    public function getParent(): self|null
    {
        return $this->parent;
    }

    public function setParent(self|null $parent): self
    {
        $this->parent = $parent;

        return $this;
    }

    public function getRoles(): ?array
    {
        return $this->roles;
    }

    public function setRoles(?array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    public function getPriority(): ?int
    {
        return $this->priority;
    }

    public function setPriority(int|null $priority): self
    {
        $this->priority = $priority;

        return $this;
    }

    public function getAttrs(): ?array
    {
        return $this->attrs;
    }

    public function setAttrs(?array $attrs): self
    {
        $this->attrs = $attrs;

        return $this;
    }

    /**
     * @return Collection<int, self>
     */
    public function getChildren(): Collection
    {
        return $this->children;
    }

    public function addChild(self $child): self
    {
        if (!$this->children->contains($child)) {
            $this->children[] = $child;
            $child->setParent($this);
        }

        return $this;
    }

    public function removeChild(self $child): self
    {
        if ($this->children->removeElement($child)) {
            // set the owning side to null (unless already changed)
            if ($child->getParent() === $this) {
                $child->setParent(null);
            }
        }

        return $this;
    }
}
