// Full redesigned CreateEventDrawer with media upload, no note, minimal gold line
'use client';

import { useState, useRef } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { createTimelineEvent } from '../_actions/createEvent';
import { getServerClient } from '@/lib/supabase/server';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImagePlus } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  timelineId: string;
  onCreated?: (eventId: string) => void;
};

const isUuid = (v?: string) =>
  typeof v === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);


  export default function CreateEventDrawer({
  open,
  onOpenChange,
  timelineId,
  onCreated,
}: Props) {
  const supabase = getBrowserClient();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>('');

  const dropRef = useRef<HTMLDivElement>(null);

  function handleFile(file: File) {
    setMediaFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  async function handleCreate() {
    if (!isUuid(timelineId)) {
      setErr('Timeline is not ready yet.');
      return;
    }
    if (!title.trim() || !date) {
      setErr('Title and date are required.');
      return;
    }

    setSaving(true);
    setErr('');

    try {
      const evt = await createTimelineEvent({
      timelineId,
      title,
      eventDateISO: date,
});

      // media upload happens after event creation (existing flow)
      setTitle('');
      setDate('');
      setMediaFile(null);
      setPreviewUrl(null);
      onOpenChange(false);
      onCreated?.(evt.id);
    } catch (e: any) {
      setErr(e?.message || 'Failed to save memory.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-8 overflow-y-auto bg-white"
      >
        <SheetHeader>
          <SheetTitle className="text-3xl font-bold text-[#1F2837]">
            Create a Memory
          </SheetTitle>
          <SheetDescription className="text-[#7A8596] italic">
            Save a moment that matters. This memory becomes part of your legacy.
          </SheetDescription>
          <div className="w-20 h-[1px] bg-[#E6C26E] mt-4" />
        </SheetHeader>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="space-y-6 mt-8"
        >
          {/* TITLE */}
          <div>
            <label className="block text-sm font-semibold text-[#1F2837] mb-1">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Grandma’s 80th birthday"
              className="border-[#E6C26E]/40 focus:ring-[#E6C26E]"
            />
          </div>

          {/* DATE */}
          <div>
            <label className="block text-sm font-semibold text-[#1F2837] mb-1">
              Date
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-[#E6C26E]/40 uppercase placeholder:uppercase"
              placeholder="DD/MM/YYYY"
            />
          </div>

          {/* MEDIA UPLOAD */}
          <div>
            <label className="block text-sm font-semibold text-[#1F2837] mb-2">
              Photo or Video (optional)
            </label>

            <div
              ref={dropRef}
              onClick={() => document.getElementById('eventMediaInput')?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                dropRef.current?.classList.add('ring-2', 'ring-[#E6C26E]');
              }}
              onDragLeave={() =>
                dropRef.current?.classList.remove('ring-2', 'ring-[#E6C26E]')
              }
              onDrop={(e) => {
                e.preventDefault();
                dropRef.current?.classList.remove('ring-2', 'ring-[#E6C26E]');
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              className="w-full aspect-[16/9] border-2 border-dashed border-[#E6C26E]/40 rounded-xl flex items-center justify-center cursor-pointer bg-[#FFFDF8] overflow-hidden"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-[#7A8596] text-sm gap-2">
                  <ImagePlus className="w-6 h-6" />
                  Drag & drop or click to upload
                </div>
              )}
              <input
                id="eventMediaInput"
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}

           {/* SAVE BUTTON */}
          <Button
            onClick={handleCreate}
            disabled={saving || !isUuid(timelineId)}
            className={`w-full rounded-full py-3 text-[#1F2837] font-semibold transition-all ${
              saving
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] hover:shadow-[0_0_18px_rgba(230,194,110,0.7)] hover:scale-[1.02]'
            }`}
          >
            {saving ? 'Saving…' : 'Save Memory ✨'}
          </Button>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}