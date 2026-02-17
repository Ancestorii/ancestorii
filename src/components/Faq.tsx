"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Who was Ancestorii made for?",
    answer:
      "Ancestorii was created for families who want to capture stories, voices, and meaningful moments while life is happening. It is for parents, grandparents, and anyone who wants their family story to remain clear and personal over time.",
  },
  {
    question: "What makes Ancestorii different from cloud storage?",
    answer:
      "Cloud storage keeps files. Ancestorii helps you build a living family library. Instead of scattered folders, you create timelines, albums, written memories, and voice notes that grow into a meaningful collection over time.",
  },
  {
    question: "How do I start building my family library?",
    answer:
      "Start small. Add one photo and explain why it matters. Record a short voice note. Write a memory from today. You do not need to organise everything at once. The library grows naturally, one memory at a time.",
  },
  {
    question: "Is everything I add private?",
    answer:
      "Yes. Everything is private by default. Only you and anyone you choose to invite can access your collection. Nothing is public and nothing is sold.",
  },
  {
    question: "How secure is Ancestorii?",
    answer:
      "Your memories are stored securely using modern encryption standards. Access is protected, and your data remains under your control. Ancestorii is built to protect family memories long term.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. You can cancel whenever you choose. Your access remains active until the end of your billing period. There are no contracts and no hidden fees.",
  },
  {
    question: "How much storage space do I get?",
    answer:
      "Basic includes 25GB, Standard offers 250GB, and Premium provides 500GB. This gives you room to build and expand your living family library comfortably.",
  },
  {
    question: "What happens if I stop paying?",
    answer:
      "Your account is safely paused, and your data remains retained until your plan ends. You can reactivate at any time and continue building your library.",
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
