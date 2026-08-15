import { AlertCircle, ArrowLeft, Plus, Wind } from 'lucide-react';
import type { Exercise } from '../../domain/types';
import { VideoEmbed } from '../../media/VideoEmbed';
import { VIDEO_REGISTRY } from '../../media/videos';

export function ExerciseDetail({ exercise, videoConsent, onBack, onAdd }: { exercise: Exercise; videoConsent: boolean; onBack: () => void; onAdd: () => void }) {
  const video = exercise.videoId ? VIDEO_REGISTRY[exercise.videoId] : exercise.id === 'walk' ? VIDEO_REGISTRY['senam-low-impact'] : undefined;
  return <section className="page-content library-detail">
    <button className="back-button" onClick={onBack}><ArrowLeft size={19} /> Kembali ke pustaka</button>
    <img className="library-detail-image" src={exercise.illustration} alt={`Contoh ${exercise.title}`} />
    <p className="eyebrow">{exercise.purpose}</p><h1>{exercise.title}</h1>
    <p className="equipment-copy"><strong>Peralatan:</strong> {exercise.equipment.length ? exercise.equipment.join(', ') : 'Tidak perlu alat'}</p>
    <ol className="steps-list">{exercise.steps.map((step) => <li key={step}>{step}</li>)}</ol>
    <div className="cue"><Wind size={20} /><span><strong>Napas</strong>{exercise.breathingCue}</span></div>
    <details className="library-safety"><summary>Modifikasi & kesalahan umum</summary><p><strong>Lebih ringan:</strong> {exercise.beginnerModification}</p><ul>{exercise.commonMistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul></details>
    <div className="stop-cue"><AlertCircle size={19} /><span>{exercise.stopCondition}</span></div>
    {video ? <VideoEmbed source={video} consent={videoConsent} online={typeof navigator === 'undefined' ? true : navigator.onLine} /> : null}
    <button className="primary wide" onClick={onAdd}><Plus size={18} /> Tambah ke Sesi Bebas</button>
  </section>;
}
