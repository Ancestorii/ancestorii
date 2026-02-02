'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function StoryPickerDrawer({ open, onClose }: Props) {
  const router = useRouter();

  if (!open) return null;

  const go = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
  className="
    absolute
    bottom-0 left-0 right-0
    md:inset-0 md:flex md:items-center md:justify-center
  "
>
  <div
    className="
      w-full
      rounded-t-2xl
      bg-[#F6F3EC]
      px-6 py-6
      shadow-xl

      md:rounded-2xl
      md:max-w-md
      md:mx-auto
    "
  >
        <h3 className="font-serif text-lg text-[#2f3e34] mb-2">
          What would you like to create?
        </h3>

        <p className="text-sm text-[#2f3e34]/65 mb-5">
          Choose how you want to tell their story.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={() => go('/dashboard/timeline')}
          >
            Timeline
          </Button>

          <Button
            variant="outline"
            onClick={() => go('/dashboard/albums')}
          >
            Album
          </Button>

          <Button
            variant="outline"
            onClick={() => go('/dashboard/capsules')}
          >
            Capsule
          </Button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 text-xs text-[#2f3e34]/50 hover:text-[#2f3e34]/70 transition"
        >
          Cancel
        </button>
            </div>
  </div>
</div>
  );
}

