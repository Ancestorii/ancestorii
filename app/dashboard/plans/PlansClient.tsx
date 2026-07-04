'use client';

type PlanName = 'Free' | 'Premium';
type Currency = 'GBP' | 'USD' | 'EUR';

type Plan = {
  id: string;
  name: PlanName;
  max_storage: number;
};

type SubscriptionRow = {
  user_id: string;
  plan_id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
};

type UsageRow = {
  used_bytes: number;
};

const SERIF = { fontFamily: "'Playfair Display', serif" } as const;
const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;

export default function PlansClient({
  loading,
  currency,
  setCurrency,
  currentPlan,
  subscription,
  usage,
  usageLoading,
  freePlanStorage,
  showPlanChangeInfo,
  setShowPlanChangeInfo,
  formatBytes,
  formatDate,
  handleUpgrade,
  price,
}: {
  loading: boolean;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  currentPlan: Plan | null;
  subscription: SubscriptionRow | null;
  usage: UsageRow | null;
  usageLoading: boolean;
  freePlanStorage: number;
  showPlanChangeInfo: boolean;
  setShowPlanChangeInfo: (value: boolean) => void;
  formatBytes: (bytes?: number | null) => string;
  formatDate: (iso: string | null | undefined) => string;
  handleUpgrade: (planName: PlanName) => void;
  price: Record<Currency, string>;
}) {
  const isPremium = currentPlan?.name === 'Premium';
  const usedBytes = usage?.used_bytes ?? 0;
  const maxBytes = currentPlan?.max_storage ?? freePlanStorage;
  const pct = maxBytes > 0 ? Math.min(100, (usedBytes / maxBytes) * 100) : 0;
  const lowOnSpace = !isPremium && pct >= 80;

  return (
    <div className="min-h-full" style={{ background: '#FFFDF8', ...SANS }}>
      <div className="mx-auto w-full max-w-[860px] px-6 sm:px-8 pt-12 md:pt-16 pb-20 md:pb-28">

        {/* ── Heading ── */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-px w-5 bg-[#B8932A]" />
          <span className="text-[11px] md:text-[12px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
            Your account
          </span>
        </div>

        <h1 className="text-[clamp(34px,6vw,58px)] leading-[0.98] tracking-[-0.03em] text-[#181512]" style={SERIF}>
          Your plan
        </h1>

        <p className="mt-4 max-w-[54ch] text-[14px] md:text-[15px] leading-[1.7] text-[#4A4030]">
          One account across the app and the website. Every plan is per family, not per person, so one payment covers your whole family.
        </p>

        {loading ? (
          <LoadingCard />
        ) : (
          <>
            {/* ── Current plan + storage ── */}
            <section className="mt-8 md:mt-10 rounded-2xl border border-[#ECE5D8] bg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
                    Current plan
                  </p>
                  <p className="mt-2 text-[22px] md:text-[26px] tracking-[-0.02em] text-[#181512]" style={SERIF}>
                    {isPremium ? "You’re on Premium" : "You’re on Free"}
                  </p>
                  {isPremium && subscription?.current_period_end && (
                    <p className="mt-1 text-[13px] text-[#8A7F72]">
                      Renews on {formatDate(subscription.current_period_end)}
                    </p>
                  )}
                </div>
                <span
                  className="inline-flex items-center rounded-full px-4 py-1.5 text-[12px] font-semibold"
                  style={
                    isPremium
                      ? { background: '#C8A557', color: '#181512' }
                      : { background: '#F5EEDD', color: '#8F7A2A' }
                  }
                >
                  {isPremium ? 'Premium' : 'Free'}
                </span>
              </div>

              {/* Storage */}
              <div className="mt-7">
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#8A7F72]">
                    Family storage
                  </span>
                  <span className="text-[14px] font-semibold text-[#181512] tabular-nums">
                    {usageLoading ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#E7DEC7] border-t-[#B8932A] align-middle" />
                    ) : (
                      <>
                        {formatBytes(usedBytes)} of {formatBytes(maxBytes)} used
                      </>
                    )}
                  </span>
                </div>

                <StorageBar pct={pct} lowOnSpace={lowOnSpace} />

                {lowOnSpace && (
                  <p className="mt-3 text-[13px] font-medium" style={{ color: pct >= 95 ? '#C0392B' : '#9A6A12' }}>
                    Your family is running low on space.
                  </p>
                )}

                <p className="mt-3 text-[12.5px] text-[#8A7F72]">
                  Shared across everyone in your family. Photos, videos and voice notes all count towards this.
                </p>
              </div>
            </section>

            {/* ── FREE: upgrade is the hero ── */}
            {!isPremium && (
              <section className="mt-6 overflow-hidden rounded-2xl border border-[#D4AF37]" style={{ background: '#1A1612' }}>
                <div className="h-[2px] bg-[linear-gradient(90deg,transparent,#C9A84C_20%,#F0DC9A_50%,#C9A84C_80%,transparent)]" />

                <div className="p-6 sm:p-8 md:p-10">
                  <p className="text-[11px] tracking-[0.16em] uppercase text-[#C8A557] font-semibold">
                    Upgrade
                  </p>
                  <h2 className="mt-3 text-[clamp(26px,4vw,38px)] leading-[1.02] tracking-[-0.02em] text-white" style={SERIF}>
                    Upgrade to Premium
                  </h2>

                  <ul className="mt-6 space-y-3">
                    {[
                      '100GB of storage for your whole family',
                      'Longer videos, up to 15 minutes',
                      '10% off every keepsake order',
                    ].map((line) => (
                      <li key={line} className="flex gap-3 text-[14px] md:text-[15px] leading-[1.6] text-[#F5F1E6]/85">
                        <span className="mt-[0.5em] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#D4AF37]" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Price */}
                  <div className="mt-8 flex items-end gap-3">
                    <span className="text-[clamp(38px,7vw,56px)] font-bold leading-none tracking-tight text-white" style={SERIF}>
                      {currency === 'GBP' && '£3.99'}
                      {currency === 'USD' && '$5.99'}
                      {currency === 'EUR' && '€4.99'}
                    </span>
                    <span className="pb-1.5 text-[14px] text-[#F5F1E6]/75">/ month</span>
                  </div>
                  <p className="mt-2 text-[13px] text-[#C8A557]">
                    Per family, not per person. One payment covers everyone.
                  </p>

                  {/* Currency */}
                  <div className="mt-5 inline-flex w-full max-w-[240px] rounded-xl border border-white/15 bg-white/5 p-1">
                    {(['GBP', 'USD', 'EUR'] as Currency[]).map((cur) => (
                      <button
                        key={cur}
                        onClick={() => setCurrency(cur)}
                        className={`flex-1 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${
                          currency === cur ? 'bg-[#D4AF37] text-[#1A1612]' : 'text-[#F5F1E6]/70 hover:text-white'
                        }`}
                      >
                        {cur === 'GBP' && '£ GBP'}
                        {cur === 'USD' && '$ USD'}
                        {cur === 'EUR' && '€ EUR'}
                      </button>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleUpgrade('Premium')}
                    className="mt-7 inline-flex w-full items-center justify-center rounded-full px-6 py-4 text-[15px] font-semibold text-[#1A1612] transition hover:opacity-90 active:scale-[0.99]"
                    style={{ background: 'linear-gradient(135deg, #C8A557 0%, #D4AF37 100%)' }}
                  >
                    Upgrade now
                  </button>
                  <p className="mt-3 text-center text-[12px] text-[#F5F1E6]/70">
                    Secure checkout. Cancel any time.
                  </p>
                </div>
              </section>
            )}

            {/* ── PREMIUM: manage only, no upgrade push ── */}
            {isPremium && (
              <section className="mt-6 rounded-2xl border border-[#ECE5D8] bg-white p-6 sm:p-8">
                <p className="text-[11px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
                  Manage
                </p>
                <h2 className="mt-3 text-[22px] md:text-[24px] tracking-[-0.02em] text-[#181512]" style={SERIF}>
                  You have everything Premium offers
                </h2>
                <p className="mt-3 max-w-[56ch] text-[14px] leading-[1.7] text-[#4A4030]">
                  100GB of family storage, longer videos, and 10% off every keepsake order. If you cancel, everything you have already created stays safe and accessible.
                </p>

                <button
                  onClick={() => setShowPlanChangeInfo(true)}
                  className="mt-6 inline-flex items-center justify-center rounded-full border border-[#E0D6C8] bg-white px-6 py-3 text-[14px] font-semibold text-[#3D3526] transition hover:border-[#B8932A] hover:text-[#181512]"
                >
                  Manage or cancel
                </button>
              </section>
            )}
          </>
        )}
      </div>

      {/* ── Manage / cancel modal (reused) ── */}
      {showPlanChangeInfo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl" style={SANS}>
            <h2 className="mb-3 text-[20px] text-[#181512]" style={SERIF}>
              Managing your subscription
            </h2>

            <p className="mb-5 text-[14px] leading-[1.7] text-[#4A4030]">
              To change or cancel your subscription, visit our Help page and send us an email or complete the contact form. Our team will take care of your request personally.
            </p>

            <p className="mb-6 text-[13px] text-[#8A7F72]">
              Your memories and data stay safe and accessible forever, even after a subscription ends.
            </p>

            <div className="flex justify-center gap-3">
              <a
                href="/dashboard/help"
                className="rounded-full bg-[#0F2040] px-6 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#152a52]"
              >
                Visit Help Centre
              </a>
              <button
                onClick={() => setShowPlanChangeInfo(false)}
                className="rounded-full bg-[#F1EADB] px-6 py-2.5 text-[14px] font-semibold text-[#3D3526] transition hover:bg-[#E7DEC7]"
              >
                Close
              </button>
            </div>

            <button
              onClick={() => setShowPlanChangeInfo(false)}
              aria-label="Close"
              className="absolute right-4 top-4 text-[#B5AFA6] transition hover:text-[#4A4030]"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StorageBar({ pct, lowOnSpace }: { pct: number; lowOnSpace: boolean }) {
  const width = pct > 0 ? Math.max(2, pct) : 0;
  const fill = lowOnSpace
    ? pct >= 95
      ? '#C0392B'
      : '#E39A3B'
    : 'linear-gradient(90deg, #C8A557 0%, #A9842E 100%)';

  return (
    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[#EFE7D3]">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${width}%`, background: fill }}
      />
    </div>
  );
}

function LoadingCard() {
  return (
    <section className="mt-8 md:mt-10 flex items-center gap-3 rounded-2xl border border-[#ECE5D8] bg-white p-8">
      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#E7DEC7] border-t-[#B8932A]" />
      <span className="text-[14px] text-[#8A7F72]">Loading your plan…</span>
    </section>
  );
}
