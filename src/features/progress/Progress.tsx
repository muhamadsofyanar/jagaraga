import { Award, CheckCircle2, Dumbbell, Timer, TrendingUp } from 'lucide-react';
import type { FreeSessionTemplate, JournalEntry } from '../../domain/types';
import type { SessionLog } from '../../persistence/db';
import { evaluateWeek } from './evaluation';
import { buildProgressStats } from './stats';

const categoryLabels = { warmup: 'Pemanasan', cardio: 'Kardio', strength: 'Kekuatan', balance: 'Keseimbangan', cooldown: 'Pendinginan', recovery: 'Pemulihan' } as const;
const evaluationTitles = { advance: 'Boleh mempertimbangkan kenaikan bertahap', maintain: 'Pertahankan dulu', lighten: 'Ringankan beberapa hari', assess: 'Tunda dan pertimbangkan pemeriksaan' } as const;

export function Progress({ sessions, journals, templates, today }: { sessions: SessionLog[]; journals: JournalEntry[]; templates: FreeSessionTemplate[]; today: string }) {
  const stats = buildProgressStats(sessions, journals, templates, today);
  const evaluation = evaluateWeek(sessions, journals, today);
  const maxCategory = Math.max(1, ...Object.values(stats.categoryCounts));
  return <div className="page-pad page-content"><p className="eyebrow">CATATAN PERJALANAN</p><h1>Progres</h1><p className="lead">{stats.summary} Yang dicari bukan sempurna—tetapi kembali lagi.</p>
    <div className="stat-grid progress-stats"><article><CheckCircle2 /><strong>{stats.completedCount}</strong><span>Sesi selesai</span></article><article><Timer /><strong>{stats.totalMinutes}</strong><span>Menit bergerak</span></article><article><TrendingUp /><strong>{stats.sessionSources.program}</strong><span>Sesi Mode 1</span></article><article><Dumbbell /><strong>{stats.sessionSources.free}</strong><span>Sesi Bebas</span></article></div>
    <section className="calendar-card"><div className="section-heading"><div><p className="eyebrow">28 HARI TERAKHIR</p><h2>Konsistensi tanggal nyata</h2></div><Award /></div><div className="month-grid">{stats.calendar.map((day) => <span aria-label={`${day.date}${day.done ? ', sesi selesai' : ', tidak ada sesi'}`} className={day.done ? 'done' : ''} key={day.date}>{day.day}</span>)}</div></section>
    <section className="insight-card"><p className="eyebrow">JENIS GERAKAN</p><h2>Apa yang terlatih</h2><div className="category-bars">{Object.entries(stats.categoryCounts).map(([kind, count]) => <div key={kind}><span>{categoryLabels[kind as keyof typeof categoryLabels]} <strong>{count}</strong></span><div role="img" aria-label={`${categoryLabels[kind as keyof typeof categoryLabels]} ${count}`}><i style={{ width: `${(count / maxCategory) * 100}%` }} /></div></div>)}</div></section>
    <section className="insight-card"><p className="eyebrow">TREN KONDISI</p><h2>Rata-rata 14 hari</h2>{stats.journalAverages.energy14 === null ? <p className="empty-copy">Isi jurnal untuk melihat tren energi, tidur, pegal, dan stres.</p> : <div className="trend-list"><p><span>Energi</span><strong>{stats.journalAverages.energy14}/5</strong></p><p><span>Kualitas tidur</span><strong>{stats.journalAverages.sleep14}/5</strong></p><p><span>Pegal</span><strong>{stats.journalAverages.soreness14}/10</strong></p><p><span>Stres</span><strong>{stats.journalAverages.stress14}/5</strong></p></div>}</section>
    <section className={`review-card ${evaluation.outcome}`}><p className="eyebrow">EVALUASI 7 HARI</p><h2>{evaluationTitles[evaluation.outcome]}</h2><ul>{evaluation.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul><small>Ini panduan konservatif, bukan diagnosis medis.</small></section>
    <section className="insight-card"><p className="eyebrow">PENCAPAIAN LOKAL</p><h2>Lima penanda perjalanan</h2><div className="achievement-list">{stats.achievements.map((achievement) => <article className={achievement.earned ? 'earned' : ''} key={achievement.id}><Award /><div><strong>{achievement.title}</strong><span>{achievement.description}</span></div></article>)}</div></section>
    {stats.completedCount === 0 ? <div className="empty-state"><span>○</span><h2>Belum ada sesi selesai</h2><p>Latihan pertama Anda akan muncul di sini.</p></div> : null}
  </div>;
}
