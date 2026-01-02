'use client';

import { useEffect } from 'react';

export default function FinalizingPage() {
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = '/dashboard/home';
    }, 4000);

    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-[#0F2040]">
          Finalising your access…
        </h1>
        <p className="mt-3 text-[#2a3550]">
          Your subscription is being activated. This usually takes a few seconds.
        </p>
        <p className="mt-2 text-sm text-[#6b7280]">
          If this doesn’t update, refresh in a moment.
        </p>
      </div>
    </div>
  );
}
