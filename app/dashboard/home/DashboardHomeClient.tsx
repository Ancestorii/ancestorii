'use client';

import { getBrowserClient } from '@/lib/supabase/browser';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  BookOpen,
  Heart,
  Image as ImageIcon,
  Mic,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Library,
  Clock3,
  Calendar,
  Package,
  Plus,
  ShieldCheck,
  ScrollText,
  HandHeart,
  LayoutGrid,
} from 'lucide-react';

export default function DashboardHomeClient({
  name,
  homeImages: initialImages,
  email,
}: {
  name: string | null;
  homeImages: (string | null)[];
  email: string | null;
}) {
  const supabase = getBrowserClient();
  const [homeImages, setHomeImages] = useState(initialImages);
  const [displayName, setDisplayName] = useState(name);
  const router = useRouter();
  const [activeMemory, setActiveMemory] = useState(0)

const nextMemory = () => {
  setActiveMemory((prev) => (prev + 1) % 5)
}

const prevMemory = () => {
  setActiveMemory((prev) => (prev - 1 + 5) % 5)
}
  const DESKTOP_TOAST_KEY = 'desktop_recommend_last_seen';
  const DESKTOP_TOAST_RESET_MS = 24 * 60 * 60 * 1000;

  const [showDesktopToast, setShowDesktopToast] = useState(false);

  const firstName =
    displayName?.trim()?.split(/\s+/)?.[0] ||
    name?.trim()?.split(/\s+/)?.[0] ||
    'there';

  const pinnedCount = useMemo(
    () => homeImages.filter(Boolean).length,
    [homeImages]
  );

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

  useEffect(() => {
    if (displayName) return;

    const loadName = async () => {
      const { data } = await supabase
        .from('Profiles')
        .select('full_name')
        .single();

      if (data?.full_name) {
        setDisplayName(data.full_name);
      }
    };

    loadName();
  }, [displayName, supabase]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!sessionStorage.getItem('signup_tracked')) {
      if ((window as any).fbq) {
        (window as any).fbq('track', 'CompleteRegistration', {
          em: email,
        });
      }

      if ((window as any).rdt) {
        (window as any).rdt('track', 'CompleteRegistration');
      }

      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: 'signup_complete',
      });

      sessionStorage.setItem('signup_tracked', '1');
    }
  }, [email]);

  const uploadHomeImage = async (file: File, index: number) => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id;
    if (!uid) return;

    const ext = file.name.split('.').pop();
    const path = `${uid}/home-${index}-${Date.now()}.${ext}`;

    await supabase.storage.from('user-media').upload(path, file, { upsert: true });

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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.08),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(15,32,64,0.06),_transparent_24%),linear-gradient(to_bottom,_#fcfaf5,_#f7f2e8_42%,_#f8f4ec_100%)] font-[Inter]">
      {/* ambient glow */}
      <div className="pointer-events-none absolute left-[-160px] top-[-120px] h-[360px] w-[360px] rounded-full bg-[#d4af37]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-120px] top-[120px] h-[320px] w-[320px] rounded-full bg-[#102347]/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />

      {/* MOBILE DESKTOP RECOMMENDATION DRAWER */}
      {showDesktopToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <div className="relative w-[90%] max-w-sm overflow-hidden rounded-[24px] border border-white/60 bg-white/95 px-6 py-5 text-center shadow-[0_30px_80px_rgba(15,32,64,0.20)]">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#d4af37] via-[#f4dd9b] to-[#d4af37]" />

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f0dc] text-[#102347] shadow-sm">
              <Sparkles size={20} />
            </div>

            <h3 className="mb-3 text-lg font-semibold text-[#1F2837]">
              Best experienced on laptop
            </h3>

            <p className="mb-5 text-sm leading-relaxed text-[#5B6473]">
              For the best experience when creating timelines and uploading memories,
              we recommend continuing on{' '}
              <span className="font-semibold text-[#1F2837]">desktop</span> or{' '}
              <span className="font-semibold text-[#1F2837]">laptop</span>.
            </p>

            <button
              onClick={dismissDesktopToast}
              className="w-full rounded-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] px-5 py-3 font-semibold text-[#1F2837] shadow-[0_12px_30px_rgba(212,175,55,0.25)] transition hover:shadow-[0_16px_34px_rgba(212,175,55,0.30)]"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-[1750px] px-4 pt-4 pb-16 sm:px-8 sm:pt-6 lg:px-12 lg:pt-8 2xl:px-16">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[34px] border border-[#d4af37]/18 bg-white/65 shadow-[0_30px_100px_rgba(16,35,71,0.10)] backdrop-blur-xl">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(255,255,255,0.38))]" />
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
          <div className="absolute left-0 top-0 h-full w-[42%] bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.10),transparent_58%)]" />
          <div className="absolute bottom-0 right-0 h-full w-[45%] bg-[radial-gradient(circle_at_bottom_right,rgba(15,32,64,0.08),transparent_60%)]" />

          <div className="relative grid grid-cols-1 gap-10 px-5 py-6 sm:px-8 sm:py-8 md:px-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:gap-8 lg:px-12 lg:py-12 xl:px-14 xl:py-14 2xl:px-16">
            {/* LEFT */}
<div className="relative">

  {/* Badge */}
  <div className="mb-5 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-[#d4af37]/30 bg-white/70 px-3 py-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-[#102347] shadow-sm">
    <Library size={14} className="text-[#d4af37]" />
    Your private living library
  </div>

  {/* Welcome */}
  <p className="mb-3 text-[13px] uppercase tracking-[0.34em] text-[#102347]/85 sm:text-[14px]">
    Welcome back,
  </p>

  {/* Name */}
  <h1 className="max-w-[760px] text-[2.2rem] font-extrabold leading-[0.95] text-[#102347] sm:text-[3rem] md:text-[3.6rem] xl:text-[4.5rem]">
    {displayName || 'Welcome'}
  </h1>

  {/* underline */}
  <div className="mt-5 h-[4px] w-[150px] rounded-full bg-gradient-to-r from-[#d4af37] via-[#ecd18a] to-transparent sm:w-[190px]" />

  {/* Philosophy */}
  <div className="mt-7 max-w-[760px] space-y-4 text-[16px] leading-[1.8] text-[#263654] sm:text-[17px] md:text-[18px]">
    <p>
      This is your living library. A quiet place for the people, moments,
      and stories that continue shaping your life.
    </p>
    <p className="font-semibold text-[#b8921e]">
      Built while life is happening, one memory at a time.
    </p>
  </div>

  {/* ACTION PANEL */}
  <div className="mt-10 max-w-[680px] rounded-[22px] border-[1.5px] border-[#d4af37]/35 bg-white/60 backdrop-blur-md p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">

    {/* header */}
    <div className="mb-4">
      <h3 className="text-[16px] sm:text-[17px] font-semibold text-[#102347]">
        Start adding to your living library
      </h3>

      <p className="mt-2 text-[14px] sm:text-[15px] leading-[1.7] text-[#52617b]">
         Add someone important or upload a memory directly from your phone
        into your living library.
      </p>
    </div>

    {/* buttons */}
    <div className="flex flex-col sm:flex-row gap-3">

      {/* Preserve Loved One */}
      <button
        onClick={() => router.push('/dashboard/family?add=true')}
        className="
        group
        w-full sm:w-[220px]
        inline-flex items-center justify-center gap-2
        rounded-full
        bg-gradient-to-r from-[#E6C26E] via-[#F3D99B] to-[#E6C26E]
        text-[#1F2837] font-semibold
        px-5 py-2.5
        text-[14px]
        shadow-[0_12px_24px_rgba(212,175,55,0.25)]
        transition duration-300
        hover:-translate-y-[1px]
        hover:shadow-[0_16px_30px_rgba(212,175,55,0.30)]
        "
      >
        <HandHeart size={16} />
        Add a Loved One
      </button>

      {/* Upload Memory */}
      <button
        onClick={() => router.push('/dashboard/library')}
        className="
        w-full sm:w-[220px]
        inline-flex items-center justify-center gap-2
        rounded-full
        border border-[#102347]/12
        bg-white/80
        text-[#102347] font-semibold
        px-5 py-2.5
        text-[14px]
        shadow-[0_8px_18px_rgba(16,35,71,0.08)]
        transition duration-300
        hover:border-[#d4af37]/40
        hover:bg-white
        "
      >
        <BookOpen size={16} />
        Upload to My Library
      </button>

    </div>

  </div>

</div>

          {/* RIGHT */}
<div className="relative min-h-[470px] lg:min-h-[600px] flex flex-col items-center justify-center">

  {/* TITLE */}
  <div className="mb-6 text-center max-w-[380px]">

    <h3 className="text-[22px] italic font-semibold text-[#102347]">
  Your <span className="text-[#d4af37]">most meaningful memories</span>
</h3>

    <p className="mt-2 text-[14px] leading-[1.6] text-[#5c6980]">
      Choose up to <span className="font-semibold text-[#102347]">five moments</span> that deserve to live here.  
      Click any card to upload a memory.
    </p>

  </div>

  {/* DESKTOP CAROUSEL */}
  <div className="relative hidden lg:flex items-center justify-center w-full">

    {/* LEFT ARROW */}
    <button
      onClick={prevMemory}
      className="absolute left-0 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#102347]/10 bg-white shadow-md transition hover:bg-white"
    >
      <ArrowLeft size={18} />
    </button>

    {/* MEMORY CARD */}
    <MemoryDropCard
      index={activeMemory}
      image={homeImages[activeMemory]}
      placeholder={[
        "A moment that changed everything. Add a memory that still means something.",
        "Someone who shaped your world. Keep their story close.",
        "A place or day that deserves to be remembered.",
        "A memory that still makes you smile.",
        "One moment you never want to lose."
      ][activeMemory]}
      className="relative w-[300px] xl:w-[340px] 2xl:w-[380px]"
      innerHeightClass="h-[320px] xl:h-[360px] 2xl:h-[400px]"
      onUpload={uploadHomeImage}
    />

    {/* RIGHT ARROW */}
    <button
      onClick={nextMemory}
      className="absolute right-0 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#102347]/10 bg-white shadow-md transition hover:bg-white"
    >
      <ArrowRight size={18} />
    </button>

  </div>

  {/* DOTS */}
  <div className="hidden lg:flex mt-6 gap-2">
    {[0,1,2,3,4].map((i) => (
      <button
        key={i}
        onClick={() => setActiveMemory(i)}
        className={`h-2.5 w-2.5 rounded-full transition ${
          activeMemory === i
            ? "bg-[#d4af37]"
            : "bg-[#102347]/20"
        }`}
      />
    ))}
  </div>

  {/* MOBILE WALL */}
  <div className="relative grid grid-cols-1 gap-4 mt-8 w-full lg:hidden">

    <MemoryDropCard
      index={0}
      image={homeImages[0]}
      placeholder="A moment that changed everything. Add a memory that still means something."
      className="relative w-full rotate-[-1deg]"
      innerHeightClass="h-[220px]"
      onUpload={uploadHomeImage}
    />

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

      <MemoryDropCard
        index={1}
        image={homeImages[1]}
        placeholder="Someone who shaped your world. Keep their story close."
        className="relative w-full rotate-[1deg]"
        innerHeightClass="h-[220px]"
        onUpload={uploadHomeImage}
      />

      <MemoryDropCard
        index={2}
        image={homeImages[2]}
        placeholder="A place or day that deserves to be remembered."
        className="relative w-full rotate-[-1deg]"
        innerHeightClass="h-[220px]"
        onUpload={uploadHomeImage}
      />

      <MemoryDropCard
        index={3}
        image={homeImages[3]}
        placeholder="A memory that still makes you smile."
        className="relative w-full rotate-[1deg]"
        innerHeightClass="h-[220px]"
        onUpload={uploadHomeImage}
      />

      <MemoryDropCard
        index={4}
        image={homeImages[4]}
        placeholder="One moment you never want to lose."
        className="relative w-full rotate-[-1deg]"
        innerHeightClass="h-[220px]"
        onUpload={uploadHomeImage}
      />

    </div>
  </div>

</div>
          </div>
        </section>

       {/* SECOND ROW */}
<section className="mt-8 w-full">

  <div className="w-full overflow-hidden rounded-[32px] border border-[#d4af37]/15 bg-white/70 backdrop-blur-xl shadow-[0_28px_80px_rgba(16,35,71,0.10)]">

    {/* HEADER */}
    <div className="px-6 py-7 sm:px-8 border-b border-[#102347]/6">

      <div className="flex items-center gap-4">

        <div>
          <p className="text-[16px] font-semibold uppercase tracking-[0.28em] text-[#b8921e]">
            Begin here
          </p>

          <h2 className="mt-1 text-[26px] font-bold text-[#102347]">
            Start building your living archive
          </h2>

          <p className="mt-2 max-w-[520px] text-[15px] leading-[1.7] text-[#55607a]">
            Add the people, moments, and stories that shape your life.  
            Each piece becomes part of a private library you continue building over time.
          </p>
        </div>

      </div>

    </div>

    {/* ACTION GRID */}
    <div className="grid grid-cols-1 gap-5 p-6 sm:p-8 sm:grid-cols-2 xl:grid-cols-4">

      {/* LOVED ONES */}
      <ActionCard
        icon={
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7efda] text-[#102347] shadow-sm">
            <HandHeart size={22} />
          </div>
        }
        title="Loved Ones"
        text="Create a place for the people who shaped your life and preserve the stories that belong to them."
        button="Open Loved Ones"
       onClick={() => {
  router.push('/dashboard/family')
  window.scrollTo(0, 0)
}}
      />

      {/* TIMELINES */}
      <ActionCard
        icon={
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7efda] text-[#102347] shadow-sm">
            <Calendar size={22} />
          </div>
        }
        title="Timelines"
        text="Give memories a sense of time and meaning by organising moments across the journey of a life."
        button="Open Timelines"
        onClick={() => {
  router.push('/dashboard/timeline')
  setTimeout(() => window.scrollTo(0, 0), 0)
}}
      />

      {/* CAPSULES */}
      <ActionCard
        icon={
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7efda] text-[#102347] shadow-sm">
            <Package size={22} />
          </div>
        }
        title="Capsules"
        text="Capture deeper stories, voice notes, and reflections that photos alone cannot hold."
        button="Create Capsule"
        onClick={() => {
  router.push('/dashboard/capsules')
  setTimeout(() => window.scrollTo(0, 0), 0)
}}
      />

      {/* ALBUMS */}
      <ActionCard
        icon={
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7efda] text-[#102347] shadow-sm">
            <ImageIcon size={22} />
          </div>
        }
        title="Albums"
        text="Organise meaningful photographs into collections that are easy to revisit and share."
        button="Open Albums"
        onClick={() => {
  router.push('/dashboard/albums')
  setTimeout(() => window.scrollTo(0, 0), 0)
}}
      />

    </div>

  </div>

</section>

        {/* THIRD ROW */}
<section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">

  {/* LEFT — MEMORY PROMPT */}
  <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#fffdf8] via-[#f6efe2] to-[#efe6d5] border border-[#d4af37]/20 shadow-[0_30px_80px_rgba(16,35,71,0.12)]">

    {/* soft glow */}
    <div className="absolute -top-20 -left-20 h-[240px] w-[240px] rounded-full bg-[#d4af37]/10 blur-3xl" />

    <div className="relative p-8 sm:p-10">

      <p className="text-[12px] font-semibold uppercase tracking-[0.35em] text-[#b8921e]">
        Memory prompt
      </p>

      <h2 className="mt-3 text-[28px] font-bold leading-[1.3] text-[#102347]">
        Every family has one story that must never disappear.
      </h2>

      <p className="mt-5 max-w-[480px] text-[16px] leading-[1.9] text-[#4b5a73]">
        Think of a moment that shaped your family.  
        A wedding. A tradition. A voice. A turning point.  
        Start your living library with the memory that still matters most.
      </p>

      {/* divider */}
      <div className="mt-8 h-[1px] w-full bg-gradient-to-r from-[#d4af37]/40 via-transparent to-transparent" />

      {/* CTA */}
      <div className="mt-8 flex flex-wrap gap-4">

        <button
          onClick={() => router.push('/dashboard/library')}
          className="
          inline-flex items-center gap-2
          rounded-full
          bg-[#102347]
          px-6 py-3
          text-white font-semibold
          shadow-[0_15px_35px_rgba(16,35,71,0.25)]
          transition
          hover:-translate-y-[2px]
          "
        >
          Add a Memory
          <ArrowRight size={16} />
        </button>
      </div>

    </div>
  </div>


  {/* RIGHT — HOW ANCESTORII WORKS */}
  <div className="relative overflow-hidden rounded-[32px] border border-[#102347]/8 bg-white shadow-[0_25px_70px_rgba(16,35,71,0.10)]">

    {/* top bar */}
    <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#d4af37] via-[#ecd18a] to-[#d4af37]" />

    <div className="p-8 sm:p-10">

      <p className="text-[12px] font-semibold uppercase tracking-[0.35em] text-[#b8921e]">
        Getting started
      </p>

      <h2 className="mt-3 text-[28px] font-bold text-[#102347]">
        How Ancestorii works
      </h2>

      <p className="mt-4 text-[16px] leading-[1.9] text-[#52617b]">
        Building a living library happens step by step.  
        Start small, then continue adding memories over time.
      </p>

      {/* STEPS */}
      <div className="mt-8 space-y-5">

        <div className="flex items-start gap-3">
  <span className="text-sm font-semibold text-[#102347]">1.</span>
  <div>
    <p className="font-semibold text-[#102347]">Add loved ones</p>
    <p className="text-sm text-[#6b7280]">
      Create a place for the people who shaped your life.
    </p>
  </div>
</div>

       <div className="flex items-start gap-3">
  <span className="text-sm font-semibold text-[#102347]">2.</span>
  <div>
    <p className="font-semibold text-[#102347]">Upload memories</p>
    <p className="text-sm text-[#6b7280]">
      Add photos, moments and important events.
    </p>
  </div>
</div>

       <div className="flex items-start gap-3">
  <span className="text-sm font-semibold text-[#102347]">3.</span>
  <div>
    <p className="font-semibold text-[#102347]">Create capsules</p>
    <p className="text-sm text-[#6b7280]">
      Capture deeper stories, reflections and voice notes.
    </p>
  </div>
</div>

      </div>

      {/* coming soon */}
      <div className="mt-8 rounded-[18px] border border-dashed border-[#d4af37]/35 bg-[#faf7ef] px-5 py-4 text-sm text-[#6b7280]">
        Tutorials and walkthrough videos are coming soon.
      </div>

    </div>
  </div>

</section>
      </div>
    </div>
  );
}

function PremiumMiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/70 bg-white/72 px-4 py-4 shadow-[0_12px_28px_rgba(16,35,71,0.06)] backdrop-blur-sm">
      <div className="flex items-center gap-2 text-[#b8921e]">{icon}</div>
      <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7c8798]">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-[#102347]">{value}</p>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  text,
  button,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  text: string
  button: string
  onClick: () => void
}) {
  return (
    <div
      className="
      group
      relative
      rounded-[26px]
border-[2px] border-[#d4af37]/40
bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,246,239,0.92))]
      p-6
      text-left
      shadow-[0_18px_40px_rgba(16,35,71,0.06)]
      transition
      duration-300
      hover:-translate-y-[4px]
      hover:shadow-[0_28px_60px_rgba(16,35,71,0.12)]
      hover:border-[#d4af37]/35
      "
    >

      {/* gold glow */}
      <div className="
        pointer-events-none
        absolute inset-0
        rounded-[26px]
        opacity-0
        transition
        duration-300
        group-hover:opacity-100
        bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_60%)]
      " />

      {/* icon */}
      <div className="mb-4 transition duration-300 group-hover:scale-[1.05]">
        {icon}
      </div>

      {/* title */}
      <h3 className="text-[18px] font-bold text-[#102347]">
        {title}
      </h3>

      {/* description */}
      <p className="mt-2 text-[14.5px] leading-[1.8] text-[#55607a]">
        {text}
      </p>

      {/* button */}
      <button
        onClick={onClick}
        className="
        mt-5
        inline-flex
        items-center
        gap-2
        text-[14px]
        font-semibold
        text-[#102347]
        transition
        group-hover:text-[#b8921e]
        "
      >
        {button}
        <ArrowRight
          size={15}
          className="transition group-hover:translate-x-[3px]"
        />
      </button>
    </div>
  )
}

function PhilosophyLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[18px] border border-white/10 bg-white/6 px-4 py-3">
      <span className="text-sm font-semibold text-[#f3d99b]">{label}</span>
      <span className="max-w-[250px] text-right text-sm leading-[1.6] text-white/75">
        {value}
      </span>
    </div>
  );
}

function DestinationCard({
  title,
  text,
  icon,
  onClick,
}: {
  title: string;
  text: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-[24px] border border-[#102347]/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,244,236,0.90))] p-5 text-left shadow-[0_16px_36px_rgba(16,35,71,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#d4af37]/24 hover:shadow-[0_20px_44px_rgba(16,35,71,0.10)]"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5ecd3] text-[#102347] shadow-sm">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-bold text-[#102347]">{title}</h3>
      <p className="mt-2 text-sm leading-[1.8] text-[#52617b]">{text}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#102347]">
        Open
        <ArrowRight
          size={14}
          className="transition duration-300 group-hover:translate-x-0.5"
        />
      </div>
    </button>
  );
}

function FloatingStoryTile({
  icon,
  title,
  text,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  className: string;
}) {
  return (
    <div
      className={`absolute z-20 max-w-[220px] rounded-[22px] border border-white/70 bg-white/82 px-4 py-3 shadow-[0_18px_36px_rgba(16,35,71,0.10)] backdrop-blur-md ${className}`}
    >
      <div className="flex items-center gap-2 text-[#b8921e]">{icon}</div>
      <p className="mt-2 text-sm font-bold text-[#102347]">{title}</p>
      <p className="mt-1 text-xs leading-[1.7] text-[#5c6980]">{text}</p>
    </div>
  );
}

function MemoryDropCard({
  index,
  image,
  placeholder,
  className,
  innerHeightClass,
  onUpload,
}: {
  index: number;
  image: string | null;
  placeholder: string;
  className: string;
  innerHeightClass: string;
  onUpload: (file: File, index: number) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false)

  return (
    <label
      className={`relative overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(243,237,227,0.92))] p-3 shadow-[0_24px_60px_rgba(16,35,71,0.14)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(16,35,71,0.18)] ${className}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) {
  setLoaded(false)
  setUploading(true)
  onUpload(f, index)
}
      }}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#d4af37]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ead8a0]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#102347]/20" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d8695]">
          Pinned memory
        </span>
      </div>

      <div
        className={`relative overflow-hidden rounded-[22px] border border-[#102347]/6 bg-[#f3ede3] ${innerHeightClass}`}
      >
        {uploading && (
  <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-[#d4af37]/40 border-t-[#d4af37]" />
  </div>
)}
        {image ? (
          <div className="relative h-full w-full">
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 320px"
              className={`object-cover transition-opacity duration-300 ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
              priority={index === 0}
              onLoadingComplete={() => {
              setLoaded(true)
              setUploading(false)
              }}
            />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/35 via-black/8 to-transparent" />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-[#102347] shadow-sm">
              <Plus size={20} />
            </div>
            <p className="text-base font-semibold leading-[1.5] text-[#102347]">
              {placeholder.split('.')[0]}.
            </p>
            <p className="mt-2 text-sm leading-[1.7] text-[#6b7280]">
              {placeholder.split('.').slice(1).join('.')}
            </p>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
  setLoaded(false)
  setUploading(true)
  onUpload(f, index)
}
        }}
      />
    </label>
  );
}