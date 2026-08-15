import type { JournalEntry } from '../../domain/types';
import type { SessionLog } from '../../persistence/db';

export interface WeeklyEvaluation {
  outcome: 'maintain' | 'advance' | 'lighten' | 'assess';
  reasons: string[];
}

const dateNumber = (id: string) => new Date(`${id}T12:00:00`).getTime();
const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);

export function evaluateWeek(sessions: SessionLog[], journals: JournalEntry[], today: string): WeeklyEvaluation {
  const end = dateNumber(today);
  const start = end - 6 * 86400000;
  const recentJournals = journals.filter((entry) => dateNumber(entry.id) >= start && dateNumber(entry.id) <= end).sort((a, b) => a.id.localeCompare(b.id));
  const completed = sessions.filter((session) => session.status === 'completed' && dateNumber(session.date) >= start && dateNumber(session.date) <= end);
  if (recentJournals.some((entry) => entry.breathlessness === 'ordinary')) return { outcome: 'assess', reasons: ['Engap tercatat saat aktivitas biasa.', 'Tunda kenaikan latihan dan pertimbangkan pemeriksaan tenaga kesehatan.'] };
  const sorenessAverage = average(recentJournals.map((entry) => entry.soreness));
  const lastThree = recentJournals.slice(-3);
  const worsening = lastThree.length === 3 && lastThree[0].soreness < lastThree[1].soreness && lastThree[1].soreness < lastThree[2].soreness;
  if (recentJournals.length && (sorenessAverage >= 7 || worsening)) return { outcome: 'lighten', reasons: [sorenessAverage >= 7 ? `Rata-rata pegal ${sorenessAverage.toFixed(1)} dari 10.` : 'Pegal meningkat pada tiga catatan terakhir.', 'Kurangi volume dan pilih gerakan pemulihan.'] };
  const energyAverage = average(recentJournals.map((entry) => entry.energy));
  const sleepAverage = average(recentJournals.map((entry) => entry.sleepQuality));
  if (completed.length >= 3 && recentJournals.length > 0 && energyAverage >= 3 && sleepAverage >= 3) return { outcome: 'advance', reasons: [`${completed.length} sesi selesai dalam 7 hari.`, `Rata-rata energi ${energyAverage.toFixed(1)} dan tidur ${sleepAverage.toFixed(1)}.`] };
  return { outcome: 'maintain', reasons: [`${completed.length} sesi selesai dalam 7 hari.`, 'Pertahankan beban sampai tubuh terasa konsisten.'] };
}
