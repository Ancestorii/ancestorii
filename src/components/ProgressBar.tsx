'use client';

import { useEffect } from 'react';
import NProgress from 'nprogress';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const timeout = setTimeout(() => {
      NProgress.done();
    }, 200); // 👈 delay so you can SEE the bar

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  return null;
}