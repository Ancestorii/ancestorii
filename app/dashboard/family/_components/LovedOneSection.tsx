"use client";

import { useId, type CSSProperties } from "react";
import LovedOneCard from "./LovedOneCard";
import { ui } from "@/components/dashboard/ui/AppBits";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

export default function LovedOneSection({
  title,
  members,
  onEdit,
  onDelete,
}: {
  title: string;
  members: any[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const headingId = useId();

  if (!members || members.length === 0) return null;

  const count = members.length;

  return (
    <section className={ui.section} aria-labelledby={headingId}>
      {/* The group's name with its count beside it */}
      <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 id={headingId} className={ui.h2}>
          {title}
        </h2>
        <span
          className={cx(ui.chip, ui.chipDot)}
          style={{ "--dot": "var(--c3)" } as CSSProperties}
        >
          {count} {count === 1 ? "loved one" : "loved ones"}
        </span>
      </div>

      {/* Columns follow the space beside the sidebar: 1 on phones, then 2, 3 and 4 */}
      <div className="@container">
        <ul
          role="list"
          className="grid grid-cols-1 gap-4 @md:grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4"
        >
          {members.map((m) => (
            <li key={m.id} className="min-w-0">
              <LovedOneCard
                member={m}
                onEdit={() => onEdit(m.id)}
                onDelete={() => onDelete(m.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
