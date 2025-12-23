"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

import AddMemberModal from "./_components/AddMemberModal";
import LovedOneSection from "./_components/LovedOneSection";
import LovedOneEmptyState from "./_components/LovedOneEmptyState";
import DeleteLovedOneModal from "./_components/DeleteLovedOneModal";
import { getLovedOneGroups } from "./_utils/getLovedOneGroups";
import { getBrowserClient } from "@/lib/supabase/browser";
import { safeToast as toast } from "@/lib/safeToast";

const Particles = dynamic(() => import("@/components/ParticlesPlatform"), {
  ssr: false,
});

type FamilyMember = {
  id: string;
  full_name: string;
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

  const [playAnimation, setPlayAnimation] = useState(false);

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [groups, setGroups] = useState<Record<string, FamilyMember[]> | null>(null);

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
      .eq("owner_id", user.id)
      .is("deleted_at", null);

    setMemberCount(count || 0);
  }, [supabase]);

  useEffect(() => {
    (async () => {
      await fetchFamilyMeta();
      setLoading(false);
    })();
  }, [fetchFamilyMeta]);

  /* ===========================================================
      24H animation gate
  ============================================================*/
  useEffect(() => {
    const key = "myLovedOnesAnimationTimestamp";
    const last = localStorage.getItem(key);
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    if (!last || now - Number(last) > day) {
      setPlayAnimation(true);
      localStorage.setItem(key, String(now));
    } else {
      setPlayAnimation(false);
    }
  }, []);

  /* ===========================================================
      LOAD MEMBERS + RELATIONSHIPS
  ============================================================*/
  useEffect(() => {
    const loadData = async () => {
      if (memberCount === 0) return;

      const { data: sess } = await supabase.auth.getSession();
      const user = sess?.session?.user;
      if (!user) return;

      const { data: memberRows, error: memErr } = await supabase
        .from("family_members")
        .select("id, full_name, birth_date, death_date, biography, avatar_url, relationship_to_user")
        .eq("owner_id", user.id)
        .is("deleted_at", null)
        .order("full_name", { ascending: true });

      if (memErr) {
        console.error(memErr);
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

      const { data: relRows, error: relErr } = await supabase
        .from("family_relationships")
        .select("id, member_a, member_b, role")
        .eq("owner_id", user.id)
        .is("deleted_at", null);

      const rels = (relRows || []) as Relationship[];
      setRelationships(rels);

      const grouped = getLovedOneGroups(withSigned);
      setGroups(grouped);
    };

    loadData();
  }, [memberCount, refreshKey, supabase]);

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
    setMemberCount((c) => c + 1);
    reload();
  };

  const handleEditMember = (id: string) => {
    const found = members.find((m) => m.id === id) || null;
    setEditMember(found);
    setAddOpen(true);
  };

  const handleDeleteMember = async (id: string) => {
    try {
      const { error } = await supabase.from("family_members").delete().eq("id", id);
      if (error) throw error;
      toast.success("Loved one removed from your legacy.");
      reload();
      setMemberCount((c) => Math.max(0, c - 1));
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete loved one. Please try again.");
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
      {!loading && memberCount === 0 && (
        <LovedOneEmptyState onAdd={() => setAddOpen(true)} />
      )}

      {/* ---------- MAIN UI ---------- */}
      {!loading && memberCount > 0 && (
        <div className="relative z-10 px-6 sm:px-8 pt-16 pb-16 max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 mb-14">
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-[#1F2837] mb-4 relative inline-block">
                <span className="relative inline-block">
                  My
                  {playAnimation ? (
                    <motion.span
                      className="absolute left-0 -bottom-2 h-[3px] bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: 105 }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                    />
                  ) : (
                    <span className="absolute left-0 -bottom-2 h-[3px] bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] rounded-full w-[105px]" />
                  )}
                </span>{" "}
                <span className="text-[#C8A557]">Loved Ones</span>
              </h1>

              <motion.p className="text-[#5B6473] text-lg italic">
                The people who shaped your life — remembered forever.
              </motion.p>
              <motion.p className="text-[#7A8596] text-sm mt-2">
                Add your loved ones and preserve their stories, memories, and legacy.
              </motion.p>
            </div>

            <div className="flex gap-4 justify-center md:justify-end">
              <motion.button
                onClick={() => setAddOpen(true)}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B]
                           text-[#1F2837] font-semibold shadow-md relative overflow-hidden"
              >
                <span className="relative z-10">+ Add A Loved One</span>
              </motion.button>
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
