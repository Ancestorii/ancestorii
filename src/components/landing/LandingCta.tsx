import Link from 'next/link';
import { ArrowLink } from './LandingBits';
import styles from './landing.module.css';

export default function LandingCta({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section id="get-started" className={styles.ctaSection}>
      <div className={`${styles.wrap} ${styles.ctaSlab}`}>
        <div className={styles.ctaGlowPink} aria-hidden="true" />
        <div className={styles.ctaGlowBlue} aria-hidden="true" />
        <div className={styles.ctaCopy}>
          <h2 className={styles.ctaTitle}>Share a memory that lives on.</h2>
          <p className={styles.ctaLead}>
            It takes two minutes to preserve something that matters forever. Completely free, no
            credit card, no catch.
          </p>
          <div className={styles.ctaButtons}>
            {isLoggedIn ? (
              <ArrowLink href="/stories/create" className={styles.btnLight}>
                Share Your Story
              </ArrowLink>
            ) : (
              <ArrowLink href="/signup" className={styles.btnLight}>
                Start For Free
              </ArrowLink>
            )}
            <Link href="/pricing" className={`${styles.btnOutline} ${styles.btnOutlineDark}`}>
              See pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
