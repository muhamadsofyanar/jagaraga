import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { MODE1_EXERCISES } from '../../domain/mode1';
import type { ExerciseKind } from '../../domain/types';
import { ExerciseDetail } from './ExerciseDetail';
import { filterExercises, type ExerciseFilter } from './filterExercises';

const filters: { value: ExerciseFilter; label: string }[] = [
  { value: 'all', label: 'Semua' }, { value: 'warmup', label: 'Pemanasan' }, { value: 'cardio', label: 'Kardio' },
  { value: 'strength', label: 'Kekuatan' }, { value: 'balance', label: 'Keseimbangan' }, { value: 'recovery', label: 'Pemulihan' }, { value: 'cooldown', label: 'Pendinginan' },
];
const kindLabels: Record<ExerciseKind, string> = { warmup: 'Pemanasan', cardio: 'Kardio', strength: 'Kekuatan', balance: 'Keseimbangan', recovery: 'Pemulihan', cooldown: 'Pendinginan' };

export function MovementLibrary({ videoConsent, onAddToFreeSession }: { videoConsent: boolean; onAddToFreeSession: (exerciseId: string) => void }) {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<ExerciseFilter>('all');
  const [selectedId, setSelectedId] = useState<string>();
  const selected = selectedId ? MODE1_EXERCISES[selectedId] : undefined;
  const results = useMemo(() => filterExercises(Object.values(MODE1_EXERCISES), query, kind), [query, kind]);
  if (selected) return <ExerciseDetail exercise={selected} videoConsent={videoConsent} onBack={() => setSelectedId(undefined)} onAdd={() => onAddToFreeSession(selected.id)} />;
  return <section className="page-pad page-content library-page">
    <p className="eyebrow">22 gerakan lokal</p><h1>Pustaka Gerakan</h1><p className="lead">Lihat teknik, modifikasi, gambar, dan video resmi bila tersedia.</p>
    <label className="search-field"><Search size={19} /><span className="sr-only">Cari gerakan</span><input type="search" aria-label="Cari gerakan" placeholder="Cari gerakan atau manfaat" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
    <div className="filter-chips" aria-label="Filter jenis gerakan">{filters.map((filter) => <button key={filter.value} className={kind === filter.value ? 'active' : ''} aria-pressed={kind === filter.value} onClick={() => setKind(filter.value)}>{filter.label}</button>)}</div>
    <p className="result-count">{results.length} gerakan ditemukan</p>
    {results.length ? <div className="movement-grid">{results.map((exercise) => <article className="movement-card" key={exercise.id}><img src={exercise.illustration} alt="" /><div><span>{kindLabels[exercise.kind]}</span><h2>{exercise.title}</h2><p>{exercise.purpose}</p><small>{exercise.equipment.length ? exercise.equipment.join(', ') : 'Tanpa alat'}</small></div><button aria-label={`Buka ${exercise.title}`} onClick={() => setSelectedId(exercise.id)}>Lihat panduan</button></article>)}</div> : <div className="empty-state"><span aria-hidden="true">⌕</span><p><strong>Belum ada gerakan yang cocok.</strong><br />Coba kata lain atau pilih Semua.</p></div>}
  </section>;
}
