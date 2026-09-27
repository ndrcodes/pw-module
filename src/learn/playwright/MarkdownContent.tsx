import type {ReactNode} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {parseLearnMarkdown} from './markdown';
import VideoEmbed from './VideoEmbed';

type Props = {
  source: string;
};

function resolveImageSrc(src: string | undefined, base: string): string {
  if (!src) {
    return '';
  }
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  if (src.startsWith('/')) {
    return `${base}${src.slice(1)}`;
  }
  return src;
}

export default function MarkdownContent({source}: Props): ReactNode {
  const base = useBaseUrl('/');
  const segments = parseLearnMarkdown(source);

  return (
    <div className="learn-markdown">
      {segments.map((segment, index) => {
        if (segment.type === 'video') {
          return <VideoEmbed key={`v-${index}`} src={segment.src} />;
        }
        return (
          <ReactMarkdown
            key={`m-${index}`}
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({src, alt}) => (
                <img
                  src={resolveImageSrc(src, base)}
                  alt={alt ?? ''}
                  loading="lazy"
                />
              ),
              a: ({href, children}) => (
                <a href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel={href?.startsWith('http') ? 'noreferrer' : undefined}>
                  {children}
                </a>
              ),
            }}>
            {segment.content}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}
