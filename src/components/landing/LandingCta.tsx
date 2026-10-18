import Link from 'next/link';
import StoreBadges from '@/components/StoreBadges';
import StoryCta from './StoryCta';
import styles from './landing.module.css';

// The page's one dark block. Plain about money: free to start (no card), Premium £3.99 a month
// per family, as on /pricing.
export default function LandingCta() {
  return (
    <section id="get-started" className={styles.ctaSection}>
      <div className={`${styles.wrap} ${styles.ctaSlab}`}>
        <div className={styles.ctaGlowPink} aria-hidden="true" />
        <div className={styles.ctaGlowBlue} aria-hidden="true" />
        <div className={styles.ctaCopy}>
          <h2 className={styles.ctaTitle}>Share a memory that lives on.</h2>
          <p className={styles.ctaLead}>
            Free to start, no card needed, with unlimited albums, timelines and capsules. Premium is
            £3.99 a month for the whole family, not per person: 100GB of shared space,{' '}
            <span style={{ whiteSpace: 'nowrap' }}>15-minute</span> videos, unlimited loved ones and
            10% off every print.
          </p>
          <div className={styles.ctaButtons}>
            <StoryCta className={styles.btnLight} signedOut="Start For Free">
              Share Your Story
            </StoryCta>
            <Link href="/pricing" className={`${styles.btnOutline} ${styles.btnOutlineDark}`}>
              See pricing
            </Link>
          </div>
          <StoreBadges theme="dark" className={styles.ctaBadges} />
        </div>
      </div>
    </section>
  );
}
