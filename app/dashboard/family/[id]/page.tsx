"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowLeft, Heart } from "lucide-react";

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

export default function LovedOneProfilePage() {
  const supabase = getBrowserClient();
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<FamilyMember | null>(null);

  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [capsules, setCapsules] = useState<Capsule[]>([]);

  // ADD THIS DIRECTLY BELOW 👇
  const MAX_VISIBLE = 5;

  // inline story editing
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [storyDraft, setStoryDraft] = useState("");

  /* ============================
        FETCH MEMBER + LINKS
  ============================ */
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
      signedAvatar = signed?.signedUrl || null;
    }

    const memberWithAvatar: FamilyMember = {
      ...data,
      avatar_signed: signedAvatar,
    };

    setMember(memberWithAvatar);
    setStoryDraft(data.biography || "");

const user = (await supabase.auth.getUser()).data.user;

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
    .eq("family_member_id", data.id)
]);


setTimelines(tlRes.data || []);



setAlbums(
  albRes.data?.map((x: any) => x.albums).filter(Boolean) || []
);

setCapsules(
  capRes.data
    ?.map((x: any) => x.memory_capsules)
    .filter(Boolean) || []
);

    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  /* ============================
        LIFESPAN / CELEBRATION
  ============================ */
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

    const firstName =
      member.full_name?.split(" ").length > 0
        ? member.full_name.split(" ")[0]
        : member.full_name;

    return {
      label: `${firstName}'s ${ageTurning}ᵗʰ birthday is in ${daysDiff} day${
        daysDiff === 1 ? "" : "s"
      }.`,
      daysDiff,
      ageTurning,
    };
  }, [member]);

  /* ============================
           HEART-PRINT
  ============================ */
  const heartPrintCount =
    timelines.length + albums.length + capsules.length;

  /* ============================
             STORY TEXT
  ============================ */
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


  /* ============================
              UI
  ============================ */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-[#fbf6e8] to-[#f8f1dd]">
        <p className="text-[#C8A557] text-lg">Loading their space…</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-[#fbf6e8] to-[#f8f1dd]">
        <p className="text-[#C8A557] text-lg">Loved one not found.</p>
      </div>
    );
  }

  const firstName =
    member.full_name?.split(" ").length > 0
      ? member.full_name.split(" ")[0]
      : member.full_name;

  return (
    <div className="relative min-h-screen overflow-hidden font-[Inter] bg-gradient-to-b from-white via-[#fbf6e8] to-[#f8f1dd]">
      <Particles />

      {/* TOP SECTION */}
      <div className="absolute inset-x-0 top-4 flex items-center justify-start px-6 sm:px-10 z-20">
        <button
          onClick={() => router.push("/dashboard/family")}
          className="flex items-center gap-2 text-[#000000] hover:text-[#C8A557] transition text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to your loved ones
        </button>
      </div>

      <div className="relative z-10 max-w-[1500px] mx-auto px-8 pt-28 pb-24">
        {/* HEADER */}
        <div className="flex items-start gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-[150px] h-[150px]"
          >
            <div className="absolute inset-0 rounded-full bg-[#E6C26E]/40 blur-xl" />
            <div className="absolute inset-0 rounded-full bg-[#E6C26E]/20 blur-2xl" />

            <img
              src={member.avatar_signed || "/default-avatar.png"}
              alt={member.full_name}
              className="relative z-10 w-full h-full rounded-full border-4 border-[#E6C26E] object-cover shadow-xl"
            />
          </motion.div>

          <div className="flex flex-col">
            {/* Name with subtle serif shadow */}
            <div className="mb-2">
              <h1
              className="
              text-5xl font-bold
               text-[#d4af37]
               drop-shadow-[0_1px_3px_rgba(0,0,0,0.10)]
               "
                >
                  {member.full_name}
                </h1>
            </div>
           

            <p className="flex items-center gap-3 mb-3 text-lg">
             <span className="text-[#D4AF37]/80 font-semibold">
             Loved One
             </span>

             <span className="text-[#C8C6B2]">|</span>

             <span className="text-gray-700 font-medium">
              {lifespan}
             </span>
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center gap-2 px-5 h-[42px] rounded-full bg-emerald-50 border border-emerald-200 shadow-sm text-sm text-emerald-700">
                <Heart className="w-4 h-4 fill-[#E6C26E] text-[#E6C26E]" />
                {heartPrintCount > 0 ? (
                  <span>{heartPrintCount} memories linked</span>
                ) : (
                  <span>No memories linked yet</span>
                )}
              </div>

              {nextCelebration && (
                <div className="inline-flex items-center gap-2 px-5 h-[42px] rounded-full bg-violet-50 border border-violet-200 shadow-sm text-sm text-violet-700">
                  🎉 {nextCelebration.label}
                </div>
              )}
            </div>
          </div>
        </div>
                {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12">
          {/* LEFT COLUMN — STORY CARD (click to edit) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/90 border border-[#E6C26E]/30 rounded-2xl p-10 shadow-lg cursor-text"
            onClick={() => {
              if (!isEditingStory) {
                setIsEditingStory(true);
                setStoryDraft(storyText || "");
              }
            }}
          >
            <h2 className="text-2xl font-semibold text-[#0f2040] mb-3">
              {firstName}'s Written Legacy
            </h2>

            <p className="text-sm text-[#353535] mb-6 max-w-[560px]">
           A space to capture who {firstName} truly is — their character, lessons,
           and the moments that shaped your bond. This will live on as part of their
           legacy.
           </p>

            {/* READ MODE */}
            {!isEditingStory && (
              <>
                {storyText ? (
                  <p className="text-[#76735F] leading-relaxed whitespace-pre-line">
                    {storyText}
                  </p>
                ) : (
                  <>

                    <div className="bg-emerald-50 border border-[#E6C26E]/40 rounded-xl p-6">
                      <p className="font-semibold text-[#1F2837] mb-3">
                        Need inspiration?
                      </p>
                      <ul className="text-[#353535]/75 text-sm space-y-6 list-disc list-inside">
                        <li>What's the funniest moment you ever shared?</li>
                        <li>What is one thing {member.full_name} taught you?</li>
                        <li>
                          If you could tell {member.full_name} one thing today, what
                          would you want them to know?
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </>
            )}

            {/* EDIT MODE */}
            {isEditingStory && (
              <div
                className="space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-sm font-medium text-[#B08A33]">
                  Words that live on.
                </p>
                 <div 
                 className="bg-white border border-[#E6C26E] rounded-xl p-4 shadow-inner"> 
                <textarea
                  value={storyDraft}
                  onChange={(e) => setStoryDraft(e.target.value)}
                   className="w-full min-h-[220px] bg-transparent outline-none text-sm text-[#4B4A37] leading-relaxed resize-none"
                  autoFocus
                />
                </div>
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
                  className="ml-auto block text-sm font-medium text-[#B08A33] hover:text-[#CFAD4A]"
                >
                  Save ✦
                </button>
              </div>
            )}
          </motion.div>

          {/* RIGHT COLUMN — CONTENT HUB */}
          <div className="space-y-10">
            {/* TIMELINES */}
            <section>
              <h3 className="text-lg font-semibold text-[#000000] mb-2">
                Timelines connected to {member.full_name}
              </h3>
              <div className="border-b border-violet-300/60 mb-4" />

              {timelines.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  This space is ready for your memories—start a new Timeline anytime.
                </p>
              ) : (
                <div className="space-y-3">
                  {visibleTimelines.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => router.push(`/dashboard/timeline/${t.id}`)}
                      className="w-full text-left bg-white border border-[#E6C26E] ring-1 ring-black/5  rounded-xl px-5 py-4  shadow-[0_8px_24px_rgba(0,0,0,0.06)] 
                      transition-all duration-200 hover:shadow-[0_14px_36px_rgba(230,194,110,0.35)] hover:-translate-y-1"
                    >
                      <p className="text-sm font-semibold text-[#0f2040]">
                        {t.title || "Untitled timeline"}{" "}
                        <span className="text-[#C8A557]">➜</span>
                      </p>
                      {t.description && (
                        <p className="text-xs text-[#353535] mt-1 line-clamp-2">
                          {t.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {remainingTimelines > 0 && (
              <button
               onClick={() => router.push("/dashboard/timeline")}
               className="text-sm font-medium text-[#C8A557] hover:underline mt-3"
               >
              +{remainingTimelines} more timelines →
               </button>
              )}
            </section>

            {/* ALBUMS */}
            <section>
              <h3 className="text-lg font-semibold text-[#000000] mb-2">
                Albums featuring {member.full_name}
              </h3>
              <div className="border-b border-violet-300/60 mb-4" />

              {albums.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  When you tag {member.full_name} in an Album, it will appear here.
                </p>
              ) : (
                <div className="space-y-3">
                  {visibleAlbums.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => router.push(`/dashboard/albums/${a.id}`)}
                      className="w-full text-left bg-white border border-[#E6C26E] ring-1 ring-black/5  rounded-xl px-5 py-4  shadow-[0_8px_24px_rgba(0,0,0,0.06)] 
                      transition-all duration-200 hover:shadow-[0_14px_36px_rgba(230,194,110,0.35)] hover:-translate-y-1"
                    >
                      <p className="text-sm font-semibold text-[#0f2040]">
                        {a.title || "Untitled album"}{" "}
                        <span className="text-[#C8A557]">➜</span>
                      </p>
                      {a.description && (
                        <p className="text-xs text-[#353535] mt-1 line-clamp-2">
                          {a.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {remainingAlbums > 0 && (
              <button
               onClick={() => router.push("/dashboard/albums")}
               className="text-sm font-medium text-[#C8A557] hover:underline mt-3"
               >
               +{remainingAlbums} more albums →
               </button>
               )}
            </section>

            {/* CAPSULES */}
<section>
  <h3 className="text-lg font-semibold text-[#000000] mb-2">
    Capsules for {member.full_name}
  </h3>
  <div className="border-b border-violet-300/60 mb-4" />

  {capsules.length === 0 ? (
    <p className="text-gray-500 text-sm">
      Capsules you create for {member.full_name} will gather here.
    </p>
  ) : (
    <div className="space-y-3">
      {visibleCapsules.map((c) => {
        const isLocked = c.is_locked === true;


        return (
          <button
            key={c.id}
            onClick={() => {
              if (isLocked) {
                router.push("/dashboard/capsules");
              } else {
                router.push(`/dashboard/capsules/${c.id}`);
              }
            }}
            className="w-full text-left bg-white border border-[#E6C26E] ring-1 ring-black/5  rounded-xl px-5 py-4  shadow-[0_8px_24px_rgba(0,0,0,0.06)] 
                      transition-all duration-200 hover:shadow-[0_14px_36px_rgba(230,194,110,0.35)] hover:-translate-y-1"
          >
            <p className="text-sm font-semibold text-[#0f2040]">
              {c.title || "Untitled capsule"}
              <span className="text-[#C8A557]"> ➜</span>
            </p>

            {c.unlock_date && (
              <p className="text-xs text-[#C8A557] mt-1">
                Unlocks on{" "}
                {new Date(c.unlock_date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
          </button>
        );
      })}
    </div>
  )}
  {remainingCapsules > 0 && (
  <button
    onClick={() => router.push("/dashboard/capsules")}
    className="text-sm font-medium text-[#C8A557] hover:underline mt-3"
  >
    +{remainingCapsules} more capsules →
  </button>
)}
</section>

          </div>
        </div>

        {/* FOOTER */}
        <p className="text-[#9A977F] text-xs italic mt-16 text-center">
          This page gathers every piece of their legacy across Ancestorii.
        </p>
      </div>
    </div>
  );
}

