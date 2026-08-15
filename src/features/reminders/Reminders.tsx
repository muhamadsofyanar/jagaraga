import { ArrowLeft, Bell, CalendarPlus, Save } from 'lucide-react';
import { useState } from 'react';
import type { DayKey } from '../../domain/types';
import type { AppSettings } from '../../persistence/db';
import { buildCalendar, downloadCalendar } from './calendar';
import { getNotificationCapability, requestNotificationPermission, showTestNotification } from './notifications';

const days: { id: DayKey; label: string }[] = [{ id: 'monday', label: 'Sen' }, { id: 'tuesday', label: 'Sel' }, { id: 'wednesday', label: 'Rab' }, { id: 'thursday', label: 'Kam' }, { id: 'friday', label: 'Jum' }, { id: 'saturday', label: 'Sab' }, { id: 'sunday', label: 'Min' }];

export function Reminders({ settings, today, onChange, onBack }: { settings: AppSettings; today: string; onChange: (settings: AppSettings) => void | Promise<void>; onBack: () => void }) {
  const [reminder, setReminder] = useState(settings.reminder);
  const [status, setStatus] = useState(() => `Status notifikasi: ${getNotificationCapability()}.`);
  const toggleDay = (day: DayKey) => setReminder((value) => ({ ...value, trainingDays: value.trainingDays.includes(day) ? value.trainingDays.filter((item) => item !== day) : [...value.trainingDays, day] }));
  const download = () => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';
    downloadCalendar(buildCalendar({ ...settings, reminder }, today, timeZone));
  };
  return <section className="page-pad page-content reminders-page"><button className="back-button" onClick={onBack}><ArrowLeft size={18} /> Kembali</button><p className="eyebrow">JADWAL DI HP</p><h1>Pengingat Lokal</h1><p className="lead">Kalender HP adalah pengingat utama. Impor file .ics agar jadwal tetap bekerja di luar browser.</p>
    <div className="notice"><strong>Batas notifikasi browser</strong><p>Notifikasi mungkin tidak muncul ketika PWA ditutup atau sistem HP menghentikannya. Karena itu kalender tetap disarankan.</p></div>
    <section className="routine-card"><label className="switch-row"><span><strong>Aktifkan pengingat latihan</strong><small>Simpan pilihan hari dan jam</small></span><input type="checkbox" checked={reminder.enabled} onChange={(event) => setReminder({ ...reminder, enabled: event.target.checked })} /></label><label className="field"><span>Waktu latihan</span><input aria-label="Waktu latihan" type="time" value={reminder.trainingTime} onChange={(event) => setReminder({ ...reminder, trainingTime: event.target.value })} /></label><fieldset className="day-picker"><legend>Hari latihan</legend>{days.map((day) => <label key={day.id}><input type="checkbox" checked={reminder.trainingDays.includes(day.id)} onChange={() => toggleDay(day.id)} /><span>{day.label}</span></label>)}</fieldset><button className="secondary-button wide" onClick={() => void onChange({ ...settings, reminder })}><Save size={18} /> Simpan pengingat</button></section>
    <section className="routine-card"><CalendarPlus /><h2>Kalender latihan, tidur & tahajjud</h2><p>File berisi tiga jadwal mingguan sesuai pengaturan Anda. Setelah diunduh, buka file lalu pilih aplikasi Kalender di HP.</p><button className="primary wide" onClick={download}>Unduh kalender .ics</button></section>
    <section className="routine-card"><Bell /><h2>Notifikasi browser tambahan</h2><p>{status}</p><button className="secondary-button wide" onClick={async () => { const permission = await requestNotificationPermission(); setReminder((value) => ({ ...value, browserNotifications: permission === 'granted' })); setStatus(`Status notifikasi: ${permission}.`); }}>Minta izin notifikasi</button><button className="text-button wide" onClick={async () => setStatus(await showTestNotification())}>Kirim notifikasi uji</button></section>
  </section>;
}
