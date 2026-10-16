import Link from 'next/link';
import type { ReactNode } from 'react';
import landing from '@/components/landing/landing.module.css';
import site from '@/components/site/site.module.css';
import topics from './topics.module.css';

/** The landing's dark closing slab, as it ends both topic pages. Put the accent in `topics.ctaAccent`. */
export default function TopicsCta({ title }: { title: ReactNode }) {
  return (
    <section className={`${landing.ctaSection} ${site.ctaEnd}`}>
      <div className={`${landing.wrap} ${landing.ctaSlab}`}>
        <div className={landing.ctaGlowPink} aria-hidden="true" />
        <div className={landing.ctaGlowBlue} aria-hidden="true" />
        <div className={landing.ctaCopy}>
          <p className={topics.ctaTitle}>{title}</p>
          <p className={landing.ctaLead}>Two minutes. Your words. A memory that stays.</p>
          <div className={landing.ctaButtons}>
            <Link href="/signup" prefetch className={`${landing.btnPrimary} ${landing.btnLight}`}>
              Start For Free
              <span className={landing.arrowTile} aria-hidden="true">
                →
              </span>
            </Link>
          </div>
          <p className={topics.ctaNote}>
            <span>Free forever ·</span> <span>No credit card ·</span> <span>Takes 2 minutes</span>
          </p>
        </div>
      </div>
    </section>
  );
}
