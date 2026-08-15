import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Help } from './Help';

describe('Help', () => {
  it('explains install, offline, update, backup, and urgent symptoms', () => {
    render(<Help onBack={() => undefined} />);
    expect(screen.getByText(/android/i)).toBeVisible();
    expect(screen.getByText(/add to home screen/i)).toBeVisible();
    expect(screen.getByText(/refresh setelah deploy/i)).toBeVisible();
    expect(screen.getByText(/video.*internet/i)).toBeVisible();
    expect(screen.getByText(/ekspor.*cadangan/i)).toBeVisible();
    expect(screen.getByText(/nyeri dada.*sesak/i)).toBeVisible();
  });
});
