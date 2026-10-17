import Link from 'next/link';
import type { ReactNode } from 'react';
import { FOUNDER_LINKS } from '@/lib/seo/schema';
import s from './seo.module.css';
import Fold from '@/components/landing/Fold';

// Pieces every guide, comparison and feature page shares, in the landing page's language
// (they sit inside SiteShell, which supplies the colour tokens and Plus Jakarta Sans).

/** The short, quotable answer near the top of a page: a white card of facts with round dots. */
export function KeyFacts({ title = 'Key facts', items }: { title?: string; items: ReactNode[] }) {
  return (
    <aside className={s.facts} aria-label={title}>
      <h2 className={s.factsTitle}>{title}</h2>
      {/* On phones the list sits behind a "Key facts" button (Fold); from 600px it is just there. */}
      <Fold label={title} className={s.factsFold}>
        <ul className={s.factsList}>
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </Fold>
    </aside>
  );
}

export type Source = {
  /** Who published it, e.g. "The National Archives". */
  publisher: string;
  /** The page or report title. */
  title: string;
  href: string;
  /** Optional year or date, e.g. "2024". */
  date?: string;
};

/** Numbered list of the sources a page's facts come from. */
export function Sources({ items, title = 'Sources' }: { items: Source[]; title?: string }) {
  return (
    <section className={s.sources} aria-labelledby="sources-title">
      <h2 id="sources-title" className={s.sourcesTitle}>
        {title}
      </h2>
      <ol className={s.sourcesList}>
        {items.map((item) => (
          <li key={item.href}>
            <span className={s.sourcesPublisher}>{item.publisher}</span>
            {' · '}
            <a href={item.href} target="_blank" rel="noopener noreferrer">
              {item.title}
            </a>
            {/* The space stays outside the nowrap date, so the date can move to the next line whole. */}
            {item.date && (
              <>
                {' '}
                <span className={s.sourcesDate}>({item.date})</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Who wrote the page: the founder, with his LinkedIn and Reddit, and when it was last checked. */
export function AuthorBox({ updated }: { updated: string }) {
  return (
    <aside className={s.author} aria-label="About the author">
      <div className={s.authorMark} aria-hidden="true">
        <span className={s.authorDotPink} />
        <span className={s.authorDotBlue} />
        DL
      </div>
      <div className={s.authorBody}>
        <p className={s.authorName}>
          Written by <strong>Dante Leon</strong>, founder of Ancestorii
        </p>
        <p className={s.authorBio}>
          Dante built Ancestorii because he was scared of forgetting the small family moments that
          never get written down, so families can keep their photos, voices and stories in one
          private place. <Link href="/why-this-exists">Read why he built it</Link>.
        </p>
        <p className={s.authorMeta}>Last updated {updated}</p>
        <ul className={s.authorLinks}>
          <li>
            <a href={FOUNDER_LINKS.linkedin} target="_blank" rel="me noopener noreferrer" className={s.authorLink}>
              <span className={s.authorLinkDot} style={{ background: 'var(--c1)' }} />
              LinkedIn
            </a>
          </li>
          <li>
            <a href={FOUNDER_LINKS.reddit} target="_blank" rel="me noopener noreferrer" className={s.authorLink}>
              <span className={s.authorLinkDot} style={{ background: 'var(--c2)' }} />
              Reddit
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
}
