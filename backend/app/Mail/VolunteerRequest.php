<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VolunteerRequest extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public array $data) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'طلب تطوع جديد — ' . $this->data['name'],
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: "
                <div dir='rtl' style='font-family:Arial;padding:24px;max-width:600px'>
                    <h2 style='color:#1B6CA8'>طلب تطوع جديد</h2>
                    <table style='width:100%;border-collapse:collapse'>
                        <tr><td style='padding:8px;background:#EEF5FB;font-weight:bold'>الاسم</td><td style='padding:8px'>{$this->data['name']}</td></tr>
                        <tr><td style='padding:8px;background:#EEF5FB;font-weight:bold'>الهاتف</td><td style='padding:8px'>{$this->data['phone']}</td></tr>
                        <tr><td style='padding:8px;background:#EEF5FB;font-weight:bold'>البريد</td><td style='padding:8px'>" . ($this->data['email'] ?? '—') . "</td></tr>
                        <tr><td style='padding:8px;background:#EEF5FB;font-weight:bold'>المنطقة</td><td style='padding:8px'>{$this->data['region']}</td></tr>
                        <tr><td style='padding:8px;background:#EEF5FB;font-weight:bold'>نوع التطوع</td><td style='padding:8px'>{$this->data['volunteer_type']}</td></tr>
                        <tr><td style='padding:8px;background:#EEF5FB;font-weight:bold'>وقت التفرغ</td><td style='padding:8px'>{$this->data['availability']}</td></tr>
                        <tr><td style='padding:8px;background:#EEF5FB;font-weight:bold'>المهارات</td><td style='padding:8px'>" . ($this->data['skills'] ?? '—') . "</td></tr>
                    </table>
                    <p style='color:#6B7280;font-size:12px;margin-top:24px'>مؤسسة غزلان الخير الإنسانية</p>
                </div>
            ",
        );
    }
}