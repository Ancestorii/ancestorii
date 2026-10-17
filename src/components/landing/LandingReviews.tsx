import Image from 'next/image';
import type { CSSProperties } from 'react';
import styles from './landing.module.css';

// Real reviews from Ancestorii families (the same words and people as on the Memory Books page):
// three real families, each shown with the book they made.
// Testimonial2.png and testimonial4.png are ~650px wide, so these cards stay at most ~400px.
// `position` crops the square photo; `phonePosition` crops the shorter 4:3 photo on phones,
// keeping faces in the frame and clear of the chip.
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
    phonePosition: '58% 5%',
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
    phonePosition: '50% 15%',
    frame: 'var(--c1)',
  },
  {
    name: 'Nicole',
    place: 'Nampa, United States',
    chip: 'Nicole · Nampa, US',
    quote:
      'In my case, I have external hard drives full of photos I never get to see, but Ancestorii finally gave those memories a place where they can be easily enjoyed and shared.',
    src: '/testimonial1.png',
    alt: 'Looking through a printed Ancestorii Memory Book together',
    position: '50% 62%',
    phonePosition: '50% 62%',
    frame: 'var(--c3)',
  },
];

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

        <div className={styles.voices}>
          {PHOTO_REVIEWS.map((review) => (
            <figure
              key={review.name}
              className={styles.voice}
              style={
                {
                  '--frame': review.frame,
                  '--pos': review.position,
                  '--pos-phone': review.phonePosition,
                } as CSSProperties
              }
            >
              <div className={styles.voiceFrame}>
                <div className={styles.voicePhoto}>
                  <Image
                    src={review.src}
                    alt={review.alt}
                    fill
                    sizes="(max-width: 447px) calc(100vw - 64px), (max-width: 599px) 384px, (max-width: 899px) calc((100vw - 128px) / 3), (max-width: 1287px) calc((100vw - 144px) / 3), 382px"
                    // Loaded up front at low priority, so a fast flick never reaches an empty frame.
                    loading="eager"
                    fetchPriority="low"
                    className={styles.coverImg}
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
        </div>
      </div>
    </section>
  );
}
