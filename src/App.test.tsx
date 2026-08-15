import { beforeEach, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { repository } from './persistence/repository';
import { App } from './App';

beforeEach(async () => {
  vi.restoreAllMocks();
  await repository.reset();
});

test('onboards the user and opens today', async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(await screen.findByRole('heading', { name: /mulai pelan/i })).toBeVisible();
  await user.click(screen.getByRole('button', { name: /lanjut/i }));
  await user.click(screen.getByRole('button', { name: /lanjut ke keamanan/i }));
  await user.click(screen.getByRole('checkbox', { name: /saya memahami/i }));
  await user.click(screen.getByRole('button', { name: /mulai mode 1/i }));
  await waitFor(() => expect(screen.getByRole('heading', { name: /hari ini/i })).toBeVisible());
});

test('shows five destinations and opens the movement library', async () => {
  await repository.saveSettings({ ...(await repository.getSettings()), onboardingComplete: true });
  const user = userEvent.setup();
  render(<App />);
  const navigation = await screen.findByRole('navigation', { name: /navigasi utama/i });
  expect(navigation).toHaveTextContent('Hari Ini');
  expect(navigation).toHaveTextContent('Pustaka');
  expect(navigation).toHaveTextContent('Sesi Bebas');
  expect(navigation).toHaveTextContent('Progres');
  expect(navigation).toHaveTextContent('Lainnya');
  await user.click(screen.getByRole('button', { name: /^pustaka$/i }));
  expect(screen.getByRole('heading', { name: /pustaka gerakan/i })).toBeVisible();
});

test('opens the sixty-item local catalog from the app shell', async () => {
  await repository.saveSettings({ ...(await repository.getSettings()), onboardingComplete: true });
  const user = userEvent.setup();
  render(<App />);
  await user.click(await screen.findByRole('button', { name: /^pustaka$/i }));
  expect(screen.getByText(/60 gerakan lokal/i)).toBeInTheDocument();
  expect([...document.querySelectorAll('img')].every((image) => image.getAttribute('src')?.startsWith('/movement/') ?? true)).toBe(true);
});

test('adds a library movement to the free session builder', async () => {
  await repository.saveSettings({ ...(await repository.getSettings()), onboardingComplete: true });
  const user = userEvent.setup();
  render(<App />);
  await user.click(await screen.findByRole('button', { name: /^pustaka$/i }));
  await user.type(screen.getByRole('searchbox', { name: /cari gerakan/i }), 'putaran bahu');
  await user.click(screen.getByRole('button', { name: /buka putaran bahu/i }));
  await user.click(screen.getByRole('button', { name: /tambah ke sesi bebas/i }));
  expect(screen.getByRole('heading', { name: /sesi bebas/i })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Putaran bahu' })).toBeVisible();
});

test('configures a fresh program session before readiness and persistence', async () => {
  await repository.saveSettings({ ...(await repository.getSettings()), onboardingComplete: true });
  const user = userEvent.setup();
  render(<App />);
  await user.click(await screen.findByRole('button', { name: /mulai latihan/i }));
  expect(screen.getByRole('heading', { name: /atur sesi hari ini/i })).toBeVisible();
  expect(await repository.getActiveSession()).toBeUndefined();
  await user.click(screen.getByRole('button', { name: /lanjut pemeriksaan kesiapan/i }));
  expect(screen.getByRole('heading', { name: /siap bergerak/i })).toBeVisible();
  expect(await repository.getActiveSession()).toBeUndefined();
  await user.click(screen.getByRole('button', { name: /mulai latihan/i }));
  await waitFor(async () => expect(await repository.getActiveSession()).toBeDefined());
});

test('resumes an existing active session without reopening configuration', async () => {
  const settings = { ...(await repository.getSettings()), onboardingComplete: true };
  await repository.saveSettings(settings);
  const plan = (await import('./domain/schedule')).getTodayPlan(new Date(), settings.programWeek);
  await repository.saveActiveSession({ id: 'active', date: plan.date, plan, source: 'program', itemIndex: 0, completedItemIds: [], skippedItemIds: [], startedAt: new Date().toISOString(), elapsedBeforeTimer: 0 });
  const user = userEvent.setup();
  render(<App />);
  await user.click(await screen.findByRole('button', { name: /lanjutkan sesi/i }));
  expect(screen.queryByRole('heading', { name: /atur sesi hari ini/i })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Jalan di tempat' })).toBeVisible();
});

test('opens the body journal from today and saves locally', async () => {
  await repository.saveSettings({ ...(await repository.getSettings()), onboardingComplete: true });
  const user = userEvent.setup();
  render(<App />);
  await user.click(await screen.findByRole('button', { name: /catat kondisi tubuh/i }));
  expect(screen.getByRole('heading', { name: /kondisi tubuh/i })).toBeVisible();
  await user.click(screen.getByRole('button', { name: /simpan kondisi/i }));
  await waitFor(async () => expect(await repository.listJournalEntries()).toHaveLength(1));
});

test('opens tahajjud and reminder tools from more', async () => {
  await repository.saveSettings({ ...(await repository.getSettings()), onboardingComplete: true });
  const user = userEvent.setup();
  render(<App />);
  await user.click(await screen.findByRole('button', { name: /^lainnya$/i }));
  await user.click(screen.getByRole('button', { name: /rutinitas tahajjud/i }));
  expect(screen.getByRole('heading', { name: /tahajjud & pemulihan/i })).toBeVisible();
  await user.click(screen.getByRole('button', { name: /^kembali$/i }));
  await user.click(screen.getByRole('button', { name: /pengingat lokal/i }));
  expect(screen.getByRole('heading', { name: /pengingat lokal/i })).toBeVisible();
});

test('offers retry after a recoverable loading error', async () => {
  await repository.saveSettings({ ...(await repository.getSettings()), onboardingComplete: true });
  vi.spyOn(repository, 'getSettings').mockRejectedValueOnce(new Error('temporary'));
  const user = userEvent.setup();
  render(<App />);
  expect(await screen.findByText(/data belum berhasil dimuat/i)).toBeVisible();
  await user.click(screen.getByRole('button', { name: /coba lagi/i }));
  expect(await screen.findByRole('heading', { name: /hari ini/i })).toBeVisible();
});

test('shows exact restored counts after importing a backup', async () => {
  const settings = { ...(await repository.getSettings()), onboardingComplete: true };
  await repository.saveSettings(settings);
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  const user = userEvent.setup();
  render(<App />);
  await user.click(await screen.findByRole('button', { name: /^lainnya$/i }));
  await user.click(screen.getByRole('button', { name: /^pengaturan/i }));
  const backup = JSON.stringify({ schemaVersion: 2, exportedAt: new Date().toISOString(), settings, sessions: [], journalEntries: [], freeSessionTemplates: [], tahajjudEntries: [] });
  const file = new File([backup], 'backup.json', { type: 'application/json' });
  Object.defineProperty(file, 'text', { value: async () => backup });
  await user.upload(screen.getByLabelText(/pilih cadangan progres/i), file);
  expect(await screen.findByRole('status')).toHaveTextContent('0 sesi, 0 jurnal, 0 template, 0 catatan tahajjud');
});
