import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { More } from './More';

describe('More', () => {
  it('offers every secondary destination', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<More onOpen={onOpen} />);
    for (const name of ['Jurnal Kondisi', 'Rutinitas Tahajjud', 'Pengingat Lokal', 'Pengaturan', 'Bantuan']) expect(screen.getByRole('button', { name: new RegExp(name, 'i') })).toBeVisible();
    await user.click(screen.getByRole('button', { name: /bantuan/i }));
    expect(onOpen).toHaveBeenCalledWith('help');
  });
});
