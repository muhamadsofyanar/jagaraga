export interface VideoSource {
  id: string;
  title: string;
  provider: 'youtube';
  providerName: string;
  videoId: string;
  originalUrl: string;
  verifiedAt: string;
  captionsVerified: boolean;
}

export const VIDEO_REGISTRY: Record<string, VideoSource> = {
  'senam-low-impact': { id: 'senam-low-impact', title: 'Senam Low Impact', provider: 'youtube', providerName: 'Kementerian Kesehatan RI', videoId: '2lMQP5Ohx_U', originalUrl: 'https://www.youtube.com/watch?v=2lMQP5Ohx_U', verifiedAt: '2026-08-15', captionsVerified: false },
  'senam-sehat-bugar': { id: 'senam-sehat-bugar', title: 'Senam Sehat Bugar', provider: 'youtube', providerName: 'Direktorat Promkes Kemenkes RI', videoId: 'k3wv2S9sEtU', originalUrl: 'https://www.youtube.com/watch?v=k3wv2S9sEtU', verifiedAt: '2026-08-15', captionsVerified: false },
  'chair-squat': { id: 'chair-squat', title: 'Wall and Chair Squat', provider: 'youtube', providerName: 'Dana-Farber Cancer Institute', videoId: '05RVJXmnkPA', originalUrl: 'https://www.youtube.com/watch?v=05RVJXmnkPA', verifiedAt: '2026-08-15', captionsVerified: true },
};
