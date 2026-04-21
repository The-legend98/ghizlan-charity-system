<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Attachment;

class StatusUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $fullName,
        public string $refNumber,
        public string $newStatus,
        public string $note = '',
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'تحديث حالة طلبك — مؤسسة غزلان الخير',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.status-updated',
        with: [
            'logoUrl' => 'cid:logo',
        ]
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromPath(public_path('g-logo.png'))
                ->as('logo')
                ->withMime('image/png'),
        ];
    }
}