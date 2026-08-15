import { useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';

const checks = ['Nyeri atau tekanan dada', 'Sesak berat atau tidak biasa', 'Pusing, hampir pingsan, atau pingsan', 'Sedang demam atau sakit akut', 'Nyeri baru yang mengubah cara bergerak'];

export function ReadinessCheck({ onClear, onCancel, backLabel = 'Kembali' }: { onClear: () => void; onCancel: () => void; backLabel?: string }) {
  const [answers, setAnswers] = useState<boolean[]>(checks.map(() => false));
  const hasWarning = answers.some(Boolean);
  return <section className="page-pad readiness">
    <button className="back-button" onClick={onCancel}><ArrowLeft size={18} /> {backLabel}</button>
    <p className="eyebrow">CEK 30 DETIK</p><h1>Siap bergerak?</h1><p className="lead">Centang bila Anda merasakan salah satu kondisi berikut sekarang.</p>
    <div className="check-list">{checks.map((label, index) => <label key={label}><input type="checkbox" checked={answers[index]} onChange={(event) => setAnswers(answers.map((item, i) => i === index ? event.target.checked : item))} /><span>{label}</span></label>)}</div>
    {hasWarning ? <div className="danger"><AlertTriangle size={22} /><div><strong>Jangan mulai latihan.</strong><p>Hentikan latihan dan cari pertolongan medis segera untuk gejala berat atau mendadak.</p></div></div> : <div className="ready-note">Tidak ada keluhan yang dicentang. Tetap mulai perlahan.</div>}
    <button className="primary wide" disabled={hasWarning} onClick={onClear}>Mulai latihan <ArrowRight size={19} /></button>
  </section>;
}
