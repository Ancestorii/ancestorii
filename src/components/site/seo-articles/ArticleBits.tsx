import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';
import {
  ArrowLink,
  ClosingCta,
  FaqList,
  PageHero,
  PhotoFrame,
  Prose,
  PullQuote,
  type Crumb,
  type FaqItem,
} from '@/components/site/SiteBits';
import landing from '@/components/landing/landing.module.css';
import site from '@/components/site/site.module.css';
import a from './articles.module.css';

// The shared article look for the SEO explainers and comparison pages
// (/digital-legacy, /living-library, /compare, /compare/storyworth-alternative).
// Built from the landing's own classes and the SiteBits pieces; sits inside SiteShell.

export type Tone = 'pink' | 'blue' | 'orange' | 'aqua';

const TONES: Tone[] = ['pink', 'blue', 'orange', 'aqua'];

type CtaLink = { href: string; label: string };

/**
 * Left-aligned PageHero, then any further intro paragraphs in the same lead style
 * and the page's own sign-up button (ink, with the pink-orange arrow tile).
 */
export function ArticleHero({
  title,
  eyebrow,
  crumbs,
  size = 'lg',
  intro,
  cta,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  crumbs?: Crumb[];
  size?: 'lg' | 'md';
  intro: ReactNode[];
  cta?: CtaLink;
}) {
  const [lead, ...more] = intro;
  return (
    <div className={a.heroWrap}>
      <PageHero align="left" size={size} title={title} eyebrow={eyebrow} crumbs={crumbs} lead={lead} />
      {(more.length > 0 || cta) && (
        <div className={a.heroMore}>
          {more.map((paragraph, i) => (
            <p key={i} className={a.heroPara}>
              {paragraph}
            </p>
          ))}
          {cta && (
            <div className={a.heroActions}>
              <ArrowLink href={cta.href} className={landing.btnShadow}>
                {cta.label}
              </ArrowLink>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Small uppercase section label with a coloured square (the page's old kicker text). */
export function Kicker({ children, dot = 'var(--c0)' }: { children: ReactNode; dot?: string }) {
  return (
    <span className={site.tag} style={{ '--dot': dot } as CSSProperties}>
      {children}
    </span>
  );
}

/**
 * A page section. `split`: kicker and title (or an `aside`, such as a photo) in a sticky
 * left column, the reading column on the right. `wide`: kicker and title on top, then
 * full-width content (tables, card grids).
 */
export function ArticleSection({
  id,
  kicker,
  dot,
  title,
  aside,
  layout = 'split',
  children,
}: {
  id?: string;
  kicker?: ReactNode;
  dot?: string;
  title?: ReactNode;
  aside?: ReactNode;
  layout?: 'split' | 'wide';
  children: ReactNode;
}) {
  const headingId = id && title ? `${id}-title` : undefined;
  const head =
    kicker || title ? (
      <div className={a.head}>
        {kicker && <Kicker dot={dot}>{kicker}</Kicker>}
        {title && (
          <h2 id={headingId} className={`${landing.h2} ${a.title}`}>
            {title}
          </h2>
        )}
      </div>
    ) : null;

  if (layout === 'wide') {
    return (
      <section id={id} aria-labelledby={headingId} className={site.section}>
        <div className={landing.wrap}>
          {head}
          <div className={head ? site.sectionBody : undefined}>{children}</div>
        </div>
      </section>
    );
  }

  const left = aside ?? head;
  return (
    <section id={id} aria-labelledby={headingId} className={site.section}>
      <div className={`${landing.wrap} ${a.split}`}>
        {left && <div className={a.splitAside}>{left}</div>}
        <div className={`${a.splitBody} ${left ? '' : a.splitBodyOnly}`}>{children}</div>
      </div>
    </section>
  );
}

/** Long-form text in the reading column (the shared Prose, a touch larger in split sections). */
export function Reading({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <Prose className={`${a.reading} ${className}`}>{children}</Prose>;
}

/** The landing's dark closing slab, with room for the pages' two-line closing titles. */
export function ArticleCta({
  title,
  lead,
  primary,
  note,
}: {
  title: ReactNode;
  lead?: ReactNode;
  primary: CtaLink;
  note?: ReactNode;
}) {
  return <ClosingCta wide title={title} lead={lead} primary={primary} note={note} />;
}

/** A big pull quote standing on its own between two sections. */
export function QuoteBlock({ children }: { children: ReactNode }) {
  return (
    <div className={site.section}>
      <div className={`${landing.wrap} ${a.quoteBlock}`}>
        <PullQuote>{children}</PullQuote>
      </div>
    </div>
  );
}

/** A real photo in a colour frame, with the page's caption under it. */
export function CaptionedPhoto({
  src,
  alt,
  label,
  color,
  caption,
  position,
  priority = false,
}: {
  src: string;
  alt: string;
  label?: string;
  color?: string;
  caption: ReactNode;
  position?: string;
  priority?: boolean;
}) {
  return (
    <div className={a.photoAside}>
      <PhotoFrame
        src={src}
        alt={alt}
        label={label}
        color={color}
        aspect="4 / 5"
        sizes="(max-width: 520px) calc(100vw - 48px), 460px"
        position={position}
        preload={priority}
        className={a.photoTilt}
      />
      <p className={a.photoCaption}>{caption}</p>
    </div>
  );
}

/** The shared FaqList; `variant="open"` shows every answer, each question an h3. */
export function FaqBlock({ items, variant }: { items: FaqItem[]; variant?: 'accordion' | 'open' }) {
  return <FaqList items={items} variant={variant} />;
}

/**
 * Comparison table in the landing's white card. The Ancestorii column (`highlight`)
 * gets an ink header cell and heavier text; with `rowHeaders` the first column holds
 * the feature names and stays in view while the table scrolls sideways on phones.
 */
export function CompareTable({
  head,
  rows,
  highlight = 1,
  rowHeaders = true,
  struck,
  ticks = false,
  size = 'mid',
  labelledBy,
}: {
  head: string[];
  rows: string[][];
  highlight?: number;
  rowHeaders?: boolean;
  struck?: number;
  ticks?: boolean;
  size?: 'fit' | 'mid' | 'wide';
  labelledBy?: string;
}) {
  const sizeClass = size === 'fit' ? a.cmpFit : size === 'wide' ? a.cmpWide : a.cmpMid;
  // On phones the wider tables scroll sideways: their wrapper is a named, focusable region so
  // keyboard users can scroll it too, and a soft shadow on its right edge shows there is more.
  // 'fit' tables never scroll, so they stay plain.
  const scrolls = size !== 'fit';
  return (
    <div
      className={`${site.tableWrap} ${scrolls ? a.tableScroll : ''}`}
      {...(scrolls ? { role: 'region', 'aria-labelledby': labelledBy, tabIndex: 0 } : {})}
    >
      <table className={`${site.table} ${a.cmp} ${sizeClass}`} aria-labelledby={labelledBy}>
        <thead>
          <tr>
            {head.map((label, i) => (
              <th
                key={label}
                scope="col"
                className={
                  i === highlight ? a.hlHead : i === 0 && rowHeaders ? a.cornerHead : undefined
                }
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, i) => {
                if (i === 0 && rowHeaders) {
                  return (
                    <th key={i} scope="row" className={a.rowHead}>
                      {cell}
                    </th>
                  );
                }
                if (i === highlight) {
                  return (
                    <td key={i} className={a.hl}>
                      {ticks ? (
                        <span className={a.cellCheck}>
                          <span className={a.cellTick} aria-hidden="true">
                            <Check size={15} strokeWidth={3.2} />
                          </span>
                          <span>{cell}</span>
                        </span>
                      ) : (
                        cell
                      )}
                    </td>
                  );
                }
                return (
                  <td key={i} className={i === struck ? a.struck : undefined}>
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A line under a table (e.g. a link to the fuller comparison). */
export function TableNote({ children }: { children: ReactNode }) {
  return <p className={a.tableNote}>{children}</p>;
}

/** Stack of PlatformCards. */
export function PlatformList({ children }: { children: ReactNode }) {
  return <div className={a.platforms}>{children}</div>;
}

/** One platform on /compare: name, one-liner and "Best for" on the left, its strengths on the right. */
export function PlatformCard({
  name,
  oneLiner,
  strengths,
  bestFor,
  tone,
  featured = false,
}: {
  name: string;
  oneLiner: string;
  strengths: string[];
  bestFor: string;
  tone: Tone;
  featured?: boolean;
}) {
  return (
    <article className={`${featured ? a.platformFeatured : a.platform} ${a[tone]}`}>
      <div className={a.platformInner}>
        <div>
          <h3 className={a.platformName}>{name}</h3>
          <p className={a.platformLine}>{oneLiner}</p>
          <div className={a.bestFor}>
            <Kicker dot="var(--tone)">Best for</Kicker>
            <p className={a.bestForText}>{bestFor}</p>
          </div>
        </div>
        <ul className={a.points}>
          {strengths.map((strength) => (
            <li key={strength}>{strength}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export type NumberedPanelItem = {
  number: string;
  title: string;
  body: string;
  Icon: LucideIcon;
};

/** Numbered cards, each with a solid colour panel and a tilted white icon tile (the landing's steps). */
export function NumberedPanels({ items }: { items: NumberedPanelItem[] }) {
  const tilts = ['-4deg', '3deg', '-3deg', '4deg'];
  return (
    <div className={a.panels}>
      {items.map(({ number, title, body, Icon }, i) => (
        <article
          key={number}
          className={`${a.panel} ${a[TONES[i % TONES.length]]}`}
          style={{ '--tilt': tilts[i % tilts.length] } as CSSProperties}
        >
          <div className={a.panelSwatch}>
            <div className={a.panelTile}>
              <Icon size={46} strokeWidth={2.5} aria-hidden="true" />
            </div>
          </div>
          <div className={a.panelBody}>
            <div className={a.panelNum}>{number}</div>
            <h3 className={a.panelTitle}>{title}</h3>
            <p className={a.panelText}>{body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

/** Statements with a solid colour check tile each. */
export function CheckList({ items }: { items: ReactNode[] }) {
  const tilts = ['-4deg', '3deg', '-3deg', '4deg', '-2deg'];
  return (
    <ul className={a.checks}>
      {items.map((item, i) => (
        <li
          key={i}
          className={`${a.checkRow} ${a[TONES[i % TONES.length]]}`}
          style={{ '--tilt': tilts[i % tilts.length] } as CSSProperties}
        >
          <span className={a.checkTile} aria-hidden="true">
            <Check size={19} strokeWidth={3.2} />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export type ReasonItem = { title: string; text: string; Icon: LucideIcon };

/** White cards, each opening with a tilted colour icon tile. */
export function ReasonCards({ items }: { items: ReasonItem[] }) {
  const tilts = ['-4deg', '3deg', '-3deg', '4deg'];
  return (
    <div className={a.reasons}>
      {items.map(({ title, text, Icon }, i) => (
        <article
          key={title}
          className={`${site.card} ${a.reason} ${a[TONES[i % TONES.length]]}`}
          style={{ '--tilt': tilts[i % tilts.length] } as CSSProperties}
        >
          <span className={a.reasonTile} aria-hidden="true">
            <Icon size={28} strokeWidth={2.4} />
          </span>
          <h3 className={`${site.cardTitle} ${a.reasonTitle}`}>{title}</h3>
          <p className={site.cardText}>{text}</p>
        </article>
      ))}
    </div>
  );
}
