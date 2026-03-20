"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  CalendarDays,
  Sparkles,
  BookHeart,
  Clock3,
  ImageIcon,
  Lock,
  ScrollText,
  PenLine,
  ChevronRight,
  Orbit,
  Share2,
  Printer,
  ShieldCheck,
  History,
  Camera,
  Bookmark,
  Fingerprint,
  Globe,
  Stars,
  Library,
  Flower2,
  MoonStar,
  Quote,
  FileText,
  Plus,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

import { getBrowserClient } from "@/lib/supabase/browser";

const Particles = dynamic(() => import("@/components/ParticlesPlatform"), {
  ssr: false,
});

type FamilyMember = {
  id: string;
  owner_id: string;
  full_name: string;
  birth_date?: string | null;
  death_date?: string | null;
  avatar_url?: string | null;
  notes?: string | null;
  biography?: string | null;
  avatar_signed?: string | null;
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

type ArtifactCardItem = {
  id: string;
  title: string;
  description?: string;
  locked?: boolean;
  onClick: () => void;
};

export default function LovedOneProfilePage() {
  const supabase = getBrowserClient();
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<FamilyMember | null>(null);

  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  const [isEditingStory, setIsEditingStory] = useState(false);
  const [storyDraft, setStoryDraft] = useState("");

  const MAX_VISIBLE = 5;

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .eq("id", id)
      .single();

    if (!data || error) {
      setMember(null);
      setTimelines([]);
      setAlbums([]);
      setCapsules([]);
      setLoading(false);
      return;
    }

    let signedAvatar: string | null = null;
    if (data.avatar_url) {
      const { data: signed } = await supabase.storage
        .from("user-media")
        .createSignedUrl(data.avatar_url, 60 * 60);

      signedAvatar = signed?.signedUrl
        ? `${signed.signedUrl}&cb=${Date.now()}`
        : null;
    }

    const memberWithAvatar: FamilyMember = {
      ...data,
      avatar_signed: signedAvatar,
    };

    setMember(memberWithAvatar);
    setStoryDraft(data.biography || "");

    await supabase.auth.getUser();

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

  const storyText = useMemo(() => {
    if (!member) return "";
    return (member.biography || member.notes || "").trim();
  }, [member]);

  const visibleTimelines = timelines.slice(0, MAX_VISIBLE);
  const remainingTimelines = Math.max(0, timelines.length - MAX_VISIBLE);

  const visibleAlbums = albums.slice(0, MAX_VISIBLE);
  const remainingAlbums = Math.max(0, albums.length - MAX_VISIBLE);

  const visibleCapsules = capsules.slice(0, MAX_VISIBLE);
  const remainingCapsules = Math.max(0, capsules.length - MAX_VISIBLE);

  const storyWordCount = useMemo(() => {
    if (!storyDraft.trim()) return 0;
    return storyDraft.trim().split(/\s+/).length;
  }, [storyDraft]);

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

  const formattedDeathDate = useMemo(() => {
    if (!member?.death_date) return "Living";
    const date = new Date(member.death_date);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [member]);

  const introLine = useMemo(() => {
    if (!member) return "";
    if (member.death_date) {
      return `A dedicated space to preserve ${firstName}'s story, albums, moments, and messages for the future.`;
    }
    return `A living archive for ${firstName}, gathering memories, milestones, albums, and words into one beautiful place.`;
  }, [member, firstName]);

  const timelineItems: ArtifactCardItem[] = visibleTimelines.map((t) => ({
    id: t.id,
    title: t.title || "Untitled timeline",
    description: t.description || "",
    onClick: () => router.push(`/dashboard/timeline/${t.id}`),
  }));

  const albumItems: ArtifactCardItem[] = visibleAlbums.map((a) => ({
    id: a.id,
    title: a.title || "Untitled album",
    description: a.description || "",
    onClick: () => router.push(`/dashboard/albums/${a.id}`),
  }));

  const capsuleItems: ArtifactCardItem[] = visibleCapsules.map((c) => {
    const isLocked = c.is_locked === true;

    return {
      id: c.id,
      title: c.title || "Untitled capsule",
      description: c.unlock_date
        ? `Unlocks on ${new Date(c.unlock_date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}`
        : isLocked
        ? "Locked capsule"
        : "",
      locked: isLocked,
      onClick: () => {
        if (isLocked) {
          router.push("/dashboard/capsules");
        } else {
          router.push(`/dashboard/capsules/${c.id}`);
        }
      },
    };
  });

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-[#fbf7ef] to-[#f5eddc] font-[Inter] text-[#1b2230]">
        <Particles />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_26%),radial-gradient(circle_at_top_right,rgba(141,119,255,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(50,213,178,0.12),transparent_25%)]" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(157,140,100,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(157,140,100,0.08)_1px,transparent_1px)] [background-size:90px_90px]" />
        <div className="absolute left-[-8%] top-[8%] h-[280px] w-[280px] rounded-full bg-[#f0d998]/40 blur-[120px]" />
        <div className="absolute right-[-6%] top-[22%] h-[300px] w-[300px] rounded-full bg-[#dfd7ff]/55 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[15%] h-[260px] w-[260px] rounded-full bg-[#d9fff4]/60 blur-[110px]" />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-2xl overflow-hidden rounded-[36px] border border-white/70 bg-white/60 shadow-[0_30px_120px_rgba(44,49,66,0.12)] backdrop-blur-2xl"
          >
            <div className="relative overflow-hidden p-8 sm:p-10">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.62),rgba(255,255,255,0.30)_52%,rgba(212,175,55,0.08)_100%)]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/70 to-transparent" />
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#f6e4ae]/40 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[#e5e0ff]/45 blur-3xl" />

              <div className="relative">
                <div className="mb-7 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-[#e8d488]/70 bg-white/70 shadow-[0_12px_35px_rgba(0,0,0,0.06)]">
                    <Orbit className="h-6 w-6 text-[#b5912f]" />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a18436]">
                      Opening legacy profile
                    </p>
                    <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#1b2230]">
                      Gathering memories, albums and stories
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[28px] border border-white/70 bg-white/55 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full border border-[#e9db9d]/80 bg-[#fff8dc] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-[#a27c1f]">
                        Live archive
                      </span>
                      <Sparkles className="h-4 w-4 text-[#c79f31]" />
                    </div>

                    <div className="aspect-[4/5] rounded-[22px] bg-[linear-gradient(180deg,#fffaf0,#f7f0de)]" />
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="rounded-[28px] border border-white/70 bg-white/55 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
                      <p className="text-sm leading-7 text-[#5b6577]">
                        Loading their profile page and reconnecting timelines,
                        albums, capsules, and written legacy into one place.
                      </p>

                      <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-[#efe6cf]">
                        <motion.div
                          initial={{ x: "-35%" }}
                          animate={{ x: "135%" }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.8,
                            ease: "easeInOut",
                          }}
                          className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f6dea0] to-[#8d77ff]"
                        />
                      </div>

                      <div className="mt-6 grid grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-white/70 bg-white/70 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a9fb0]">
                            Story
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[#222a38]">
                            Syncing
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/70 bg-white/70 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a9fb0]">
                            Albums
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[#222a38]">
                            Linking
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/70 bg-white/70 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a9fb0]">
                            Capsules
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[#222a38]">
                            Loading
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-7 text-sm leading-7 text-[#667085]">
                  Restoring a brighter, living memory space...
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-[#fbf7ef] to-[#f5eddc] font-[Inter] text-[#1b2230]">
        <Particles />

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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#fffdf8] via-[#fbf7ef] to-[#f6efdf] font-[Inter] text-[#1b2230]">
      <Particles />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.17),transparent_22%),radial-gradient(circle_at_top_right,rgba(141,119,255,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(50,213,178,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.75),rgba(249,244,231,0.78))]" />
      <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(160,145,108,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(160,145,108,0.08)_1px,transparent_1px)] [background-size:84px_84px]" />
      <div className="absolute left-[-6%] top-[8%] h-[280px] w-[280px] rounded-full bg-[#f2db97]/50 blur-[120px]" />
      <div className="absolute right-[-5%] top-[15%] h-[320px] w-[320px] rounded-full bg-[#e2ddff]/60 blur-[130px]" />
      <div className="absolute left-[20%] top-[34%] h-[180px] w-[180px] rounded-full bg-[#e8fff7]/70 blur-[90px]" />
      <div className="absolute bottom-[-8%] right-[18%] h-[260px] w-[260px] rounded-full bg-[#fff1d5]/70 blur-[110px]" />

      <div className="relative z-20 mx-auto max-w-[1650px] px-4 pb-20 pt-5 sm:px-6 lg:px-8 lg:pb-28">
        <TopActions router={router} />

        <section className="relative mb-8 overflow-hidden rounded-[38px] border border-white/70 bg-white/45 shadow-[0_30px_120px_rgba(42,48,66,0.10)] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.70),rgba(255,255,255,0.35)_44%,rgba(212,175,55,0.07)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/70 to-transparent" />
          <div className="absolute left-0 top-0 h-[280px] w-[280px] rounded-full bg-[#f8e8af]/45 blur-[100px]" />
          <div className="absolute right-0 top-0 h-[320px] w-[320px] rounded-full bg-[#e7e2ff]/55 blur-[120px]" />
          <div className="absolute bottom-[-25%] left-[22%] h-[240px] w-[240px] rounded-full bg-[#dffff4]/60 blur-[110px]" />

          <div className="relative p-5 sm:p-6 lg:p-8 xl:p-10">
            <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto]">
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
                <MiniAction icon={Share2} />
                <MiniAction icon={Printer} />
                <MiniAction icon={Bookmark} />
              </div>
            </div>

            <div className="grid gap-8 grid-cols-1 max-w-[1500px] mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative overflow-hidden rounded-[34px] border border-white/70 bg-white/40 shadow-[0_22px_80px_rgba(38,44,62,0.08)]"
              >
                <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.62),rgba(255,255,255,0.26)_55%,rgba(212,175,55,0.05))]" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

                <div className="relative p-5 sm:p-6 lg:p-8">
                  <div className="grid gap-8 lg:grid-cols-[340px_1fr] xl:grid-cols-[460px_1fr]">
                    <div className="relative">
                      <div className="relative mx-auto w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[420px] xl:max-w-[480px]">
                        <div className="absolute inset-[-16px] rounded-[36px] bg-gradient-to-br from-[#d4af37]/20 via-transparent to-[#8d77ff]/14 blur-2xl" />
                        <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/55 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ffffff] to-transparent" />

                          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,#fffdf7,#f4ecda)] shadow-[0_25px_80px_rgba(0,0,0,0.10)]">

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

  {/* bottom fade */}
  <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white/80 via-white/20 to-transparent" />

  {/* tag */}
  <div className="hidden sm:inline-flex absolute left-4 top-4 items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-[#7e671f] shadow-sm backdrop-blur-md">
    <Sparkles className="h-3.5 w-3.5 text-[#c89d2f]" />
    Loved one
  </div>
</div>

                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <InfoMiniCard
                              label="Lifespan"
                              value={lifespan}
                              tone="gold"
                            />
                            <InfoMiniCard
                              label="Memories"
                              value={`${heartPrintCount}`}
                              tone="violet"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="mb-7">
                        <div className="mb-4 flex items-center gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#ead99b] bg-[#fff7d8] text-[#b08b29] shadow-sm">
                            <Fingerprint className="h-4.5 w-4.5" />
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-[0.34em] text-[#aa8930]">
                            Ancestorii archive
                          </span>
                        </div>

                       <h1 className="max-w-4xl text-2xl font-semibold leading-[1.05] tracking-[-0.03em] text-[#18202d] sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl break-words hyphens-auto">
                          {member.full_name}
                        </h1>

                        <p className="mt-5 max-w-3xl text-base leading-8 text-[#5d6779] sm:text-lg">
                          {introLine}
                        </p>
                      </div>

                      <div className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <FeatureLine
                          icon={CalendarDays}
                          title="Born"
                          value={formattedBirthDate}
                          accent="gold"
                        />
                        <FeatureLine
                          icon={History}
                          title="Status"
                          value={member.death_date ? "Remembered" : "Living"}
                          accent="violet"
                        />
                        <FeatureLine
                          icon={ShieldCheck}
                          title="Profile type"
                          value="Private family archive"
                          accent="mint"
                        />
                      </div>

                      <div className="grid gap-4">
                        <div className="rounded-[28px] border border-white/70 bg-white/60 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.05)]">
                          <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#e7d48f] bg-[#fff8dc] text-[#b18824]">
                              <Quote className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#9ca4b5]">
                                Story preview
                              </p>
                              <p className="mt-1 text-base font-semibold tracking-[-0.02em] text-[#202938]">
                                Written legacy
                              </p>
                            </div>
                          </div>

                          <p className="line-clamp-5 text-sm leading-7 text-[#606a7d]">
                            {storyText
                              ? storyText
                              : `A beautiful page ready to capture ${firstName}'s memories, voice, character, and everything that deserves to live on.`}
                          </p>

                          <button
                            onClick={() => {
                              setIsEditingStory(true);
                              setStoryDraft(storyText || "");
                              const el = document.getElementById(
                                "written-legacy-section"
                              );
                              if (el) {
                                el.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                              }
                            }}
                            className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#ead99b] bg-[#fff8df] px-4 py-2.5 text-sm font-semibold text-[#a37d20] transition hover:bg-[#fff2c8]"
                          >
                            <PenLine className="h-4 w-4" />
                            Open story section
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <div className="grid gap-8">
          <div className="space-y-8">
            <motion.section
              id="written-legacy-section"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/50 shadow-[0_28px_95px_rgba(0,0,0,0.08)] backdrop-blur-2xl"
              onClick={() => {
                if (!isEditingStory) {
                  setIsEditingStory(true);
                  setStoryDraft(storyText || "");
                }
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.13),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(141,119,255,0.10),transparent_32%),linear-gradient(145deg,rgba(255,255,255,0.68),rgba(255,255,255,0.32))]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/70 to-transparent" />

              <div className="relative p-5 sm:p-6 lg:p-8 xl:p-9">
                <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ead99b] bg-[#fff8dc] px-3 py-1.5 text-xs font-semibold text-[#a07a1f]">
                      <PenLine className="h-3.5 w-3.5" />
                      Written legacy
                    </div>

                    <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#18202d] sm:text-4xl lg:text-[42px]">
                      The story of {firstName}
                    </h2>

                    <p className="mt-3 max-w-4xl text-sm leading-7 text-[#5f697c] sm:text-[15px]">
                      Capture who {firstName} is, what shaped them, what made
                      them different, and the parts of them that deserve to keep
                      living on.
                    </p>
                  </div>

                  {!isEditingStory && (
                    <div className="rounded-2xl border border-[#d7d1ff] bg-[#f4f1ff] px-4 py-2.5 text-xs font-semibold text-[#6f56ed]">
                      Tap anywhere to write
                    </div>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {!isEditingStory ? (
                    <motion.div
                      key="story-display"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.28 }}
                    >
                      {storyText ? (
                        <div className="rounded-[28px] border border-white/75 bg-white/65 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.04)] sm:p-6 lg:p-7">
                          <p className="whitespace-pre-line text-[15px] leading-8 text-[#465063] sm:text-base">
                            {storyText}
                          </p>

                          <div className="mt-7 grid gap-4 border-t border-[#efe8d6] pt-6 sm:grid-cols-3">
                            <StoryMeta
                              label="Words"
                              value={`${storyText.trim().split(/\s+/).length}`}
                            />
                            <StoryMeta
                              label="Connected pieces"
                              value={`${heartPrintCount}`}
                            />
                            <StoryMeta
                              label="Status"
                              value="Saved"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                          <div className="rounded-[28px] border border-white/75 bg-white/65 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.04)] sm:p-6">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ead99b] bg-[#fff8df] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-[#a27c1f]">
                              <Stars className="h-3.5 w-3.5" />
                              Begin with something true
                            </div>
                            <p className="text-sm leading-7 text-[#5f697c]">
                              You do not need to write perfectly. Just start
                              with the real version of who {firstName} is and
                              why they matter.
                            </p>
                          </div>

                          <div className="rounded-[28px] border border-white/75 bg-white/65 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.04)] sm:p-6">
                            <p className="mb-4 text-sm font-semibold text-[#232c3b]">
                              A few prompts
                            </p>
                            <div className="space-y-3 text-sm leading-7 text-[#5f697c]">
                              <p>What made {firstName} different?</p>
                              <p>What moment with them still stays with you?</p>
                              <p>
                                What phrase, lesson or habit still echoes in
                                your life?
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="story-editor"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.28 }}
                      className="space-y-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="rounded-[30px] border border-white/75 bg-white/70 p-3 shadow-[0_16px_45px_rgba(0,0,0,0.05)]">
                        <textarea
                          value={storyDraft}
                          onChange={(e) => setStoryDraft(e.target.value)}
                          className="min-h-[320px] w-full resize-none rounded-[24px] border border-[#f0eadc] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(251,248,240,0.95))] px-4 py-4 text-[15px] leading-8 text-[#374253] outline-none placeholder:text-[#a7afbe] sm:min-h-[360px] sm:px-5 sm:py-5 sm:text-base"
                          placeholder={`Write about ${firstName}...`}
                          autoFocus
                        />
                      </div>

                      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <StoryMeta label="Words" value={`${storyWordCount}`} />
                          <StoryMeta
                            label="Page type"
                            value="Biography"
                          />
                          <StoryMeta label="Save target" value="Profile" />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditingStory(false);
                              setStoryDraft(storyText || "");
                            }}
                            className="rounded-full border border-[#e6e1d2] bg-white/70 px-5 py-3 text-sm font-semibold text-[#5c6679] transition hover:bg-white"
                          >
                            Cancel
                          </button>

                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const { error } = await supabase
                                .from("family_members")
                                .update({ biography: storyDraft || null })
                                .eq("id", member.id);

                              if (!error) {
                                setMember((prev) =>
                                  prev ? { ...prev, biography: storyDraft } : prev
                                );
                                setIsEditingStory(false);
                              }
                            }}
                            className="rounded-full border border-[#ead99b] bg-[linear-gradient(135deg,#fff7d9,#fff1bf)] px-5 py-3 text-sm font-semibold text-[#9e7820] transition hover:brightness-[1.02]"
                          >
                            Save story
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          </div>

          <motion.section
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7 }}
  className="relative"
>

{/* ARCHIVE SURFACE */}
<div className="relative rounded-[38px] border border-[#e6e1d6] bg-gradient-to-b from-white to-[#f7f4ec] shadow-[0_40px_120px_rgba(0,0,0,0.08)] overflow-hidden">

{/* subtle archival grain */}
<div className="absolute inset-0 opacity-[0.35] pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.12),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(90,110,160,0.10),transparent_50%)]" />

{/* HEADER */}
<div className="relative px-10 pt-10 pb-8 border-b border-[#ece6da]">

<h3 className="text-[34px] font-semibold tracking-[-0.03em] text-[#111827]">
Everything linked to {firstName}
</h3>

<p className="mt-3 text-[15px] leading-7 text-[#5b6474] max-w-[650px]">
This space grows as memories are connected to {firstName}.  
Timelines capture life events, albums preserve moments, and capsules hold
messages meant for the future.
</p>

{/* ACTION BUTTONS */}
<div className="mt-7 flex gap-4 flex-wrap">

<button
onClick={() => router.push("/dashboard/timeline")}
className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#1f2937] to-[#111827] text-white px-5 py-2.5 text-sm font-semibold shadow-[0_6px_18px_rgba(0,0,0,0.25)] hover:translate-y-[1px]"
>
<Clock3 className="h-4 w-4"/>
Add timeline
</button>

<button
onClick={() => router.push("/dashboard/albums")}
className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#1f2937] to-[#111827] text-white px-5 py-2.5 text-sm font-semibold shadow-[0_6px_18px_rgba(0,0,0,0.25)] hover:translate-y-[1px]"
>
<ImageIcon className="h-4 w-4"/>
Create album
</button>

<button
onClick={() => router.push("/dashboard/capsules")}
className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#1f2937] to-[#111827] text-white px-5 py-2.5 text-sm font-semibold shadow-[0_6px_18px_rgba(0,0,0,0.25)] hover:translate-y-[1px]"
>
<BookHeart className="h-4 w-4"/>
Create capsule
</button>

</div>
</div>

{/* ARTIFACT GRID */}
<div className="relative p-10 grid md:grid-cols-3 gap-8">

{/* TIMELINE CARD */}
<div
onClick={() =>
visibleTimelines[0]
? router.push(`/dashboard/timeline/${visibleTimelines[0].id}`)
: router.push("/dashboard/timeline")
}
className="relative group cursor-pointer rounded-[26px] border border-[#e4ebf7] bg-gradient-to-b from-[#f6f9ff] to-white p-7 shadow-[0_18px_40px_rgba(20,40,120,0.10)]"
>

{/* floating badge */}
<div className="absolute right-6 top-6 flex items-center justify-center h-12 w-12 rounded-xl bg-[#e6efff] text-[#3566e6] shadow-inner">
<Clock3 className="h-5 w-5"/>
</div>

<span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#3566e6]">
Timeline
</span>

<h4 className="mt-6 text-[18px] font-semibold text-[#0f172a]">
{visibleTimelines[0]?.title || "No timeline yet"}
</h4>

<p className="mt-2 text-sm text-[#667085] leading-relaxed">
{visibleTimelines[0]?.description ||
`Once a timeline is linked to ${member.full_name}, it will appear here.`}
</p>

</div>



{/* ALBUM CARD */}
<div
onClick={() =>
visibleAlbums[0]
? router.push(`/dashboard/albums/${visibleAlbums[0].id}`)
: router.push("/dashboard/albums")
}
className="relative group cursor-pointer rounded-[26px] border border-[#efe4c6] bg-gradient-to-b from-[#fffaf0] to-white p-7 shadow-[0_18px_40px_rgba(120,80,10,0.12)]"
>

<div className="absolute right-6 top-6 flex items-center justify-center h-12 w-12 rounded-xl bg-[#fff1cf] text-[#b7791f] shadow-inner">
<ImageIcon className="h-5 w-5"/>
</div>

<span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#b7791f]">
Album
</span>

<h4 className="mt-6 text-[18px] font-semibold text-[#0f172a]">
{visibleAlbums[0]?.title || "No album yet"}
</h4>

<p className="mt-2 text-sm text-[#667085] leading-relaxed">
{visibleAlbums[0]?.description ||
`Albums featuring ${member.full_name} will appear here.`}
</p>

</div>



{/* CAPSULE CARD */}
<div
onClick={() =>
visibleCapsules[0]
? router.push(`/dashboard/capsules/${visibleCapsules[0].id}`)
: router.push("/dashboard/capsules")
}
className="relative group cursor-pointer rounded-[26px] border border-[#e6defc] bg-gradient-to-b from-[#f8f6ff] to-white p-7 shadow-[0_18px_40px_rgba(80,50,140,0.12)]"
>

<div className="absolute right-6 top-6 flex items-center justify-center h-12 w-12 rounded-xl bg-[#ede9fe] text-[#7c3aed] shadow-inner">
<BookHeart className="h-5 w-5"/>
</div>

<span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#7c3aed]">
Capsule
</span>

<h4 className="mt-6 text-[18px] font-semibold text-[#0f172a]">
{visibleCapsules[0]?.title || "No capsule yet"}
</h4>

<p className="mt-2 text-sm text-[#667085] leading-relaxed">
{visibleCapsules[0]?.message ||
`Capsules created for ${member.full_name} will appear here.`}
</p>

</div>

</div>
</div>
</motion.section>
        </div>

        <footer className="pt-14">
          <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/50 px-6 py-10 text-center shadow-[0_25px_90px_rgba(0,0,0,0.07)] backdrop-blur-2xl sm:px-8 sm:py-12">
            <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.72),rgba(255,255,255,0.34))]" />
            <div className="relative">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[22px] border border-[#ead99b] bg-[#fff7d8] text-[#b08a29] shadow-sm">
                <Orbit className="h-6 w-6" />
              </div>

              <p className="text-[11px] font-bold uppercase tracking-[0.36em] text-[#ab8a31]">
                Ancestorii permanent record
              </p>

              <p className="mx-auto mt-4 max-w-3xl text-sm leading-8 text-[#5e687b] sm:text-base">
                This page gathers every visible piece of {member.full_name}
                &apos;s legacy across Ancestorii into one clean, living memory
                space.
              </p>

              <p className="mt-6 text-xs italic tracking-[0.14em] text-[#8d95a4]">
                Preserving stories, albums, milestones and messages with care.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function TopActions({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <button
        onClick={() => router.push("/dashboard/family")}
        className="group inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/60 px-4 py-2.5 text-sm font-semibold text-[#2c3443] shadow-[0_8px_25px_rgba(0,0,0,0.05)] backdrop-blur-xl transition hover:bg-white"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to your loved ones
      </button>

      <div className="hidden rounded-full border border-white/75 bg-white/60 px-3 py-1.5 text-xs sm:px-4 sm:py-2 font-semibold uppercase tracking-[0.24em] text-[#8f96a6] shadow-[0_8px_25px_rgba(0,0,0,0.05)] backdrop-blur-xl md:block">
        Legacy profile
      </div>
    </div>
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

function MiniAction({
  icon: Icon,
}: {
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button className="flex h-11 w-11 items-center justify-center rounded-full border border-white/75 bg-white/65 text-[#697386] shadow-[0_8px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl transition hover:bg-white hover:text-[#242d3b]">
      <Icon className="h-4.5 w-4.5" />
    </button>
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
    <div className="rounded-[24px] border border-white/75 bg-white/65 p-4 shadow-[0_14px_35px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${accentMap[accent].iconWrap}`}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9ca4b5]">
            {title}
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-[#1f2735]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChecklistRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#c8f2e7] bg-[#ecfffb] text-[#14816a]">
        <CheckCircle2 className="h-3.5 w-3.5" />
      </div>
      <p className="text-sm leading-7 text-[#5f697c]">{text}</p>
    </div>
  );
}

function CinematicSideCard({
  icon: Icon,
  title,
  subtitle,
  accent,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  accent: "gold" | "mint" | "violet";
  children: React.ReactNode;
}) {
  const accentMap = {
    gold: {
      wrap: "border-[#ead99b] bg-[linear-gradient(145deg,rgba(255,255,255,0.72),rgba(255,248,221,0.88))]",
      iconWrap: "border-[#ead99b] bg-white/80 text-[#b18824]",
      badge: "text-[#a9852d]",
    },
    mint: {
      wrap: "border-[#c8f2e7] bg-[linear-gradient(145deg,rgba(255,255,255,0.72),rgba(236,255,251,0.88))]",
      iconWrap: "border-[#c8f2e7] bg-white/80 text-[#14826b]",
      badge: "text-[#177b66]",
    },
    violet: {
      wrap: "border-[#d9d3ff] bg-[linear-gradient(145deg,rgba(255,255,255,0.72),rgba(244,241,255,0.88))]",
      iconWrap: "border-[#d9d3ff] bg-white/80 text-[#7058ee]",
      badge: "text-[#745fec]",
    },
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[32px] border p-5 shadow-[0_22px_65px_rgba(0,0,0,0.06)] sm:p-6 ${accentMap[accent].wrap}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/45 to-transparent" />
      <div className="relative">
        <div className="mb-4 flex items-start gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${accentMap[accent].iconWrap}`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div>
            <p
              className={`text-[10px] font-bold uppercase tracking-[0.28em] ${accentMap[accent].badge}`}
            >
              Profile detail
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#202938]">
              {title}
            </h3>
          </div>
        </div>

        <p className="mb-5 text-sm leading-7 text-[#5f697c]">{subtitle}</p>

        {children}
      </div>
    </div>
  );
}

function SoftMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[22px] border border-white/75 bg-white/75 p-3 text-center shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9ca4b5]">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#1f2735]">
        {value}
      </p>
    </div>
  );
}

function SideInfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[20px] border border-white/75 bg-white/75 px-4 py-3 shadow-sm">
      <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9ca4b5]">
        {label}
      </span>
      <span className="text-sm font-semibold text-[#232c3b]">{value}</span>
    </div>
  );
}

function StoryMeta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/75 bg-white/75 p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9ca4b5]">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold tracking-[-0.02em] text-[#1f2735]">
        {value}
      </p>
    </div>
  );
}

function EmptyGalleryState({
  title,
  text,
  icon: Icon,
}: {
  title: string;
  text: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-[30px] border border-dashed border-[#d6dded] bg-white/60 p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/80 bg-white/80 text-[#c59b31] shadow-sm">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-lg font-semibold tracking-[-0.02em] text-[#1f2735]">
        {title}
      </p>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#5f697c]">
        {text}
      </p>
    </div>
  );
}

function ArtifactSection({
  title,
  subtitle,
  emptyText,
  items,
  remaining,
  onViewMore,
  icon,
  accent,
  ctaLabel,
  onPrimaryClick,
}: {
  title: string;
  subtitle: string;
  emptyText: string;
  items: ArtifactCardItem[];
  remaining: number;
  onViewMore: () => void;
  icon: React.ReactNode;
  accent: "gold" | "emerald" | "violet";
  ctaLabel: string;
  onPrimaryClick: () => void;
}) {
  const accentMap = {
    gold: {
      pill: "border-[#ead99b] bg-[#fff8df] text-[#a27c1f]",
      line: "from-[#d4af37] via-[#f0d489]/70 to-transparent",
      card:
        "border-white/75 bg-[linear-gradient(145deg,rgba(255,255,255,0.78),rgba(255,248,222,0.50))] hover:border-[#ead99b] hover:bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(255,244,204,0.72))]",
      meta: "text-[#8f7428]",
      more: "text-[#a27c1f] hover:text-[#6a5111]",
      cta: "border-[#ead99b] bg-[#fff8df] text-[#a27c1f] hover:bg-[#fff1c7]",
    },
    emerald: {
      pill: "border-[#c8f2e7] bg-[#ecfffb] text-[#157c66]",
      line: "from-[#32d5b2] via-[#8cebd8]/70 to-transparent",
      card:
        "border-white/75 bg-[linear-gradient(145deg,rgba(255,255,255,0.78),rgba(236,255,251,0.55))] hover:border-[#bdf5e9] hover:bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(222,252,245,0.78))]",
      meta: "text-[#187763]",
      more: "text-[#157c66] hover:text-[#0e5344]",
      cta: "border-[#c8f2e7] bg-[#ecfffb] text-[#157c66] hover:bg-[#ddfbf3]",
    },
    violet: {
      pill: "border-[#d9d3ff] bg-[#f4f1ff] text-[#7058ee]",
      line: "from-[#8d77ff] via-[#cbc2ff]/70 to-transparent",
      card:
        "border-white/75 bg-[linear-gradient(145deg,rgba(255,255,255,0.78),rgba(244,241,255,0.58))] hover:border-[#d2c9ff] hover:bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(237,232,255,0.84))]",
      meta: "text-[#6d5cb0]",
      more: "text-[#7058ee] hover:text-[#4a36b5]",
      cta: "border-[#d9d3ff] bg-[#f4f1ff] text-[#7058ee] hover:bg-[#ebe6ff]",
    },
  };

  const styles = accentMap[accent];

  return (
    <section>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold leading-7 text-[#1f2735] sm:text-lg">
            {title}
          </h4>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[#d6dded] bg-white/55 p-4">
          <p className="text-sm leading-7 text-[#647084]">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`group w-full rounded-[24px] border p-4 text-left shadow-[0_12px_35px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 ${styles.card}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#1f2735] sm:text-[15px]">
                    {item.title}
                  </p>
                  {item.description ? (
                    <p className={`mt-1 text-xs leading-6 sm:text-sm ${styles.meta}`}>
                      {item.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {item.locked && (
                    <div className="rounded-full border border-white/80 bg-white/75 p-2 text-[#7666b9] shadow-sm">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div className="rounded-full border border-white/80 bg-white/75 p-2 text-[#697386] shadow-sm transition group-hover:text-[#1f2735]">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onPrimaryClick}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${styles.cta}`}
        >
          {ctaLabel}
          <ChevronRight className="h-4 w-4" />
        </button>

        {remaining > 0 && (
          <button
            onClick={onViewMore}
            className={`inline-flex items-center gap-2 text-sm font-semibold transition ${styles.more}`}
          >
            +{remaining} more
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </section>
  );
}

function SoftNote({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/75 bg-white/75 p-4 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-[#202938]">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="text-sm font-semibold text-[#202938]">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[#5f697c]">{text}</p>
    </div>
  );
}

function Tag({
  text,
  tone,
}: {
  text: string;
  tone: "gold" | "mint" | "violet";
}) {
  const toneMap = {
    gold: "border-[#ead99b] bg-[#fff8df] text-[#a27c1f]",
    mint: "border-[#c8f2e7] bg-[#ecfffb] text-[#157c66]",
    violet: "border-[#d9d3ff] bg-[#f4f1ff] text-[#7058ee]",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${toneMap[tone]}`}
    >
      {text}
    </span>
  );
}

function FeaturedArtifactCard({
  label,
  title,
  description,
  icon: Icon,
  onClick,
}: {
  label: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-[30px] border border-white/70 bg-white/65 text-left shadow-[0_18px_50px_rgba(0,0,0,0.06)]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(0,0,0,0.08))]" />

      <div className="relative aspect-[4/5] bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.16),transparent_35%),linear-gradient(160deg,#fffdf8,#f5ecda_46%,#ece6ff)]">

        <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-[#147b65] shadow-sm">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/70 bg-white/55 text-[#d4af37] shadow-[0_12px_35px_rgba(0,0,0,0.06)] transition duration-300 group-hover:scale-105">
            <Icon className="h-8 w-8" />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="rounded-[24px] border border-white/70 bg-white/70 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.05)] backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9aa2b3]">
              Featured
            </p>

            <h4 className="mt-2 line-clamp-2 text-xl font-semibold tracking-[-0.03em] text-[#1f2735]">
              {title}
            </h4>

            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#687183]">
              {description}
            </p>
          </div>
        </div>

      </div>
    </button>
  );
}