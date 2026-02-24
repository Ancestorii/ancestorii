"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Who is Ancestorii really for?",
    answer:
      "For families who do not want their history scattered across devices or lost over time. Parents, grandparents, and anyone who understands that stories disappear quietly if they are not preserved.",
  },
  {
    question: "How is this different from cloud storage?",
    answer:
      "Cloud storage keeps files. Ancestorii gives those files structure. Timelines follow a life. Albums gather chapters. Capsules preserve voice and meaning. It is a living library, not a folder system.",
  },
  {
    question: "How do people usually begin?",
    answer:
      "Most start with one person. One milestone. One memory explained properly. The library grows naturally from there. It is not about uploading everything at once. It is about protecting meaning while it still exists.",
  },
  {
    question: "Is my family archive private?",
    answer:
      "Yes. Everything is private by default. There are no public feeds. No visibility outside the people you personally invite.",
  },
  {
    question: "What happens if I stop paying?",
    answer:
      "You keep access to what you created. If your library exceeds the free plan limits, new creation pauses — but nothing is deleted. Your archive remains intact.",
  },
  {
    question: "Can other family members contribute?",
    answer:
      "Yes. You can invite trusted loved ones to add names, stories, and context. Different generations hold different pieces of the story. Inviting them prevents those pieces from disappearing.",
  },
  {
    question: "Why include voice recordings?",
    answer:
      "Because voice carries presence. Tone, humour, warmth — the things photographs cannot hold. Capsules exist for the parts of a person that matter most later.",
  },
  {
    question: "Is this built for long-term preservation?",
    answer:
      "Yes. The structure, privacy model, and continuity approach are designed so your family library can remain accessible and meaningful across generations.",
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
