"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, HandHeart } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/browser";
import {
  ui,
  AppLoader,
  Btn,
  IconTile,
  Tag,
  toneByKey,
} from "@/components/dashboard/ui/AppBits";

import ProfileSection from "./_components/ProfileSection";
import StorySection from "./_components/StorySection";
import LinkedContentSection from "./_components/LinkedContentSection";
import LovedOneAI from "./_components/LovedOneAI";
import s from "./_components/lovedOne.module.css";
import { parseDateOnly } from "../_utils/dateOnly";

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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    // Everything keys on the id in the address, never on the fetched row: the linked queries
    // read `data.id` and fired `family_member_id=eq.undefined` whenever the member response
    // was not the single row expected. Nothing runs without a well-formed id.
    if (!memberId || !UUID_RE.test(memberId)) {
      setMember(null);
      setLoading(false);
      return;
    }
    setLoading(true);

    // One round trip for the loved one and everything linked to them (all need only the id).
    const [memberRes, tlRes, albRes, capRes] = await Promise.all([
      supabase.from("family_members").select("*").eq("id", memberId).maybeSingle(),

      supabase
        .from("family_member_timelines")
        .select("id, title, description, created_at")
        .eq("family_member_id", memberId),

      supabase
        .from("album_tags")
        .select("albums(id, title, description, created_at)")
        .eq("family_member_id", memberId),

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
        .eq("family_member_id", memberId),
    ]);

    const data = memberRes.data as FamilyMember | null;
    if (!data || memberRes.error || !data.id) {
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

      // No cache buster: a replaced photo gets a new storage path (AddMemberModal), so the
      // browser may keep this one.
      signedAvatar = signed?.signedUrl || null;
    }

    setMember({ ...data, avatar_signed: signedAvatar });
    setPreviewDraft(data.story_preview || "");
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
    const b = parseDateOnly(member.birth_date)?.getFullYear() ?? null;
    const d = parseDateOnly(member.death_date)?.getFullYear() ?? null;

    if (b && !d) return `${b} to present`;
    if (b && d) return `${b} to ${d}`;
    return "Dates not set";
  }, [member]);

  const nextCelebration = useMemo(() => {
    if (!member?.birth_date || member.death_date) return null;

    const birth = parseDateOnly(member.birth_date);
    if (!birth) return null;

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
    const date = parseDateOnly(member.birth_date);
    if (!date) return "Unknown";
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
      <div className={ui.page}>
        <div className={ui.wrap}>
          {/* The way back is there from the first paint (this route has no sidebar). */}
          <TopActions router={router} />
          <AppLoader label="Loading their space" />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className={ui.page}>
        <div className={ui.wrapNarrow}>
          <div className={`${ui.empty} ${s.missing}`}>
            <IconTile Icon={HandHeart} tone={toneByKey("aqua")} size="lg" />

            <div className="mt-5">
              <Tag dot="var(--c3)">Legacy profile</Tag>
            </div>

            <h1 className={`${ui.emptyTitle} mt-3`}>Loved one not found</h1>

            <p className={ui.emptyText}>
              We could not find this page. It may have been moved, removed, or
              the link is no longer valid.
            </p>

            <div className={ui.emptyActions}>
              <Btn
                onClick={() => router.push("/dashboard/family")}
                icon={<ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />}
              >
                Back to your loved ones
              </Btn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={ui.page}>
      <div className={ui.wrap}>
        <TopActions router={router} />

        <LovedOneAI
          memberName={member.full_name}
          firstName={firstName}
          memberBorn={member.birth_date}
          memberDied={member.death_date}
          memberRelationship={member.relationship_to_user}
        />

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

        <footer className={s.footer}>
          <Tag dot="var(--c3)">Ancestorii permanent record</Tag>

          <p className={s.footerText}>
            This page gathers every visible piece of {member.full_name}
            &apos;s legacy across Ancestorii into one clean, living memory
            space.
          </p>

          <p className={s.footerFine}>
            Preserving stories, albums, milestones and messages with care.
          </p>
        </footer>
      </div>
    </div>
  );
}

function TopActions({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <div className={s.topRow}>
      <Btn
        variant="soft"
        size="sm"
        onClick={() => router.push("/dashboard/family")}
        icon={<ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />}
      >
        Back to Loved Ones
      </Btn>
    </div>
  );
}