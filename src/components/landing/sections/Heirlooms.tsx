import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { ArrowLink } from '../LandingBits';
import landing from '../landing.module.css';
import s from './heirlooms.module.css';

// Where a feature works: a pink dot for the app, a blue dot for the website, both dots for both
// (the logo's two dots). The words always show, so colour is never the only signal.
function Where({ on, className = '' }: { on: 'app' | 'web' | 'both'; className?: string }) {
  return (
    <span className={className ? `${s.where} ${className}` : s.where}>
      {on !== 'web' && <span className={s.whereDot} style={{ background: 'var(--c0)' }} aria-hidden="true" />}
      {on !== 'app' && <span className={s.whereDot} style={{ background: 'var(--c1)' }} aria-hidden="true" />}
      {on === 'app' ? 'In the app' : on === 'web' ? 'On the website' : 'App and website'}
    </span>
  );
}

// Each panel is a size drawing, not a mockup: book spines as wide as their page counts, or the
// prints as rectangles in inches at one scale shared by canvas and acrylic.
type Drawing =
  | { kind: 'spines'; pages: string[] }
  | { kind: 'shapes'; shapes: { w: string; h: string }[] };

type Product = {
  title: string;
  text: ReactNode;
  panel: string;
  panelFg: string;
  drawing: Drawing;
  sizes: string;
  tiers?: { name: string; pages: string; price: string }[];
  points: string[];
  from: string;
  link: { href: string; label: string };
};

// Checked against the editors and checkouts: books are A4 landscape hardcovers of 24, 36 or 48
// printed pages, covers included (22 to fill in the editor on A Chapter); canvas and acrylic both
// start at £99.99 (not the £29.99 and £39.99 on /pricing); the 24×72 canvas ships to the UK only,
// and only it has the ten-photo Mosaic and five of the 18 layouts, so elsewhere a canvas holds
// six photos at most. The builders need a screen 1024px or wider, so the lead says 'on a laptop
// or desktop'. A no-break space keeps each '·' with the words before it.
const PRODUCTS: Product[] = [
  {
    title: 'Memory Books',
    text: 'A4 landscape hardcovers you design page by page from your family’s photos and words.',
    panel: 'var(--c2)',
    panelFg: 'var(--ink)',
    drawing: { kind: 'spines', pages: ['24', '36', '48'] },
    sizes: '24 · 36 · 48 pages',
    tiers: [
      { name: 'A Chapter', pages: '24 pages', price: '£44.99' },
      { name: 'A Story', pages: '36 pages', price: '£54.99' },
      { name: 'A Legacy', pages: '48 pages', price: '£64.99' },
    ],
    points: [
      'Five page layouts, three covers and your own words on the spine',
      'Preview it spread by spread and download a free PDF',
      'Page counts include both covers',
    ],
    from: '£44.99',
    link: { href: '/memory-books', label: 'See Memory Books' },
  },
  {
    title: 'Canvas prints',
    text: (
      <>
        Family photos on stretched canvas, from a single picture to a{' '}
        <span style={{ whiteSpace: 'nowrap' }}>six-photo</span> grid.
      </>
    ),
    panel: 'var(--c1)',
    panelFg: '#fff',
    drawing: {
      kind: 'shapes',
      shapes: [
        { w: '36', h: '16' },
        { w: '32', h: '20' },
        { w: '72', h: '24' },
      ],
    },
    sizes: '16×36 · 20×32 · 24×72 in',
    points: [
      '16×36, 20×32 or 24×72 inches, landscape or portrait',
      '18 layouts, with up to ten photos on the 24×72, which ships to UK addresses only',
    ],
    from: '£99.99',
    link: { href: '/canvas-prints', label: 'See canvas prints' },
  },
  {
    title: 'Acrylic prints',
    text: 'A photo printed behind polished acrylic, ready to hang.',
    panel: 'var(--c3)',
    panelFg: 'var(--ink)',
    drawing: {
      kind: 'shapes',
      shapes: [
        { w: '16', h: '24' },
        { w: '24', h: '24' },
        { w: '24', h: '36' },
      ],
    },
    sizes: '16×24 · 24×24 · 24×36 in',
    points: [
      '16×24, 24×24 or 24×36 inches, portrait, landscape or square',
      'One, two or four photos: Solo, Duo or Grid',
    ],
    from: '£99.99',
    link: { href: '/acrylic-prints', label: 'See acrylic prints' },
  },
];

// Delivery reaches 20 countries (never 'worldwide'), and no Express times are given because
// Express books still ship Standard. Reward codes are earned in the app and used on the website.
const FACTS = [
  {
    lead: 'Delivery from £4.99',
    text: 'to 20 countries, including the UK, Ireland, the US, Canada, Australia and New Zealand. Standard takes 10 to 14 working days, and you can follow it on your Orders page.',
    dot: 'var(--c0)',
  },
  { lead: 'Premium families get 10% off', text: 'every print.', dot: 'var(--c1)' },
  {
    lead: 'Family rewards:',
    text: 'save memories in the app and earn print discounts, from 10% off at 10 memories to 50% off at 175, plus a free Chapter Memory Book at 100 when two or more of you contribute.',
    dot: 'var(--c3)',
  },
];

// The three printed products with their real sizes and prices, then delivery, the Premium
// discount and family rewards. No photos: the reviewers holding their books come straight after.
// Each product links to its own page under its price; the button at the foot is for Memory Books.
export default function Heirlooms() {
  return (
    <section id="heirlooms" className={landing.section}>
      <div className={landing.wrap}>
        <div className={landing.head}>
          <div className={s.tags}>
            <span className={landing.badge}>
              <span
                className={landing.badgeDot}
                style={{ '--dot': 'var(--c2)' } as CSSProperties}
                aria-hidden="true"
              />
              {'Heirlooms · Print'}
            </span>
            <Where on="web" />
          </div>
          <h2 className={`${landing.h2} ${s.title}`}>Turn the stories into something you can hold.</h2>
          <p className={landing.headLead}>
            Design a Memory Book, a canvas or an acrylic print from the photos in your Library, on a
            laptop or desktop, and it’s printed and posted to your door.
          </p>
        </div>

        <ul className={s.products}>
          {PRODUCTS.map((product) => (
            <li
              key={product.title}
              className={s.product}
              style={{ '--panel': product.panel, '--panel-fg': product.panelFg } as CSSProperties}
            >
              {/* Decorative: every size in the drawing is repeated in the words below it. */}
              <div className={s.panel} aria-hidden="true">
                {product.drawing.kind === 'spines' ? (
                  <div className={s.spines}>
                    {product.drawing.pages.map((pages) => (
                      <span key={pages} className={s.spine} style={{ '--p': pages } as CSSProperties} />
                    ))}
                  </div>
                ) : (
                  <div className={s.shapes}>
                    {product.drawing.shapes.map((shape) => (
                      <span
                        key={`${shape.w}x${shape.h}`}
                        className={s.shape}
                        style={{ '--w': shape.w, '--h': shape.h } as CSSProperties}
                      />
                    ))}
                  </div>
                )}
                <p className={s.sizes}>{product.sizes}</p>
              </div>

              <div className={s.body}>
                <h3 className={s.productTitle}>{product.title}</h3>
                <p className={s.text}>{product.text}</p>
                {product.tiers && (
                  <ul className={s.tiers}>
                    {product.tiers.map((tier) => (
                      <li key={tier.name}>
                        <span>
                          <strong>{tier.name}</strong>{' '}{tier.pages}
                        </span>
                        <strong>{tier.price}</strong>
                      </li>
                    ))}
                  </ul>
                )}
                <ul className={s.points}>
                  {product.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <p className={s.price}>
                  From {product.from}{' '}<span>plus delivery</span>
                </p>
                <Link href={product.link.href} prefetch={false} className={s.more}>
                  {product.link.label}
                  <ArrowRight size={16} strokeWidth={2.6} aria-hidden="true" />
                </Link>
              </div>
            </li>
          ))}
        </ul>

        <ul className={`${s.facts} ${s.after}`}>
          {FACTS.map((fact) => (
            <li key={fact.lead} style={{ '--dot': fact.dot } as CSSProperties}>
              {/* One span, so the bold lead-in runs on into its sentence beside the dot. */}
              <span>
                <strong>{fact.lead}</strong>{' '}{fact.text}
              </span>
            </li>
          ))}
        </ul>

        <p className={s.fine}>
          Reward codes are single-use, last 7 days and are used at checkout on the website. They
          replace the Premium discount rather than adding to it. Delivery still applies.
        </p>

        <ArrowLink href="/memory-books" prefetch={false} className={s.cta}>
          Explore Memory Books
        </ArrowLink>
      </div>
    </section>
  );
}
