import type { CSSProperties } from 'react';
import { ArrowDown } from 'lucide-react';
import SmoothAnchor from '../SmoothAnchor';
import landing from '../landing.module.css';
import s from './featureIndex.module.css';

type WhereOn = 'app' | 'web' | 'both';

const WHERE_LABEL: Record<WhereOn, string> = {
  app: 'In the app',
  web: 'On the website',
  both: 'App and website',
};

// Where a feature works: a pink dot for the app, a blue dot for the website, both dots for both
// (the logo's two dots). The words always show, so colour is never the only signal.
function Where({ on, className = '' }: { on: WhereOn; className?: string }) {
  return (
    <span className={`${s.where} ${className}`}>
      {on !== 'web' && <span className={s.whereDot} style={{ background: 'var(--c0)' }} aria-hidden="true" />}
      {on !== 'app' && <span className={s.whereDot} style={{ background: 'var(--c1)' }} aria-hidden="true" />}
      {WHERE_LABEL[on]}
    </span>
  );
}

// Every area of the product, in the order the page shows them. Each tile jumps to its section:
// SmoothAnchor glides there (or jumps, with reduced motion) and moves focus to its heading.
// The colours run pink, blue, orange, aqua, blue, pink, aqua, orange, so no two neighbours match at
// 1, 2 or 4 columns. Ink text on pink, orange and aqua; white only on blue.
const TILES: {
  bg: string;
  fg: string;
  on: WhereOn;
  title: string;
  line: string;
  href: `#${string}`;
}[] = [
  {
    bg: 'var(--c0)',
    fg: 'var(--ink)',
    on: 'both',
    title: 'My Family',
    line: 'A private space where everyone you invite shares memories',
    href: '#my-family',
  },
  {
    bg: 'var(--c1)',
    fg: '#fff',
    on: 'app',
    title: 'Questions',
    line: '46 ready-made questions to send to Mum, Grandad or anyone',
    href: '#questions',
  },
  {
    bg: 'var(--c2)',
    fg: 'var(--ink)',
    on: 'both',
    title: 'Albums and Library',
    line: 'Albums with the story under each photo, and one shared Library',
    href: '#albums',
  },
  {
    bg: 'var(--c3)',
    fg: 'var(--ink)',
    on: 'both',
    title: 'Timelines and Loved Ones',
    line: 'A life in order, and a page for each person in it',
    href: '#timelines',
  },
  {
    bg: 'var(--c1)',
    fg: '#fff',
    on: 'both',
    title: 'Voice notes',
    line: 'Keep how they sounded, not just how they looked',
    href: '#voices',
  },
  {
    bg: 'var(--c0)',
    fg: 'var(--ink)',
    on: 'web',
    title: 'Capsules',
    line: 'Photos, a letter and voices, sealed until the day you choose',
    href: '#capsules',
  },
  {
    bg: 'var(--c3)',
    fg: 'var(--ink)',
    on: 'web',
    title: 'Our Stories',
    line: 'Real family stories, free for anyone to read',
    href: '#stories',
  },
  {
    bg: 'var(--c2)',
    fg: 'var(--ink)',
    on: 'web',
    title: 'Memory Books and prints',
    line: 'Printed from your photos and posted to your door',
    href: '#heirlooms',
  },
];

// The feature index: the hero's "See how it works" button lands here (#how). Eight solid-colour
// tiles name every area of the product, with a one-line benefit and where it works.
export default function FeatureIndex() {
  return (
    <section id="how" className={landing.section}>
      <div className={landing.wrap}>
        <div className={landing.head}>
          <div className={s.tags}>
            <span className={landing.badge}>
              <span className={landing.badgeDot} style={{ '--dot': 'var(--c1)' } as CSSProperties} />
              How it works
            </span>
          </div>
          <h2 className={`${landing.h2} ${s.title}`}>Everything you can keep, share and print.</h2>
          <p className={landing.headLead}>
            A private space for the people you invite, a public feed for the stories you choose to
            share, and prints made from your family’s photos. Pick one to see how it works.
          </p>
        </div>

        {/* SmoothAnchor takes no style prop, so each tile's colours sit on its li and inherit.
            The where pill comes after the line, so each link's name starts with the feature;
            from 600px the CSS still shows it first. */}
        <ul className={s.grid}>
          {TILES.map((t) => (
            <li
              key={t.href}
              className={s.item}
              style={{ '--tile': t.bg, '--tile-fg': t.fg } as CSSProperties}
            >
              <SmoothAnchor href={t.href} className={s.tile}>
                <h3 className={s.tileTitle}>{t.title}</h3>
                <span className={s.tileLine}>
                  {t.line}
                  {/* Phones hide the pill and say where at the end of the line instead. The no-break
                      space keeps the dot off the start of a wrapped line, and the label never
                      breaks inside itself. */}
                  <span className={s.whereInline}>
                    {'\u00a0· '}
                    <span className={s.whereWords}>{WHERE_LABEL[t.on]}</span>
                  </span>
                </span>
                <Where on={t.on} className={s.tileWhere} />
                <span className={s.arrow} aria-hidden="true">
                  <ArrowDown size={16} strokeWidth={2.6} />
                </span>
              </SmoothAnchor>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
