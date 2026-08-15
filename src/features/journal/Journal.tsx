import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';
import type { BreathlessnessLevel, JournalEntry } from '../../domain/types';
import { validateJournal } from './journal';

const Range = ({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) => <label className="scale-field"><span><strong>{label}</strong><b>{value}</b></span><input aria-label={label} type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} /><small>{min}<span>{max}</span></small></label>;

export function Journal({ today, entries, onSave, onBack }: { today: string; entries: JournalEntry[]; onSave: (entry: JournalEntry) => void | Promise<void>; onBack: () => void }) {
  const existing = entries.find((entry) => entry.id === today);
  const [energy, setEnergy] = useState<number>(existing?.energy ?? 3);
  const [soreness, setSoreness] = useState(existing?.soreness ?? 2);
  const [sleepQuality, setSleepQuality] = useState<number>(existing?.sleepQuality ?? 3);
  const [stress, setStress] = useState<number>(existing?.stress ?? 3);
  const [breathlessness, setBreathlessness] = useState<BreathlessnessLevel>(existing?.breathlessness ?? 'exercise');
  const [note, setNote] = useState(existing?.note ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const submit = async () => {
    const entry: JournalEntry = { id: today, energy: energy as JournalEntry['energy'], soreness, sleepQuality: sleepQuality as JournalEntry['sleepQuality'], stress: stress as JournalEntry['stress'], breathlessness, note, updatedAt: new Date().toISOString() };
    const validation = validateJournal(entry); setErrors(validation); if (Object.keys(validation).length) return;
    await onSave(entry); setSaved(true);
  };
  const history = [...entries].sort((a, b) => b.id.localeCompare(a.id));
  return <section className="page-pad page-content journal-page"><button className="back-button" onClick={onBack}><ArrowLeft size={18} /> Kembali</button><p className="eyebrow">CATATAN HARIAN</p><h1>Kondisi Tubuh</h1><p className="lead">Catat singkat agar saran mingguan memakai data yang Anda pahami.</p>
    <Range label="Energi" value={energy} min={1} max={5} onChange={setEnergy} /><Range label="Pegal" value={soreness} min={0} max={10} onChange={setSoreness} /><Range label="Kualitas tidur" value={sleepQuality} min={1} max={5} onChange={setSleepQuality} /><Range label="Stres" value={stress} min={1} max={5} onChange={setStress} />
    <fieldset className="radio-card"><legend>Kapan terasa engap?</legend><label><input type="radio" name="breathing" checked={breathlessness === 'none'} onChange={() => setBreathlessness('none')} /> Tidak engap</label><label><input type="radio" name="breathing" checked={breathlessness === 'exercise'} onChange={() => setBreathlessness('exercise')} /> Hanya saat latihan</label><label><input type="radio" name="breathing" checked={breathlessness === 'ordinary'} onChange={() => setBreathlessness('ordinary')} /> Saat aktivitas biasa</label></fieldset>
    <label className="field"><span>Catatan <small>{note.length}/500</small></span><textarea aria-label="Catatan" maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} /></label>{Object.values(errors).map((error) => <p className="form-error" role="alert" key={error}>{error}</p>)}
    <button className="primary wide" onClick={() => void submit()}><Save size={18} /> Simpan kondisi</button>{saved ? <p className="save-status" role="status">Kondisi hari ini tersimpan.</p> : null}
    <section className="journal-history"><h2>Riwayat</h2>{history.length ? history.map((entry) => <article key={entry.id}><strong>{entry.id}</strong><span>Energi {entry.energy} · Pegal {entry.soreness} · Tidur {entry.sleepQuality}</span>{entry.note ? <p>{entry.note}</p> : null}</article>) : <p className="empty-copy">Belum ada catatan kondisi.</p>}</section>
  </section>;
}
