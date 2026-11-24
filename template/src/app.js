// app.js — orkestrasi alur impor → validasi → olah → ekspor.
// File ini TIDAK tahu apa-apa soal domain: semua yang spesifik app datang
// dari appConfig (lihat app-config.js). Inilah inti "skeleton"-nya.

import { parseCSV, suggestMapping, applyMapping } from "./csv.js";
import { save, load, clearAll } from "./store.js";
import { mountDropzone, renderTable, renderPreview, renderColumnMapper, renderSummary, renderMonthlySummary, showErrors, toast, download } from "./ui.js";

/**
 * @param {object} appConfig — kontrak app:
 *   { name, storageKey, requiredColumns, columnAliases, columns, validateRow, transform, exporters, summarize?, summarizeMonthly? }
 *   summarize (opsional): rows => { title, labelHeader, rows: [{ label, total }] } — dirender ke els.summary (R10).
 *   summarizeMonthly (opsional): rows => { title, rows: [{ bulan, deskripsi, total, count }] } — dirender ke els.summaryMonthly (R10 penuh).
 * @param {object} els — elemen DOM: { dropzone, errors, results, exportBar, clearBtn, preview, mapper, summary?, summaryMonthly? }
 */
export function createApp(appConfig, els) {
  let currentRows = [];

  // Render ringkasan bila app menyediakannya (summarize opsional di kontrak).
  function renderSummarySection() {
    if (els.summary && typeof appConfig.summarize === "function") {
      renderSummary(els.summary, appConfig.summarize(currentRows));
    }
    if (els.summaryMonthly && typeof appConfig.summarizeMonthly === "function") {
      renderMonthlySummary(els.summaryMonthly, appConfig.summarizeMonthly(currentRows));
    }
  }

  function clearSummarySection() {
    if (els.summary) els.summary.innerHTML = "";
    if (els.summaryMonthly) els.summaryMonthly.innerHTML = "";
  }

  function handleValidatedData(rows, initialErrors = []) {
    const allErrors = [...initialErrors];

    // Validasi per baris (aturan domain)
    const valid = [];
    for (const row of rows) {
      const err = appConfig.validateRow(row);
      if (err) allErrors.push(`Baris ${row.__line}: ${err}`);
      else valid.push(row);
    }

    showErrors(els.errors, allErrors);
    if (!valid.length) {
      if (els.results) {
        els.results.innerHTML = "<p>Tidak ada baris valid untuk diproses.</p>";
      }
      if (els.exportBar) {
        els.exportBar.innerHTML = "";
      }
      clearSummarySection();
      return;
    }

    currentRows = appConfig.transform(valid);
    save(appConfig.storageKey, currentRows);
    renderTable(els.results, appConfig.columns, currentRows);
    renderSummarySection();
    renderExportButtons();
    toast(`✅ ${currentRows.length} baris berhasil diproses.`);
  }

  function renderExportButtons() {
    els.exportBar.innerHTML = "";
    for (const exp of appConfig.exporters) {
      const btn = document.createElement("button");
      btn.textContent = exp.label;
      btn.addEventListener("click", () => {
        download(exp.filename, exp.build(currentRows), exp.mime);
        toast(`📥 ${exp.filename} diunduh.`);
      });
      els.exportBar.appendChild(btn);
    }
  }

  mountDropzone(els.dropzone, async (file) => {
    const text = await file.text();
    const { headers, rows, errors } = parseCSV(text);

    // Sarankan pemetaan kolom (cocok persis case-insensitive, lalu alias).
    const mapping = suggestMapping(headers, appConfig.requiredColumns, appConfig.columnAliases || {});
    const missingKeys = appConfig.requiredColumns.filter((k) => mapping[k] === null);

    // Preview 10 baris pertama langsung setelah parse.
    if (els.preview) {
      renderPreview(els.preview, headers, rows, 10);
    }

    // Semua kolom wajib terpetakan: langsung proses, tanpa mapper.
    if (missingKeys.length === 0) {
      if (els.mapper) els.mapper.innerHTML = ""; // bersihkan mapper dari impor sebelumnya
      const mappedRows = applyMapping(rows, mapping);
      handleValidatedData(mappedRows, errors);
      if (els.preview) {
        renderPreview(els.preview, appConfig.requiredColumns, mappedRows, 10);
      }
      return;
    }

    // Ada kolom belum terpetakan: tampilkan mapper manual bila tersedia.
    if (els.mapper) {
      renderColumnMapper(els.mapper, headers, appConfig.requiredColumns, mapping, (newMapping) => {
        const newMissing = appConfig.requiredColumns.filter((k) => newMapping[k] === null);
        if (newMissing.length === 0) {
          // Semua kolom wajib kini terpetakan: terapkan dan proses.
          const mappedRows = applyMapping(rows, newMapping);
          handleValidatedData(mappedRows, errors);
          if (els.preview) {
            renderPreview(els.preview, appConfig.requiredColumns, mappedRows, 10);
          }
        } else {
          // Masih ada kolom yang belum dipetakan.
          showErrors(els.errors, [`Kolom wajib belum dipetakan: ${newMissing.join(", ")}. Silakan petakan terlebih dahulu.`]);
          if (els.results) els.results.innerHTML = "";
          if (els.exportBar) els.exportBar.innerHTML = "";
          clearSummarySection();
        }
      });
    }

    // Beri tahu kolom mana yang belum terpetakan (mapper memperbaikinya).
    const allErrors = [...errors];
    allErrors.unshift(`Kolom wajib tidak ditemukan atau belum dipetakan: ${missingKeys.join(", ")}.`);
    showErrors(els.errors, allErrors);
  });

  if (els.clearBtn) {
    els.clearBtn.addEventListener("click", () => {
      clearAll();
      currentRows = [];
      if (els.results) {
        els.results.innerHTML = "";
      }
      if (els.exportBar) {
        els.exportBar.innerHTML = "";
      }
      if (els.preview) {
        els.preview.innerHTML = "";
      }
      if (els.mapper) {
        els.mapper.innerHTML = "";
      }
      clearSummarySection();
      showErrors(els.errors, []);
      toast("🗑️ Data saya sudah dihapus dari perangkat ini.");
    });
  }

  // Muat hasil terakhir (jika ada)
  const saved = load(appConfig.storageKey, []);
  if (saved.length) {
    currentRows = saved;
    renderTable(els.results, appConfig.columns, currentRows);
    renderSummarySection();
    renderExportButtons();
  }
}
