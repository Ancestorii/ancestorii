"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { LovedOneMenu } from "./LovedOneMenu";
import { useEffect, useState } from "react";

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
  const [loaded, setLoaded] = useState(false);

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
      : "A life remembered";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onClick={() => router.push(`/dashboard/family/${member.id}`)}
      className="group relative w-full min-w-0 cursor-pointer overflow-hidden rounded-[28px] border border-[#d7bf91] bg-[linear-gradient(180deg,#fffdf9_0%,#f8f1e5_100%)] shadow-[0_18px_42px_rgba(22,18,12,0.10)] transition-all hover:border-[#cfae67] hover:shadow-[0_24px_52px_rgba(22,18,12,0.14)]"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-30px] top-[-30px] h-[110px] w-[110px] rounded-full bg-[#d4af37]/8 blur-3xl" />
        <div className="absolute left-[-20px] bottom-[-30px] h-[100px] w-[100px] rounded-full bg-white/70 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-[linear-gradient(90deg,rgba(212,175,55,0),rgba(212,175,55,0.55),rgba(212,175,55,0))]" />
      </div>

      <div
        className="absolute right-4 top-4 z-20"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <LovedOneMenu onEdit={onEdit} onDeleteClick={onDelete} />
      </div>

      <div className="relative p-5 sm:p-6">
        <div className="mb-4 pr-10">

          <h2 className="mt-2 max-w-full break-words font-serif text-[1.45rem] leading-[1.02] text-[#16120C] sm:text-[1.55rem]">
            <span className="line-clamp-2 block">
              {member.full_name}
            </span>
          </h2>
        </div>

        <div className="relative mb-4 h-[220px] overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#f2e3b8_0%,#e8d093_45%,#d8b45e_100%)] lg:h-[240px]">
          {member.avatar_signed ? (
            <Image
              src={member.avatar_signed}
              alt={member.full_name}
              fill
              className={`object-cover transition duration-500 group-hover:scale-[1.03] ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
              onLoadingComplete={() => setLoaded(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-serif text-[2.5rem] italic text-[#8c6a20]">
              {member.full_name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <p className="text-[14px] font-semibold leading-[1.75] text-[#2b2116]">
          {lifespan}
        </p>

        {member.notes && (
          <p className="mt-3 line-clamp-2 text-[13px] leading-[1.7] italic text-[#5d5140]">
            {member.notes}
          </p>
        )}
      </div>
    </motion.div>
  );
}