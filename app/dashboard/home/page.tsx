'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { getBrowserClient } from '@/lib/supabase/browser';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


const Particles = dynamic(() => import('@/components/ParticlesPlatform'), {
  ssr: false,
});

export default function DashboardHomePage() {
  const supabase = getBrowserClient();
  const [homeImages, setHomeImages] = useState<(string | null)[]>([null, null, null]);
  const router = useRouter();

  const DESKTOP_TOAST_KEY = "desktop_recommend_last_seen";
  const DESKTOP_TOAST_RESET_MS = 24 * 60 * 60 * 1000;

  const [showDesktopToast, setShowDesktopToast] = useState(false);

  const [name, setName] = useState<string | null>(null);
  const [typedYours, setTypedYours] = useState('');
  const finalWord = 'for you';

  /* 🔑 Fetch name from Profiles (guaranteed) */
useEffect(() => {
  (async () => {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;

    const uid = user.id;

    // 1️⃣ Try fetch profile
    let { data: profile } = await supabase
      .from('Profiles')
      .select('full_name')
      .eq('id', uid)
      .maybeSingle();

    // 2️⃣ If profile row DOES NOT exist → create it
    if (!profile) {
      const { data: inserted } = await supabase
        .from('Profiles')
        .insert({
          id: uid,
          full_name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            null,
        })
        .select('full_name')
        .single();

      profile = inserted;
    }

    // 3️⃣ Resolve name (profile first, auth fallback)
    const resolvedName =
      profile?.full_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      null;

    if (resolvedName) {
      setName(resolvedName);
    }
  })();
}, [supabase]);

useEffect(() => {
  if (typeof window === 'undefined') return;

  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  if (!isTouchDevice) return;

  const lastSeen = localStorage.getItem(DESKTOP_TOAST_KEY);
  const now = Date.now();

  if (!lastSeen || now - Number(lastSeen) > DESKTOP_TOAST_RESET_MS) {
    setShowDesktopToast(true);
  }
}, []);

  /* Typed animation for "yours" */
  useEffect(() => {
  setTypedYours('');

  let i = 0;
  const speed = 320;
  const startDelayMs = 2000;
  let interval: any;

  const timeout = setTimeout(() => {
    interval = setInterval(() => {
      i++;
      setTypedYours(finalWord.slice(0, i));
      if (i >= finalWord.length) clearInterval(interval);
    }, speed);
  }, startDelayMs);

  return () => {
    clearTimeout(timeout);
    if (interval) clearInterval(interval);
  };
}, []);


const uploadHomeImage = async (file: File, index: number) => {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) return;

  const ext = file.name.split('.').pop();
  const path = `${uid}/home-${index}.${ext}`;

  await supabase.storage
    .from('user-media')
    .upload(path, file, { upsert: true });

  // 🔑 SAVE PATH TO DB
  await supabase
    .from('Profiles')
    .update({ [`home_image_${index}`]: path })
    .eq('id', uid);

  const { data } = await supabase.storage
    .from('user-media')
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  setHomeImages((prev) => {
    const copy = [...prev];
    copy[index] = data?.signedUrl ?? null;
    return copy;
  });
};

useEffect(() => {
  (async () => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id;
    if (!uid) return;

    const { data: profile } = await supabase
      .from('Profiles')
      .select('home_image_0, home_image_1, home_image_2')
      .eq('id', uid)
      .maybeSingle();

    if (!profile) return;

    const images = await Promise.all(
      [0, 1, 2].map(async (i) => {
        const path = profile[`home_image_${i}` as keyof typeof profile];
        if (!path) return null;

        const { data } = await supabase.storage
          .from('user-media')
          .createSignedUrl(path as string, 60 * 60 * 24 * 7);

        return data?.signedUrl ?? null;
      })
    );

    setHomeImages(images);
  })();
}, [supabase]);

const dismissDesktopToast = () => {
  localStorage.setItem(DESKTOP_TOAST_KEY, String(Date.now()));
  setShowDesktopToast(false);
};

  return (
    <div className="relative h-screen overflow-hidden font-[Inter] bg-gradient-to-b from-white via-[#fefaf3] to-[#faf7ed]">
      {/* MOBILE DESKTOP RECOMMENDATION DRAWER */}
{showDesktopToast && (
  <div className="fixed inset-0 z-50 flex items-center justify-center md:hidden">
    {/* backdrop */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

    {/* drawer */}
    <div className="relative bg-white rounded-2xl shadow-2xl px-6 py-5 w-[90%] max-w-sm text-center">
     <h3 className="text-lg font-semibold text-[#1F2837] mb-2">
  You're currently on the Free plan
</h3>

<p className="text-sm text-[#5B6473] leading-relaxed mb-5">
  You can create <strong>1 timeline</strong>, <strong>1 capsule</strong>, and <strong>1 album</strong> on the Free plan.
  <br /><br />
  To create more, please upgrade your plan.
  <br /><br />
  For the best experience when uploading memories and using timelines,
  we recommend continuing on desktop.
</p>
      <button
        onClick={dismissDesktopToast}
        className="w-full px-5 py-3 rounded-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837] font-semibold shadow hover:shadow-md transition"
      >
        Got it
      </button>
    </div>
  </div>
)}
      <Particles />

      <div className="relative z-10 h-full px-10">
        {/* VISUAL ANCHOR */}
        <div
          className="
            absolute
            left-[52%]
            lg:left-[47%]
            -translate-x-1/2
            top-[30%]
            -translate-y-1/2
            w-full
            max-w-6xl
          "
        >
          {/* WELCOME */}
          <motion.p
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.5, duration: 1.6 }}
         className="
         tracking-[0.45em]
         text-lg
         uppercase
         text-[#0f2040]/90
         mb-6
         mt-36 md:mt-12
        "
        >
        Welcome
       </motion.p>

          {/* NAME */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.9,
              duration: 1.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-4xl sm:text-5xl md:text-5xl font-extrabold text-[#0f2040] leading-tight"
          >
            {name}
          </motion.h1>

          {/* GOLD UNDERLINE (TIMELINES ENERGY) */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 160 }}
            transition={{ delay: 1.4, duration: 1.6, ease: 'easeOut'  }}
            className="h-[3px] bg-[#d4af37] rounded-full mt-4 mb-10"
          />

          {/* SUPPORTING COPY */}
<motion.p
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 1.8, duration: 1.8 }}
  className="
    text-base
    md:text-[18px]
    leading-[1.7]
    md:leading-[1.9]
    text-[#2a3550]
    max-w-[92%]
    md:max-w-[720px]
    space-y-4
  "
>
  <span className="block">
    This is your private space.
  </span>

  <span className="block">
    A place to hold the memories that matter to you.
  </span>

  <span className="block">
    Stories. Voices. Moments you never want to lose.
  </span>

  <span className="block">
    Everything you create here becomes part of something lasting.
  </span>

  <span className="block font-semibold text-[#d4af37]">
    Built quietly and intentionally {typedYours}.
  </span>
</motion.p>


<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 2.2, duration: 1.4, ease: 'easeOut' }}
  className="mt-12 flex justify-center md:justify-start"
>
  <button
    onClick={() => router.push('/dashboard/family?add=true')}
    className="
      px-8 py-4
      rounded-full
      bg-gradient-to-r from-[#E6C26E] to-[#F3D99B]
      text-[#1F2837]
      font-semibold
      text-lg
      shadow-md
      hover:shadow-lg
      transition-transform
      hover:scale-[1.03]
      relative
      overflow-hidden
    "
  >
    <span className="relative z-10">Preserve a Loved One</span>
    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shine_3s_linear_infinite]" />
  </button>
</motion.div>

<p className="mt-4 text-xs text-[#6b7280] text-center md:hidden">
  Crafted for deeper storytelling on desktop.
</p>
        </div>
        {/* HOME MEMORY COLLAGE */}
       <div className="hidden lg:block absolute right-[4%] top-[44%] w-[620px] h-[620px] -translate-y-1/2">
       <MemoryDropCard
        index={0}
        image={homeImages[0]}
          placeholder="A moment you’ll never forget. Drag a photo here — maybe a trip that changed you."
          className="top-0 left-10 rotate-[-3deg]"
          onUpload={uploadHomeImage}
          />

<MemoryDropCard
  index={1}
  image={homeImages[1]}
  placeholder="People who matter most. A family moment you always return to."
  className="top-40 right-0 rotate-[2deg]"
  onUpload={uploadHomeImage}
/>

<MemoryDropCard
  index={2}
  image={homeImages[2]}
  placeholder="A milestone worth keeping close. Your first home, achievement, or beginning."
  className="bottom-0 left-24 rotate-[-1deg]"
  onUpload={uploadHomeImage}
/>
       </div>
      </div>
    </div>
  );
}

function MemoryDropCard({
  index,
  image,
  placeholder,
  className,
  onUpload,
}: {
  index: number;
  image: string | null;
  placeholder: string;
  className: string;
  onUpload: (file: File, index: number) => void;
}) {
  return (
    <motion.label
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 2.0, duration: 1.6, ease: 'easeOut' }}
      className={`absolute w-[280px] h-[280px] rounded-2xl bg-white/90 border border-[#d4af37]/40 shadow-lg flex items-center justify-center text-center text-sm text-[#2a3550] cursor-pointer hover:shadow-xl transition ${className}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) onUpload(f, index);
      }}
    >
      {image ? (
        <img
          src={image}
          className="w-full h-full object-cover rounded-xl"
          alt=""
        />
      ) : (
        <div className="px-6 text-center">
  <p className="text-base font-semibold text-[#0f2040] mb-2">
    {placeholder.split('.')[0]}.
  </p>
  <p className="text-sm text-[#6b7280]">
    {placeholder.split('.').slice(1).join('.')}
  </p>
</div>

      )}

      <input
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f, index);
        }}
      />
    </motion.label>
  );
}
