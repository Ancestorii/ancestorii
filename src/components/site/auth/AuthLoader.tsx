import styles from './authForms.module.css';

/** The logo's two i's with their dots hopping in turn, for account screens that are waiting on something. */
export default function AuthLoader() {
  return (
    <svg className={styles.loader} viewBox="0 0 19 30" aria-hidden="true" focusable="false">
      <circle className={styles.loaderDot} cx="4" cy="4" r="4" fill="#FF2D87" />
      <rect y="10" width="8" height="20" rx="4" fill="#0A0A0F" />
      <circle className={styles.loaderDot} cx="15" cy="11" r="4" fill="#2B4BFF" />
      <rect x="11" y="17" width="8" height="13" rx="4" fill="#0A0A0F" />
    </svg>
  );
}
