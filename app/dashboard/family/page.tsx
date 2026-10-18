"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import { useRouter } from 'next/navigation';
import AddMemberModal from "./_components/AddMemberModal";
import LovedOneSection from "./_components/LovedOneSection";
import LovedOneEmptyState from "./_components/LovedOneEmptyState";
import DeleteLovedOneModal from "./_components/DeleteLovedOneModal";
import { getLovedOneGroups } from "./_utils/getLovedOneGroups";
import { getBrowserClient } from "@/lib/supabase/browser";
import { safeToast as toast } from "@/lib/safeToast";
import { useSearchParams } from "next/navigation";
import { deleteWithOwnerCheck } from '@/lib/deleteWithOwnerCheck';
import { ui, Accent, AppLoader, Btn, PageHeader } from "@/components/dashboard/ui/AppBits";


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

export default function FamilyPage() {
  const supabase = getBrowserClient();

  const [addOpen, setAddOpen] = useState(false);
  const [editMember, setEditMember] = useState<FamilyMember | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(Date.now());
  const reload = useCallback(() => setRefreshKey(Date.now()), []);

  const [membersLoading, setMembersLoading] = useState(true);

  const [members, setMembers] = useState<FamilyMember[]>([]);
  // Grouped as the list changes (a state set from an effect painted the headings once
  // without their cards).
  const groups = useMemo(() => getLovedOneGroups(members), [members]);
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const shouldOpenAdd = searchParams.get("add") === "true";

  const router = useRouter();


  // ✅ PUT THIS INSIDE FamilyPage() (same place Albums has it)
const line1 = 'The people who shaped your life, remembered and celebrated forever.';
const line2 = 'Add your loved ones and preserve their stories, memories, and legacy.';
// The number the database itself checks on insert (enforce_loved_one_limit): 1 on Free,
// effectively unlimited with a subscription. null until it is known.
const [maxLovedOnes, setMaxLovedOnes] = useState<number | null>(null);

useEffect(() => {
  (async () => {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess?.session?.user?.id;
    if (!uid) return;

    const { data } = await supabase.rpc('get_effective_max_loved_ones', { uid });
    setMaxLovedOnes(typeof data === 'number' ? data : null);
  })();
}, []);


useEffect(() => {
  if (shouldOpenAdd) {
    setAddOpen(true);
    // The parameter has done its job; left in the address, the dialog came back on refresh.
    router.replace("/dashboard/family", { scroll: false });
  }
}, [shouldOpenAdd, router]);

useEffect(() => {
  if (!editId || members.length === 0) return;

  const found = members.find((m) => m.id === editId);
  if (!found) return;

  setEditMember(found);
  setAddOpen(true);
  // Cleared once opened: this effect runs again when the list reloads after a save, and it
  // used to reopen the dialog that had just closed.
  router.replace("/dashboard/family", { scroll: false });
}, [editId, members, router]);

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
      .order("full_name", { ascending: true });

    if (memErr) {
      console.error(memErr);
      setMembersLoading(false);
      return;
    }

    const membersData = (memberRows || []) as FamilyMember[];

    // Every portrait signed in one request (it was one request per loved one), and no cache
    // buster: a replaced photo gets a new storage path, so the browser may keep these.
    const paths = membersData
      .map((m) => m.avatar_url)
      .filter((p): p is string => !!p);
    const signedByPath = new Map<string, string>();
    if (paths.length > 0) {
      const { data: signedRows } = await supabase.storage
        .from("user-media")
        .createSignedUrls(paths, 60 * 60);
      for (const row of signedRows || []) {
        if (row.path && row.signedUrl) signedByPath.set(row.path, row.signedUrl);
      }
    }
    const withSigned = membersData.map((m) =>
      m.avatar_url && signedByPath.has(m.avatar_url)
        ? { ...m, avatar_signed: signedByPath.get(m.avatar_url) ?? null }
        : m
    );

    setMembers(withSigned);
    setMembersLoading(false); // ✅ ONLY HERE
  };

  loadData();
}, [refreshKey, supabase]);


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

  // 🔑 Notify dashboard layout to refresh banner counts
  window.dispatchEvent(new Event('dashboard-data-changed'));

  // 🔑 Refresh family page UI only
  reload();
};

  const handleEditMember = (id: string) => {
    const found = members.find((m) => m.id === id) || null;
    setEditMember(found);
    setAddOpen(true);
  };

 const handleDeleteMember = async (id: string) => {
  try {
    const deleted = await deleteWithOwnerCheck(supabase, 'family_members', id, 'loved one');
    if (!deleted) return;

    toast.success("Loved one removed from your legacy.");
    setMembers((prev) => prev.filter((m) => m.id !== id));
    // The sidebar's loved-ones count follows (it already did after an add).
    window.dispatchEvent(new Event('dashboard-data-changed'));
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
  // The loader shows until there is something to draw; a refresh after an edit or a delete
  // keeps the cards on screen instead of blanking the page.
  const showLoader = membersLoading && members.length === 0;

  return (
    <div className={ui.page}>

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

      {/* The header is drawn at once; only the list below it waits for the data. */}
        <div className={ui.wrap}>
          {/* ---------- HEADER ---------- */}
          <PageHeader
            eyebrow="Loved Ones"
            eyebrowDot="var(--c3)"
            title={
              <>
                My <Accent>Loved Ones</Accent>
              </>
            }
            lead={
              <>
                {line1} {line2}
              </>
            }
            actions={
              members.length > 0 ? (
                <Btn
                  aria-haspopup="dialog"
                  tile={<Plus size={18} strokeWidth={2.4} />}
                  onClick={() => {
  if (maxLovedOnes !== null && members.length >= maxLovedOnes) {
    toast.error(
      "You’ve reached your current plan limit for loved ones. Upgrade to add more."
    );
    return;
  }

  setAddOpen(true);
}}
                >
                  Add A Loved One
                </Btn>
              ) : undefined
            }
          />

          {showLoader ? (
            <AppLoader label="Loading your loved ones" />
          ) : (
            <>
          {/* ---------- EMPTY STATE ---------- */}
          {members.length === 0 && (
            <div className={ui.section}>
              <LovedOneEmptyState onAdd={() => setAddOpen(true)} />
            </div>
          )}

          {/* ---------- GROUPED CARDS ---------- */}
          {members.length > 0 && groups && (
            <>
             <LovedOneSection title="Parents" members={groups.Parents} onEdit={handleEditMember} onDelete={(id) => setDeleteTarget(id)} />
             <LovedOneSection title="Siblings" members={groups.Siblings} onEdit={handleEditMember} onDelete={(id) => setDeleteTarget(id)} />
             <LovedOneSection title="Children" members={groups.Children} onEdit={handleEditMember} onDelete={(id) => setDeleteTarget(id)} />
             <LovedOneSection title="Spouses & Partners" members={groups.SpousePartner} onEdit={handleEditMember} onDelete={(id) => setDeleteTarget(id)} />
             <LovedOneSection title="Aunties & Uncles" members={groups.AuntiesUncles} onEdit={handleEditMember} onDelete={(id) => setDeleteTarget(id)} />
             <LovedOneSection title="Grandparents" members={groups.Grandparents} onEdit={handleEditMember} onDelete={(id) => setDeleteTarget(id)} />
             <LovedOneSection title="Extended Family" members={groups.ExtendedFamily} onEdit={handleEditMember} onDelete={(id) => setDeleteTarget(id)} />
             <LovedOneSection title="Friends" members={groups.Friends} onEdit={handleEditMember} onDelete={(id) => setDeleteTarget(id)} />
             <LovedOneSection title="Other Loved Ones" members={groups.Other ?? []} onEdit={handleEditMember} onDelete={(id) => setDeleteTarget(id)} />
            </>
          )}
            </>
          )}
        </div>
    </div>
  );
}

