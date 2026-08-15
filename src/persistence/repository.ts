import type { ActiveSession, AppSettings, SessionLog } from './db';
import type { FreeSessionTemplate, JournalEntry, TahajjudEntry } from '../domain/types';
import { JagaRagaDB, appDb } from './db';

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const defaultSettings = (): AppSettings => ({
  id: 'settings',
  startDate: today(),
  programWeek: 1,
  theme: 'system',
  videoConsent: false,
  onboardingComplete: false,
  reminder: {
    enabled: false,
    trainingTime: '06:00',
    trainingDays: ['monday', 'wednesday', 'friday'],
    browserNotifications: false,
  },
  tahajjud: {
    enabled: false,
    bedTime: '22:00',
    wakeTime: '03:30',
    weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    mobilityMinutes: 3,
  },
});

export class ProgressRepository {
  constructor(public readonly db: JagaRagaDB = appDb) {}

  async getSettings() {
    const stored = await this.db.settings.get('settings');
    if (!stored) return defaultSettings();
    const defaults = defaultSettings();
    return {
      ...defaults,
      ...stored,
      reminder: { ...defaults.reminder, ...stored.reminder },
      tahajjud: { ...defaults.tahajjud, ...stored.tahajjud },
    };
  }
  async saveSettings(settings: AppSettings) { await this.db.settings.put(settings); }
  async getSession(id: string) { return this.db.sessions.get(id); }
  async listSessions() { return this.db.sessions.orderBy('date').toArray(); }
  async saveSession(session: SessionLog) { await this.db.sessions.put(session); }
  async getActiveSession() { return this.db.activeSessions.get('active'); }
  async saveActiveSession(active: ActiveSession) { await this.db.activeSessions.put(active); }
  async clearActiveSession() { await this.db.activeSessions.delete('active'); }
  async listJournalEntries() { return this.db.journalEntries.orderBy('id').toArray(); }
  async saveJournalEntry(entry: JournalEntry) { await this.db.journalEntries.put(entry); }
  async listTemplates() { return this.db.freeSessionTemplates.orderBy('updatedAt').toArray(); }
  async saveTemplate(template: FreeSessionTemplate) { await this.db.freeSessionTemplates.put(template); }
  async deleteTemplate(id: string) { await this.db.freeSessionTemplates.delete(id); }
  async listTahajjudEntries() { return this.db.tahajjudEntries.orderBy('id').toArray(); }
  async saveTahajjudEntry(entry: TahajjudEntry) { await this.db.tahajjudEntries.put(entry); }

  async completeSession(log: SessionLog) {
    await this.db.transaction('rw', this.db.sessions, this.db.activeSessions, async () => {
      await this.db.sessions.put(log);
      await this.db.activeSessions.delete('active');
    });
  }

  async reset() {
    await this.db.transaction('rw', [this.db.settings, this.db.sessions, this.db.activeSessions, this.db.journalEntries, this.db.freeSessionTemplates, this.db.tahajjudEntries], async () => {
      await Promise.all([
        this.db.settings.clear(), this.db.sessions.clear(), this.db.activeSessions.clear(),
        this.db.journalEntries.clear(), this.db.freeSessionTemplates.clear(), this.db.tahajjudEntries.clear(),
      ]);
    });
  }
}

export const repository = new ProgressRepository();
