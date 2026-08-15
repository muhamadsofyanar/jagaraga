import { describe, expect, it } from 'vitest';
import { defaultSettings } from '../../persistence/repository';
import { buildCalendar } from './calendar';

describe('buildCalendar', () => {
  it('builds a stable CRLF calendar for training, bed, and wake times', () => {
    const settings = defaultSettings();
    settings.reminder = { enabled: true, trainingTime: '06:30', trainingDays: ['monday', 'wednesday', 'friday'], browserNotifications: false };
    settings.tahajjud = { enabled: true, bedTime: '22:00', wakeTime: '03:30', weekdays: ['monday', 'thursday'], mobilityMinutes: 3 };
    const calendar = buildCalendar(settings, '2026-08-17', 'Asia/Jakarta');
    expect(calendar).toMatch(/^BEGIN:VCALENDAR\r\n/);
    expect(calendar).toContain('BEGIN:VTIMEZONE\r\nTZID:Asia/Jakarta');
    expect(calendar).toContain('UID:training@jagaraga.local');
    expect(calendar).toContain('DTSTART;TZID=Asia/Jakarta:20260817T063000');
    expect(calendar).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR');
    expect(calendar).toContain('SUMMARY:Persiapan tidur JagaRaga');
    expect(calendar).toContain('SUMMARY:Bangun untuk tahajjud');
    expect(calendar).not.toMatch(/(?<!\r)\n/);
  });

  it('escapes punctuation in calendar text', () => {
    const calendar = buildCalendar(defaultSettings(), '2026-08-17', 'Asia/Jakarta');
    expect(calendar).toContain('DESCRIPTION:Latihan ringan\\, bertahap\\; tetap gunakan tes bicara.');
  });
});
