import type { CSSProperties } from 'react';
import styles from './landing.module.css';

// Three steps set as type: a big solid numeral in one of the brand colours, a title and a line.
// Step 3 names both sides: the private My Family space and the public Our Stories feed.
const STEPS = [
  {
    num: '1',
    title: 'Tell it your way',
    text: "Write it down, or just talk. Your words, exactly as you'd say them.",
    color: 'var(--c0)',
  },
  {
    num: '2',
    title: 'Add the photos',
    text: 'The pictures that go with it, off your phone and out of the shoebox.',
    color: 'var(--c1)',
  },
  {
    num: '3',
    title: 'Share it with family',
    text: 'Keep it private in My Family, just for the people you invite. Or share it with everyone on Our Stories.',
    color: 'var(--c3)',
  },
];

export default function LandingHowItWorks() {
  return (
    <section id="how" className={styles.section}>
      <div className={styles.wrap}>
        <div className={styles.head}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} style={{ '--dot': 'var(--c1)' } as CSSProperties} />
            How it works
          </div>
          <h2 className={`${styles.h2} ${styles.headTitle} ${styles.howTitle}`}>
            Two minutes to share something that matters.
          </h2>
          <p className={styles.headLead}>
            Real moments, told in your own words, shared with people who actually care.
          </p>
        </div>

        <ol className={styles.howSteps}>
          {STEPS.map(({ num, title, text, color }) => (
            <li key={num} className={styles.howStep} style={{ '--num': color } as CSSProperties}>
              <span className={styles.howNum} aria-hidden="true">
                {num}
              </span>
              <div>
                <h3 className={styles.howStepTitle}>{title}</h3>
                <p className={styles.howStepText}>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
