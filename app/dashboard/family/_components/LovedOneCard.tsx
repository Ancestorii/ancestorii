"use client";

import Link from "next/link";
import Image from "next/image";
import { LovedOneMenu } from "./LovedOneMenu";
import { useState, type CSSProperties } from "react";
import { ui, toneFor } from "@/components/dashboard/ui/AppBits";
import { parseDateOnly } from "../_utils/dateOnly";
import s from "./lovedOnes.module.css";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

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
  // Not reset when the signed URL changes (every reload signs afresh): the old picture stays
  // until the new one has loaded, instead of every portrait fading out and in again.
  const [loaded, setLoaded] = useState(false);

  const born = parseDateOnly(member.birth_date)?.getFullYear();
  const died = parseDateOnly(member.death_date)?.getFullYear();
  const lifespan =
    born && !died
      ? `${born} to present`
      : born && died
      ? `${born} to ${died}`
      : "A life remembered";

  // A stable frame colour for this person.
  const frame = toneFor(member.full_name);

  return (
    <div className={cx(ui.card, ui.cardLink, s.card, "group")}>
      {/* Portrait in a solid colour frame */}
      <div className={ui.frame} style={{ "--frame": frame.bg } as CSSProperties}>
        <div className={cx(ui.frameInner, "aspect-[4/3] @md:aspect-[4/5]")}>
          {member.avatar_signed ? (
            <Image
              src={member.avatar_signed}
              alt=""
              fill
              sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, (min-width: 480px) 50vw, 100vw"
              className={cx(
                "object-cover transition duration-500 group-hover:scale-[1.03]",
                s.portrait,
                loaded ? "opacity-100" : "opacity-0"
              )}
              onLoadingComplete={() => setLoaded(true)}
            />
          ) : (
            <span className={s.initial} aria-hidden="true">
              {member.full_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Name, dates and the menu */}
      <div className="flex items-start gap-2 pb-2.5 pl-3 pr-1 pt-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-[18px] font-extrabold leading-[1.2] tracking-[-0.03em] [overflow-wrap:anywhere]">
            <Link href={`/dashboard/family/${member.id}`} prefetch={false} className={s.nameLink}>
              {member.full_name}
            </Link>
          </h3>

          <p className="mt-1 text-[13px] font-semibold leading-snug">{lifespan}</p>

          {member.notes && (
            <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-relaxed">
              {member.notes}
            </p>
          )}
        </div>

        <div
          className={cx(s.menuSlot, "-mt-1.5")}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <LovedOneMenu
            onEdit={onEdit}
            onDeleteClick={onDelete}
            label={`Options for ${member.full_name}`}
          />
        </div>
      </div>
    </div>
  );
}
