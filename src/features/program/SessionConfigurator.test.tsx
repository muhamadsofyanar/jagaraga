import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ConfiguredExerciseTarget } from '../../domain/types';
import { getTodayPlan } from '../../domain/schedule';
import { SessionConfigurator } from './SessionConfigurator';

const strengthPlan = getTodayPlan(new Date(2026, 7, 18), 1);

describe('SessionConfigurator', () => {
  it('replaces one item, warns for harder equipment work, and continues with provenance', async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();
    render(<SessionConfigurator plan={strengthPlan} preferences={[]} ownedEquipment={['chair', 'water-bottles']} onCancel={() => undefined} onContinue={onContinue} onSavePreference={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /atur sesi hari ini/i })).toBeVisible();
    expect(screen.getByText(/perkiraan/i)).toBeVisible();
    await user.click(screen.getByRole('button', { name: /ganti chair squat/i }));
    expect(screen.getAllByRole('option')).toHaveLength(10);
    await user.click(screen.getByRole('option', { name: /goblet squat/i }));
    expect(screen.getByRole('dialog', { name: /konfirmasi gerakan/i })).toBeVisible();
    await user.click(screen.getByRole('button', { name: /saya mengerti, gunakan/i }));
    await user.click(screen.getByRole('button', { name: /lanjut pemeriksaan kesiapan/i }));
    expect(onContinue.mock.calls[0][0].items.some((item: ConfiguredExerciseTarget) => item.exerciseId === 'bottle-goblet-squat' && item.plannedExerciseId === 'chair-squat')).toBe(true);
  });

  it('saves a preferred replacement only after explicit opt-in', async () => {
    const user = userEvent.setup();
    const onSavePreference = vi.fn();
    render(<SessionConfigurator plan={strengthPlan} preferences={[]} ownedEquipment={['chair']} onCancel={() => undefined} onContinue={() => undefined} onSavePreference={onSavePreference} />);
    await user.click(screen.getByRole('button', { name: /ganti chair squat/i }));
    await user.click(screen.getByRole('checkbox', { name: /jadikan pilihan utama/i }));
    await user.click(screen.getByRole('option', { name: /duduk ke berdiri/i }));
    expect(onSavePreference).toHaveBeenCalledWith(expect.objectContaining({ originalExerciseId: 'chair-squat', replacementExerciseId: 'sit-to-stand' }));
  });

  it('can restore one item and reset every stored preference change', async () => {
    const user = userEvent.setup();
    const preferences = [{ originalExerciseId: 'chair-squat', replacementExerciseId: 'sit-to-stand', updatedAt: '2026-08-15T00:00:00.000Z' }];
    render(<SessionConfigurator plan={strengthPlan} preferences={preferences} ownedEquipment={['chair']} onCancel={() => undefined} onContinue={() => undefined} onSavePreference={() => undefined} />);
    expect(screen.getByText(/pengganti dari chair squat/i)).toBeVisible();
    await user.click(screen.getByRole('button', { name: /kembalikan bawaan chair squat/i }));
    expect(screen.queryByText(/pengganti dari chair squat/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /ganti chair squat/i }));
    await user.click(screen.getByRole('option', { name: /duduk ke berdiri/i }));
    await user.click(screen.getByRole('button', { name: /reset semua perubahan/i }));
    expect(screen.queryByText(/pengganti dari chair squat/i)).not.toBeInTheDocument();
  });

  it('moves focus into overlays and returns it to the change button', async () => {
    const user = userEvent.setup();
    render(<SessionConfigurator plan={strengthPlan} preferences={[]} ownedEquipment={['chair']} onCancel={() => undefined} onContinue={() => undefined} onSavePreference={() => undefined} />);
    const trigger = screen.getByRole('button', { name: /ganti chair squat/i });
    await user.click(trigger);
    const close = screen.getByRole('button', { name: /tutup pilihan pengganti/i });
    expect(close).toHaveFocus();
    await user.click(screen.getByRole('option', { name: /goblet squat/i }));
    expect(screen.getByRole('dialog', { name: /konfirmasi gerakan/i })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: /^batal$/i }));
    await waitFor(() => expect(close).toHaveFocus());
    await user.click(close);
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
