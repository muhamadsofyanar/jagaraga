import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { ExerciseCard } from './ExerciseCard';

test('shows the reviewed chair-squat illustration', () => {
  render(<ExerciseCard target={{ exerciseId: 'chair-squat', sets: 1, reps: 8 }} index={0} total={1} consent={false} onPrevious={vi.fn()} onComplete={vi.fn()} onSkip={vi.fn()} />);
  expect(screen.getByRole('img', { name: /contoh chair squat/i })).toHaveAttribute('src', '/movement/chair-squat.png');
});
