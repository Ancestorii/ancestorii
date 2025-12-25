import { Suspense } from 'react';
import VerifyEmailClient from './VerifyEmailClient';

export const dynamic = 'force-dynamic';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p className="text-center">Verifying email…</p>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
