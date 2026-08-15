import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MovementLibrary } from './MovementLibrary';

describe('MovementLibrary', () => {
  it('searches, opens a movement detail, and adds it to a free session', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<MovementLibrary videoConsent={false} onAddToFreeSession={onAdd} />);

    await user.type(screen.getByRole('searchbox', { name: /cari gerakan/i }), 'putaran bahu');
    await user.click(screen.getByRole('button', { name: /buka putaran bahu/i }));
    expect(screen.getByRole('heading', { name: 'Putaran bahu' })).toBeVisible();
    expect(screen.getByAltText(/contoh putaran bahu/i)).toBeVisible();
    await user.click(screen.getByRole('button', { name: /tambah ke sesi bebas/i }));
    expect(onAdd).toHaveBeenCalledWith('shoulder-roll');
  });

  it('shows a clear empty state', async () => {
    const user = userEvent.setup();
    render(<MovementLibrary videoConsent={false} onAddToFreeSession={() => undefined} />);
    await user.type(screen.getByRole('searchbox', { name: /cari gerakan/i }), 'xyz-not-found');
    expect(screen.getByText(/belum ada gerakan yang cocok/i)).toBeVisible();
  });
});
