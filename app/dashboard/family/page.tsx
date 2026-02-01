"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import AddMemberModal from "./_components/AddMemberModal";
import LovedOneSection from "./_components/LovedOneSection";
import LovedOneEmptyState from "./_components/LovedOneEmptyState";
import DeleteLovedOneModal from "./_components/DeleteLovedOneModal";
import { getLovedOneGroups } from "./_utils/getLovedOneGroups";
import { getBrowserClient } from "@/lib/supabase/browser";
import { safeToast as toast } from "@/lib/safeToast";
import { useSearchParams } from "next/navigation";


const Particles = dynamic(() => import("@/components/ParticlesPlatform"), {
  ssr: false,
});

type FamilyMember = {
  id: string;
  full_name: string;
  relationship_to_user?: string | null; // 🔑 REQUIRED
  birth_date?: string | null;
  death_date?: string | null;
  biography?: string | null;
  avatar_url?: string | null;
  avatar_signed?: string | null;
};

type Relationship = {
  id: string;
  member_a: string;
  member_b: string;
  role: string;
};

export default function FamilyPage() {
  const supabase = getBrowserClient();

  const [addOpen, setAddOpen] = useState(false);
  const [editMember, setEditMember] = useState<FamilyMember | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(Date.now());
  const reload = useCallback(() => setRefreshKey(Date.now()), []);

  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [groups, setGroups] = useState<Record<string, FamilyMember[]> | null>(null);
  const searchParams = useSearchParams();
  const shouldOpenAdd = searchParams.get("add") === "true";

  const TYPING_KEY = "loved_ones_typing_last_run";
  const TYPING_RESET_MS = 24 * 60 * 60 * 1000; // 24 hours
  const router = useRouter();


  // ✅ PUT THIS INSIDE FamilyPage() (same place Albums has it)
const line1 = '“The people who shaped your life — remembered forever.”';
const line2 = 'Add your loved ones and preserve their stories, memories, and legacy.';
const [typed1, setTyped1] = useState('');
const [typed2, setTyped2] = useState('');
const [isTyping1Done, setIsTyping1Done] = useState(false);
const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

useEffect(() => {
  (async () => {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess?.session?.user?.id;
    if (!uid) return;

    const { data } = await supabase.rpc('has_active_subscription', { uid });
    setHasSubscription(!!data);
  })();
}, []);


useEffect(() => {
  if (shouldOpenAdd) {
    setAddOpen(true);
  }
}, [shouldOpenAdd]);

useEffect(() => {
  const lastRun = localStorage.getItem(TYPING_KEY);
  const now = Date.now();

  if (lastRun && now - Number(lastRun) < TYPING_RESET_MS) {
    setTyped1(line1);
    setTyped2(line2);
    setIsTyping1Done(true);
    return;
  }

  localStorage.setItem(TYPING_KEY, String(now));

  let i1 = 0,
    i2 = 0,
    t1: any,
    t2: any;

  const speed = 45;

  t1 = setInterval(() => {
    i1++;
    setTyped1(line1.slice(0, i1));

    if (i1 >= line1.length) {
      clearInterval(t1);
      setIsTyping1Done(true);

      const start2 = setTimeout(() => {
        t2 = setInterval(() => {
          i2++;
          setTyped2(line2.slice(0, i2));
          if (i2 >= line2.length) clearInterval(t2);
        }, speed);
      }, 600);
    }
  }, speed);

  return () => {
    clearInterval(t1);
    clearInterval(t2);
  };
}, []);


  /* ===========================================================
      LOAD MEMBER COUNT
  ============================================================*/
  const fetchFamilyMeta = useCallback(async () => {
    const { data: sess } = await supabase.auth.getSession();
    const user = sess?.session?.user;
    if (!user) return;

    const { count } = await supabase
      .from("family_members")
      .select("id", { head: true, count: "exact" })
      .eq("owner_id", user.id);

    setMemberCount(count || 0);
  }, [supabase]);

  useEffect(() => {
    (async () => {
      await fetchFamilyMeta();
      setLoading(false);
    })();
  }, [fetchFamilyMeta]);

  /* ===========================================================
      LOAD MEMBERS + RELATIONSHIPS
  ============================================================*/
 useEffect(() => {
  const loadData = async () => {
    setMembersLoading(true);

    const { data: sess } = await supabase.auth.getSession();
    const user = sess?.session?.user;
    if (!user) {
      setMembersLoading(false);
      return;
    }

    const { data: memberRows, error: memErr } = await supabase
      .from("family_members")
      .select("id, full_name, birth_date, death_date, biography, avatar_url, relationship_to_user")
      .eq("owner_id", user.id)
      .order("full_name", { ascending: true });

    if (memErr) {
      console.error(memErr);
      setMembersLoading(false);
      return;
    }

    const membersData = (memberRows || []) as FamilyMember[];

    const withSigned = await Promise.all(
      membersData.map(async (m) => {
        if (!m.avatar_url) return m;
        const { data: signed, error } = await supabase.storage
          .from("user-media")
          .createSignedUrl(m.avatar_url, 60 * 60);
        if (error || !signed?.signedUrl) return m;
        return {
          ...m,
          avatar_signed: `${signed.signedUrl}&cb=${Date.now()}`,
        };
      })
    );

    setMembers(withSigned);

    const { data: relRows } = await supabase
      .from("family_relationships")
      .select("id, member_a, member_b, role")
      .eq("owner_id", user.id);

    setRelationships((relRows || []) as Relationship[]);

    const grouped = getLovedOneGroups(withSigned);

    setMembersLoading(false); // ✅ ONLY HERE
  };

  loadData();
}, [refreshKey, supabase]);

// ✅ ADD THIS RIGHT HERE
useEffect(() => {
  setGroups(getLovedOneGroups(members));
}, [members]);


  /* ===========================================================
      OPEN EDIT MEMBER
  ============================================================*/
  useEffect(() => {
    const handler = (e: any) => {
      const id = e.detail?.memberId;
      if (!id) return;
      const found = members.find((m) => m.id === id) || null;
      setEditMember(found);
      setAddOpen(true);
    };

    window.addEventListener("open-edit-member", handler);
    return () => window.removeEventListener("open-edit-member", handler);
  }, []);

  /* ===========================================================
      MEMBER CREATED / UPDATED
  ============================================================*/
  const handleCreateMember = async (id: string | null) => {
  setAddOpen(false);
  if (!id) return;

  // 🔑 Force server re-fetch so dashboard/banner updates
  router.refresh();

  // Keep your existing client reload
  reload();
};


  const handleEditMember = (id: string) => {
    const found = members.find((m) => m.id === id) || null;
    setEditMember(found);
    setAddOpen(true);
  };

 const handleDeleteMember = async (id: string) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("family_members")
      .delete()
      .eq("id", id);

    if (error) throw error;

    toast.success("Loved one removed from your legacy.");
    setMembers((prev) => prev.filter((m) => m.id !== id)); // ✅ instant UI
    reload();
  } catch (err: any) {
  console.error("DELETE FAILED:", {
    message: err?.message,
    details: err?.details,
    hint: err?.hint,
    code: err?.code,
  });
  toast.error("Failed to delete loved one.");
}
};


  /* ===========================================================
      UI
  ============================================================*/
  return (
    <div className="relative min-h-screen overflow-hidden font-[Inter] bg-gradient-to-b from-white via-[#fdf7ea] to-[#faf6e3]">
      <Particles />

      <DeleteLovedOneModal
  open={!!deleteTarget}
  onClose={() => setDeleteTarget(null)}
  onConfirm={async () => {
    await handleDeleteMember(deleteTarget!);
    setDeleteTarget(null);
  }}
/>


      {/* ---------- MODAL ---------- */}
      <AddMemberModal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setEditMember(null);
        }}
        mode={editMember ? "edit" : "create"}
        member={editMember}
        onCreated={handleCreateMember}
        onUpdated={() => {
          setAddOpen(false);
          setEditMember(null);
          reload();
        }}
      />

      {/* ---------- LOADING ---------- */}
      {loading && (
        <div className="flex justify-center pt-20 text-lg text-[#C8A557]">
          Loading your loved ones…
        </div>
      )}

      {/* ---------- EMPTY STATE ---------- */}
      {!loading && !membersLoading && members.length === 0 && (
         <LovedOneEmptyState onAdd={() => setAddOpen(true)} />
      )}

      {/* ---------- MAIN UI ---------- */}
      {!loading && !membersLoading && members.length > 0 && (
        <div className="relative z-10 px-6 sm:px-8 pt-16 pb-16 max-w-7xl mx-auto">
         {/* ✅ REPLACE YOUR HEADER WITH THIS (1:1 Albums header, just “Loved Ones”) */}
<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 mb-14">
  <div className="text-center md:text-left flex-1">
    <h1 className="text-4xl md:text-5xl font-bold text-[#222B3A] mb-4 relative inline-block">
      <span className="relative">
        My
        <motion.span
          className="absolute left-0 -bottom-2 h-[3px] bg-[#C8A557] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: 70 }}
          transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
        />
      </span>{' '}
      <span className="text-[#C8A557]">Loved Ones</span>
    </h1>

    <p className="text-[#5B6473] mt-3 text-lg italic min-h-[30px]">{typed1}</p>
    <p
      className={`text-[#7A8596] text-sm mt-2 transition-opacity duration-500 ${
        isTyping1Done ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {typed2}
    </p>
  </div>

  <div className="flex justify-center md:justify-end flex-1">
    <button
      className="px-8 py-4 rounded-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837] font-semibold text-lg shadow-md hover:shadow-lg transition-transform hover:scale-[1.03] relative overflow-hidden"
      onClick={() => {
  if (loading || hasSubscription === null) return;

  if (!hasSubscription && memberCount >= 1) {
    toast.error(
      "You’ve reached your current plan limit for loved ones. Upgrade to add more."
    );
    return;
  }

  setAddOpen(true);
}}

    >
      <span className="relative z-10">+ Add A Loved One</span>
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shine_3s_linear_infinite]" />
    </button>
  </div>
</div>
          {/* ---------- GROUPED CARDS ---------- */}
          {groups && (
            <div className="space-y-10">
              <LovedOneSection title="My Parents" members={groups.Parents} onEdit={handleEditMember} onDelete={(id) => setDeleteTarget(id)} />
              <LovedOneSection title="My Siblings" members={groups.Siblings} onEdit={handleEditMember} onDelete={(id) => setDeleteTarget(id)} />
              <LovedOneSection title="My Children" members={groups.Children} onEdit={handleEditMember} onDelete={(id) => setDeleteTarget(id)} />
              <LovedOneSection title="My Spouse / Partner" members={groups.SpousePartner} onEdit={handleEditMember} onDelete={(id) => setDeleteTarget(id)} />
              <LovedOneSection title="My Aunties & Uncles" members={groups.AuntiesUncles} onEdit={handleEditMember} onDelete={(id) => setDeleteTarget(id)} />
              <LovedOneSection title="My Grandparents" members={groups.Grandparents} onEdit={handleEditMember} onDelete={(id) => setDeleteTarget(id)} />
              <LovedOneSection title="My Extended Family" members={groups.ExtendedFamily} onEdit={handleEditMember} onDelete={(id) => setDeleteTarget(id)} />
              <LovedOneSection title="My Friends" members={groups.Friends} onEdit={handleEditMember}onDelete={(id) => setDeleteTarget(id)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// ✅ ALSO ADD THIS (copy from Albums) somewhere in your FamilyPage return (global style block)
// If you already have it globally, skip this.
<style jsx global>{`
  @keyframes shine {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`}</style>

