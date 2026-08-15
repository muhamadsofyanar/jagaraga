import type { ReactNode } from 'react';
import { BookOpen, ChartNoAxesColumnIncreasing, Dumbbell, Home, MoreHorizontal } from 'lucide-react';

export type Destination = 'today' | 'library' | 'free' | 'progress' | 'more';

const items = [
  { id: 'today' as const, label: 'Hari Ini', Icon: Home },
  { id: 'library' as const, label: 'Pustaka', Icon: BookOpen },
  { id: 'free' as const, label: 'Sesi Bebas', Icon: Dumbbell },
  { id: 'progress' as const, label: 'Progres', Icon: ChartNoAxesColumnIncreasing },
  { id: 'more' as const, label: 'Lainnya', Icon: MoreHorizontal },
];

export function AppShell({ destination, onNavigate, children }: { destination: Destination; onNavigate: (value: Destination) => void; children: ReactNode }) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Lewati ke konten</a>
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">JR</div>
        <div><strong>JagaRaga</strong><span>Mode 1 · Adaptasi tubuh</span></div>
      </header>
      <main id="main">{children}</main>
      <nav className="bottom-nav" aria-label="Navigasi utama">
        {items.map(({ id, label, Icon }) => (
          <button key={id} className={destination === id ? 'active' : ''} aria-current={destination === id ? 'page' : undefined} onClick={() => onNavigate(id)}>
            <Icon size={21} strokeWidth={2.2} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
