import { AlertCircle, ArrowLeft, Plus, Wind } from 'lucide-react';
import { equipmentLabels, groupLabels } from '../../catalog/vocabulary';
import type { Exercise } from '../../domain/types';
import { VideoEmbed } from '../../media/VideoEmbed';
import { VIDEO_REGISTRY } from '../../media/videos';
import { MovementVisual } from './MovementVisual';

function BenefitRow({ label, value }: { label: string; value: string }) {
  return <div className="benefit-row"><strong>{label}</strong><p>{value}</p></div>;
}

function dosageLabel(exercise: Exercise) {
  const { dosage } = exercise;
  const sets = dosage.sets ?? 1;
  const unit = dosage.unit === 'reps' ? 'kali' : dosage.unit === 'seconds' ? 'detik' : 'menit';
  return `${sets} set × ${dosage.value} ${unit}`;
}

export function ExerciseDetail({ exercise, videoConsent, onBack, onAdd }: { exercise: Exercise; videoConsent: boolean; onBack: () => void; onAdd: () => void }) {
  const video = exercise.videoId ? VIDEO_REGISTRY[exercise.videoId] : undefined;
  return <section className="page-content library-detail">
    <button className="back-button" onClick={onBack}><ArrowLeft size={19} /> Kembali ke pustaka</button>
    <MovementVisual className="library-detail-image" src={exercise.illustration} title={exercise.title} />
    <p className="eyebrow">{groupLabels[exercise.group]}</p>
    <h1>{exercise.title}</h1>
    <p>{exercise.purpose}</p>
    <p className="equipment-copy"><strong>Peralatan:</strong> {exercise.equipment.length ? exercise.equipment.map((item) => equipmentLabels[item]).join(', ') : 'Tidak perlu alat'}</p>

    <section className="benefit-section" aria-labelledby="benefit-title">
      <h2 id="benefit-title">Manfaat</h2>
      <BenefitRow label="Otot" value={exercise.benefits.muscles} />
      <BenefitRow label="Sendi & mobilitas" value={exercise.benefits.joints} />
      <BenefitRow label="Aktivitas harian" value={exercise.benefits.dailyFunction} />
      <BenefitRow label="Kebugaran" value={exercise.benefits.fitness} />
    </section>

    <p className="equipment-copy"><strong>Dosis awal:</strong> {dosageLabel(exercise)}{exercise.dosage.restSeconds ? ` · Istirahat ${exercise.dosage.restSeconds} detik` : ''}</p>

    <details className="library-safety" open>
      <summary>Teknik dan napas</summary>
      <ol className="steps-list">{exercise.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      <div className="cue"><Wind size={20} /><span><strong>Napas</strong>{exercise.breathingCue}</span></div>
    </details>
    <details className="library-safety">
      <summary>Lebih ringan & lebih menantang</summary>
      <p><strong>Lebih ringan:</strong> {exercise.beginnerModification}</p>
      <p><strong>Lebih menantang:</strong> {exercise.progression}</p>
    </details>
    <details className="library-safety">
      <summary>Kesalahan dan tanda berhenti</summary>
      <ul>{exercise.commonMistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul>
      <div className="stop-cue"><AlertCircle size={19} /><span>{exercise.stopCondition}</span></div>
    </details>
    {video ? <VideoEmbed source={video} consent={videoConsent} online={typeof navigator === 'undefined' ? true : navigator.onLine} /> : null}
    <button className="primary wide" onClick={onAdd}><Plus size={18} /> Tambah ke Sesi Bebas</button>
  </section>;
}
