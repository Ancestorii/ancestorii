import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Check,
  Eye,
  Gem,
  Heart,
  Image as ImageIcon,
  LifeBuoy,
  Lock,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import StoreBadges from '@/components/StoreBadges';
import { Accent, ArrowLink, ClosingCta, DotList, Eyebrow, PageHero, SectionHead } from '@/components/site/SiteBits';
import landing from '@/components/landing/landing.module.css';
import site from '@/components/site/site.module.css';
import css from './pricing.module.css';

const OUR_STORIES_FEATURES = [
  'Read stories from families everywhere',
  'Like, comment, and share memories',
  'Publish your own stories publicly',
  'Newest first, no follower counts',
];

const MY_FAMILY_FREE_FEATURES = [
  { t: '1GB storage', on: true },
  { t: 'Unlimited timelines', on: true },
  { t: 'Unlimited albums', on: true },
  { t: 'Unlimited capsules', on: true },
  { t: '20MB max file size', on: true },
  { t: '5\u00a0min video length', on: true },
  { t: '1 Loved Ones profile', on: true },
  { t: 'Priority support', on: false },
  { t: 'Early access to features', on: false },
  { t: '10% off heirlooms', on: false },
];

const MY_FAMILY_PREMIUM_FEATURES = [
  '100GB storage',
  'Unlimited timelines',
  'Unlimited albums',
  'Unlimited capsules',
  '10GB max file size',
  '15\u00a0min video length',
  'Unlimited Loved Ones profiles',
  'Priority support',
  'Early access to features',
  '10% off all heirlooms',
];

// Each heirloom on a solid colour panel with its symbol, like the landing's steps.
const HEIRLOOMS: { name: string; price: string; desc: string; Icon: LucideIcon; tone: string; tilt: string }[] = [
  { name: 'Memory Book', price: 'From £44.99 + delivery', desc: 'A hardcover book you design page by page. Three tiers available. Your stories, your photos, your layout.', Icon: BookOpen, tone: css.orange, tilt: '-4deg' },
  { name: 'Canvas Print', price: 'From £99.99 + delivery', desc: 'Museum grade photo on stretched canvas. The kind of image that belongs on a wall, not buried in a camera roll.', Icon: ImageIcon, tone: css.blue, tilt: '3deg' },
  { name: 'Acrylic Print', price: 'From £99.99 + delivery', desc: 'HD UV print behind polished acrylic glass. Vivid colour, clean edges, permanent weight.', Icon: Gem, tone: css.aqua, tilt: '-3deg' },
];

const NEVER_PAY_FOR: { line: string; Icon: LucideIcon; tone: string; tilt: string }[] = [
  { line: 'Reading, liking, commenting, and sharing on Our Stories.', Icon: Heart, tone: css.pink, tilt: '-5deg' },
  { line: 'Accessing your private library after downgrading. Your memories stay.', Icon: Lock, tone: css.blue, tilt: '4deg' },
  { line: 'Viewing everything you have built, even on the free plan.', Icon: Eye, tone: css.aqua, tilt: '-4deg' },
  { line: 'Your data. We do not sell it, rent it, or show you ads.', Icon: ShieldCheck, tone: css.orange, tilt: '5deg' },
  { line: 'Support. Premium gets priority, but everyone gets help.', Icon: LifeBuoy, tone: css.pink, tilt: '-3deg' },
];

function Tick({ tone }: { tone: string }) {
  return (
    <span className={`${css.tick} ${tone}`} aria-hidden="true">
      <Check size={14} strokeWidth={3.4} />
    </span>
  );
}

function Cross() {
  return (
    <span className={`${css.tick} ${css.tickOff}`} aria-hidden="true">
      <X size={13} strokeWidth={3} />
    </span>
  );
}

export default function PricingPage() {
  return (
    <>
      {/* ━━━ HERO ━━━ */}
      <PageHero
        eyebrow="Pricing"
        eyebrowDot="var(--c3)"
        title={
          <>
            Share for free.
            <br />
            Build for{' '}
            <span className={css.nowrap}>
              <Accent>£3.99 a month.</Accent>
            </span>
          </>
        }
        lead={
          <>
            Our Stories is free for everyone. My Family starts free and grows with you. No hidden fees. No
            tricks. No ads.
          </>
        }
      >
        <p className={css.perFamily}>
          <span className={`${css.perFamilyTile} ${css.aqua}`} aria-hidden="true">
            <Users size={21} strokeWidth={2.6} />
          </span>
          <span>£3.99 per family, not per person. One payment covers your whole family.</span>
        </p>
      </PageHero>

      {/* ━━━ TIER CARDS ━━━ */}
      <section className={site.sectionSm}>
        <div className={`${landing.wrap} ${css.plans}`}>
          {/* ── OUR STORIES ── */}
          <article className={`${css.plan} ${css.planStories}`}>
            <div className={css.planHead}>
              <div className={css.planTop}>
                <span className={site.tag} style={{ '--dot': 'var(--c0)' } as CSSProperties}>
                  Public
                </span>
              </div>
              <h2 className={css.planName}>Our Stories</h2>
              <div className={css.price}>
                <span className={css.priceBig}>Free</span>
                <span className={css.priceUnit}>forever</span>
              </div>
            </div>
            <ul className={css.features}>
              {OUR_STORIES_FEATURES.map((t, i) => (
                <li key={i} className={css.feature}>
                  <Tick tone={css.pink} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            {/* Fills the room the shorter list leaves when the plans sit side by side. */}
            <blockquote className={css.planQuote}>
              <span className={css.planQuoteMark} aria-hidden="true">
                “
              </span>
              <p>Not social media. A memory space with a door that stays open.</p>
            </blockquote>
            <Link href="/signup" className={`${landing.btnOutline} ${css.planCta}`}>
              Get started
            </Link>
          </article>

          {/* ── MY FAMILY FREE ── */}
          <article className={css.plan}>
            <div className={css.planHead}>
              <div className={css.planTop}>
                <span className={site.tag} style={{ '--dot': 'var(--c1)' } as CSSProperties}>
                  Private · Free
                </span>
              </div>
              <h2 className={css.planName}>My Family</h2>
              <div className={css.price}>
                <span className={css.priceBig}>£0</span>
                <span className={css.priceUnit}>no card needed</span>
              </div>
            </div>
            <ul className={css.features}>
              {MY_FAMILY_FREE_FEATURES.map((f, i) => (
                <li key={i} className={css.feature}>
                  {f.on ? <Tick tone={css.blue} /> : <Cross />}
                  <span>
                    {!f.on && <span className={site.srOnly}>Not included: </span>}
                    {f.t}
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/signup" className={`${landing.btnOutline} ${css.planCta}`}>
              Start for free
            </Link>
          </article>

          {/* ── MY FAMILY PREMIUM ── */}
          <article className={`${css.plan} ${css.planInk}`}>
            <div className={css.planHead}>
              <div className={css.planTop}>
                <span className={site.tag} style={{ '--dot': 'var(--c3)' } as CSSProperties}>
                  Private · Premium
                </span>
                <span className={css.recommended}>Recommended</span>
              </div>
              <h2 className={css.planName}>My Family</h2>
              <div className={css.price}>
                <span className={css.priceBig}>£3.99</span>
                <span className={css.priceUnit}>/ month</span>
              </div>
              <div className={css.currencies}>
                <span className={css.currency}>€4.99 / month</span>
                <span className={css.currency}>$5.99 / month</span>
              </div>
              <p className={css.planNote}>
                Per family, not per person. One payment covers your whole family.
              </p>
            </div>
            <ul className={css.features}>
              {MY_FAMILY_PREMIUM_FEATURES.map((t, i) => (
                <li key={i} className={css.feature}>
                  <Tick tone={css.aqua} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <ArrowLink href="/signup" className={`${landing.btnLight} ${css.planCta} ${css.planCtaArrow}`}>
              Start free, upgrade anytime
            </ArrowLink>
          </article>
        </div>
      </section>

      {/* ━━━ HEIRLOOMS ━━━ */}
      <section className={site.section}>
        <div className={landing.wrap}>
          <div className={css.headTop}>
            <Eyebrow dot="var(--c2)">Physical Products</Eyebrow>
          </div>
          <SectionHead
            title="My Heirlooms"
            lead={<>Pay per product. No subscription required. Premium members save 10% on every order.</>}
          />

          <div className={css.products}>
            {HEIRLOOMS.map((p) => (
              <article
                key={p.name}
                className={`${css.product} ${p.tone}`}
                style={{ '--tilt': p.tilt } as CSSProperties}
              >
                <div className={css.productPanel} aria-hidden="true">
                  <div className={css.productTile}>
                    <p.Icon size={54} strokeWidth={2.4} />
                  </div>
                </div>
                <div className={css.productBody}>
                  <h3 className={css.productName}>{p.name}</h3>
                  <p className={css.productPrice}>{p.price}</p>
                  <p className={css.productDesc}>{p.desc}</p>
                  <Link
                    href={p.name === 'Memory Book' ? '/memory-books' : p.name === 'Canvas Print' ? '/canvas-prints' : '/acrylic-prints'}
                    className={css.productLink}
                  >
                    Learn more <span className={landing.arrowGlyph}>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ ALWAYS FREE ━━━ */}
      <section className={site.section}>
        <div className={`${landing.wrap} ${css.promise}`}>
          <div>
            <Eyebrow dot="var(--c0)">Promise</Eyebrow>
            <h2 className={`${landing.h2} ${css.promiseTitle}`}>
              What you will
              <br />
              <Accent tone="pink">never pay for.</Accent>
            </h2>
          </div>
          <ul className={css.promiseList}>
            {NEVER_PAY_FOR.map(({ line, Icon, tone, tilt }) => (
              <li key={line} className={css.promiseItem}>
                <span
                  className={`${css.promiseTile} ${tone}`}
                  style={{ '--tilt': tilt } as CSSProperties}
                  aria-hidden="true"
                >
                  <Icon size={22} strokeWidth={2.4} />
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ━━━ CTA ━━━ */}
      <ClosingCta
        wide
        prefetch
        title={
          <>
            <span className={css.ctaLine}>Start with one memory.</span>{' '}
            <Accent tone="pink">Build from there.</Accent>
          </>
        }
        lead="No credit card. No commitment. Just start."
        primary={{ href: '/signup', label: 'Start For Free' }}
      >
        <DotList items={['No credit card required', 'Takes 2 minutes']} center />

        <div className={css.app}>
          <div className={css.appText}>
            <p className={css.appLead}>
              You create and share memories in the app. You upgrade and order keepsakes here on the website.
            </p>
            <p className={css.appSub}>
              Already using the Ancestorii app? This is the same account. Log in with the same email and password you use in the app.
            </p>
          </div>
          <StoreBadges theme="dark" className={css.appBadges} />
        </div>
      </ClosingCta>
    </>
  );
}
