import { Award, CheckCircle2, Timer } from 'lucide-react';
import type { SessionLog } from '../../persistence/db';
import { reviewWeek } from './weekReview';

export function Progress({ sessions }: { sessions: SessionLog[] }) {
  const completed = sessions.filter((item) => item.status === 'completed');
  const totalMinutes = Math.round(completed.reduce((sum, item) => sum + item.elapsedSeconds, 0) / 60);
  const review = reviewWeek(sessions);
  return <div className="page-pad page-content"><p className="eyebrow">CATATAN PERJALANAN</p><h1>Progres</h1><p className="lead">Yang dicari bukan sempurna—tetapi kembali lagi.</p>
    <div className="stat-grid"><article><CheckCircle2 /><strong>{completed.length}</strong><span>Sesi selesai</span></article><article><Timer /><strong>{totalMinutes}</strong><span>Menit bergerak</span></article></div>
    <section className="calendar-card"><div className="section-heading"><div><p className="eyebrow">4 MINGGU</p><h2>Konsistensi</h2></div><Award /></div><div className="month-grid">{Array.from({length:28},(_,index)=><span className={index < completed.length ? 'done' : ''} key={index}>{index+1}</span>)}</div></section>
    {completed.length === 0 ? <div className="empty-state"><span>○</span><h2>Belum ada sesi selesai</h2><p>Latihan pertama Anda akan muncul di sini.</p></div> : <section className={`review-card ${review.outcome}`}><p className="eyebrow">TINJAUAN MINGGU</p><h2>{review.outcome === 'advance' ? 'Siap mempertimbangkan minggu berikutnya' : review.outcome === 'repeat' ? 'Lebih baik ulangi minggu ini' : 'Tahan kenaikan intensitas'}</h2><p>{review.reasons[0]}</p></section>}
  </div>;
}
