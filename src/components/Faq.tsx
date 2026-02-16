"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What is Ancestorii designed for?",
    answer:
      "Ancestorii is a private digital space where you can capture stories, photos, voice notes, and everyday moments as they happen. It is designed to grow into a living family library over time, not just store files.",
  },
  {
    question: "How do I start?",
    answer:
      "Start small. Add one photo and write a few sentences about why it matters. Record a short voice note. You do not need to organise everything at once. The library grows naturally, one memory at a time.",
  },
  {
    question: "Is everything private?",
    answer:
      "Yes. Everything you add remains private by default. Only you and anyone you choose to invite can access your collection.",
  },
  {
    question: "How much space do I get?",
    answer:
      "Basic includes 25GB, Standard offers 250GB, and Premium provides 500GB. Enough space to build and expand your family library comfortably.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. You can cancel whenever you choose. Your access remains active until the end of your billing period. There are no contracts and no hidden fees.",
  },
  {
    question: "What happens if I stop paying?",
    answer:
      "Your account is paused, and your data remains safely retained until your plan ends. You can reactivate at any time and continue building your library.",
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
