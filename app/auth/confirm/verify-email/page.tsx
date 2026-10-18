import { Suspense } from 'react';
import AuthShell from '@/components/site/AuthShell';
import forms from '@/components/site/auth/authForms.module.css';
import VerifyEmailClient from './VerifyEmailClient';

export default function VerifyEmailPage() {
  return (
    <AuthShell>
      <Suspense fallback={<h1 className={forms.statusTitle}>Verifying email…</h1>}>
        <VerifyEmailClient />
      </Suspense>
    </AuthShell>
  );
}
