# Product Steering — Afterlife Kit

## Apa itu Afterlife Kit?

Template web local-first untuk alur **impor CSV → validasi → olah → ekspor**.
Satu template melahirkan dua aplikasi berbeda (Kiroween 2026, kategori Skeleton Crew):

1. **Deadline Necromancer** — bangkitkan daftar tugas kuliah dari CSV menjadi
   kalender `.ics` + daftar prioritas.
2. **Receipt Revenant** — bangkitkan CSV pengeluaran menjadi ringkasan anggaran
   + CSV bersih.

## Prinsip produk

- **Local-first, tanpa server.** Semua pemrosesan di browser. Tidak ada data
  yang meninggalkan perangkat pengguna. Tidak ada login, tidak ada API key.
- **Lean.** Nol dependensi, nol build step. Buka `index.html`, langsung jalan.
- **Jelas beda domain.** Dua aplikasi harus terasa seperti dua produk berbeda,
  bukan satu produk dengan dua tema. Logika domain, output, dan pengguna
  masing-masing berbeda — hanya fondasi (parser, UI, storage) yang dipakai ulang.
- **Ramah untuk pemula.** Pesan error harus menjelaskan *apa yang salah* dan
  *bagaimana memperbaikinya*, bukan kode error mentah.

## Pengguna sasaran

- Mahasiswa yang mengelola deadline tugas dari spreadsheet (App 1).
- Siapa saja yang ingin merapikan catatan pengeluaran tanpa aplikasi berbayar (App 2).
- Developer yang butuh template impor/ekspor CSV yang bisa dipakai ulang (template).

## Yang BUKAN tujuan proyek

- Bukan aplikasi multi-user, bukan SaaS, bukan dashboard realtime.
- Tidak ada OCR, tidak ada integrasi akun bank/kalender, tidak ada AI.
