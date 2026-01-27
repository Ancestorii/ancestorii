"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { safeToast as toast } from "@/lib/safeToast";
import { getBrowserClient } from "@/lib/supabase/browser";
import { X, ImagePlus } from "lucide-react";
import LegacyCelebration from "@/components/LegacyCelebration";


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

  const dropRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const [relationship, setRelationship] = useState("");

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

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const over = (e: DragEvent) => {
      e.preventDefault();
      el.classList.add("ring-2", "ring-[#E6C26E]");
    };
    const leave = (e: DragEvent) => {
      e.preventDefault();
      el.classList.remove("ring-2", "ring-[#E6C26E]");
    };
    const drop = (e: DragEvent) => {
      e.preventDefault();
      el.classList.remove("ring-2", "ring-[#E6C26E]");
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
  }, []);

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
        const path = `${user.id}/family_${Date.now()}_${avatarFile.name}`.replace(/\s+/g, "_");
        const { error: upErr } = await supabase.storage
          .from("user-media")
          .upload(path, avatarFile, { upsert: true });
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
          className="fixed inset-0 bg-[#0B0C10]/70 backdrop-blur-sm flex items-center justify-center z-[200] pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.94, y: 25 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >

          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative bg-white w-[88%] sm:w-[360px] md:w-[450px] max-h-[85vh] overflow-y-auto overflow-x-hidden rounded-2xl p-8 border-[2px] border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.5)] font-[Inter]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#1F2837]/70 hover:text-[#1F2837] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-3xl font-bold text-[#1F2837] mb-2 text-center">
              {mode === "edit" ? "Edit Family Member" : "Add Family Member"}
            </h2>
            <p className="text-sm text-[#7A8596] text-center mb-6 italic">
              Preserve their legacy.
            </p>
            <span className="block w-16 h-1 bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] rounded-full mx-auto mb-6" />

            {/* FULL NAME */}
            <label className="block text-sm font-semibold mb-1 text-[#1F2837]">Full Name</label>
            <input
              className="w-full border border-[#E6C26E]/50 rounded-lg px-3 py-2 mb-6 text-[#1F2837] focus:ring-2 focus:ring-[#E6C26E]"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
            />

            {/* RELATIONSHIP TO USER */}
            <label className="block text-sm font-semibold mb-1 text-[#1F2837]">
            Who is this person to you?
            </label>

            <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className={`w-full border border-[#E6C26E]/50 rounded-lg px-3 py-2 mb-6 text-[#1F2837] bg-white focus:ring-2 focus:ring-[#E6C26E] ${!relationship ? "text-[#7A8596]" : "text-[#1F2837]"}`} 
            
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


            {/* DATES */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* BIRTH */}
              <div>
                <label className="block text-sm font-semibold text-[#1F2837] mb-1">
                  Birth
                </label>
                <input
                  className="w-full border border-[#E6C26E]/50 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#E6C26E]"
                  placeholder="DD/MM/YYYY"
                  value={birth}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9/]/g, "");
                    if (v.length <= 10) setBirth(v);
                  }}
                />
              </div>

              {/* DEATH */}
              <div>
                <label className="block text-sm font-semibold text-[#1F2837] mb-1">
                  Death <span className="text-[#7A8596] text-xs font-normal">(If applicable)</span>
                </label>
                <input
                  className="w-full border border-[#E6C26E]/50 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#E6C26E]"
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
              <p className="text-sm text-[#7A8596] italic mb-6">
                {death ? ageDisplay : `${ageDisplay} — Living`}
              </p>
            )}

            {/* AVATAR */}
            <label className="block text-sm font-semibold flex items-center gap-1 text-[#1F2837]">
              <ImagePlus className="w-4 h-4 text-[#E6C26E]" /> Profile Image
            </label>
            <div
              ref={dropRef}
              onClick={() => document.getElementById("memberAvatarInput")?.click()}
              className="mt-2 h-[140px] border-2 border-dashed border-[#E6C26E]/60 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden hover:shadow-[0_0_10px_rgba(230,194,110,0.4)] transition"
            >
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#7A8596]">Drag & drop or click to upload</span>
              )}
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

            {/* FOOTER */}
            <div className="flex flex-col gap-4 mt-10 pt-6 border-t border-gray-200">

              <div className="flex justify-between gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-full border border-[#E6C26E]/40 text-[#1F2837] hover:bg-[#F9F7F2]"
                >
                  Cancel
                </button>

                <button
                  disabled={!fullName.trim() || uploading}
                  onClick={handleSubmit}
                  className={`px-6 py-2 rounded-full font-semibold text-[#1F2837] shadow-md ${
                    !fullName.trim()
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] hover:shadow-[0_0_15px_rgba(230,194,110,0.6)] hover:scale-[1.02]"
                  }`}
                >
                  {uploading
                    ? "Saving…"
                    : mode === "edit"
                    ? "Save Changes"
                    : "Add My Loved One ✨"}
                </button>
              </div>
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

