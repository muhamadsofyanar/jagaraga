import { AlertTriangle, ArrowLeft, Download, RefreshCw, Smartphone, WifiOff } from 'lucide-react';

export function Help({ onBack }: { onBack: () => void }) {
  return <section className="page-pad page-content help-page"><button className="back-button" onClick={onBack}><ArrowLeft size={18} /> Kembali</button><p className="eyebrow">PANDUAN JAGARAGA</p><h1>Bantuan</h1>
    <article><Smartphone /><div><h2>Pasang di Android</h2><p>Buka situs di Chrome, pilih menu tiga titik, lalu pilih Instal aplikasi atau Tambahkan ke layar utama.</p></div></article>
    <article><Smartphone /><div><h2>Pasang di iPhone</h2><p>Buka di Safari, pilih tombol Bagikan, lalu pilih <strong>Add to Home Screen</strong>.</p></div></article>
    <article><RefreshCw /><div><h2>Memuat versi terbaru</h2><p>Lakukan refresh setelah deploy. Jika versi lama masih muncul, tutup PWA sepenuhnya, buka kembali, lalu refresh sekali lagi.</p></div></article>
    <article><WifiOff /><div><h2>Saat offline</h2><p>Program, gambar, jurnal, Sesi Bebas, dan progres tetap bekerja offline. Video membutuhkan internet dan izin video.</p></div></article>
    <article><Download /><div><h2>Menjaga data</h2><p>Gunakan Ekspor progres untuk membuat cadangan JSON. Simpan file sebelum menghapus data browser atau berpindah HP.</p></div></article>
    <article className="help-danger"><AlertTriangle /><div><h2>Kapan harus berhenti</h2><p>Hentikan latihan dan cari bantuan medis jika muncul nyeri dada, sesak saat aktivitas biasa, pingsan, kelemahan mendadak, atau gejala berat yang tidak biasa.</p></div></article>
  </section>;
}
