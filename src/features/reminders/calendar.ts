import type { DayKey } from '../../domain/types';
import type { AppSettings } from '../../persistence/db';

const dayCodes: Record<DayKey, string> = { monday: 'MO', tuesday: 'TU', wednesday: 'WE', thursday: 'TH', friday: 'FR', saturday: 'SA', sunday: 'SU' };
const compactDate = (date: string) => date.replaceAll('-', '');
const compactTime = (time: string) => `${time.replace(':', '')}00`;
const escapeText = (value: string) => value.replaceAll('\\', '\\\\').replaceAll(';', '\\;').replaceAll(',', '\\,').replaceAll('\n', '\\n');

function event(uid: string, title: string, description: string, date: string, time: string, days: DayKey[], timeZone: string) {
  return [
    'BEGIN:VEVENT', `UID:${uid}@jagaraga.local`, 'DTSTAMP:20000101T000000Z',
    `DTSTART;TZID=${timeZone}:${compactDate(date)}T${compactTime(time)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${days.map((day) => dayCodes[day]).join(',')}`,
    `SUMMARY:${escapeText(title)}`, `DESCRIPTION:${escapeText(description)}`, 'END:VEVENT',
  ];
}

export function buildCalendar(settings: AppSettings, startDate: string, timeZone: string): string {
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//JagaRaga//Offline PWA//ID', 'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH', 'BEGIN:VTIMEZONE', `TZID:${timeZone}`, `X-LIC-LOCATION:${timeZone}`, 'END:VTIMEZONE',
    ...event('training', 'Latihan Mode 1 JagaRaga', 'Latihan ringan, bertahap; tetap gunakan tes bicara.', startDate, settings.reminder.trainingTime, settings.reminder.trainingDays, timeZone),
    ...event('bedtime', 'Persiapan tidur JagaRaga', 'Kurangi layar dan siapkan tidur agar tubuh pulih.', startDate, settings.tahajjud.bedTime, settings.tahajjud.weekdays, timeZone),
    ...event('tahajjud', 'Bangun untuk tahajjud', 'Bangun perlahan, minum air secukupnya, lalu lakukan mobilitas ringan bila perlu.', startDate, settings.tahajjud.wakeTime, settings.tahajjud.weekdays, timeZone),
    'END:VCALENDAR', '',
  ];
  return lines.join('\r\n');
}

export function downloadCalendar(content: string, filename = 'jagaraga-pengingat.ics') {
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}
