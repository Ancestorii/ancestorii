// What a story, memory or chapter body may contain once it is shown: the HTML our Quill editors
// write (paragraphs, bold, italic, underline, strike, lists, and what a paste can bring in:
// headings, quotes, links, code). Anything else is unwrapped to its text, or dropped with its
// content if it can run code or load something. Shared by the server sanitiser (sanitize-html)
// and the browser one (DOMParser), so both keep exactly the same things.

export const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'a',
  'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'blockquote',
  'pre', 'code', 'span', 'sub', 'sup',
] as const;

// Removed together with everything inside them.
export const DROP_WITH_CONTENT = [
  'script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed', 'applet', 'template',
  'noscript', 'svg', 'math', 'form', 'input', 'button', 'select', 'option', 'textarea',
  'title', 'head', 'link', 'meta', 'base', 'audio', 'video', 'source', 'track', 'img',
  'picture', 'canvas', 'map', 'area', 'dialog',
] as const;

export const ALLOWED_ATTRIBUTES: Record<string, readonly string[]> = {
  a: ['href', 'target', 'rel'],
  li: ['data-list', 'class'],
  p: ['class'],
  h1: ['class'],
  h2: ['class'],
  h3: ['class'],
  h4: ['class'],
  blockquote: ['class'],
  pre: ['class'],
  span: ['class'],
};

// Quill's own classes: alignment, list indent, the bullet marker span, code blocks.
export const ALLOWED_CLASS = /^(ql-align-(center|right|justify)|ql-indent-[1-8]|ql-ui|ql-syntax)$/;

export const ALLOWED_LIST_VALUES = ['bullet', 'ordered', 'checked', 'unchecked'];

export const ALLOWED_SCHEMES = ['http', 'https', 'mailto'];
