"use client";

import { useState } from "react";

const faqs = [
  {
    question: "How secure is Ancestorii?",
    answer:
      "Every memory is protected with AES-256 encryption — the same level used by banks and governments. Your photos, videos, and voice notes are stored safely, and only you (and those you invite) can access them.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, absolutely. You can cancel your plan anytime — your access will remain active until the end of your billing cycle. No hidden fees, no contracts.",
  },
  {
    question: "How much storage do I get?",
    answer:
      "That depends on your plan. Basic offers 25GB, Standard provides 250GB, and Premium unlocks 500GB — perfect for preserving a lifetime of memories.",
  },
  {
    question: "Can I share with my family?",
    answer:
      "Not yet. Ancestorii is designed as a private space where you preserve memories for the future. Sharing and collaborative access with loved ones will be introduced in a later update.",
  },
  {
    question: "What happens if I stop paying?",
    answer:
      "Your account will be safely paused, and all your data securely stored until your plan ends. You can reactivate anytime to regain full access to your memories.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes — every plan includes a 14-day free trial. You can explore every feature before deciding to subscribe.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-white pt-16 sm:pt-20 pb-12 md:pb-16">
      <div className="max-w-screen-md mx-auto px-4 sm:px-6">
        <h2 className="text-3xl md:text-5xl font-extrabold text-center text-[#0F2040] mb-10 md:mb-14">
          Your Questions, Answered.
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#D4AF37]/40 bg-[#FFFDF7] shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex justify-between items-center p-4 sm:p-5 text-left font-semibold text-[#0F2040] text-base sm:text-lg transition-all"
              >
                {faq.question}
                <span className="text-[#D4AF37] text-xl sm:text-2xl">
                  {openIndex === idx ? "−" : "+"}
                </span>
              </button>

              {openIndex === idx && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-5 text-[#0F2040]/80 leading-relaxed text-sm sm:text-base">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
