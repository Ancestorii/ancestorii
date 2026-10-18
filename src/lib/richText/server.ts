import 'server-only';
import sanitize from 'sanitize-html';
import { RICH_TEXT_OPTIONS } from './serverOptions';

/**
 * Cleans a story, memory or chapter body on the server, before it is rendered with
 * dangerouslySetInnerHTML. An allow-list (the HTML our editors write), so anything that
 * could run code (scripts, event handlers, javascript: links, SVG, frames) never reaches the page.
 */
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return '';
  return sanitize(html, RICH_TEXT_OPTIONS);
}
