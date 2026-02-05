<?php

namespace App\Controller\Api;

use App\Entity\Note;
use App\Repository\NoteRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * @Route("/api/notes", name="api_notes_")
 */
class NoteController extends AbstractController
{
    private EntityManagerInterface $em;
    private ValidatorInterface $validator;

    public function __construct(EntityManagerInterface $em, ValidatorInterface $validator)
    {
        $this->em = $em;
        $this->validator = $validator;
    }

    /**
     * @Route("", name="list", methods={"GET"})
     */
    public function list(Request $request, NoteRepository $noteRepository): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        // Check if user is verified - database check
        if (!$user->isVerified()) {
            return new JsonResponse([
                'error' => 'Account is not verified. Please check your email and click the confirmation link to verify your account.'
            ], Response::HTTP_FORBIDDEN);
        }

        $search = $request->query->get('search');
        $status = $request->query->get('status');
        $category = $request->query->get('category');
        $limit = (int) ($request->query->get('limit', 50));
        $offset = (int) ($request->query->get('offset', 0));

        // Only pass non-empty values to the repository
        $searchParam = !empty($search) ? $search : null;
        $statusParam = !empty($status) ? $status : null;
        $categoryParam = !empty($category) ? $category : null;

        // Get all notes (not just user's notes)
        $notes = $noteRepository->findAllWithFilters($searchParam, $statusParam, $categoryParam, $limit, $offset);
        $allCategoriesFromDb = $noteRepository->findDistinctCategories();
        
        // Merge default categories with categories from database, removing duplicates
        $allCategories = array_unique(array_merge(Note::DEFAULT_CATEGORIES, $allCategoriesFromDb));
        sort($allCategories);

        return new JsonResponse([
            'notes' => array_map(function (Note $note) {
                return $this->serializeNote($note);
            }, $notes),
            'categories' => array_values($allCategories),
        ]);
    }

    /**
     * @Route("/{id}", name="show", methods={"GET"})
     */
    public function show(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        // Check if user is verified - database check
        if (!$user->isVerified()) {
            return new JsonResponse([
                'error' => 'Account is not verified. Please check your email and click the confirmation link to verify your account.'
            ], Response::HTTP_FORBIDDEN);
        }

        $note = $this->em->getRepository(Note::class)->find($id);

        if (!$note) {
            return new JsonResponse(['error' => 'Note not found'], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse(['note' => $this->serializeNote($note)]);
    }

    /**
     * @Route("", name="create", methods={"POST"})
     */
    public function create(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        // Check if user is verified - database check
        if (!$user->isVerified()) {
            return new JsonResponse([
                'error' => 'Account is not verified. Please check your email and click the confirmation link to verify your account.'
            ], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return new JsonResponse([
                'error' => 'Invalid JSON in request body'
            ], Response::HTTP_BAD_REQUEST);
        }

        $note = new Note();
        $note->setUser($user);
        $note->setTitle($data['title'] ?? '');
        $note->setContent($data['content'] ?? '');
        $note->setCategory($data['category'] ?? '');
        $note->setStatus($data['status'] ?? Note::STATUS_NEW);

        $errors = $this->validator->validate($note);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return new JsonResponse([
                'error' => 'Validation failed',
                'details' => $errorMessages
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $this->em->persist($note);
            $this->em->flush();
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Failed to create note: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return new JsonResponse(['note' => $this->serializeNote($note)], Response::HTTP_CREATED);
    }

    /**
     * @Route("/{id}", name="update", methods={"PUT"})
     */
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        // Check if user is verified - database check
        if (!$user->isVerified()) {
            return new JsonResponse([
                'error' => 'Account is not verified. Please check your email and click the confirmation link to verify your account.'
            ], Response::HTTP_FORBIDDEN);
        }

        $note = $this->em->getRepository(Note::class)->find($id);

        if (!$note) {
            return new JsonResponse(['error' => 'Note not found'], Response::HTTP_NOT_FOUND);
        }

        // Only allow the note creator to update their note
        if ($note->getUser()->getId() !== $user->getId()) {
            return new JsonResponse(['error' => 'You do not have permission to update this note'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return new JsonResponse([
                'error' => 'Invalid JSON in request body'
            ], Response::HTTP_BAD_REQUEST);
        }

        if (isset($data['title'])) {
            $note->setTitle($data['title']);
        }
        if (isset($data['content'])) {
            $note->setContent($data['content']);
        }
        if (isset($data['category'])) {
            $note->setCategory($data['category']);
        }
        if (isset($data['status'])) {
            $note->setStatus($data['status']);
        }

        $note->setUpdatedAt(new \DateTimeImmutable());

        $errors = $this->validator->validate($note);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return new JsonResponse([
                'error' => 'Validation failed',
                'details' => $errorMessages
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $this->em->flush();
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Failed to update note: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return new JsonResponse(['note' => $this->serializeNote($note)]);
    }

    /**
     * @Route("/{id}", name="delete", methods={"DELETE"})
     */
    public function delete(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        // Check if user is verified - database check
        if (!$user->isVerified()) {
            return new JsonResponse([
                'error' => 'Account is not verified. Please check your email and click the confirmation link to verify your account.'
            ], Response::HTTP_FORBIDDEN);
        }

        $note = $this->em->getRepository(Note::class)->find($id);

        if (!$note) {
            return new JsonResponse(['error' => 'Note not found'], Response::HTTP_NOT_FOUND);
        }

        // Only allow the note creator to delete their note
        if ($note->getUser()->getId() !== $user->getId()) {
            return new JsonResponse(['error' => 'You do not have permission to delete this note'], Response::HTTP_FORBIDDEN);
        }

        try {
            $this->em->remove($note);
            $this->em->flush();
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Failed to delete note: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return new JsonResponse(['message' => 'Note deleted successfully']);
    }

    private function serializeNote(Note $note): array
    {
        return [
            'id' => $note->getId(),
            'title' => $note->getTitle(),
            'content' => $note->getContent(),
            'category' => $note->getCategory(),
            'status' => $note->getStatus(),
            'createdAt' => $note->getCreatedAt()->format('Y-m-d H:i:s'),
            'updatedAt' => $note->getUpdatedAt()->format('Y-m-d H:i:s'),
            'creator' => [
                'id' => $note->getUser()->getId(),
                'email' => $note->getUser()->getEmail(),
            ],
        ];
    }
}

