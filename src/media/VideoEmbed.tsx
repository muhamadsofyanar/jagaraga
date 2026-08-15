import { ExternalLink, VideoOff } from 'lucide-react';
import type { VideoSource } from './videos';

export function VideoEmbed({ source, consent, online }: { source: VideoSource; consent: boolean; online: boolean }) {
  const fallback = !online ? 'Video membutuhkan internet.' : 'Izin video belum diberikan. Aktifkan melalui Pengaturan.';
  return <section className="video-block">
    <div className="video-label"><span>VIDEO RESMI</span><small>{source.providerName}</small></div>
    {consent && online ? <div className="video-frame"><iframe title={source.title} src={`https://www.youtube-nocookie.com/embed/${source.videoId}?rel=0`} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div> : <div className="video-fallback"><VideoOff /><span>{fallback}</span></div>}
    <a href={source.originalUrl} target="_blank" rel="noreferrer noopener">Buka sumber asli <ExternalLink size={15} /></a>
  </section>;
}
