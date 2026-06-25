import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { APPSTORE_URL, PLAYSTORE_URL } from '@/lib/store-links';

// ─────────────────────────────────────────────────────────────────────────────
// /q/[code] — STORE REDIRECT ONLY.
//
// This route's single job is to bounce a visitor to the right app store. It NEVER
// renders a web answering interface — answering happens exclusively in the app.
//
// If the app IS installed, the OS intercepts https://ancestorii.com/q/CODE via the
// Universal Link / App Link verification files (/.well-known/apple-app-site-association
// and /.well-known/assetlinks.json) BEFORE the request reaches this server, opening the
// app directly. So this route only ever runs for people WITHOUT the app — exactly the
// people who need the store.
//
// Store links live in ONE place: src/lib/store-links.ts (@/lib/store-links). Fill the
// App Store id there at launch — this page and /m/[code] both import it.
// ─────────────────────────────────────────────────────────────────────────────

// Device detection runs per request; never cache the redirect.
export const dynamic = 'force-dynamic';

export default async function QStoreRedirect({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const ua = (await headers()).get('user-agent') ?? '';

  const isIOS = /iPad|iPhone|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  // Mobile without the app → straight to the store.
  if (isIOS) redirect(APPSTORE_URL);
  if (isAndroid) redirect(PLAYSTORE_URL);

  // Desktop / everything else → a store-oriented choice. Still never an answer flow:
  // Ancestorii is answered in the app, so we point them at the stores and show the code
  // to enter once installed.
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0F2040] px-6 py-16 text-center">
      <div className="w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
          Ancestorii
        </p>
        <h1 className="mt-4 font-serif text-3xl leading-tight text-[#f5f1e6]">
          You have a question to answer
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#f5f1e6]/80">
          Ancestorii is answered in the app. Install it on your phone, then enter your code to
          find this question.
        </p>

        <div className="mt-8 rounded-2xl bg-[#f5f1e6]/10 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
            Your code
          </p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-widest text-[#f5f1e6]">
            {code}
          </p>
          <p className="mt-2 text-xs text-[#f5f1e6]/60">Valid for 7 days</p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href={APPSTORE_URL}
            className="rounded-full bg-[#D4AF37] px-6 py-3.5 text-base font-semibold text-[#0F2040] transition hover:bg-[#c8a557]"
          >
            Download on the App Store
          </a>
          <a
            href={PLAYSTORE_URL}
            className="rounded-full border border-[#D4AF37] px-6 py-3.5 text-base font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37]/10"
          >
            Get it on Google Play
          </a>
        </div>
      </div>
    </main>
  );
}
