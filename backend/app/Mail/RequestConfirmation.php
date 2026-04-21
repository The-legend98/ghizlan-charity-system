<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Attachment;

class RequestConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $fullName,
        public string $refNumber,
        public string $assistanceType,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'تم استلام طلبك — مؤسسة غزلان الخير',
        );
    }

   public function content(): Content
{
    return new Content(
        view: 'emails.request-confirmation',
    );
}

public function attachments(): array
{
    return [];
}
}