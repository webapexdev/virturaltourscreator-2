<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\EmailService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * @Route("/api/auth", name="api_auth_")
 */
class AuthController extends AbstractController
{
    private EntityManagerInterface $em;
    private UserPasswordHasherInterface $passwordHasher;
    private EmailService $emailService;
    private ValidatorInterface $validator;

    public function __construct(
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher,
        EmailService $emailService,
        ValidatorInterface $validator
    ) {
        $this->em = $em;
        $this->passwordHasher = $passwordHasher;
        $this->emailService = $emailService;
        $this->validator = $validator;
    }

    /**
     * @Route("/register", name="register", methods={"POST"})
     */
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email']) || !isset($data['password'])) {
            return new JsonResponse([
                'error' => 'Email and password are required'
            ], Response::HTTP_BAD_REQUEST);
        }

        $email = trim($data['email']);
        $password = $data['password'];

        // Check if user already exists
        $existingUser = $this->em->getRepository(User::class)->findOneByEmail($email);
        if ($existingUser) {
            return new JsonResponse([
                'error' => 'User with this email already exists'
            ], Response::HTTP_CONFLICT);
        }

        // Create new user
        $user = new User();
        $user->setEmail($email);
        $user->setPassword($this->passwordHasher->hashPassword($user, $password));

        // Generate confirmation token
        $confirmationToken = bin2hex(random_bytes(32));
        $user->setConfirmationToken($confirmationToken);
        $user->setConfirmationTokenExpiresAt(new \DateTimeImmutable('+24 hours'));

        // Validate
        $errors = $this->validator->validate($user);
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
            $this->em->persist($user);
            $this->em->flush();
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Failed to create user: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        // Prepare response first
        $response = new JsonResponse([
            'message' => 'Registration successful. Please check your email to confirm your account.',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
            ]
        ], Response::HTTP_CREATED);

        // Return response immediately (don't wait for email)
        // This ensures the user gets a response even if email sending fails
        
        // Send confirmation email in background (don't block response)
        // Use a try-catch to ensure it never blocks the response
        try {
            $this->emailService->sendConfirmationEmail($user->getEmail(), $confirmationToken);
        } catch (\Exception $e) {
            // Log error but don't fail registration
            // Email sending failure shouldn't prevent successful registration
            error_log('Failed to send confirmation email: ' . $e->getMessage());
        }

        // Ensure response is returned
        return $response;
    }

    /**
     * @Route("/confirm/{token}", name="confirm", methods={"GET"})
     * @Route("/api/auth/confirm/{token}", name="confirm_api", methods={"GET"})
     */
    public function confirm(string $token, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->findOneByConfirmationToken($token);

        if (!$user) {
            return new JsonResponse([
                'error' => 'Invalid confirmation token'
            ], Response::HTTP_BAD_REQUEST);
        }

        if ($user->getConfirmationTokenExpiresAt() < new \DateTimeImmutable()) {
            return new JsonResponse([
                'error' => 'Confirmation token has expired'
            ], Response::HTTP_BAD_REQUEST);
        }

        if ($user->isVerified()) {
            return new JsonResponse([
                'message' => 'Account is already confirmed'
            ], Response::HTTP_OK);
        }

        $user->setIsVerified(true);
        $user->setConfirmationToken(null);
        $user->setConfirmationTokenExpiresAt(null);

        $this->em->flush();

        return new JsonResponse([
            'message' => 'Account confirmed successfully'
        ], Response::HTTP_OK);
    }

    /**
     * @Route("/auto-verify", name="auto_verify", methods={"POST"})
     */
    public function autoVerify(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email'])) {
            return new JsonResponse([
                'error' => 'Email is required'
            ], Response::HTTP_BAD_REQUEST);
        }

        $email = trim($data['email']);
        $user = $this->em->getRepository(User::class)->findOneByEmail($email);

        if (!$user) {
            return new JsonResponse([
                'error' => 'User not found'
            ], Response::HTTP_NOT_FOUND);
        }

        // Auto-verify the user (simulating email verification)
        if (!$user->isVerified()) {
            $user->setIsVerified(true);
            $user->setConfirmationToken(null);
            $user->setConfirmationTokenExpiresAt(null);
            $this->em->flush();
        }

        return new JsonResponse([
            'message' => 'Account verified successfully',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'isVerified' => $user->isVerified(),
            ]
        ]);
    }

    /**
     * @Route("/login", name="login", methods={"POST"})
     */
    public function login(): JsonResponse
    {
        // This method is handled by Symfony's security system
        // It will only be called if authentication fails
        return new JsonResponse([
            'error' => 'Invalid credentials'
        ], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * @Route("/me", name="me", methods={"GET"})
     */
    public function me(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse([
                'error' => 'Not authenticated'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Check if user is verified - this is a database check
        if (!$user->isVerified()) {
            return new JsonResponse([
                'error' => 'Account is not verified. Please check your email and click the confirmation link to verify your account.',
                'isVerified' => false
            ], Response::HTTP_FORBIDDEN);
        }

        return new JsonResponse([
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'isVerified' => $user->isVerified(),
            ]
        ]);
    }
}

