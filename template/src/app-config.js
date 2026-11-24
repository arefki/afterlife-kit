// app-config.js — CONTOH konfigurasi app untuk template.
// Tiap aplikasi menyalin file ini dan mengisinya dengan kontraknya sendiri.
// createApp() di app.js hanya membaca kontrak ini — ia tidak tahu soal domain.

export const appConfig = {
  name: "Contoh App",
  storageKey: "contoh-app", // kunci localStorage (unik per app)
  requiredColumns: ["nama", "nilai"], // kolom CSV yang wajib ada
  // Aliases kolom: expectedField -> array nama alternatif (untuk suggestMapping)
  columnAliases: {
    nama: ["name"],
    nilai: ["score", "value"],
  },
  // Kolom yang ditampilkan di tabel hasil:
  columns: [
    { key: "nama", label: "Nama" },
    { key: "nilai", label: "Nilai" },
  ],
  // Kembalikan string error jika baris tidak valid, atau null jika valid:
  validateRow(row) {
    if (!row.nama) return "kolom 'nama' kosong.";
    if (row.nilai === "" || Number.isNaN(Number(row.nilai))) {
      return `nilai '${row.nilai}' bukan angka.`;
    }
    return null;
  },
  // Ubah baris valid menjadi baris hasil (boleh menambah kolom turunan):
  transform(rows) {
    return rows.map((r) => ({ ...r, nilai: Number(r.nilai) }));
  },
  // Tombol ekspor yang tersedia:
  exporters: [
    {
      label: "Ekspor JSON",
      filename: "hasil.json",
      mime: "application/json",
      build: (rows) => JSON.stringify(rows, null, 2),
    },
  ],
};
