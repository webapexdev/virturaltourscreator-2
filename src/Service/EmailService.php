<?php

namespace App\Service;

use Symfony\Component\Filesystem\Filesystem;

class EmailService
{
    private string $emailDirectory;
    private Filesystem $filesystem;

    public function __construct(string $projectDir)
    {
        $this->emailDirectory = $projectDir . '/var/emails';
        $this->filesystem = new Filesystem();
        
        // Ensure directory exists
        if (!$this->filesystem->exists($this->emailDirectory)) {
            $this->filesystem->mkdir($this->emailDirectory);
        }
    }

    public function sendConfirmationEmail(string $to, string $confirmationToken): void
    {
        $subject = 'Confirm your account';
        $confirmationUrl = "http://localhost:81/api/auth/confirm/{$confirmationToken}";
        
        $body = <<<EMAIL
Hello,

Please confirm your account by clicking the following link:

{$confirmationUrl}

If you did not register for this account, please ignore this email.

Best regards,
VTC Challenge Team
EMAIL;

        $this->saveEmail($to, $subject, $body);
    }

    private function saveEmail(string $to, string $subject, string $body): void
    {
        try {
            // Ensure directory exists and is writable
            if (!$this->filesystem->exists($this->emailDirectory)) {
                $this->filesystem->mkdir($this->emailDirectory, 0755);
            }

            $filename = sprintf(
                '%s/%s_%s.txt',
                $this->emailDirectory,
                date('Y-m-d_H-i-s'),
                uniqid()
            );

            $emailContent = <<<EMAIL
To: {$to}
Subject: {$subject}

{$body}
EMAIL;

            $this->filesystem->dumpFile($filename, $emailContent);
        } catch (\Exception $e) {
            // Log error but don't throw - email saving failure shouldn't break the app
            error_log('Failed to save email: ' . $e->getMessage());
            // Don't re-throw - allow registration to succeed even if email saving fails
        }
    }
}


