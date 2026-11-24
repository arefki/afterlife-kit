# Tech Steering — Afterlife Kit

## Stack

- **HTML5 + CSS3 + JavaScript murni (ES2022, vanilla).** Tanpa framework,
  tanpa bundler, tanpa dependensi npm. Alasan: template harus *lean* dan
  langsung jalan di browser mana pun, termasuk dari `file://`.
- **Penyimpanan:** `localStorage` (data terakhir pengguna, opsional, bisa dihapus).
- **Hosting demo:** GitHub Pages (statis, gratis).
- **Target browser:** browser modern apa pun (Chrome/Firefox/Safari/Edge terbaru).

## Konvensi kode

- Satu modul = satu tanggung jawab: `csv.js` (parsing), `store.js` (storage),
  `ui.js` (komponen), `app.js` (orkestrasi), `domain.js` (logika khusus app).
- Modul ditulis sebagai ES module (`<script type="module">`).
- Fungsi murni sebisa mungkin; efek samping (DOM, storage) hanya di `app.js`/`ui.js`.
- Semua string yang tampil ke pengguna dalam Bahasa Indonesia.
- Komentar menjelaskan *kenapa*, bukan *apa*.

## Aturan keamanan & privasi

- File CSV diproses 100% di sisi klien (`FileReader`). Tidak ada `fetch` ke
  server mana pun. Tidak ada pelacak/analytics.
- Jangan pernah menyimpan data sensitif selain di `localStorage` perangkat
  pengguna sendiri, dan selalu sediakan tombol "Hapus data saya".

## Pengujian

- Uji manual end-to-end di browser untuk tiap app: impor CSV contoh →
  validasi → olah → ekspor. File CSV contoh ada di `apps/<nama>/sample.csv`.
- Uji kasus rusak: file kosong, kolom hilang, tanggal tidak valid, angka
  bukan angka — semuanya harus menghasilkan pesan error yang jelas, bukan crash.
