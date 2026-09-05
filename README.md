# Audit Konten Digital

## Struktur

```
audit-konten/
├── index.html              markup saja
└── assets/
    ├── css/
    │   └── style.css       semua styling
    └── js/
        ├── config.js       konstanta: daftar unsur, kriteria, bentuk data kosong
        ├── storage.js      baca/tulis ke window.storage
        ├── ui.js           render form, daftar konten, toast, modal
        ├── actions.js       logika: pilih/buat/simpan/hapus entri
        ├── export.js       preview dokumen di modal → unduh Word (.doc) / cetak-PDF
        └── main.js         pasang event listener + jalankan saat load
```

Urutan `<script>` di `index.html` sengaja berurutan (config → storage → ui →
actions → export → main) karena semua pakai variabel/fungsi global biasa,
bukan ES module — supaya tetap jalan kalau file dibuka langsung dari disk
(`file://`), tanpa perlu server.

## Kalau mau nambah/kurangi fitur

- **Tambah kolom identitas konten** (mis. "Nama pengaudit"): tambah `<input>`
  di `index.html`, tambah field di `emptyEntry()` (config.js), tambah baris
  di `fillForm()` & `readFormAsEntry()` (ui.js), tambah baris tabel di
  `entryToHtmlBlock()` (export.js).
- **Tambah/kurangi unsur** (Teks/Visual/Audio/dst): cukup ubah array
  `UNSUR_KEYS` di `config.js` — tabel, preview, dan export mengikuti otomatis.
- **Ubah tampilan preview atau isi dokumen export**: cukup ubah
  `entryToHtmlBlock()` di `export.js` — dipakai bareng oleh preview,
  unduh Word, dan cetak/PDF, jadi cukup diubah satu tempat.
- **Ganti cara export** (mis. ke docx asli, atau kirim ke API): cukup ubah
  `export.js`, modul lain tidak perlu disentuh.

## Keterbatasan penting

`window.storage` adalah API penyimpanan milik lingkungan Claude (artifact),
bukan `localStorage` browser biasa — sengaja dipakai karena `localStorage`
diblokir di sandbox Claude. Konsekuensinya:

- Selama file ini dibuka **lewat Claude** (artifact/preview), data tersimpan
  per akun Claude kamu dan tetap ada lain waktu.
- Kalau file ini diambil lalu dibuka **langsung dari disk atau dihosting
  sendiri** (di luar Claude), `window.storage` tidak tersedia — form akan
  tetap bisa diisi, tapi tombol Simpan akan gagal.
- Kalau tujuan akhirnya memang untuk dipakai mandiri di luar Claude (mis.
  di-hosting di server kampus), `storage.js` perlu diganti ke
  `localStorage` biasa (tinggal ganti isi `loadEntries()`/`persistEntries()`
  — struktur file lain tidak perlu berubah, ini alasan kenapa dipisah).
# form-audit-workshop-multimedia
