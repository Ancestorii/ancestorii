"use client";

import { useState } from "react";
const faqs = [
  {
    question: "Who is Ancestorii really for?",
    answer:
      "For families who do not want their history scattered across phones or lost when someone upgrades a device. Parents, grandparents, and anyone who understands that stories disappear quietly if they are not preserved properly.",
  },
  {
    question: "How is this different from Google Photos or cloud storage?",
    answer:
      "Cloud storage keeps files. Ancestorii gives those files meaning. Timelines follow a life. Albums organise chapters. Voice capsules preserve tone and personality. This is a structured living library, not a storage folder.",
  },
  {
    question: "How do people usually begin?",
    answer:
      "Most start small. One person. One milestone. One memory explained properly. The library grows naturally from there. It is not about uploading everything at once. It is about protecting meaning while it still exists.",
  },
  {
    question: "Is my family library private?",
    answer:
      "Yes. Everything is private by default. There are no public feeds, no searchable profiles, and nothing visible outside the people you personally invite.",
  },
  {
    question: "Who owns the content I upload?",
    answer:
      "You do. Always. Your memories, recordings, and photographs remain yours. Ancestorii simply provides the structure and protection to preserve them.",
  },
  {
    question: "What happens if I stop paying?",
    answer:
      "Nothing is deleted. Your library remains accessible. If you exceed free plan limits, new creation pauses until you upgrade again. Your archive stays intact.",
  },
  {
    question: "Can other family members contribute?",
    answer:
      "Shared contributions are coming soon. For now, each library is owned and managed by one account to maintain simplicity and privacy.",
  },
  {
    question: "Why include voice recordings?",
    answer:
      "Because voice carries presence. Tone, humour, warmth. The things photographs cannot hold. Years from now, hearing someone speak matters more than seeing another picture.",
  },
  {
    question: "Is this built for long term preservation?",
    answer:
      "Yes. The structure, privacy model, and continuity approach are designed so your family library remains accessible and meaningful across generations.",
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
