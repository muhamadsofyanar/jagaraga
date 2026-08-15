import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { VideoEmbed } from './VideoEmbed';
import type { VideoSource } from './videos';

const source: VideoSource = { id: 'senam-low-impact', title: 'Senam Low Impact', provider: 'youtube', providerName: 'Kementerian Kesehatan RI', videoId: '2lMQP5Ohx_U', originalUrl: 'https://www.youtube.com/watch?v=2lMQP5Ohx_U', verifiedAt: '2026-08-15', captionsVerified: false };

test('does not load third-party video without consent', () => {
  render(<VideoEmbed source={source} consent={false} online />);
  expect(screen.queryByTitle('Senam Low Impact')).not.toBeInTheDocument();
  expect(screen.getByText(/izin video belum diberikan/i)).toBeVisible();
});

test('uses the privacy-enhanced embed after consent', () => {
  render(<VideoEmbed source={source} consent online />);
  expect(screen.getByTitle('Senam Low Impact')).toHaveAttribute('src', expect.stringContaining('youtube-nocookie.com/embed/2lMQP5Ohx_U'));
});
