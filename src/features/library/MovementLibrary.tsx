import { CircleGauge, Play, Search, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EXERCISES, EXERCISES_BY_ID } from '../../catalog';
import {
  BODY_REGIONS, DIFFICULTIES, EQUIPMENT_IDS, MOVEMENT_GOALS, MOVEMENT_GROUPS, MOVEMENT_POSITIONS,
  bodyRegionLabels, difficultyLabels, equipmentLabels, goalLabels, groupLabels, positionLabels,
} from '../../catalog/vocabulary';
import type { BodyRegion, Difficulty, EquipmentId, MovementGoal, MovementGroup, MovementPosition } from '../../domain/types';
import { ExerciseDetail } from './ExerciseDetail';
import { EMPTY_FILTERS, filterExercises, type ExerciseFilters } from './filterExercises';
import { MovementVisual } from './MovementVisual';

function toggleValue<T>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function FilterButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button type="button" className={active ? 'active' : ''} aria-pressed={active} onClick={onClick}>{label}</button>;
}

export function MovementLibrary({ videoConsent, onAddToFreeSession }: { videoConsent: boolean; onAddToFreeSession: (exerciseId: string) => void }) {
  const [filters, setFilters] = useState<ExerciseFilters>({ ...EMPTY_FILTERS });
  const [selectedId, setSelectedId] = useState<string>();
  const selected = selectedId ? EXERCISES_BY_ID[selectedId] : undefined;
  const results = useMemo(() => filterExercises(EXERCISES, filters), [filters]);
  const advancedFilterCount = filters.bodyRegions.length + filters.positions.length + filters.equipment.length + filters.difficulties.length + filters.goals.length + Number(filters.videoOnly);
  const update = <K extends keyof ExerciseFilters>(key: K, value: ExerciseFilters[K]) => setFilters((current) => ({ ...current, [key]: value }));
  const resetFilters = () => setFilters({ ...EMPTY_FILTERS });

  if (selected) return <ExerciseDetail exercise={selected} videoConsent={videoConsent} onBack={() => setSelectedId(undefined)} onAdd={() => onAddToFreeSession(selected.id)} />;

  return <section className="page-pad page-content library-page">
    <p className="eyebrow">{EXERCISES.length} gerakan lokal</p>
    <h1>Pustaka Gerakan</h1>
    <p className="lead">Cari berdasarkan tujuan, bagian tubuh, posisi, alat, tingkat, atau video resmi.</p>
    <label className="search-field"><Search size={19} /><span className="sr-only">Cari gerakan</span><input type="search" aria-label="Cari gerakan" placeholder="Cari gerakan atau manfaat" value={filters.query} onChange={(event) => update('query', event.target.value)} /></label>

    <div className="filter-chips" aria-label="Filter kelompok gerakan">
      <FilterButton active={filters.groups.length === 0} label="Semua" onClick={() => update('groups', [])} />
      {MOVEMENT_GROUPS.map((group) => <FilterButton key={group} active={filters.groups.includes(group)} label={groupLabels[group]} onClick={() => update('groups', toggleValue<MovementGroup>(filters.groups, group))} />)}
    </div>

    <details className="advanced-filters">
      <summary><SlidersHorizontal size={18} /> <span>Filter lainnya</span>{advancedFilterCount ? <strong>{advancedFilterCount} filter aktif</strong> : null}</summary>
      <div className="filter-panel">
        <fieldset><legend>Bagian tubuh</legend><div className="option-chips">{BODY_REGIONS.map((value) => <FilterButton key={value} active={filters.bodyRegions.includes(value)} label={bodyRegionLabels[value]} onClick={() => update('bodyRegions', toggleValue<BodyRegion>(filters.bodyRegions, value))} />)}</div></fieldset>
        <fieldset><legend>Posisi</legend><div className="option-chips">{MOVEMENT_POSITIONS.map((value) => <FilterButton key={value} active={filters.positions.includes(value)} label={positionLabels[value]} onClick={() => update('positions', toggleValue<MovementPosition>(filters.positions, value))} />)}</div></fieldset>
        <fieldset><legend>Peralatan</legend><div className="option-chips">{EQUIPMENT_IDS.map((value) => <FilterButton key={value} active={filters.equipment.includes(value)} label={equipmentLabels[value]} onClick={() => update('equipment', toggleValue<EquipmentId>(filters.equipment, value))} />)}</div></fieldset>
        <fieldset><legend>Tingkat</legend><div className="option-chips">{DIFFICULTIES.map((value) => <FilterButton key={value} active={filters.difficulties.includes(value)} label={difficultyLabels[value]} onClick={() => update('difficulties', toggleValue<Difficulty>(filters.difficulties, value))} />)}</div></fieldset>
        <fieldset><legend>Tujuan</legend><div className="option-chips">{MOVEMENT_GOALS.map((value) => <FilterButton key={value} active={filters.goals.includes(value)} label={goalLabels[value]} onClick={() => update('goals', toggleValue<MovementGoal>(filters.goals, value))} />)}</div></fieldset>
        <label className="video-only"><input type="checkbox" checked={filters.videoOnly} onChange={(event) => update('videoOnly', event.target.checked)} /><Play size={17} /> Hanya yang punya video resmi</label>
      </div>
    </details>

    <div className="result-toolbar">
      <p className="result-count" aria-live="polite">{results.length} gerakan ditemukan</p>
      {(filters.query || filters.groups.length || advancedFilterCount) ? <button type="button" className="reset-filter" onClick={resetFilters}><X size={16} /> Reset filter</button> : null}
    </div>

    {results.length ? <div className="movement-grid">{results.map((exercise) => <article className="movement-card" key={exercise.id}>
      <MovementVisual className="movement-card-image" src={exercise.illustration} title={exercise.title} decorative />
      <div><span>{groupLabels[exercise.group]}</span><h2>{exercise.title}</h2><p>{exercise.purpose}</p>
        <div className="movement-meta"><small><CircleGauge size={14} /> {difficultyLabels[exercise.difficulty]}</small><small>{exercise.equipment.length ? exercise.equipment.map((item) => equipmentLabels[item]).join(', ') : 'Tanpa alat'}</small><small>{bodyRegionLabels[exercise.bodyRegions[0]]}</small>{exercise.videoId ? <small><Play size={13} /> Video</small> : null}</div>
      </div>
      <button aria-label={`Buka ${exercise.title}`} onClick={() => setSelectedId(exercise.id)}>Lihat panduan</button>
    </article>)}</div> : <div className="empty-state"><span aria-hidden="true">⌕</span><p><strong>Belum ada gerakan yang cocok.</strong><br />Coba kata lain atau reset filter.</p></div>}
  </section>;
}
