'use client';

import { useState, useRef, useId } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { createTimelineEvent } from '../_actions/createEvent';
import { ensureDisplayableImage } from '@/lib/convertImage';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, ImagePlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { ui, appRoot, IconTile, Spinner, toneByKey } from '@/components/dashboard/ui/AppBits';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

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
  const titleFieldId = useId();
  const dateFieldId = useId();
  // Radix hands focus back to a SheetTrigger on close, and this sheet opens from the page's own
  // buttons (it has no trigger), so focus fell to the page's body: remember the button that
  // opened it, and give focus back to that.
  const openerRef = useRef<HTMLElement | null>(null);

  function handleFile(file: File) {
    setMediaFile(file);
    setPreviewUrl(URL.createObjectURL(file));
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
      // 1️⃣ CREATE EVENT
      const evt = await createTimelineEvent({
        timelineId,
        title,
        eventDateISO: date,
      });

      // 2️⃣ UPLOAD MEDIA (IF PROVIDED)
      if (mediaFile) {
        const { data: sess } = await supabase.auth.getSession();
        const user = sess?.session?.user;
        if (!user) throw new Error('Not authenticated');

        const processedFile =
  mediaFile.type.startsWith('image/') || mediaFile.name.toLowerCase().match(/\.(heic|heif)$/)
    ? await ensureDisplayableImage(mediaFile)
    : mediaFile;
        const ext = processedFile.name.split('.').pop();
        const fileId = crypto.randomUUID();
        const path = `${user.id}/${evt.id}/media/${fileId}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from('timeline-media')
          .upload(path, processedFile, { upsert: false });

        if (uploadErr) throw uploadErr;

        const fileType =
          processedFile.type.startsWith('image')
            ? 'photo'
            : processedFile.type.startsWith('video')
            ? 'video'
            : 'file';

        const { error: insertErr } = await supabase
          .from('timeline_event_media')
          .insert({
            event_id: evt.id,
            file_path: path,
            file_type: fileType,
          });

        if (insertErr) throw insertErr;
      }

      // 3️⃣ FORCE TIMELINE REFRESH
      window.dispatchEvent(new Event('timeline-media-updated'));

      // 4️⃣ RESET + CLOSE
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
      {/* A Radix portal outside the dashboard's .app root: appRoot brings the kit's tokens and
          Plus Jakarta Sans. The kit's right sheet: header, a scrolling body, a footer. */}
      <SheetContent
        side="right"
        className={cx(appRoot, 'w-full sm:max-w-lg')}
        onOpenAutoFocus={() => {
          openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        }}
        onCloseAutoFocus={(e) => {
          const opener = openerRef.current;
          if (opener?.isConnected) {
            e.preventDefault();
            opener.focus({ preventScroll: true });
          }
        }}
      >
        <SheetHeader>
          <SheetTitle>
            Create a Memory
          </SheetTitle>
          <SheetDescription>
            Save a moment that matters. This memory becomes part of your legacy.
          </SheetDescription>
        </SheetHeader>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={ui.sheetBody}
        >
          {/* TITLE */}
          <div className={ui.field}>
            <label htmlFor={titleFieldId} className={ui.label}>
              Title
            </label>
            <Input
              id={titleFieldId}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Grandma’s 80th birthday"
            />
          </div>

          {/* DATE */}
          <div className={ui.field}>
            <label htmlFor={dateFieldId} className={ui.label}>
              Date
            </label>
            <Input
              id={dateFieldId}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="uppercase placeholder:uppercase"
            />
          </div>

          {/* MEDIA UPLOAD */}
          <div className={ui.field}>
            <label htmlFor="eventMediaInput" className={ui.label}>
              Photo or Video (optional)
            </label>

            <div
              ref={dropRef}
              onClick={() =>
                document.getElementById('eventMediaInput')?.click()
              }
              onDragOver={(e) => {
                e.preventDefault();
                dropRef.current?.classList.add(ui.dropzoneActive);
              }}
              onDragLeave={() =>
                dropRef.current?.classList.remove(ui.dropzoneActive)
              }
              onDrop={(e) => {
                e.preventDefault();
                dropRef.current?.classList.remove(ui.dropzoneActive);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              className={cx(ui.dropzone, 'aspect-[16/9] min-h-0 overflow-hidden', mediaFile && 'p-0')}
            >
              {mediaFile ? (
  mediaFile.type.startsWith('image') ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={previewUrl!}
      alt="Preview"
      className="w-full h-full object-cover"
    />
  ) : mediaFile.type.startsWith('video') ? (
    <div className="relative w-full h-full overflow-hidden">
      <video
        src={previewUrl!}
        className="w-full h-full object-cover"
        muted
        playsInline
      />
    </div>
  ) : null
) : (
                <>
                  {/* The aqua Timelines tile, as in the timeline's own cover picker */}
                  <IconTile Icon={ImagePlus} tone={toneByKey('aqua')} />
                  <span className={ui.dropzoneTitle}>Drag & drop or click to upload</span>
                </>
              )}

              {/* Visually hidden, not display:none, so the keyboard can reach it (the zone's
                  ring shows its focus); its own click mustn't reach the zone and open it twice */}
              <input
                id="eventMediaInput"
                type="file"
                accept="image/*,video/*"
                className={ui.srOnly}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>
          </div>
        </motion.div>

        <SheetFooter>
          {err && (
            <p className={cx(ui.fieldError, 'm-0 basis-full')} role="alert">
              {err}
            </p>
          )}

          {/* SAVE: the sheet's main action, ink with the gradient tile */}
          <Button
            onClick={handleCreate}
            disabled={saving || !isUuid(timelineId)}
            className="justify-between gap-3.5 pl-5 pr-1.5"
          >
            {saving ? 'Saving…' : 'Save Memory'}
            <span className={ui.btnTile} aria-hidden="true">
              {saving ? <Spinner size={16} /> : <Check size={18} className="size-[18px]" strokeWidth={2.6} />}
            </span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
