'use client';

import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, UserPlus, Upload, Sparkles, Share2, Lock } from 'lucide-react';
import { useRef, useState } from 'react';


/* -------------------- Motion Variants -------------------- */
const fadeParallax: Variants = {
  hidden: { opacity: 0, y: 50 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.33, 1, 0.68, 1] },
  },
};

/* -------------------- Main Component -------------------- */
export default function Features() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const toggleVideo = () => {
  if (!videoRef.current) return;

  if (videoRef.current.paused) {
    videoRef.current.play();
    setIsPlaying(true);
  } else {
    videoRef.current.pause();
    setIsPlaying(false);
  }
};

  return (
    <section className="bg-[#fff9ee] text-[#0F2040]">
      <div
        className="
          max-w-screen-xl mx-auto px-6 py-24 space-y-24
          sm:space-y-28 md:space-y-32
        "
      >
        {/* STEP 1–2: ABOUT US + HERO VISUAL */}
        <motion.div
          variants={fadeParallax}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
          className="grid lg:grid-cols-[1.2fr_1fr] gap-14 items-center"
        >
          {/* LEFT TEXT */}
          <div className="relative space-y-5">
            <div className="relative inline-block">
              <p className="text-2xl md:text-3xl font-bold text-[#E5C45C] uppercase tracking-wide">
                About Us
              </p>
              <span className="block w-[80px] h-[4px] bg-[#0F2040] mt-1 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
            </div>

           <h2 className="text-[2.6rem] md:text-[3rem] font-extrabold leading-snug">
  A private place for the moments your family will one day wish they could remember.
</h2>



            <p className="text-black text-lg leading-relaxed max-w-2xl">
  Ancestorii helps you preserve memories that photos can’t hold.
  Voices. Stories. Moments in your own words.
  Kept private, personal, and safe — for the people who matter.
</p>


            {/* HERO-STYLE BUTTON (identical to Hero "Get Started") */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: 'easeOut' }}
              className="pt-4"
            >
              <Button
                className="relative overflow-hidden bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837]
                           font-semibold text-base sm:text-lg md:text-xl px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6
                           rounded-full shadow-md transition-transform duration-300 hover:scale-105
                           hover:shadow-[0_0_25px_rgba(212,175,55,0.6)]"
                onClick={() => (window.location.href = '/signup')}
              >
                <span className="relative z-10">Preserve Your Story</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shine_3s_linear_infinite]" />
              </Button>
            </motion.div>
          </div>

          {/* RIGHT IMAGE */}
          <motion.div
            variants={fadeParallax}
            transition={{ delay: 0.1 }}
            className="relative flex justify-center"
          >
            <motion.img
              src="/landing-page-photo.jpg"
              alt="Family sunset"
              loading="lazy"
              className="rounded-2xl shadow-xl border-[2px] border-[#E5C45C] w-full max-w-2xl object-cover"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>

       {/* STEP 3: PLATFORM DEMO VIDEO */}
{/* STEP 3: PLATFORM DEMO VIDEO */}
<motion.div
  variants={fadeParallax}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, amount: 0.05 }}
  className="relative flex flex-col items-center text-center"
>
  {/* Anchor that accounts for sticky header */}
  <div
  id="how-it-works"
  className="
    scroll-mt-48
    sm:scroll-mt-32
    md:scroll-mt-36
    lg:scroll-mt-40
  "
/>

  <div className="mb-8">
    <p className="text-2xl md:text-3xl font-bold text-[#E5C45C] uppercase">
      See It in Action
    </p>
    <span className="block w-[80px] h-[4px] bg-[#0F2040] mt-1 mx-auto rounded-full shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
    <h2 className="mt-4 text-[2.6rem] md:text-[3rem] font-extrabold leading-tight">
      Experience the future of memory preservation.
    </h2>
    <p className="mt-3 text-black text-lg max-w-2xl mx-auto leading-relaxed">
      Watch how Ancestorii lets you preserve your family’s story through timelines,
      albums, and digital capsules — all in one timeless platform.
    </p>
  </div>

  <div className="relative w-full max-w-5xl aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl">
    <video
      ref={videoRef}
      src="/promo.mp4"
      poster="/video-photo.jpg"
      className="object-cover w-full h-full"
      playsInline
      preload="metadata"
      controls
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onEnded={() => setIsPlaying(false)}
    />

    {/* Play overlay (visual only, no toggle logic) */}
   <motion.div
  initial={{ opacity: 1 }}
  animate={{ opacity: isPlaying ? 0 : 1 }}
  transition={{ duration: 0.35, ease: 'easeOut' }}
  className={`absolute inset-0 items-center justify-center bg-black/30 hidden md:flex ${
    isPlaying ? 'pointer-events-none' : 'pointer-events-auto'
  }`}
  onClick={() => videoRef.current?.play()}
>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-6 bg-[#E5C45C]/90 rounded-full shadow-lg cursor-pointer"
      >
        <Play className="w-12 h-12 text-[#0F2040]" />
      </motion.div>
    </motion.div>
  </div>
</motion.div>

        {/* STEP 4: HOW IT WORKS */}
        <motion.div
          variants={fadeParallax}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
          className="text-center space-y-8"
        >
          <div>
            <p className="text-2xl md:text-3xl font-bold text-[#E5C45C] uppercase">
              How It Works
            </p>
            <span className="block w-[80px] h-[4px] bg-[#0F2040] mt-1 mx-auto rounded-full shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
            <h2 className="mt-4 text-[2.6rem] md:text-[3rem] font-extrabold leading-tight text-[#0F2040]">
              Preserve your memories in four simple steps.
            </h2>
            <p className="mt-2 text-[#0F2040]/80 text-lg max-w-2xl mx-auto leading-relaxed">
              Ancestorii makes it effortless to safeguard your family’s history — beautifully, privately, and securely.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mt-10">
            {[
              {
                number: '1',
                icon: <UserPlus className="w-8 h-8 text-[#E5C45C]" />,
                title: 'Create Your Account',
                desc: 'Start by setting up your private family space.',
              },
              {
                number: '2',
                icon: <Upload className="w-8 h-8 text-[#E5C45C]" />,
                title: 'Upload Memories',
                desc: 'Add photos, videos, or voice notes securely.',
              },
              {
                number: '3',
                icon: <Sparkles className="w-8 h-8 text-[#E5C45C]" />,
                title: 'Bring Memories Alive',
                desc: 'Create your timeline, albums, and capsules — all connected to your family legacy.',
              },
              {
                number: '4',
                icon: <Lock className="w-8 h-8 text-[#E5C45C]" />,
                title: 'Protect Your Legacy',
                desc: 'Your story is safeguarded, private, and preserved for generations to come.',
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                className="bg-white border border-[#E5C45C]/30 rounded-2xl p-8 shadow-[0_8px_25px_rgba(15,32,64,0.08)] hover:shadow-[0_8px_35px_rgba(229,196,92,0.25)] transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="flex items-center justify-center bg-[#0F2040] text-white w-12 h-12 rounded-full font-bold mb-4">
                  {step.number}
                </div>
                <div className="mb-3">{step.icon}</div>
                <h3 className="text-xl font-bold text-[#0F2040] mb-1">{step.title}</h3>
                <p className="text-[#0F2040]/70 text-base leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* STEP 5: OUR MISSION */}
        <motion.div
          variants={fadeParallax}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
          className="text-center max-w-4xl mx-auto space-y-6"
        >
          <h2 className="text-[2.6rem] md:text-[3rem] font-extrabold leading-tight relative inline-block">
            Our Mission
            <span className="block mx-auto w-[120px] h-[4px] bg-[#E5C45C] mt-4 rounded-full shadow-[0_0_10px_rgba(229,196,92,0.7)]" />
          </h2>

          <p className="text-lg text-[#0F2040]/80 leading-relaxed">
            Ancestorii isn’t just about saving memories — it’s about protecting identity.
            We believe every family deserves a space where their story continues long after they’re gone. Our mission is to make legacy preservation effortless, meaningful, and everlasting.
          </p>

          {/* HERO-STYLE BUTTON (identical to Hero "Get Started") */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease: 'easeOut' }}
            className="flex justify-center pt-8"
          >
            <Button
              className="relative overflow-hidden bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837]
                         font-semibold text-base sm:text-lg md:text-xl px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6
                         rounded-full shadow-md transition-transform duration-300 hover:scale-105
                         hover:shadow-[0_0_25px_rgba(212,175,55,0.6)]"
              onClick={() => (window.location.href = '/signup')}
            >
              <span className="relative z-10">Secure Your Memories Forever</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shine_3s_linear_infinite]" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
