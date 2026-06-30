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

/**
 * Email konfirmasi yang dikirim ke USER/PEMOHON
 * setelah berhasil submit penawaran atau inquiry.
 */
class OfferConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Offer    $offer,
        public readonly Property $property,
        public readonly ?User    $agent = null,
    ) {}

    public function envelope(): Envelope
    {
        $type = $this->offer->offer_price > 0 ? 'Penawaran' : 'Permintaan Info';

        return new Envelope(
            subject: "[ALURA] Konfirmasi {$type} — REQ-" . strtoupper(substr($this->offer->uuid, 0, 8)),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.offer_confirmation',
        );
    }
}
