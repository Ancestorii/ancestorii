import type { CSSProperties } from 'react';
import { Images, Mic, Users } from 'lucide-react';
import styles from './landing.module.css';

// Three steps, each on a solid colour panel. No mock screens: just the step's symbol.
const STEPS = [
  {
    num: '01',
    title: 'Tell it your way',
    text: "Write it down, or just talk. Your words, exactly as you'd say them.",
    Icon: Mic,
    panel: 'var(--c0)',
    tilt: '-4deg',
  },
  {
    num: '02',
    title: 'Add the photos',
    text: 'The pictures that go with it, off your phone and out of the shoebox.',
    Icon: Images,
    panel: 'var(--c1)',
    tilt: '3deg',
  },
  {
    num: '03',
    title: 'Share it with family',
    text: 'The people who were there, and the ones who will want to know one day.',
    Icon: Users,
    panel: 'var(--c3)',
    tilt: '-3deg',
  },
];

export default function LandingHowItWorks() {
  return (
    <section id="how" className={styles.howSection}>
      <div className={styles.wrap}>
        <div className={styles.sectionHead}>
          <h2 className={`${styles.h2} ${styles.howTitle}`}>
            Two minutes to share something that matters.
          </h2>
          <p className={styles.sectionLead}>
            Real moments, told in your own words, shared with people who actually care.
          </p>
        </div>

        <div className={styles.steps}>
          {STEPS.map(({ num, title, text, Icon, panel, tilt }) => (
            <article
              key={num}
              className={styles.step}
              style={{ '--panel': panel, '--tilt': tilt } as CSSProperties}
            >
              <div className={styles.stepPanel}>
                <div className={styles.stepTile}>
                  <Icon size={56} strokeWidth={2.5} aria-hidden="true" />
                </div>
              </div>
              <div className={styles.stepBody}>
                <div className={styles.stepNum}>{num}</div>
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className={styles.stepText}>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
