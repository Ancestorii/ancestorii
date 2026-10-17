import Image from 'next/image';
import type { CSSProperties } from 'react';
import landing from '../landing.module.css';
import s from './reviews.module.css';

// The site's only real customer reviews, word for word, each photographed with the Memory Book
// they made. Erin is removed at the owner's request, and there are no avatars: the
// public/landing/review-*.jpg files are crops of these same photos. Each photo appears only here
// on the page. Nicole's words are about her photo archive, so no book claim is put in her mouth,
// and her alt doesn't name the man (his relationship to her is unknown). `position` crops the
// square photo; `phonePosition` the shorter 4:3 photo on phones (the live page's crops), keeping
// faces in the frame.
const REVIEWS = [
  {
    name: 'Andrea',
    place: 'Dudley, United Kingdom',
    chip: 'Andrea\u00a0· Dudley, UK',
    quote:
      'I recently lost my dad, so this book became incredibly special. It captured the essence of him and the life he lived. Our family will treasure it for years to come.',
    src: '/testimonial4.png',
    alt: 'Andrea holding her printed Ancestorii Memory Book about her dad',
    position: '58% 50%',
    phonePosition: '58% 5%',
    frame: 'var(--c2)',
  },
  {
    name: 'Alison',
    place: 'Nevada, United States',
    chip: 'Alison\u00a0· Nevada, US',
    quote:
      'I walked past my dad’s room and caught him looking through his memory book again. That’s the third time this week. Ancestorii helped me turn years of photos into something he genuinely treasures.',
    src: '/Testimonial2.png',
    alt: 'Alison and her dad holding his printed Ancestorii Memory Book',
    // High in the frame: keeps the dad's cap and the open book with the 1949 draft card.
    position: '50% 22%',
    phonePosition: '50% 15%',
    frame: 'var(--c0)',
  },
  {
    name: 'Nicole',
    place: 'Nampa, United States',
    chip: 'Nicole\u00a0· Nampa, US',
    quote:
      'In my case, I have external hard drives full of photos I never get to see, but Ancestorii finally gave those memories a place where they can be easily enjoyed and shared.',
    src: '/testimonial1.png',
    alt: 'Looking through a printed Ancestorii Memory Book together',
    position: '50% 50%',
    phonePosition: '50% 62%',
    frame: 'var(--c1)',
  },
];

// Phones: the full width less the 7px frame, 4:3. From 600px, square: 34% of a tablet row, then a
// third of the desktop row (each slot rounded up, never under the rendered width).
const SIZES =
  '(max-width: 599px) calc(100vw - 62px), (max-width: 1023px) calc(34vw - 41px), (max-width: 1287px) calc(33.4vw - 48px), 382px';

export default function Reviews() {
  return (
    <section id="reviews" className={landing.section}>
      <div className={landing.wrap}>
        <div className={landing.head}>
          <h2 className={landing.h2}>In their own words.</h2>
          <p className={landing.headLead}>
            Real families on what it meant to finally give their memories a home.
          </p>
        </div>

        <div className={s.list}>
          {REVIEWS.map((review) => (
            <figure
              key={review.name}
              className={s.review}
              style={
                {
                  '--frame': review.frame,
                  '--pos': review.position,
                  '--pos-phone': review.phonePosition,
                } as CSSProperties
              }
            >
              <div className={s.frame}>
                <div className={s.photo}>
                  <Image
                    src={review.src}
                    alt={review.alt}
                    fill
                    sizes={SIZES}
                    // Loaded up front at low priority, so a fast flick never reaches an empty frame.
                    loading="eager"
                    fetchPriority="low"
                    className={landing.coverImg}
                  />
                </div>
                {/* Repeats the caption below, so screen readers skip it. */}
                <span className={`${landing.storyChip} ${s.chip}`} aria-hidden="true">
                  <span className={landing.storyChipDot} />
                  {review.chip}
                </span>
              </div>
              <blockquote className={s.quote}>{review.quote}</blockquote>
              <figcaption className={s.by}>
                <strong>{review.name}</strong>
                <span className={s.place}>{review.place}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
