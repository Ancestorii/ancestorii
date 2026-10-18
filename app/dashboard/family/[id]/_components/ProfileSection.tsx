"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Sparkles,
  CalendarDays,
  History,
  Plus,
  HandHeart,
  Camera,
  Pencil,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/browser";
import React, { useEffect } from "react";
import type { CSSProperties } from "react";
import {
  ui,
  Btn,
  Eyebrow,
  IconTile,
  toneByKey,
  type ToneKey,
} from "@/components/dashboard/ui/AppBits";
import s from "./lovedOne.module.css";

const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

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
    <section aria-labelledby="loved-one-name">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={s.hero}
      >
        {/* ── Name, with the profile's chips over it ── */}
        <header className={cx(ui.header, s.heroHead)}>
          <div className={ui.headerGlow} aria-hidden="true" />

          <div className={s.heroChips}>
            <Eyebrow dot="var(--c3)">Legacy profile</Eyebrow>

            <Pill icon={<Sparkles size={15} strokeWidth={2.4} aria-hidden="true" />}>
              Living archive
            </Pill>

            {nextCelebration && (
              <Pill
                icon={<CalendarDays size={15} strokeWidth={2.4} aria-hidden="true" />}
                className={s.chipWrap}
              >
                {firstName} turns {nextCelebration.ageTurning} in{" "}
                {nextCelebration.daysDiff} day
                {nextCelebration.daysDiff === 1 ? "" : "s"}
              </Pill>
            )}
          </div>

          <h1 id="loved-one-name" className={ui.title}>
            {member.full_name}
          </h1>

          <p className={cx(ui.lead, "[overflow-wrap:anywhere]")}>{introLine}</p>
        </header>

        {/* ── Portrait (opens the loved one's details) and two short facts ── */}
        <div className={s.heroPhoto}>
          <div
            className={ui.frame}
            style={{ "--frame": "var(--c3)" } as CSSProperties}
          >
            <button
              type="button"
              onClick={() =>
                router.push(`/dashboard/family?edit=${member.id}`)
              }
              aria-label={
                member.avatar_signed
                  ? `Change photo of ${member.full_name}`
                  : `Add a picture of ${member.full_name}`
              }
              className={cx(ui.frameInner, s.portrait)}
            >
              {member.avatar_signed ? (
                <>
                  <Image
                    src={member.avatar_signed}
                    alt={member.full_name}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 40vw, 480px"
                    quality={95}
                    priority
                    className={cx(s.portraitImg, avatarLoaded && s.portraitImgLoaded)}
                    onLoadingComplete={() => setAvatarLoaded(true)}
                  />

                  {/* edit hint */}
                  <span className={s.photoAction} aria-hidden="true">
                    <Camera size={15} strokeWidth={2.4} />
                    Change photo
                  </span>
                </>
              ) : (
                <span className={s.portraitEmpty}>
                  <span className={s.addCircle} aria-hidden="true">
                    <Plus size={22} strokeWidth={2.4} />
                  </span>

                  <span className={s.addTitle}>Add a picture</span>

                  <span className={s.addText}>
                    Click here to upload a photo of {firstName}.
                  </span>
                </span>
              )}
            </button>
          </div>

          <div className={s.stats}>
            <InfoMiniCard label="Life timeline" value={lifespan} tone="aqua" />
            <InfoMiniCard
              label="Connected Memories"
              value={`${heartPrintCount}`}
              tone="pink"
            />
          </div>
        </div>

        {/* ── Born, life status, relationship ── */}
        <div className={cx(s.heroFacts, s.facts)}>
          <FeatureLine
            icon={CalendarDays}
            title="Born"
            value={formattedBirthDate}
            accent="pink"
          />
          <FeatureLine
            icon={History}
            title="Life status"
            value={member.death_date ? "Forever Remembered" : "Living"}
            accent="orange"
          />
          <FeatureLine
            icon={HandHeart}
            title="Relationship"
            value={
              member.relationship_to_user
                ? formatRelationship(member.relationship_to_user)
                : "Family"
            }
            accent="blue"
          />
        </div>

        {/* ── About them: a few words, edited in place ── */}
        <div className={cx(ui.card, s.heroAbout)}>
          <div className={s.aboutHead}>
            <h2
              id="about-them-title"
              className={ui.tag}
              style={{ "--dot": "var(--c0)" } as CSSProperties}
            >
              About them
            </h2>
          </div>

          {!isEditingPreview ? (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={s.aboutView}
              onClick={() => {
                setIsEditingPreview(true);
                setPreviewDraft(member?.story_preview || "");
              }}
            >
              <span className={s.quoteMark} aria-hidden="true">
                &ldquo;
              </span>

              <span
                className={cx(s.aboutText, !member.story_preview && s.aboutEmpty)}
              >
                {member.story_preview
                  ? member.story_preview
                  : "Write a few words that describe who they are..."}
              </span>

              <span className={s.aboutPencil} aria-hidden="true">
                <Pencil size={16} strokeWidth={2.4} />
              </span>
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={s.aboutEdit}
            >
              <textarea
                value={previewDraft}
                onChange={(e) => setPreviewDraft(e.target.value.slice(0, 120))}
                className={cx(ui.textarea, s.aboutInput)}
                placeholder={`${firstName} is...`}
                aria-labelledby="about-them-title"
                autoFocus
              />

              <div className={s.aboutBar}>
                <span className={s.aboutCount}>{previewDraft.length}/120</span>

                <div className={s.aboutButtons}>
                  <Btn
                    variant="soft"
                    size="sm"
                    onClick={() => {
                      setIsEditingPreview(false);
                      setPreviewDraft(member?.story_preview || "");
                    }}
                  >
                    Cancel
                  </Btn>

                  <Btn
                    size="sm"
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
                  >
                    Save
                  </Btn>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
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
    <span className={cx(ui.chip, className)}>
      {icon}
      {children}
    </span>
  );
}

function InfoMiniCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: ToneKey;
}) {
  return (
    <div className={s.stat}>
      <span
        className={ui.tag}
        style={{ "--dot": toneByKey(tone).bg } as CSSProperties}
      >
        {label}
      </span>
      <span className={s.statValue}>{value}</span>
    </div>
  );
}

function FeatureLine({
  icon: Icon,
  title,
  value,
  accent,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  accent: ToneKey;
}) {
  return (
    <div className={s.fact}>
      <IconTile Icon={Icon} tone={toneByKey(accent)} size="sm" />

      <span className={s.factText}>
        <span className={s.factLabel}>{title}</span>
        <span className={s.factValue}>{value}</span>
      </span>
    </div>
  );
}
