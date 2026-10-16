'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser'
import AuthShell from '@/components/site/AuthShell';
import AuthLoader from '@/components/site/auth/AuthLoader';
import auth from '@/components/site/auth.module.css';
import forms from '@/components/site/auth/authForms.module.css';

const supabase = getBrowserClient()


export default function AuthConfirmPage() {
  const router = useRouter();

useEffect(() => {
  const confirmEmail = async () => {
    const { data, error } =
      await supabase.auth.exchangeCodeForSession(window.location.href);

    if (data?.session) {
      router.replace('/dashboard/our-family');
    } else {
      router.replace('/login');
    }
  };

  confirmEmail();
}, [router]);


  return (
    <AuthShell>
      <h1 className={forms.statusTitle}>
        Confirming your email
      </h1>

      <p className={auth.intro}>
        We’re preparing your legacy space.
      </p>

      <AuthLoader />
    </AuthShell>
  );
}
