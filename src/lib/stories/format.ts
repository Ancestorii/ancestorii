/**
 * Display helpers shared by the Our Stories feed cards and the story page.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * How long ago a story was published: "Just now", "5m ago", "3h ago", "2d ago", "3w ago",
 * then "4 months ago" and "2 years ago". Worked out from the time difference alone (no time
 * zone), so the server and the browser agree. Returns '' for a missing or invalid date.
 */
export function getTimeAgo(date: string | null | undefined, now = Date.now()): string {
  const then = date ? new Date(date).getTime() : NaN;
  if (Number.isNaN(then)) return '';

  const diff = now - then;
  if (diff < MINUTE) return 'Just now';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;

  const days = Math.floor(diff / DAY);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) {
    const months = Math.max(1, Math.floor(days / 30.4375));
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  const years = Math.floor(days / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

// The named entities rich text (Quill) and pasted text produce; any other is left as written.
const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
};

/**
 * A story body (HTML) as one line of plain text, for previews and meta descriptions: tags
 * dropped, entities such as &amp; decoded, whitespace collapsed. Entities are decoded after
 * the tags are gone and in a single pass (so "&amp;lt;" stays "&lt;"), and the result is
 * only ever used as text, which React and Next escape, so it cannot inject markup.
 */
export function plainTextFromHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#\d+|#x[\da-f]+|[a-z]+);/gi, (entity, code: string) => {
      if (code[0] !== '#') return ENTITIES[code] ?? entity;
      const point =
        code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
    })
    .replace(/\s+/g, ' ')
    .trim();
}
