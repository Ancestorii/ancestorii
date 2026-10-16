import Image from 'next/image';
import type { CSSProperties } from 'react';
import styles from './landing.module.css';

// Real reviews from Ancestorii families (the same words and people as on the
// Memory Books page). Avatars are cropped from the photos they shared with us.
const REVIEWS = [
  {
    name: 'Alison',
    place: 'Nevada, United States',
    quote:
      'I walked past my dad’s room and caught him looking through his memory book again. That’s the third time this week. Ancestorii helped me turn years of photos into something he genuinely treasures.',
    avatar: '/landing/review-alison.jpg',
  },
  {
    name: 'Andrea',
    place: 'Dudley, United Kingdom',
    quote:
      'I recently lost my dad, so this book became incredibly special. It captured the essence of him and the life he lived. Our family will treasure it for years to come.',
    avatar: '/landing/review-andrea.jpg',
  },
  {
    name: 'Nicole',
    place: 'Nampa, United States',
    quote:
      'In my case, I have external hard drives full of photos I never get to see, but Ancestorii finally gave those memories a place where they can be easily enjoyed and shared.',
    avatar: '/landing/review-nicole.jpg',
  },
  {
    name: 'Erin',
    place: 'United Kingdom',
    quote:
      'Ancestorii feels less like cloud storage and more like a living family archive. Beautifully designed and genuinely meaningful.',
    avatar: '/landing/review-erin.jpg',
  },
];

const FEATURED_IN = ['Family Tree Magazine', 'The Family Histories Podcast'];

export default function LandingReviews() {
  return (
    <section className={styles.reviewsSection}>
      <div className={styles.wrap}>
        <div className={styles.sectionHead}>
          <h2 className={`${styles.h2} ${styles.reviewsTitle}`}>In their own words.</h2>
          <p className={styles.sectionLead}>
            Real families on what it meant to finally give their memories a home.
          </p>
        </div>

        <div className={styles.reviewsGrid}>
          {REVIEWS.map((review) => (
            <figure
              key={review.name}
              className={styles.review}
              style={{ '--card': 'var(--c0)' } as CSSProperties}
            >
              <div className={styles.reviewMark} aria-hidden="true">
                “
              </div>
              <blockquote className={styles.reviewText}>{review.quote}</blockquote>
              <figcaption className={styles.reviewBy}>
                <span className={styles.reviewAvatar}>
                  <Image src={review.avatar} alt="" fill sizes="48px" className={styles.coverImg} />
                </span>
                <span>
                  <span className={styles.reviewName}>{review.name}</span>
                  <span className={styles.reviewPlace}>{review.place}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className={styles.featuredIn}>
          <span className={styles.badge}>
            <span className={styles.badgeDot} style={{ '--dot': 'var(--c1)' } as CSSProperties} />
            As featured in
          </span>
          {FEATURED_IN.map((outlet) => (
            <span key={outlet} className={styles.featuredInName}>
              {outlet}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
