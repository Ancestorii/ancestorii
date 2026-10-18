"use client";

import { useEffect, useId, useState } from "react";
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

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  // True while the family loads, so "No family members yet" doesn't flash before the list.
  const [loading, setLoading] = useState(false);

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

  // ✅ LOAD FAMILY + SIGN AVATARS FROM *user-media* BUCKET
  useEffect(() => {
    if (!open) return;

    (async () => {
      setLoading(true);
      try {
        const {
       data: { user },
       } = await supabase.auth.getUser();

if (!user) return;

const { data: fam } = await supabase
  .from("family_members")
  .select("id, full_name, avatar_url")
  .eq("owner_id", user.id)
  .order("created_at", { ascending: true });


        const signedMembers = await Promise.all(
          (fam || []).map(async (m) => {
            if (!m.avatar_url) return m;

            // ✅ If full public URL already
            if (m.avatar_url.startsWith("http")) {
              return { ...m, avatar_signed: m.avatar_url };
            }

            const objectPath = m.avatar_url; // ✅ THIS FIXES EVERYTHING

            const { data: signed } = await supabase.storage
              .from("user-media")
              .createSignedUrl(objectPath, 60 * 60);

            return {
              ...m,
              avatar_signed: signed?.signedUrl || null,
            };
          })
        );

        setMembers(signedMembers);

        const { data: existing } = await supabase
          .from(TAG_TABLE)
          .select("family_member_id")
          .eq(PARENT_KEY, parentId);

        setSelected(existing?.map((x: any) => x.family_member_id) || []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load people.");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, parentId, parentType, supabase]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await supabase.from(TAG_TABLE).delete().eq(PARENT_KEY, parentId);

      if (selected.length > 0) {
        const payload = selected.map((family_member_id) => ({
          family_member_id,
          [PARENT_KEY]: parentId,
        }));

        const { error } = await supabase.from(TAG_TABLE).insert(payload);
        if (error) throw error;
      }

      toast.success("People tagged.");
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // scrim-blur (globals.css) blurs only with a mouse; above the floating phone nav (z-[200])
          className={cx(ui.scrim, "scrim-blur z-[999] flex items-end justify-center sm:items-center sm:p-4")}
        >
          {/* transform string (not y) so Motion runs the slide on the compositor */}
          <motion.div
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
              {loading && members.length === 0 ? (
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
                      window.location.href = "/dashboard/family";
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
