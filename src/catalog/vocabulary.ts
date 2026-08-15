import type { BodyRegion, Difficulty, EquipmentId, MovementGoal, MovementGroup, MovementPosition } from '../domain/types';

export const MOVEMENT_GROUPS = ['warmup-mobility', 'low-impact-cardio', 'lower-strength', 'upper-strength', 'core-posture', 'balance', 'cooldown-recovery'] as const satisfies readonly MovementGroup[];
export const DIFFICULTIES = ['light', 'moderate', 'higher'] as const satisfies readonly Difficulty[];
export const MOVEMENT_POSITIONS = ['standing', 'seated', 'floor', 'supine', 'prone'] as const satisfies readonly MovementPosition[];
export const EQUIPMENT_IDS = ['chair', 'wall', 'mat', 'water-bottles', 'resistance-band', 'light-dumbbells'] as const satisfies readonly EquipmentId[];
export const BODY_REGIONS = ['full-body', 'neck', 'shoulders', 'chest', 'upper-back', 'lower-back', 'core', 'hips', 'thighs', 'glutes', 'knees', 'calves', 'ankles', 'arms'] as const satisfies readonly BodyRegion[];
export const MOVEMENT_GOALS = ['mobility', 'cardio', 'strength', 'posture', 'balance', 'recovery'] as const satisfies readonly MovementGoal[];

export const groupLabels: Record<MovementGroup, string> = {
  'warmup-mobility': 'Pemanasan & mobilitas',
  'low-impact-cardio': 'Kardio low-impact',
  'lower-strength': 'Kekuatan tubuh bawah',
  'upper-strength': 'Kekuatan tubuh atas',
  'core-posture': 'Inti & postur',
  balance: 'Keseimbangan',
  'cooldown-recovery': 'Pendinginan & pemulihan',
};

export const difficultyLabels: Record<Difficulty, string> = { light: 'Ringan', moderate: 'Menengah', higher: 'Lebih menantang' };
export const equipmentLabels: Record<EquipmentId, string> = {
  chair: 'Kursi kokoh', wall: 'Dinding kokoh', mat: 'Matras', 'water-bottles': 'Botol air',
  'resistance-band': 'Resistance band', 'light-dumbbells': 'Dumbbell ringan',
};

export const positionLabels: Record<MovementPosition, string> = {
  standing: 'Berdiri', seated: 'Duduk', floor: 'Di lantai', supine: 'Telentang', prone: 'Tengkurap',
};

export const bodyRegionLabels: Record<BodyRegion, string> = {
  'full-body': 'Seluruh tubuh', neck: 'Leher', shoulders: 'Bahu', chest: 'Dada', 'upper-back': 'Punggung atas',
  'lower-back': 'Punggung bawah', core: 'Inti tubuh', hips: 'Pinggul', thighs: 'Paha', glutes: 'Bokong', knees: 'Lutut',
  calves: 'Betis', ankles: 'Pergelangan kaki', arms: 'Lengan',
};

export const goalLabels: Record<MovementGoal, string> = {
  mobility: 'Mobilitas', cardio: 'Kardio', strength: 'Kekuatan', posture: 'Postur', balance: 'Keseimbangan', recovery: 'Pemulihan',
};
