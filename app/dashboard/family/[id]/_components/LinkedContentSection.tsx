"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

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

  const visibleAlbums = useMemo(() => albums.slice(0, MAX_VISIBLE), [albums]);

  const visibleCapsules = useMemo(
    () => capsules.slice(0, MAX_VISIBLE),
    [capsules]
  );

  const firstTimeline = visibleTimelines[0];
  const firstAlbum = visibleAlbums[0];
  const firstCapsule = visibleCapsules[0];

  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="relative mt-16 overflow-hidden rounded-[34px] border border-[#ebe4dc]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#fffdfa_0%,#faf4ee_22%,#f7efe7_50%,#f3ebe5_78%,#f8f5f1_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_34%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(243,215,171,0.34),transparent_26%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(225,234,255,0.34),transparent_24%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(237,228,255,0.34),transparent_24%)]" />
      <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(99,73,49,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(99,73,49,0.16)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="relative px-4 pb-20 pt-14 sm:px-6 sm:pt-16 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-[1420px]">
          <div className="max-w-[820px]">
            <div className="inline-flex items-center rounded-full border border-[#eadfce] bg-white px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#96661f] shadow-[0_8px_24px_rgba(44,28,12,0.05)]">
              Everything connected
            </div>

            <h3 className="mt-5 text-[2.05rem] font-semibold leading-[0.96] tracking-[-0.05em] text-[#1f1713] sm:text-[2.45rem] lg:text-[3.15rem]">
              Everything linked to {firstName}
            </h3>

            <p className="mt-5 max-w-[720px] text-[15px] leading-8 text-[#655347] sm:text-[15.5px]">
              This space grows as memories are connected to {firstName}.
              Timelines capture life events, albums preserve moments, and
              capsules hold messages meant for the future.
            </p>

            <div className="mt-6 h-px w-full max-w-[620px] bg-[linear-gradient(90deg,#c6a47a_0%,#e9d8c5_46%,transparent_100%)]" />

            <div className="mt-8 flex flex-wrap gap-3.5">
              <ActionButton
                onClick={() => router.push("/dashboard/timeline")}
                label="Add timeline"
                className="border-[#dbe6ff] bg-[linear-gradient(180deg,#ffffff_0%,#eef4ff_100%)] text-[#2d61dc]"
              />
              <ActionButton
                onClick={() => router.push("/dashboard/albums")}
                label="Create album"
                className="border-[#f1e1bc] bg-[linear-gradient(180deg,#fffef9_0%,#fff1d8_100%)] text-[#a86a12]"
              />
              <ActionButton
                onClick={() => router.push("/dashboard/capsules")}
                label="Create capsule"
                className="border-[#e7ddff] bg-[linear-gradient(180deg,#ffffff_0%,#f2ecff_100%)] text-[#7648dc]"
              />
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3 lg:mt-14 lg:gap-7">
            <ContentCard
              label="Timeline"
              title={firstTimeline?.title || "No timeline yet"}
              text={
                firstTimeline?.description ||
                `Once a timeline is linked to ${member.full_name}, it will appear here.`
              }
              onClick={() =>
                firstTimeline
                  ? router.push(`/dashboard/timeline/${firstTimeline.id}`)
                  : router.push("/dashboard/timeline")
              }
              labelClassName="text-[#3566e6]"
              borderClassName="border-[#dce7ff]"
              lineClassName="from-[#7ca3ff] via-[#dce8ff] to-transparent"
              openTextClassName="text-[#3566e6]"
              tintClassName="bg-[radial-gradient(circle_at_top_right,rgba(88,130,255,0.11),transparent_40%)]"
            />

            <ContentCard
              label="Album"
              title={firstAlbum?.title || "No album yet"}
              text={
                firstAlbum?.description ||
                `Albums featuring ${member.full_name} will appear here.`
              }
              onClick={() =>
                firstAlbum
                  ? router.push(`/dashboard/albums/${firstAlbum.id}`)
                  : router.push("/dashboard/albums")
              }
              labelClassName="text-[#b7791f]"
              borderClassName="border-[#f0dfb8]"
              lineClassName="from-[#d7a147] via-[#f5e4c0] to-transparent"
              openTextClassName="text-[#b7791f]"
              tintClassName="bg-[radial-gradient(circle_at_top_right,rgba(227,185,87,0.13),transparent_40%)]"
            />

            <ContentCard
              label="Capsule"
              title={firstCapsule?.title || "No capsule yet"}
              text={
                firstCapsule?.message ||
                `Capsules created for ${member.full_name} will appear here.`
              }
              onClick={() =>
                firstCapsule
                  ? router.push(`/dashboard/capsules/${firstCapsule.id}`)
                  : router.push("/dashboard/capsules")
              }
              labelClassName="text-[#7b49e3]"
              borderClassName="border-[#e6dbff]"
              lineClassName="from-[#9870ff] via-[#ece3ff] to-transparent"
              openTextClassName="text-[#7b49e3]"
              tintClassName="bg-[radial-gradient(circle_at_top_right,rgba(150,112,255,0.13),transparent_40%)]"
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function ActionButton({
  onClick,
  label,
  className,
}: {
  onClick: () => void;
  label: string;
  className: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center rounded-[15px] border px-5 py-3 text-sm font-semibold shadow-[0_10px_24px_rgba(34,22,14,0.08)] transition duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_30px_rgba(34,22,14,0.12)] ${className}`}
    >
      {label}
    </button>
  );
}

function ContentCard({
  label,
  title,
  text,
  onClick,
  labelClassName,
  borderClassName,
  lineClassName,
  openTextClassName,
  tintClassName,
}: {
  label: string;
  title: string;
  text: string;
  onClick: () => void;
  labelClassName: string;
  borderClassName: string;
  lineClassName: string;
  openTextClassName: string;
  tintClassName: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-[30px] border bg-white p-7 text-left shadow-[0_18px_44px_rgba(35,22,13,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_56px_rgba(35,22,13,0.12)] ${borderClassName}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#fcfbf8_100%)]" />
      <div className={`absolute inset-0 ${tintClassName}`} />
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,#ffffff_0%,transparent_100%)]" />
      <div
        className={`absolute left-0 top-0 h-[3px] w-full bg-gradient-to-r ${lineClassName}`}
      />

      <div className="relative">
        <span
          className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${labelClassName}`}
        >
          {label}
        </span>

        <h4 className="mt-6 text-[19px] font-semibold leading-tight tracking-[-0.035em] text-[#171717]">
          {title}
        </h4>

        <p className="mt-3 text-[14px] leading-7 text-[#5f6470]">
          {text}
        </p>

        <div className="mt-6 h-px w-full bg-[linear-gradient(90deg,#ece5d8_0%,transparent_100%)]" />

        <div
          className={`mt-5 inline-flex items-center gap-2 text-[13px] font-semibold transition duration-200 group-hover:translate-x-[2px] ${openTextClassName}`}
        >
          Open {label.toLowerCase()}
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </button>
  );
}