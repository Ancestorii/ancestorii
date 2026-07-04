import Link from 'next/link';
import type { Metadata } from 'next';

// /rewards — APP HANDOFF (Apple safe).
//
// This is the page the app's "Redeem at ancestorii.com" button points at. It is a direct
// target of an in app link, so by rule it shows NO prices and NO upgrade/buy button. Its
// only action is a neutral "Log in to redeem" that opens the web login. Plan status and any
// upgrade path live BEHIND that login (app/dashboard/plans), never here. There is also no
// App Store badge here: anyone arriving from the app already has the app.
export const metadata: Metadata = {
  title: 'Redeem your app rewards | Ancestorii',
  description: 'Your family earns rewards in the Ancestorii app. Redeem them here on the website.',
  robots: { index: false, follow: false },
};

const SERIF = { fontFamily: "'Playfair Display', serif" } as const;
const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;

export default function RewardsPage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center"
      style={{ background: '#FFFDF8', ...SANS }}
    >
      <div className="w-full max-w-[520px]">
        {/* Wordmark */}
        <Link
          href="/"
          className="text-[26px] tracking-[-0.03em] text-[#181512] no-underline"
          style={{ ...SERIF, fontWeight: 700 }}
        >
          Ancestor<span className="text-[#C8A557]">ii</span>
        </Link>

        {/* Eyebrow */}
        <div className="mt-10 flex items-center justify-center gap-2.5">
          <div className="h-px w-5 bg-[#B8932A]" />
          <span className="text-[11px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
            Rewards
          </span>
          <div className="h-px w-5 bg-[#B8932A]" />
        </div>

        <h1 className="mt-5 text-[clamp(30px,6vw,46px)] leading-[1.02] tracking-[-0.03em] text-[#181512]" style={SERIF}>
          Redeem your app rewards
        </h1>

        {/* How it works — plain, no prices */}
        <div className="mx-auto mt-6 max-w-[42ch] space-y-3 text-[15px] leading-[1.75] text-[#4A4030]">
          <p>Your family earns rewards in the Ancestorii app as your library grows.</p>
          <p>Redeem them here on the website.</p>
          <p>Rewards apply to your keepsake orders: Memory Books, Canvas Prints and Acrylic Prints.</p>
        </div>

        <p className="mt-6 text-[14px] leading-[1.7] text-[#8A7F72]">
          It is all one account. Log in with the same email and password you use in the app.
        </p>

        {/* Only action: neutral login. No price, no upgrade button. */}
        <Link
          href="/login"
          className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#0F2040] px-6 py-4 text-[15px] font-semibold text-white transition hover:bg-[#152a52]"
        >
          Log in to redeem
        </Link>
      </div>
    </main>
  );
}
