'use client';

import { useEffect } from 'react';
import { ui } from '@/components/dashboard/ui/AppBits';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export default function FinalizingPage() {
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = '/dashboard/home';
    }, 4000);

    return () => clearTimeout(t);
  }, []);

  return (
    <div className={ui.page}>
      <div className="grid min-h-[60vh] place-items-center">
        <div className={cx(ui.card, 'w-full max-w-[520px] px-6 py-10 text-center sm:px-10 sm:py-12')}>
          {/* The kit's loading dots: pink, blue, orange */}
          <div className={cx(ui.loaderDots, 'justify-center')} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <h1 className="mt-7 text-[clamp(26px,3vw,34px)] font-extrabold leading-[1.08] tracking-[-0.04em] [overflow-wrap:anywhere] [text-wrap:balance]">
            Finalising your access…
          </h1>
          <p className="mx-auto mt-3 max-w-[34em] text-[16px] font-medium leading-[1.6] [text-wrap:balance]">
            Your subscription is being activated. This usually takes a few seconds.
          </p>
          <p className="mt-2 text-[14px] font-semibold leading-[1.5] [text-wrap:balance]">
            If this doesn’t update, refresh in a moment.
          </p>
        </div>
      </div>
    </div>
  );
}
