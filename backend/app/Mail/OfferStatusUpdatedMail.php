<?php
declare(strict_types=1);

namespace App\Mail;

use App\Models\Offer;
use App\Models\Property;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Email notifikasi ke USER/PEMOHON saat manajemen
 * mengubah status penawaran (follow up, reviewed, final, gugur).
 */
class OfferStatusUpdatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Offer    $offer,
        public readonly Property $property,
        public readonly string   $oldStatus,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "[ALURA] Update Status Penawaran Anda — {$this->offer->status} · REQ-" . strtoupper(substr($this->offer->uuid, 0, 8)),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.offer_status_updated',
        );
    }
}
