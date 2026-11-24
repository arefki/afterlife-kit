// app-config.js — Receipt Revenant (app 2).
// Kontrak app untuk createApp() dari template.

import { transformReceipts, toCleanCSV, summarizeByCategory, summarizeByMonthDescription } from "./domain.js";

export const appConfig = {
  name: "Receipt Revenant",
  storageKey: "receipt-revenant",
  requiredColumns: ["tanggal", "deskripsi", "jumlah"],
  // Aliases kolom: expectedField -> array nama alternatif (untuk suggestMapping)
  columnAliases: {
    tanggal: ["date", "tgl"],
    deskripsi: ["description", "keterangan"],
    jumlah: ["amount", "nominal", "nilai"],
  },
  columns: [
    { key: "tanggal", label: "Tanggal" },
    { key: "deskripsi", label: "Deskripsi" },
    { key: "jumlah", label: "Jumlah (Rp)" },
    { key: "kategori", label: "Kategori" },
  ],
  validateRow(row) {
    if (!row.tanggal) return "kolom 'tanggal' kosong.";
    const d = new Date(row.tanggal);
    if (Number.isNaN(d.getTime())) {
      return `tanggal '${row.tanggal}' bukan tanggal yang valid (gunakan format YYYY-MM-DD).`;
    }
    if (!row.deskripsi) return "kolom 'deskripsi' kosong.";
    if (row.jumlah === "" || Number.isNaN(Number(row.jumlah))) {
      return `jumlah '${row.jumlah}' bukan angka.`;
    }
    return null;
  },
  transform: transformReceipts,
  // Ringkasan per kategori (R10): label + total, diurutkan dari yang terbesar.
  // Opsional di kontrak app — app tanpa summarize tidak menampilkan ringkasan.
  summarize(rows) {
    return {
      title: "Ringkasan per Kategori",
      labelHeader: "Kategori",
      rows: summarizeByCategory(rows).map(({ kategori, total }) => ({ label: kategori, total })),
    };
  },
  // Ringkasan per bulan & deskripsi (R10 penuh): Bulan | Deskripsi | Total | Jumlah.
  // Opsional di kontrak app — app tanpa summarizeMonthly tidak menampilkan tabel ini.
  summarizeMonthly(rows) {
    return {
      title: "Ringkasan per Bulan & Deskripsi",
      rows: summarizeByMonthDescription(rows),
    };
  },
  exporters: [
    {
      label: "📄 Ekspor CSV bersih",
      filename: "pengeluaran-bersih.csv",
      mime: "text/csv",
      build: toCleanCSV,
    },
  ],
};
