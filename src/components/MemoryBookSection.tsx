'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { BookCopy, BookOpen, Gift, Images, LayoutPanelLeft, LayoutTemplate, PenTool } from 'lucide-react';
import { Accent, ArrowLink, Eyebrow, PanelCard, PullQuote } from '@/components/site/SiteBits';
import landing from '@/components/landing/landing.module.css';
import site from '@/components/site/site.module.css';
import styles from '@/components/site/memory-books/memory-books.module.css';

/* ─── Tilted icon tile (white unless `bg` is set) ─── */
function Tile({
  Icon,
  fg,
  bg,
  tilt,
  className = '',
}: {
  Icon: LucideIcon;
  fg: string;
  bg?: string;
  tilt: string;
  className?: string;
}) {
  return (
    <span
      className={`${styles.tile} ${className}`}
      style={{ '--tile': bg, '--tile-fg': fg, '--tilt': tilt } as CSSProperties}
      aria-hidden="true"
    >
      <Icon size={38} strokeWidth={2.4} />
    </span>
  );
}

/* ─── Section label ─── */
function Label({ children, dot }: { children: ReactNode; dot: string }) {
  return (
    <div className={styles.eyebrowRow}>
      <Eyebrow dot={dot}>{children}</Eyebrow>
    </div>
  );
}

/* ─── FAQ Item ─── */
function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <li className={styles.faqItem}>
      <h3 className={styles.faqQ}>{q}</h3>
      <p className={styles.faqA}>{a}</p>
    </li>
  );
}

/* ─── Testimonials ─── */
const testimonials = [
  { name: 'Alison', location: 'Nevada, United States', quote: 'I walked past my dad’s room and caught him looking through his memory book again. That’s the third time this week. Ancestorii helped me turn years of photos into something he genuinely treasures.', image: '/Testimonial2.png' },
  { name: 'Nicole', location: 'Nampa, United States', quote: 'In my case, I have external hard drives full of photos I never get to see, but Ancestorii finally gave those memories a place where they can be easily enjoyed and shared.', image: '/testimonial1.png' },
  { name: 'Andrea', location: 'Dudley, United Kingdom', quote: 'I recently lost my dad, so this book became incredibly special. It captured the essence of him and the life he lived. Our family will treasure it for years to come.', image: '/testimonial4.png' },
  { name: 'Erin', location: 'United Kingdom', quote: 'Ancestorii feels less like cloud storage and more like a living family archive. Beautifully designed and genuinely meaningful.', image: '/Testimonial5.png' },
];

// How each family appears: the frame colour, caption and crop of their photo on the
// hero wall, and the avatar beside their review (cropped from the photo they shared).
// The caption reads "Name · Place" (as on the landing); narrow cards show the name only,
// so the chip stays on one line and clear of their faces.
const family: Record<string, { place: string; color: string; position: string; avatar: string }> = {
  Alison: { place: 'Nevada, US', color: 'var(--c1)', position: '50% 50%', avatar: '/landing/review-alison.jpg' },
  Nicole: { place: 'Nampa, US', color: 'var(--c3)', position: '50% 62%', avatar: '/landing/review-nicole.jpg' },
  Andrea: { place: 'Dudley, UK', color: 'var(--c0)', position: '58% 50%', avatar: '/landing/review-andrea.jpg' },
  Erin: { place: 'UK', color: 'var(--c2)', position: '50% 35%', avatar: '/landing/review-erin.jpg' },
};

// Left to right on the hero wall, with the two book photos in the middle.
const wall = [1, 0, 2, 3].map((i) => testimonials[i]);

function Star() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
}

/* ─── The families with their books, on the landing hero's curved wall ─── */
function FamilyWall() {
  return (
    <div className={styles.wall}>
      <div className={styles.wallRing}>
        {wall.map((t) => {
          const f = family[t.name];
          return (
            <figure key={t.name} className={styles.wallCard} style={{ '--card': f.color } as CSSProperties}>
              <div className={landing.photoCard}>
                <div className={landing.photoCardInner}>
                  <Image
                    src={t.image}
                    alt={`${t.name} with their Ancestorii Memory Book`}
                    fill
                    sizes="(max-width: 680px) 170px, (max-width: 1000px) 25vw, 250px"
                    loading="eager"
                    className={landing.coverImg}
                    style={{ objectPosition: f.position }}
                  />
                </div>
              </div>
              <figcaption className={`${landing.chipRow} ${styles.wallCaption}`}>
                <span className={`${landing.chip} ${styles.wallChip}`}>
                  <span className={landing.chipDot} />
                  <span className={landing.chipText}>
                    {t.name}
                    <span className={styles.chipPlace}> · {f.place}</span>
                  </span>
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}

/* ─── The opening paragraph, word for word: its first half is the hero lead, the rest sits under the photo wall ─── */
const intro = [
  'Hundreds of photos sit on your phone right now. Thousands, probably. And behind every single one of them is a story that nobody else knows.',
  'A Memory Book takes those photos and those stories and turns them into something real. A hardcover book, professionally printed, delivered to your door. Something your family can hold, open, and pass down.',
];

/* ─── MAIN ─── */
export default function MemoryBooksContent() {
  return (
    <>
      {/* ━━━ HERO ━━━ */}
      <section className={site.hero}>
        <div className={site.heroInner}>
          <div className={site.heroTop}>
            <Eyebrow>From Screen to Shelf</Eyebrow>
          </div>

          <h1 className={site.heroTitle}>
            Your photos deserve more than <Accent>a phone.</Accent>
          </h1>

          <p className={site.heroLead}>{intro[0]}</p>

          <div className={site.heroActions}>
            <ArrowLink href="/signup" className={`${landing.btnShadow} ${styles.heroCta}`}>
              Start Designing Your Book
            </ArrowLink>
            <a href="#how-it-works" className={landing.btnOutline}>
              How It Works
            </a>
          </div>
        </div>

        <FamilyWall />

        <p className={styles.heroMore}>{intro[1]}</p>
      </section>

      {/* ━━━ WHAT IS IT ━━━ */}
      <section className={site.section}>
        <div className={`${landing.wrap} ${styles.what}`}>
          <PullQuote>
            A photograph captures a moment.{' '}
            <Accent tone="blue">A Memory Book captures why that moment mattered.</Accent>
          </PullQuote>

          <p className={`${styles.body} ${styles.whatText}`}>
            Think about the difference between a photo of your grandmother in her kitchen and a page that shows that photo alongside the story of what she was cooking that day, why she always used that same pan, and the recipe she never once wrote down. That is what a Memory Book does. It gives the photo a voice.
          </p>
        </div>
      </section>

      {/* ━━━ FULL CREATIVE CONTROL ━━━ */}
      <section className={site.section}>
        <div className={landing.wrap}>
          <Label dot="var(--c1)">Your Book, Your Way</Label>

          <h2 className={`${landing.h2} ${styles.title14}`}>
            Full creative control <Accent tone="blue">over every page.</Accent>
          </h2>

          <div className={styles.duo}>
            <div className={`${site.card} ${styles.duoCard}`}>
              <Tile Icon={LayoutTemplate} bg="var(--c2)" fg="var(--ink)" tilt="-4deg" />
              <p className={styles.body}>
                Most memory book services use rigid question and answer templates or auto generated layouts. You answer prompts, they arrange a book for you. It looks the same as everyone else&apos;s book because the template decides the structure, not you.
              </p>
            </div>

            <div className={`${site.colorCard} ${styles.duoCard}`} style={{ '--card': 'var(--c1)' } as CSSProperties}>
              <Tile Icon={PenTool} fg="var(--c1)" tilt="3deg" />
              <p className={styles.body}>
                Ancestorii works differently. You design each page yourself using a visual editor. Drag photos, add text, choose from multiple layouts, and decide exactly how your story is told. Your book reflects your family the way you want to tell it, not the way a template decides for you.
              </p>
            </div>
          </div>

          <p className={styles.compare}>
            See how Ancestorii compares to other family memory book services like{' '}
            <Link href="/compare" className={site.textLink}>StoryWorth and Remento</Link>.
          </p>
        </div>
      </section>

      {/* ━━━ HOW IT WORKS ━━━ */}
      <section id="how-it-works" className={`${site.section} ${styles.anchor}`}>
        <div className={landing.wrap}>
          <Label dot="var(--c0)">How It Works</Label>

          <h2 className={landing.h2}>
            Three steps.{' '}
            <Accent tone="pink">One book.</Accent>
          </h2>

          <div className={`${landing.steps} ${styles.steps}`}>
            {[
              { num: '01', title: 'Choose your photos and write the stories behind them', text: 'Pick the moments that matter from your family library. Add the context, the voices, the details that turn a photo into a memory.', Icon: Images, color: 'var(--c0)', tilt: '-4deg' },
              { num: '02', title: 'Design every page using the visual editor', text: 'Arrange layouts, position text, preview your book spread by spread. Full control, no templates, no restrictions.', Icon: LayoutPanelLeft, color: 'var(--c1)', tilt: '3deg' },
              { num: '03', title: 'Order and we print it as a hardcover book', text: 'Printed on 200gsm gloss pages with a hardcover matte finish. Delivered to your door. Order as many copies as you need.', Icon: BookOpen, color: 'var(--c3)', tilt: '-3deg' },
            ].map((step) => (
              <PanelCard key={step.num} num={step.num} title={step.title} text={step.text} Icon={step.Icon} color={step.color} tilt={step.tilt} />
            ))}
          </div>

          <div className={styles.copies}>
            <Tile Icon={BookCopy} fg="var(--c2)" tilt="-4deg" />
            <p className={styles.copiesText}>
              Order as many copies as you need. One for yourself, one for your parents, one for a sibling. The same book, shared across the people who matter.
            </p>
          </div>
        </div>
      </section>

      {/* ━━━ A GIFT ━━━ */}
      <section className={site.section}>
        <div className={`${landing.wrap} ${styles.gift}`}>
          <div>
            <Label dot="var(--c3)">More Than a Gift</Label>

            <h2 className={`${landing.h2} ${styles.title12}`}>
              A gift that actually{' '}
              <Accent tone="blue">means something.</Accent>
            </h2>

            <p className={`${styles.body} ${styles.giftText}`}>
              Most gifts get forgotten. A Memory Book does not. It is a printed collection of real family stories, designed by someone who lived them, handed to someone who needs to hold them. For a birthday, an anniversary, Mother&apos;s Day, Father&apos;s Day, or simply because the stories deserve to exist somewhere other than your phone.
            </p>
          </div>

          <div className={styles.giftStage}>
            <blockquote className={styles.giftQuote}>
              <span className={styles.giftMark} aria-hidden="true">
                “
              </span>
              <p className={styles.giftQuoteText}>
                The photos were on my phone for years.{' '}
                Now they are on my shelf forever.
              </p>
            </blockquote>
            <Tile Icon={Gift} fg="var(--c0)" tilt="8deg" className={styles.giftTile} />
          </div>
        </div>
      </section>

      {/* ━━━ TESTIMONIALS ━━━ */}
      <section className={site.section}>
        <div className={landing.wrap}>
          <Label dot="var(--c2)">From Our Families</Label>

          <div className={landing.sectionHead}>
            <h2 className={`${landing.h2} ${styles.title12}`}>
              Memories <Accent tone="pink">finally</Accent> given a home.
            </h2>
            <div className={styles.rating}>
              <span className={styles.stars} aria-hidden="true">
                {[...Array(5)].map((_, i) => <Star key={i} />)}
              </span>
              <span className={styles.ratingLabel}>Real Stories</span>
            </div>
          </div>

          <div className={styles.reviews}>
            {testimonials.map((t) => (
              <figure key={t.name} className={landing.review} style={{ '--card': 'var(--c0)' } as CSSProperties}>
                <div className={landing.reviewMark} aria-hidden="true">
                  “
                </div>
                <blockquote className={landing.reviewText}>{t.quote}</blockquote>
                <figcaption className={landing.reviewBy}>
                  <span className={landing.reviewAvatar}>
                    <Image src={family[t.name].avatar} alt="" fill sizes="48px" className={landing.coverImg} />
                  </span>
                  <span>
                    <span className={landing.reviewName}>{t.name}</span>
                    <span className={landing.reviewPlace}>{t.location}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>

          <p className={styles.swipeHint}>
            Swipe for more <span className={landing.arrowGlyph}>→</span>
          </p>
        </div>
      </section>

      {/* ━━━ FAQ ━━━ */}
      <section className={site.section}>
        <div className={`${landing.wrap} ${styles.faqLayout}`}>
          <div className={styles.faqHead}>
            <Label dot="var(--c1)">Common Questions</Label>

            <h2 className={landing.h2}>
              Questions about{' '}
              <Accent tone="blue">Memory Books.</Accent>
            </h2>
          </div>

          <ul className={styles.faqList}>
            <FAQ q="How is this different from a regular photo book?" a="Photo books display images. Memory Books preserve stories. Each page can combine photographs with written context, personal reflections, and the meaning behind a moment. Not just the image itself." />
            <FAQ q="Do I need design experience?" a="No. The visual editor is built so anyone can arrange pages naturally. Drag photos, add text, adjust layouts. The design stays clean without needing professional skills." />
            <FAQ q="How are Memory Books printed and delivered?" a="Memory Books are professionally printed as hardcover books and shipped directly to your door. Print quality is handled by a specialist fulfilment partner to ensure every book feels like a keepsake." />
            <FAQ q="Can I order multiple copies?" a="Yes. Once your book is designed, order as many copies as you need. For family members, as gifts, or to keep for different branches of your family." />
            <FAQ q="What makes this different from StoryWorth or other services?" a="Most services use a question and answer format to auto generate a book from responses. Ancestorii gives you full creative control. You decide the layout, the stories, the photos, and the structure. Your book looks exactly the way you want it to." />
            <FAQ q="Is a Memory Book a good gift?" a="It is one of the most personal gifts you can give. A printed collection of family stories, designed by someone who was there, for a birthday, anniversary, or simply because the stories deserve to exist on a shelf." />
          </ul>
        </div>
      </section>

      {/* ━━━ CTA ━━━ */}
      <section className={`${landing.ctaSection} ${site.ctaEnd}`}>
        <div className={`${landing.wrap} ${landing.ctaSlab} ${styles.ctaSlab}`}>
          <div className={landing.ctaGlowPink} aria-hidden="true" />
          <div className={landing.ctaGlowBlue} aria-hidden="true" />
          <div className={landing.ctaCopy}>
            <p className={`${landing.ctaTitle} ${styles.ctaTitle}`}>
              Your stories deserve more than{' '}a phone screen.
            </p>
            <p className={landing.ctaLead}>Turn them into something your family can hold.</p>
            <div className={landing.ctaButtons}>
              <Link href="/signup" prefetch className={`${landing.btnPrimary} ${landing.btnLight} ${styles.ctaButton}`}>
                Start Designing Your Book
                <span className={landing.arrowTile} aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
            <p className={`${site.ctaNote} ${styles.ctaNote}`}>No credit card required · Takes 2 minutes</p>
          </div>
        </div>
      </section>
    </>
  );
}
