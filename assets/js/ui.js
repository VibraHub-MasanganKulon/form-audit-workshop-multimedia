// ============================================================
// ui.js — semua yang berhubungan dengan tampilan & DOM:
// render tabel unsur, isi/baca form, render daftar konten,
// toast, dan modal konfirmasi.
// ============================================================

var currentId = null;
var baselineSnapshot = null; // snapshot form saat entri dimuat, untuk deteksi perubahan belum tersimpan

// Helper: Convert File to Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Render Tabel Unsur dengan Fitur Gambar
function renderUnsurTable() {
  const body = document.getElementById('unsurBody');
  body.innerHTML = '';
  
  UNSUR_KEYS.forEach(({ key, label }) => {
    const tr = document.createElement('tr');
    // Tambahkan input file tersembunyi dan container preview
    tr.innerHTML = `
      <td class="label">${label}</td>
      <td>
        <div class="bukti-container">
          <textarea data-unsur="${key}" data-field="bukti" placeholder="Ketik bukti atau paste screenshot di sini..."></textarea>
          <div class="img-preview-area" id="preview-${key}" style="display:none;">
            <img src="" alt="Preview Bukti" />
            <button type="button" class="btn-remove-img" data-unsur="${key}" title="Hapus Gambar">✕</button>
          </div>
          <div class="img-actions">
            <input type="file" id="file-${key}" accept="image/*" style="display:none" />
            <button type="button" class="btn-upload-img" onclick="document.getElementById('file-${key}').click()">📷 Upload Gambar</button>
          </div>
        </div>
      </td>
      <td><textarea data-unsur="${key}" data-field="fungsi"></textarea></td>
      <td><textarea data-unsur="${key}" data-field="perbaikan"></textarea></td>
    `;
    body.appendChild(tr);

    // --- LOGIKA PASTE IMAGE ---
    const textarea = tr.querySelector(`textarea[data-unsur="${key}"][data-field="bukti"]`);
    textarea.addEventListener('paste', async (e) => {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault(); // Mencegah paste text biasa jika ada gambar
          const file = item.getAsFile();
          await handleImageUpload(key, file);
          break;
        }
      }
    });

    // --- LOGIKA UPLOAD BUTTON ---
    const fileInput = tr.querySelector(`#file-${key}`);
    fileInput.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files[0]) {
        await handleImageUpload(key, e.target.files[0]);
      }
    });

    // --- LOGIKA HAPUS GAMBAR ---
    const removeBtn = tr.querySelector(`.btn-remove-img[data-unsur="${key}"]`);
    removeBtn.addEventListener('click', () => {
      clearImage(key);
    });
  });

  // Listener untuk dirty dot (tetap sama)
  body.querySelectorAll('textarea').forEach(t => t.addEventListener('input', updateDirtyDot));
}

// Handler Utama Upload/Paste Gambar
async function handleImageUpload(key, file) {
  try {
    const base64 = await fileToBase64(file);
    // Simpan ke state sementara (kita butuh cara update entry saat ini)
    // Karena ini UI only, kita update DOM preview dulu
    showImagePreview(key, base64);
    updateDirtyDot(); 
  } catch (err) {
    showToast('Gagal memproses gambar.');
    console.error(err);
  }
}

function showImagePreview(key, base64) {
  const previewArea = document.getElementById(`preview-${key}`);
  const img = previewArea.querySelector('img');
  img.src = base64;
  previewArea.style.display = 'block';
  
  // Sembunyikan textarea jika gambar sudah ada (opsional, biar rapi)
  // document.querySelector(`textarea[data-unsur="${key}"][data-field="bukti"]`).style.display = 'none';
}

function clearImage(key) {
  const previewArea = document.getElementById(`preview-${key}`);
  previewArea.querySelector('img').src = '';
  previewArea.style.display = 'none';
  document.getElementById(`file-${key}`).value = ''; // Reset input file
  updateDirtyDot();
}

// Update fillForm untuk menampilkan gambar tersimpan
function fillForm(entry) {
  document.getElementById('judul').value = entry.judul || '';
  document.getElementById('audiens').value = entry.audiens || '';
  document.getElementById('tujuan').value = entry.tujuan || '';
  document.getElementById('pesan').value = entry.pesan || '';
  document.getElementById('format').value = entry.format || '';
  document.getElementById('platform').value = entry.platform || '';
  document.getElementById('rekomendasi').value = entry.rekomendasi || '';

  UNSUR_KEYS.forEach(({ key }) => {
    const u = entry.unsur[key] || {};
    document.querySelector(`textarea[data-unsur="${key}"][data-field="bukti"]`).value = u.bukti || '';
    document.querySelector(`textarea[data-unsur="${key}"][data-field="fungsi"]`).value = u.fungsi || '';
    document.querySelector(`textarea[data-unsur="${key}"][data-field="perbaikan"]`).value = u.perbaikan || '';

    // Tampilkan gambar jika ada
    const previewArea = document.getElementById(`preview-${key}`);
    const img = previewArea.querySelector('img');
    if (u.buktiImage) {
      img.src = u.buktiImage;
      previewArea.style.display = 'block';
    } else {
      img.src = '';
      previewArea.style.display = 'none';
    }
  });

  baselineSnapshot = JSON.stringify(readFormAsEntry(entry.id));
  updateDirtyDot();
}

// Update readFormAsEntry untuk menangkap gambar dari DOM
function readFormAsEntry(id) {
  const unsur = {};
  UNSUR_KEYS.forEach(({ key }) => {
    // Ambil teks
    const buktiText = document.querySelector(`textarea[data-unsur="${key}"][data-field="bukti"]`)?.value.trim() || '';
    const fungsi = document.querySelector(`textarea[data-unsur="${key}"][data-field="fungsi"]`)?.value.trim() || '';
    const perbaikan = document.querySelector(`textarea[data-unsur="${key}"][data-field="perbaikan"]`)?.value.trim() || '';
    
    // Ambil gambar dari preview area
    const imgEl = document.getElementById(`preview-${key}`)?.querySelector('img');
    const buktiImage = (imgEl && imgEl.src && imgEl.src !== window.location.href) ? imgEl.src : null;

    unsur[key] = { bukti: buktiText, fungsi, perbaikan, buktiImage };
  });

  return {
    id: id,
    judul: document.getElementById('judul').value.trim(),
    audiens: document.getElementById('audiens').value.trim(),
    tujuan: document.getElementById('tujuan').value.trim(),
    pesan: document.getElementById('pesan').value.trim(),
    format: document.getElementById('format').value.trim(),
    platform: document.getElementById('platform').value.trim(),
    rekomendasi: document.getElementById('rekomendasi').value.trim(),
    unsur,
    updatedAt: new Date().toISOString()
  };
}


function isDirty() {
  if (currentId === null) return false;
  return JSON.stringify(readFormAsEntry(currentId)) !== baselineSnapshot;
}

function updateDirtyDot() {
  document.getElementById('dirtyDot').style.display = isDirty() ? 'inline-block' : 'none';
}

function clearFormBlank() {
  const e = emptyEntry();
  fillForm(e);
  currentId = null;
  baselineSnapshot = null;
}

// ---------- DAFTAR KONTEN (SIDEBAR) ----------
function renderList() {
  const list = document.getElementById('entryList');
  const q = document.getElementById('searchBox').value.trim().toLowerCase();
  const filtered = entries
    .slice()
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    .filter(e => !q || (e.judul || '').toLowerCase().includes(q) || (e.audiens || '').toLowerCase().includes(q));

  document.getElementById('countEntries').textContent = entries.length;
  list.innerHTML = '';

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-hint">${entries.length === 0 ? 'Belum ada konten yang diaudit. Klik “+ Konten baru” untuk mulai.' : 'Tidak ada hasil yang cocok.'}</div>`;
    return;
  }

  filtered.forEach(e => {
    const card = document.createElement('div');
    card.className = 'entry-card' + (e.id === currentId ? ' active' : '');
    card.innerHTML = `
      <button class="del" title="Hapus" data-id="${e.id}">✕</button>
      <div class="t">${escapeHtml(e.judul || '(Tanpa judul)')}</div>
      <div class="s">${escapeHtml(e.audiens || '—')}</div>
    `;
    card.addEventListener('click', (ev) => {
      if (ev.target.classList.contains('del')) return;
      selectEntry(e.id);
    });
    card.querySelector('.del').addEventListener('click', (ev) => {
      ev.stopPropagation();
      confirmDelete(e.id);
    });
    list.appendChild(card);
  });
}

// ---------- TOAST ----------
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

// ---------- MODAL KONFIRMASI ----------
function showModal(msg, buttons) {
  document.getElementById('modalMsg').textContent = msg;
  const btnWrap = document.getElementById('modalBtns');
  btnWrap.innerHTML = '';
  buttons.forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'btn ' + b.cls;
    btn.textContent = b.label;
    btn.addEventListener('click', async () => {
      hideModal();
      await b.action();
    });
    btnWrap.appendChild(btn);
  });
  document.getElementById('modalBg').classList.add('show');
}
function hideModal() {
  document.getElementById('modalBg').classList.remove('show');
}
