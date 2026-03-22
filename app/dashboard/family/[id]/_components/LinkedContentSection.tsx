"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock3, ImageIcon, BookHeart } from "lucide-react";

type Timeline = {
  id: string;
  title: string;
  description?: string | null;
};

type Album = {
  id: string;
  title: string;
  description?: string | null;
};

type Capsule = {
  id: string;
  title: string;
  message?: string | null;
  is_locked?: boolean | null;
  unlock_date?: string | null;
};

type Props = {
  member: {
    full_name: string;
  };
  firstName: string;
  timelines: Timeline[];
  albums: Album[];
  capsules: Capsule[];
};

export default function LinkedContentSection({
  member,
  firstName,
  timelines,
  albums,
  capsules,
}: Props) {
  const router = useRouter();

  const MAX_VISIBLE = 5;

  const visibleTimelines = useMemo(
    () => timelines.slice(0, MAX_VISIBLE),
    [timelines]
  );

  const visibleAlbums = useMemo(
    () => albums.slice(0, MAX_VISIBLE),
    [albums]
  );

  const visibleCapsules = useMemo(
    () => capsules.slice(0, MAX_VISIBLE),
    [capsules]
  );

  return (
<motion.section
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7 }}
  className="relative"
>
<div className="relative">

<div className="px-2 sm:px-4 lg:px-8 pb-20 sm:pb-24 lg:pb-28">

<h3 className="text-[34px] font-semibold tracking-[-0.03em] text-[#111827]">
Everything linked to {firstName}
</h3>

<p className="mt-3 text-[15px] leading-7 text-[#5b6474] max-w-[650px]">
This space grows as memories are connected to {firstName}.  
Timelines capture life events, albums preserve moments, and capsules hold
messages meant for the future.
</p>

<div className="mt-7 flex gap-4 flex-wrap">

<button
onClick={() => router.push("/dashboard/timeline")}
className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#1f2937] to-[#111827] text-white px-5 py-2.5 text-sm font-semibold shadow-[0_6px_18px_rgba(0,0,0,0.25)] hover:translate-y-[1px]"
>
<Clock3 className="h-4 w-4"/>
Add timeline
</button>

<button
onClick={() => router.push("/dashboard/albums")}
className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#1f2937] to-[#111827] text-white px-5 py-2.5 text-sm font-semibold shadow-[0_6px_18px_rgba(0,0,0,0.25)] hover:translate-y-[1px]"
>
<ImageIcon className="h-4 w-4"/>
Create album
</button>

<button
onClick={() => router.push("/dashboard/capsules")}
className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#1f2937] to-[#111827] text-white px-5 py-2.5 text-sm font-semibold shadow-[0_6px_18px_rgba(0,0,0,0.25)] hover:translate-y-[1px]"
>
<BookHeart className="h-4 w-4"/>
Create capsule
</button>

</div>
</div>

<div className="grid md:grid-cols-3 gap-8 px-2 sm:px-4 lg:px-8">

{/* TIMELINE */}
<div
onClick={() =>
visibleTimelines[0]
? router.push(`/dashboard/timeline/${visibleTimelines[0].id}`)
: router.push("/dashboard/timeline")
}
className="relative group cursor-pointer rounded-[26px] border border-[#e4ebf7] bg-gradient-to-b from-[#f6f9ff] to-white p-7 shadow-[0_18px_40px_rgba(20,40,120,0.10)]"
>

<div className="absolute right-6 top-6 flex items-center justify-center h-12 w-12 rounded-xl bg-[#e6efff] text-[#3566e6] shadow-inner">
<Clock3 className="h-5 w-5"/>
</div>

<span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#3566e6]">
Timeline
</span>

<h4 className="mt-6 text-[18px] font-semibold text-[#0f172a]">
{visibleTimelines[0]?.title || "No timeline yet"}
</h4>

<p className="mt-2 text-sm text-[#667085] leading-relaxed">
{visibleTimelines[0]?.description ||
`Once a timeline is linked to ${member.full_name}, it will appear here.`}
</p>

</div>

{/* ALBUM */}
<div
onClick={() =>
visibleAlbums[0]
? router.push(`/dashboard/albums/${visibleAlbums[0].id}`)
: router.push("/dashboard/albums")
}
className="relative group cursor-pointer rounded-[26px] border border-[#efe4c6] bg-gradient-to-b from-[#fffaf0] to-white p-7 shadow-[0_18px_40px_rgba(120,80,10,0.12)]"
>

<div className="absolute right-6 top-6 flex items-center justify-center h-12 w-12 rounded-xl bg-[#fff1cf] text-[#b7791f] shadow-inner">
<ImageIcon className="h-5 w-5"/>
</div>

<span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#b7791f]">
Album
</span>

<h4 className="mt-6 text-[18px] font-semibold text-[#0f172a]">
{visibleAlbums[0]?.title || "No album yet"}
</h4>

<p className="mt-2 text-sm text-[#667085] leading-relaxed">
{visibleAlbums[0]?.description ||
`Albums featuring ${member.full_name} will appear here.`}
</p>

</div>

{/* CAPSULE */}
<div
onClick={() =>
visibleCapsules[0]
? router.push(`/dashboard/capsules/${visibleCapsules[0].id}`)
: router.push("/dashboard/capsules")
}
className="relative group cursor-pointer rounded-[26px] border border-[#e6defc] bg-gradient-to-b from-[#f8f6ff] to-white p-7 shadow-[0_18px_40px_rgba(80,50,140,0.12)]"
>

<div className="absolute right-6 top-6 flex items-center justify-center h-12 w-12 rounded-xl bg-[#ede9fe] text-[#7c3aed] shadow-inner">
<BookHeart className="h-5 w-5"/>
</div>

<span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#7c3aed]">
Capsule
</span>

<h4 className="mt-6 text-[18px] font-semibold text-[#0f172a]">
{visibleCapsules[0]?.title || "No capsule yet"}
</h4>

<p className="mt-2 text-sm text-[#667085] leading-relaxed">
{visibleCapsules[0]?.message ||
`Capsules created for ${member.full_name} will appear here.`}
</p>

</div>

</div>
</div>
</motion.section>
  );
}