"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type StatusState = "success" | "error" | null;

export default function HelpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<StatusState>(null);

  const [plan, setPlan] = useState<string | null>(null);

  // Fetch plan for conditional phone box
  useEffect(() => {
    const fetchPlan = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("subscription_summary")
        .select("plan_name")
        .eq("user_id", user.id)
        .single();

      if (data?.plan_name) setPlan(data.plan_name);
    };

    fetchPlan();
  }, []);

  // ---------------------------------------------------------
  // 🔥 FINAL WORKING VERSION — uses supabase.functions.invoke
  // ---------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    setStatus(null);

    try {
      const { data, error } = await supabase.functions.invoke(
        "send-contact-email",
        {
          body: { name, email, message },
        }
      );

      console.log("contact result:", { data, error });

      if (error) {
        setStatus("error");
      } else {
        // ✅ Log notification so it appears in Updates and triggers the bell
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await supabase.from("notifications").insert({
            title: "Support request submitted",
            content:
              "Your message has been sent to the Ancestorii support team.",
            user_id: user.id,
            type: "update",
          });
        }

        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
      }
    } catch (err) {
      setStatus("error");
    }

    setLoading(false);
  };
  // ---------------------------------------------------------

  return (
    <div className="px-4 py-10 md:px-10 lg:px-16 text-[#0F2040]">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* PAGE HEADER */}
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold">
            Need help with Ancestorii?
          </h1>

          <p className="text-base md:text-lg text-gray-500 max-w-2xl">
            We’re here to support your journey as you preserve your family&apos;s
            story. Browse the FAQs below or reach out to us directly.
          </p>
        </header>

        {/* FAQ BOX */}
        <div className="bg-white rounded-2xl shadow-[0_6px_25px_rgba(15,32,64,0.1)] border border-gray-200 overflow-hidden">
          <div className="h-2 w-full bg-[#D4AF37]" />

          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold mb-6">
              Frequently Asked Questions
            </h2>

            <div className="space-y-3">
              <FAQItem
                title="Billing & Subscriptions"
                content={[
                  "You can upgrade or downgrade your plan any time inside the Plans section.",
                  "Your subscription stays active until the end of the billing cycle when cancelled.",
                  "If a payment fails, we retry and notify you before any limits apply.",
                ]}
              />
              <FAQItem
                title="Storage Limits"
                content={[
                  "All uploaded photos, videos, audio and documents count towards your storage.",
                  "You can check your current usage inside the Plans or My Profile section.",
                  "If you reach the limit, you must free space or upgrade to continue uploading.",
                ]}
              />
              <FAQItem
                title="Creating Timelines"
                content={[
                  "Create a timeline using the Create New Timeline button in the Timelines section.",
                  "Timelines help organise key life events and milestones.",
                  "Plan limits determine how many timelines you can create.",
                ]}
              />
              <FAQItem
                title="Albums & Capsules"
                content={[
                  "Albums are ideal for grouping photos and videos.",
                  "Capsules are time-locked memories or future messages.",
                  "More sharing and permission features are coming soon.",
                ]}
              />
              <FAQItem
                title="Account & Login"
                content={[
                  "Use the Forgot Password link if you can't access your account.",
                  "You can update email and details inside Account Settings.",
                  "Always use a strong unique password for security.",
                ]}
              />
            </div>
          </div>
        </div>

        {/* CONTACT + PHONE SIDE-BY-SIDE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CONTACT BOX */}
          <div className="bg-white rounded-2xl shadow-[0_6px_25px_rgba(15,32,64,0.1)] border border-gray-200 overflow-hidden">
            <div className="h-2 w-full bg-[#D4AF37]" />

            <div className="p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-4">Contact Us</h2>

              <p className="text-base text-gray-600 mb-6">
                Fill in the form below and we'll get back to you within{" "}
                <strong>24 hours</strong>.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-600 uppercase">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-base focus:border-gold focus:ring-gold outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-600 uppercase">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-base focus:border-gold focus:ring-gold outline-none"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-600 uppercase">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-base resize-none focus:border-gold focus:ring-gold outline-none"
                  />
                </div>

                {/* Status */}
                {status === "success" && (
                  <p className="text-base text-green-600">Message sent.</p>
                )}
                {status === "error" && (
                  <p className="text-base text-red-600">
                    Something went wrong, please try again.
                  </p>
                )}

                <button
  type="submit"
  disabled={loading}
  className="
    w-full md:w-auto inline-flex items-center justify-center 
    px-6 py-2.5 rounded-full 
    border border-gold 
    bg-white text-[#0F2040] font-semibold text-base
    transition-all duration-300
    hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-[#0F2040]
    disabled:opacity-60
  "
>
  {loading ? "Sending…" : "Send message"}
</button>
              </form>
            </div>
          </div>

          {/* PHONE SUPPORT BOX */}
          <div className="bg-white rounded-2xl shadow-[0_6px_25px_rgba(15,32,64,0.1)] border border-gray-200 overflow-hidden">
            <div className="h-2 w-full bg-[#0F2040]" />

            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold mb-4">
                Prefer to speak to us?
              </h2>

              {plan ? (
  plan === "Standard" || plan === "Premium" ? (
    <>
      <p className="text-lg text-gray-700">
        Priority phone support available for Standard & Premium members:
      </p>

      <p className="text-2xl font-bold text-gold mt-3">
        0330 133 2268
      </p>

      <p className="text-base text-gray-600 mt-4">
        Available <strong>9:00am – 6:00pm</strong>, Monday to Saturday.
      </p>

      <p className="text-lg text-gray-600 mt-6">
        Or email us at{" "}
        <span className="text-[#D4AF37] font-semibold">
          support@ancestorii.com
        </span>
      </p>
    </>
  ) : (
    <>
      <p className="text-lg font-medium text-gray-700">
        Upgrade to access priority phone support.
      </p>

      <p className="text-base text-gray-600 mt-6">
        Email support is always available at{" "}
        <span className="text-[#D4AF37] font-semibold text-lg">
          support@ancestorii.com
        </span>
      </p>
    </>
  )
) : (
  <p className="text-gray-500 text-base">Checking your plan…</p>
)}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type FAQItemProps = {
  title: string;
  content: string[];
};

function FAQItem({ title, content }: FAQItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
  className="
    border border-gray-200 rounded-xl 
    transition-all duration-300 
    hover:shadow-[0_4px_20px_rgba(212,175,55,0.25)]
    hover:-translate-y-[2px]
    hover:bg-[#FFF8E6]
  "
>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-lg font-semibold">{title}</span>
        <span className="text-xl">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4">
          <ul className="mt-2 space-y-2 text-base text-gray-700">
            {content.map((item, i) => (
              <li key={i} className="flex items-start gap-2 leading-snug">
  <span className="text-gold text-[18px] leading-[1.2] mt-[2px]">•</span>
  <span className="text-[16px] leading-[1.6]">{item}</span>
</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
