import { useState } from 'react';
import type { WellnessEntry } from '../persistence/db';

const Scale = ({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) => <label className="scale-field"><span><strong>{label}</strong><b>{value}</b></span><input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} /><small>{min} ringan<span>{max} tinggi</span></small></label>;

export function WellnessForm({ onSubmit }: { onSubmit: (entry: WellnessEntry) => void }) {
  const [energy, setEnergy] = useState(3);
  const [soreness, setSoreness] = useState(2);
  const [breathlessness, setBreathlessness] = useState(2);
  const [sleepHours, setSleepHours] = useState('');
  const [note, setNote] = useState('');
  return <section className="wellness page-pad"><p className="eyebrow">SESI SELESAI</p><h1>Bagaimana rasanya?</h1><p className="lead">Catatan ini membantu menentukan apakah minggu perlu dilanjutkan atau diulang.</p>
    <Scale label="Energi" value={energy} min={1} max={5} onChange={setEnergy} /><Scale label="Pegal" value={soreness} min={0} max={10} onChange={setSoreness} /><Scale label="Engap" value={breathlessness} min={0} max={10} onChange={setBreathlessness} />
    <label className="field"><span>Tidur semalam (opsional)</span><input type="number" min="0" max="24" step="0.5" value={sleepHours} onChange={(event) => setSleepHours(event.target.value)} placeholder="Contoh: 7" /></label><label className="field"><span>Catatan singkat</span><textarea maxLength={300} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Bagian yang terasa mudah atau kurang nyaman…" /></label>
    <button className="primary wide" onClick={() => onSubmit({ energy: energy as WellnessEntry['energy'], soreness, breathlessness, sleepHours: sleepHours ? Number(sleepHours) : undefined, note: note || undefined })}>Simpan sesi</button>
  </section>;
}
