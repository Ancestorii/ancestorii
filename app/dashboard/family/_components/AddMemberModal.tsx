"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { safeToast as toast } from "@/lib/safeToast";
import { getBrowserClient } from "@/lib/supabase/browser";
import { X, ImagePlus, Plus, Check } from "lucide-react";
import LegacyCelebration from "@/components/LegacyCelebration";
import { ensureDisplayableImage } from '@/lib/convertImage';
import { ui, Btn, IconBtn, Spinner, useDialog } from "@/components/dashboard/ui/AppBits";
import s from "./lovedOnes.module.css";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");


type Person = {
  id: string;
  full_name: string;
  biography?: string | null;
  birth_date?: string | null;
  death_date?: string | null;
  avatar_url?: string | null;
  avatar_signed?: string | null;
  relationship_to_user?: string | null;
};

function convertDDMMYYYYtoISO(date: string): string | null {
  if (!date) return null;
  const parts = date.split("/");
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplayDate(iso: string | null): string {
  if (!iso) return "";
  if (!iso.includes("-")) return iso;
  const [yyyy, mm, dd] = iso.split("-");
  return `${dd}/${mm}/${yyyy}`;
}

function calcAge(birthISO: string | null, deathISO: string | null): string | null {
  if (!birthISO) return null;
  try {
    const birth = new Date(birthISO);
    const end = deathISO ? new Date(deathISO) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--;
    return `${age} yrs old`;
  } catch {
    return null;
  }
}

export default function AddMemberModal({
  open,
  onClose,
  onCreated,
  onUpdated,
  mode = "create",
  member,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (createdId: string | null) => void;
  onUpdated?: () => void;
  mode?: "create" | "edit";
  member?: Person | null;
}) {
  const supabase = getBrowserClient();
  const CELEBRATION_LINES = [
  "You made space for someone who matters.",
  "You chose to remember them.",
  "You didn’t let them fade.",
  "You’ve honoured someone who shaped you.",
];

const [showCelebration, setShowCelebration] = useState(false);
const [celebrationMessage, setCelebrationMessage] = useState("");

  const [fullName, setFullName] = useState("");

  const [birth, setBirth] = useState("");
  const [death, setDeath] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const isSubmitting = useRef(false);

  const dropRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  const [relationship, setRelationship] = useState("");

  // Field ids (labels point at their fields) and the dialog's title.
  const titleId = useId();
  const nameId = useId();
  const relationshipId = useId();
  const birthId = useId();
  const deathId = useId();
  const photoLabelId = useId();
  const photoHintId = useId();

  // Escape closes it (as the close button does), Tab stays inside, focus returns to the button.
  const panelRef = useDialog<HTMLDivElement>(open, onClose);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && member) {
      setFullName(member.full_name || "");
      setBirth(formatDisplayDate(member.birth_date || null));
      setDeath(formatDisplayDate(member.death_date || null));
      setPreviewUrl(member.avatar_signed || null);
      setAvatarFile(null);
      setRelationship(member.relationship_to_user || "");
      return;
    }

    setFullName("");
    setBirth("");
    setDeath("");
    setAvatarFile(null);
    setPreviewUrl(null);
    setRelationship("");
  }, [open, mode, member]);

  useEffect(() => {
    if (avatarFile) {
      const url = URL.createObjectURL(avatarFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [avatarFile]);

  const selectFile = (file: File) => {
    if (file) setAvatarFile(file);
  };

  // The drop zone only exists while the modal is open, so the listeners are attached each
  // time it opens (with [] they ran once, before the zone existed, and a dropped file made the
  // browser open it in the tab instead).
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const over = (e: DragEvent) => {
      e.preventDefault();
      el.dataset.drag = "true";
    };
    const leave = (e: DragEvent) => {
      e.preventDefault();
      delete el.dataset.drag;
    };
    const drop = (e: DragEvent) => {
      e.preventDefault();
      delete el.dataset.drag;
      const f = e.dataTransfer?.files?.[0];
      if (f) selectFile(f);
    };

    el.addEventListener("dragover", over);
    el.addEventListener("dragleave", leave);
    el.addEventListener("drop", drop);
    return () => {
      el.removeEventListener("dragover", over);
      el.removeEventListener("dragleave", leave);
      el.removeEventListener("drop", drop);
    };
  }, [open, mounted]);

  /** SUBMIT */
  const handleSubmit = async () => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setUploading(true);

    try {
      if (!fullName.trim()) throw new Error("Full name required");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error("Not signed in");

      let avatarPath = member?.avatar_url || null;

      if (avatarFile) {
        const safeFile = await ensureDisplayableImage(avatarFile);
        const path = `${user.id}/family_${Date.now()}_${safeFile.name}`.replace(/\s+/g, "_");
        const { error: upErr } = await supabase.storage
          .from("user-media")
          .upload(path, safeFile, { upsert: true });
        if (upErr) throw upErr;
        avatarPath = path;
      }

      const birthISO = convertDDMMYYYYtoISO(birth);
      const deathISO = convertDDMMYYYYtoISO(death);

      if (birth && !birthISO) throw new Error("Invalid birth date format.");
      if (death && !deathISO) throw new Error("Invalid death date format.");

      if (mode === "create") {
        const { data: inserted, error: insertErr } = await supabase
          .from("family_members")
          .insert({
            owner_id: user.id,
            full_name: fullName,
            birth_date: birthISO,
            death_date: deathISO,
            avatar_url: avatarPath,
            relationship_to_user: relationship, // ✅ ADD THIS
          })
          .select("id")
          .single();

        if (insertErr) throw insertErr;

        const insertedId = inserted?.id;
        if (!insertedId) throw new Error("Failed to create member");

        const line =
  CELEBRATION_LINES[Math.floor(Math.random() * CELEBRATION_LINES.length)];

setCelebrationMessage(line);
setShowCelebration(true);

onCreated?.(insertedId);
onClose();
return;

      }

      const { error } = await supabase
        .from("family_members")
        .update({
          full_name: fullName,
          birth_date: birthISO,
          death_date: deathISO,
          avatar_url: avatarPath,
          relationship_to_user: relationship, // ✅ ADD THIS
        })
        .eq("id", member?.id);

      if (error) throw error;
      toast.success("Changes saved");
      onClose();
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setUploading(false);
      isSubmitting.current = false;
    }
  };

  if (!mounted) return null;

  const ageDisplay = calcAge(
    convertDDMMYYYYtoISO(birth),
    convertDDMMYYYYtoISO(death)
  );

  return (
    <>
    <AnimatePresence>
      {open && (
        <motion.div
          // A bottom sheet on phones, a centred card from 640px. scrim-blur (globals.css) blurs
          // only with a mouse. Above the floating phone nav (z-[200]).
          className={cx(
            ui.scrim,
            "scrim-blur pointer-events-auto z-[9999] flex items-end justify-center sm:items-center sm:p-4"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >

          {/* transform string (not y/scale) so Motion runs the pop-in on the compositor */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, transform: "translateY(40px) scale(0.95)" }}
            animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
            exit={{ opacity: 0, transform: "translateY(40px) scale(0.95)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={cx(
              ui.sheet,
              ui.sheetBottom,
              "max-h-[calc(100dvh-16px)] w-full outline-none sm:max-h-[calc(100dvh-32px)] sm:max-w-[520px] sm:rounded-[28px]"
            )}
          >
            {/* ── Header ── */}
            <div className={ui.sheetHeader}>
              <div className="min-w-0">
                <h2 id={titleId} className={ui.sheetTitle}>
                  {mode === "edit" ? "Edit Family Member" : "Add Family Member"}
                </h2>
                <p className={ui.sheetSub}>Preserve their legacy.</p>
              </div>
              <IconBtn label="Close" onClick={onClose}>
                <X size={20} strokeWidth={2.4} aria-hidden="true" />
              </IconBtn>
            </div>

            <div className={ui.sheetBody}>
              {/* FULL NAME */}
              <div className={ui.field}>
                <label htmlFor={nameId} className={ui.label}>
                  Full Name
                </label>
                <input
                  id={nameId}
                  className={ui.input}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              {/* RELATIONSHIP TO USER */}
              <div className={ui.field}>
                <label htmlFor={relationshipId} className={ui.label}>
                  Who is this person to you?
                </label>
                <select
                  id={relationshipId}
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className={cx(ui.select, !relationship && s.selectEmpty)}
                >
                  <option value="" disabled hidden>
                    Select a role
                  </option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="child">Children</option>
                  <option value="partner">Spouse / Partner</option>
                  <option value="grandparent">Grandparents</option>
                  <option value="aunt_uncle">Aunties / Uncles</option>
                  <option value="extended">Extended Family</option>
                  <option value="friend">Friends</option>
                </select>
              </div>

              {/* DATES */}
              <div className={ui.field}>
                <div className="grid grid-cols-2 items-end gap-3">
                  {/* BIRTH */}
                  <div className="min-w-0">
                    <label htmlFor={birthId} className={ui.label}>
                      Birth
                    </label>
                    <input
                      id={birthId}
                      className={ui.input}
                      placeholder="DD/MM/YYYY"
                      value={birth}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9/]/g, "");
                        if (v.length <= 10) setBirth(v);
                      }}
                    />
                  </div>

                  {/* DEATH */}
                  <div className="min-w-0">
                    <label htmlFor={deathId} className={ui.label}>
                      Death <span className="text-[13px] font-semibold">(If applicable)</span>
                    </label>
                    <input
                      id={deathId}
                      className={ui.input}
                      placeholder="DD/MM/YYYY"
                      value={death}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9/]/g, "");
                        if (v.length <= 10) setDeath(v);
                      }}
                    />
                  </div>
                </div>

                {/* AGE */}
                {ageDisplay && (
                  <p className={ui.hint}>
                    {/* "19 yrs old, living", as it read before the dashes went (an age is not the
                        start of a range, so not "to present"). */}
                    {death ? ageDisplay : `${ageDisplay}, living`}
                  </p>
                )}
              </div>

              {/* AVATAR */}
              <div className={ui.field}>
                <p id={photoLabelId} className={ui.label}>
                  Profile Image
                </p>
                <button
                  type="button"
                  ref={dropRef}
                  onClick={() => document.getElementById("memberAvatarInput")?.click()}
                  aria-labelledby={`${photoLabelId} ${photoHintId}`}
                  className={s.drop}
                >
                  <span className={s.dropThumb}>
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="" />
                    ) : (
                      <ImagePlus size={24} strokeWidth={2.2} aria-hidden="true" />
                    )}
                  </span>
                  <span id={photoHintId} className={s.dropText}>
                    Drag &amp; drop or click to upload
                  </span>
                </button>
                <input
                  type="file"
                  id="memberAvatarInput"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) selectFile(f);
                  }}
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className={ui.sheetFooter}>
              <Btn variant="soft" onClick={onClose}>
                Cancel
              </Btn>

              <Btn
                disabled={!fullName.trim() || uploading}
                onClick={handleSubmit}
                tile={
                  uploading ? (
                    <Spinner size={16} />
                  ) : mode === "edit" ? (
                    <Check size={18} strokeWidth={2.6} />
                  ) : (
                    <Plus size={18} strokeWidth={2.4} />
                  )
                }
              >
                {uploading
                  ? "Saving…"
                  : mode === "edit"
                  ? "Save Changes"
                  : "Add My Loved One"}
              </Btn>
            </div>
          </motion.div>
        </motion.div>
      )}
       </AnimatePresence>
      <LegacyCelebration
        open={showCelebration}
        message={celebrationMessage}
        emoji="🕊️"
        durationMs={3800}
        onClose={() => setShowCelebration(false)}
      />
    </>
  );
}
