"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Heart,
  Sparkles,
  CalendarDays,
  History,
  HandHeart,
} from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/browser";
import React from "react";

type FamilyMember = {
  id: string;
  owner_id: string;
  full_name: string;
  birth_date?: string | null;
  death_date?: string | null;
  avatar_url?: string | null;
  notes?: string | null;
  biography?: string | null;
  story_preview?: string | null;
  avatar_signed?: string | null;
  relationship_to_user?: string | null;
};

type Props = {
  member: FamilyMember;
  firstName: string;
  introLine: string;
  lifespan: string;
  heartPrintCount: number;
  nextCelebration: any;
  avatarLoaded: boolean;
  setAvatarLoaded: (v: boolean) => void;
  formatRelationship: (rel: string) => string;
  formattedBirthDate: string;
  router: any;

  // preview editing state
  isEditingPreview: boolean;
  setIsEditingPreview: (v: boolean) => void;
  previewDraft: string;
  setPreviewDraft: (v: string) => void;
  setMember: any;
};

export default function ProfileSection({
  member,
  firstName,
  introLine,
  lifespan,
  heartPrintCount,
  nextCelebration,
  avatarLoaded,
  setAvatarLoaded,
  formatRelationship,
  formattedBirthDate,
  router,
  isEditingPreview,
  setIsEditingPreview,
  previewDraft,
  setPreviewDraft,
  setMember,
}: Props) {
  const supabase = getBrowserClient();

  return (
<section className="mb-10">
          <div className="px-1 sm:px-2 lg:px-4">
            <div className="mb-8 lg:mb-10 xl:mb-12 grid gap-4 lg:grid-cols-[1fr_auto]">
              <div className="flex items-center gap-2 flex-nowrap whitespace-nowrap">
                <Pill icon={<Heart className="h-3.5 w-3.5 fill-current" />}>
                  Legacy profile
                </Pill>

                <Pill
                  icon={<Sparkles className="h-3.5 w-3.5" />}
                  className="border-[#d9d3ff] bg-[#f4f1ff] text-[#7058ee]"
                >
                  Living archive
                </Pill>

                {nextCelebration && (
                  <Pill
                    icon={<CalendarDays className="h-3.5 w-3.5" />}
                    className="border-[#bdf5e9] bg-[#ebfffa] text-[#167b66]"
                  >
                    {firstName} turns {nextCelebration.ageTurning} in{" "}
                    {nextCelebration.daysDiff} day
                    {nextCelebration.daysDiff === 1 ? "" : "s"}
                  </Pill>
                )}
              </div>

              <div className="hidden items-center gap-3 lg:flex">
              </div>
            </div>

            <div className="grid gap-10 grid-cols-1">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative"
              >
      

                <div className="relative px-1 sm:px-2 lg:px-4">
                <div className="grid gap-6 lg:gap-16 xl:gap-20 grid-cols-1 md:grid-cols-1 lg:grid-cols-[minmax(220px,360px)_1fr] xl:grid-cols-[0.75fr_1.25fr] items-start">
                    <div className="relative order-1 lg:order-1">
                     <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[520px] xl:max-w-none mx-auto lg:mx-0">
                        <div className="absolute inset-[-16px] rounded-[36px] bg-gradient-to-br from-[#d4af37]/20 via-transparent to-[#8d77ff]/14 blur-2xl" />
                       <div className="relative p-0">
                         <div className="relative w-full aspect-[1/1] overflow-hidden rounded-[24px] border border-white/70 bg-[linear-gradient(180deg,#fffdf7,#f4ecda)] shadow-[0_25px_80px_rgba(0,0,0,0.10)]">

  {/* glow layer */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.20),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(141,119,255,0.12),transparent_40%)]" />

  {/* portrait */}
  <Image
    src={member.avatar_signed || "/default-avatar.png"}
    alt={member.full_name}
    fill
    sizes="(max-width: 1280px) 420px, 520px"
    quality={95}
    priority
    className={`object-cover transition-all duration-700 ${
      avatarLoaded ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
    }`}
    onLoadingComplete={() => setAvatarLoaded(true)}
  />
</div>

                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 px-1">
                            <InfoMiniCard
                              label="Life timeline"
                              value={lifespan}
                              tone="gold"
                            />
                            <InfoMiniCard
                              label="Connected Memories"
                              value={`${heartPrintCount}`}
                              tone="violet"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0 order-2 lg:order-2 w-full max-w-[720px] mt-8 sm:mt-10 lg:mt-0 xl:space-y-8">
                      <div className="mb-7">
                       <h1 className="w-full text-[clamp(2rem,4vw,4.5rem)] font-semibold whitespace-normal break-words sm:break-normal leading-[1.05] tracking-[-0.03em] text-[#18202d] sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl break-words hyphens-auto">
                          {member.full_name}
                        </h1>

                        <p className="mt-5 text-base leading-8 text-[#5d6779] sm:text-lg max-w-none">
                          {introLine}
                        </p>
                      </div>

                      <div className="mb-7 grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
                        <FeatureLine
                          icon={CalendarDays}
                          title="Born"
                          value={formattedBirthDate}
                          accent="gold"
                        />
                        <FeatureLine
                          icon={History}
                          title="Life status"
                          value={member.death_date ? "Forever Remembered" : "Living"}
                          accent="violet"
                        />
                        <FeatureLine
                         icon={HandHeart}
                         title="Relationship"
                         value={
                         member.relationship_to_user
                         ? formatRelationship(member.relationship_to_user)
                         : "Family"
                          }
                         accent="mint"
                        />
                      </div>

                      <div className="mt-10 relative">

  {/* BACKGROUND FIELD */}
  <div className="relative overflow-hidden rounded-[28px] border border-[#f4d97a] bg-white px-6 py-6 sm:px-8 sm:py-7 lg:px-10 lg:py-8">

    <div className="absolute inset-0 -z-10 bg-white" />

    <div className="hidden sm:block absolute -left-10 top-10 h-[220px] w-[220px] rounded-full bg-[#d4af37]/20 blur-3xl" />
    <div className="absolute right-[-40px] top-20 h-[200px] w-[200px] rounded-full bg-[#8d77ff]/20 blur-3xl" />
    <div className="hidden sm:block absolute bottom-[-60px] left-1/3 h-[180px] w-[180px] rounded-full bg-[#32d5b2]/10 blur-3xl" />

    <div className="pointer-events-none absolute -top-12 left-4 text-[180px] leading-none text-[#d4af37]/40 select-none">
  “
</div>

    <div className="relative z-10 max-w-3xl">

     <h2 className="mb-5 text-[20px] sm:text-[22px] lg:text-[24px] xl:text-[26px] leading-[1.2] tracking-[0.08em] font-semibold text-[#bfa046] uppercase text-center">
  ABOUT THEM
</h2>
      {!isEditingPreview ? (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="group cursor-text relative"
          onClick={() => {
            setIsEditingPreview(true);
            setPreviewDraft(member?.story_preview || "");
          }}
        >

         <p className="text-[15px] sm:text-[16px] lg:text-[17px] leading-[1.5] text-[#4b5563] max-w-[520px]">
  {member.story_preview
    ? member.story_preview
    : "Write a few words that describe who they are..."}
</p>

          <div className="mt-5 h-[2px] w-16 bg-gradient-to-r from-[#d4af37] via-[#8d77ff] to-transparent transition-all duration-500 group-hover:w-28" />

        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >

          <textarea
            value={previewDraft}
            onChange={(e) => setPreviewDraft(e.target.value.slice(0, 120))}
            className="w-full resize-none bg-transparent text-[18px] sm:text-[20px] leading-[1.4] text-[#1b2230] outline-none border-b border-[#e5e7eb] pb-2"
            placeholder={`${firstName} is...`}
            autoFocus
          />

          <div className="flex justify-between items-center">
            <span className="text-xs text-[#9aa3b2]">
              {previewDraft.length}/120
            </span>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setIsEditingPreview(false);
                  setPreviewDraft(member?.story_preview || "");
                }}
                className="text-sm text-[#6b7280]"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  const { error } = await supabase
                    .from("family_members")
                    .update({ story_preview: previewDraft || null })
                    .eq("id", member.id);

                  if (!error) {
                    setMember((prev: any) =>
                      prev
                        ? { ...prev, story_preview: previewDraft }
                        : prev
                    );
                    setIsEditingPreview(false);
                  }
                }}
                className="text-sm font-semibold text-[#1b2230] transition-all duration-200 hover:font-bold hover:text-black"
              >
                Save
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  </div>
</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
  );
}

function Pill({
  children,
  icon,
  className = "",
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-[#ead99b] bg-[#fff8df] px-4 py-2 text-xs font-semibold text-[#9f7b1d] shadow-sm ${className}`}
    >
      {icon}
      {children}
    </div>
  );
}

function InfoMiniCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "gold" | "violet";
}) {
  const toneMap = {
    gold: {
      wrap: "border-[#ead99b] bg-[#fff9e6]",
      label: "text-[#ad8c35]",
      value: "text-[#202938]",
    },
    violet: {
      wrap: "border-[#d9d3ff] bg-[#f5f2ff]",
      label: "text-[#7b64e8]",
      value: "text-[#202938]",
    },
  };

  return (
    <div
      className={`rounded-2xl border p-3 shadow-sm ${toneMap[tone].wrap}`}
    >
      <p className={`text-[11px] uppercase tracking-[0.18em] ${toneMap[tone].label}`}>
        {label}
      </p>
      <p className={`mt-1 text-sm font-semibold ${toneMap[tone].value}`}>
        {value}
      </p>
    </div>
  );
}

function FeatureLine({
  icon: Icon,
  title,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  accent: "gold" | "mint" | "violet";
}) {
  const accentMap = {
    gold: {
      iconWrap: "border-[#ead99b] bg-[#fff8df] text-[#b18824]",
    },
    mint: {
      iconWrap: "border-[#c8f2e7] bg-[#ecfffb] text-[#157c66]",
    },
    violet: {
      iconWrap: "border-[#d9d3ff] bg-[#f4f1ff] text-[#7058ee]",
    },
  };

  return (
<div className="rounded-[20px] border border-[#f4d97a] bg-white p-3 md:p-2.5 lg:p-3 xl:p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 md:h-8 md:w-8 lg:h-9 lg:w-9 xl:h-10 xl:w-10 items-center justify-center rounded-2xl border ${accentMap[accent].iconWrap}`}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>

        <div className="min-w-0">
          <p className="text-[9px] md:text-[8px] lg:text-[9px] xl:text-[10px] font-bold uppercase tracking-[0.2em] xl:tracking-[0.24em] text-[#4b5563]">
            {title}
          </p>
          <p className="mt-1 truncate text-[13px] md:text-[12px] lg:text-[13px] xl:text-sm font-semibold text-[#1f2735]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}