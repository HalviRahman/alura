<?php
/**
 * Script untuk menyiapkan template PHPWord dari dokumen Word asli.
 * Strategi: operasi langsung pada XML internal docx untuk menggabungkan
 * run yang tersebar dan menyuntikkan placeholder ${VARIABLE}.
 *
 * Jalankan: php scripts/prepare_docx_template.php
 */

// Selalu gunakan source asli (backup)
$src  = __DIR__ . '/../resources/templates/surat-minat-source.docx';
$dest = __DIR__ . '/../resources/templates/surat-minat-template.docx';

// Buat backup source jika belum ada
$original = __DIR__ . '/../resources/templates/surat-minat-template.docx';
if (!file_exists($src)) {
    copy($original, $src);
    echo "Backup source dibuat: $src\n";
}

if (!file_exists($src)) {
    die("ERROR: Source tidak ditemukan: $src\n");
}

// Buka ZIP source
$zip = new ZipArchive();
if ($zip->open($src) !== true) {
    die("ERROR: Tidak bisa membuka docx.\n");
}
$xml = $zip->getFromName('word/document.xml');
$zip->close();

// ═══════════════════════════════════════════════════════════════
// STEP 1: Normalkan paragraph dengan multiple run — gabungkan
//         teks yang tersebar di beberapa <w:r> dalam satu paragraf
//         menggunakan DOMDocument agar presisi
// ═══════════════════════════════════════════════════════════════

$dom = new DOMDocument('1.0', 'UTF-8');
$dom->preserveWhiteSpace = true;
$dom->loadXML($xml);

$xpath = new DOMXPath($dom);
$xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');
$xpath->registerNamespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships');

/**
 * Fungsi: ganti teks dalam semua <w:t> run pada paragraf tertentu.
 * Menggabungkan teks yang tersebar, lalu mengisi run pertama & menghapus sisanya.
 *
 * @param DOMXPath $xpath
 * @param string   $searchText  Teks yang dicari (substring match di dalam paragraf)
 * @param string   $replacement Teks pengganti
 * @param int      $occurrence  0 = semua, 1 = pertama, -1 = terakhir
 */
function replaceTextInParagraph(DOMXPath $xpath, string $searchText, string $replacement, int $occurrence = 0): int
{
    $ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
    $paragraphs = $xpath->query('//w:p');
    $count = 0;

    foreach ($paragraphs as $para) {
        // Kumpulkan semua teks dari runs dalam paragraf ini
        $runs = $xpath->query('.//w:r', $para);
        $fullText = '';
        foreach ($runs as $run) {
            $tNodes = $xpath->query('.//w:t', $run);
            foreach ($tNodes as $t) {
                $fullText .= $t->textContent;
            }
        }

        if (strpos($fullText, $searchText) === false) {
            continue;
        }

        // Temukan: ganti teks di run pertama yang mengandung searchText
        // atau gabungkan semua run, ganti, letakkan di run pertama
        $tNodes = $xpath->query('.//w:t', $para);
        if ($tNodes->length === 0) continue;

        // Temukan run + t yang mengandung teks
        // Ambil run pertama yang punya <w:t>
        $firstRun = null;
        $firstT   = null;
        $runList  = [];

        foreach ($runs as $run) {
            $tList = $xpath->query('.//w:t', $run);
            if ($tList->length > 0) {
                $runList[] = ['run' => $run, 'ts' => $tList];
                if ($firstRun === null) {
                    $firstRun = $run;
                    $firstT   = $tList->item(0);
                }
            }
        }

        if ($firstT === null) continue;

        // Gabungkan teks semua run
        $combinedText = $fullText;
        $newText = str_replace($searchText, $replacement, $combinedText);

        // Letakkan teks gabungan di <w:t> pertama
        $firstT->textContent = $newText;
        if (strlen($newText) > 0) {
            $firstT->setAttribute('xml:space', 'preserve');
        }

        // Kosongkan semua <w:t> di run berikutnya
        foreach ($runList as $i => $rl) {
            if ($i === 0) {
                // Run pertama: hapus semua <w:t> selain yang pertama
                $allT = $xpath->query('.//w:t', $rl['run']);
                foreach ($allT as $j => $t) {
                    if ($j > 0) {
                        $t->textContent = '';
                    }
                }
                continue;
            }
            // Run lainnya: kosongkan semua <w:t>
            foreach ($rl['ts'] as $t) {
                $t->textContent = '';
            }
        }

        $count++;
        if ($occurrence === 1) break; // hanya ganti pertama
    }

    return $count;
}

// ═══════════════════════════════════════════════════════════════
// STEP 2: Lakukan penggantian
// ═══════════════════════════════════════════════════════════════

// Tanggal atas (PARA[1]): "Malang, 02 Juli 2026"
replaceTextInParagraph($xpath, 'Malang, 02 Juli 2026', 'Malang, ${TANGGAL}', 1);

// Nama (PARA[7]): diisi di run terpisah setelah ":"
replaceTextInParagraph($xpath, 'Alfiyan Ilmi Ghani', '${NAMA}');

// NIK (PARA[8])
replaceTextInParagraph($xpath, '3573050501910006', '${NIK}');

// HP (PARA[10])
replaceTextInParagraph($xpath, '082216336600', '${HP}');

// Objek (PARA[12]): "Rumah tinggal" tersebar di 2 run: "R" + "umah tinggal"
// Full paragraph text: "Objek:Rumah tinggal"
replaceTextInParagraph($xpath, 'Rumah tinggal', '${OBJEK}');

// Alamat properti (PARA[13]): teks panjang
replaceTextInParagraph($xpath, 'Perumahan Graha Dewata Estate Blok Khusus, Desa Landungsari, Kecamatan Dau, Kabupaten Malang, Provinsi Jawa Timur', '${ALAMAT_PROPERTI}');

// Listing No (PARA[14]): "xxxxxxxxx"
replaceTextInParagraph($xpath, 'xxxxxxxxx', '${LISTING_NO}');

// Harga Penawaran (PARA[15])
replaceTextInParagraph($xpath, 'Rp. 200.000.000,- terbilang (Dua Ratus Juta Rupiah)', '${HARGA_PENAWARAN}');

// Tanggal bawah (PARA[18]): "Malang, 02 Juli 2025" (tersebar: "Malang," + "02 Juli" + "2025")
// Full text: "Malang, 02 Juli 2025"
replaceTextInParagraph($xpath, 'Malang, 02 Juli 2025', 'Malang, ${TANGGAL}');
// Jika tersebar, coba gabung
replaceTextInParagraph($xpath, 'Malang,02 Juli2025', 'Malang, ${TANGGAL}');

// Alamat pemohon (PARA[9]): baris ini kosong setelah "Alamat" ":"
// Kita perlu menambahkan placeholder ke run setelah ":"
// Cari paragraf yang fullText = "Alamat:" (tanpa nilai) dan tambahkan ${ALAMAT_PEMOHON}
$paragraphs = $xpath->query('//w:p');
foreach ($paragraphs as $para) {
    $runs = $xpath->query('.//w:r', $para);
    $runTexts = [];
    foreach ($runs as $run) {
        $tNodes = $xpath->query('.//w:t', $run);
        $txt = '';
        foreach ($tNodes as $t) { $txt .= $t->textContent; }
        $runTexts[] = ['run' => $run, 'text' => $txt, 'nodes' => $tNodes];
    }
    // Gabungkan teks semua run dalam paragraf
    $paraText = implode('', array_column($runTexts, 'text'));
    // Paragraf alamat pemohon: "Alamat:" atau "Alamat" + ":"  (tanpa nilai setelahnya)
    // Dan bukan paragraf Objek/Alamat properti
    if (trim($paraText) === 'Alamat:' || trim($paraText) === 'Alamat :') {
        // Cari run dengan teks ":" dan tambahkan run baru dengan placeholder
        foreach ($runTexts as $rData) {
            if (trim($rData['text']) === ':') {
                // Buat run baru dengan ${ALAMAT_PEMOHON}
                $ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
                $newRun = $dom->createElementNS($ns, 'w:r');
                $newT   = $dom->createElementNS($ns, 'w:t');
                $newT->setAttribute('xml:space', 'preserve');
                $newT->textContent = ' ${ALAMAT_PEMOHON}';
                $newRun->appendChild($newT);
                // Insert setelah run ":"
                $rData['run']->parentNode->insertBefore($newRun, $rData['run']->nextSibling);
                break 2;
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// STEP 3: Simpan XML yang sudah dimodifikasi
// ═══════════════════════════════════════════════════════════════
$newXml = $dom->saveXML();

// Tulis ulang ke docx (copy semua file dari source, ganti document.xml)
$srcZip = new ZipArchive();
$srcZip->open($src);

$destZip = new ZipArchive();
if ($destZip->open($dest, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
    $srcZip->close();
    die("ERROR: Tidak bisa menulis ke $dest\n");
}

for ($i = 0; $i < $srcZip->numFiles; $i++) {
    $name = $srcZip->getNameIndex($i);
    if ($name === 'word/document.xml') {
        $destZip->addFromString($name, $newXml);
    } else {
        $destZip->addFromString($name, $srcZip->getFromIndex($i));
    }
}
$srcZip->close();
$destZip->close();

echo "✓ Template berhasil disiapkan: $dest\n";
echo "\nPlaceholder yang sudah diinjeksi:\n";
echo "  \${TANGGAL}          - tanggal surat (atas & bawah)\n";
echo "  \${NAMA}             - nama pemohon\n";
echo "  \${NIK}              - NIK 16 digit\n";
echo "  \${ALAMAT_PEMOHON}   - alamat sesuai KTP\n";
echo "  \${HP}               - nomor HP\n";
echo "  \${OBJEK}            - tipe properti\n";
echo "  \${ALAMAT_PROPERTI}  - alamat properti\n";
echo "  \${LISTING_NO}       - listing ID\n";
echo "  \${HARGA_PENAWARAN}  - harga + terbilang\n";
echo "\nVerifikasi: php scripts/inspect_docx.php\n";
