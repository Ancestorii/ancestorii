"use client";

import { motion } from "framer-motion";
import { HandHeart } from "lucide-react";

export default function LovedOneEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative z-10 mx-auto flex min-h-[calc(100vh-110px)] max-w-[1700px] items-center px-4 pb-10 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-20 lg:pr-32 lg:pt-20"
    >
      {/* MOBILE: ONE SINGLE BOX ONLY */}
      <div className="relative w-full lg:hidden overflow-hidden rounded-[clamp(20px,4vw,26px)] border border-[#d7bf91] bg-[linear-gradient(180deg,#fffdf9_0%,#f8f1e5_100%)] p-[clamp(1rem,3.5vw,1.25rem)] shadow-[0_18px_42px_rgba(22,18,12,0.10)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-110px] top-[10px] h-[250px] w-[250px] rounded-full bg-gradient-to-tr from-[#d4af37]/10 via-[#e7c76d]/6 to-transparent blur-3xl" />
          <div className="absolute right-[-90px] top-[40px] h-[220px] w-[220px] rounded-full bg-gradient-to-br from-[#c9d8f0]/10 via-[#102347]/4 to-transparent blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-[1px] bg-[linear-gradient(90deg,rgba(212,175,55,0),rgba(212,175,55,0.55),rgba(212,175,55,0))]" />
        </div>

        <div className="relative flex items-center justify-center gap-3">
          <div className="h-[2px] w-10 rounded-full bg-[#d4af37]" />
          <p className="text-[clamp(10px,1.8vw,11px)] font-bold uppercase tracking-[0.28em] text-[#8f774e]">
            Loved Ones
          </p>
        </div>

        <h2 className="relative mt-4 text-center font-serif text-[clamp(1.6rem,6.5vw,2.4rem)] leading-[0.98] text-[#102347]">
          Start with one person.
          <br />
          <span className="italic text-[#c99732]">Keep their story close.</span>
        </h2>

        <p className="relative mx-auto mt-[clamp(0.75rem,2.5vw,1rem)] max-w-[520px] text-center text-[clamp(13px,2.3vw,15px)] leading-[1.8] text-[#42536d]">
          Add someone you love and begin building a beautiful place for their
          memories and legacy.
        </p>

        <div className="relative mt-[clamp(1rem,3.5vw,1.5rem)]">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-[clamp(2.5rem,7vw,3rem)] w-[clamp(2.5rem,7vw,3rem)] rounded-full bg-[linear-gradient(135deg,#E6C26E_0%,#C8A557_100%)]" />
            <div className="flex-1">
              <div className="h-3 w-24 rounded-full bg-[#cdb78f]" />
              <div className="mt-2 h-2.5 w-16 rounded-full bg-[#e2d5bf]" />
            </div>
          </div>

          <div className="h-[clamp(7rem,22vw,9rem)] rounded-[clamp(12px,2vw,16px)] bg-[linear-gradient(135deg,#f2e3b8_0%,#e8d093_45%,#d8b45e_100%)]" />

          <p className="mt-3 font-serif text-[clamp(0.9rem,2.8vw,1.08rem)] leading-[1.08] text-[#16120C]">
            A life worth
            <span className="italic text-[#b67f18]"> remembering.</span>
          </p>

          <p className="mt-2 text-[clamp(12px,2.1vw,14px)] leading-[1.7] text-[#4f4334]">
            The first loved one you add begins your private family library.
          </p>
        </div>

        <div className="relative mt-[clamp(1rem,3vw,1.25rem)] flex flex-col items-center gap-3">
          <button
            onClick={onAdd}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#d4af37] to-[#ebc96e] px-6 py-3 text-[clamp(13px,2.2vw,14px)] font-semibold text-[#1f2837] shadow-[0_12px_28px_rgba(212,175,55,0.18)] transition hover:-translate-y-[1px]"
          >
            <HandHeart size={16} />
            Add Your First Loved One
          </button>

          <div className="h-[68px] w-full" />
        </div>
      </div>

      {/* DESKTOP: SPLIT LAYOUT */}
      <div className="relative hidden w-full overflow-hidden rounded-[clamp(24px,2.5vw,32px)] border border-[#d7bf91] bg-[linear-gradient(180deg,#fffdf9_0%,#f6eee0_100%)] shadow-[0_18px_42px_rgba(22,18,12,0.12)] lg:block">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-110px] top-[10px] h-[250px] w-[250px] rounded-full bg-gradient-to-tr from-[#d4af37]/10 via-[#e7c76d]/6 to-transparent blur-3xl" />
          <div className="absolute right-[-90px] top-[40px] h-[220px] w-[220px] rounded-full bg-gradient-to-br from-[#c9d8f0]/10 via-[#102347]/4 to-transparent blur-3xl" />
          <div className="absolute left-[18%] top-[65%] h-[140px] w-[140px] rounded-full bg-white/70 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-[1px] bg-[linear-gradient(90deg,rgba(212,175,55,0),rgba(212,175,55,0.55),rgba(212,175,55,0))]" />
        </div>

        <div className="relative grid gap-[clamp(2rem,3vw,2.5rem)] px-[clamp(2rem,3vw,3.5rem)] py-[clamp(2.5rem,3.5vw,4rem)] lg:grid-cols-[minmax(0,1.1fr)_clamp(340px,30vw,420px)] lg:items-center">
          <div className="w-full text-left">
            <div className="flex items-center justify-start gap-3">
              <div className="h-[2px] w-12 rounded-full bg-[#d4af37]" />
              <p className="text-[clamp(11px,0.9vw,12px)] font-bold uppercase tracking-[0.32em] text-[#8f774e]">
                Loved Ones
              </p>
            </div>

            <h2 className="mt-6 font-serif text-[clamp(2.6rem,3.8vw,4.2rem)] leading-[0.96] text-[#102347]">
              Start with one person.
              <br />
              <span className="italic text-[#c99732]">Keep their story close.</span>
            </h2>

            <p className="mt-[clamp(1rem,1.5vw,1.5rem)] max-w-[620px] text-[clamp(15px,1.25vw,18px)] leading-[1.95] text-[#42536d]">
              Add the people you love and begin building a place for their memories,
              milestones, and legacy to live beautifully for years to come.
            </p>

            <div className="mt-[clamp(1.5rem,2vw,2rem)] flex flex-col gap-3 sm:flex-row sm:justify-start">
              <button
                onClick={onAdd}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#d4af37] to-[#ebc96e] px-[clamp(1.25rem,2vw,1.75rem)] py-3 text-[clamp(14px,1.1vw,15px)] font-semibold text-[#1f2837] shadow-[0_12px_28px_rgba(212,175,55,0.18)] transition hover:-translate-y-[1px]"
              >
                <HandHeart size={17} />
                Add Your First Loved One
              </button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[420px]">
            <div className="relative overflow-hidden rounded-[clamp(20px,2vw,26px)] border border-[#d7bf91] bg-[linear-gradient(180deg,#fffdf9_0%,#f8f1e5_100%)] p-[clamp(1rem,1.5vw,1.25rem)] shadow-[0_18px_42px_rgba(22,18,12,0.12)]">
              <div className="pointer-events-none absolute right-[-35px] top-[-35px] h-[110px] w-[110px] rounded-full bg-[#d4af37]/8 blur-3xl" />

              <div className="relative">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-[clamp(3rem,4vw,3.5rem)] w-[clamp(3rem,4vw,3.5rem)] rounded-full bg-[linear-gradient(135deg,#E6C26E_0%,#C8A557_100%)]" />
                  <div className="flex-1">
                    <div className="h-3 w-28 rounded-full bg-[#cdb78f]" />
                    <div className="mt-2 h-2.5 w-20 rounded-full bg-[#e2d5bf]" />
                  </div>
                </div>

                <div className="rounded-[clamp(16px,1.5vw,20px)] border border-[#e7d7bb] bg-white/80 p-[clamp(0.75rem,1.2vw,1rem)]">
                  <div className="h-[clamp(8rem,12vw,10rem)] rounded-[clamp(12px,1.2vw,16px)] bg-[linear-gradient(135deg,#f2e3b8_0%,#e8d093_45%,#d8b45e_100%)]" />
                  <p className="mt-[clamp(0.75rem,1vw,1rem)] font-serif text-[clamp(1rem,1.1vw,1.15rem)] leading-[1.05] text-[#16120C]">
                    A life worth
                    <span className="italic text-[#b67f18]"> remembering.</span>
                  </p>
                  <p className="mt-2 text-[clamp(13px,1vw,14px)] leading-[1.75] text-[#4f4334]">
                    The first loved one you add will begin shaping your private family library.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-6 rounded-2xl border border-[#d7bf91] bg-white px-4 py-3 shadow-[0_12px_30px_rgba(22,18,12,0.10)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a6781f]">
                First Chapter
              </p>
              <p className="mt-1 font-serif text-[1rem] leading-none text-[#16120C]">
                Waiting to begin
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}