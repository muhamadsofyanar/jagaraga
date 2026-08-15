import { AlertCircle, Check, ChevronLeft, ChevronRight, Wind } from 'lucide-react';
import { EXERCISES_BY_ID } from '../catalog';
import type { ExerciseTarget } from '../domain/types';
import { MovementVisual } from '../features/library/MovementVisual';
import { VideoEmbed } from '../media/VideoEmbed';
import { VIDEO_REGISTRY } from '../media/videos';

export function ExerciseCard({ target, index, total, consent, onPrevious, onComplete, onSkip }: { target: ExerciseTarget; index: number; total: number; consent: boolean; onPrevious: () => void; onComplete: () => void; onSkip: () => void }) {
  const item = EXERCISES_BY_ID[target.exerciseId];
  const video = item.videoId ? VIDEO_REGISTRY[item.videoId] : undefined;
  const targetText = target.minutes ? `${target.minutes} menit` : target.seconds ? `${target.seconds} detik` : `${target.sets ?? 1} set × ${target.reps ?? 8} kali`;
  return <div className="session-page">
    <div className="session-progress"><span style={{ width: `${((index + 1) / total) * 100}%` }} /></div>
    <div className="session-header"><button onClick={onPrevious} disabled={index === 0} aria-label="Gerakan sebelumnya"><ChevronLeft /></button><span>Gerakan {index + 1} dari {total}</span><span className="target-pill">{targetText}</span></div>
    <MovementVisual src={item.illustration} title={item.title} />
    <article className="exercise-copy"><p className="eyebrow">{item.purpose}</p><h1>{item.title}</h1>
      <ol>{item.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      <div className="cue"><Wind size={20} /><span><strong>Napas</strong>{item.breathingCue}</span></div>
      <details><summary>Modifikasi & kesalahan umum</summary><p><strong>Lebih ringan:</strong> {item.beginnerModification}</p><ul>{item.commonMistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul></details>
      <div className="stop-cue"><AlertCircle size={19} /><span>{item.stopCondition}</span></div>
      {video ? <VideoEmbed source={video} consent={consent} online={typeof navigator === 'undefined' ? true : navigator.onLine} /> : null}
    </article>
    <div className="session-actions"><button className="skip-button" onClick={onSkip}>Lewati</button><button className="primary" onClick={onComplete}><Check size={18} /> Selesai <ChevronRight size={18} /></button></div>
  </div>;
}
