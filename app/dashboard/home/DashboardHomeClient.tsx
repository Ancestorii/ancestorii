'use client';

import { getBrowserClient } from '@/lib/supabase/browser';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function DashboardHomeClient({
  name,
  homeImages: initialImages,
}: {
  name: string | null;
  homeImages: (string | null)[];
}) {
  const supabase = getBrowserClient();
  const [homeImages, setHomeImages] = useState(initialImages);
  const router = useRouter();

  const DESKTOP_TOAST_KEY = "desktop_recommend_last_seen";
  const DESKTOP_TOAST_RESET_MS = 24 * 60 * 60 * 1000;

  const [showDesktopToast, setShowDesktopToast] = useState(false);

  const hasLongName =
  !!name && name.trim().split(/\s+/).length > 2;


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
     <h3 className="text-lg font-semibold text-[#1F2837] mb-3">
  Best experienced on desktop
</h3>

<p className="text-sm text-[#5B6473] leading-relaxed mb-5">
  For the best experience when creating timelines and uploading memories,
  we recommend continuing on{' '}
  <span className="font-semibold text-[#1F2837]">desktop</span>
  {' '}or{' '}
  <span className="font-semibold text-[#1F2837]">laptop</span>.
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

      <div className="relative z-10 h-full px-10">
        {/* VISUAL ANCHOR */}
        <div
  className={`
    absolute
    left-[52%]
    lg:left-[47%]
    -translate-x-1/2
    ${hasLongName ? 'top-[34%]' : 'top-[30%]'}
    -translate-y-1/2
    w-full
    max-w-6xl
  `}
>
  {/* WELCOME */}
<p className="tracking-[0.45em] text-lg uppercase text-[#0f2040]/90 mb-6 mt-36 md:mt-12">
  Welcome
</p>


          {/* NAME */}
          <h1
            className="text-4xl sm:text-5xl md:text-5xl font-extrabold text-[#0f2040] leading-tight"
          >
            {name}
          </h1>

          {/* GOLD UNDERLINE (TIMELINES ENERGY) */}
          <div className="h-[3px] bg-[#d4af37] rounded-full mt-4 mb-10 w-[160px]" />

          {/* SUPPORTING COPY */}
<p
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
   Built quietly and intentionally for you.
  </span>
</p>


<div
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
</div>

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
 const [loaded, setLoaded] = useState(false);
  return (
  <label
  className={`absolute w-[280px] h-[280px] overflow-hidden rounded-2xl bg-[#f3ede3] border border-[#d4af37]/40 shadow-lg flex items-center justify-center text-center text-sm text-[#2a3550] cursor-pointer hover:shadow-xl transition ${className}`}
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) onUpload(f, index);
  }}
>
    {image ? (
      <div className="relative w-full h-full">
        <Image
  src={image}
  alt=""
  fill
  sizes="280px"
  className={`object-cover rounded-xl transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
  priority={index === 0}
  onLoadingComplete={() => setLoaded(true)}
/>
      </div>
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
  </label>
);
}
