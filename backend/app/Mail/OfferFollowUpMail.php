<?php
declare(strict_types=1);

namespace App\Mail;

use App\Models\Offer;
use App\Models\Property;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Email follow-up dari Manajemen ALURA ke Pemohon.
 * Melampirkan Surat Minat Aset (PDF) sebagai bukti resmi penawaran.
 */
class OfferFollowUpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Offer    $offer,
        public readonly Property $property,
        public readonly string   $pdfAbsPath,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[ALURA] Tindak Lanjut Penawaran Aset — ' . $this->property->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.offer_followup',
        );
    }

    public function attachments(): array
    {
        $filename = 'SuratMinat-' . $this->offer->applicant_name . '-' . $this->property->listing_id . '.pdf';

        return [
            Attachment::fromPath($this->pdfAbsPath)
                ->as($filename)
                ->withMime('application/pdf'),
        ];
    }
}
