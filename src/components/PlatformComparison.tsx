'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Library, ShieldCheck, Sparkles, XCircle, CheckCircle2 } from 'lucide-react';

type Category = 'storage' | 'social' | 'genealogy';

const categories: { id: Category; label: string }[] = [
  { id: 'storage', label: 'Storage' },
  { id: 'social', label: 'Social' },
  { id: 'genealogy', label: 'Genealogy' },
];

const content = {
  storage: {
    leftTitle: 'Storage Platforms',
    focus: 'Files and Folders',
    competitors: ['Dropbox', 'Google Drive', 'iCloud'],
    leftText:
      'Great at keeping files safe and organised. But they stop at folders. They do not help you tell the story behind what you upload.',
    rightText:
      'Ancestorii gives structure to a life. Timelines follow a person clearly. Albums feel like chapters. Voice captures presence and personality, not just files.',
  },
  social: {
    leftTitle: 'Social Platforms',
    focus: 'Engagement and Feeds',
    competitors: ['Instagram', 'Facebook', 'Shared Albums'],
    leftText:
      'Built for sharing and scrolling. Everything moves fast. What matters today disappears tomorrow.',
    rightText:
      'Ancestorii is private from the start. No feeds. No algorithms. Just a calm space built to hold meaning for the long term.',
  },
  genealogy: {
    leftTitle: 'Genealogy Platforms',
    focus: 'Records and Lineage',
    competitors: ['Ancestry', 'MyHeritage'],
    leftText:
      'Excellent for tracing names and dates. But often focused on documents rather than the personality behind them.',
    rightText:
      'Ancestorii keeps the voice, the milestones and the character. Not just where someone came from, but who they really were.',
  },
};

export default function PlatformComparison() {
  const [active, setActive] = useState<Category>('storage');

  return (
    <section className="relative w-full bg-gradient-to-b from-[#f5f7fa] to-[#eef2f6] py-20 sm:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">

        {/* Headline */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-[#0b1220] leading-tight">
  Not storage. Not social.
  <span className="block mt-3 text-[#b8892e] font-semibold">
    Something built for your family.
  </span>
</h2>
          <p className="mt-6 text-lg text-slate-700 leading-relaxed">
            Most platforms hold files or broadcast moments. <span className="font-semibold text-slate-900">Ancestorii</span> keeps the meaning behind them.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex items-center bg-white/70 backdrop-blur p-1 rounded-full border border-slate-300 shadow-sm">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={`relative px-6 py-2 text-sm font-semibold transition-colors duration-300 ${
                  active === cat.id ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {active === cat.id && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 bg-[#0b1220] rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">

          {/* Left Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col justify-between bg-white border border-slate-300 rounded-3xl p-8 sm:p-10 shadow-[0_15px_35px_-15px_rgba(15,23,42,0.12)]"
            >
              <div>
                <div className="flex items-center gap-2 mb-6 text-slate-500">
                  <XCircle className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-widest font-semibold">
                    The Standard Way
                  </span>
                </div>

                <h3 className="text-2xl font-semibold text-[#0b1220] mb-2">
                  {content[active].leftTitle}
                </h3>
                <p className="text-[#b8892e] font-medium text-sm mb-6">
                  Focus: {content[active].focus}
                </p>

                <p className="text-slate-700 leading-relaxed mb-8">
                  {content[active].leftText}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {content[active].competitors.map((c, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="relative flex flex-col justify-between bg-white border border-[#b8892e]/50 rounded-3xl p-8 sm:p-10 shadow-[0_30px_60px_-20px_rgba(184,137,46,0.25)]"
            >
              <div>
                <div className="flex items-center gap-2 mb-6 text-[#b8892e]">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-widest font-semibold">
                    The Ancestorii Way
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-[#b8892e]/10 rounded-xl">
                    <Library className="w-7 h-7 text-[#b8892e]" />
                  </div>
                  <h3 className="text-3xl font-serif font-semibold text-[#0b1220]">
                    Ancestorii
                  </h3>
                </div>

                <p className="text-xl leading-relaxed text-slate-800 font-medium mb-10">
                  {content[active].rightText}
                </p>
              </div>

              <div className="flex gap-6 border-t border-slate-200 pt-8">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#b8892e]">
                  <ShieldCheck className="w-5 h-5" />
                  Private
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#b8892e]">
                  <Sparkles className="w-5 h-5" />
                  Intentional
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </section>
  );
}