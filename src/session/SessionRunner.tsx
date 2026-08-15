import { useEffect, useReducer, useState } from 'react';
import { X } from 'lucide-react';
import type { ActiveSession, WellnessEntry } from '../persistence/db';
import type { ProgressRepository } from '../persistence/repository';
import { ExerciseCard } from '../components/ExerciseCard';
import { WellnessForm } from '../components/WellnessForm';
import { getElapsedSeconds, sessionReducer } from './reducer';
import { buildPerformedItems } from './performedItems';

export function SessionRunner({ initial, repository, videoConsent, onFinish, onExit }: { initial: ActiveSession; repository: ProgressRepository; videoConsent: boolean; onFinish: () => void; onExit: () => void }) {
  const [state, dispatch] = useReducer(sessionReducer, initial);
  const [finalStatus, setFinalStatus] = useState<'completed' | 'skipped'>();
  const [clock, setClock] = useState(() => Date.now());
  useEffect(() => { void repository.saveActiveSession(state); }, [state, repository]);
  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const current = state.plan.items[state.itemIndex];
  const isLast = state.itemIndex === state.plan.items.length - 1;
  const complete = () => { dispatch({ type: 'COMPLETE_ITEM', id: current.exerciseId }); if (isLast) setFinalStatus('completed'); };
  const skip = () => { dispatch({ type: 'SKIP_ITEM', id: current.exerciseId }); if (isLast) setFinalStatus('skipped'); };
  const save = async (wellness: WellnessEntry) => {
    const completedItemIds = finalStatus === 'completed' ? [...new Set([...state.completedItemIds, current.exerciseId])] : state.completedItemIds.filter((id) => id !== current.exerciseId);
    const skippedItemIds = finalStatus === 'skipped' ? [...new Set([...state.skippedItemIds, current.exerciseId])] : state.skippedItemIds.filter((id) => id !== current.exerciseId);
    await repository.completeSession({ id: state.date, date: state.date, plan: state.plan, source: state.source, templateId: state.templateId, status: 'completed', completedItemIds, skippedItemIds, performedItems: buildPerformedItems(state.plan, completedItemIds, skippedItemIds), elapsedSeconds: getElapsedSeconds(state), wellness, updatedAt: new Date().toISOString() });
    onFinish();
  };
  if (finalStatus) return <WellnessForm onSubmit={save} />;
  const elapsed = getElapsedSeconds(state, new Date(clock));
  const timeLabel = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  return <div className="runner"><div className="runner-bar"><button className="exit-session" onClick={onExit}><X size={18} /> Simpan & keluar</button><output aria-label="Durasi sesi">{timeLabel}</output></div><ExerciseCard target={current} index={state.itemIndex} total={state.plan.items.length} consent={videoConsent} onPrevious={() => dispatch({ type: 'PREVIOUS_ITEM' })} onComplete={complete} onSkip={skip} /></div>;
}
