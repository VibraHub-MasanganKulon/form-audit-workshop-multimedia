// ============================================================
// export.js — bangun HTML dokumen, tampilkan preview di modal,
// baru dari situ diunduh (.doc) atau dicetak/PDF.
// Kalau nanti mau ganti ke docx asli / PDF asli, cukup ganti
// implementasi downloadDoc() / printFromPreview() di sini saja.
// ============================================================

function entryToHtmlBlock(e) {
  const rows = UNSUR_KEYS.map(({ key, label }) => {
    const u = e.unsur[key] || { bukti: '', fungsi: '', perbaikan: '', buktiImage: null };
    
    // Cek apakah ada konten (teks ATAU gambar)
    const hasContent = u.bukti || u.fungsi || u.perbaikan || u.buktiImage;
    if (!hasContent) return '';

    let buktiContent = escapeHtml(u.bukti).replace(/\n/g, '<br>');
    
    // Jika ada gambar, tambahkan tag img ke dalam sel bukti
    if (u.buktiImage) {
      buktiContent += `<br><br><img src="${u.buktiImage}" style="max-width:100%; height:auto; border:1px solid #ccc; border-radius:4px;" />`;
    }

    return `
      <tr>
        <td style="font-weight:bold; background:#f8fafc;">${escapeHtml(label)}</td>
        <td>${buktiContent}</td>
        <td>${escapeHtml(u.fungsi).replace(/\n/g, '<br>')}</td>
        <td>${escapeHtml(u.perbaikan).replace(/\n/g, '<br>')}</td>
      </tr>
    `;
  }).join('');

  return `
    <div style="margin-bottom:30px; border:1px solid #ddd; padding:20px; border-radius:8px; background:#fff;">
      <h2 style="margin-top:0; color:#1a3a5c;">${escapeHtml(e.judul || '(Tanpa judul)')}</h2>
      <p style="color:#666; font-size:12px; margin-bottom:15px;">Diperbarui: ${new Date(e.updatedAt).toLocaleString('id-ID')}</p>
      
      <table style="width:100%; border-collapse:collapse; margin-bottom:15px;">
        <tr><td style="padding:8px; border:1px solid #eee; width:120px; font-weight:bold;">Audiens</td><td style="padding:8px; border:1px solid #eee;">${escapeHtml(e.audiens)}</td></tr>
        <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Tujuan</td><td style="padding:8px; border:1px solid #eee;">${escapeHtml(e.tujuan)}</td></tr>
        <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Pesan utama</td><td style="padding:8px; border:1px solid #eee;">${escapeHtml(e.pesan)}</td></tr>
        <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Format</td><td style="padding:8px; border:1px solid #eee;">${escapeHtml(e.format)}</td></tr>
        <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Platform</td><td style="padding:8px; border:1px solid #eee;">${escapeHtml(e.platform)}</td></tr>
      </table>

      <h3 style="color:#1a3a5c; border-bottom:2px solid #f2c53d; padding-bottom:5px;">Analisis Unsur</h3>
      <table style="width:100%; border-collapse:collapse; font-size:13px;">
        <thead>
          <tr style="background:#1a3a5c; color:white;">
            <th style="padding:10px; text-align:left;">Unsur</th>
            <th style="padding:10px; text-align:left;">Bukti pada konten</th>
            <th style="padding:10px; text-align:left;">Fungsi</th>
            <th style="padding:10px; text-align:left;">Perbaikan</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="4" style="padding:10px; text-align:center; color:#999;">Belum ada unsur yang diisi.</td></tr>'}
        </tbody>
      </table>

      <div style="margin-top:15px; padding:10px; background:#f4f7fb; border-radius:6px;">
        <strong>Rekomendasi utama:</strong><br>
        ${escapeHtml(e.rekomendasi).replace(/\n/g, '<br>') || '—'}
      </div>
    </div>
  `;
}

function downloadDoc(filename, innerHtml) {
  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset="utf-8"><title>${filename}</title></head>
  <body>${innerHtml}</body></html>`;
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------- PREVIEW (tampil dulu di web sebelum diunduh/dicetak) ----------
// currentPreview menyimpan apa yang sedang ditampilkan di modal preview,
// supaya tombol Unduh/Cetak di modal tahu harus memproses data yang mana.
let currentPreview = null;

function buildAllHtml(sortedEntries, forDownload) {
  const heading = `<h1 style="color:#1a3a5c;">Rekap Audit Konten</h1>`;
  if (forDownload) {
    // Word butuh page-break eksplisit per konten.
    const body = sortedEntries.map((e, i) =>
      entryToHtmlBlock(e) + (i < sortedEntries.length - 1 ? "<br clear=all style='page-break-before:always'>" : '')
    ).join('');
    return heading + body;
  }
  // Untuk tampilan di layar, pemisah antar-konten cukup garis biasa.
  const body = sortedEntries.map(e => entryToHtmlBlock(e)).join('<hr style="margin:26px 0;border:none;border-top:1px solid #ddd;">');
  return heading + body;
}

function openPreviewOne() {
  if (currentId === null) { showToast('Belum ada konten yang dibuka.'); return; }
  const entry = readFormAsEntry(currentId); // preview mengikuti isi form saat ini, termasuk yang belum disimpan
  currentPreview = {
    displayHtml: entryToHtmlBlock(entry),
    downloadHtml: entryToHtmlBlock(entry),
    filename: `audit-${(entry.judul || 'konten').slice(0, 30).replace(/[^a-z0-9]+/gi, '-')}.doc`,
    printList: [entry]
  };
  document.getElementById('previewTitle').textContent = 'Preview: ' + (entry.judul || '(Tanpa judul)');
  document.getElementById('previewContent').innerHTML = currentPreview.displayHtml;
  document.getElementById('previewBg').classList.add('show');
  if (isDirty()) showToast('Preview menampilkan perubahan yang belum disimpan.');
}

function openPreviewAll() {
  if (entries.length === 0) { showToast('Belum ada konten tersimpan untuk dipreview.'); return; }
  const sorted = entries.slice().sort((a, b) => (a.updatedAt || '').localeCompare(b.updatedAt || ''));
  currentPreview = {
    displayHtml: buildAllHtml(sorted, false),
    downloadHtml: buildAllHtml(sorted, true),
    filename: 'audit-konten-semua.doc',
    printList: sorted
  };
  document.getElementById('previewTitle').textContent = `Preview: semua konten (${sorted.length})`;
  document.getElementById('previewContent').innerHTML = currentPreview.displayHtml;
  document.getElementById('previewBg').classList.add('show');
}

function closePreview() {
  document.getElementById('previewBg').classList.remove('show');
}

function downloadFromPreview() {
  if (!currentPreview) return;
  downloadDoc(currentPreview.filename, currentPreview.downloadHtml);
  showToast('File Word diunduh.');
}

function printFromPreview() {
  if (!currentPreview) return;

  const element = document.getElementById('previewContent');
  
  const title = document.getElementById('previewTitle').textContent.replace('Preview: ', '');
  const filename = `audit-${title.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.pdf`;

  const opt = {
    margin:       [10, 10, 10, 10], 
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  showToast('Sedang membuat PDF...');

  html2pdf().set(opt).from(element).save();
}
