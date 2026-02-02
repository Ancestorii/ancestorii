"use client";

import { useEffect, useMemo, useState } from "react";
import { getBrowserClient } from '@/lib/supabase/browser';
import Link from "next/link";
import { useRouter } from "next/navigation";

type PlanName = "Basic" | "Standard" | "Premium";

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

export default function PlansPage() {
  const supabase = getBrowserClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [usage, setUsage] = useState<UsageRow | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [showPlanChangeInfo, setShowPlanChangeInfo] = useState(false);

  type Currency = "GBP" | "USD" | "EUR";
  const [currency, setCurrency] = useState<Currency>("GBP");

  // 🔄 If we returned from Stripe with success/canceled, refresh data once
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("success") || url.searchParams.get("canceled")) {
      // Clean the query string
      url.searchParams.delete("success");
      url.searchParams.delete("canceled");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  // ---- Fetch user, plans, subscription, usage ----
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: authResp } = await supabase.auth.getUser();
      const uid = authResp?.user?.id ?? null;

      // Fetch plans
      const { data: planRows, error: planErr } = await supabase
        .from("plans")
        .select("id, name, max_storage")
        .order("max_storage", { ascending: true });

      if (planErr) console.warn("Plans error:", planErr.message);
      const planList = (planRows ?? []) as Plan[];
      setPlans(planList);

      // Fetch subscription + usage
      let sub: SubscriptionRow | null = null;
      if (uid) {
        const { data: subRows, error: subErr } = await supabase
        .from("subscriptions")
        .select("user_id, plan_id, status, cancel_at_period_end, current_period_end")
        .eq("user_id", uid)
        .maybeSingle();
        if (subErr) console.warn("Subscription fetch error:", subErr.message);
        sub = (subRows ?? null) as SubscriptionRow | null;
        setSubscription(sub);

        const { data: usageRow, error: usageErr } = await supabase
          .from("storage_usage")
          .select("used_bytes")
          .eq("user_id", uid)
          .maybeSingle();
        if (usageErr) console.warn("Usage error:", usageErr.message);
        setUsage((usageRow ?? null) as UsageRow | null);
      }

      // Determine if user is truly paid
const isPaid =
  sub?.status === "active" &&
  sub?.cancel_at_period_end === false &&
  (!sub?.current_period_end ||
    new Date(sub.current_period_end) > new Date());

// Set current plan based on paid status
if (isPaid && planList.length && sub?.plan_id) {
  const p = planList.find((pl) => pl.id === sub.plan_id) ?? null;
  setCurrentPlan(p);
} else {
  setCurrentPlan(null); // Free
}



      setLoading(false);
    })();
  }, []);

  useEffect(() => {
  if (!subscription?.user_id) return;

  const interval = setInterval(async () => {
    const { data } = await supabase
      .from("storage_usage")
      .select("used_bytes")
      .eq("user_id", subscription.user_id)
      .maybeSingle();

    setUsage({ used_bytes: data?.used_bytes ?? 0 });
  }, 15000); // every 15 seconds

  return () => clearInterval(interval);
}, [subscription?.user_id]);


  // ---- Helpers ----
  const planLadder = useMemo(
    () => plans.slice().sort((a, b) => a.max_storage - b.max_storage),
    [plans]
  );

  function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "0 MB";

  const mb = bytes / 1024 ** 2;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;

  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}


  const formatDate = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleDateString() : "—";

  const daysUntil = (iso: string | null | undefined) => {
  if (!iso) return null;
  const end = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
};


  // ---- Stripe Upgrade ----
 const handleUpgrade = async (planName: PlanName) => {
  try {
    // 🔥 get real user access token (so backend knows who is upgrading)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token ?? "";

    const res = await fetch(
      "https://wekebqaooixjngznycnm.supabase.co/functions/v1/create-checkout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // ❗ DO NOT send anon key as Authorization
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          plan: planName,
          returnPath: window.location.pathname,
        }),
        cache: "no-store",
        mode: "cors",
      }
    );

    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);

    const data = JSON.parse(text);

    if (data?.url) {
      window.location.href = data.url;
    } else {
      throw new Error("No checkout URL returned from Supabase.");
    }
  } catch (err: any) {
    console.error("Upgrade error:", err);
    alert("Error starting checkout: " + err.message);
  }
};


  // ---- UI Data ----
  const PRICE: Record<Currency, Record<PlanName, string>> = {
  GBP: {
    Basic: "£4.99 / month",
    Standard: "£9.99 / month",
    Premium: "£14.99 / month",
  },
  USD: {
    Basic: "$6.99 / month",
    Standard: "$12.99 / month",
    Premium: "$19.99 / month",
  },
  EUR: {
    Basic: "€5.99 / month",
    Standard: "€11.99 / month",
    Premium: "€17.99 / month",
  },
};


  const FEATURES: Record<PlanName, string[]> = {
    Basic: [
      "25GB of secure storage",
      "3 timelines, 3 capsules & 3 albums",
      "Max upload 1GB per file, videos up to 5 minutes",
      "Add voice & written notes to your memories",
      "Access anywhere, anytime",
      "Priority email support",
    ],
    Standard: [
      "Everything in Basic plan plus",
      "250GB of secure storage",
      "Unlimited timelines, albums & capsules",
      "Organise timelines, albums & capsules into one private legacy",
      "Max upload 5GB per file, videos up to 15 minutes",
      "Appoint 1 person to inherit your digital legacy",
      "Priority 24/7 support",
    ],
    Premium: [
      "Everything in Basic & Standard plans plus",
      "500GB of secure storage",
      "Max upload 10GB per file, videos up to 30 minutes with 4K processing priority",
      "Appoint 2 people to inherit your digital legacy",
      "30-day vault recovery for deleted items",
      "Future legal integration: Secure Digital Will & Asset Vault",
      "Access new features early such as Memorials & Tributes",
    ],
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-[#0f2040]">Plans & Subscriptions</h1>

      {/* Current Plan */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#152a52] via-[#0f2040] to-[#0c1a33]" />
        <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-[#0f2040] ring-1 ring-slate-200">
              Your Current Plan
            </div>
            <h2 className="mt-2 text-xl font-semibold text-[#0f2040]">
              {currentPlan?.name ?? "Free"}{" "}
              <span className="ml-2 text-slate-500 text-sm">
                {currentPlan ? PRICE[currency][currentPlan.name] : ""}
              </span>
              {subscription?.status === "trialing" && (
              <span className="ml-2 text-xs font-semibold text-amber-600">
              Trial ends in {daysUntil(subscription.current_period_end)} days
              </span>
             )}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
            {subscription?.status === "trialing"
              ? `Your trial ends on ${formatDate(subscription.current_period_end)}`
              : `Renews on ${formatDate(subscription?.current_period_end)}`}
             </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/settings")}
              className="px-4 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-sm font-medium"
            >
              Manage Billing
            </button>
            <Link
              href="/dashboard/help"
              className="text-sm text-slate-500 hover:text-slate-700 underline underline-offset-2"
            >
              Billing help
            </Link>
          </div>
        </div>

        {/* Storage usage */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between text-sm text-slate-700">
            <span>Storage used</span>
            <span>
              {usage && currentPlan
                ? `${formatBytes(usage.used_bytes)} / ${formatBytes(currentPlan.max_storage)}`
                : "—"}
            </span>
          </div>
        <UsageBar used={usage?.used_bytes ?? 0} max={currentPlan?.max_storage ?? null} />
        </div>
      </section>

      {/* Plan Cards */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <h2 className="text-xl font-semibold text-[#0f2040] mb-1">
  Choose the plan that fits your legacy
</h2>
<p className="text-sm text-slate-500 mb-5">
  You can upgrade or downgrade at any time.
</p>

<div className="flex items-center justify-between mb-6">
  <p className="text-sm text-slate-500">
    Choose your preferred currency
  </p>

  <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
    {(["GBP", "USD", "EUR"] as Currency[]).map((cur) => (
      <button
        key={cur}
        onClick={() => setCurrency(cur)}
        className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all
          ${
            currency === cur
              ? "bg-white text-[#0f2040] shadow-sm ring-1 ring-slate-200"
              : "text-slate-500 hover:text-slate-700"
          }`}
      >
        {cur === "GBP" && "£ GBP"}
        {cur === "USD" && "$ USD"}
        {cur === "EUR" && "€ EUR"}
      </button>
    ))}
  </div>
</div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {/* Free Plan */}
<div className="relative rounded-2xl border border-slate-200 bg-white overflow-hidden">
  {/* Top bar */}
  <div className="h-1.5 w-full bg-slate-200" />

  <div className="p-5 flex flex-col h-full bg-white">
    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-[#0f2040] ring-1 ring-slate-200">
      Free
    </div>

    <div className="mt-4 text-[#0f2040] font-extrabold text-2xl">
      £0
    </div>

    {/* Features — same style as paid plans */}
    <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-700">
      <li className="flex gap-2">
        <span className="text-[#D4AF37]">•</span>
        <span>1 timeline, 1 album & 1 capsule</span>
      </li>
      <li className="flex gap-2">
        <span className="text-[#D4AF37]">•</span>
        <span>Unlimited family members</span>
      </li>
      <li className="flex gap-2">
        <span className="text-[#D4AF37]">•</span>
        <span>Limited storage & file upload size</span>
      </li>
      <li className="flex gap-2">
        <span className="text-[#D4AF37]">•</span>
        <span>Private by default</span>
      </li>
      <li className="flex gap-2">
        <span className="text-[#D4AF37]">•</span>
        <span>Upgrade anytime</span>
      </li>
    </ul>

    <button
      disabled
      className="mt-5 w-full px-4 py-2.5 rounded-lg text-sm font-semibold
        bg-slate-200 text-slate-600 cursor-default"
    >
      Included
    </button>
  </div>
</div>

          {(["Basic", "Standard", "Premium"] as PlanName[]).map((name) => {
            const isCurrent = name === currentPlan?.name;
            return (
              <PlanCard
  key={name}
  title={name}
  price={PRICE[currency][name]}
  features={FEATURES[name]}
  onSelect={() => handleUpgrade(name)}
  isCurrent={isCurrent}
  currentPlanName={currentPlan?.name}
  onManagePlan={() => setShowPlanChangeInfo(true)}
/>
            );
          })}
        </div>
      </section>
      {showPlanChangeInfo && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md text-center relative">
      <h2 className="text-xl font-semibold text-[#0F2040] mb-3">
        Managing your Ancestorii subscription
      </h2>

      <p className="text-gray-600 mb-6 leading-relaxed">
        If you’d like to change or downgrade your Ancestorii subscription,
        please visit our Help page and either send us an email or complete
        the contact form. Our team will personally take care of your request.
      </p>

      <p className="text-sm text-gray-500 mb-6">
        Your memories and data remain safe and accessible until any change
        is confirmed.
      </p>

      <div className="flex justify-center gap-4">
        <a
          href="/dashboard/help"
          className="px-6 py-2 rounded-xl bg-[#0F2040] text-white
            hover:bg-[#152a52] transition-all"
        >
          Visit Help Centre
        </a>

        <button
          onClick={() => setShowPlanChangeInfo(false)}
          className="px-6 py-2 rounded-xl bg-gray-200 text-gray-700
            hover:bg-gray-300 transition-all"
        >
          Close
        </button>
      </div>

      <button
        onClick={() => setShowPlanChangeInfo(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
    </div>
  </div>
)}
    </div>
  );
}

/* ---------------------- UI PARTS ---------------------- */

function UsageBar({ used, max }: { used: number | null; max: number | null }) {
  const pct =
    used != null && max && max > 0
      ? Math.min(100, Math.max(1, Math.round((used / max) * 100)))
      : 0;

  return (
    <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
      <div
        className="h-2 bg-[#0f2040] transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

const PLAN_ORDER: PlanName[] = ["Basic", "Standard", "Premium"];


function PlanCard({
  title,
  price,
  features,
  onSelect,
  isCurrent,
  currentPlanName,
  onManagePlan,
}: {
  title: PlanName;
  price: string;
  features: string[];
  onSelect: () => void;
  isCurrent?: boolean;
  currentPlanName?: PlanName;
  onManagePlan: () => void;
}) {

  const isRecommended = title === "Standard";
  const currentIndex =
  currentPlanName ? PLAN_ORDER.indexOf(currentPlanName) : -1;

  const thisIndex = PLAN_ORDER.indexOf(title);

  const isUpgrade = thisIndex > currentIndex;
  const isDowngrade = thisIndex < currentIndex;


  return (
    <div
      className={`relative rounded-2xl border transition-all overflow-hidden
        ${
          isCurrent
            ? "border-[#D4AF37] ring-2 ring-[#D4AF37] bg-[#fffaf0]"
            : isRecommended
            ? "border-[#D4AF37] shadow-md hover:shadow-lg"
            : "border-slate-200 hover:border-[#D4AF37]"
        }`}
    >
      {/* Top accent bar */}
      <div
        className={`h-1.5 w-full ${
          isCurrent || isRecommended
            ? "bg-gradient-to-r from-[#D4AF37] to-[#F3D99B]"
            : "bg-slate-200"
        }`}
      />

      {/* Recommended badge */}
      {isRecommended && !isCurrent && (
        <div className="absolute top-3 right-3 text-xs font-semibold bg-[#D4AF37] text-[#0f2040] px-3 py-1 rounded-full">
          Most Popular
        </div>
      )}

      <div className="p-5 flex flex-col h-full bg-white">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-[#0f2040] ring-1 ring-slate-200">
          {title}
        </div>

        <div className="mt-4 text-[#0f2040] font-extrabold text-2xl">
          {price}
        </div>

        <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-700">
          {features.map((f, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[#D4AF37]">•</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <button
  disabled={isCurrent}
  onClick={() => {
    if (isDowngrade) {
      onManagePlan();
    } else {
      onSelect();
    }
  }}
  className={`mt-5 w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all
    ${
      isCurrent
        ? "bg-slate-300 text-slate-600 cursor-not-allowed"
        : isUpgrade
        ? "bg-gradient-to-r from-[#D4AF37] to-[#F3D99B] text-[#0f2040] hover:opacity-90"
        : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
    }`}
>
  {isCurrent
    ? "Current Plan"
    : isUpgrade
    ? "Upgrade Plan"
    : "Manage Plan"}
</button>
      </div>
    </div>
  );
}

