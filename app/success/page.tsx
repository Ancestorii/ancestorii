import Link from "next/link";
import StoreBadges from "@/components/StoreBadges";

// Public post-upgrade success page. A completed Premium checkout lands here
// (create-checkout success_url points to /success). Most people arrive from the
// mobile app: tapped Manage plan, logged into the website, upgraded.
//
// Design intent: a warm reception, not a brochure. ONE colour world for the whole
// page: pure white #FFFFFF surface, navy #0F2040 text, gold #B8932A / #A9782F
// accents. No alternating colour bands, no cards, no boxes. Sections flow on the
// same surface, separated only by hairline gold rules. The greeting is visible
// immediately on mobile, never pushed below an empty viewport.
//
// It shows NO price and NO buy or upgrade button, because whoever reaches it has
// already paid, so it stays a safe general page. StoreBadges uses theme="light"
// here: black Apple badge for full contrast on the white surface.

const SERIF = { fontFamily: "'Playfair Display', serif" } as const;

const WHITE = "#FFFFFF";
const NAVY = "#0F2040";
const GOLD = "#B8932A";
const GOLD_DEEP = "#A9782F";
const RULE = "rgba(184, 147, 42, 0.35)";

const FEATURES = [
  "100GB storage for your whole family",
  "Longer videos, up to 15 minutes",
  "10GB max file size",
  "Unlimited albums, timelines and family profiles",
  "10% off every keepsake order",
  "Priority support",
  "Early access to new features",
];

export default function SuccessPage() {
  return (
    <main
      className="min-h-screen"
      style={{ background: WHITE, fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="mx-auto w-full max-w-[880px] px-6 sm:px-8">

        {/* ── The greeting · centred, on screen immediately ── */}
        <section className="flex min-h-[72svh] flex-col items-center justify-center py-20 text-center md:min-h-[76svh]">
          <div className="flex items-center gap-3">
            <span className="h-px w-8" style={{ background: GOLD }} />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.26em] md:text-[12px]"
              style={{ color: GOLD }}
            >
              Premium confirmed
            </span>
            <span className="h-px w-8" style={{ background: GOLD }} />
          </div>

          <h1
            className="mt-7 max-w-[14ch] text-[clamp(40px,8vw,92px)] leading-[1.02] tracking-[-0.02em]"
            style={{ ...SERIF, fontWeight: 600, color: NAVY }}
          >
            Welcome to the{" "}
            <span className="italic" style={{ color: GOLD_DEEP }}>
              Premium
            </span>{" "}
            family.
          </h1>

          <p
            className="mt-7 max-w-[40ch] text-[clamp(16px,2vw,20px)] leading-[1.65]"
            style={{ color: NAVY }}
          >
            Your whole family is now on Premium. One payment covers everyone.
          </p>

          <p className="mt-4 text-[14px] md:text-[15px]" style={{ color: GOLD }}>
            We have emailed your confirmation to your inbox.
          </p>
        </section>

        {/* ── What your family now has · same surface, gold ruled list ── */}
        <section className="pb-20 md:pb-24">
          <p
            className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.26em]"
            style={{ color: GOLD }}
          >
            Everything your family now has
          </p>

          <div className="grid md:grid-cols-2 md:gap-x-14">
            {FEATURES.map((f, i) => (
              <div
                key={f}
                className={`flex items-center gap-4 py-4 md:py-5 ${
                  i === 0 ? "md:col-span-2 justify-center" : ""
                }`}
                style={{ borderTop: `1px solid ${RULE}` }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={GOLD}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span
                  className={
                    i === 0
                      ? "text-[clamp(17px,2.2vw,22px)] font-semibold"
                      : "text-[15px] md:text-[17px]"
                  }
                  style={{ color: NAVY }}
                >
                  {f}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── The way back · two doors, one room ── */}
        <section
          className="grid gap-12 py-16 text-center md:grid-cols-2 md:gap-8 md:py-20"
          style={{ borderTop: `1px solid ${RULE}` }}
        >
          <div className="flex flex-col items-center">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.26em]"
              style={{ color: GOLD }}
            >
              On the website
            </p>
            <p className="mt-4 max-w-[34ch] text-[15px] leading-[1.7]" style={{ color: NAVY }}>
              Pick up right where you left off in your dashboard.
            </p>
            <Link
              href="/dashboard/home"
              className="mt-7 inline-flex items-center justify-center rounded-full px-10 py-4 text-[15px] font-semibold transition hover:opacity-90"
              style={{ background: NAVY, color: WHITE }}
            >
              Back to the website
            </Link>
          </div>

          <div className="flex flex-col items-center">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.26em]"
              style={{ color: GOLD }}
            >
              In the app
            </p>
            <p className="mt-4 max-w-[36ch] text-[15px] leading-[1.7]" style={{ color: NAVY }}>
              Head back to the Ancestorii app to see your Premium plan. If it still shows Free,
              close the app fully and reopen it.
            </p>
            {/* White surface, so theme="light": black Apple badge for full contrast. */}
            <StoreBadges theme="light" className="mt-7 justify-center" />
          </div>
        </section>

        {/* ── Priority support · the sign off ── */}
        <section
          className="py-14 text-center md:py-16"
          style={{ borderTop: `1px solid ${RULE}` }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.26em]"
            style={{ color: GOLD }}
          >
            Priority support
          </p>
          <p
            className="mx-auto mt-5 max-w-[52ch] text-[15px] leading-[1.8] md:text-[16px]"
            style={{ color: NAVY }}
          >
            You are on Premium, so you get priority support. Email{" "}
            <a
              href="mailto:support@ancestorii.com"
              className="font-semibold underline underline-offset-4 transition hover:opacity-80"
              style={{ color: GOLD_DEEP }}
            >
              support@ancestorii.com
            </a>{" "}
            or call{" "}
            <a
              href="tel:03301332268"
              className="font-semibold underline underline-offset-4 transition hover:opacity-80"
              style={{ color: GOLD_DEEP }}
            >
              0330 133 2268
            </a>
            , 9am to 6pm Monday to Saturday.
          </p>
        </section>

      </div>
    </main>
  );
}
