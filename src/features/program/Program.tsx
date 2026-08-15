import { ChevronRight } from 'lucide-react';
import { MODE1_SESSIONS } from '../../domain/mode1';
import type { AppSettings } from '../../persistence/db';

const days = [
  ['monday', 'Sen'], ['tuesday', 'Sel'], ['wednesday', 'Rab'], ['thursday', 'Kam'], ['friday', 'Jum'], ['saturday', 'Sab'], ['sunday', 'Min'],
] as const;

export function Program({ settings }: { settings: AppSettings }) {
  return <div className="page-pad page-content"><p className="eyebrow">FONDASI KEBUGARAN</p><h1>Program Mode 1</h1><p className="lead">Empat minggu untuk membangun kebiasaan, stamina, dan kekuatan dasar.</p>
    <div className="week-tabs">{[1,2,3,4].map((week) => <span key={week} className={settings.programWeek === week ? 'active' : ''}>Minggu {week}</span>)}</div>
    <section className="schedule-card">{days.map(([id, label]) => { const session = MODE1_SESSIONS[id]; return <article key={id}><div className="day-chip">{label}</div><div><strong>{session.title}</strong><span>{session.estimatedMinutes} menit · {session.description}</span></div><ChevronRight size={18} /></article>; })}</section>
    <section className="progression"><p className="eyebrow">PROGRES BERTAHAP</p><h2>Volume per minggu</h2>{[
      ['1','10–15 mnt','1 × 8'],['2','15–20 mnt','1 × 10–12'],['3','20–25 mnt','2 × 8'],['4','25–30 mnt','2 × 10–12'],
    ].map(([week, cardio, strength]) => <div className="volume-row" key={week}><strong>{week}</strong><span><small>KARDIO</small>{cardio}</span><span><small>KEKUATAN</small>{strength}</span></div>)}</section>
  </div>;
}
