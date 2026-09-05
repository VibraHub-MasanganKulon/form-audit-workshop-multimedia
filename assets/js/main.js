// ============================================================
// main.js — hubungkan semua modul: pasang event listener & jalankan init.
// Ini file yang paling sering diubah kalau nambah tombol/fitur baru.
// ============================================================

document.getElementById('btnNew').addEventListener('click', startNewEntry);
document.getElementById('btnSave').addEventListener('click', saveCurrent);
document.getElementById('btnDeleteOne').addEventListener('click', deleteCurrent);
document.getElementById('btnPreviewOne').addEventListener('click', openPreviewOne);
document.getElementById('btnPreviewAll').addEventListener('click', openPreviewAll);
document.getElementById('searchBox').addEventListener('input', renderList);

['judul', 'audiens', 'tujuan', 'pesan', 'format', 'platform', 'rekomendasi'].forEach(id => {
  document.getElementById(id).addEventListener('input', updateDirtyDot);
});

document.getElementById('modalBg').addEventListener('click', (ev) => {
  if (ev.target.id === 'modalBg') hideModal();
});

document.getElementById('previewClose').addEventListener('click', closePreview);
document.getElementById('previewDownload').addEventListener('click', downloadFromPreview);
document.getElementById('previewPrint').addEventListener('click', printFromPreview);
document.getElementById('previewBg').addEventListener('click', (ev) => {
  if (ev.target.id === 'previewBg') closePreview();
});

(async function init() {
  renderUnsurTable();
  await loadEntries();
  renderList();
  if (entries.length > 0) {
    const latest = entries.slice().sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))[0];
    loadEntryIntoForm(latest.id);
  } else {
    clearFormBlank();
  }
})();
