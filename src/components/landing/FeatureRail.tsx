'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Particles from '@/components/Particles';
import { Button } from '@/components/ui/button';
import LiftIn from '@/components/LiftIn';

/* ---------------- TYPES ---------------- */
type Feature = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  overlay?: 'timeline' | 'albums' | 'capsules' | 'loved';
};

/* ---------------- GOLD DUST ---------------- */
function GoldDust() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(212,175,55,0.16),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(212,175,55,0.10),transparent_65%)]" />
    </div>
  );
}

/* ---------------- IMAGE STAGE ---------------- */
function ImageStage({
  image,
  overlay,
}: {
  image: string;
  overlay?: Feature['overlay'];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={`
        relative w-full
        ${overlay === 'loved' ? 'lg:scale-[1.08]' : ''}
      `}
    >
      {/* gold glow */}
      <div className="absolute -inset-24 blur-[140px] bg-[radial-gradient(circle_at_30%_30%,rgba(212,175,55,0.25),transparent_65%)]" />

      <div className="relative rounded-[24px] sm:rounded-[28px] overflow-hidden bg-[#0b1220] shadow-[0_60px_160px_rgba(0,0,0,0.45)] sm:shadow-[0_120px_260px_rgba(0,0,0,0.65)]
">
        <div className="
  absolute inset-0
  bg-[radial-gradient(circle_at_center,transparent_65%,rgba(0,0,0,0.35))]
  sm:bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.55))]
" />


        {/* TIMELINE: separate mobile + desktop images */}
        {overlay === 'timeline' ? (
          <>
            {/* Mobile (cropped image) */}
            <img
              src="/timeline.png"
              alt=""
              className="block sm:hidden relative z-10 w-full object-cover brightness-[0.92]"
            />

            {/* Desktop (full timeline) */}
            <img
              src="/timeline.png"
              alt=""
              className="hidden sm:block relative z-10 w-full object-cover brightness-[0.92]"
            />
          </>
        ) : (
          /* All other images */
          <img
            src={image}
            alt=""
            className="relative z-10 w-full object-cover brightness-[0.92]"
          />
        )}

        <div className="absolute inset-0 ring-1 ring-white/10" />
        <Overlay overlay={overlay} />
      </div>
    </motion.div>
  );
}


/* ---------------- OVERLAYS ---------------- */
function Overlay({ overlay }: { overlay?: Feature['overlay'] }) {
  if (!overlay) return null;

  const glass =
    'backdrop-blur-xl bg-white/10 border border-white/15 shadow-[0_30px_100px_rgba(0,0,0,0.45)]';

  if (overlay === 'timeline')
    return (
      <div className={`absolute bottom-10 right-10 rounded-2xl px-6 py-4 ${glass}`}>
        <p className="text-[#D4AF37] text-sm font-semibold">Pinned to time</p>
        <p className="text-white/60 text-xs mt-1">Photos · notes · voice</p>
      </div>
    );

  if (overlay === 'albums')
    return (
      <div className={`absolute top-10 left-10 rounded-2xl px-6 py-4 ${glass}`}>
        <p className="text-[#D4AF37] text-sm font-semibold">Curated albums</p>
        <p className="text-white/60 text-xs mt-1">Grouped by meaning</p>
      </div>
    );

  if (overlay === 'capsules')
    return (
      <div className={`absolute bottom-10 left-10 rounded-2xl px-6 py-4 ${glass}`}>
        <p className="text-[#D4AF37] text-sm font-semibold">Sealed message</p>
        <p className="text-white/60 text-xs mt-1">Opened when you decide</p>
      </div>
    );

  if (overlay === 'loved')
    return (
      <div className="absolute bottom-10 right-10 flex gap-3">
        {['Mum', 'Dad', 'Nan'].map((t) => (
          <span
            key={t}
            className={`px-4 py-2 rounded-full text-xs font-semibold text-white ${glass}`}
          >
            {t}
          </span>
        ))}
      </div>
    );

  return null;
}

/* ---------------- MAIN SECTION ---------------- */
export default function FeatureRail() {
  const features = useMemo<Feature[]>(
    () => [
      {
        eyebrow: 'A LIFE, IN SEQUENCE',
        title: 'Every moment has its place in time.',
        description:
          'Your story organised chronologically. Photos, notes, and voice recordings anchored to the moments they belong.',
        image: '/timeline.png',
        overlay: 'timeline',
      },
      {
        eyebrow: 'MY LOVED ONES',
        title: 'Every memory has a face behind it.',
        description:
          'Link moments to the people who mattered so memories never lose their human meaning.',
        image: '/loved.png',
        overlay: 'loved',
      },
      {
        eyebrow: 'LEGACY CAPSULES',
        title: 'Some memories are meant to wait.',
        description:
          'Write messages. Record your voice. Seal them until the moment you choose.',
        image: '/capsule.png',
        overlay: 'capsules',
      },
      {
        eyebrow: 'CURATED MEMORIES',
        title: 'Some moments are not part of a story.',
        description:
          'They are the story. Group memories by meaning instead of dates. Chapters of your life, kept together.',
        image: '/album.png',
        overlay: 'albums',
      },
    ],
    []
  );

  return (
    <section className="relative bg-[#0C1424] text-white overflow-hidden isolate">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Particles />
      </div>

      <GoldDust />

      <div
        className="
          relative z-10
          max-w-screen-xl mx-auto
          px-6
          py-28 sm:py-32 lg:py-40
          space-y-32 sm:space-y-40 lg:space-y-56
        "
      >

        {/* HUMAN OPENING */}
        <LiftIn>
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <p className="text-white/50 text-xl">
              Most people already have the photos.
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#D4AF37]">
              What they lose is everything around them.
            </h2>
            <p className="text-white/60 text-xl">
              Who was there. Why it mattered. What was said.
            </p>
          </div>
        </LiftIn>

        {/* FEATURE 1 */}
        <LiftIn>
          <div className="space-y-16 text-center">
            <div className="inline-flex flex-col items-center gap-3">
              <p className="text-base md:text-lg tracking-[0.25em] uppercase font-semibold text-[#D4AF37]">
                {features[0].eyebrow}
              </p>
              <span className="w-24 h-[3px] bg-[#D4AF37] rounded-full shadow-[0_0_12px_rgba(212,175,55,0.6)]" />
            </div>

            <h3 className="text-5xl font-extrabold text-[#D4AF37]">
              {features[0].title}
            </h3>

            <p className="text-white/70 text-2xl max-w-3xl mx-auto">
              {features[0].description}
            </p>

            <ImageStage image={features[0].image} overlay={features[0].overlay} />
          </div>
        </LiftIn>

        {/* FEATURE 2 — CONTRAST */}
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <LiftIn>
            <div className="space-y-8">
              <div className="inline-flex flex-col items-start gap-3">
                <p className="text-base md:text-lg tracking-[0.25em] uppercase font-semibold text-[#D4AF37]">
                  {features[1].eyebrow}
                </p>
                <span className="w-24 h-[3px] bg-[#D4AF37] rounded-full shadow-[0_0_12px_rgba(212,175,55,0.6)]" />
              </div>

              <h3 className="text-4xl md:text-5xl font-extrabold text-[#D4AF37]">
                {features[1].title}
              </h3>

              <p className="text-white/70 text-xl">
                {features[1].description}
              </p>
            </div>
          </LiftIn>

          <ImageStage image={features[1].image} overlay={features[1].overlay} />
        </div>

        {/* HUMAN INTERRUPTION */}
        <LiftIn>
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-white/50 text-lg">Years from now,</p>
            <p className="text-2xl md:text-3xl font-semibold text-white">
              these details will matter more than the photo itself.
            </p>
            <p className="text-white/60 text-lg">
              This is where they live.
            </p>
          </div>
        </LiftIn>

        {/* FEATURE 3 */}
        <div className="space-y-16 text-center">
          <div className="inline-flex flex-col items-center gap-3">
            <p className="text-base md:text-lg tracking-[0.25em] uppercase font-semibold text-[#D4AF37]">
              {features[2].eyebrow}
            </p>
            <span className="w-24 h-[3px] bg-[#D4AF37] rounded-full shadow-[0_0_12px_rgba(212,175,55,0.6)]" />
          </div>

          <h3 className="text-5xl font-extrabold text-[#D4AF37]">
            {features[2].title}
          </h3>

          <p className="text-white/70 text-2xl max-w-3xl mx-auto">
            {features[2].description}
          </p>

          <ImageStage image={features[2].image} overlay={features[2].overlay} />
        </div>

        {/* FEATURE 4 */}
        <div className="space-y-16 text-center">
          <div className="inline-flex flex-col items-center gap-3">
            <p className="text-base md:text-lg tracking-[0.25em] uppercase font-semibold text-[#D4AF37]">
              {features[3].eyebrow}
            </p>
            <span className="w-24 h-[3px] bg-[#D4AF37] rounded-full shadow-[0_0_12px_rgba(212,175,55,0.6)]" />
          </div>

          <h3 className="text-5xl font-extrabold text-[#D4AF37]">
            {features[3].title}
          </h3>

          <p className="text-white/70 text-2xl max-w-3xl mx-auto">
            {features[3].description}
          </p>

          <ImageStage image={features[3].image} overlay={features[3].overlay} />
        </div>

        {/* RESOLUTION */}
        <LiftIn>
          <div className="text-center space-y-10">
            <p className="text-white/60 text-xl">
              Some memories fade quietly.
            </p>
            <h3 className="text-4xl md:text-5xl font-extrabold text-[#D4AF37]">
              This is where they don’t.
            </h3>
            <Button
              className="bg-gradient-to-r from-[#D4AF37] to-[#F3D99B] text-[#0C1424] text-lg px-10 py-6 rounded-full font-semibold hover:scale-105 transition"
              onClick={() => (window.location.href = '/signup')}
            >
              Start your private timeline
            </Button>
          </div>
        </LiftIn>

      </div>
    </section>
  );
}
