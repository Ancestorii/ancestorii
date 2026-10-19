import Link from 'next/link';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Check, X } from 'lucide-react';
import { PhotoFrame } from '@/components/site/SiteBits';
import g from './guides.module.css';

// Content blocks for the guides, each one a card from the landing page: white with the
// hairline ring, and a tilted colour tile (pink, blue, orange, aqua in turn).

/** Numbered steps. */
export function Steps({ children }: { children: ReactNode }) {
  return (
    <ol className={`${g.list} ${g.rotate}`} role="list">
      {children}
    </ol>
  );
}

export function Step({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <li className={`${g.card} ${g.item}`}>
      <span className={g.tile} aria-hidden="true">
        {number}
      </span>
      <div className={g.itemBody}>
        <h3 className={g.itemTitle}>{title}</h3>
        <div className={g.itemText}>{children}</div>
      </div>
    </li>
  );
}

/** Tips that open with a bold line, each with an icon. */
export function Points({ children }: { children: ReactNode }) {
  return (
    <ul className={`${g.list} ${g.rotate}`} role="list">
      {children}
    </ul>
  );
}

export function Point({ icon: Icon, title, children }: { icon: LucideIcon; title: ReactNode; children: ReactNode }) {
  return (
    <li className={`${g.card} ${g.item}`}>
      <span className={g.tile} aria-hidden="true">
        <Icon size={26} strokeWidth={2.4} />
      </span>
      <p className={g.itemBody}>
        <strong className={g.itemTitle}>{title}</strong>{' '}
        <span className={g.itemText}>{children}</span>
      </p>
    </li>
  );
}

/** Short examples, together in one card. */
export function Tips({ children }: { children: ReactNode }) {
  return (
    <ul className={`${g.card} ${g.tips} ${g.rotate}`} role="list">
      {children}
    </ul>
  );
}

export function Tip({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <li className={g.tip}>
      <span className={`${g.tile} ${g.tileSm}`} aria-hidden="true">
        <Icon size={22} strokeWidth={2.4} />
      </span>
      <p className={g.tipText}>{children}</p>
    </li>
  );
}

/** Questions to ask, with why each one works. */
export function Prompts({ children }: { children: ReactNode }) {
  return (
    <ul className={g.prompts} role="list">
      {children}
    </ul>
  );
}

export function Prompt({ question, context }: { question: string; context: string }) {
  return (
    <li className={`${g.card} ${g.prompt}`}>
      <span className={g.promptMark} aria-hidden="true">
        “
      </span>
      <p className={g.promptQ}>{question}</p>
      <p className={g.promptContext}>{context}</p>
    </li>
  );
}

/** Themed sets of questions. */
export function QuestionSets({ children }: { children: ReactNode }) {
  return <div className={`${g.list} ${g.rotate}`}>{children}</div>;
}

export function QuestionSet({
  icon: Icon,
  title,
  questions,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  questions: string[];
  /** For a section with a single set: its colour, so consecutive sections still take turns. */
  tone?: GuideTone;
}) {
  return (
    <div className={`${g.card} ${g.set} ${tone ? TONE_CLASS[tone] : ''}`}>
      <div className={g.setHead}>
        <span className={g.tile} aria-hidden="true">
          <Icon size={26} strokeWidth={2.4} />
        </span>
        <h3 className={g.setTitle}>{title}</h3>
      </div>
      <ul className={g.setList}>
        {questions.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ul>
    </div>
  );
}

function Mark({ yes = false }: { yes?: boolean }) {
  return (
    <span className={`${g.mark} ${yes ? g.markYes : g.markNo}`} aria-hidden="true">
      {yes ? <Check size={17} strokeWidth={3} /> : <X size={16} strokeWidth={2.8} />}
    </span>
  );
}

/** Two ways side by side, row by row: the usual way (left) and the way that works (right). */
export function Compare({ labels, children }: { labels: [string, string]; children: ReactNode }) {
  return (
    <div className={`${g.card} ${g.compareBlock}`} role="table">
      <div className={`${g.compareRow} ${g.compareHead}`} role="row">
        <div className={g.compareCell} role="columnheader">
          <Mark />
          <span>{labels[0]}</span>
        </div>
        <div className={g.compareCell} role="columnheader">
          <Mark yes />
          <span>{labels[1]}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

export function CompareRow({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className={g.compareRow} role="row">
      <div className={`${g.compareCell} ${g.compareNo}`} role="cell">
        <Mark />
        <span>{left}</span>
      </div>
      <div className={`${g.compareCell} ${g.compareYes}`} role="cell">
        <Mark yes />
        <span>{right}</span>
      </div>
    </div>
  );
}

/** A real family's photo in a colour frame, inside the reading column. */
export function GuideFigure({
  src,
  alt,
  label,
  color,
  position,
}: {
  src: string;
  alt: string;
  label: string;
  color: string;
  position?: string;
}) {
  return (
    <div className={g.figure}>
      <PhotoFrame
        src={src}
        alt={alt}
        label={label}
        color={color}
        aspect="5 / 4"
        position={position}
        sizes="(max-width: 808px) 92vw, 660px"
      />
    </div>
  );
}

export type GuideTone = 'pink' | 'blue' | 'orange' | 'aqua';

const TONE_CLASS: Record<GuideTone, string> = {
  pink: g.tonePink,
  blue: g.toneBlue,
  orange: g.toneOrange,
  aqua: g.toneAqua,
};

/** One guide on the index: colour panel with a tilted icon tile, then number, title and summary. */
export function GuideCard({
  href,
  num,
  title,
  desc,
  icon: Icon,
  tone,
  featured = false,
}: {
  href: string;
  num: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  tone: GuideTone;
  featured?: boolean;
}) {
  // The featured guide leads the page (h2); the others sit under their section's h2.
  const Title = featured ? 'h2' : 'h3';
  return (
    <Link href={href} className={`${g.guide} ${TONE_CLASS[tone]} ${featured ? g.guideFeatured : ''}`}>
      <div className={g.guidePanel}>
        <span className={g.guideTile} aria-hidden="true">
          <Icon size={44} strokeWidth={2.4} />
        </span>
      </div>
      <div className={g.guideBody}>
        <span className={g.guideTag}>{num}</span>
        <Title className={g.guideTitle}>{title}</Title>
        <p className={g.guideDesc}>{desc}</p>
        <span className={g.guideArrow} aria-hidden="true">
          <span className={g.guideArrowTile}>→</span>
        </span>
      </div>
    </Link>
  );
}
