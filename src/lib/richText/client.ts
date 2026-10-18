import {
  ALLOWED_ATTRIBUTES,
  ALLOWED_CLASS,
  ALLOWED_LIST_VALUES,
  ALLOWED_SCHEMES,
  ALLOWED_TAGS,
  DROP_WITH_CONTENT,
} from './allowList';

const KEEP = new Set<string>(ALLOWED_TAGS);
const DROP = new Set<string>(DROP_WITH_CONTENT);

function safeHref(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  try {
    // URL parsing drops tabs and new lines, as the browser does, so "java\tscript:" is caught.
    const url = new URL(raw, 'https://www.ancestorii.com');
    return ALLOWED_SCHEMES.includes(url.protocol.replace(':', '')) ? raw : null;
  } catch {
    return null;
  }
}

function cleanAttributes(el: Element, tag: string) {
  const allowed = ALLOWED_ATTRIBUTES[tag] ?? [];
  for (const attr of Array.from(el.attributes)) {
    const name = attr.name.toLowerCase();
    if (!allowed.includes(name)) {
      el.removeAttribute(attr.name);
      continue;
    }
    if (name === 'class') {
      const kept = attr.value.split(/\s+/).filter((c) => ALLOWED_CLASS.test(c));
      if (kept.length) el.setAttribute('class', kept.join(' '));
      else el.removeAttribute('class');
    } else if (name === 'data-list' && !ALLOWED_LIST_VALUES.includes(attr.value)) {
      el.removeAttribute(attr.name);
    } else if (name === 'href') {
      const href = safeHref(attr.value);
      if (href) el.setAttribute('href', href);
      else el.removeAttribute('href');
    } else if (name === 'target' && attr.value !== '_blank') {
      el.removeAttribute(attr.name);
    }
  }
  if (tag === 'a' && el.getAttribute('target') === '_blank') {
    el.setAttribute('rel', 'noopener noreferrer nofollow');
  } else if (tag === 'a') {
    el.removeAttribute('rel');
  }
}

function cleanChildren(parent: Node) {
  for (const child of Array.from(parent.childNodes)) {
    if (child.nodeType === 3) continue; // text
    if (child.nodeType !== 1) {
      child.parentNode?.removeChild(child); // comments, processing instructions
      continue;
    }
    const el = child as Element;
    const tag = el.tagName.toLowerCase();
    if (DROP.has(tag)) {
      el.remove();
      continue;
    }
    cleanChildren(el);
    if (!KEEP.has(tag)) {
      el.replaceWith(...Array.from(el.childNodes)); // keep the words, lose the tag
      continue;
    }
    cleanAttributes(el, tag);
  }
}

/**
 * Cleans a story, memory or chapter body in the browser before it is put into the page or an
 * editor (innerHTML runs inline handlers such as onerror). Uses an inert DOMParser document, so
 * nothing in the input loads or runs while it is cleaned. On the server, use ./server instead.
 */
export function sanitizeRichTextClient(html: string | null | undefined): string {
  if (!html) return '';
  if (typeof DOMParser === 'undefined') return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  cleanChildren(doc.body);
  return doc.body.innerHTML;
}
