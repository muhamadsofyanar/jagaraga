# JagaRaga — Visual Lengkap Setiap Gerakan

## Tujuan

Setiap tahap latihan Mode 1 harus menampilkan contoh visual gerakan yang nyata. Video resmi tetap menjadi media tambahan, bukan syarat agar pengguna memahami gerakan.

## Cakupan

- Semua gerakan dalam `MODE1_EXERCISES` mempunyai aset gambar raster yang tersedia di aplikasi.
- Setiap gambar menggunakan laki-laki dewasa yang konsisten, berpakaian olahraga sopan dan netral.
- Setiap gambar memperlihatkan dua fase utama: posisi awal dan posisi akhir.
- Gaya visual menggunakan latar krem hangat, garis hijau gelap, dan aksen emas agar selaras dengan antarmuka JagaRaga.
- Gambar lama untuk jalan, chair squat, dan wall push-up diganti agar karakter dan gayanya konsisten.
- Video publik dari sumber resmi tetap ditampilkan hanya ketika relevan, pengguna mengizinkan video pihak ketiga, dan perangkat sedang online.

## Daftar Gerakan

Visual wajib tersedia untuk:

1. Jalan di tempat
2. Putaran bahu
3. Buka dada
4. Cat–cow berdiri
5. Putaran badan ringan
6. Lingkar pinggul
7. Angkat lutut bergantian
8. Putaran pergelangan kaki
9. Chair squat
10. Wall push-up
11. Glute bridge
12. Bird-dog
13. Calf raise
14. Jalan nyaman
15. Berdiri satu kaki
16. Jalan tumit ke ujung kaki
17. Hip hinge
18. Row dengan band
19. Dead bug sederhana
20. Mobilitas pemulihan
21. Napas santai
22. Jalan pelan pendinginan

## Arsitektur Media

- Setiap definisi latihan menunjuk langsung ke `/movement/<exercise-id>.png`.
- `ExerciseCard` selalu merender gambar dari definisi latihan; simbol abstrak tidak lagi menjadi media utama.
- Aset yang gerakannya identik atau sangat dekat boleh memakai ilustrasi yang sama secara fisik melalui salinan berkas bernama sesuai ID, sehingga setiap URL tetap eksplisit dan dapat diuji.
- Kegagalan memuat gambar menampilkan pesan sederhana dan nama gerakan, tanpa menghilangkan petunjuk tertulis atau kontrol sesi.

## Perilaku Video

- Video muncul di bawah instruksi, modifikasi, dan peringatan keselamatan.
- Video tidak menggantikan gambar utama.
- Tanpa persetujuan, aplikasi menampilkan penjelasan bahwa video dapat diaktifkan melalui Pengaturan.
- Tautan sumber asli tetap tersedia.

## Pengujian dan Penerimaan

- Tes otomatis membuktikan setiap latihan memiliki jalur ilustrasi PNG.
- Tes integritas membuktikan setiap jalur ilustrasi memiliki berkas di `public/movement`.
- Tes komponen membuktikan gambar dirender untuk latihan yang sebelumnya hanya memakai simbol.
- Seluruh unit test, lint, pemeriksaan TypeScript, dan production build harus berhasil.
- Pemeriksaan visual pada ukuran layar HP memastikan tubuh tidak terpotong, dua fase mudah dibedakan, dan tombol sesi tidak menutupi media.

## Di Luar Cakupan

- Mengunduh atau menyimpan ulang video pihak ketiga.
- Menjamin video tersedia untuk setiap gerakan.
- Animasi gerakan atau pelacakan pose.
- Perubahan program latihan, repetisi, durasi, atau aturan keselamatan.
