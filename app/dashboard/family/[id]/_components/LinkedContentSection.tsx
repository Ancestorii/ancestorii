"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Image as ImageIcon,
  Package,
  Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  ui,
  Accent,
  Btn,
  IconTile,
  SectionHead,
  Tag,
  toneByKey,
  type Tone,
} from "@/components/dashboard/ui/AppBits";
import s from "./lovedOne.module.css";

const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

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
      className={ui.section}
      aria-labelledby="linked-title"
    >
      <SectionHead
        id="linked-title"
        tag="Everything connected"
        tagDot="var(--c1)"
        title={
          <span className="[overflow-wrap:anywhere]">
            Everything linked to <Accent>{firstName}</Accent>
          </span>
        }
        lead={
          <span className="[overflow-wrap:anywhere]">
            This space grows as memories are connected to {firstName}.
            Timelines capture life events, albums preserve moments, and
            capsules hold messages meant for the future.
          </span>
        }
        action={
          <div className={s.linkActions}>
            <ActionButton
              onClick={() => router.push("/dashboard/timeline")}
              label="Add timeline"
            />
            <ActionButton
              onClick={() => router.push("/dashboard/albums")}
              label="Create album"
            />
            <ActionButton
              onClick={() => router.push("/dashboard/capsules")}
              label="Create capsule"
            />
          </div>
        }
      />

      <ul role="list" className={s.linkGrid}>
        <li className="min-w-0">
          <ContentCard
            label="Timeline"
            Icon={Calendar}
            tone={toneByKey("aqua")}
            count={timelines.length}
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
          />
        </li>

        <li className="min-w-0">
          <ContentCard
            label="Album"
            Icon={ImageIcon}
            tone={toneByKey("orange")}
            count={albums.length}
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
          />
        </li>

        <li className="min-w-0">
          <ContentCard
            label="Capsule"
            Icon={Package}
            tone={toneByKey("pink")}
            count={capsules.length}
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
          />
        </li>
      </ul>
    </motion.section>
  );
}

function ActionButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <Btn
      variant="soft"
      size="sm"
      onClick={onClick}
      icon={<Plus size={16} strokeWidth={2.6} aria-hidden="true" />}
    >
      {label}
    </Btn>
  );
}

function ContentCard({
  label,
  title,
  text,
  onClick,
  Icon,
  tone,
  count,
}: {
  label: string;
  title: string;
  text: string;
  onClick: () => void;
  Icon: LucideIcon;
  tone: Tone;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(ui.card, ui.cardLink, s.linkCard)}
    >
      <span className={s.linkTop}>
        <IconTile Icon={Icon} tone={tone} />
        <span className={cx(ui.chip, ui.chipSm)}>{count} linked</span>
      </span>

      <Tag dot={tone.bg} className={s.linkLabel}>
        {label}
      </Tag>

      <span className={s.linkTitle}>{title}</span>

      <span className={s.linkText}>{text}</span>

      <span className={s.linkFoot}>
        <span className={s.linkOpen}>
          Open {label.toLowerCase()}
          <ArrowRight
            size={16}
            strokeWidth={2.6}
            className={s.linkArrow}
            aria-hidden="true"
          />
        </span>
      </span>
    </button>
  );
}
