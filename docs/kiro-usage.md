# Kronologi pemakaian Kiro

Dokumen ini mencatat bagaimana Kiro dipakai selama pengembangan Afterlife Kit.
Aturan Kiroween: penggunaan Kiro yang tidak cukup dapat menyebabkan
diskualifikasi — jadi catat setiap sesi Kiro di sini.

> STATUS AWAL (15 Nov 2026): scaffold repo ini (struktur, steering, spec
> draf, dan kode starter) ditulis tangan oleh yanti (AI agent) SEBELUM login
> Kiro tersedia. File-file `.kiro` di sini adalah draf yang HARUS dibuat
> ulang/divalidasi lewat Kiro CLI setelah user login, agar pemakaian Kiro
> dapat dibuktikan secara sah. Jangan klaim spec ini sebagai hasil Kiro
> sebelum langkah itu dilakukan.

## Log sesi

| Tanggal | Sesi | Yang dilakukan dengan Kiro | Bukti |
|---|---|---|---|
| 2026-11-24 | 1 | Spec `afterlife-kit` dibuat ulang PENUH oleh Kiro CLI (spec mode, model `qwen3-coder-next` 0.05x): `requirements.md` (15 requirements, EARS) + `design.md` (arsitektur, komponen, 7 keputusan desain). Draf tulisan tangan sebelumnya dihapus dulu, lalu diganti hasil Kiro. | `.kiro/specs/afterlife-kit/requirements.md` (1.415 kata), `design.md` (944 kata) |
| 2026-11-24 | 2 | `tasks.md` dibuat oleh Kiro CLI (spec mode, model `qwen3-coder-next`): rencana implementasi 5 bagian dengan referensi requirement per task. | `.kiro/specs/afterlife-kit/tasks.md` (1.244 kata) |
| 2026-11-24 | 3 | Fitur parser di `template/src/csv.js` oleh Kiro CLI (model `qwen3-coder-next` 0.05x, ~85 detik): `detectDelimiter` (auto-detect `,`/`;`/tab), `parseCSV` memakai delimiter terdeteksi + field `delimiter`, `suggestMapping` (cocok case-insensitive + alias), `applyMapping` (petakan ulang baris, buang null, pertahankan `__line`). | `template/src/csv.js` (4 fungsi baru); smoke test 11/11 cek fungsi baru lolos |
| 2026-11-24 | 4 | Fitur UI oleh Kiro CLI (model `qwen3-coder-next` 0.05x, ~5,5 menit): `renderPreview` (10 baris pertama + catatan jumlah) dan `renderColumnMapper` (dropdown per field + opsi lewati) di `template/src/ui.js`; alur impor baru di `template/src/app.js` (preview → saran mapping → mapper bila perlu); `columnAliases` di ketiga `app-config.js`; div `preview` + `mapper` di ketiga `index.html`; gaya `.preview-note`/`.mapper` di `styles.css`; +2 baris ke `apps/receipt-revenant/sample.csv` (total 10, R15). | 10 file diubah; `node --check` lolos semua; smoke 17/17 tetap lolos |
| 2026-11-24 | — | Perbaikan alur `app.js` oleh yanti (BUKAN Kiro): output sesi 4 menaruh SELURUH pemrosesan di dalam `if (els.mapper)` (app diam total bila elemen mapper tidak ada) dan selalu menampilkan mapper walau semua kolom terpetakan. Diperbaiki: pemrosesan jalan tanpa mapper; mapper hanya muncul bila ada kolom belum terpetakan; error parse diteruskan di kedua jalur; hapus variabel/parameter mati (`currentHeaders`, `current`). | `template/src/app.js` (handler drop ditulis ulang), `template/src/ui.js` (1 baris mati dihapus) |
| 2026-11-24 | — | Verifikasi (BUKAN oleh Kiro): smoke test diperluas 17 → 42 cek (delimiter, mapping, alias, App 2 end-to-end modul: parse 10 baris → kategorisasi → total per kategori Rp651.000 → CSV bersih) — 42/42 lolos. Uji browser sungguhan (Playwright + Chromium lokal, localhost): 25/25 lolos — preview 10/12 baris, mapper muncul hanya bila perlu + perbaikan manual jalan, semicolon terdeteksi, App 2 tampil + terkategorisasi, template demo jalan. Satu-satunya 404 adalah `/favicon.ico` (request otomatis browser, bukan resource app). | `tests/smoke.mjs` (42 passed, 0 failed); `/tmp/kiroween-browser-check.cjs` (25/25 efektif) |
| 2026-11-24 | — | Wiring R10 tabel ringkasan oleh yanti (BUKAN Kiro): `renderSummary` di `template/src/ui.js` (tabel label+total + grand total di footer, format Rp id-ID, escape HTML); hook opsional `summarize` di kontrak app (`template/src/app.js` — render setelah proses + saat muat data tersimpan, dikosongkan saat clear/tanpa baris valid/tanpa pemetaan); `summarize()` di `apps/receipt-revenant/src/app-config.js` yang memakai `summarizeByCategory` (sudah ada, terverifikasi di level modul); div `#summary` di App 2 `index.html`; gaya tfoot di `styles.css`. App 1 tidak tersentuh (tanpa `summarize`, tanpa div summary). | smoke 54/54 (42 lama + 12 baru); uji browser Playwright `/tmp/kiroween-r10-check.cjs` 12/12 (localhost) |

Catatan jujur: spec (requirements/design/tasks) adalah hasil Kiro 100%. Kode
template + kedua app saat ini masih scaffold tulisan tangan yang diverifikasi
berfungsi — implementasi/penyempurnaan kode lewat Kiro agent direncanakan di
Minggu 2 (termasuk fitur spec yang belum ada di scaffold: preview 10 baris,
pemetaan kolom manual, pencocokan header case-insensitive).

UPDATE 2026-11-24 (Minggu 2): keempat fitur gap spec kini diimplementasikan
OLEH KIRO — delimiter auto-detect, pencocokan header case-insensitive +
alias, pemetaan kolom manual (UI), dan preview 10 baris. Yang masih tulisan
tangan yanti: scaffold awal (parser dasar, domain kedua app, store, tema)
dan perbaikan alur `app.js` sesi 4 (lihat baris log di atas). Kode Kiro
untuk kedua sesi ini diverifikasi penuh lewat smoke test + uji browser.

UPDATE 2026-11-24 (R10): wiring tabel ringkasan per kategori di App 2
(`renderSummary` + hook `summarize` + div `#summary`) juga dikerjakan
yanti, BUKAN Kiro — `summarizeByCategory` sendiri adalah bagian dari
scaffold domain tulisan tangan yang sudah terverifikasi di level modul.
Satu-satunya bagian R10 yang belum diwujudkan: kolom Bulan dan Jumlah
transaksi pada tabel ringkasan (spec R10 menyebut tabel Month | Description
| Total | Count; tabel saat ini Kategori | Total + grand total).

UPDATE 2026-11-24 (R10 penuh): gap di atas kini ditutup — juga oleh yanti,
BUKAN Kiro. Tabel kedua "Ringkasan per Bulan & Deskripsi" (Bulan | Deskripsi
| Total | Count + grand total) ditambahkan di bawah tabel kategori, dengan
agregasi baru `summarizeByMonthDescription` di domain App 2, komponen
`renderMonthlySummary` di template, dan hook kontrak kedua
`summarizeMonthly` + div `#summaryMonthly`. `summarizeByCategory` tidak
diubah. R10 kini terpenuhi penuh: total per bulan, total per deskripsi,
tabel Month | Description | Total | Count, dan grand total — diverifikasi
lewat smoke test 71/71 + uji browser 17/17 (termasuk pengelompokan lintas
bulan dengan deskripsi berulang).

## Cara Kiro dipakai

- **Spec-driven development:** requirements → design → tasks di `.kiro/specs/`,
  lalu implementasi per task oleh agent Kiro.
- **Steering files:** `.kiro/steering/product.md`, `tech.md`, `structure.md`
  memberi konteks proyek ke setiap sesi agent.
- **Kiro CLI** (`kiro-cli` 3.3.0) di VM Linux; alternatif: Kiro Web
  (app.kiro.dev) atau Kiro IDE.
