<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Http\Authentication\AuthenticationFailureHandlerInterface;

class AuthenticationFailureHandler implements AuthenticationFailureHandlerInterface
{
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): JsonResponse
    {
        // Get the specific error message from the exception
        $errorMessage = $exception->getMessage();
        
        // Provide more user-friendly messages for common cases
        if ($exception instanceof UserNotFoundException) {
            $errorMessage = 'User not found. Please check your email address.';
        } elseif ($exception instanceof BadCredentialsException) {
            $errorMessage = 'Invalid password. Please try again.';
        } elseif ($exception instanceof CustomUserMessageAuthenticationException) {
            // Use the custom message if provided
            $errorMessage = $exception->getMessage();
        } elseif (empty($errorMessage) || $errorMessage === 'Bad credentials.') {
            $errorMessage = 'Invalid email or password. Please try again.';
        }
        
        return new JsonResponse([
            'error' => $errorMessage
        ], 401);
    }
}

