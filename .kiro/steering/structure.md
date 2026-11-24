# Structure Steering — Afterlife Kit

## Tata letak repo

```
.kiro/                          # steering + spec (wajib di root, jangan di-.gitignore)
  steering/                     # product.md, tech.md, structure.md
  specs/afterlife-kit/          # requirements.md, design.md, tasks.md
template/                       # skeleton yang dipakai ulang kedua app
  index.html                    # shell demo template
  src/
    csv.js                      # parser CSV tanpa dependensi
    store.js                    # localStorage wrapper
    ui.js                       # dropzone, tabel hasil, toast, pesan error
    app.js                      # orkestrasi: impor → validasi → olah → ekspor
    app-config.js               # CONTOH konfigurasi app (diisi tiap app)
    styles.css                  # tema dark horror + variabel warna
apps/
  deadline-necromancer/         # aplikasi 1 — folder terpisah (aturan Skeleton Crew)
    index.html
    sample.csv
    src/domain.js               # logika deadline + ekspor .ics
    src/app-config.js
  receipt-revenant/             # aplikasi 2 — folder terpisah
    index.html
    sample.csv
    src/domain.js               # logika kategori + ringkasan
    src/app-config.js
docs/                           # kiro-usage.md, shared-vs-app.md
```

## Aturan struktur

- Kode bersama HANYA di `template/src/`. Kode khusus app HANYA di
  `apps/<nama>/src/`. Jangan menduplikasi kode bersama ke dalam folder app —
  app mengimpor dari template lewat path relatif.
- Setiap app punya `sample.csv` sendiri agar juri bisa langsung mencoba tanpa
  menyiapkan data.
- Nama file dan folder memakai kebab-case; nama fungsi/menggunakan camelCase.
