"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { safeToast as toast } from "@/lib/safeToast";

type FamilyMember = {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  avatar_signed?: string | null;
};

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
          className="fixed inset-0 bg-black/40 z-[999] flex items-center justify-center backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="bg-white rounded-[36px] shadow-[0_30px_80px_rgba(0,0,0,0.18)]
                       w-[94%] max-w-2xl px-12 py-10 relative"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-black transition"
            >
              <X size={22} />
            </button>

            {/* Title */}
            <h2
              className="text-4xl font-bold text-center mb-3"
              style={{
                color: "#D4AF37",
                textShadow: "0 4px 22px rgba(212,175,55,0.45)",
              }}
            >
              Who lives in this memory?
            </h2>

            <p className="text-sm text-center mb-12 text-gray-500">
              Select the people who belong inside this moment.
            </p>

           {/* People Grid / Empty State */}
{members.length === 0 ? (
  <div className="text-center py-16">
    <p className="text-lg font-semibold text-[#1F2837] mb-2">
      No family members yet
    </p>

    <p className="text-sm text-gray-500 mb-8">
      Add your first family member in <b>My Loved Ones</b> to start tagging memories.
    </p>

    <button
      onClick={() => {
        onClose();
        window.location.href = "/dashboard/loved-ones";
      }}
      className="
        px-8 py-3 rounded-full
        bg-gradient-to-r from-[#E6C26E] to-[#F3D99B]
        text-[#1F2837] font-semibold
        shadow-md hover:scale-105 hover:shadow-lg
        transition
      "
    >
      Go to My Loved Ones
    </button>
  </div>
) : (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-14">
    {members.map((m) => {
      const active = selected.includes(m.id);

      return (
        <motion.button
          key={m.id}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => toggle(m.id)}
          className={`relative flex flex-col items-center rounded-3xl p-5 border transition duration-300 ${
            active
              ? "border-[#D4AF37] bg-[#FFF7DB] shadow-[0_0_0_6px_rgba(212,175,55,0.22)]"
              : "border-[#d4af37] hover:border-[#C4B5FD] hover:shadow-lg"
          }`}
        >
          {active && (
            <div className="absolute -top-2 -right-2 bg-[#D4AF37] text-white rounded-full p-1 shadow">
              <Check size={14} />
            </div>
          )}

          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 mb-4">
            {m.avatar_signed ? (
              <img
                src={m.avatar_signed}
                alt={m.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold">
                {m.full_name.charAt(0)}
              </div>
            )}
          </div>

          <p className="text-sm font-semibold text-center text-[#1F2837]">
            {m.full_name}
          </p>
        </motion.button>
      );
    })}
  </div>
)}

            {/* Actions */}
{members.length > 0 && (
  <div className="flex justify-center gap-6">
    <button
      onClick={onClose}
      className="px-8 py-3 rounded-full border border-gray-300
                 text-gray-600 hover:bg-gray-100 transition"
    >
      Cancel
    </button>

    <button
      onClick={handleSave}
      disabled={saving}
      className="px-10 py-3 rounded-full font-semibold shadow-lg
                 bg-gradient-to-r from-[#E6C26E] to-[#F3D99B]
                 text-[#1F2837] hover:scale-105 hover:shadow-xl transition"
    >
      {saving ? "Tagging…" : "Tag People"}
    </button>
  </div>
)}


          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
