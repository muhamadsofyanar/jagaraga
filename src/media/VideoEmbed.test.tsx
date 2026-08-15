import { render, screen } from '@testing-library/react';
import { describe, expect, it, test } from 'vitest';
import { VideoEmbed } from './VideoEmbed';
import { VIDEO_REGISTRY, type VideoSource } from './videos';

const source: VideoSource = { id: 'senam-low-impact', title: 'Senam Low Impact', provider: 'youtube', providerName: 'Kementerian Kesehatan RI', videoId: '2lMQP5Ohx_U', originalUrl: 'https://www.youtube.com/watch?v=2lMQP5Ohx_U', verifiedAt: '2026-08-15', captionsVerified: false, sourceClass: 'government', movementIds: ['walk'] };

test('does not load third-party video without consent', () => {
  render(<VideoEmbed source={source} consent={false} online />);
  expect(screen.queryByTitle('Senam Low Impact')).not.toBeInTheDocument();
  expect(screen.getByText(/izin video belum diberikan/i)).toBeVisible();
});

test('uses the privacy-enhanced embed after consent', () => {
  render(<VideoEmbed source={source} consent online />);
  expect(screen.getByTitle('Senam Low Impact')).toHaveAttribute('src', expect.stringContaining('youtube-nocookie.com/embed/2lMQP5Ohx_U'));
});

describe('official video provenance', () => {
  it.each(Object.values(VIDEO_REGISTRY))('$id has auditable provenance', (item) => {
    expect(item.originalUrl).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=/);
    expect(item.providerName.length).toBeGreaterThan(3);
    expect(item.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(item.sourceClass).toMatch(/government|hospital|university|sports-body|rights-holder/);
    expect(item.movementIds.length).toBeGreaterThan(0);
  });
});
