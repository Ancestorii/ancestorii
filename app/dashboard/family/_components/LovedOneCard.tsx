"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { LovedOneMenu } from "./LovedOneMenu";
import { useEffect, useState } from "react";

// --- SOFT LAVENDER PREMIUM PALETTE (REVISED & SAFE) ---
const CARD_BG = "bg-violet-50"; // Gentle lavender wash
const CARD_BORDER = "border-violet-300"; // Subtle lavender edge
const CARD_HOVER_BORDER = "hover:border-violet-400"; // Tactile hover
const TEXT_PRIMARY = "text-[#1F2837]"; // Navy text for contrast
const TEXT_SECONDARY = "text-[#1F2837]/75"; // Increased opacity for readability

export default function LovedOneCard({
  member,
  onEdit,
  onDelete,
}: {
  member: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    birth_date?: string | null;
    death_date?: string | null;
    notes?: string | null;
    avatar_signed?: string | null;
  };
  onEdit: () => void;
  onDelete: () => void;
}) {
  const router = useRouter();

  // ✅ fade-in control (same as Home)
  const [loaded, setLoaded] = useState(false);

  // ✅ if the signed url changes, reset so it fades in again
  useEffect(() => {
    setLoaded(false);
  }, [member.avatar_signed]);

  const lifespan =
    member.birth_date && !member.death_date
      ? `${new Date(member.birth_date).getFullYear()} — Living`
      : member.birth_date && member.death_date
      ? `${new Date(member.birth_date).getFullYear()} — ${new Date(
          member.death_date
        ).getFullYear()}`
      : "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -6,
        boxShadow: "0 20px 45px rgba(139,92,246,0.20)", // Soft violet glow
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative ${CARD_BG} border ${CARD_BORDER} ${CARD_HOVER_BORDER}
                   rounded-[1.5rem] p-7 w-full max-w-[260px]
                   shadow-[0_12px_30px_rgba(0,0,0,0.06)]
                   cursor-pointer transition-all`}
      onClick={() => router.push(`/dashboard/family/${member.id}`)}
    >
      {/* Menu */}
      <div
        className="absolute top-4 right-4 z-20 opacity-60 hover:opacity-100 transition"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <LovedOneMenu onEdit={onEdit} onDeleteClick={onDelete} />
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-5">
        {member.avatar_signed ? (
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-[#E6C26E] shadow-md bg-violet-200">
            <Image
              src={member.avatar_signed}
              alt={member.full_name}
              width={100}
              height={100}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
              onLoadingComplete={() => setLoaded(true)}
            />
          </div>
        ) : (
          <div
            className="w-[100px] h-[100px] rounded-full bg-violet-200
                          border border-[#E6C26E]/50 flex items-center justify-center
                          text-4xl font-light text-[#1F2837]"
          >
            {member.full_name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Name */}
      <h2
        className={`text-xl font-semibold ${TEXT_PRIMARY} text-center tracking-wide leading-snug`}
      >
        {member.full_name}
      </h2>

      {/* Lifespan */}
      <p className={`text-sm text-center ${TEXT_SECONDARY} mt-1.5 mb-2`}>
        {lifespan}
      </p>

      {/* Notes */}
      {member.notes && (
        <p className={`text-sm ${TEXT_SECONDARY} line-clamp-2 text-center italic`}>
          {member.notes}
        </p>
      )}
    </motion.div>
  );
}