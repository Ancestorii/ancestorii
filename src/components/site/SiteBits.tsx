import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Plus } from 'lucide-react';
import { ArrowLink } from '@/components/landing/LandingBits';
import landing from '@/components/landing/landing.module.css';
import styles from './site.module.css';

export { ArrowLink, Logo, LogoMark } from '@/components/landing/LandingBits';

// Shared pieces for public pages, built from the landing page's own classes.
// All of them expect to sit inside SiteShell (or AuthShell).

/** Coloured words inside a heading: the gradient for the one hero phrase, solid colours elsewhere. */
export function Accent({
  children,
  tone = 'gradient',
}: {
  children: ReactNode;
  tone?: 'gradient' | 'pink' | 'blue';
}) {
  const cls =
    tone === 'gradient' ? landing.gradientText : tone === 'pink' ? styles.accentPink : styles.accentBlue;
  return <span className={cls}>{children}</span>;
}

/** Black pill label with a coloured square, as on the landing's Memory Books section. */
export function Eyebrow({ children, dot = 'var(--c2)' }: { children: ReactNode; dot?: string }) {
  return (
    <span className={landing.badge}>
      <span className={landing.badgeDot} style={{ '--dot': dot } as CSSProperties} />
      {children}
    </span>
  );
}

export type Crumb = { href?: string; label: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.crumbs}>
        {items.map((item, i) =>
          item.href && i < items.length - 1 ? (
            <li key={item.label}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ) : (
            <li key={item.label}>
              <span aria-current={i === items.length - 1 ? 'page' : undefined}>{item.label}</span>
            </li>
          )
        )}
      </ol>
    </nav>
  );
}

/**
 * Top of an interior page: optional breadcrumbs and eyebrow, a big 800-weight title,
 * a lead and any buttons. Centred like the landing hero, or left-aligned for articles.
 */
export function PageHero({
  title,
  eyebrow,
  eyebrowDot,
  crumbs,
  lead,
  children,
  align = 'center',
  size = 'lg',
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  eyebrowDot?: string;
  crumbs?: Crumb[];
  lead?: ReactNode;
  children?: ReactNode;
  align?: 'center' | 'left';
  size?: 'lg' | 'md';
}) {
  return (
    <section className={`${styles.hero} ${align === 'left' ? styles.heroLeft : ''}`}>
      <div className={styles.heroInner}>
        {(crumbs || eyebrow) && (
          <div className={styles.heroTop}>
            {crumbs && <Breadcrumbs items={crumbs} />}
            {eyebrow && <Eyebrow dot={eyebrowDot}>{eyebrow}</Eyebrow>}
          </div>
        )}
        <h1 className={`${styles.heroTitle} ${size === 'md' ? styles.heroTitleMd : ''}`}>{title}</h1>
        {lead && <p className={styles.heroLead}>{lead}</p>}
        {children && <div className={styles.heroActions}>{children}</div>}
      </div>
    </section>
  );
}

/** Heading row used by the landing sections: big title, optional lead or button on the right. */
export function SectionHead({
  title,
  lead,
  action,
  id,
}: {
  title: ReactNode;
  lead?: ReactNode;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div className={landing.sectionHead}>
      <h2 id={id} className={landing.h2}>
        {title}
      </h2>
      {lead && <p className={landing.sectionLead}>{lead}</p>}
      {action}
    </div>
  );
}

export function Prose({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.prose} ${className}`}>{children}</div>;
}

/** Big pink quote mark with heavy text. Put the second half in <Accent tone="blue">. */
export function PullQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote className={styles.pullQuote}>
      <span className={styles.pullQuoteMark} aria-hidden="true">
        “
      </span>
      <p className={styles.pullQuoteText}>{children}</p>
    </blockquote>
  );
}

/** One step card from the landing's How it works: solid colour panel with a tilted icon tile. */
export function PanelCard({
  Icon,
  title,
  text,
  num,
  color = 'var(--c0)',
  tilt = '-3deg',
}: {
  Icon: LucideIcon;
  title: ReactNode;
  text?: ReactNode;
  num?: string;
  color?: string;
  tilt?: string;
}) {
  return (
    <article className={landing.step} style={{ '--panel': color, '--tilt': tilt } as CSSProperties}>
      <div className={landing.stepPanel}>
        <div className={landing.stepTile}>
          <Icon size={56} strokeWidth={2.5} aria-hidden="true" />
        </div>
      </div>
      <div className={landing.stepBody}>
        {num && <div className={landing.stepNum}>{num}</div>}
        <h3 className={landing.stepTitle}>{title}</h3>
        {text && <p className={landing.stepText}>{text}</p>}
      </div>
    </article>
  );
}

/**
 * A real photo in a solid colour frame with an optional white caption chip (it wraps if long).
 * `preload` is for a photo above the fold: it loads at once and is preloaded.
 */
export function PhotoFrame({
  src,
  alt,
  label,
  color = 'var(--c0)',
  aspect = '4 / 5',
  sizes = '(max-width: 768px) 90vw, 480px',
  position,
  preload = false,
  priority = false,
  className = '',
}: {
  src: string;
  alt: string;
  label?: string;
  color?: string;
  aspect?: string;
  sizes?: string;
  position?: string;
  preload?: boolean;
  /** @deprecated Old name for `preload` (next/image deprecated its own `priority` for `preload`). */
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={`${styles.photoFrame} ${className}`} style={{ '--card': color, margin: 0 } as CSSProperties}>
      <div className={styles.photoFrameInner} style={{ aspectRatio: aspect }}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          preload={preload || priority}
          className={landing.coverImg}
          style={position ? { objectPosition: position } : undefined}
        />
      </div>
      {label && (
        <figcaption className={`${landing.chipRow} ${styles.photoCaption}`}>
          <span className={`${landing.chip} ${styles.photoChip}`}>
            <span className={landing.chipDot} />
            <span className={landing.chipText}>{label}</span>
          </span>
        </figcaption>
      )}
    </figure>
  );
}

export type FaqItem = { q: string; a: ReactNode };

/**
 * Questions and answers as native <details>, so every answer stays in the page for search.
 * `variant="open"` shows every answer instead, each question an h3 (no toggles).
 */
export function FaqList({ items, variant = 'accordion' }: { items: FaqItem[]; variant?: 'accordion' | 'open' }) {
  if (variant === 'open') {
    return (
      <div className={`${styles.faq} ${styles.faqOpen}`}>
        {items.map((item) => (
          <div key={item.q} className={styles.faqItem}>
            <h3 className={styles.faqQ}>{item.q}</h3>
            <div className={styles.faqA}>{item.a}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.faq}>
      {items.map((item) => (
        <details key={item.q} className={styles.faqItem}>
          <summary className={styles.faqQ}>
            {item.q}
            <span className={styles.faqIcon} aria-hidden="true">
              <Plus size={18} strokeWidth={2.8} />
            </span>
          </summary>
          <div className={styles.faqA}>{item.a}</div>
        </details>
      ))}
    </div>
  );
}

/** Coloured dot list, e.g. "Free to start · No credit card · Two minutes". */
export function DotList({ items, center = false }: { items: ReactNode[]; center?: boolean }) {
  return (
    <ul className={`${styles.dots} ${center ? styles.dotsCenter : ''}`}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

type CtaLink = { href: string; label: string };

/**
 * The landing's dark closing slab with its pink and blue glows. `wide` is for a title written
 * as two lines (with a <br />): it lifts the landing's 12ch cap so each line stays whole, and
 * the copy takes the slab's full width. `size="md"` sets a longer title a step smaller.
 * `children` sit under the buttons (a DotList, StoreBadges), centred.
 */
export function ClosingCta({
  title,
  lead,
  primary,
  secondary,
  note,
  prefetch,
  wide = false,
  size = 'lg',
  className = '',
  children,
}: {
  title: ReactNode;
  lead?: ReactNode;
  primary: CtaLink;
  secondary?: CtaLink;
  note?: ReactNode;
  prefetch?: boolean;
  wide?: boolean;
  size?: 'lg' | 'md';
  className?: string;
  children?: ReactNode;
}) {
  const variant = `${wide ? styles.ctaWide : ''} ${size === 'md' ? styles.ctaMd : ''}`;
  return (
    <section className={`${landing.ctaSection} ${styles.ctaEnd} ${variant} ${className}`}>
      <div className={`${landing.wrap} ${landing.ctaSlab}`}>
        <div className={landing.ctaGlowPink} aria-hidden="true" />
        <div className={landing.ctaGlowBlue} aria-hidden="true" />
        <div className={`${landing.ctaCopy} ${styles.ctaCopy}`}>
          <h2 className={`${landing.ctaTitle} ${styles.ctaTitle}`}>{title}</h2>
          {lead && <p className={landing.ctaLead}>{lead}</p>}
          <div className={landing.ctaButtons}>
            <ArrowLink href={primary.href} prefetch={prefetch} className={landing.btnLight}>
              {primary.label}
            </ArrowLink>
            {secondary && (
              <Link
                href={secondary.href}
                prefetch={prefetch}
                className={`${landing.btnOutline} ${landing.btnOutlineDark}`}
              >
                {secondary.label}
              </Link>
            )}
          </div>
          {note && <p className={styles.ctaNote}>{note}</p>}
          {children && <div className={styles.ctaExtra}>{children}</div>}
        </div>
      </div>
    </section>
  );
}

/** The ArrowLink look on a real <button>, for actions that are not plain links. */
export function ArrowButton({
  children,
  onClick,
  type = 'button',
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'submit' | 'button';
  className?: string;
}) {
  return (
    <button type={type} onClick={onClick} className={`${landing.btnPrimary} ${styles.btnArrow} ${className}`}>
      {children}
      <span className={landing.arrowTile} aria-hidden="true">
        →
      </span>
    </button>
  );
}

/** Ink submit button with the pink arrow tile, for forms. */
export function SubmitButton({
  children,
  disabled,
  type = 'submit',
  onClick,
  className = '',
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: 'submit' | 'button';
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${styles.btnSubmit} ${className}`}>
      <span>{children}</span>
      <span className={styles.btnSubmitTile} aria-hidden="true">
        →
      </span>
    </button>
  );
}
