// ============================================================
// storage.js — baca/tulis data ke window.storage.
// Semua entri disimpan dalam SATU key (array JSON), bukan per-field,
// biar hemat panggilan penyimpanan.
//
// CATATAN: window.storage adalah API penyimpanan milik lingkungan
// Claude (artifact), BUKAN localStorage browser biasa. Kalau file ini
// dibuka langsung sebagai file HTML statis di luar Claude (mis. lewat
// hosting sendiri), window.storage tidak akan tersedia — lihat
// README di root project untuk opsi penggantinya.
// ============================================================

let entries = [];

async function loadEntries() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    entries = stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Gagal memuat data:', e);
    entries = [];
  }
}

async function persistEntries() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (e) {
    console.error('Gagal menyimpan data:', e);
    showToast('Gagal menyimpan ke penyimpanan lokal. Coba lagi.');
    return false;
  }
}
