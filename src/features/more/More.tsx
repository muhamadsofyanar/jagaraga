import { Bell, BookHeart, ChevronRight, CircleHelp, MoonStar, Settings as SettingsIcon } from 'lucide-react';

export type MoreView = 'journal' | 'tahajjud' | 'reminders' | 'settings' | 'help';

const items = [
  { id: 'journal' as const, title: 'Jurnal Kondisi', description: 'Energi, tidur, pegal, stres, dan napas', Icon: BookHeart },
  { id: 'tahajjud' as const, title: 'Rutinitas Tahajjud', description: 'Tidur, bangun, mobilitas, dan refleksi', Icon: MoonStar },
  { id: 'reminders' as const, title: 'Pengingat Lokal', description: 'Kalender .ics dan notifikasi tambahan', Icon: Bell },
  { id: 'settings' as const, title: 'Pengaturan', description: 'Mode 1, video, data, dan tampilan', Icon: SettingsIcon },
  { id: 'help' as const, title: 'Bantuan', description: 'Instalasi, offline, pembaruan, dan keamanan', Icon: CircleHelp },
];

export function More({ onOpen }: { onOpen: (view: MoreView) => void }) {
  return <section className="page-pad page-content more-page"><p className="eyebrow">SEMUA TERSIMPAN DI HP</p><h1>Lainnya</h1><p className="lead">Rutinitas pendukung dan kendali data JagaRaga.</p><div className="more-menu">{items.map(({ id, title, description, Icon }) => <button key={id} onClick={() => onOpen(id)}><Icon /><span><strong>{title}</strong><small>{description}</small></span><ChevronRight /></button>)}</div><div className="privacy-block"><strong>Privasi sederhana</strong><p>Tanpa akun, iklan, analitik, atau pelacak lokasi. Ekspor cadangan sebelum mengganti HP atau menghapus data browser.</p></div></section>;
}
