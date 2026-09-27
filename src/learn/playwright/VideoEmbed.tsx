import type {ReactNode} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
  isLocalVideoPath,
  youtubeEmbedUrl,
} from './markdown';

type Props = {
  src: string;
};

export default function VideoEmbed({src}: Props): ReactNode {
  const base = useBaseUrl('/');
  const youtube = youtubeEmbedUrl(src);

  if (youtube) {
    return (
      <div className="learn-video">
        <iframe
          src={youtube}
          title="Video pembelajaran"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (isLocalVideoPath(src)) {
    const resolved = src.startsWith('/') ? `${base}${src.slice(1)}` : src;
    return (
      <div className="learn-video">
        <video controls preload="metadata" src={resolved}>
          Browser kamu tidak mendukung tag video.
        </video>
      </div>
    );
  }

  return (
    <p className="learn-video-fallback">
      URL video tidak dikenali: <code>{src}</code>
    </p>
  );
}
