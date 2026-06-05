<?php
declare(strict_types=1);

namespace App\Mail;

use App\Models\Offer;
use App\Models\Property;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OfferReceivedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Offer    $offer,
        public readonly Property $property,
        public readonly ?User    $agent = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "[ALURA] Penawaran Baru — {$this->property->listing_id} · {$this->offer->applicant_name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.offer_received',
        );
    }
}
