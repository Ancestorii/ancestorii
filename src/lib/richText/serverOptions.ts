import type { IOptions } from 'sanitize-html';
import {
  ALLOWED_ATTRIBUTES,
  ALLOWED_CLASS,
  ALLOWED_LIST_VALUES,
  ALLOWED_SCHEMES,
  ALLOWED_TAGS,
  DROP_WITH_CONTENT,
} from './allowList';

// sanitize-html options for the server sanitiser (./server). Kept apart from server.ts (which
// is server-only) so a plain Node test can check exactly these options.

const QUILL_CLASSES = [
  'ql-align-center',
  'ql-align-right',
  'ql-align-justify',
  'ql-ui',
  'ql-syntax',
  ...Array.from({ length: 8 }, (_, i) => `ql-indent-${i + 1}`),
];

const tagsWithClass = Object.keys(ALLOWED_ATTRIBUTES).filter((t) => ALLOWED_ATTRIBUTES[t].includes('class'));

export const RICH_TEXT_OPTIONS: IOptions = {
  allowedTags: [...ALLOWED_TAGS],
  allowedAttributes: Object.fromEntries(Object.entries(ALLOWED_ATTRIBUTES).map(([k, v]) => [k, [...v]])),
  allowedClasses: Object.fromEntries(tagsWithClass.map((t) => [t, QUILL_CLASSES])),
  allowedSchemes: [...ALLOWED_SCHEMES],
  allowedSchemesAppliedToAttributes: ['href'],
  allowProtocolRelative: false,
  // Dropped with their content; any other unknown tag is unwrapped to its text.
  nonTextTags: [...DROP_WITH_CONTENT],
  disallowedTagsMode: 'discard',
  transformTags: {
    a: (tagName, attribs) => {
      const next: Record<string, string> = {};
      if (attribs.href) next.href = attribs.href;
      if (attribs.target === '_blank') {
        next.target = '_blank';
        next.rel = 'noopener noreferrer nofollow';
      }
      return { tagName, attribs: next };
    },
    li: (tagName, attribs) => {
      const next: Record<string, string> = {};
      if (attribs['data-list'] && ALLOWED_LIST_VALUES.includes(attribs['data-list'])) next['data-list'] = attribs['data-list'];
      if (attribs.class) {
        const kept = attribs.class.split(/\s+/).filter((c) => ALLOWED_CLASS.test(c));
        if (kept.length) next.class = kept.join(' ');
      }
      return { tagName, attribs: next };
    },
  },
};
