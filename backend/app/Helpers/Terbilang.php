<?php
declare(strict_types=1);

namespace App\Helpers;

/**
 * Mengkonversi angka integer ke dalam teks terbilang Bahasa Indonesia.
 * Contoh: 200_000_000 → "Dua Ratus Juta"
 */
class Terbilang
{
    private static array $satuan = [
        '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima',
        'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh',
        'Sebelas', 'Dua Belas', 'Tiga Belas', 'Empat Belas', 'Lima Belas',
        'Enam Belas', 'Tujuh Belas', 'Delapan Belas', 'Sembilan Belas',
    ];

    public static function convert(int $angka): string
    {
        if ($angka < 0) {
            return 'Minus ' . self::convert(abs($angka));
        }
        if ($angka === 0) {
            return 'Nol';
        }
        return trim(self::terbilang($angka));
    }

    private static function terbilang(int $angka): string
    {
        if ($angka < 20) {
            return self::$satuan[$angka];
        }

        if ($angka < 100) {
            $puluhan = intdiv($angka, 10);
            $sisa    = $angka % 10;
            return self::$satuan[$puluhan] . ' Puluh' . ($sisa ? ' ' . self::$satuan[$sisa] : '');
        }

        if ($angka < 200) {
            $sisa = $angka - 100;
            return 'Seratus' . ($sisa ? ' ' . self::terbilang($sisa) : '');
        }

        if ($angka < 1_000) {
            $ratus = intdiv($angka, 100);
            $sisa  = $angka % 100;
            return self::$satuan[$ratus] . ' Ratus' . ($sisa ? ' ' . self::terbilang($sisa) : '');
        }

        if ($angka < 2_000) {
            $sisa = $angka - 1_000;
            return 'Seribu' . ($sisa ? ' ' . self::terbilang($sisa) : '');
        }

        if ($angka < 1_000_000) {
            $ribu = intdiv($angka, 1_000);
            $sisa = $angka % 1_000;
            return self::terbilang($ribu) . ' Ribu' . ($sisa ? ' ' . self::terbilang($sisa) : '');
        }

        if ($angka < 1_000_000_000) {
            $juta = intdiv($angka, 1_000_000);
            $sisa = $angka % 1_000_000;
            return self::terbilang($juta) . ' Juta' . ($sisa ? ' ' . self::terbilang($sisa) : '');
        }

        if ($angka < 1_000_000_000_000) {
            $miliar = intdiv($angka, 1_000_000_000);
            $sisa   = $angka % 1_000_000_000;
            return self::terbilang($miliar) . ' Miliar' . ($sisa ? ' ' . self::terbilang($sisa) : '');
        }

        $triliun = intdiv($angka, 1_000_000_000_000);
        $sisa    = $angka % 1_000_000_000_000;
        return self::terbilang($triliun) . ' Triliun' . ($sisa ? ' ' . self::terbilang($sisa) : '');
    }
}
