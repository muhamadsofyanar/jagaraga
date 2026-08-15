# JagaRaga

JagaRaga adalah PWA mobile-first untuk menjalankan program **Mode 1 — Adaptasi Tubuh** selama empat minggu. Aplikasi tidak memakai akun atau backend; progres tersimpan di browser perangkat.

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
npm run build
```

## Data dan privasi

- Progres latihan disimpan di IndexedDB pada browser HP.
- Menghapus data situs/browser juga dapat menghapus progres.
- Gunakan **Pengaturan → Ekspor progres** untuk membuat cadangan JSON.
- Tidak ada iklan, analitik, akun, GPS, atau data latihan yang dikirim ke server.
- Video pihak ketiga hanya dimuat setelah persetujuan dan menggunakan pemutar sumber aslinya. Video tidak diunduh, diubah, atau di-cache oleh JagaRaga.

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
5. Tambahkan domain `https://app.ruanglegalitas.com`.
6. Aktifkan HTTPS pada origin Coolify. Pada Cloudflare gunakan mode SSL **Full (strict)** apabila sertifikat origin valid.
7. Deploy, lalu uji onboarding, pemuatan ulang, instalasi ke layar utama, mode offline, dan video resmi dari HP.

Jika terjadi redirect loop, pastikan Coolify mengenali koneksi dari Cloudflare sebagai HTTPS dan hindari aturan redirect HTTP→HTTPS ganda yang tidak menghormati header proxy.

## Memulihkan versi sebelumnya

Pilih commit sebelumnya di Coolify lalu deploy ulang. Data progres pada HP tidak berubah selama origin dan penyimpanan browser tidak dihapus.

## Batasan kesehatan

JagaRaga bukan alat diagnosis atau pengganti tenaga kesehatan. Hentikan latihan dan cari pertolongan bila muncul nyeri/tekanan dada, sesak berat, pingsan atau hampir pingsan, keringat dingin, atau nyeri menjalar.
