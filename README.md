# Afterlife Kit — Kiroween 2026 (Skeleton Crew)

> Template web local-first yang "membangkitkan" data CSV yang sudah mati:
> **impor → validasi → olah → ekspor**, semuanya di browser, tanpa server,
> tanpa login, tanpa API.

Dibuat untuk [Kiroween 2026](https://kiroween.devpost.com) dengan
[Kiro](https://kiro.dev) (CLI + spec-driven development).
Kategori: **Skeleton Crew** — satu template ramping, dua aplikasi berbeda.

## Dua aplikasi dari satu template

| Aplikasi | Folder | Apa yang dilakukan |
|---|---|---|
| **Deadline Necromancer** | [`apps/deadline-necromancer/`](apps/deadline-necromancer/) | Impor CSV tugas kuliah → tandai deadline lewat/dekat → ekspor kalender `.ics` |
| **Receipt Revenant** | [`apps/receipt-revenant/`](apps/receipt-revenant/) | Impor CSV pengeluaran → kelompokkan per kategori → ringkasan anggaran + ekspor CSV bersih |

Keduanya memakai 100% kode bersama dari [`template/`](template/) (parser CSV,
penyimpanan lokal, komponen UI, orkestrasi alur) dan hanya berbeda pada
**logika domain** mereka sendiri (`src/domain.js` + `app-config.js` masing-masing).
Lihat [`docs/shared-vs-app.md`](docs/shared-vs-app.md) untuk pemetaan
bagian bersama vs khusus aplikasi.

## Cara menjalankan (tanpa install apa pun)

```bash
# Cukup buka file-nya di browser, atau jalankan server statis:
python3 -m http.server 8000
# lalu buka http://localhost:8000/apps/deadline-necromancer/
# atau    http://localhost:8000/apps/receipt-revenant/
```

Tidak ada build step, tidak ada dependensi, tidak ada kunci API.

## Struktur repo

```
.kiro/                  # steering + spec Kiro (WAJIB ada di root)
template/               # skeleton: csv.js, store.js, ui.js, app.js, styles.css
apps/
  deadline-necromancer/ # aplikasi 1 (folder terpisah, sesuai aturan Skeleton Crew)
  receipt-revenant/     # aplikasi 2 (folder terpisah)
docs/                   # catatan pemakaian Kiro, pemetaan shared-vs-app
```

## Cara memakai template untuk aplikasi baru

1. Salin `template/` ke folder baru.
2. Tulis `src/app-config.js`: kolom CSV yang diharapkan, aturan validasi,
   fungsi transformasi, dan format ekspor.
3. Tulis `src/domain.js`: logika khusus aplikasimu.
4. Selesai — parser, UI, storage, dan ekspor sudah disediakan template.

## Dibangun dengan Kiro

Proyek ini dibangun dengan Kiro CLI (spec-driven development). Artefak Kiro ada di
[`/.kiro`](.kiro/): steering files (`product.md`, `tech.md`, `structure.md`) dan
spec lengkap (`requirements.md`, `design.md`, `tasks.md`).
Lihat [`docs/kiro-usage.md`](docs/kiro-usage.md) untuk kronologi pemakaian Kiro.

## Lisensi

MIT — lihat [`LICENSE`](LICENSE).
