import Image from 'next/image';
import type { CSSProperties } from 'react';
import { ArrowLink } from './LandingBits';
import styles from './landing.module.css';

// Real customers with their printed Memory Books (photos they shared with us),
// fanned in 3D like the books in the design. Back cards first, front card last.
const PHOTOS = [
  {
    src: '/testimonial1.png',
    alt: 'Looking through a printed Ancestorii Memory Book together',
    label: 'Nicole · Nampa, US',
    color: 'var(--c3)',
    position: '50% 62%',
    tf: 'translate3d(170px, -10px, -160px) rotateY(-34deg) rotateZ(4deg)',
  },
  {
    src: '/Testimonial2.png',
    alt: 'Alison and her dad holding his printed Ancestorii Memory Book',
    label: 'Alison · Nevada, US',
    color: 'var(--c1)',
    position: '50% 50%',
    tf: 'translate3d(-170px, 10px, -120px) rotateY(30deg) rotateZ(-5deg)',
  },
  {
    src: '/testimonial4.png',
    alt: 'Andrea holding her printed Ancestorii Memory Book about her dad',
    label: 'Andrea · Dudley, UK',
    color: 'var(--c0)',
    position: '58% 50%',
    tf: 'translate3d(0, 0, 40px) rotateY(-14deg)',
  },
];

export default function LandingMemoryBooks() {
  return (
    <section id="books" className={styles.booksSection}>
      <div className={`${styles.wrap} ${styles.booksWrap}`}>
        <div className={styles.booksCopy}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Memory Books
          </div>
          <h2 className={`${styles.h2} ${styles.booksTitle}`}>
            Turn the stories into a book they can hold.
          </h2>
          <p className={styles.booksLead}>
            Your family&apos;s stories and photos, together in print. Something for the shelf, long
            after the phones have changed.
          </p>
          <ArrowLink href="/memory-books" className={styles.booksCta}>
            Explore Memory Books
          </ArrowLink>
        </div>

        <div className={styles.booksStage}>
          <div className={styles.booksPivot}>
            {PHOTOS.map((photo) => (
              <figure
                key={photo.src}
                className={styles.bookPhoto}
                style={{ '--card': photo.color, '--tf': photo.tf } as CSSProperties}
              >
                <div className={styles.bookPhotoInner}>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="280px"
                    className={styles.coverImg}
                    style={{ objectPosition: photo.position }}
                  />
                  <figcaption className={styles.chipRow}>
                    <span className={styles.chip}>
                      <span className={styles.chipDot} />
                      <span className={styles.chipText}>{photo.label}</span>
                    </span>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
