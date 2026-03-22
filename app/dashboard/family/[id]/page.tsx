"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Heart } from "lucide-react";
import Image from "next/image";
import { getBrowserClient } from "@/lib/supabase/browser";

import ProfileSection from "./_components/ProfileSection";
import StorySection from "./_components/StorySection";
import LinkedContentSection from "./_components/LinkedContentSection";

type FamilyMember = {
  id: string;
  owner_id: string;
  full_name: string;
  birth_date?: string | null;
  death_date?: string | null;
  avatar_url?: string | null;
  notes?: string | null;

  // ✅ KEEP
  story_preview?: string | null;

  // ✅ NEW STRUCTURED STORY
  early_years?: string | null;
  important_moments?: string | null;
  special_memories?: string | null;
  who_they_are?: string | null;

  avatar_signed?: string | null;
  relationship_to_user?: string | null;
};

type Timeline = {
  id: string;
  title: string;
  description?: string | null;
  created_at?: string | null;
};

type Album = {
  id: string;
  title: string;
  description?: string | null;
  created_at?: string | null;
};

type Capsule = {
  id: string;
  title: string;
  message?: string | null;
  is_locked?: boolean | null;
  unlock_date?: string | null;
};

export default function LovedOneProfilePage() {
  const supabase = getBrowserClient();
  const router = useRouter();
  const { id } = useParams();
  const memberId = Array.isArray(id) ? id[0] : id;

  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<FamilyMember | null>(null);

  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  const [isEditingPreview, setIsEditingPreview] = useState(false);
  const [previewDraft, setPreviewDraft] = useState("");

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .eq("id", memberId)
      .single();

    if (!data || error) {
      setMember(null);
      setTimelines([]);
      setAlbums([]);
      setCapsules([]);
      setLoading(false);
      setPreviewDraft("");
      return;
    }

    let signedAvatar: string | null = null;
    if (data.avatar_url) {
      const { data: signed } = await supabase.storage
        .from("user-media")
        .createSignedUrl(data.avatar_url, 60 * 60 * 24);

      signedAvatar = signed?.signedUrl
        ? `${signed.signedUrl}&cb=${Date.now()}`
        : null;
    }

    const memberWithAvatar: FamilyMember = {
      ...data,
      avatar_signed: signedAvatar,
    };

    setMember(memberWithAvatar);
    setPreviewDraft(data.story_preview || "");

    const [tlRes, albRes, capRes] = await Promise.all([
      supabase
        .from("family_member_timelines")
        .select("id, title, description, created_at")
        .eq("family_member_id", data.id),

      supabase
        .from("album_tags")
        .select("albums(id, title, description, created_at)")
        .eq("family_member_id", data.id),

      supabase
        .from("capsule_tags")
        .select(`
          memory_capsules (
            id,
            title,
            message,
            is_locked,
            unlock_date
          )
        `)
        .eq("family_member_id", data.id),
    ]);

    setTimelines(tlRes.data || []);
    setAlbums(albRes.data?.map((x: any) => x.albums).filter(Boolean) || []);
    setCapsules(
      capRes.data?.map((x: any) => x.memory_capsules).filter(Boolean) || []
    );

    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  useEffect(() => {
    setAvatarLoaded(false);
  }, [member?.avatar_signed]);

  const firstName = useMemo(() => {
    if (!member?.full_name) return "";
    return member.full_name?.split(" ").length > 0
      ? member.full_name.split(" ")[0]
      : member.full_name;
  }, [member]);

  const lifespan = useMemo(() => {
    if (!member) return "";
    const b = member.birth_date
      ? new Date(member.birth_date).getFullYear()
      : null;
    const d = member.death_date
      ? new Date(member.death_date).getFullYear()
      : null;

    if (b && !d) return `${b} — Living`;
    if (b && d) return `${b} — ${d}`;
    return "—";
  }, [member]);

  const nextCelebration = useMemo(() => {
    if (!member?.birth_date || member.death_date) return null;

    const birth = new Date(member.birth_date);
    if (Number.isNaN(birth.getTime())) return null;

    const today = new Date();
    const thisYear = today.getFullYear();

    const next = new Date(thisYear, birth.getMonth(), birth.getDate());
    if (next < today) next.setFullYear(thisYear + 1);

    const msDiff = next.getTime() - today.getTime();
    const daysDiff = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
    const ageTurning = next.getFullYear() - birth.getFullYear();

    return {
      label: `${firstName}'s ${ageTurning}ᵗʰ birthday is in ${daysDiff} day${
        daysDiff === 1 ? "" : "s"
      }.`,
      daysDiff,
      ageTurning,
    };
  }, [member, firstName]);

  const heartPrintCount = timelines.length + albums.length + capsules.length;

  const formattedBirthDate = useMemo(() => {
    if (!member?.birth_date) return "Unknown";
    const date = new Date(member.birth_date);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [member]);

  const formatRelationship = (rel: string) => {
    return rel
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const introLine = useMemo(() => {
    if (!member) return "";
    if (member.death_date) {
      return `A dedicated space to preserve ${firstName}'s story, albums, moments, and messages for the future.`;
    }
    return `A living archive for ${firstName}, gathering memories, milestones, albums, and words into one beautiful place.`;
  }, [member, firstName]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffdf6] px-6">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.04em] text-[#1b2230] text-center"
        >
          <span className="bg-gradient-to-r from-[#bfa046] via-[#d4af37] to-[#8d77ff] bg-clip-text text-transparent">
            Loading their space...
          </span>
        </motion.h1>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-[#fbf7ef] to-[#f5eddc] font-[Inter] text-[#1b2230]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_26%),radial-gradient(circle_at_top_right,rgba(141,119,255,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(50,213,178,0.10),transparent_28%)]" />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="max-w-xl rounded-[34px] border border-white/70 bg-white/65 p-9 text-center shadow-[0_30px_90px_rgba(0,0,0,0.10)] backdrop-blur-2xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] border border-[#ecd791]/80 bg-[#fff6d8] shadow-[0_15px_45px_rgba(0,0,0,0.06)]">
              <Heart className="h-8 w-8 text-[#c39a2f]" />
            </div>

            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.34em] text-[#ad8d34]">
              Legacy profile
            </p>

            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#1b2230]">
              Loved one not found
            </h2>

            <p className="mt-4 text-base leading-8 text-[#616b7e]">
              We could not find this page. It may have been moved, removed, or
              the link is no longer valid.
            </p>

            <button
              onClick={() => router.push("/dashboard/family")}
              className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#e7d48f] bg-[#fff8df] px-6 py-3.5 text-sm font-semibold text-[#a07b22] transition hover:bg-[#fff2c6]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to your loved ones
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-screen bg-[#fffdf6] font-[Inter] text-[#1b2230]">
      <Image
        src="/parchment.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-[0.10] -z-10 pointer-events-none"
        priority
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.65),transparent_10%)] pointer-events-none" />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-10 xl:px-16 pb-20 pt-5 lg:pb-28">
        <TopActions router={router} />

        <ProfileSection
          member={member}
          firstName={firstName}
          introLine={introLine}
          lifespan={lifespan}
          heartPrintCount={heartPrintCount}
          nextCelebration={nextCelebration}
          avatarLoaded={avatarLoaded}
          setAvatarLoaded={setAvatarLoaded}
          formatRelationship={formatRelationship}
          formattedBirthDate={formattedBirthDate}
          router={router}
          isEditingPreview={isEditingPreview}
          setIsEditingPreview={setIsEditingPreview}
          previewDraft={previewDraft}
          setPreviewDraft={setPreviewDraft}
          setMember={setMember}
        />

        <StorySection
        member={member}
        firstName={firstName}
        setMember={setMember}
        />

        <LinkedContentSection
          member={member}
          firstName={firstName}
          timelines={timelines}
          albums={albums}
          capsules={capsules}
        />

        <footer className="mt-16 mb-6 flex justify-center px-6 pt-12">
          <div className="text-center max-w-[520px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#ab8a31]">
              Ancestorii permanent record
            </p>

            <p className="mt-3 text-sm leading-6 text-[#5e687b]">
              This page gathers every visible piece of {member.full_name}
              &apos;s legacy across Ancestorii into one clean, living memory
              space.
            </p>

            <p className="mt-4 text-[11px] italic tracking-[0.12em] text-[#8d95a4]">
              Preserving stories, albums, milestones and messages with care.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function TopActions({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <div className="mb-7 lg:mb-8 xl:mb-10 flex items-center justify-between gap-4">
      <button
        onClick={() => router.push("/dashboard/family")}
        className="group inline-flex items-center gap-2 text-sm font-semibold text-[#2c3443] hover:text-[#000] transition"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to your loved ones
      </button>
    </div>
  );
}