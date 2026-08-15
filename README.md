# JagaRaga

JagaRaga adalah PWA mobile-first untuk menjalankan **Mode 1 — Adaptasi Tubuh** dan rutinitas pendukungnya. Aplikasi tidak memakai akun, backend, atau database server; seluruh progres tersimpan di browser perangkat.

## Isi aplikasi

Navigasi utama terdiri dari lima tab:

- **Hari Ini:** rencana Mode 1, pengaturan gerakan sebelum sesi, mulai/lanjutkan sesi, dan ringkasan kondisi tubuh.
- **Pustaka:** 60 gerakan dengan pencarian, filter berlapis, ilustrasi lokal, manfaat, teknik, dosis, modifikasi, dan video resmi bila tersedia.
- **Sesi Bebas:** susun gerakan, target, urutan, dan template latihan sendiri.
- **Progres:** sesi Mode 1/Sesi Bebas, menit, kalender 28 hari, kategori gerak, tren jurnal, evaluasi, dan pencapaian.
- **Lainnya:** jurnal kondisi, rutinitas tahajjud, pengingat, pengaturan, backup, dan bantuan.

Program latihan tetap hanya **Mode 1**. Fitur pendukung tidak membuka mode latihan baru atau memberi diagnosis.

### Isi 60 gerakan

| Kelompok | Jumlah |
| --- | ---: |
| Pemanasan & mobilitas | 12 |
| Kardio low-impact | 8 |
| Kekuatan tubuh bawah | 10 |
| Kekuatan tubuh atas | 10 |
| Inti & postur | 8 |
| Keseimbangan | 6 |
| Pendinginan & pemulihan | 6 |

Peralatan yang dikenali: kursi kokoh, dinding kokoh, matras, botol air, resistance band, dan dumbbell ringan. Sebelum sesi Mode 1, setiap gerakan dapat diganti dengan alternatif dalam kelompok yang sama. Gerakan menengah/lebih menantang atau alat yang belum dimiliki memunculkan konfirmasi; target tetap dibatasi sesuai minggu aktif.

## Menjalankan secara lokal

Persyaratan: Node.js 22.13 atau lebih baru.

```bash
npm ci
npm run dev
```

Pemeriksaan lengkap:

```bash
npm run test:run
npm run lint
npm run verify:assets
npm run build
```

## Data dan privasi

- Progres latihan, gerakan pengganti, jurnal, template Sesi Bebas, dan catatan tahajjud disimpan di IndexedDB pada browser HP.
- Menghapus data situs/browser juga dapat menghapus progres.
- Gunakan **Lainnya → Pengaturan → Ekspor progres** untuk membuat cadangan JSON schema v3.
- Cadangan schema v1 dan v2 dari versi lama tetap dapat diimpor; seluruh data divalidasi sebelum penyimpanan HP diubah.
- Tidak ada iklan, analitik, akun, GPS, atau data latihan yang dikirim ke server.
- Video pihak ketiga hanya dimuat setelah persetujuan dan menggunakan pemutar sumber aslinya. Video tidak diunduh, diubah, atau di-cache oleh JagaRaga.

## Media panduan

- Setiap satu dari 60 gerakan memiliki ilustrasi lokal yang tetap tersedia tanpa internet setelah aset pernah dimuat.
- Ilustrasi menggunakan karakter laki-laki dewasa dengan gaya visual yang konsisten.
- Video resmi merupakan panduan tambahan untuk gerakan tertentu dan hanya dimuat ketika pengguna mengizinkannya serta perangkat sedang online.

## Offline dan pengingat

- Shell aplikasi, data, teks panduan, serta 60 ilustrasi gerakan tetap berguna tanpa internet setelah aplikasi pernah dimuat.
- Pemutar YouTube tidak di-cache dan tetap membutuhkan internet.
- File kalender `.ics` adalah jalur pengingat utama: impor file ke aplikasi Kalender di HP agar jadwal dapat bekerja di luar PWA.
- Notifikasi browser hanyalah tambahan. Sistem HP dapat menghentikannya ketika PWA ditutup.

## Docker

```bash
docker build -t jagaraga .
docker run --rm -p 8080:8080 jagaraga
curl http://127.0.0.1:8080/healthz
```

Container menyajikan aplikasi pada port `8080`; endpoint pemeriksaan adalah `/healthz`.

## Pemasangan di Coolify

1. Buat repository GitHub dan dorong isi proyek ini ke cabang `main`.
2. Di Coolify, pilih **New Resource → Public/Private Repository** dan hubungkan repository.
3. Pilih build menggunakan `Dockerfile` pada root proyek.
4. Atur internal port ke `8080` dan health check path ke `/healthz`.
5. Tambahkan domain lengkap `https://jagaraga.ruanglegalitas.com`. Kolom path dikosongkan dan port internal diisi `8080` bila Coolify memintanya.
6. Aktifkan HTTPS pada origin Coolify. Pada Cloudflare gunakan mode SSL **Full (strict)** apabila sertifikat origin valid.
7. Deploy, lalu uji onboarding, lima tab, pemuatan ulang, instalasi ke layar utama, mode offline, backup, kalender, dan video resmi dari HP.

### Satu kali redeploy untuk paket ini

1. Unggah seluruh isi ZIP rilis ke repository GitHub, lalu commit ke cabang `main`.
2. Di Coolify pastikan Build Pack menggunakan `Dockerfile`, port internal `8080`, dan health check `/healthz`.
3. Pilih **Redeploy** satu kali dan tunggu log menunjukkan healthcheck `healthy`.
4. Di HP, tutup PWA JagaRaga sepenuhnya, buka `https://jagaraga.ruanglegalitas.com`, lalu refresh satu kali agar service worker v4 aktif.
5. Buka Pustaka dan pastikan tertulis **60 gerakan lokal**. Setelah itu tes satu halaman detail, konfigurasi sesi, dan ekspor cadangan.

Untuk pembaruan berikutnya, dorong commit baru ke cabang `main`, pilih **Redeploy** di Coolify, tunggu health check menjadi `healthy`, lalu refresh PWA di HP. Cache shell memakai versi `jagaraga-v4`; service worker akan menghapus cache shell lama ketika aktif.

Jika terjadi redirect loop, pastikan Coolify mengenali koneksi dari Cloudflare sebagai HTTPS dan hindari aturan redirect HTTP→HTTPS ganda yang tidak menghormati header proxy.

## Memulihkan versi sebelumnya

Pilih commit sebelumnya di Coolify lalu deploy ulang. Data progres pada HP tidak berubah selama origin dan penyimpanan browser tidak dihapus.

## Batasan kesehatan

JagaRaga bukan alat diagnosis atau pengganti tenaga kesehatan. Hentikan latihan dan cari pertolongan bila muncul nyeri/tekanan dada, sesak berat, pingsan atau hampir pingsan, keringat dingin, atau nyeri menjalar.
