<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PendingRequestReminder extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $employeeName,
        public string $refNumber,
        public string $fullName,
        public int    $daysLeft,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "تذكير: طلب {$this->refNumber} يحتاج مراجعة",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.pending-reminder',
        );
    }
}