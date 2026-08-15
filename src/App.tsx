import { useEffect, useState } from 'react';
import { AppShell, type Destination } from './components/AppShell';
import { Onboarding } from './features/onboarding/Onboarding';
import { Today } from './features/today/Today';
import { Progress } from './features/progress/Progress';
import { Settings } from './features/settings/Settings';
import { MovementLibrary } from './features/library/MovementLibrary';
import { FreeSessionBuilder } from './features/free-session/FreeSessionBuilder';
import { createFreePlan } from './features/free-session/freeSession';
import { ReadinessCheck } from './components/ReadinessCheck';
import { exportBackup, importBackup } from './persistence/backup';
import type { ActiveSession, AppSettings, ExercisePreference, SessionLog } from './persistence/db';
import { repository } from './persistence/repository';
import { getTodayPlan } from './domain/schedule';
import { SessionRunner } from './session/SessionRunner';
import type { EquipmentId, FreeSessionTemplate, JournalEntry, PlannedSession, TahajjudEntry } from './domain/types';
import { Journal } from './features/journal/Journal';
import { Tahajjud } from './features/tahajjud/Tahajjud';
import { Reminders } from './features/reminders/Reminders';
import { More, type MoreView } from './features/more/More';
import { Help } from './features/help/Help';
import { SessionConfigurator } from './features/program/SessionConfigurator';

const MODE1_HOME_EQUIPMENT: EquipmentId[] = ['chair', 'wall', 'mat'];

const localDateId = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export function App() {
  const [settings, setSettings] = useState<AppSettings>();
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [active, setActive] = useState<ActiveSession>();
  const [templates, setTemplates] = useState<FreeSessionTemplate[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [tahajjudEntries, setTahajjudEntries] = useState<TahajjudEntry[]>([]);
  const [exercisePreferences, setExercisePreferences] = useState<ExercisePreference[]>([]);
  const [freeSeed, setFreeSeed] = useState<string>();
  const [journalOpen, setJournalOpen] = useState(false);
  const [toolView, setToolView] = useState<Exclude<MoreView, 'journal'>>();
  const [restoreStatus, setRestoreStatus] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [destination, setDestination] = useState<Destination>('today');
  const [checking, setChecking] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [configuredPlan, setConfiguredPlan] = useState<PlannedSession>();
  const [running, setRunning] = useState(false);

  const refresh = async () => {
    try {
      const [nextSettings, nextSessions, nextActive, nextTemplates, nextJournals, nextTahajjud, nextPreferences] = await Promise.all([repository.getSettings(), repository.listSessions(), repository.getActiveSession(), repository.listTemplates(), repository.listJournalEntries(), repository.listTahajjudEntries(), repository.listExercisePreferences()]);
      setSettings(nextSettings); setSessions(nextSessions); setActive(nextActive); setTemplates(nextTemplates); setJournals(nextJournals); setTahajjudEntries(nextTahajjud); setExercisePreferences(nextPreferences); setLoadError(false);
    } catch { setLoadError(true); }
  };

  useEffect(() => { void refresh(); }, []);
  useEffect(() => { if (settings) document.documentElement.dataset.theme = settings.theme; }, [settings]);
  const updateSettings = async (value: AppSettings) => { await repository.saveSettings(value); setSettings(value); };

  if (!settings && loadError) return <section className="load-error page-pad"><h1>Data belum berhasil dimuat</h1><p>Koneksi penyimpanan lokal mungkin sedang sibuk. Data lama tidak dihapus.</p><button className="primary" onClick={() => void refresh()}>Coba lagi</button></section>;
  if (!settings) return <div className="loading" aria-label="Memuat JagaRaga"><span /></div>;
  if (!settings.onboardingComplete) return <Onboarding onComplete={async (value) => { await repository.saveSettings(value); setSettings(value); }} />;
  if (journalOpen) return <Journal today={localDateId()} entries={journals} onBack={() => setJournalOpen(false)} onSave={async (entry) => { await repository.saveJournalEntry(entry); setJournals(await repository.listJournalEntries()); }} />;
  if (toolView === 'tahajjud') return <Tahajjud settings={settings} today={localDateId()} entries={tahajjudEntries} onBack={() => setToolView(undefined)} onSettingsChange={updateSettings} onSaveEntry={async (entry) => { await repository.saveTahajjudEntry(entry); setTahajjudEntries(await repository.listTahajjudEntries()); }} />;
  if (toolView === 'reminders') return <Reminders settings={settings} today={localDateId()} onBack={() => setToolView(undefined)} onChange={updateSettings} />;
  if (configuring && configuredPlan) return <SessionConfigurator plan={configuredPlan} preferences={exercisePreferences} ownedEquipment={MODE1_HOME_EQUIPMENT} onCancel={() => { setConfiguring(false); setConfiguredPlan(undefined); }} onContinue={(plan) => { setConfiguredPlan(plan); setConfiguring(false); setChecking(true); }} onSavePreference={async (preference) => { await repository.saveExercisePreference(preference); setExercisePreferences(await repository.listExercisePreferences()); }} />;
  if (checking) return <ReadinessCheck backLabel={configuredPlan ? 'Kembali ke pengaturan' : 'Kembali'} onCancel={() => { setChecking(false); if (configuredPlan && !active) setConfiguring(true); }} onClear={async () => {
    let current = active;
    if (!current) {
      const plan = configuredPlan ?? getTodayPlan(new Date(), settings.programWeek);
      current = { id: 'active', date: plan.date, plan, source: 'program', itemIndex: 0, completedItemIds: [], skippedItemIds: [], startedAt: new Date().toISOString(), timerStartedAt: new Date().toISOString(), elapsedBeforeTimer: 0 };
      await repository.saveActiveSession(current);
      setActive(current);
    }
    setChecking(false);
    setConfiguredPlan(undefined);
    setRunning(true);
  }} />;
  if (running && active) return <SessionRunner initial={active} repository={repository} videoConsent={settings.videoConsent} onExit={() => setRunning(false)} onFinish={async () => { setRunning(false); await refresh(); setDestination('progress'); }} />;

  const saveTemplate = async (template: FreeSessionTemplate) => { await repository.saveTemplate(template); setTemplates(await repository.listTemplates()); };
  const deleteTemplate = async (id: string) => { await repository.deleteTemplate(id); setTemplates(await repository.listTemplates()); };
  const startFreeSession = async (template: FreeSessionTemplate) => {
    const plan = createFreePlan(template, localDateId(), settings.programWeek);
    const current: ActiveSession = { id: 'active', date: plan.date, plan, source: 'free', templateId: template.id, itemIndex: 0, completedItemIds: [], skippedItemIds: [], startedAt: new Date().toISOString(), timerStartedAt: new Date().toISOString(), elapsedBeforeTimer: 0 };
    await repository.saveActiveSession(current); setActive(current); setConfiguredPlan(undefined); setChecking(true);
  };
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
      const counts = await importBackup(repository, raw);
      await refresh();
      setRestoreStatus(`Dipulihkan: ${counts.sessions} sesi, ${counts.journals} jurnal, ${counts.templates} template, ${counts.tahajjud} catatan tahajjud.`);
    } catch {
      window.alert('Cadangan tidak dapat dibaca. Data lama tetap aman.');
    }
  };

  if (toolView === 'settings') return <Settings settings={settings} restoreStatus={restoreStatus} onBack={() => setToolView(undefined)} onChange={updateSettings} onExport={downloadBackup} onImport={restore} onReset={reset} />;
  if (toolView === 'help') return <Help onBack={() => setToolView(undefined)} />;

  return <AppShell destination={destination} onNavigate={setDestination}>
    {destination === 'today' && <Today settings={settings} active={active} journal={journals.find((entry) => entry.id === localDateId())} onStart={() => { if (active) setRunning(true); else { setConfiguredPlan(getTodayPlan(new Date(), settings.programWeek)); setConfiguring(true); } }} onOpenJournal={() => setJournalOpen(true)} />}
    {destination === 'library' && <MovementLibrary videoConsent={settings.videoConsent} onAddToFreeSession={(exerciseId) => { setFreeSeed(exerciseId); setDestination('free'); }} />}
    {destination === 'free' && <FreeSessionBuilder templates={templates} initialExerciseId={freeSeed} onSave={saveTemplate} onDelete={deleteTemplate} onStart={startFreeSession} />}
    {destination === 'progress' && <Progress sessions={sessions} journals={journals} templates={templates} today={localDateId()} />}
    {destination === 'more' && <More onOpen={(view) => { if (view === 'journal') setJournalOpen(true); else setToolView(view); }} />}
  </AppShell>;
}
