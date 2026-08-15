import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { defaultSettings } from '../../persistence/repository';
import { Reminders } from './Reminders';

describe('Reminders', () => {
  it('saves a training time and explains both reminder paths', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Reminders settings={defaultSettings()} today="2026-08-15" onChange={onChange} onBack={() => undefined} />);
    expect(screen.getByText(/kalender hp adalah pengingat utama/i)).toBeVisible();
    expect(screen.getByText(/pwa ditutup/i)).toBeVisible();
    await user.clear(screen.getByLabelText(/waktu latihan/i)); await user.type(screen.getByLabelText(/waktu latihan/i), '07:00');
    await user.click(screen.getByRole('button', { name: /simpan pengingat/i }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ reminder: expect.objectContaining({ trainingTime: '07:00' }) }));
  });
});
