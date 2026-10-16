import styles from './authForms.module.css';

/** The logo's four squares pulsing in turn, for account screens that are waiting on something. */
export default function AuthLoader() {
  return (
    <span className={styles.loader} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}
