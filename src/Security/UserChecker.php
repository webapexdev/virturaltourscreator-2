<?php

namespace App\Security;

use App\Entity\User;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class UserChecker implements UserCheckerInterface
{
    public function checkPreAuth(UserInterface $user): void
    {
        if (!$user instanceof User) {
            return;
        }

        // Check if user account is verified
        if (!$user->isVerified()) {
            throw new CustomUserMessageAuthenticationException(
                'Your account is not verified. Please check your email and click the confirmation link to verify your account.'
            );
        }
    }

    public function checkPostAuth(UserInterface $user): void
    {
        // No additional checks needed after authentication
    }
}

