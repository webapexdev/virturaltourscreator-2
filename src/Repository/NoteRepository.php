<?php

namespace App\Repository;

use App\Entity\Note;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Note|null find($id, $lockMode = null, $lockVersion = null)
 * @method Note|null findOneBy(array $criteria, array $orderBy = null)
 * @method Note[]    findAll()
 * @method Note[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class NoteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Note::class);
    }

    /**
     * @return Note[]
     */
    public function findByUserAndFilters(
        User $user,
        ?string $search = null,
        ?string $status = null,
        ?string $category = null,
        int $limit = 50,
        int $offset = 0
    ): array {
        $qb = $this->createQueryBuilder('n')
            ->where('n.user = :user')
            ->setParameter('user', $user)
            ->setMaxResults($limit)
            ->setFirstResult($offset);

        if ($search) {
            // MySQL search using LIKE for title and content
            $searchPattern = '%' . $search . '%';
            $qb->andWhere(
                '(n.title LIKE :search OR n.content LIKE :search)'
            )
            ->setParameter('search', $searchPattern);
        }
        
        // Always order by updatedAt DESC
        $qb->orderBy('n.updatedAt', 'DESC');

        if ($status) {
            $qb->andWhere('n.status = :status')
                ->setParameter('status', $status);
        }

        if ($category) {
            $qb->andWhere('n.category = :category')
                ->setParameter('category', $category);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Find all notes with filters (for showing all users' notes)
     * @return Note[]
     */
    public function findAllWithFilters(
        ?string $search = null,
        ?string $status = null,
        ?string $category = null,
        int $limit = 50,
        int $offset = 0
    ): array {
        $qb = $this->createQueryBuilder('n')
            ->setMaxResults($limit)
            ->setFirstResult($offset);

        if ($search) {
            // MySQL search using LIKE for title and content
            $searchPattern = '%' . $search . '%';
            $qb->andWhere(
                '(n.title LIKE :search OR n.content LIKE :search)'
            )
            ->setParameter('search', $searchPattern);
        }
        
        // Always order by updatedAt DESC
        $qb->orderBy('n.updatedAt', 'DESC');

        if ($status) {
            $qb->andWhere('n.status = :status')
                ->setParameter('status', $status);
        }

        if ($category) {
            $qb->andWhere('n.category = :category')
                ->setParameter('category', $category);
        }

        return $qb->getQuery()->getResult();
    }


    /**
     * @return string[]
     */
    public function findDistinctCategoriesByUser(User $user): array
    {
        $result = $this->createQueryBuilder('n')
            ->select('DISTINCT n.category')
            ->where('n.user = :user')
            ->setParameter('user', $user)
            ->orderBy('n.category', 'ASC')
            ->getQuery()
            ->getResult();

        return array_column($result, 'category');
    }

    /**
     * @return string[]
     */
    public function findDistinctCategories(): array
    {
        $result = $this->createQueryBuilder('n')
            ->select('DISTINCT n.category')
            ->orderBy('n.category', 'ASC')
            ->getQuery()
            ->getResult();

        return array_column($result, 'category');
    }
}

