import { ArrowRight, CalendarCheck, Clock3, Footprints, Sparkles } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { AppSettings, ActiveSession } from '../../persistence/db';
import { getTodayPlan } from '../../domain/schedule';
import type { JournalEntry } from '../../domain/types';

const dayNames: Record<string, string> = { monday: 'Senin', tuesday: 'Selasa', wednesday: 'Rabu', thursday: 'Kamis', friday: 'Jumat', saturday: 'Sabtu', sunday: 'Minggu' };

export function Today({ settings, active, journal, onStart, onOpenJournal }: { settings: AppSettings; active?: ActiveSession; journal?: JournalEntry; onStart: () => void; onOpenJournal: () => void }) {
  const plan = getTodayPlan(new Date(), settings.programWeek);
  const progress = Math.round((settings.programWeek / 4) * 100);
  return <div className="page-pad page-content">
    <div className="greeting"><div><p className="eyebrow">{dayNames[plan.day].toUpperCase()} · MINGGU {settings.programWeek}</p><h1>Hari Ini</h1></div><div className="week-ring" style={{ '--progress': `${progress}%` } as CSSProperties}><span>{settings.programWeek}<small>/4</small></span></div></div>
    <section className="hero-card">
      <div className="hero-kicker"><Sparkles size={16} /> SESI HARI INI</div>
      <h2>{plan.title}</h2><p>{plan.description}</p>
      <div className="hero-meta"><span><Clock3 size={18} /> ± {plan.estimatedMinutes} menit</span><span><Footprints size={18} /> Intensitas ringan</span></div>
      <button className="hero-button" onClick={onStart}>{active ? 'Lanjutkan sesi' : 'Mulai latihan'} <ArrowRight size={20} /></button>
    </section>
    <section className="daily-focus"><div className="section-heading"><div><p className="eyebrow">TARGET HARI INI</p><h2>Pelan tetapi selesai</h2></div><CalendarCheck size={24} /></div>
      <div className="target-row"><span className="target-number">{plan.items.length}</span><span>tahap latihan<br /><small>Pemanasan sampai pendinginan</small></span></div>
      <div className="target-row"><span className="target-number">3–4</span><span>dari skala 10<br /><small>Masih bisa berbicara nyaman</small></span></div>
    </section>
    <section className="today-journal"><div><p className="eyebrow">KONDISI TUBUH</p><h2>{journal ? `Energi ${journal.energy} · Pegal ${journal.soreness}` : 'Bagaimana rasanya?'}</h2><p>{journal ? `Tidur ${journal.sleepQuality}/5 · Stres ${journal.stress}/5` : 'Satu menit untuk mencatat energi, tidur, pegal, dan napas.'}</p></div><button onClick={onOpenJournal}>{journal ? 'Perbarui kondisi tubuh' : 'Catat kondisi tubuh'}</button></section>
    <p className="gentle-copy">Tidak perlu mengejar napas atau keringat. Hari ini tubuh hanya belajar bergerak kembali.</p>
  </div>;
}
