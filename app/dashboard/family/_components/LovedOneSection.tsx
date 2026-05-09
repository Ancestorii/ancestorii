"use client";

import LovedOneCard from "./LovedOneCard";

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
  if (!members || members.length === 0) return null;

  return (
    <section className="mb-16 sm:mb-20">
      <div className="mb-7 sm:mb-8">
        <div className="flex items-center gap-3">
        </div>

        <h3 className="mt-3 font-serif text-[1.9rem] leading-[0.98] text-[#102347] sm:text-[2.2rem] lg:text-[2.5rem]">
          {title.split(" ").slice(0, -1).join(" ")}{" "}
          <span className="italic text-[#c99732]">
            {title.split(" ").slice(-1).join(" ")}
          </span>
        </h3>
      </div>

      <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
        {members.map((m) => (
          <LovedOneCard
            key={m.id}
            member={m}
            onEdit={() => onEdit(m.id)}
            onDelete={() => onDelete(m.id)}
          />
        ))}
      </div>
    </section>
  );
}