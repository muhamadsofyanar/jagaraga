# JagaRaga — Paket Fitur Lengkap Tanpa Backend

## Tujuan

Melengkapi JagaRaga dalam satu pembaruan besar agar pengguna tidak perlu melakukan redeploy berulang untuk fitur inti. Program latihan tetap hanya **Mode 1 — Adaptasi Tubuh**; pekerjaan ini menambah pengalaman aplikasi, bukan mode latihan baru.

Pembaruan harus mempertahankan sifat JagaRaga sebagai PWA pribadi, offline-first, tanpa akun, tanpa backend, tanpa analitik, dan tanpa biaya layanan tambahan.

## Prinsip Produk

- Semua fitur tersedia segera setelah pembaruan; tidak ada penguncian berdasarkan hari atau progres.
- Halaman Hari Ini tetap sederhana meskipun kemampuan aplikasi bertambah.
- Data kesehatan dan latihan hanya tersimpan di browser perangkat.
- Aplikasi memberikan saran konservatif, bukan diagnosis atau keputusan medis.
- Ilustrasi lokal adalah media utama; video resmi pihak ketiga tetap opsional, membutuhkan internet, dan hanya dimuat setelah persetujuan.
- Fitur inti harus tetap berguna ketika perangkat offline.

## Navigasi Utama

Navigasi bawah berisi lima tujuan:

1. **Hari Ini** — sesi Mode 1, ringkasan kondisi tubuh, dan tindakan terdekat.
2. **Pustaka** — seluruh gerakan dengan pencarian dan filter.
3. **Sesi Bebas** — penyusun dan pelaksana latihan pilihan pengguna.
4. **Progres** — statistik, kalender konsistensi, tren jurnal, dan evaluasi mingguan.
5. **Lainnya** — Jurnal, Tahajjud, Pengaturan, cadangan, instalasi, dan bantuan.

Navigasi menggunakan label teks dan ikon, mendukung lebar minimum 320 piksel, serta tidak menutupi konten atau kontrol sesi.

## 1. Pustaka Gerakan

Pustaka menampilkan seluruh 22 gerakan Mode 1 sebagai kartu yang dapat dibuka langsung tanpa memulai sesi terjadwal.

Kemampuan:

- pencarian berdasarkan nama dan tujuan;
- filter kategori: pemanasan, kekuatan, kardio, keseimbangan, pendinginan, dan pemulihan;
- indikator alat yang diperlukan;
- detail berisi ilustrasi dua fase, tujuan, langkah, pola napas, modifikasi pemula, kesalahan umum, kondisi berhenti, dan video resmi bila tersedia;
- keadaan kosong yang jelas bila pencarian atau filter tidak menghasilkan gerakan;
- seluruh detail selain video tersedia offline.

## 2. Sesi Bebas

Pengguna dapat membuat sesi sendiri dari Pustaka tanpa mengubah jadwal Mode 1.

Alur:

1. Pilih satu atau lebih gerakan.
2. Susun urutan gerakan.
3. Tentukan target per gerakan: repetisi, detik, atau menit.
4. Beri nama sesi atau gunakan nama otomatis.
5. Simpan sebagai templat opsional.
6. Jalankan dengan `SessionRunner` yang sama seperti sesi Mode 1.
7. Simpan hasil ke riwayat dengan sumber `free` agar dapat dibedakan dari sumber `program`.

Batasan:

- templat harus memiliki minimal satu gerakan;
- angka harus bulat dan positif;
- satu gerakan hanya menggunakan satu jenis target;
- keluar di tengah sesi tetap menyimpan posisi agar dapat dilanjutkan;
- menghapus templat tidak menghapus riwayat sesi yang pernah diselesaikan.

## 3. Jurnal Tubuh

Satu entri jurnal per tanggal, dapat dibuat atau diperbarui.

Bidang:

- energi: skala 1–5;
- nyeri/kaku: skala 0–10;
- kualitas tidur: skala 1–5;
- stres: skala 1–5;
- napas/engap: `tidak`, `saat latihan`, atau `saat aktivitas biasa`;
- catatan bebas maksimal 500 karakter;
- waktu pembaruan otomatis.

Riwayat jurnal ditampilkan per tanggal. Aplikasi tidak menyimpulkan penyakit dari nilai jurnal.

## 4. Evaluasi Mingguan Otomatis

Evaluasi menggunakan tujuh hari terakhir dari sesi dan jurnal. Hasilnya selalu salah satu dari:

- **Pertahankan ritme** — latihan belum cukup konsisten untuk ditambah;
- **Lanjut perlahan** — konsistensi dan pemulihan mendukung kenaikan kecil;
- **Ringankan minggu ini** — penyelesaian rendah, nyeri meningkat, tidur buruk, atau energi rendah;
- **Periksa gejala dahulu** — terdapat engap saat aktivitas biasa atau catatan gejala bahaya.

Aturan bersifat deterministik dan transparan. Kartu hasil menjelaskan data apa yang memicu saran. Evaluasi tidak otomatis mengubah minggu aktif; pengguna tetap memutuskan.

## 5. Statistik dan Progres

Progres menampilkan:

- total sesi selesai;
- total menit latihan;
- sesi program dibanding sesi bebas;
- distribusi kategori latihan berdasarkan gerakan yang selesai;
- kalender konsistensi;
- tren 14 dan 30 hari untuk energi, tidur, nyeri/kaku, dan stres;
- ringkasan evaluasi mingguan terbaru;
- pencapaian lokal untuk sesi pertama, tiga sesi dalam satu minggu, tujuh hari aktif, 150 menit kumulatif, dan templat bebas pertama.

Grafik harus memiliki ringkasan teks agar informasi tidak bergantung pada warna atau bentuk visual saja.

## 6. Rutinitas Tahajjud

Fitur Tahajjud membantu persiapan fisik dan kebiasaan tidur tanpa membuat klaim ibadah atau medis.

Pengaturan:

- aktif/nonaktif;
- target waktu tidur;
- target waktu bangun;
- hari pilihan;
- pengingat persiapan tidur;
- pengingat bangun;
- mobilitas singkat sebelum tidur atau setelah bangun.

Catatan harian:

- tidur sesuai target;
- berhasil bangun;
- melaksanakan tahajjud;
- tubuh terasa siap: skala 1–5;
- catatan maksimal 280 karakter.

Mobilitas singkat menggunakan gerakan ringan yang sudah ada: putaran bahu, buka dada, cat–cow berdiri, lingkar pinggul, pergelangan kaki, dan napas santai. Tidak ada latihan berat menjelang tidur.

## 7. Pengingat

### Kalender HP

Aplikasi membuat berkas `.ics` lokal untuk:

- jadwal latihan mingguan;
- persiapan tidur;
- target bangun tahajjud.

Pengguna memilih tanggal mulai dan zona waktu mengikuti perangkat. Berkas tidak dikirim ke server.

### Notifikasi Browser

- izin diminta hanya setelah pengguna menekan tombol yang menjelaskan manfaat dan keterbatasan;
- tersedia tombol uji notifikasi;
- ketika aplikasi terbuka, pengingat terjadwal dapat ditampilkan;
- aplikasi tidak menjanjikan notifikasi ketika PWA tertutup;
- penolakan izin tidak mengurangi fungsi kalender atau aplikasi lain.

## 8. Data, Migrasi, dan Cadangan

IndexedDB dinaikkan versinya dan menambah tabel untuk:

- `journalEntries`;
- `freeSessionTemplates`;
- `tahajjudEntries`;
- pengaturan pengingat dan tahajjud di `settings`.

Riwayat sesi mendapat metadata sumber `program | free` dan daftar hasil gerakan yang dibutuhkan statistik kategori.

Cadangan JSON memakai format baru dengan versi eksplisit. Impor harus:

- menerima cadangan versi lama yang berisi pengaturan dan sesi;
- memigrasikan bidang yang belum ada ke nilai default;
- memvalidasi seluruh data sebelum transaksi tulis;
- tidak mengubah data lama bila validasi atau transaksi gagal;
- menampilkan jumlah pengaturan, sesi, jurnal, templat, dan catatan tahajjud yang dipulihkan.

## 9. Offline dan Pembaruan

- Semua kode, gaya, ikon, dan 22 ilustrasi disajikan dari origin JagaRaga.
- Service worker menggunakan cache versi baru dan menghapus cache lama saat aktivasi.
- Navigasi memakai jaringan terlebih dahulu dengan fallback offline.
- Aset lokal memakai cache terlebih dahulu.
- Permintaan YouTube atau origin pihak ketiga tidak dicegat atau disimpan oleh service worker.
- Halaman bantuan menjelaskan pemasangan PWA, pembaruan aplikasi, mode offline, dan risiko menghapus data situs.

## 10. Pengaturan dan Aksesibilitas

Pengaturan mencakup:

- tema sistem, terang, dan gelap;
- minggu Mode 1 aktif;
- izin video;
- izin dan uji notifikasi;
- jadwal latihan;
- konfigurasi tahajjud;
- ekspor/impor;
- hapus seluruh data dengan konfirmasi teks;
- informasi versi aplikasi.

Antarmuka harus:

- dapat digunakan dengan keyboard;
- memiliki nama aksesibel untuk ikon dan kontrol;
- mempertahankan target sentuh minimal 44×44 piksel;
- menghormati `prefers-reduced-motion`;
- tidak menyampaikan status hanya melalui warna;
- menyediakan pesan kesalahan di dekat kontrol yang bermasalah.

## Penanganan Kesalahan

- Gambar gagal: tampilkan fallback nama gerakan; instruksi dan kontrol tetap tersedia.
- Video gagal/offline: tampilkan pesan dan tautan sumber asli.
- Penyimpanan gagal: pertahankan data di layar dan tawarkan coba lagi.
- Impor tidak valid: jangan menulis sebagian data.
- Ekspor kalender gagal: tampilkan instruksi manual jadwal.
- Notifikasi tidak didukung/ditolak: arahkan ke kalender `.ics`.
- Data statistik kosong: tampilkan tindakan awal yang relevan, bukan grafik kosong.

## Pengujian dan Kriteria Penerimaan

Tes otomatis wajib mencakup:

- pencarian dan filter 22 gerakan;
- detail pustaka selalu memiliki ilustrasi;
- validasi dan penyimpanan templat sesi bebas;
- pelaksanaan sesi bebas serta metadata riwayat;
- satu entri jurnal per tanggal dan validasi batas nilai;
- seluruh cabang evaluasi mingguan;
- agregasi statistik dan ringkasan teks;
- penyimpanan pengaturan/catatan tahajjud;
- pembentukan `.ics` dengan zona waktu dan jadwal yang dipilih;
- perilaku notifikasi didukung, ditolak, dan tidak tersedia;
- migrasi IndexedDB;
- impor cadangan lama dan baru secara atomik;
- service worker hanya menangani origin sendiri;
- navigasi lima tujuan pada layar HP.

Verifikasi akhir:

- seluruh tes Vitest lulus;
- ESLint lulus tanpa pengecualian baru terhadap kode fitur;
- TypeScript lulus;
- production build Vite lulus;
- pemeriksaan visual layar 320, 390, dan 520 piksel;
- ZIP bersih tidak memuat `node_modules`, `dist`, `.git`, metadata build, atau berkas lingkungan.

## Di Luar Cakupan

- mode latihan selain Mode 1;
- akun pengguna dan sinkronisasi antarperangkat;
- backend, database server, panel admin, atau analitik;
- push notification server ketika aplikasi tertutup;
- integrasi jam tangan atau sensor kebugaran;
- diagnosis medis, pengobatan, atau klaim fungsi organ/meridian;
- unggahan otomatis ke GitHub atau deploy otomatis ke Coolify.
