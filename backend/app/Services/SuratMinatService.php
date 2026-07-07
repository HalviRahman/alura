<?php
declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Log;
use PhpOffice\PhpWord\TemplateProcessor;

/**
 * Generate PDF Surat Minat Aset dari template Word.
 *
 * Template: backend/resources/templates/surat-minat-template.docx
 * (sudah berisi placeholder ${TANGGAL}, ${NAMA}, ${NIK}, dll.)
 *
 * Flow:
 *   1. PHPWord TemplateProcessor isi semua ${PLACEHOLDER} dengan data nyata
 *   2. Simpan sebagai .docx sementara
 *   3. PowerShell + Word.Application COM export ke PDF
 *   4. Hapus .docx sementara, return path PDF
 */
class SuratMinatService
{
    /** Path ke template .docx dengan placeholder */
    private function getTemplatePath(): string
    {
        return resource_path('templates/surat-minat-template.docx');
    }

    /** Path ke Microsoft Word executable */
    private string $wordExe = 'C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE';

    /**
     * Generate PDF Surat Minat Aset.
     *
     * @param  array  $data  Keys: tanggal, nama, nik, alamat_pemohon, hp,
     *                       objek, alamat_properti, listing_no, harga_penawaran
     * @param  string $outputDir  Direktori output (absolute path)
     * @param  string $filename   Nama file tanpa ekstensi
     * @return string|null        Absolute path PDF, null jika gagal
     */
    public function generate(array $data, string $outputDir, string $filename): ?string
    {
        $templatePath = $this->getTemplatePath();

        if (!file_exists($templatePath)) {
            Log::error('SuratMinatService: Template tidak ditemukan', ['path' => $templatePath]);
            return null;
        }

        if (!is_dir($outputDir)) {
            mkdir($outputDir, 0755, true);
        }

        // 1. Isi placeholder → simpan .docx sementara
        $docxPath = $this->fillTemplate($templatePath, $data, $outputDir, $filename);
        if (!$docxPath) {
            return null;
        }

        // 2. Konversi DOCX → PDF via Word COM
        $pdfPath = $outputDir . DIRECTORY_SEPARATOR . $filename . '.pdf';
        $ok      = $this->wordToPdf($docxPath, $pdfPath);

        // 3. Hapus .docx sementara
        @unlink($docxPath);

        return $ok ? $pdfPath : null;
    }

    // ── Private ───────────────────────────────────────────────────────────────

    /** Isi semua ${PLACEHOLDER} menggunakan PHPWord TemplateProcessor */
    private function fillTemplate(
        string $templatePath,
        array  $data,
        string $outputDir,
        string $filename
    ): ?string {
        try {
            $proc = new TemplateProcessor($templatePath);

            $proc->setValue('TANGGAL',         $data['tanggal']         ?? '');
            $proc->setValue('NAMA',            $data['nama']            ?? '');
            $proc->setValue('NIK',             $data['nik']             ?? '');
            $proc->setValue('ALAMAT_PEMOHON',  $data['alamat_pemohon']  ?? '');
            $proc->setValue('HP',              $data['hp']              ?? '');
            $proc->setValue('OBJEK',           $data['objek']           ?? '');
            $proc->setValue('ALAMAT_PROPERTI', $data['alamat_properti'] ?? '');
            $proc->setValue('LISTING_NO',      $data['listing_no']      ?? '');
            $proc->setValue('HARGA_PENAWARAN', $data['harga_penawaran'] ?? '');

            $docxPath = $outputDir . DIRECTORY_SEPARATOR . $filename . '.docx';
            $proc->saveAs($docxPath);

            return $docxPath;
        } catch (\Throwable $e) {
            Log::error('SuratMinatService: Gagal mengisi template', [
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Konversi DOCX → PDF via PowerShell + Microsoft Word COM Automation.
     */
    private function wordToPdf(string $docxPath, string $pdfPath): bool
    {
        $docxAbs = str_replace('/', '\\', realpath($docxPath) ?: $docxPath);
        $pdfAbs  = str_replace('/', '\\', $pdfPath);

        $ps = <<<POWERSHELL
\$ErrorActionPreference = "Stop"
try {
    \$word = New-Object -ComObject Word.Application
    \$word.Visible = \$false
    \$doc = \$word.Documents.Open("{$docxAbs}")
    \$doc.ExportAsFixedFormat("{$pdfAbs}", 17)
    \$doc.Close([ref]\$false)
    \$word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject(\$doc) | Out-Null
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject(\$word) | Out-Null
    Write-Output "OK"
} catch {
    Write-Error \$_.Exception.Message
    exit 1
}
POWERSHELL;

        $tmpPs = tempnam(sys_get_temp_dir(), 'surat_minat_') . '.ps1';
        file_put_contents($tmpPs, $ps);

        $cmd    = 'powershell.exe -NonInteractive -NoProfile -ExecutionPolicy Bypass -File "' . $tmpPs . '" 2>&1';
        $output = [];
        $code   = 0;
        exec($cmd, $output, $code);

        @unlink($tmpPs);

        $result = implode("\n", $output);
        Log::info('SuratMinatService: Word PDF export', [
            'exit_code' => $code,
            'output'    => $result,
        ]);

        if ($code !== 0 || !file_exists($pdfPath)) {
            Log::error('SuratMinatService: Gagal konversi ke PDF', ['output' => $result]);
            return false;
        }

        return true;
    }
}
