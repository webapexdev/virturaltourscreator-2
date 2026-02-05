<?php

namespace App\Entity;

use App\Repository\NoteRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\PreUpdate;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass=NoteRepository::class)
 * @ORM\Table(name="notes")
 * @ORM\HasLifecycleCallbacks
 */
class Note
{
    public const STATUS_NEW = 'new';
    public const STATUS_TODO = 'todo';
    public const STATUS_DONE = 'done';

    public const STATUSES = [
        self::STATUS_NEW,
        self::STATUS_TODO,
        self::STATUS_DONE,
    ];

    public const CATEGORY_WORK = 'Work';
    public const CATEGORY_PERSONAL = 'Personal';
    public const CATEGORY_IMPORTANT = 'Important';

    public const DEFAULT_CATEGORIES = [
        self::CATEGORY_WORK,
        self::CATEGORY_PERSONAL,
        self::CATEGORY_IMPORTANT,
    ];

    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private ?int $id = null;

    /**
     * @ORM\Column(type="string", length=255)
     * @Assert\NotBlank
     * @Assert\Length(max=255)
     */
    private ?string $title = null;

    /**
     * @ORM\Column(type="text")
     * @Assert\NotBlank
     */
    private ?string $content = null;

    /**
     * @ORM\Column(type="string", length=100)
     * @Assert\NotBlank
     * @Assert\Length(max=100)
     */
    private ?string $category = null;

    /**
     * @ORM\Column(type="string", length=20)
     * @Assert\NotBlank
     * @Assert\Choice(choices=Note::STATUSES)
     */
    private ?string $status = self::STATUS_NEW;

    /**
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="notes")
     * @ORM\JoinColumn(nullable=false)
     */
    private ?User $user = null;

    /**
     * @ORM\Column(type="datetime_immutable")
     */
    private ?\DateTimeImmutable $createdAt = null;

    /**
     * @ORM\Column(type="datetime_immutable")
     */
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->status = self::STATUS_NEW;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;
        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): self
    {
        $this->content = $content;
        return $this;
    }

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(string $category): self
    {
        $this->category = $category;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;
        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): self
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    /**
     * @ORM\PreUpdate
     */
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }
}

