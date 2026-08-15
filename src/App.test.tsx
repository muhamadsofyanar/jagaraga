import { beforeEach, expect, test } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { repository } from './persistence/repository';
import { App } from './App';

beforeEach(async () => {
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

test('navigates to the four-week program', async () => {
  await repository.saveSettings({ ...(await repository.getSettings()), onboardingComplete: true });
  const user = userEvent.setup();
  render(<App />);
  await user.click(await screen.findByRole('button', { name: /^program$/i }));
  expect(screen.getByRole('heading', { name: /program mode 1/i })).toBeVisible();
  expect(screen.getByText(/minggu 4/i)).toBeVisible();
});
