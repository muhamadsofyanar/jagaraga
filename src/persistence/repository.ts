import type { ActiveSession, AppSettings, SessionLog } from './db';
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
});

export class ProgressRepository {
  constructor(public readonly db: JagaRagaDB = appDb) {}

  async getSettings() { return (await this.db.settings.get('settings')) ?? defaultSettings(); }
  async saveSettings(settings: AppSettings) { await this.db.settings.put(settings); }
  async getSession(id: string) { return this.db.sessions.get(id); }
  async listSessions() { return this.db.sessions.orderBy('date').toArray(); }
  async saveSession(session: SessionLog) { await this.db.sessions.put(session); }
  async getActiveSession() { return this.db.activeSessions.get('active'); }
  async saveActiveSession(active: ActiveSession) { await this.db.activeSessions.put(active); }
  async clearActiveSession() { await this.db.activeSessions.delete('active'); }

  async completeSession(log: SessionLog) {
    await this.db.transaction('rw', this.db.sessions, this.db.activeSessions, async () => {
      await this.db.sessions.put(log);
      await this.db.activeSessions.delete('active');
    });
  }

  async reset() {
    await this.db.transaction('rw', this.db.settings, this.db.sessions, this.db.activeSessions, async () => {
      await Promise.all([this.db.settings.clear(), this.db.sessions.clear(), this.db.activeSessions.clear()]);
    });
  }
}

export const repository = new ProgressRepository();
