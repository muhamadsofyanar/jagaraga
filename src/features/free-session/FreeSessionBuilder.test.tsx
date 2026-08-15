import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FreeSessionBuilder } from './FreeSessionBuilder';

describe('FreeSessionBuilder', () => {
  it('adds, reorders, saves, and starts a valid session', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onStart = vi.fn();
    render(<FreeSessionBuilder templates={[]} onSave={onSave} onDelete={() => undefined} onStart={onStart} />);

    await user.selectOptions(screen.getByLabelText(/pilih gerakan/i), 'march');
    await user.click(screen.getByRole('button', { name: /tambahkan gerakan/i }));
    await user.selectOptions(screen.getByLabelText(/pilih gerakan/i), 'shoulder-roll');
    await user.click(screen.getByRole('button', { name: /tambahkan gerakan/i }));
    const second = screen.getByTestId('free-item-1');
    await user.click(within(second).getByRole('button', { name: /pindah ke atas/i }));
    expect(screen.getAllByRole('heading', { level: 2 })[0]).toHaveTextContent('Putaran bahu');

    await user.type(screen.getByLabelText(/nama template/i), 'Rutinitas pagi');
    await user.click(screen.getByRole('button', { name: /simpan template/i }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Rutinitas pagi' }));
    await user.click(screen.getByRole('button', { name: /mulai sesi bebas/i }));
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ items: expect.any(Array) }));
  });

  it('loads and deletes a saved template after confirmation', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<FreeSessionBuilder templates={[{ id: 'ringan', name: 'Ringan', items: [{ exerciseId: 'march', seconds: 60 }], createdAt: 'x', updatedAt: 'x' }]} onSave={() => undefined} onDelete={onDelete} onStart={() => undefined} />);
    await user.selectOptions(screen.getByLabelText(/template tersimpan/i), 'ringan');
    expect(screen.getByRole('heading', { name: 'Jalan di tempat' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: /hapus template/i }));
    expect(onDelete).toHaveBeenCalledWith('ringan');
  });
});
