"use client";

import { useState } from "react";
import { getBrowserClient } from '@/lib/supabase/browser';

const supabase = getBrowserClient();

type Props = {
  plan: "Basic" | "Standard" | "Premium";
  billingCycle: "monthly" | "yearly";
};

export default function SubscribeButton({ plan, billingCycle }: Props) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // ✅ Get user info from Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in first.");
        return;
      }

      const email = user.email;
      const userId = user.id;

      // ✅ Create checkout session via your API
      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billingCycle, userId, email }),
      });

      const data = await res.json();

      if (data?.url) {
        // ✅ Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data);
        alert("Failed to start checkout. Please try again.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong starting checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="px-6 py-3 rounded-lg bg-[#D4AF37] text-white font-semibold hover:bg-[#c09c32] transition disabled:opacity-50"
    >
      {loading ? "Processing..." : `Subscribe to ${plan}`}
    </button>
  );
}
