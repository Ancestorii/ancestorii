"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ArrowRight, Users } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { safeToast as toast } from "@/lib/safeToast";
import {
  ui,
  Accent,
  AppLoader,
  Avatar,
  Btn,
  EmptyState,
  IconBtn,
  Spinner,
  toneByKey,
  useDialog,
  jsMotion,
} from "@/components/dashboard/ui/AppBits";
import s from "./UniversalPeopleTagger.module.css";

type FamilyMember = {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  avatar_signed?: string | null;
};

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

export default function UniversalPeopleTagger({
  parentId,
  parentType,
  open,
  onClose,
  onSaved,
}: {
  parentId: string;
  parentType: "album" | "capsule" | "timeline";
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const supabase = getBrowserClient();
  const router = useRouter();

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  // The tags as they are in the database, so saving writes only the differences.
  const [existingIds, setExistingIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  // False until the first load lands, so "No family members yet" never shows before the list
  // (a loading flag switched on inside the effect let the first frame show the empty state).
  // Later opens keep what is on screen while they refresh.
  const [loaded, setLoaded] = useState(false);

  const titleId = useId();
  // Escape closes it (as the close button does), Tab stays inside, focus returns to the button.
  const panelRef = useDialog<HTMLDivElement>(open, onClose);

  const TAG_TABLE =
    parentType === "album"
      ? "album_tags"
      : parentType === "capsule"
      ? "capsule_tags"
      : "timeline_tags";

  const PARENT_KEY =
    parentType === "album"
      ? "album_id"
      : parentType === "capsule"
      ? "capsule_id"
      : "timeline_id";

  // Load the family and which of them are tagged, together, and sign the photos in one request
  // (it was getUser() on the network, then the members, then one signing request per photo,
  // then the tags, one after another). The whole family is listed, as My Loved Ones lists it:
  // filtered by owner_id, a member could not tag loved ones another member had added.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      try {
        const [{ data: fam }, { data: existing }] = await Promise.all([
          supabase
            .from("family_members")
            .select("id, full_name, avatar_url")
            .order("created_at", { ascending: true }),
          supabase.from(TAG_TABLE).select("family_member_id").eq(PARENT_KEY, parentId),
        ]);

        const rows: FamilyMember[] = fam || [];
        const toSign = rows.filter((m) => m.avatar_url && !m.avatar_url.startsWith("http"));
        const byPath = new Map<string, string>();
        if (toSign.length > 0) {
          const { data: signed } = await supabase.storage
            .from("user-media")
            .createSignedUrls(toSign.map((m) => m.avatar_url as string), 60 * 60);
          toSign.forEach((m, i) => {
            const url = signed?.[i]?.signedUrl;
            if (url) byPath.set(m.avatar_url as string, url);
          });
        }

        if (cancelled) return;
        setMembers(
          rows.map((m) => ({
            ...m,
            avatar_signed: !m.avatar_url
              ? null
              : m.avatar_url.startsWith("http")
              ? m.avatar_url
              : byPath.get(m.avatar_url) ?? null,
          }))
        );
        const tagged: string[] = existing?.map((x: any) => x.family_member_id) || [];
        setExistingIds(tagged);
        setSelected(tagged);
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        toast.error("Failed to load people.");
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, parentId, parentType, supabase]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Only the differences are written. Deleting every tag and inserting the selection again
      // left a family member who is not the creator with duplicates (RLS lets only the creator
      // delete, returning 0 rows silently) and no way to untag anyone.
      const toAdd = selected.filter((id) => !existingIds.includes(id));
      const toRemove = existingIds.filter((id) => !selected.includes(id));
      let blocked = false;

      if (toRemove.length > 0) {
        const { data: removed, error } = await supabase
          .from(TAG_TABLE)
          .delete()
          .eq(PARENT_KEY, parentId)
          .in("family_member_id", toRemove)
          .select("family_member_id");
        if (error) throw error;
        blocked = (removed?.length ?? 0) < toRemove.length;
      }

      if (toAdd.length > 0) {
        const payload = toAdd.map((family_member_id) => ({
          family_member_id,
          [PARENT_KEY]: parentId,
        }));

        const { error } = await supabase.from(TAG_TABLE).insert(payload);
        if (error) throw error;
      }

      if (blocked) toast.error(`Only the person who created this ${parentType} can untag people.`);
      else toast.success("People tagged.");
      onSaved?.();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save tags.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          {...jsMotion}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // scrim-blur (globals.css) blurs only with a mouse; above the floating phone nav (z-[200])
          className={cx(ui.scrim, "scrim-blur z-[999] flex items-end justify-center sm:items-center sm:p-4")}
        >
          {/* transform string (not y) so Motion runs the slide on the compositor */}
          <motion.div
            {...jsMotion}
            initial={{ opacity: 0, transform: "translateY(40px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={{ opacity: 0, transform: "translateY(20px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cx(ui.sheet, ui.sheetBottom, s.panel)}
          >
            {/* Header */}
            <div className={ui.sheetHeader}>
              <div className="min-w-0">
                <h2 id={titleId} className={ui.sheetTitle}>
                  Who lives in this <Accent>memory</Accent>?
                </h2>
                <p className={ui.sheetSub}>
                  Select the people who belong inside this moment.
                </p>
              </div>

              <IconBtn label="Close" onClick={onClose}>
                <X size={20} strokeWidth={2.4} aria-hidden="true" />
              </IconBtn>
            </div>

            {/* People / Empty State */}
            <div className={ui.sheetBody}>
              {!loaded ? (
                <AppLoader label="Loading" className="min-h-0" />
              ) : members.length === 0 ? (
                <EmptyState
                  Icon={Users}
                  tone={toneByKey("aqua")}
                  title="No family members yet"
                  text={
                    <>
                      Add your first family member in{" "}
                      <span className="font-extrabold">My Loved Ones</span> to start tagging
                      memories.
                    </>
                  }
                  className="px-0 shadow-none"
                >
                  <Btn
                    onClick={() => {
                      onClose();
                      // A client-side move, not a full page reload.
                      router.push("/dashboard/family");
                    }}
                    tile={<ArrowRight size={18} strokeWidth={2.4} />}
                  >
                    Go to My Loved Ones
                  </Btn>
                </EmptyState>
              ) : (
                <ul className={s.people}>
                  {members.map((m) => {
                    const active = selected.includes(m.id);

                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggle(m.id)}
                          className={s.person}
                        >
                          {/* The name is the button's text; the photo is decoration here. */}
                          <span className={s.avatar} aria-hidden="true">
                            <Avatar src={m.avatar_signed} name={m.full_name} size={38} plain />
                          </span>
                          <span className={s.name}>{m.full_name}</span>
                          <span className={s.tick} aria-hidden="true">
                            {active && <Check size={14} strokeWidth={3.2} />}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Actions */}
            {members.length > 0 && (
              <div className={ui.sheetFooter}>
                <Btn variant="soft" onClick={onClose}>
                  Cancel
                </Btn>

                <Btn
                  onClick={handleSave}
                  disabled={saving}
                  tile={saving ? <Spinner size={16} /> : <Check size={18} strokeWidth={2.6} />}
                >
                  {saving ? "Tagging…" : "Tag People"}
                </Btn>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
