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
      <div className="w-full mb-6 rounded-xl border border-black/5 bg-[#F6F3EC] px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Text */}
          <div>
            <h3 className="font-serif text-lg text-[#2f3e34]">
              You’ve mapped the people.
            </h3>

            <p className="mt-1 text-sm text-[#2f3e34]/70 max-w-xl">
              The next step is telling their story — through a timeline, album, or capsule.
            </p>

            <p className="mt-1 text-xs text-[#2f3e34]/55">
              For the full experience, most people do this from a desktop or laptop — with time and intention.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-3 sm:mt-0">
            <Button onClick={() => setOpenPicker(true)}>
              Start a story
            </Button>

            <button
              onClick={() => setSessionDismissed(true)}
              className="text-xs text-[#2f3e34]/50 hover:text-[#2f3e34]/70 transition"
            >
              Dismiss for now
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
