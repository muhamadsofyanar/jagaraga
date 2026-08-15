import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EXERCISES_BY_ID } from '../../catalog';
import { ExerciseDetail } from './ExerciseDetail';

describe('ExerciseDetail', () => {
  it('shows all benefit and safety layers without requiring video', () => {
    const exercise = EXERCISES_BY_ID['pelvic-tilt'];
    render(<ExerciseDetail exercise={exercise} videoConsent={false} onBack={() => undefined} onAdd={() => undefined} />);

    expect(screen.getByRole('heading', { name: /manfaat/i })).toBeVisible();
    expect(screen.getByText(exercise.benefits.muscles)).toBeVisible();
    expect(screen.getByText(exercise.benefits.joints)).toBeVisible();
    expect(screen.getByText(exercise.benefits.dailyFunction)).toBeVisible();
    expect(screen.getByText(exercise.benefits.fitness)).toBeVisible();
    expect(screen.getByText('Lebih ringan & lebih menantang')).toBeVisible();
    expect(screen.getByText(exercise.progression)).toBeInTheDocument();
    expect(screen.getByText(/1 set/i)).toBeVisible();
    expect(screen.queryByTitle(/video/i)).not.toBeInTheDocument();
  });

  it('falls back to a useful message when the illustration fails', () => {
    const exercise = EXERCISES_BY_ID['pelvic-tilt'];
    render(<ExerciseDetail exercise={exercise} videoConsent={false} onBack={() => undefined} onAdd={() => undefined} />);
    fireEvent.error(screen.getByAltText(`Contoh ${exercise.title}`));
    expect(screen.getByRole('status')).toHaveTextContent(`Ilustrasi ${exercise.title} tidak dapat dimuat.`);
  });

  it('calls the navigation and add actions', () => {
    const onBack = vi.fn();
    const onAdd = vi.fn();
    render(<ExerciseDetail exercise={EXERCISES_BY_ID['pelvic-tilt']} videoConsent={false} onBack={onBack} onAdd={onAdd} />);
    fireEvent.click(screen.getByRole('button', { name: /kembali/i }));
    fireEvent.click(screen.getByRole('button', { name: /tambah ke sesi bebas/i }));
    expect(onBack).toHaveBeenCalledOnce();
    expect(onAdd).toHaveBeenCalledOnce();
  });
});
