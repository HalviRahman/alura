# PRD — Project Requirements Document

## 1. Overview
Aplikasi ini adalah platform *marketplace* properti khusus untuk aset sitaan atau hasil eksekusi bank. Masalah utama yang diselesaikan adalah sulitnya memasarkan aset properti secara luas, serta rumitnya pihak manajemen dalam mengawasi batas waktu kontrak perjanjian kerja sama (SPK) dari bank dan melacak penawaran masuk dari calon pembeli.

Tujuan utama aplikasi ini adalah mendigitalisasi proses pengenalan dan penawaran aset properti sehingga pengguna (masyarakat) lebih mudah mencari properti berdasarkan kota dan harga, memudahkan Level 1 Agen dalam mempromosikan aset melalui link unik ter-tracked, serta memudahkan Manajemen dalam mengelola data objek, memantau status perjanjian, mengevaluasi risiko, serta menerima dan mengolah dokumen penawaran resmi dari pengguna tanpa mekanisme lelang langsung.

## 2. Requirements & Roles
| Role | Deskripsi Akses & Wewenang |
| :--- | :--- |
| **Manajemen** | Full akses: Input/Edit data aset & SPK, monitoring notifikasi kadaluwarsa, pembaruan status penawaran (Final/Gugur), dan melihat pelacakan agen. |
| **Agen Level 1** | Dashboard Khusus: Memilih properti, generate link referral unik, melihat riwayat penawaran dari link miliknya, dan memantau status progres penawaran (Read-Only). |
| **User (Publik)** | Browsing properti (tanpa titik lokasi pasti), mengisi form penawaran (auto-fill referral jika ada), dan mengunduh PDF penawaran resmi. |

## 3. Alur Kerja (Workflows)

### 3.1 Diagram Alur Proses (Flowchart ASCII)
```text
[ START: Manajemen Input Properti & SPK ]
           |
           v
[ Sistem Cek SPK Harian ] -- (Jika Expired) --> [ OTOMATIS TAKEDOWN ]
           |                                    (Properti Tidak Tayang)
      (Jika Aktif)
           |
           v
[ Aset Tayang di Marketplace ] <------- [ Agen Generate Link Unique ]
           |                               (?ref=KODE_AGEN)
           v                                       |
[ User Klik Iklan / Cari Aset ] <------------------+
           |
           v
[ User Isi Form Penawaran ]
(Jika dari link Agen -> Kode Referral Terisi Otomatis & Terkunci)
           |
           v
[ Sistem Terbitkan PDF Penawaran ]
(Mencantumkan Data User & Atribusi Kode Agen)
           |
           v
[ Dashboard Manajemen: Notifikasi Baru ]
(Tindak Lanjut Offline / Negosiasi)
           |
           +---------------------------------------+
           |                                       |
           v                                       v
 [ Status: FINAL/SELESAI ]              [ Status: PENAWARAN GUGUR ]
  (Status terupdate ke Agen)             (Status terupdate ke Agen)
```

## 4. Core Features
- **Manajemen Properti:** Input data perjanjian (SPK), detail objek, informasi risiko, dan koordinat lokasi (khusus Manajemen).
- **Otomasi SPK Engine:** Notifikasi ke dashboard manajemen 30 hari sebelum SPK berakhir dan pemutusan tayangan (takedown) otomatis di hari H.
- **Sistem Referral React:** Tombol "Copy Link" pada dashboard agen yang menghasilkan URL dengan query parameter referral.
- **Auto-Fill Referral Form:** Logic pada frontend React yang menangkap parameter URL dan mengunci kolom kode agen agar tidak bisa diubah user.
- **Generator PDF Resmi:** Pembuatan dokumen penawaran secara instan oleh server backend (saat submit) yang menyertakan watermark atau teks atribusi agen.
- **Dashboard Sinkronisasi:** Manajemen mengubah status penawaran, dan Agen dapat melihat progres tersebut (Pending -> Follow Up -> Final/Gugur) untuk transparansi.

## 5. Architecture (Struktur Komunikasi)

### 5.1 Diagram Komunikasi Sistem
```text
[ USER/AGEN BROWSER ]          [ BACKEND API ]          [ DATABASE & STORAGE ]
      (React JS)                 (Laravel)               (MySQL / S3)
          |                          |                           |
          |--- Get Data Properti --->|                           |
          |<--- Return JSON Data ----|--- Query DB --------------|
          |                          |                           |
          |--- Submit Penawaran ---->|                           |
          |    (+ Kode Referral)     |--- Save Record Penawaran >|
          |                          |--- Generate PDF Document >|
          |<--- Return Link PDF -----|--- Store PDF to S3/MinIO >|
          |                          |                           |
```

## 6. Database Schema (Detail ERD)

### 6.1 Kamus Data & Relasi (MySQL)
| Tabel | Kolom Utama (Field) | Deskripsi Relasi |
| :--- | :--- | :--- |
| **users** | id, name, email, role, **referral_code** | Induk data user/agen. Referral code unik untuk tiap agen. |
| **properties** | id, title, price, city, is_published | Data teknis aset properti. |
| **agreements** | id, **property_id (FK)**, end_date | Relasi 1:1 dengan properti untuk kontrol masa SPK. |
| **offers** | id, **property_id (FK)**, **agent_id (FK)**, status | Mencatat penawaran. Agent_id terisi jika ada referral. |
| **asset_details**| id, **property_id (FK)**, lat, lng | Detail sensitif seperti koordinat lokas yang diproteksi. |

### 6.2 Logika Relasi
1.  **Properties ↔ Agreements (1:1):** Satu properti hanya memiliki satu kontrak SPK aktif.
2.  **Properties ↔ Offers (1:N):** Satu properti bisa menerima banyak penawaran.
3.  **Users (Agent) ↔ Offers (1:N):** Satu agen dapat membawa banyak user/penawaran melalui link uniknya.

## 7. Tech Stack

### 7.1 Frontend (User & Admin Interface)
*   **Framework:** **React JS** (v18+).
*   **Styling:** **Tailwind CSS** (Utility-first framework untuk desain responsif).
*   **Navigation:** **React Router DOM** (Digunakan untuk handling navigasi halaman dan parsing query parameter referral `?ref=xxx`).
*   **State Management:** React Context API atau Zustand untuk pengelolaan state lokal (seperti kode referral yang tersimpan saat browsing).
*   **API Client:** Axios (Komunikasi asinkron dengan REST API backend).

### 7.2 Backend & Infrastructure
*   **Server Framework:** Laravel (PHP 8.x).
*   **Job Scheduling:** Laravel Cron Job (Pengecekan harian untuk otomasi takedown SPK).
*   **PDF Library:** barryvdh/laravel-dompdf atau mPDF.
*   **Database:** **MySQL** (Dioptimalkan untuk environment development lokal menggunakan **Laragon**).
*   **File Storage:** S3 Compatible (MinIO/AWS) untuk menyimpan foto properti dan PDF penawaran.

## 8. Security & Privacy Rules
- **Data Protection:** Koordinat Latitude & Longitude tidak dikirim dalam API response untuk role User/Agen demi keamanan aset di lapangan.
- **Referral Integrity:** Kode referral yang ditangkap dari URL oleh React JS bersifat *Read-Only* pada form pengajuan untuk mencegah manipulasi data agen.
- **SPK Automated Logic:** Sistem harus memiliki redundansi pengecekan SPK tiap kali aset tersebut diakses oleh publik untuk memastikan aset kadaluwarsa tidak bisa dilihat meskipun user memiliki link lama.