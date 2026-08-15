import { useEffect, useState } from 'react';
import { AppShell, type Destination } from './components/AppShell';
import { Onboarding } from './features/onboarding/Onboarding';
import { Today } from './features/today/Today';
import { Program } from './features/program/Program';
import { Progress } from './features/progress/Progress';
import { Settings } from './features/settings/Settings';
import { ReadinessCheck } from './components/ReadinessCheck';
import { exportBackup, importBackup } from './persistence/backup';
import type { ActiveSession, AppSettings, SessionLog } from './persistence/db';
import { repository } from './persistence/repository';
import { getTodayPlan } from './domain/schedule';
import { SessionRunner } from './session/SessionRunner';

export function App() {
  const [settings, setSettings] = useState<AppSettings>();
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [active, setActive] = useState<ActiveSession>();
  const [destination, setDestination] = useState<Destination>('today');
  const [checking, setChecking] = useState(false);
  const [running, setRunning] = useState(false);

  const refresh = async () => {
    setSettings(await repository.getSettings());
    setSessions(await repository.listSessions());
    setActive(await repository.getActiveSession());
  };

  useEffect(() => { void refresh(); }, []);
  useEffect(() => { if (settings) document.documentElement.dataset.theme = settings.theme; }, [settings]);

  if (!settings) return <div className="loading" aria-label="Memuat JagaRaga"><span /></div>;
  if (!settings.onboardingComplete) return <Onboarding onComplete={async (value) => { await repository.saveSettings(value); setSettings(value); }} />;
  if (checking) return <ReadinessCheck onCancel={() => setChecking(false)} onClear={async () => {
    let current = active;
    if (!current) {
      const plan = getTodayPlan(new Date(), settings.programWeek);
      current = { id: 'active', date: plan.date, plan, itemIndex: 0, completedItemIds: [], skippedItemIds: [], startedAt: new Date().toISOString(), timerStartedAt: new Date().toISOString(), elapsedBeforeTimer: 0 };
      await repository.saveActiveSession(current);
      setActive(current);
    }
    setChecking(false);
    setRunning(true);
  }} />;
  if (running && active) return <SessionRunner initial={active} repository={repository} videoConsent={settings.videoConsent} onExit={() => setRunning(false)} onFinish={async () => { setRunning(false); await refresh(); setDestination('progress'); }} />;

  const updateSettings = async (value: AppSettings) => { await repository.saveSettings(value); setSettings(value); };
  const downloadBackup = async () => {
    const content = await exportBackup(repository);
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    anchor.download = `jagaraga-${new Date().toISOString().slice(0,10)}.json`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };
  const reset = async () => {
    if (window.prompt('Ketik HAPUS PROGRES untuk melanjutkan') !== 'HAPUS PROGRES') return;
    await repository.reset();
    await refresh();
  };
  const restore = async (file: File) => {
    try {
      const raw = await file.text();
      if (!window.confirm('Ganti progres di HP ini dengan isi cadangan?')) return;
      await importBackup(repository, raw);
      await refresh();
      window.alert('Progres berhasil dipulihkan.');
    } catch {
      window.alert('Cadangan tidak dapat dibaca. Data lama tetap aman.');
    }
  };

  return <AppShell destination={destination} onNavigate={setDestination}>
    {destination === 'today' && <Today settings={settings} active={active} onStart={() => setChecking(true)} />}
    {destination === 'program' && <Program settings={settings} />}
    {destination === 'progress' && <Progress sessions={sessions} />}
    {destination === 'settings' && <Settings settings={settings} onChange={updateSettings} onExport={downloadBackup} onImport={restore} onReset={reset} />}
  </AppShell>;
}
