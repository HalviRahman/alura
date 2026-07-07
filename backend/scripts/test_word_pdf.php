<?php
/**
 * Test end-to-end: PHPWord TemplateProcessor → DOCX → PDF via Word COM
 * Jalankan: php scripts/test_word_pdf.php
 */
require __DIR__ . '/../vendor/autoload.php';

use PhpOffice\PhpWord\TemplateProcessor;

$templatePath = __DIR__ . '/../resources/templates/surat-minat-template.docx';
$outputDir    = __DIR__ . '/../storage/app/public/offers';

if (!is_dir($outputDir)) mkdir($outputDir, 0755, true);

// ── 1. Isi template ───────────────────────────────────────────
echo "Mengisi template...\n";
$proc = new TemplateProcessor($templatePath);
$proc->setValue('TANGGAL',          '06 Juli 2026');
$proc->setValue('NAMA',             'Alfiyan Ilmi Ghani');
$proc->setValue('NIK',              '3573050501910006');
$proc->setValue('ALAMAT_PEMOHON',   'Perumahan Graha Dewata Estate, Kab. Malang, Jawa Timur');
$proc->setValue('HP',               '082216336600');
$proc->setValue('OBJEK',            'Rumah Tinggal');
$proc->setValue('ALAMAT_PROPERTI',  'Jl. Raya Sengkaling No. 10, Kota Malang, Jawa Timur');
$proc->setValue('LISTING_NO',       'MLG-2024-001');
$proc->setValue('HARGA_PENAWARAN',  'Rp. 200.000.000,- terbilang (Dua Ratus Juta Rupiah)');

$docxPath = $outputDir . '/test-surat-minat.docx';
$proc->saveAs($docxPath);
echo "DOCX saved: $docxPath (" . number_format(filesize($docxPath)) . " bytes)\n";

// ── 2. Konversi ke PDF via Word COM ─────────────────────────
echo "\nKonversi ke PDF via Word COM...\n";

$docxAbs   = str_replace('/', '\\', $docxPath);
$outputAbs = str_replace('/', '\\', $outputDir);
$pdfName   = 'test-surat-minat.pdf';
$pdfPath   = $outputDir . '/' . $pdfName;

$ps = <<<PS
\$ErrorActionPreference = "Stop"
\$word = New-Object -ComObject Word.Application
\$word.Visible = \$false
\$doc = \$word.Documents.Open("$docxAbs")
\$pdfPath = "$outputAbs\\$pdfName"
\$doc.ExportAsFixedFormat(\$pdfPath, 17)
\$doc.Close(\$false)
\$word.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject(\$doc) | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject(\$word) | Out-Null
Write-Output "SUCCESS:$pdfPath"
PS;

$tmpPs = sys_get_temp_dir() . '/surat_test_' . uniqid() . '.ps1';
file_put_contents($tmpPs, $ps);

$command = 'powershell.exe -NonInteractive -NoProfile -ExecutionPolicy Bypass -File "' . $tmpPs . '" 2>&1';
$output  = [];
exec($command, $output, $code);
@unlink($tmpPs);

$result = implode("\n", $output);
echo "PowerShell output:\n$result\n";
echo "Exit code: $code\n";

if (file_exists($pdfPath)) {
    echo "\n✅ PDF berhasil dibuat!\n";
    echo "Path: $pdfPath\n";
    echo "Size: " . number_format(filesize($pdfPath)) . " bytes\n";

    // Buka otomatis
    exec('start "" "' . str_replace('/', '\\', $pdfPath) . '"');
} else {
    echo "\n❌ PDF tidak ditemukan. Cek error di atas.\n";
}
