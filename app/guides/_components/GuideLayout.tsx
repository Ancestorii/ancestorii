import Link from 'next/link';
import type { ReactNode } from 'react';
import { Breadcrumbs, Eyebrow, type Crumb } from '@/components/site/SiteBits';
import landing from '@/components/landing/landing.module.css';
import site from '@/components/site/site.module.css';
import g from './guides.module.css';

// One template for every page under /guides, in the landing page's language (SiteShell
// supplies its nav, footer, font and colours): a left-aligned hero with breadcrumbs, a
// ~760px reading column, and the landing's dark closing slab.

const HOME: Crumb = { href: '/', label: 'Home' };
const GUIDES: Crumb = { href: '/guides', label: 'Guides' };

function GuideHero({
  crumbs,
  eyebrow,
  title,
  lead,
  wide = false,
}: {
  crumbs: Crumb[];
  eyebrow: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  wide?: boolean;
}) {
  return (
    <header className={`${g.hero} ${wide ? g.heroWide : ''}`}>
      <div className={g.heroInner}>
        <div className={g.heroTop}>
          <Breadcrumbs items={crumbs} />
          {eyebrow}
        </div>
        <h1 className={g.title}>{title}</h1>
        {lead && <p className={g.heroLead}>{lead}</p>}
      </div>
    </header>
  );
}

/** Top of the guides index, lined up with the grid of guides below it. */
export function GuidesIndexHero({ title, lead }: { title: ReactNode; lead: ReactNode }) {
  return (
    <GuideHero
      wide
      crumbs={[HOME, { label: GUIDES.label }]}
      eyebrow={<Eyebrow>Guides</Eyebrow>}
      title={title}
      lead={lead}
    />
  );
}

/**
 * One guide: breadcrumbs (as in its BreadcrumbList), the Guide label, the title and the reading column.
 * `guideLink` keeps the Guide label a link back to the index on the guides where it always was one.
 */
export function GuideArticle({
  crumb,
  title,
  guideLink = false,
  children,
}: {
  crumb: string;
  title: ReactNode;
  guideLink?: boolean;
  children: ReactNode;
}) {
  const label = <Eyebrow>Guide</Eyebrow>;

  return (
    <article>
      <GuideHero
        crumbs={[HOME, GUIDES, { label: crumb }]}
        eyebrow={
          guideLink ? (
            <Link href="/guides" className={g.eyebrowLink}>
              {label}
            </Link>
          ) : (
            label
          )
        }
        title={title}
      />
      <div className={`${g.column} ${g.body}`}>{children}</div>
    </article>
  );
}

/** A titled part of a guide. */
export function GuideSection({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className={g.section}>
      <h2 className={g.h2}>{title}</h2>
      <div className={g.sectionBody}>{children}</div>
    </section>
  );
}

/** The opening paragraph of a guide; goes first inside <Prose>. */
export function Lead({ children }: { children: ReactNode }) {
  return <p className={g.lead}>{children}</p>;
}

const CTA_NOTE = ['Free forever', 'No credit card', 'Takes 2 minutes'];

/** The landing's dark closing slab: the guide's own closing title and line, and Start For Free. */
export function GuideCta({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className={`${landing.ctaSection} ${site.ctaEnd}`}>
      <div className={`${landing.wrap} ${landing.ctaSlab}`}>
        <div className={landing.ctaGlowPink} aria-hidden="true" />
        <div className={landing.ctaGlowBlue} aria-hidden="true" />
        <div className={landing.ctaCopy}>
          <h2 className={g.ctaTitle}>{title}</h2>
          <p className={landing.ctaLead}>{children}</p>
          <div className={landing.ctaButtons}>
            <Link href="/signup" prefetch className={`${landing.btnPrimary} ${landing.btnLight}`}>
              Start For Free
              <span className={landing.arrowTile} aria-hidden="true">
                →
              </span>
            </Link>
          </div>
          <div className={g.ctaNote}>
            <ul className={`${site.dots} ${site.dotsCenter}`}>
              {CTA_NOTE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
