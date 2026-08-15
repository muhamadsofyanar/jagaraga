import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Journal } from './Journal';

describe('Journal', () => {
  it('updates one day and shows descending history', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<Journal today="2026-08-15" entries={[{ id: '2026-08-14', energy: 2, soreness: 3, sleepQuality: 3, stress: 4, breathlessness: 'exercise', note: 'Kemarin', updatedAt: 'x' }]} onSave={onSave} onBack={() => undefined} />);
    await user.click(screen.getByRole('radio', { name: /tidak engap/i }));
    await user.type(screen.getByLabelText(/catatan/i), 'Cukup nyaman');
    await user.click(screen.getByRole('button', { name: /simpan kondisi/i }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: '2026-08-15', breathlessness: 'none', note: 'Cukup nyaman' }));
    expect(screen.getByText('Kemarin')).toBeVisible();
  });
});
