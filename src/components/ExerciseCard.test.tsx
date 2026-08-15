import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { ExerciseCard } from './ExerciseCard';

test('shows the reviewed chair-squat illustration', () => {
  render(<ExerciseCard target={{ exerciseId: 'chair-squat', sets: 1, reps: 8 }} index={0} total={1} consent={false} onPrevious={vi.fn()} onComplete={vi.fn()} onSkip={vi.fn()} />);
  expect(screen.getByRole('img', { name: /contoh chair squat/i })).toHaveAttribute('src', '/movement/chair-squat.png');
});

test('shows a concrete illustration for every exercise kind', () => {
  render(<ExerciseCard target={{ exerciseId: 'shoulder-roll', reps: 10 }} index={0} total={1} consent={false} onPrevious={vi.fn()} onComplete={vi.fn()} onSkip={vi.fn()} />);
  expect(screen.getByRole('img', { name: /contoh putaran bahu/i })).toHaveAttribute('src', '/movement/shoulder-roll.png');
});

test('shows an accessible message when an illustration cannot load', () => {
  render(<ExerciseCard target={{ exerciseId: 'shoulder-roll', reps: 10 }} index={0} total={1} consent={false} onPrevious={vi.fn()} onComplete={vi.fn()} onSkip={vi.fn()} />);
  fireEvent.error(screen.getByRole('img', { name: /contoh putaran bahu/i }));
  expect(screen.getByRole('status')).toHaveTextContent('Ilustrasi Putaran bahu tidak dapat dimuat.');
});
