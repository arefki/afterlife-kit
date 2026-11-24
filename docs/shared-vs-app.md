# Bagian bersama vs khusus aplikasi

Dokumen ini menjawab pertanyaan juri yang paling mungkin muncul untuk
kategori Skeleton Crew: *"Apakah dua aplikasinya benar-benar berbeda, atau
hanya satu aplikasi dengan dua tema?"*

## Dipakai ulang 100% dari template (kode bersama)

| Modul | Tanggung jawab | Dipakai app 1 | Dipakai app 2 |
|---|---|---|---|
| `template/src/csv.js` | Parser CSV (kutip, koma, baris kosong) | ✅ | ✅ |
| `template/src/store.js` | localStorage + hapus data | ✅ | ✅ |
| `template/src/ui.js` | Dropzone, tabel, banner error, toast, unduh | ✅ | ✅ |
| `template/src/app.js` | Orkestrasi impor → validasi → olah → ekspor | ✅ | ✅ |
| `template/src/styles.css` | Tema dasar + layout | ✅ | ✅ (aksen warna beda) |

## Khusus tiap aplikasi (tidak dipakai bersama)

| Aspek | Deadline Necromancer | Receipt Revenant |
|---|---|---|
| **Pengguna** | Mahasiswa | Siapa saja yang mengatur uang |
| **Input** | Tugas + mata kuliah + deadline | Tanggal + deskripsi + jumlah uang |
| **Logika domain** | Status deadline (lewat / <3 hari / aman), urut tanggal | Kategorisasi kata kunci, agregasi per kategori/bulan |
| **Output** | File kalender `.ics` (RFC 5545) | CSV bersih + ringkasan anggaran |
| **Validasi khas** | Tanggal deadline valid? | Jumlah berupa angka? |
| **File domain** | `apps/deadline-necromancer/src/domain.js` | `apps/receipt-revenant/src/domain.js` |

## Bukti pemakaian ulang

Kedua `index.html` app mengimpor `createApp` yang sama dari
`../../template/src/app.js` dan hanya berbeda pada `app-config.js` +
`domain.js` mereka sendiri. Tidak ada kode template yang diduplikasi ke
dalam folder app.
