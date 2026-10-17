import type { CSSProperties } from 'react';
import styles from './landing.module.css';

// Straight under the hero: what it costs, who can see it and where it runs, then the press.
// Every line is true on /pricing (free plan, no card), for My Family (private to the people you
// invite) and in the footer's App Store and Google Play badges.
const FACTS = [
  { text: 'Free to start, no card needed', dot: 'var(--c0)' },
  { text: 'Private to the family you invite', dot: 'var(--c1)' },
  { text: 'On iPhone, Android and the web', dot: 'var(--c3)' },
];

const FEATURED_IN = ['Family Tree Magazine', 'The Family Histories Podcast'];

export default function LandingTrust() {
  return (
    <section className={styles.trust} aria-label="Why families choose Ancestorii">
      <div className={styles.wrap}>
        <ul className={styles.trustFacts}>
          {FACTS.map((fact) => (
            <li key={fact.text} style={{ '--dot': fact.dot } as CSSProperties}>
              {fact.text}
            </li>
          ))}
        </ul>
        <p className={styles.trustPress}>
          <span className={styles.trustLabel}>As featured in</span>
          {FEATURED_IN.map((outlet) => (
            <span key={outlet} className={styles.trustOutlet}>
              {outlet}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
