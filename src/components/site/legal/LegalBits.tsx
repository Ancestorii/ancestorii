import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Globe, Mail, MonitorSmartphone, Smartphone } from 'lucide-react';
import landing from '@/components/landing/landing.module.css';
import { Prose } from '@/components/site/SiteBits';
import css from './legal.module.css';

// Building blocks shared by the legal pages (privacy policy, terms, delete account).
// They sit inside SiteShell, under a left-aligned PageHero.

/**
 * The reading column (about 760px, left edge in line with the hero), with an optional
 * table of contents beside it on wide screens and an optional side card that sits
 * beside the text on wide screens and under it on smaller ones.
 */
export function LegalBody({
  children,
  toc,
  aside,
}: {
  children: ReactNode;
  toc?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className={css.body}>
      <div className={`${landing.wrap} ${css.layout}`}>
        <article className={css.article}>{children}</article>
        {toc && <aside className={`${css.aside} ${css.asideToc}`}>{toc}</aside>}
        {aside && <aside className={css.aside}>{aside}</aside>}
      </div>
    </section>
  );
}

/** Opening paragraphs. With `lead`, the first one reads as a lead (for a short opener). */
export function LegalIntro({ children, lead = false }: { children: ReactNode; lead?: boolean }) {
  return <Prose className={lead ? css.introLead : ''}>{children}</Prose>;
}

/** Numbered section: the number in pink, the title in heavy ink, the text as prose. */
export function LegalSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={css.section} id={`section-${number}`}>
      <h2 className={css.sectionTitle}>
        <span className={css.sectionNum}>{number}.</span>{' '}
        <span className={css.sectionName}>{title}</span>
      </h2>
      <Prose className={css.sectionBody}>{children}</Prose>
    </div>
  );
}

const PARTS: Record<string, { Icon: LucideIcon; color: string; tilt: string }> = {
  A: { Icon: MonitorSmartphone, color: 'var(--c0)', tilt: '-4deg' },
  B: { Icon: Globe, color: 'var(--c1)', tilt: '3deg' },
  C: { Icon: Smartphone, color: 'var(--c3)', tilt: '-3deg' },
};

/** Opens Part A, B or C: a white card with a solid colour panel and a tilted icon tile. */
export function PartBanner({
  letter,
  label,
  children,
}: {
  letter: string;
  label: string;
  children: ReactNode;
}) {
  const { Icon, color, tilt } = PARTS[letter] ?? PARTS.A;
  return (
    <div
      id={`part-${letter.toLowerCase()}`}
      className={css.part}
      style={{ '--panel': color, '--tilt': tilt } as CSSProperties}
    >
      <div className={css.partPanel} aria-hidden="true">
        <div className={css.partTile}>
          <Icon size={48} strokeWidth={2.4} />
        </div>
      </div>
      <div className={css.partBody}>
        <p className={css.partLabel}>Part {letter}</p>
        <h2 className={css.partTitle}>{label}</h2>
        <p className={css.partText}>{children}</p>
      </div>
    </div>
  );
}

/** Quiet closing line under the text, above a hairline. */
export function LegalEndNote({ children }: { children: ReactNode }) {
  return (
    <div className={css.endNote}>
      <p>{children}</p>
    </div>
  );
}

const STEP_COLOURS = [
  { color: 'var(--c0)', tilt: '-4deg' },
  { color: 'var(--c1)', tilt: '3deg' },
  { color: 'var(--c2)', tilt: '-3deg' },
  { color: 'var(--c3)', tilt: '4deg' },
];

/** Numbered steps as small cards, one landing colour each. */
export function LegalSteps({ steps }: { steps: { Icon: LucideIcon; text: ReactNode }[] }) {
  return (
    <ol className={css.steps}>
      {steps.map(({ Icon, text }, i) => {
        const { color, tilt } = STEP_COLOURS[i % STEP_COLOURS.length];
        return (
          <li
            key={i}
            className={css.step}
            style={{ '--panel': color, '--tilt': tilt } as CSSProperties}
          >
            <span className={css.stepPanel} aria-hidden="true">
              <span className={css.stepTile}>
                <Icon size={26} strokeWidth={2.5} />
              </span>
            </span>
            <span className={css.stepBody}>
              <strong className={css.stepNum}>{i + 1}.</strong> {text}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Solid blue contact card with a tilted mail tile. Children are its lines, styled with
 * legalStyles.contactTitle, legalStyles.contactText and legalStyles.contactNote.
 */
export function LegalContactCard({ children }: { children: ReactNode }) {
  return (
    <div className={css.contact}>
      <div className={css.contactTile} aria-hidden="true">
        <Mail size={30} strokeWidth={2.4} />
      </div>
      {children}
    </div>
  );
}

export { css as legalStyles };
