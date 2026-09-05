# Audit Konten Digital - Panduan Penggunaan & Kontribusi

Aplikasi web berbasis single-page untuk melakukan audit konten digital secara terstruktur. Alat ini membantu evaluator mengevaluasi unsur-unsur konten (Teks, Visual, Audio, Gerak, Interaksi) serta menyimpan bukti visual langsung dari clipboard atau unggahan file.

🔗 Akses Aplikasi Langsung: https://form-audit-workshop-multimedia.vercel.app/

## Panduan Penggunaan Langsung (User Guide)
Gunakan bagian ini jika Anda hanya ingin menggunakan aplikasi untuk keperluan audit harian tanpa perlu mengedit kode.

### Cara Mengakses
1. Buka tautan resmi: https://form-audit-workshop-multimedia.vercel.app/
2. Tidak perlu instalasi apa pun. Aplikasi berjalan sepenuhnya di browser Anda.
3. Catatan Privasi: Semua data disimpan secara lokal di browser (LocalStorage). Data tidak dikirim ke server manapun. Jika Anda membersihkan cache/browser data, riwayat audit akan hilang permanen.

### Alur Kerja Audit
1. Mulai Konten Baru: Klik tombol + Konten baru. Isi identitas (Judul, Audiens, Tujuan, dll).
2. Isi Tabel Unsur:
    - Ketik analisis pada kolom Bukti, Fungsi, dan Perbaikan.
    - Paste Screenshot: Cukup tekan Ctrl+V (atau Cmd+V) saat kursor berada di kolom "Bukti". Gambar akan otomatis muncul di preview.
    - Upload Manual: Klik tombol 📷 Upload Gambar jika ingin mengambil file dari komputer.
3. Simpan Data: Klik tombol Simpan. Data tersimpan otomatis di memori browser.
4. Ekspor Dokumen:
    - Klik Preview & export konten ini untuk melihat hasil sebelum diunduh.
    - Di jendela Preview, pilih Unduh Word (.doc) untuk laporan teks, atau Cetak / simpan PDF untuk laporan bergambar rapi format A4.

### Tips Penggunaan
- Hindari mengunggah gambar resolusi sangat tinggi (4K/RAW) karena kapasitas penyimpanan browser terbatas (~5-10MB). Gunakan screenshot yang sudah di-crop atau dikompresi agar bisa menyimpan lebih banyak entri.
- Fitur paste gambar bekerja paling baik di browser Chrome/Edge/Firefox versi terbaru.

## Dokumentasi Kontribusi (Developer Guide)
Gunakan bagian ini jika Anda ingin mengembangkan fitur baru, memperbaiki bug, atau menyesuaikan struktur data audit. Source code tersedia di repository ini.

### Struktur Proyek
Proyek ini menggunakan arsitektur vanilla JS modular tanpa bundler. Urutan pemuatan script di `index.html` sangat kritis:

```bash
assets/js/
├── config.js      # Konstanta, tipe data, helper escapeHtml
├── storage.js     # Logika persistensi data (window.storage / localStorage)
├── ui.js          # Render DOM, event listener tabel, form handling, toast/modal
├── actions.js     # Business logic (save, delete, select entry, validation)
├── export.js      # Generator HTML dokumen, preview modal, download handler
└── main.js        # Inisialisasi awal & binding event listener global
```

### Menambah Unsur Audit Baru
Jika ingin menambah kategori unsur (misal: "Narasi Suara"):
1. Buka `config.js.`
2. Tambahkan objek baru ke array `UNSUR_KEYS: { key: 'narasi', label: 'Narasi Suara' }`.
3. Sistem akan otomatis merender baris tabel, input field, dan logika penyimpanan untuk unsur tersebut tanpa perlu mengubah file lain.

### Modifikasi Format Ekspor
- Ubah Tampilan Dokumen: Edit fungsi  `entryToHtmlBlock()` di `export.js`. Semua template HTML untuk Word/PDF ada di sana.
- Ganti Library PDF: Saat ini menggunakan `html2pdf.js`. Jika ingin migrasi ke `jspdf` native atau server-side generation, cukup ubah implementasi `printFromPreview()`.

### Manajemen State & Variabel Global
Karena tidak menggunakan module system (ESM/CommonJS), variabel state bersifat global:
- `currentId`: ID entri yang sedang aktif di form.
- `entries`: Array utama penyimpan semua data audit.
- `baselineSnapshot`: JSON string untuk mendeteksi perubahan belum tersimpan (dirty state).

⚠️ Perhatian: Saat menambahkan variabel state baru di `ui.js`, pastikan mendeklarasikannya dengan `var` (bukan `let/const`) agar dapat diakses lintas file script secara global.

### Debugging Umum
- Gambar Tidak Muncul: Cek Console Browser. Error `Unsafe attempt to load URL` berarti Anda membuka via `file://`. Wajib pakai Local Server atau akses via URL deployment Vercel.
- Tombol Simpan Null: Pastikan `currentId` terisi. Variabel ini hanya berubah saat memanggil `startNewEntry()` atau `loadEntryIntoForm()`.
- Toast Tertutup Modal: Toast memiliki `z-index: 9999` dinamis. Jika masih tertutup, cek apakah ada elemen lain yang menggunakan `z-index > 9999` di CSS custom Anda.

### Lisensi & Atribusi
Proyek ini dikembangkan untuk kebutuhan Workshop Literasi Multimedia. Silakan modifikasi dan distribusikan sesuai kebutuhan institusi.