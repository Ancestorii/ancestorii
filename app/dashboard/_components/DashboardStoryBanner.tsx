'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import StoryPickerDrawer from './StoryPickerDrawer';

type Props = {
  lovedOnesCount: number;
  capsulesCount: number;
  albumsCount: number;
  timelinesCount: number;
};

export default function DashboardStoryBanner({
  lovedOnesCount,
  capsulesCount,
  albumsCount,
  timelinesCount,
}: Props) {
  const [sessionDismissed, setSessionDismissed] = useState(false);
  const [openPicker, setOpenPicker] = useState(false);

  const hasStories =
    capsulesCount > 0 ||
    albumsCount > 0 ||
    timelinesCount > 0;

  const shouldShow =
    lovedOnesCount > 0 &&
    !hasStories &&
    !sessionDismissed;

  if (!shouldShow) return null;

  return (
    <>
      <div className="w-full mb-8 rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#F9F6EE] to-[#F3EFE5] px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Text */}
          <div className="max-w-xl">
            <h3 className="font-serif text-xl text-[#2f3e34]">
              You’ve added the people who matter.
            </h3>

            <p className="mt-2 text-sm text-[#2f3e34]/70">
              Now give them something lasting — a timeline, an album, or a capsule that carries their story forward.
            </p>

            <p className="mt-3 text-xs italic text-[#2f3e34]/55">
              Most people create these on a desktop or laptop, with a little quiet time.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <Button
              onClick={() => setOpenPicker(true)}
              className="rounded-full px-6 py-3 bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837] font-medium shadow hover:shadow-md transition"
            >
              Begin their story
            </Button>

            <button
              onClick={() => setSessionDismissed(true)}
              className="text-xs text-[#2f3e34]/50 hover:text-[#2f3e34]/70 transition"
            >
              I’ll come back to this
            </button>
          </div>
        </div>
      </div>

      <StoryPickerDrawer
        open={openPicker}
        onClose={() => setOpenPicker(false)}
      />
    </>
  );
}
