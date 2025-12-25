"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from '@/lib/supabase/browser';
import Link from "next/link";

type PlanName = "Basic" | "Standard" | "Premium";

type Plan = {
  id: string;
  name: PlanName;
  max_storage: number;
};

type SubscriptionRow = {
  user_id: string;
   plan_id: string;          // stores plan_id (uuid) in your DB
  renews_at: string | null;
};

type UsageRow = {
  used_bytes: number;
};

export default function PlansPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [usage, setUsage] = useState<UsageRow | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);

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
          .select("user_id, plan_id, renews_at")
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

      // Map subscription.plan (uuid) → plan object
      if (sub && planList.length) {
        const p = planList.find((pl) => pl.id === sub.plan_id) ?? null;
        setCurrentPlan(p);
      }

      setLoading(false);
    })();
  }, []);

  // ---- Helpers ----
  const planLadder = useMemo(
    () => plans.slice().sort((a, b) => a.max_storage - b.max_storage),
    [plans]
  );

  const bytesToGB = (bytes: number | null | undefined) =>
    bytes ? (bytes / 1024 ** 3).toFixed(0) + "GB" : "—";

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
  const PRICE: Record<PlanName, string> = {
    Basic: "£4.99/month",
    Standard: "£9.99/month",
    Premium: "£14.99/month",
  };

  const FEATURES: Record<PlanName, string[]> = {
    Basic: [
      "50GB of secure storage",
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
      "Link timelines, albums & capsules to your Family Tree",
      "Max upload 5GB per file, videos up to 15 minutes",
      "Download a shareable Poster for social media",
      "Appoint 1 person to inherit your digital legacy",
      "Priority 24/7 support",
    ],
    Premium: [
      "Everything in Basic & Standard plans plus",
      "500GB of secure storage",
      "Max upload 10GB per file, videos up to 30 minutes with 4K processing priority",
      "Appoint 2 people to inherit your digital legacy",
      "30-day vault recovery for deleted items",
      "Secure Digital Will & Asset Vault (coming soon)",
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
                {currentPlan ? PRICE[currentPlan.name] : ""}
              </span>
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Renewal date: {formatDate(subscription?.renews_at)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open("https://billing.stripe.com/p/login", "_blank")}
              className="px-4 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-sm font-medium"
            >
              Manage Billing
            </button>
            <Link
              href="/help/billing"
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
              {usage?.used_bytes != null && currentPlan
                ? `${bytesToGB(usage.used_bytes)} / ${bytesToGB(currentPlan.max_storage)}`
                : "—"}
            </span>
          </div>
          <UsageBar used={usage?.used_bytes ?? null} max={currentPlan?.max_storage ?? null} />
        </div>
      </section>

      {/* Plan Cards */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[#0f2040] mb-4">
          Choose the plan that fits your legacy
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["Basic", "Standard", "Premium"] as PlanName[]).map((name) => {
            const isCurrent = name === currentPlan?.name;
            return (
              <PlanCard
                key={name}
                title={name}
                price={PRICE[name]}
                features={FEATURES[name]}
                onSelect={() => handleUpgrade(name)}
                isCurrent={isCurrent}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ---------------------- UI PARTS ---------------------- */

function UsageBar({ used, max }: { used: number | null; max: number | null }) {
  const pct =
    used != null && max && max > 0 ? Math.min(100, Math.round((used / max) * 100)) : null;
  return (
    <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
      <div
        className="h-2 bg-[#0f2040] transition-all"
        style={{ width: pct != null ? `${pct}%` : "0%" }}
      />
    </div>
  );
}

function PlanCard({
  title,
  price,
  features,
  onSelect,
  isCurrent,
}: {
  title: PlanName;
  price: string;
  features: string[];
  onSelect: () => void;
  isCurrent?: boolean;
}) {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#152a52] via-[#0f2040] to-[#0c1a33]" />
      <div className="p-5 flex flex-col h-full">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-[#0f2040] ring-1 ring-slate-200">
          {title}
        </div>

        <div className="mt-3 text-[#0f2040] font-semibold text-lg">{price}</div>
        <ul className="mt-3 flex-1 space-y-2 text-sm text-slate-700">
          {features.map((f, i) => (
            <li key={i}>• {f}</li>
          ))}
        </ul>

        <button
          disabled={isCurrent}
          onClick={onSelect}
          className={`mt-4 w-full px-4 py-2 rounded-md text-white text-sm font-medium transition bg-[#0f2040] hover:bg-[#152a52] ${
            isCurrent ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isCurrent ? "Current Plan" : "Upgrade Plan"}
        </button>
      </div>
    </div>
  );
}
