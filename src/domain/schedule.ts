import { EXERCISES_BY_ID } from '../catalog';
import { MODE1_SESSIONS, WEEK_VOLUME } from './mode1';
import type { DayKey, PlannedSession, ProgramWeek } from './types';

const DAYS: DayKey[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const localDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function getTodayPlan(date: Date, week: number): PlannedSession {
  if (![1, 2, 3, 4].includes(week)) throw new RangeError('Program week must be 1–4');
  const programWeek = week as ProgramWeek;
  const day = DAYS[date.getDay()];
  const session = MODE1_SESSIONS[day];
  const volume = WEEK_VOLUME[programWeek];
  const items = session.items.map((item) => {
    const kind = EXERCISES_BY_ID[item.exerciseId].kind;
    if (item.exerciseId === 'walk') return { ...item, minutes: volume.cardioMin };
    if (kind === 'strength') return { ...item, sets: volume.sets, reps: volume.repsMin };
    return { ...item };
  });

  return {
    ...session,
    estimatedMinutes: Math.max(session.estimatedMinutes, volume.cardioMin + 10),
    date: localDate(date),
    day,
    programWeek,
    items,
  };
}
