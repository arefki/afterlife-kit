// ui.js — komponen UI bersama (dropzone, tabel, banner error, toast).
// Semua teks tampil dalam Bahasa Indonesia.

/** Pasang dropzone: drag-and-drop + klik pilih file. onFile menerima File. */
export function mountDropzone(el, onFile) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".csv,text/csv";
  input.hidden = true;
  el.appendChild(input);
  el.addEventListener("click", () => input.click());
  el.addEventListener("dragover", (e) => { e.preventDefault(); el.classList.add("dragover"); });
  el.addEventListener("dragleave", () => el.classList.remove("dragover"));
  el.addEventListener("drop", (e) => {
    e.preventDefault();
    el.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  });
  input.addEventListener("change", () => {
    if (input.files[0]) onFile(input.files[0]);
    input.value = "";
  });
}

/** Render tabel hasil. columns: [{ key, label }]. */
export function renderTable(el, columns, rows) {
  if (!rows.length) { el.innerHTML = "<p>Tidak ada data untuk ditampilkan.</p>"; return; }
  const thead = columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join("");
  const tbody = rows.map((r) => {
    const cls = r.__status ? ` class="status-${r.__status}"` : "";
    return `<tr${cls}>${columns.map((c) => `<td>${escapeHtml(r[c.key] ?? "")}</td>`).join("")}</tr>`;
  }).join("");
  el.innerHTML = `<table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`;
}

/** Render preview: tabel berisi limit baris pertama saja, plus catatan jumlah baris. */
export function renderPreview(el, headers, rows, limit = 10) {
  if (!rows.length) {
    el.innerHTML = "<p>Tidak ada data untuk ditampilkan.</p>";
    return;
  }
  const displayRows = rows.slice(0, limit);
  const thead = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const tbody = displayRows.map((r) => {
    return `<tr>${headers.map((h) => `<td>${escapeHtml(r[h] ?? "")}</td>`).join("")}</tr>`;
  }).join("");
  const total = rows.length;
  const shown = displayRows.length;
  el.innerHTML = `<table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`;
  const note = document.createElement("p");
  note.className = "preview-note";
  note.textContent = `Menampilkan ${shown} dari ${total} baris.`;
  el.appendChild(note);
}

/** Render pemetaan kolom manual. Tiap expectedField punya dropdown ke header asli atau lewati. */
export function renderColumnMapper(el, headers, expectedFields, suggestedMapping, onChange) {
  if (!expectedFields.length) {
    el.innerHTML = "<p>Tidak ada kolom yang perlu dipetakan.</p>";
    return;
  }
  const options = ["", ...headers];
  const optionHtml = options.map((h) => {
    const label = h === "" ? "Lewati kolom ini" : escapeHtml(h);
    return `<option value="${escapeHtml(h)}">${label}</option>`;
  }).join("");

  let html = `<div class="mapper">`;
  for (const field of expectedFields) {
    html += `<div class="mapper-row">
      <label for="mapper-${escapeHtml(field)}">${escapeHtml(field)}</label>
      <select id="mapper-${escapeHtml(field)}" data-field="${escapeHtml(field)}">${optionHtml}</select>
    </div>`;
  }
  html += `</div>`;

  el.innerHTML = html;

  const selects = el.querySelectorAll("select");
  selects.forEach((select) => {
    select.value = suggestedMapping[select.dataset.field] ?? "";
    select.addEventListener("change", () => {
      const mapping = {};
      selects.forEach((s) => {
        const val = s.value === "" ? null : s.value;
        mapping[s.dataset.field] = val;
      });
      onChange(mapping);
    });
  });
}

/** Render tabel ringkasan: satu baris per label + total, plus grand total di footer.
 * summary: { title, labelHeader, rows: [{ label, total }] }.
 * Kosong/null: elemen dikosongkan. Total diformat Rp (id-ID). */
export function renderSummary(el, summary) {
  if (!summary || !summary.rows.length) { el.innerHTML = ""; return; }
  const fmt = (n) => `Rp${Number(n).toLocaleString("id-ID")}`;
  const grandTotal = summary.rows.reduce((a, r) => a + r.total, 0);
  const tbody = summary.rows.map((r) =>
    `<tr><td>${escapeHtml(r.label)}</td><td>${fmt(r.total)}</td></tr>`).join("");
  el.innerHTML = `<h2>${escapeHtml(summary.title)}</h2>`
    + `<table class="summary-table"><thead><tr><th>${escapeHtml(summary.labelHeader)}</th><th>Total (Rp)</th></tr></thead>`
    + `<tbody>${tbody}</tbody>`
    + `<tfoot><tr><td><strong>Total</strong></td><td><strong>${fmt(grandTotal)}</strong></td></tr></tfoot></table>`;
}

/** Render tabel ringkasan bulanan (R10 penuh): Bulan | Deskripsi | Total | Jumlah.
 * summary: { title, rows: [{ bulan, deskripsi, total, count }] }.
 * Kosong/null: elemen dikosongkan. Total diformat Rp (id-ID).
 * Footer: grand total + total jumlah transaksi. */
export function renderMonthlySummary(el, summary) {
  if (!summary || !summary.rows.length) { el.innerHTML = ""; return; }
  const fmt = (n) => `Rp${Number(n).toLocaleString("id-ID")}`;
  const grandTotal = summary.rows.reduce((a, r) => a + r.total, 0);
  const grandCount = summary.rows.reduce((a, r) => a + r.count, 0);
  const tbody = summary.rows.map((r) =>
    `<tr><td>${escapeHtml(r.bulan)}</td><td>${escapeHtml(r.deskripsi)}</td><td>${fmt(r.total)}</td><td>${r.count}</td></tr>`).join("");
  el.innerHTML = `<h2>${escapeHtml(summary.title)}</h2>`
    + `<table class="summary-table"><thead><tr><th>Bulan</th><th>Deskripsi</th><th>Total (Rp)</th><th>Jumlah</th></tr></thead>`
    + `<tbody>${tbody}</tbody>`
    + `<tfoot><tr><td><strong>Total</strong></td><td></td><td><strong>${fmt(grandTotal)}</strong></td><td><strong>${grandCount}</strong></td></tr></tfoot></table>`;
}

/** Tampilkan daftar error (nomor baris + alasan). */
export function showErrors(el, errors) {
  if (!errors.length) { el.innerHTML = ""; el.hidden = true; return; }
  el.hidden = false;
  el.innerHTML = `<strong>⚠️ ${errors.length} masalah ditemukan:</strong><ul>${
    errors.map((e) => `<li>${escapeHtml(e)}</li>`).join("")
  }</ul>`;
}

/** Toast singkat (hilang sendiri setelah 3 detik). */
export function toast(message) {
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.textContent = message;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 3000);
}

/** Unduh string sebagai file. */
export function download(filename, content, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
