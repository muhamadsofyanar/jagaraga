import type { ActiveSession } from '../persistence/db';

export type SessionAction =
  | { type: 'COMPLETE_ITEM'; id: string }
  | { type: 'SKIP_ITEM'; id: string }
  | { type: 'NEXT_ITEM' }
  | { type: 'PREVIOUS_ITEM' }
  | { type: 'START_TIMER'; at: string }
  | { type: 'PAUSE_TIMER'; at: string };

const unique = (items: string[]) => [...new Set(items)];
const forward = (state: ActiveSession) => Math.min(state.itemIndex + 1, state.plan.items.length - 1);

export function sessionReducer(state: ActiveSession, action: SessionAction): ActiveSession {
  switch (action.type) {
    case 'COMPLETE_ITEM': return { ...state, completedItemIds: unique([...state.completedItemIds, action.id]), skippedItemIds: state.skippedItemIds.filter((id) => id !== action.id), itemIndex: forward(state) };
    case 'SKIP_ITEM': return { ...state, skippedItemIds: unique([...state.skippedItemIds, action.id]), completedItemIds: state.completedItemIds.filter((id) => id !== action.id), itemIndex: forward(state) };
    case 'NEXT_ITEM': return { ...state, itemIndex: forward(state) };
    case 'PREVIOUS_ITEM': return { ...state, itemIndex: Math.max(0, state.itemIndex - 1) };
    case 'START_TIMER': return { ...state, timerStartedAt: action.at };
    case 'PAUSE_TIMER': return { ...state, elapsedBeforeTimer: getElapsedSeconds(state, new Date(action.at)), timerStartedAt: undefined };
  }
}

export function getElapsedSeconds(state: ActiveSession, now = new Date()) {
  if (!state.timerStartedAt) return state.elapsedBeforeTimer;
  return state.elapsedBeforeTimer + Math.max(0, Math.floor((now.getTime() - new Date(state.timerStartedAt).getTime()) / 1000));
}
