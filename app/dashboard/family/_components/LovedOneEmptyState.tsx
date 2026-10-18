"use client";

import { HandHeart, Plus } from "lucide-react";
import { Accent, Btn, EmptyState, toneByKey } from "@/components/dashboard/ui/AppBits";

export default function LovedOneEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      Icon={HandHeart}
      tone={toneByKey("aqua")}
      title={
        <>
          Start with one person. <Accent>Keep their story close.</Accent>
        </>
      }
      text="Add the people you love and begin building a place for their memories, milestones, and legacy to live beautifully for years to come."
    >
      <Btn onClick={onAdd} aria-haspopup="dialog" tile={<Plus size={18} strokeWidth={2.4} />}>
        Add Your First Loved One
      </Btn>
    </EmptyState>
  );
}
