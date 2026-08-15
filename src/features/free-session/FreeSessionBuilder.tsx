import { ArrowDown, ArrowUp, Play, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MODE1_EXERCISES } from '../../domain/mode1';
import type { ExerciseTarget, FreeSessionTemplate } from '../../domain/types';
import { validateFreeSession } from './freeSession';

type TargetUnit = 'reps' | 'seconds' | 'minutes';

const targetUnit = (item: ExerciseTarget): TargetUnit => item.minutes !== undefined ? 'minutes' : item.reps !== undefined ? 'reps' : 'seconds';
const targetValue = (item: ExerciseTarget) => item[targetUnit(item)] ?? 1;

export function FreeSessionBuilder({ templates, initialExerciseId, onSave, onDelete, onStart }: {
  templates: FreeSessionTemplate[];
  initialExerciseId?: string;
  onSave: (template: FreeSessionTemplate) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onStart: (template: FreeSessionTemplate) => void | Promise<void>;
}) {
  const [name, setName] = useState('');
  const [items, setItems] = useState<ExerciseTarget[]>(() => initialExerciseId ? [{ exerciseId: initialExerciseId, seconds: 60 }] : []);
  const [choice, setChoice] = useState('march');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialExerciseId) setItems((current) => current.some((item) => item.exerciseId === initialExerciseId) ? current : [...current, { exerciseId: initialExerciseId, seconds: 60 }]);
  }, [initialExerciseId]);

  const updateTarget = (index: number, unit: TargetUnit, value: number) => setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { exerciseId: item.exerciseId, [unit]: value } : item));
  const move = (index: number, offset: -1 | 1) => setItems((current) => {
    const next = [...current];
    const destination = index + offset;
    if (destination < 0 || destination >= next.length) return current;
    [next[index], next[destination]] = [next[destination], next[index]];
    return next;
  });
  const load = (id: string) => {
    setSelectedTemplate(id);
    const template = templates.find((item) => item.id === id);
    if (template) { setName(template.name); setItems(template.items.map((item) => ({ ...item }))); setErrors({}); }
  };
  const build = (saving: boolean) => {
    const resolvedName = saving ? name : name.trim() || 'Sesi Bebas';
    const validation = validateFreeSession(resolvedName, items);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    const existing = templates.find((item) => item.id === selectedTemplate);
    const now = new Date().toISOString();
    const template: FreeSessionTemplate = { id: existing?.id ?? crypto.randomUUID(), name: resolvedName.trim(), items: items.map((item) => ({ ...item })), createdAt: existing?.createdAt ?? now, updatedAt: now };
    if (saving) void onSave(template); else void onStart(template);
  };

  return <section className="page-pad page-content free-builder">
    <p className="eyebrow">Latihan pilihan</p><h1>Sesi Bebas</h1><p className="lead">Susun 1–40 gerakan. Mulai sekali atau simpan sebagai template.</p>
    {templates.length ? <label className="field"><span>Template tersimpan</span><select aria-label="Template tersimpan" value={selectedTemplate} onChange={(event) => load(event.target.value)}><option value="">Pilih template</option>{templates.map((template) => <option value={template.id} key={template.id}>{template.name}</option>)}</select></label> : null}
    <div className="free-add-row"><label><span>Pilih gerakan</span><select aria-label="Pilih gerakan" value={choice} onChange={(event) => setChoice(event.target.value)}>{Object.values(MODE1_EXERCISES).map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.title}</option>)}</select></label><button className="primary" aria-label="Tambahkan gerakan" onClick={() => setItems((current) => current.length < 40 ? [...current, { exerciseId: choice, seconds: 60 }] : current)}><Plus /></button></div>
    {errors.items ? <p className="form-error" role="alert">{errors.items}</p> : null}
    <div className="free-items">{items.map((item, index) => { const exercise = MODE1_EXERCISES[item.exerciseId]; const unit = targetUnit(item); return <article key={`${item.exerciseId}-${index}`} data-testid={`free-item-${index}`}><img src={exercise.illustration} alt="" /><div><h2>{exercise.title}</h2><div className="target-controls"><input aria-label={`Target ${exercise.title}`} type="number" min="1" max="999" value={targetValue(item)} onChange={(event) => updateTarget(index, unit, Number(event.target.value))} /><select aria-label={`Satuan ${exercise.title}`} value={unit} onChange={(event) => updateTarget(index, event.target.value as TargetUnit, targetValue(item))}><option value="reps">kali</option><option value="seconds">detik</option><option value="minutes">menit</option></select></div></div><div className="item-actions"><button aria-label={`Pindah ke atas ${exercise.title}`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp /></button><button aria-label={`Pindah ke bawah ${exercise.title}`} disabled={index === items.length - 1} onClick={() => move(index, 1)}><ArrowDown /></button><button aria-label={`Hapus ${exercise.title}`} onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}><X /></button></div></article>; })}</div>
    <label className="field"><span>Nama template</span><input aria-label="Nama template" maxLength={60} value={name} onChange={(event) => setName(event.target.value)} placeholder="Contoh: Rutinitas pagi" /></label>{errors.name ? <p className="form-error" role="alert">{errors.name}</p> : null}
    <div className="free-actions"><button className="secondary-button" onClick={() => build(true)}><Save size={18} /> Simpan template</button>{selectedTemplate ? <button className="danger-button-outline" onClick={() => { if (window.confirm('Hapus template ini?')) void onDelete(selectedTemplate); }}><Trash2 size={18} /> Hapus template</button> : null}<button className="primary wide" onClick={() => build(false)}><Play size={18} /> Mulai Sesi Bebas</button></div>
  </section>;
}
