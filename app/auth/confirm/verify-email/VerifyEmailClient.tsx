'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthLoader from '@/components/site/auth/AuthLoader';
import forms from '@/components/site/auth/authForms.module.css';

export default function VerifyEmailClient() {
  const params = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState('Verifying your email…');

  useEffect(() => {
    if (!token) {
      setStatus('Invalid verification link');
      return;
    }

    (async () => {
      try {
        // Checked and marked used server-side (service role): the table is not open to the browser.
        const res = await fetch('/api/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          setStatus('Your email has been verified successfully.');
        } else if (res.status >= 500) {
          setStatus('We could not verify your email just now. Please try the link again in a moment.');
        } else {
          setStatus('This link is invalid or expired.');
        }
      } catch {
        setStatus('We could not verify your email just now. Please try the link again in a moment.');
      }
    })();
  }, [token]);

  // The loader shows only while the link is being checked.
  const checking = status === 'Verifying your email…';

  return (
    <div aria-live="polite">
      <h1 className={forms.statusTitle}>{status}</h1>
      {checking && <AuthLoader />}
    </div>
  );
}
