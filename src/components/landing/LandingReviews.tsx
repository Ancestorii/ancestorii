import Image from 'next/image';
import type { CSSProperties } from 'react';
import styles from './landing.module.css';

// Real reviews from Ancestorii families (the same words and people as on the Memory Books page),
// in the hero ring's rhythm: photo, photo, quote. Andrea and Alison are shown with the books they
// made; Erin has no photo, so hers is a quote card. Nicole's words sit with her photo in Memory Books.
// Testimonial2.png and testimonial4.png are ~650px wide, so these cards stay at most ~400px.
const PHOTO_REVIEWS = [
  {
    name: 'Andrea',
    place: 'Dudley, United Kingdom',
    chip: 'Andrea · Dudley, UK',
    quote:
      'I recently lost my dad, so this book became incredibly special. It captured the essence of him and the life he lived. Our family will treasure it for years to come.',
    src: '/testimonial4.png',
    alt: 'Andrea holding her printed Ancestorii Memory Book about her dad',
    position: '58% 50%',
    frame: 'var(--c0)',
  },
  {
    name: 'Alison',
    place: 'Nevada, United States',
    chip: 'Alison · Nevada, US',
    quote:
      'I walked past my dad’s room and caught him looking through his memory book again. That’s the third time this week. Ancestorii helped me turn years of photos into something he genuinely treasures.',
    src: '/Testimonial2.png',
    alt: 'Alison and her dad holding his printed Ancestorii Memory Book',
    position: '50% 30%',
    frame: 'var(--c1)',
  },
];

const QUOTE_REVIEW = {
  name: 'Erin',
  place: 'United Kingdom',
  quote:
    'Ancestorii feels less like cloud storage and more like a living family archive. Beautifully designed and genuinely meaningful.',
  avatar: '/landing/review-erin.jpg',
};

export default function LandingReviews() {
  return (
    <section className={styles.section}>
      <div className={styles.wrap}>
        <div className={styles.head}>
          <h2 className={`${styles.h2} ${styles.headTitle}`}>In their own words.</h2>
          <p className={styles.headLead}>
            Real families on what it meant to finally give their memories a home.
          </p>
        </div>

        <div className={styles.voices} tabIndex={0} role="region" aria-label="Reviews">
          {PHOTO_REVIEWS.map((review) => (
            <figure key={review.name} className={styles.voice} style={{ '--frame': review.frame } as CSSProperties}>
              <div className={styles.voiceFrame}>
                <div className={styles.voicePhoto}>
                  <Image
                    src={review.src}
                    alt={review.alt}
                    fill
                    sizes="(max-width: 699px) 84vw, 400px"
                    className={styles.coverImg}
                    style={{ objectPosition: review.position }}
                  />
                </div>
                <span className={styles.storyChip}>
                  <span className={styles.storyChipDot} />
                  {review.chip}
                </span>
              </div>
              <blockquote className={styles.voiceText}>{review.quote}</blockquote>
              <figcaption className={styles.voiceBy}>
                <strong>{review.name}</strong> · {review.place}
              </figcaption>
            </figure>
          ))}

          <figure className={`${styles.voice} ${styles.voiceQuote}`}>
            <div className={styles.voiceCard}>
              <span className={styles.voiceMark} aria-hidden="true">
                “
              </span>
              <blockquote className={styles.voiceCardText}>{QUOTE_REVIEW.quote}</blockquote>
              <figcaption className={styles.voiceCardBy}>
                <span className={styles.voiceAvatar}>
                  <Image src={QUOTE_REVIEW.avatar} alt="" fill sizes="44px" className={styles.coverImg} />
                </span>
                <span>
                  <strong>{QUOTE_REVIEW.name}</strong>
                  <span className={styles.voiceCardPlace}>{QUOTE_REVIEW.place}</span>
                </span>
              </figcaption>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
