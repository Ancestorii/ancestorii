'use client';

import dynamic from 'next/dynamic';
import styles from './signup.module.css';

const SignupForm = dynamic(() => import('./SignupForm'), {
  ssr: false,
  loading: () => (
    <div className={styles.placeholder} aria-hidden="true" />
  ),
});

export default function SignupFormClient() {
  return <SignupForm />;
}
