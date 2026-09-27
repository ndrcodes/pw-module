export type MarkdownSegment =
  | {type: 'markdown'; content: string}
  | {type: 'video'; src: string};

const VIDEO_FENCE =
  /```video\s*\n([\s\S]*?)```/g;

function normalizeVideoSrc(line: string): string {
  return line.trim().split('\n')[0]?.trim() ?? '';
}

/** Split markdown body into GFM segments and ```video``` blocks. */
export function parseLearnMarkdown(source: string): MarkdownSegment[] {
  const segments: MarkdownSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const re = new RegExp(VIDEO_FENCE.source, 'g');
  while ((match = re.exec(source)) !== null) {
    const before = source.slice(lastIndex, match.index);
    if (before.trim()) {
      segments.push({type: 'markdown', content: before});
    }
    const src = normalizeVideoSrc(match[1]);
    if (src) {
      segments.push({type: 'video', src});
    }
    lastIndex = match.index + match[0].length;
  }

  const tail = source.slice(lastIndex);
  if (tail.trim()) {
    segments.push({type: 'markdown', content: tail});
  }

  if (segments.length === 0 && source.trim()) {
    segments.push({type: 'markdown', content: source});
  }

  return segments;
}

export function youtubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url, 'https://example.com');
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function isLocalVideoPath(src: string): boolean {
  return src.startsWith('/') && /\.(mp4|webm|ogg)(\?.*)?$/i.test(src);
}
