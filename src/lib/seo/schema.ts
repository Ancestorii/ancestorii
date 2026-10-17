// Structured data shared by the public guides, comparisons and feature pages.
// Render it with <JsonLd> (src/components/site/seo/JsonLd.tsx) so it is in the HTML itself.

export const SITE_URL = 'https://www.ancestorii.com';
export const ORG_ID = `${SITE_URL}/#organization`;
export const FOUNDER_ID = `${SITE_URL}/#founder`;

export const FOUNDER_LINKS = {
  linkedin: 'https://www.linkedin.com/in/dante-leon-10baaa17a/',
  reddit: 'https://www.reddit.com/user/keepingmemories/',
} as const;

/** Dante Leon, who founded Ancestorii and writes its guides. */
export const FOUNDER = {
  '@type': 'Person',
  '@id': FOUNDER_ID,
  name: 'Dante Leon',
  jobTitle: 'Founder of Ancestorii',
  url: `${SITE_URL}/why-this-exists`,
  worksFor: { '@id': ORG_ID },
  sameAs: [FOUNDER_LINKS.linkedin, FOUNDER_LINKS.reddit],
};

const PUBLISHER = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'Ancestorii',
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
};

/** An article written by the founder. `path` starts with a slash, dates are YYYY-MM-DD. */
export function articleSchema({
  path,
  headline,
  description,
  datePublished,
  dateModified,
  image = '/og-default.jpg',
  type = 'Article',
}: {
  path: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  type?: 'Article' | 'TechArticle' | 'WebPage';
}) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    headline,
    description,
    inLanguage: 'en-GB',
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${path}` },
    image: image.startsWith('http') ? image : `${SITE_URL}${image}`,
    author: FOUNDER,
    publisher: PUBLISHER,
    datePublished,
    dateModified: dateModified ?? datePublished,
  };
}

/** FAQPage from plain-text questions and answers (the same ones shown on the page). */
export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

/** BreadcrumbList; the first item is usually { name: 'Home', path: '/' }. */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
