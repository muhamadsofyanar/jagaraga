import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { defaultSettings } from '../../persistence/repository';
import { Tahajjud } from './Tahajjud';

describe('Tahajjud', () => {
  it('saves routine settings and one daily reflection', async () => {
    const user = userEvent.setup();
    const onSettingsChange = vi.fn();
    const onSaveEntry = vi.fn();
    render(<Tahajjud settings={defaultSettings()} today="2026-08-15" entries={[]} onSettingsChange={onSettingsChange} onSaveEntry={onSaveEntry} onBack={() => undefined} />);
    await user.click(screen.getByRole('checkbox', { name: /aktifkan rutinitas/i }));
    await user.clear(screen.getByLabelText(/waktu tidur/i)); await user.type(screen.getByLabelText(/waktu tidur/i), '21:30');
    await user.selectOptions(screen.getByLabelText(/mobilitas ringan/i), '5');
    await user.click(screen.getByRole('button', { name: /simpan pengaturan/i }));
    expect(onSettingsChange).toHaveBeenCalledWith(expect.objectContaining({ tahajjud: expect.objectContaining({ enabled: true, bedTime: '21:30', mobilityMinutes: 5 }) }));
    await user.click(screen.getByRole('checkbox', { name: /sempat tahajjud/i }));
    await user.type(screen.getByLabelText(/catatan tahajjud/i), 'Lebih segar');
    await user.click(screen.getByRole('button', { name: /simpan catatan tahajjud/i }));
    expect(onSaveEntry).toHaveBeenCalledWith(expect.objectContaining({ id: '2026-08-15', prayed: true, note: 'Lebih segar' }));
  });
});
