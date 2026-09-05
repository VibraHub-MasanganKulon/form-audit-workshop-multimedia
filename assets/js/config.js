const UNSUR_KEYS = [
  { key: 'teks', label: 'Teks' },
  { key: 'visual', label: 'Visual' },
  { key: 'audio', label: 'Audio' },
  { key: 'gerak', label: 'Gerak' },
  { key: 'interaksi', label: 'Interaksi' }
];

const STORAGE_KEY = 'audit_entries_v2'; // Ganti versi agar tidak bentrok dengan data lama yang strukturnya beda

function emptyEntry() {
  const unsur = {};
  UNSUR_KEYS.forEach(u => {
    unsur[u.key] = { 
      bukti: '', 
      fungsi: '', 
      perbaikan: '',
      buktiImage: null // TAMBAHKAN INI
    };
  });
  
  return {
    id: 'e_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    judul: '', audiens: '', tujuan: '', pesan: '', format: '', platform: '', rekomendasi: '',
    unsur,
    updatedAt: new Date().toISOString()
  };
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
}