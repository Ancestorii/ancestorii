'use client';

import Link from 'next/link';

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
  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="relative z-10 pl-8 pr-6 pt-20 pb-16 mx-auto max-w-[1700px] sm:pl-14 sm:pr-12 lg:pl-20 lg:pr-32">
      <h1 className="mb-6 text-2xl font-semibold text-[#0f2040]">Plans &amp; Subscriptions</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="overflow-hidden bg-white border rounded-2xl border-slate-200 shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-[#152a52] via-[#0f2040] to-[#D4AF37]" />

          <div className="p-6">
            <div>
              <div className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ring-1 bg-slate-100 text-[#0f2040] ring-slate-200">
                Your Current Plan
              </div>

              <h2 className="mt-2 text-2xl font-bold text-[#0f2040]">
                {currentPlan?.name ?? 'Free'}
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                {currentPlan?.name === 'Premium'
                  ? `Renews on ${formatDate(subscription?.current_period_end)}`
                  : 'You are currently on the free plan'}
              </p>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-center justify-between text-sm text-slate-700">
              <span>Storage used</span>
              <span className="flex items-center justify-end min-w-[110px]">
                {usageLoading ? (
                  <span className="inline-block w-4 h-4 border-2 rounded-full animate-spin border-slate-300 border-t-[#0f2040]" />
                ) : (
                  `${formatBytes(usage?.used_bytes ?? 0)} / ${formatBytes(
                    currentPlan?.max_storage ?? freePlanStorage
                  )}`
                )}
              </span>
            </div>

            <UsageBar
              used={usage?.used_bytes ?? 0}
              max={currentPlan?.max_storage ?? freePlanStorage}
            />
          </div>
        </section>

        <section className="overflow-hidden shadow-sm rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-[#fafafa]">
          <div className="h-1.5 bg-gradient-to-r from-[#D4AF37] to-[#F3D99B]" />

          <div className="flex flex-col justify-between h-full p-6">
            <div>
              <div className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ring-1 bg-slate-100 text-[#0f2040] ring-slate-200">
                Manage Subscription
              </div>

              <h2 className="mt-3 text-xl font-semibold text-[#0f2040]">
                Downgrade or cancel your subscription
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                If you would like to downgrade or cancel your subscription, please contact our
                support team.
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Your memories stay safe forever. If you cancel Premium, everything you have already
                created remains safe and accessible.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => setShowPlanChangeInfo(true)}
                className="px-4 py-2 text-sm font-medium text-white rounded-md bg-[#0f2040] hover:bg-[#152a52]"
              >
                Downgrade or Cancel
              </button>

              <Link
                href="/dashboard/help"
                className="px-4 py-2 text-sm font-medium bg-white border rounded-md border-slate-300 hover:bg-slate-50"
              >
                Billing Help
              </Link>
            </div>
          </div>
        </section>
      </div>

      <section className="p-6 mt-8 border shadow-lg rounded-2xl border-slate-200 bg-gradient-to-b from-white to-[#fafafa]">
        <h2 className="mb-1 text-xl font-bold text-[#0f2040]">
          One plan. Everything your family library needs.
        </h2>

        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
          <p className="text-md text-[#000000]">
            Choose your currency. You&apos;ll be billed yearly at the rate shown.
          </p>

          <div className="inline-flex w-full max-w-[260px] p-1 mx-auto border shadow-inner md:mx-0 rounded-xl border-slate-200 bg-slate-100">
            {(['GBP', 'USD', 'EUR'] as Currency[]).map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`flex-1 px-3 py-1.5 text-sm text-center font-semibold rounded-lg transition-all duration-200 ${
                  currency === cur
                    ? 'bg-[#0f2040] text-white shadow-md ring-3 ring-[#D4AF37]'
                    : 'text-slate-600 hover:text-[#0f2040]'
                }`}
              >
                {cur === 'GBP' && '£ GBP'}
                {cur === 'USD' && '$ USD'}
                {cur === 'EUR' && '€ EUR'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="overflow-hidden border bg-white rounded-[2rem] border-[#E7D9AF] shadow-[0_18px_50px_-36px_rgba(15,32,64,0.14)]">
            <div className="grid h-full md:grid-cols-[1.02fr_0.98fr]">
              <div className="p-6 sm:p-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF3D6] px-4 py-1.5 text-xs font-semibold text-[#8F7A2A]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                  Free forever
                </div>

                <h3 className="mt-5 font-serif text-[2rem] leading-[1.05] text-[#0F2040] sm:text-[2.5rem]">
                  Begin with the essentials.
                </h3>

                <div className="mt-7 h-px w-full bg-gradient-to-r from-transparent via-[#E7D8A9] to-transparent" />

                <ul className="mt-7 space-y-3 text-sm text-[#0F2040]/82 sm:text-[15px]">
                  <li className="flex gap-3">
                    <span className="text-[#D4AF37]">●</span>
                    <span>5GB of secure storage</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#D4AF37]">●</span>
                    <span>Create unlimited family members</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#D4AF37]">●</span>
                    <span>1 timeline, 1 album and 1 capsule</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#D4AF37]">●</span>
                    <span>Private by default</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#D4AF37]">●</span>
                    <span>Add stories, voices and context</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#D4AF37]">●</span>
                    <span>Upgrade whenever you choose</span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-[#EEDFAE] bg-[linear-gradient(180deg,#FFF9EE_0%,#FFFDF8_100%)] p-6 sm:p-8 md:border-l md:border-t-0">
                <div className="text-[3rem] font-extrabold leading-none tracking-tight text-[#0F2040] sm:text-[4rem]">
                  FREE
                </div>

                <p className="mt-3 text-sm leading-relaxed text-[#0F2040]/58">
                  Enough to begin building your library properly.
                </p>

                <button
                  disabled
                  className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-slate-200 px-6 py-3.5 text-sm font-semibold text-slate-600 cursor-default"
                >
                  Included
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-[#D4AF37] bg-[linear-gradient(160deg,rgba(255,253,247,0.97)_0%,rgba(250,244,229,0.98)_100%)] shadow-[0_28px_80px_-36px_rgba(15,32,64,0.2)]">
            <div className="h-[2px] bg-[linear-gradient(90deg,transparent,#C9A84C_20%,#F0DC9A_50%,#C9A84C_80%,transparent)]" />

            <div className="grid h-full md:grid-cols-[1.04fr_0.96fr]">
              <div className="p-6 sm:p-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF3D6] px-4 py-1.5 text-xs font-semibold text-[#8F7A2A]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                  Premium
                </div>

                <h3 className="mt-5 font-serif text-[2rem] leading-[1.05] text-[#0F2040] sm:text-[2.5rem]">
                  Preserve more of your family library.
                </h3>

                <div className="mt-7 h-px w-full bg-gradient-to-r from-[#D4AF37]/50 via-[#D4AF37]/20 to-transparent" />

                <ul className="mt-7 space-y-3 text-sm text-[#0F2040]/82 sm:text-[15px]">
                  <li className="flex gap-3">
                    <span className="text-[#D4AF37]">●</span>
                    <span>50GB of secure storage</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#D4AF37]">●</span>
                    <span>Unlimited timelines, albums and capsules</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#D4AF37]">●</span>
                    <span>Max upload 10GB per file</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#D4AF37]">●</span>
                    <span>Videos up to 30 minutes</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#D4AF37]">●</span>
                    <span>Priority phone support</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#D4AF37]">●</span>
                    <span>Early access to new features</span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-[#E9DDAF] bg-[linear-gradient(180deg,rgba(255,255,255,0.45)_0%,rgba(255,249,232,0.92)_100%)] p-6 sm:p-8 md:border-l md:border-t-0">
                <div className="text-[3rem] font-extrabold leading-none tracking-tight text-[#0F2040] sm:text-[4rem]">
                  {currency === 'GBP' && '£49'}
                  {currency === 'USD' && '$69'}
                  {currency === 'EUR' && '€59'}
                  <span className="text-base font-medium text-[#0F2040]/50"> /year</span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-[#0F2040]/58">
                  Upgrade when you are ready to preserve more.
                </p>

                <div className="mt-6 rounded-[1.35rem] border border-[#D8C9F2]/60 bg-[linear-gradient(180deg,#EEE7FB_0%,#E7DDF8_100%)] px-5 py-5">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#7D5AA8]">
                    Physical memory books
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[#0F2040]/75 sm:text-[15px]">
                    Premium members receive 15% off their first printed memory book, then 10% off future memory book orders.
                  </p>
                </div>

                <button
                  onClick={() => handleUpgrade('Premium')}
                  disabled={currentPlan?.name === 'Premium'}
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold transition ${
                    currentPlan?.name === 'Premium'
                      ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                      : 'bg-[#0F2040] text-white hover:bg-[#152a52] hover:shadow-[0_0_24px_rgba(212,175,55,0.45)] hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {currentPlan?.name === 'Premium' ? 'Current Plan' : 'Upgrade to Premium'}
                </button>

                {currentPlan?.name === 'Premium' && (
                  <button
                    onClick={() => setShowPlanChangeInfo(true)}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Manage Plan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {showPlanChangeInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-md p-8 text-center bg-white shadow-2xl rounded-2xl">
            <h2 className="mb-3 text-xl font-semibold text-[#0F2040]">
              Managing your Ancestorii subscription
            </h2>

            <p className="mb-6 leading-relaxed text-gray-600">
              If you’d like to change or downgrade your Ancestorii subscription, please visit our
              Help page and either send us an email or complete the contact form. Our team will
              personally take care of your request.
            </p>

            <p className="mb-6 text-sm text-gray-500">
              Your memories and data remain safe and accessible forever. Even after your
              subscription ends.
            </p>

            <div className="flex justify-center gap-4">
              <a
                href="/dashboard/help"
                className="px-6 py-2 rounded-xl bg-[#0F2040] text-white hover:bg-[#152a52] transition-all"
              >
                Visit Help Centre
              </a>

              <button
                onClick={() => setShowPlanChangeInfo(false)}
                className="px-6 py-2 text-gray-700 transition-all bg-gray-200 rounded-xl hover:bg-gray-300"
              >
                Close
              </button>
            </div>

            <button
              onClick={() => setShowPlanChangeInfo(false)}
              className="absolute text-gray-400 top-3 right-3 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function UsageBar({ used, max }: { used: number | null; max: number | null }) {
  const pct =
    used != null && max && max > 0
      ? Math.min(100, Math.max(1, Math.round((used / max) * 100)))
      : 0;

  return (
    <div className="w-full h-2 mt-2 overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-2 bg-gradient-to-r from-[#0f2040] to-[#152a52] transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}