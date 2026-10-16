import site from '@/components/site/site.module.css';
import styles from './signup.module.css';

// Headline block for the sign-up flow, in the landing palette. Expects to sit inside
// AuthShell (or SiteShell), which provides the colour tokens and the typeface.
export default function StepIndicator() {
  return (
    <div className={styles.indicator}>
      {/* Headline */}
      <h2 className={styles.indicatorTitle}>
        Your story, <span className={site.accentPink}>still being written</span>
      </h2>

      {/* Sub-heading (intimate) */}
      <p className={styles.indicatorText}>A private place for the moments you don’t want to lose.</p>

      {/* Free reassurance */}
      <p className={styles.indicatorFree}>
        Start for free. <span className={site.accentBlue}>No payment details required.</span>
      </p>
    </div>
  );
}
