import { AlertTriangle, ArrowLeft, Download, RefreshCw, ShieldCheck, Shuffle, Smartphone, Video, WifiOff } from 'lucide-react';

export function Help({ onBack }: { onBack: () => void }) {
  return <section className="page-pad page-content help-page"><button className="back-button" onClick={onBack}><ArrowLeft size={18} /> Kembali</button><p className="eyebrow">PANDUAN JAGARAGA</p><h1>Bantuan</h1>
    <article><Smartphone /><div><h2>Pasang di Android</h2><p>Buka situs di Chrome, pilih menu tiga titik, lalu pilih Instal aplikasi atau Tambahkan ke layar utama.</p></div></article>
    <article><Smartphone /><div><h2>Pasang di iPhone</h2><p>Buka di Safari, pilih tombol Bagikan, lalu pilih <strong>Add to Home Screen</strong>.</p></div></article>
    <article><RefreshCw /><div><h2>Memuat versi terbaru</h2><p>Lakukan refresh setelah deploy. Jika versi lama masih muncul, tutup PWA sepenuhnya, buka kembali, lalu refresh sekali lagi.</p></div></article>
    <article><WifiOff /><div><h2>Saat offline</h2><p>Program, gambar, jurnal, Sesi Bebas, dan progres tetap bekerja offline. Video membutuhkan internet dan izin video.</p></div></article>
    <article><Shuffle /><div><h2>Mengganti gerakan</h2><p>Sebelum Mode 1 dimulai, pilih Ganti untuk melihat seluruh alternatif dalam kelompok yang sama. Perubahan berlaku untuk sesi itu saja kecuali Anda mencentang Jadikan pilihan utama.</p></div></article>
    <article><ShieldCheck /><div><h2>Tingkat dan peralatan</h2><p>Gerakan menengah, lebih menantang, atau yang memerlukan alat tambahan selalu diberi label. Baca konfirmasi, gunakan beban ringan, dan jangan lanjut bila alat tidak stabil.</p></div></article>
    <article><Video /><div><h2>Gambar dan video</h2><p>Semua 60 gerakan mempunyai ilustrasi laki-laki lokal. Panduan resmi hanya tersedia pada gerakan tertentu; untuk menontonnya perangkat harus online dan Anda perlu memberi izin.</p></div></article>
    <article><Download /><div><h2>Menjaga data</h2><p>Gunakan Ekspor progres untuk membuat cadangan JSON. Simpan file sebelum menghapus data browser atau berpindah HP.</p></div></article>
    <article className="help-danger"><AlertTriangle /><div><h2>Kapan harus berhenti</h2><p>Hentikan latihan dan cari bantuan medis jika muncul nyeri dada, sesak saat aktivitas biasa, pingsan, kelemahan mendadak, atau gejala berat yang tidak biasa.</p></div></article>
  </section>;
}
