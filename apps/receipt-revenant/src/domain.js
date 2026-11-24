// domain.js — Receipt Revenant: logika khusus app 2.
// Kategorisasi pengeluaran + agregasi + ekspor CSV bersih.

import { toCSV } from "../../../template/src/csv.js";

// Kategorisasi sederhana berbasis kata kunci (tanpa AI, tanpa API).
const KEYWORDS = [
  { category: "Makanan", words: ["makan", "warteg", "kopi", "kafe", "restoran", "gofood", "grabfood", "snack", "minum"] },
  { category: "Transport", words: ["ojek", "grab", "gojek", "bensin", "parkir", "bus", "kereta", "tol"] },
  { category: "Belanja", words: ["toko", "market", "indomaret", "alfamart", "shopee", "tokopedia", "baju"] },
  { category: "Tagihan", words: ["listrik", "pulsa", "internet", "wifi", "air", "sewa", "kos"] },
  { category: "Hiburan", words: ["nonton", "bioskop", "game", "spotify", "netflix", "konser"] },
];

export function categorize(description) {
  const d = String(description).toLowerCase();
  for (const { category, words } of KEYWORDS) {
    if (words.some((w) => d.includes(w))) return category;
  }
  return "Lainnya";
}

export function transformReceipts(rows) {
  return rows.map((r) => ({
    ...r,
    jumlah: Number(r.jumlah),
    kategori: categorize(r.deskripsi),
    bulan: String(r.tanggal).slice(0, 7), // YYYY-MM
  }));
}

/** Ringkasan total per kategori. */
export function summarizeByCategory(rows) {
  const totals = {};
  for (const r of rows) totals[r.kategori] = (totals[r.kategori] ?? 0) + r.jumlah;
  return Object.entries(totals)
    .map(([kategori, total]) => ({ kategori, total }))
    .sort((a, b) => b.total - a.total);
}

/** Ringkasan per (bulan, deskripsi) — R10 penuh.
 * Satu baris per grup (bulan + deskripsi) dengan total dan jumlah transaksi.
 * Urutan: bulan menaik, lalu total terbesar, lalu deskripsi (deterministik). */
export function summarizeByMonthDescription(rows) {
  const groups = {};
  for (const r of rows) {
    const key = `${r.bulan}\0${r.deskripsi}`;
    if (!groups[key]) {
      groups[key] = { bulan: r.bulan, deskripsi: r.deskripsi, total: 0, count: 0 };
    }
    groups[key].total += r.jumlah;
    groups[key].count += 1;
  }
  return Object.values(groups).sort((a, b) =>
    a.bulan.localeCompare(b.bulan) || b.total - a.total || a.deskripsi.localeCompare(b.deskripsi));
}

/** Ekspor CSV bersih: kolom ternormalisasi + kategori hasil olahan. */
export function toCleanCSV(rows) {
  return toCSV(
    ["tanggal", "deskripsi", "jumlah", "kategori", "bulan"],
    rows.map((r) => ({
      tanggal: r.tanggal,
      deskripsi: r.deskripsi,
      jumlah: r.jumlah,
      kategori: r.kategori,
      bulan: r.bulan,
    }))
  );
}
