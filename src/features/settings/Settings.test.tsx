import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { defaultSettings } from '../../persistence/repository';
import { Settings } from './Settings';

describe('Settings', () => {
  it('shows reminder summaries and restored counts', () => {
    const settings = defaultSettings();
    settings.reminder.enabled = true;
    settings.tahajjud.enabled = true;
    render(<Settings settings={settings} restoreStatus="Dipulihkan: 2 sesi, 3 jurnal, 1 template, 4 catatan tahajjud." onChange={() => undefined} onExport={() => undefined} onImport={() => undefined} onReset={() => undefined} onBack={() => undefined} />);
    expect(screen.getByText(/pengingat latihan aktif/i)).toBeVisible();
    expect(screen.getByText(/rutinitas tahajjud aktif/i)).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('2 sesi');
  });
});
