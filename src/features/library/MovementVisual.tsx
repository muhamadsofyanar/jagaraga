import { useEffect, useState } from 'react';

export function MovementVisual({ src, title, className = 'movement-image', decorative = false }: { src: string; title: string; className?: string; decorative?: boolean }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (failed) {
    return <div className={`${className} movement-image-fallback`} role="status">Ilustrasi {title} tidak dapat dimuat.</div>;
  }

  return <img className={className} src={src} alt={decorative ? '' : `Contoh ${title}`} onError={() => setFailed(true)} />;
}
