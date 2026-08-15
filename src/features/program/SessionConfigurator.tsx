import { AlertTriangle, ArrowLeft, ArrowRight, Clock3, Dumbbell, RotateCcw, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { EXERCISES_BY_ID } from '../../catalog';
import { difficultyLabels, equipmentLabels, groupLabels } from '../../catalog/vocabulary';
import { estimatePlanMinutes, getRequiredEquipment, rankSubstitutions, replacePlanItem } from '../../domain/substitutions';
import type { EquipmentId, Exercise, PlannedSession } from '../../domain/types';
import type { ExercisePreference } from '../../persistence/db';
import { MovementVisual } from '../library/MovementVisual';

type Props = {
  plan: PlannedSession;
  preferences: ExercisePreference[];
  ownedEquipment: EquipmentId[];
  onCancel: () => void;
  onContinue: (plan: PlannedSession) => void;
  onSavePreference: (preference: ExercisePreference) => void | Promise<void>;
};

function applyPreferences(plan: PlannedSession, preferences: ExercisePreference[]) {
  return plan.items.reduce((configured, item, index) => {
    const originalId = item.plannedExerciseId ?? item.exerciseId;
    const preference = preferences.find((entry) => entry.originalExerciseId === originalId);
    const original = EXERCISES_BY_ID[originalId];
    const replacement = preference ? EXERCISES_BY_ID[preference.replacementExerciseId] : undefined;
    if (!preference || !original || !replacement || original.group !== replacement.group) return configured;
    return replacePlanItem(configured, index, replacement.id);
  }, plan);
}

export function SessionConfigurator({ plan, preferences, ownedEquipment, onCancel, onContinue, onSavePreference }: Props) {
  const [configured, setConfigured] = useState(() => applyPreferences(plan, preferences));
  const [chooserIndex, setChooserIndex] = useState<number>();
  const [pending, setPending] = useState<Exercise>();
  const [makePreferred, setMakePreferred] = useState(false);
  const chooserCloseRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const requiredEquipment = getRequiredEquipment(configured);
  const currentTarget = chooserIndex === undefined ? undefined : configured.items[chooserIndex];
  const currentExercise = currentTarget ? EXERCISES_BY_ID[currentTarget.exerciseId] : undefined;
  const candidates = currentExercise ? [currentExercise, ...rankSubstitutions(currentExercise.id, ownedEquipment)] : [];

  useEffect(() => { if (chooserIndex !== undefined && !pending) chooserCloseRef.current?.focus(); }, [chooserIndex, pending]);
  useEffect(() => { if (pending) dialogRef.current?.focus(); }, [pending]);

  const closeChooser = () => {
    setChooserIndex(undefined); setPending(undefined); setMakePreferred(false);
    window.setTimeout(() => returnFocusRef.current?.focus(), 0);
  };
  const applyReplacement = (replacement: Exercise) => {
    if (chooserIndex === undefined || !currentTarget) return;
    const originalExerciseId = currentTarget.plannedExerciseId ?? currentTarget.exerciseId;
    setConfigured((value) => replacePlanItem(value, chooserIndex, replacement.id));
    if (makePreferred) void onSavePreference({ originalExerciseId, replacementExerciseId: replacement.id, updatedAt: new Date().toISOString() });
    closeChooser();
  };
  const selectReplacement = (replacement: Exercise) => {
    const missingEquipment = replacement.equipment.some((item) => !ownedEquipment.includes(item));
    if (replacement.difficulty !== 'light' || missingEquipment) setPending(replacement);
    else applyReplacement(replacement);
  };

  return <section className="page-pad session-configurator">
    <button className="back-button" onClick={onCancel}><ArrowLeft size={18} /> Kembali</button>
    <p className="eyebrow">MODE 1 · MINGGU {plan.programWeek}</p>
    <h1>Atur sesi hari ini</h1>
    <p className="lead">Bawaan sudah aman dipakai. Anda boleh mengganti gerakan dalam kelompok yang sama.</p>

    <div className="config-summary">
      <span><Clock3 size={18} /><strong>Perkiraan</strong>{estimatePlanMinutes(configured)} menit</span>
      <span><Dumbbell size={18} /><strong>Alat</strong>{requiredEquipment.length ? requiredEquipment.map((item) => equipmentLabels[item]).join(', ') : 'Tanpa alat'}</span>
    </div>

    <ol className="config-plan-list">{configured.items.map((target, index) => {
      const exercise = EXERCISES_BY_ID[target.exerciseId];
      const plannedId = target.plannedExerciseId ?? target.exerciseId;
      const planned = EXERCISES_BY_ID[plannedId];
      const changed = plannedId !== target.exerciseId;
      return <li key={`${plannedId}-${index}`}>
        <MovementVisual className="config-thumb" src={exercise.illustration} title={exercise.title} />
        <div><small>{groupLabels[exercise.group]} · {difficultyLabels[exercise.difficulty]}</small><h2>{exercise.title}</h2>{changed ? <p>Pengganti dari {planned.title}</p> : <p>{exercise.purpose}</p>}</div>
        <button type="button" aria-label={`Ganti ${planned.title}`} onClick={(event) => { returnFocusRef.current = event.currentTarget; setChooserIndex(index); setMakePreferred(false); }}>Ganti</button>
        {changed ? <button type="button" className="restore-default" aria-label={`Kembalikan bawaan ${planned.title}`} onClick={() => setConfigured((value) => replacePlanItem(value, index, plannedId))}><RotateCcw size={15} /> Bawaan</button> : null}
      </li>;
    })}</ol>

    <button type="button" className="secondary-button wide reset-plan" onClick={() => setConfigured(plan)}><RotateCcw size={17} /> Reset semua perubahan</button>
    <button type="button" className="primary wide" onClick={() => onContinue(configured)}>Lanjut pemeriksaan kesiapan <ArrowRight size={18} /></button>

    {currentExercise && chooserIndex !== undefined ? <div className="chooser-overlay">
      <section className="replacement-chooser" aria-labelledby="chooser-title">
        <div className="chooser-heading"><div><p className="eyebrow">{groupLabels[currentExercise.group]}</p><h2 id="chooser-title">Pilih pengganti</h2></div><button ref={chooserCloseRef} type="button" aria-label="Tutup pilihan pengganti" onClick={closeChooser}><X /></button></div>
        <p className="chooser-note">Semua gerakan satu kelompok ditampilkan. Yang cocok dengan alat Anda diletakkan lebih awal.</p>
        <label className="preferred-choice"><input type="checkbox" checked={makePreferred} onChange={(event) => setMakePreferred(event.target.checked)} /> Jadikan pilihan utama untuk sesi berikutnya</label>
        <div className="replacement-options" role="listbox" aria-label="Pilihan gerakan pengganti">{candidates.map((exercise) => {
          const missing = exercise.equipment.filter((item) => !ownedEquipment.includes(item));
          return <button type="button" role="option" aria-selected={exercise.id === currentExercise.id} key={exercise.id} onClick={() => selectReplacement(exercise)}>
            <MovementVisual className="replacement-thumb" src={exercise.illustration} title={exercise.title} />
            <span><strong>{exercise.title}</strong><small>{difficultyLabels[exercise.difficulty]} · {exercise.equipment.length ? exercise.equipment.map((item) => equipmentLabels[item]).join(', ') : 'Tanpa alat'}</small><em>{exercise.purpose}</em>{missing.length ? <b><AlertTriangle size={13} /> Belum ditandai punya: {missing.map((item) => equipmentLabels[item]).join(', ')}</b> : null}</span>
          </button>;
        })}</div>
      </section>
    </div> : null}

    {pending ? <div className="dialog-overlay"><section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="confirm-movement-title" className="confirm-movement">
      <AlertTriangle size={28} />
      <h2 id="confirm-movement-title">Konfirmasi gerakan</h2>
      <p><strong>{pending.title}</strong> berlevel {difficultyLabels[pending.difficulty].toLowerCase()} dan membutuhkan {pending.equipment.length ? pending.equipment.map((item) => equipmentLabels[item]).join(', ') : 'tanpa alat'}.</p>
      <p>Mulai dari dosis yang ditampilkan, jangan menambah beban, dan hentikan bila teknik atau napas tidak nyaman.</p>
      <div><button type="button" className="secondary-button" onClick={() => { setPending(undefined); window.setTimeout(() => chooserCloseRef.current?.focus(), 0); }}>Batal</button><button type="button" className="primary" onClick={() => applyReplacement(pending)}>Saya mengerti, gunakan</button></div>
    </section></div> : null}
  </section>;
}
