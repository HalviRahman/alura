<?php
/**
 * Script untuk inspect isi XML dari docx dan menyuntikkan placeholder PHPWord.
 * Jalankan sekali untuk mempersiapkan template dari dokumen Word asli.
 *
 * Usage: php scripts/prepare_docx_template.php
 */

$templatePath = __DIR__ . '/../resources/templates/surat-minat-template.docx';

if (!file_exists($templatePath)) {
    die("Template tidak ditemukan: $templatePath\n");
}

// Buka docx sebagai ZIP
$zip = new ZipArchive();
if ($zip->open($templatePath) !== true) {
    die("Gagal membuka file docx.\n");
}

// Baca document.xml
$xml = $zip->getFromName('word/document.xml');
$zip->close();

// Tampilkan teks bersih untuk inspect
$dom = new DOMDocument();
@$dom->loadXML($xml);
$xpath = new DOMXPath($dom);
$xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');

$runs = $xpath->query('//w:r/w:t');
echo "=== SEMUA TEKS DALAM DOKUMEN ===\n";
foreach ($runs as $run) {
    $text = trim($run->textContent);
    if ($text !== '') {
        echo '"' . $text . '"' . "\n";
    }
}

echo "\n=== RAW XML PARAGRAPH (100 baris pertama) ===\n";
$paragraphs = $xpath->query('//w:p');
$i = 0;
foreach ($paragraphs as $p) {
    $text = $p->textContent;
    if (trim($text) !== '') {
        echo "PARA[{$i}]: " . trim($text) . "\n";
    }
    $i++;
    if ($i > 100) break;
}
