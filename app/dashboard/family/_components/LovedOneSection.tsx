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
    <div className="mb-14">
      {/* Title with simple gold underline */}
      <h3 className="text-2xl font-semibold text-[#1F2837] mb-6">
        <span className="inline-flex flex-col">
          <span>{title}</span>
          <span className="h-[2px] w-[72px] mt-1 bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] rounded-full" />
        </span>
      </h3>

      {/* Cards – unchanged */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
        {members.map((m) => (
          <LovedOneCard
            key={m.id}
            member={m}
            onEdit={() => onEdit(m.id)}
            onDelete={() => onDelete(m.id)}
          />
        ))}
      </div>
    </div>
  );
}
