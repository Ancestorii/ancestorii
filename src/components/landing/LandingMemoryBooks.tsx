import Image from 'next/image';
import type { CSSProperties } from 'react';
import { ArrowLink } from './LandingBits';
import styles from './landing.module.css';

// The facts and price are the ones on /pricing and in the Memory Books FAQ.
const FACTS = [
  { text: 'Hardcover, and you design every page', dot: 'var(--c0)' },
  { text: 'Your stories, photos and words, in your layout', dot: 'var(--c1)' },
  { text: 'Delivered to your door, from £44.99', dot: 'var(--c3)' },
];

// One real family with their printed book, large, in the hero ring's photo frame,
// with Nicole's own words underneath. Phones read: heading, photo, then the facts.
export default function LandingMemoryBooks() {
  return (
    <section id="books" className={styles.section}>
      <div className={`${styles.wrap} ${styles.booksWrap}`}>
        <div className={styles.booksIntro}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Memory Books
          </div>
          <h2 className={`${styles.h2} ${styles.headTitle} ${styles.booksTitle}`}>
            Turn the stories into a book they can hold.
          </h2>
          <p className={styles.headLead}>
            Your family&apos;s stories and photos, together in print. Something for the shelf, long
            after the phones have changed.
          </p>
        </div>

        <figure className={styles.booksFigure}>
          <div className={styles.booksFrame} style={{ '--frame': 'var(--c3)' } as CSSProperties}>
            <div className={styles.booksPhoto}>
              <Image
                src="/testimonial1.png"
                alt="Looking through a printed Ancestorii Memory Book together"
                fill
                sizes="(max-width: 899px) 100vw, 720px"
                className={styles.coverImg}
                style={{ objectPosition: '50% 62%' }}
              />
            </div>
            <span className={styles.storyChip}>
              <span className={styles.storyChipDot} />
              Nicole · Nampa, US
            </span>
          </div>
          <figcaption className={styles.booksQuote}>
            <span className={styles.booksQuoteMark} aria-hidden="true">
              “
            </span>
            <span>
              In my case, I have external hard drives full of photos I never get to see, but Ancestorii
              finally gave those memories a place where they can be easily enjoyed and shared.
            </span>
            <span className={styles.booksQuoteBy}>Nicole, Nampa, United States</span>
          </figcaption>
        </figure>

        <div className={styles.booksBuy}>
          <ul className={styles.factList}>
            {FACTS.map((fact) => (
              <li key={fact.text} style={{ '--dot': fact.dot } as CSSProperties}>
                {fact.text}
              </li>
            ))}
          </ul>
          <ArrowLink href="/memory-books" className={styles.booksCta}>
            Explore Memory Books
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}
