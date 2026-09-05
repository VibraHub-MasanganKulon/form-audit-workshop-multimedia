// ============================================================
// actions.js — logika alur: pilih entri, buat baru, simpan, hapus.
// Ini bagian yang paling sering perlu disentuh kalau nambah aturan
// bisnis baru (mis. validasi tambahan, status "sudah direview", dll).
// ============================================================

function selectEntry(id) {
  if (isDirty()) {
    showModal('Ada perubahan yang belum disimpan pada konten saat ini. Simpan dulu sebelum pindah?', [
      { label: 'Simpan lalu pindah', cls: 'btn-primary', action: async () => { const ok = await saveCurrent(); if (ok) loadEntryIntoForm(id); } },
      { label: 'Buang perubahan', cls: 'btn-outline', action: () => loadEntryIntoForm(id) },
      { label: 'Batal', cls: 'btn-ghost', action: () => {} }
    ]);
  } else {
    loadEntryIntoForm(id);
  }
}

function loadEntryIntoForm(id) {
  const e = entries.find(e => e.id === id);
  if (!e) return;
  currentId = id;
  fillForm(e);
  renderList();
}

function startNewEntry() {
  const proceed = () => {
    const e = emptyEntry();
    currentId = e.id;
    fillForm(e);
    renderList();
    document.getElementById('judul').focus();
  };
  if (isDirty()) {
    showModal('Ada perubahan yang belum disimpan. Simpan dulu sebelum membuat konten baru?', [
      { label: 'Simpan lalu buat baru', cls: 'btn-primary', action: async () => { const ok = await saveCurrent(); if (ok) proceed(); } },
      { label: 'Buang perubahan', cls: 'btn-outline', action: proceed },
      { label: 'Batal', cls: 'btn-ghost', action: () => {} }
    ]);
  } else {
    proceed();
  }
}

async function saveCurrent() {
  console.log('Tombol simpan diklik. Current ID:', currentId);

  if (currentId === null) return false;
  
  const judulEl = document.getElementById('judul');

  if (!judulEl.value.trim()) {
    document.getElementById('f-judul').classList.add('has-err');
    judulEl.focus();
    showToast('Judul / tautan wajib diisi sebelum disimpan.');
    return false;
  }
  document.getElementById('f-judul').classList.remove('has-err');

  const entry = readFormAsEntry(currentId);
  const idx = entries.findIndex(e => e.id === currentId);
  if (idx === -1) entries.push(entry); else entries[idx] = entry;

  const ok = await persistEntries();
  if (ok) {
    baselineSnapshot = JSON.stringify(entry);
    updateDirtyDot();
    renderList();
    showToast('Konten tersimpan.');
  }
  return ok;
}

function confirmDelete(id) {
  const e = entries.find(x => x.id === id);
  showModal(`Hapus konten “${escapeHtml(e ? (e.judul || '(Tanpa judul)') : '')}”? Tindakan ini tidak bisa dibatalkan.`, [
    {
      label: 'Hapus', cls: 'btn-danger', action: async () => {
        entries = entries.filter(x => x.id !== id);
        await persistEntries();
        if (currentId === id) { currentId = null; clearFormBlank(); }
        renderList();
        showToast('Konten dihapus.');
      }
    },
    { label: 'Batal', cls: 'btn-ghost', action: () => {} }
  ]);
}

function deleteCurrent() {
  if (currentId === null) { showToast('Tidak ada konten yang sedang dibuka.'); return; }
  confirmDelete(currentId);
}
