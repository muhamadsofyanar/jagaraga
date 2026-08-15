import type { SessionLog } from '../../persistence/db';

export interface WeekReview { outcome: 'advance' | 'repeat' | 'assessment'; reasons: string[]; }

export function reviewWeek(logs: SessionLog[]): WeekReview {
  const completed = logs.filter((log) => log.status === 'completed');
  const highBreathlessness = completed.filter((log) => (log.wellness?.breathlessness ?? 0) >= 8).length;
  const highSoreness = completed.filter((log) => (log.wellness?.soreness ?? 0) > 7).length;
  if (logs.some((log) => log.warningFlag) || highBreathlessness >= 2) return { outcome: 'assessment', reasons: ['Keluhan tinggi tercatat lebih dari sekali. Jangan menaikkan intensitas sebelum dinilai tenaga kesehatan.'] };
  if (completed.length < 4 || highSoreness >= 2) return { outcome: 'repeat', reasons: ['Ulangi minggu ini agar tubuh mendapat waktu adaptasi.'] };
  return { outcome: 'advance', reasons: ['Empat sesi selesai dengan pemulihan yang cukup nyaman.'] };
}
