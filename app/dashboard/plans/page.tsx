"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from '@/lib/supabase/browser';
import Link from "next/link";

type PlanName = "Free" | "Premium";

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
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [usage, setUsage] = useState<UsageRow | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [showPlanChangeInfo, setShowPlanChangeInfo] = useState(false);

  const FREE_PLAN_STORAGE = 5 * 1024 ** 3; // 5GB in bytes

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
const matchedPlan =
  planList.find((pl) => pl.id === sub?.plan_id) ?? null;

if (matchedPlan?.name === "Premium") {
  const isPremiumActive =
    sub?.status === "active" &&
    sub?.cancel_at_period_end === false &&
    (!sub?.current_period_end ||
      new Date(sub.current_period_end) > new Date());

  setCurrentPlan(isPremiumActive ? matchedPlan : null);
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

  function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "0 MB";

  const mb = bytes / 1024 ** 2;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;

  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}


  const formatDate = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleDateString() : "—";

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
          currency, // ✅ add this
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
  const PRICE: Record<Currency, string> = {
  GBP: "£9.99 / month",
  USD: "$12.99 / month",
  EUR: "€11.99 / month",
};

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-[#0f2040]">Plans & Subscriptions</h1>

      {/* Top Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

  {/* Current Plan Card */}
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

    <div className="h-1.5 bg-gradient-to-r from-[#152a52] via-[#0f2040] to-[#D4AF37]" />

    <div className="p-6">
      <div>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-[#0f2040] ring-1 ring-slate-200">
          Your Current Plan
        </div>

        <h2 className="mt-2 text-2xl font-bold text-[#0f2040]">
          {currentPlan?.name ?? "Free"}{" "}
          <span className="ml-2 text-slate-500 text-sm">
            {currentPlan ? PRICE[currency] : ""}
          </span>
        </h2>

        <p className="mt-1 text-sm text-slate-600">
  {currentPlan?.name === "Premium"
    ? `Renews on ${formatDate(subscription?.current_period_end)}`
    : "You are currently on the free plan"}
</p>
      </div>
    </div>

    {/* Storage usage */}
    <div className="px-6 pb-6">
      <div className="flex items-center justify-between text-sm text-slate-700">
        <span>Storage used</span>
        <span>
          {usage
            ? `${formatBytes(usage.used_bytes)} / ${formatBytes(
                currentPlan?.max_storage ?? FREE_PLAN_STORAGE
              )}`
            : "—"}
        </span>
      </div>

      <UsageBar
        used={usage?.used_bytes ?? 0}
        max={currentPlan?.max_storage ?? FREE_PLAN_STORAGE}
      />
    </div>
  </section>


  {/* Manage Subscription Card */}
  <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-[#fafafa] shadow-sm overflow-hidden">

    <div className="h-1.5 bg-gradient-to-r from-[#D4AF37] to-[#F3D99B]" />

    <div className="p-6 flex flex-col justify-between h-full">

      <div>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-[#0f2040] ring-1 ring-slate-200">
          Manage Subscription
        </div>

        <h2 className="mt-3 text-xl font-semibold text-[#0f2040]">
          Downgrade or cancel your subscription
        </h2>

       <p className="mt-2 text-sm text-slate-600 leading-relaxed">
If you would like to downgrade or cancel your subscription, please contact our support team.
</p>

<p className="mt-2 text-sm text-slate-600">
Your memories stay safe forever. If you cancel Premium, everything you have already created remains safe and accessible.
</p>
      </div>

      <div className="mt-6 flex gap-3 flex-wrap">

  <button
    onClick={() => setShowPlanChangeInfo(true)}
    className="px-4 py-2 rounded-md bg-[#0f2040] text-white text-sm font-medium hover:bg-[#152a52]"
  >
    Downgrade or Cancel
  </button>

  <Link
    href="/dashboard/help"
    className="px-4 py-2 rounded-md border border-slate-300 bg-white text-sm font-medium hover:bg-slate-50"
  >
    Billing Help
  </Link>

</div>

    </div>
  </section>

</div>

      {/* Plan Cards */}
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-[#fafafa] shadow-lg p-6">
        <h2 className="text-xl font-semibold text-[#0f2040] mb-1">
  Choose the plan that fits your family library
</h2>

<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
  <p className="text-sm text-[#000000]">
  Billing is processed in your selected currency at checkout. Your monthly
  subscription will continue to be billed in this currency.
</p>


 <div className="inline-flex w-full max-w-[260px] mx-auto md:mx-0 rounded-xl border border-slate-200 bg-slate-100 shadow-inner p-1">
    {(["GBP", "USD", "EUR"] as Currency[]).map((cur) => (
      <button
        key={cur}
        onClick={() => setCurrency(cur)}
        className={`flex-1 px-3 py-1.5 text-sm text-center font-semibold rounded-lg transition-all duration-200
  ${
    currency === cur
      ? "bg-[#0f2040] text-white shadow-md ring-3 ring-[#D4AF37]"
      : "text-slate-600 hover:text-[#0f2040]"
  }`}
      >
        {cur === "GBP" && "£ GBP"}
        {cur === "USD" && "$ USD"}
        {cur === "EUR" && "€ EUR"}
      </button>
    ))}
  </div>
</div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
  {/* FREE */}
  <div className="overflow-hidden rounded-[2rem] border border-[#E7D9AF] bg-white shadow-[0_18px_50px_-36px_rgba(15,32,64,0.14)]">
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

      <div className="border-t border-[#EEDFAE] bg-[linear-gradient(180deg,#FFF9EE_0%,#FFFDF8_100%)] p-6 md:border-l md:border-t-0 sm:p-8">
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

  {/* PREMIUM */}
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
            <span>500GB of secure storage</span>
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

      <div className="border-t border-[#E9DDAF] bg-[linear-gradient(180deg,rgba(255,255,255,0.45)_0%,rgba(255,249,232,0.92)_100%)] p-6 md:border-l md:border-t-0 sm:p-8">
        <div className="text-[3rem] font-extrabold leading-none tracking-tight text-[#0F2040] sm:text-[4rem]">
          {currency === "GBP" && "£9.99"}
          {currency === "USD" && "$12.99"}
          {currency === "EUR" && "€11.99"}
        </div>

        <p className="mt-3 text-sm leading-relaxed text-[#0F2040]/58">
          Upgrade when you are ready to preserve more.
        </p>
        <div className="mt-6 rounded-[1.35rem] border border-[#D8C9F2]/60 bg-[linear-gradient(180deg,#EEE7FB_0%,#E7DDF8_100%)] px-5 py-5">
  <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#7D5AA8]">
    Physical memory books
  </p>
  <p className="mt-3 text-sm leading-relaxed text-[#0F2040]/75 sm:text-[15px]">
    Your first physical memory book will be free on us, then Premium members will get 25% off each physical book when they launch.
  </p>
</div>

        <button
          onClick={() => handleUpgrade("Premium")}
          disabled={currentPlan?.name === "Premium"}
          className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold transition ${
            currentPlan?.name === "Premium"
              ? "bg-slate-300 text-slate-600 cursor-not-allowed"
              : "bg-[#0F2040] text-white hover:bg-[#152a52]"
          }`}
        >
          {currentPlan?.name === "Premium" ? "Current Plan" : "Upgrade to Premium"}
        </button>

        {currentPlan?.name === "Premium" && (
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
        Your memories and data remain safe and accessible forever. 
        Even after your subscription ends.
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
        className="h-2 bg-gradient-to-r from-[#0f2040] to-[#152a52] transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
