import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { APPSTORE_URL, PLAYSTORE_URL } from '@/lib/store-links';

// ─────────────────────────────────────────────────────────────────────────────
// /m/[code] — MEMORY SHARE STORE REDIRECT (twin of /q/[code]).
//
// This route's single job is to bounce a visitor to the right app store. It NEVER
// renders the memory on the web — private family memories are viewed only in the app,
// under the recipient's own session + RLS.
//
// If the app IS installed, the OS intercepts https://ancestorii.com/m/CODE via the
// Universal Link / App Link verification files (/.well-known/apple-app-site-association
// and /.well-known/assetlinks.json) BEFORE the request reaches this server, opening the
// app directly. So this route only runs for people WITHOUT the app — exactly the people
// who need the store — and for link scrapers fetching the OG preview below.
//
// The OG preview comes from the anon get_memory_share RPC: title / author / family only,
// never a join token or media. Brute-forcing the code reveals at most that preview.
//
// Store links live in ONE place: src/lib/store-links.ts (@/lib/store-links). Fill the
// App Store id there at launch — this page and /q/[code] both import it.
// ─────────────────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic';

type SharePreview = { memory_id: string; title: string; author_name: string; family_name: string };

// Anon preview lookup via PostgREST RPC. Returns null on any failure so the page (and its
// store redirect) keep working even if the preview can't be fetched.
async function fetchPreview(code: string): Promise<SharePreview | null> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    const res = await fetch(`${url}/rest/v1/rpc/get_memory_share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ p_code: code }),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || typeof data !== 'object') return null;
    return data as SharePreview;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const preview = await fetchPreview(code);
  const title = preview
    ? `${preview.author_name} shared “${preview.title}”`
    : 'A memory was shared with you';
  const description = preview
    ? `Open “${preview.title}” from ${preview.family_name} in the Ancestorii app.`
    : 'Open this memory in the Ancestorii app.';
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary', title, description },
    robots: { index: false, follow: false },
  };
}

export default async function MemoryShareRedirect({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const ua = (await headers()).get('user-agent') ?? '';

  const isIOS = /iPad|iPhone|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  // Mobile without the app → straight to the store. Re-tapping the link after install
  // opens the app directly to the memory (Universal Link / App Link).
  if (isIOS) redirect(APPSTORE_URL);
  if (isAndroid) redirect(PLAYSTORE_URL);

  // Desktop / everything else → a store-oriented choice with the preview. Never the memory.
  const preview = await fetchPreview(code);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0F2040] px-6 py-16 text-center">
      <div className="w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
          Ancestorii
        </p>
        <h1 className="mt-4 font-serif text-3xl leading-tight text-[#f5f1e6]">
          {preview ? `${preview.author_name} shared a memory` : 'A memory was shared with you'}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#f5f1e6]/80">
          {preview
            ? `“${preview.title}” from ${preview.family_name}. Memories open in the Ancestorii app — install it on your phone, then your code opens it.`
            : 'Memories open in the Ancestorii app. Install it on your phone, then enter your code to open it.'}
        </p>

        <div className="mt-8 rounded-2xl bg-[#f5f1e6]/10 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
            Your code
          </p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-widest text-[#f5f1e6]">
            {code}
          </p>
          <p className="mt-2 text-xs text-[#f5f1e6]/60">Open it on your phone in the app</p>
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
