import { useEffect, useReducer, useState } from 'react';
import { X } from 'lucide-react';
import type { ActiveSession, WellnessEntry } from '../persistence/db';
import type { ProgressRepository } from '../persistence/repository';
import { ExerciseCard } from '../components/ExerciseCard';
import { WellnessForm } from '../components/WellnessForm';
import { getElapsedSeconds, sessionReducer } from './reducer';

export function SessionRunner({ initial, repository, videoConsent, onFinish, onExit }: { initial: ActiveSession; repository: ProgressRepository; videoConsent: boolean; onFinish: () => void; onExit: () => void }) {
  const [state, dispatch] = useReducer(sessionReducer, initial);
  const [finishing, setFinishing] = useState(false);
  const [clock, setClock] = useState(() => Date.now());
  useEffect(() => { void repository.saveActiveSession(state); }, [state, repository]);
  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const current = state.plan.items[state.itemIndex];
  const isLast = state.itemIndex === state.plan.items.length - 1;
  const complete = () => { dispatch({ type: 'COMPLETE_ITEM', id: current.exerciseId }); if (isLast) setFinishing(true); };
  const skip = () => { dispatch({ type: 'SKIP_ITEM', id: current.exerciseId }); if (isLast) setFinishing(true); };
  const save = async (wellness: WellnessEntry) => {
    await repository.completeSession({ id: state.date, date: state.date, plan: state.plan, status: 'completed', completedItemIds: [...new Set([...state.completedItemIds, current.exerciseId])], skippedItemIds: state.skippedItemIds, elapsedSeconds: getElapsedSeconds(state), wellness, updatedAt: new Date().toISOString() });
    onFinish();
  };
  if (finishing) return <WellnessForm onSubmit={save} />;
  const elapsed = getElapsedSeconds(state, new Date(clock));
  const timeLabel = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  return <div className="runner"><div className="runner-bar"><button className="exit-session" onClick={onExit}><X size={18} /> Simpan & keluar</button><output aria-label="Durasi sesi">{timeLabel}</output></div><ExerciseCard target={current} index={state.itemIndex} total={state.plan.items.length} consent={videoConsent} onPrevious={() => dispatch({ type: 'PREVIOUS_ITEM' })} onComplete={complete} onSkip={skip} /></div>;
}
