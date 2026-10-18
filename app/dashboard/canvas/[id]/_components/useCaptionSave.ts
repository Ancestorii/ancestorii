'use client';

import { useEffect, useRef } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import type { CanvasAsset } from '@/types/memory-canvas';

// How long typing pauses before a caption is written (one write per pause, not per keystroke).
const SAVE_DELAY_MS = 600;

/**
 * Saves slot captions as the user types. The editor's copy updates at once; the database write
 * waits for a pause in typing, and the writes for one slot run one after another. A slot with
 * no row yet gets one on its first save, and only the row's id is copied back (never the
 * caption), so the letters typed while that first save was in flight are kept. Pending saves go
 * out when the layout unmounts. The old handlers wrote on every keystroke, copied a stale
 * caption back over the field, and never reported a failure.
 */
export function useCaptionSave(
  canvasId: string,
  onUpdateAsset: (asset: CanvasAsset) => void
): (slot: CanvasAsset, caption: string) => void {
  const onUpdateRef = useRef(onUpdateAsset);
  useEffect(() => {
    onUpdateRef.current = onUpdateAsset;
  }, [onUpdateAsset]);

  // Per slot: the latest copy, the pending timer, and the chain of writes in flight.
  const latest = useRef(new Map<number, CanvasAsset>());
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const chains = useRef(new Map<number, Promise<void>>());

  const write = async (slotIndex: number) => {
    const slot = latest.current.get(slotIndex);
    if (!slot) return;
    const caption = slot.caption ?? '';
    const supabase = getBrowserClient();
    try {
      if (slot.id) {
        const { data, error } = await supabase
          .from('memory_canvas_assets')
          .update({ caption })
          .eq('id', slot.id)
          .select('id')
          .maybeSingle();
        if (error) throw error;
        // Row security blocks an update silently (no row comes back) rather than erroring.
        if (!data) throw new Error('Caption not saved');
        return;
      }

      const { data, error } = await supabase
        .from('memory_canvas_assets')
        .upsert(
          { canvas_id: canvasId, slot_index: slotIndex, caption },
          { onConflict: 'canvas_id,slot_index' }
        )
        .select('id')
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Caption not saved');

      const current = latest.current.get(slotIndex);
      if (current && !current.id) {
        const withId = { ...current, id: data.id as string };
        latest.current.set(slotIndex, withId);
        onUpdateRef.current(withId);
      }
    } catch (err) {
      console.error('Failed to save caption:', err);
      toast.error('Could not save that caption. Please try again.');
    }
  };

  const queue = (slotIndex: number) => {
    const prev = chains.current.get(slotIndex) ?? Promise.resolve();
    const next = prev.then(() => write(slotIndex));
    chains.current.set(slotIndex, next);
  };

  // Unmount: whatever is still waiting for the pause goes out now.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer, slotIndex) => {
        clearTimeout(timer);
        queue(slotIndex);
      });
      pending.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (slot: CanvasAsset, caption: string) => {
    const next: CanvasAsset = { ...slot, caption };
    // Keep an id learned from an earlier save if the caller's copy predates it.
    const known = latest.current.get(slot.slot_index);
    if (!next.id && known?.id) next.id = known.id;
    latest.current.set(slot.slot_index, next);
    onUpdateRef.current(next);

    const timer = timers.current.get(slot.slot_index);
    if (timer) clearTimeout(timer);
    timers.current.set(
      slot.slot_index,
      setTimeout(() => {
        timers.current.delete(slot.slot_index);
        queue(slot.slot_index);
      }, SAVE_DELAY_MS)
    );
  };
}
