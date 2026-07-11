import Link from 'next/link';
import type { Metadata } from 'next';
import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';

// /rewards — APP HANDOFF (Apple safe).
//
// This is the page the app's "Redeem at ancestorii.com" button points at. It is a direct
// target of an in app link, so by rule it shows NO prices and NO upgrade/buy button. Its
// job is to EXPLAIN how redemption works and offer a neutral login. The reward code itself
// is entered later, at keepsake checkout inside the Book / Canvas / Acrylic editors.
// It carries the normal public nav + footer so it reads as part of the site.
export const metadata: Metadata = {
  title: 'Redeem your app rewards | Ancestorii',
  description: 'Your family earns reward codes in the Ancestorii app. Here is how to redeem them on the website.',
  robots: { index: false, follow: false },
};

const SERIF = { fontFamily: "'Playfair Display', serif" } as const;
const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;
const px = 'px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%]';

// Plain numbered steps so a visitor understands redemption BEFORE logging in.
// Accurate to the real reward types: codes are entered at keepsake checkout and apply
// a discount or a free product on Memory Books, Canvas Prints and Acrylic Prints.
const STEPS = [
  'Your family earns reward codes in the Ancestorii app as your library grows.',
  'Log in here with the same email and password you use in the app.',
  'Start a keepsake order: a Memory Book, a Canvas Print, or an Acrylic Print.',
  'Enter your reward code at checkout to apply your discount or free product.',
];

export default function RewardsPage() {
  return (
    <main className="min-h-screen bg-[#FFFDF6] text-[#0F2040]">
      <PublicNav />

      <section style={{ background: '#FFFDF8', ...SANS }}>
        <div className={`${px} pt-16 sm:pt-20 md:pt-24 xl:pt-28 pb-16 md:pb-20 xl:pb-24`}>
          <div className="mx-auto w-full max-w-[600px] text-center">

            {/* Eyebrow */}
            <div className="flex items-center justify-center gap-2.5">
              <div className="h-px w-5 bg-[#B8932A]" />
              <span className="text-[11px] md:text-[12px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
                Rewards
              </span>
              <div className="h-px w-5 bg-[#B8932A]" />
            </div>

            {/* Heading (kept) */}
            <h1
              className="mt-5 text-[clamp(32px,6vw,52px)] leading-[1.03] tracking-[-0.03em] text-[#181512]"
              style={{ ...SERIF, fontWeight: 600 }}
            >
              Redeem your app rewards
            </h1>

            {/* Lead — plain, no prices */}
            <div className="mx-auto mt-6 max-w-[46ch] space-y-3 text-[15px] md:text-[17px] leading-[1.75] text-[#4A4030]">
              <p>Your family earns reward codes in the Ancestorii app as your library grows, and you redeem them here on the website.</p>
              <p>Rewards apply to your keepsake orders: Memory Books, Canvas Prints and Acrylic Prints.</p>
            </div>

            {/* Step-by-step, so people know what to do before they log in */}
            <div className="mx-auto mt-10 max-w-[520px] border border-[#ECE5D8] bg-[#FFFBF0] px-6 py-8 text-left sm:px-9 sm:py-10">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#B8932A]">
                How redemption works
              </h2>
              <ol className="mt-6 space-y-5">
                {STEPS.map((step, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#C8A557] text-[15px] text-[#181512]"
                      style={{ ...SERIF, fontWeight: 700 }}
                    >
                      {i + 1}
                    </span>
                    <p className="pt-[3px] text-[15px] leading-[1.65] text-[#3D3526] md:text-[16px]">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {/* One account, same login (kept) */}
            <p className="mt-9 text-[14px] leading-[1.7] text-[#8A7F72]">
              It is all one account. Log in with the same email and password you use in the app.
            </p>

            {/* Only action: neutral login. No price, no upgrade button. */}
            <Link
              href="/login"
              className="mt-5 inline-flex w-full max-w-[360px] items-center justify-center rounded-full bg-[#0F2040] px-6 py-4 text-[15px] font-semibold text-white transition hover:bg-[#152a52]"
            >
              Log in to redeem
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
