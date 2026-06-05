<?php
declare(strict_types=1);

namespace App\Mail;

use App\Models\Agreement;
use App\Models\Property;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SpkCriticalMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Property  $property,
        public readonly Agreement $agreement,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "[ALURA] 🚨 SPK KRITIS: {$this->property->title} — HANYA {$this->agreement->daysRemaining()} HARI TERSISA",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.spk_critical',
        );
    }
}
