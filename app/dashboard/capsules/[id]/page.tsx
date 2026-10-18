'use client';

import { useCallback, useEffect, useId, useState, type CSSProperties } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import Image from "next/image";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Images,
  Lock,
  LockOpen,
  Mic,
  Package,
  Play,
  Quote,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import {
  ui,
  AppLoader,
  Avatar,
  Btn,
  EmptyState,
  Eyebrow,
  IconBtn,
  IconTile,
  Spinner,
  toneByKey,
  useDialog,
} from '@/components/dashboard/ui/AppBits';
import UploadCapsuleMediaDrawer from '../_components/UploadCapsuleMediaDrawer';
import CapsuleMediaInteractionsPanel from '../_components/media-interactions/CapsuleMediaInteractionsPanel';
import UniversalPeopleTagger from '@/components/UniversalPeopleTagger';
import CapsuleSealOverlay from '@/components/CapsuleSealOverlay';
import LibraryPickerModal, { LibraryPickerItem } from '@/components/LibraryPickerModal';
import CapsuleAI from '../_components/CapsuleAI';
import s from '../_components/capsuleDetail.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const longDate = (value: string) =>
  new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

type Capsule = {
  id: string;
  title: string;
  description: string | null;
  unlock_date: string;
  is_locked: boolean;
  created_at: string;
};

type Media = {
  id: string;
  capsule_id: string;

  file_path: string | null;
  file_type: string | null;

  library_media_id?: string | null;
  library_media?: {
    id: string;
    file_path: string;
    file_type: string;
    created_at: string | null;
  } | null;

  created_at: string;
  signed_url?: string | null;
};

// Inside a tile button, so a span (a button holds only inline content). The photo fills the
// square tile.
function CapsuleMediaImage({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <span className="relative block h-full w-full">
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 767px) 50vw, (max-width: 1023px) 34vw, 260px"
        quality={75}
        className={`object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoadingComplete={() => setLoaded(true)}
      />
    </span>
  );
}

export default function CapsuleDetailPage() {
  const supabase = getBrowserClient();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const capsuleId = (params?.id as string) || '';

  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [media, setMedia] = useState<Media[]>([]);

  const [loading, setLoading] = useState(true);
  const signCapsuleMedia = useCallback(async (filePath: string) => {
  const objectPath = filePath.includes("capsule-media/")
    ? filePath.split("capsule-media/")[1]
    : filePath;

  const { data } = await supabase.storage
    .from("capsule-media")
    .createSignedUrl(objectPath, 60 * 60 * 24 * 7);

  return data?.signedUrl ? `${data.signedUrl}&cb=${Date.now()}` : null;
}, [supabase]);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [libraryPickerOpen, setLibraryPickerOpen] = useState(false);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  
  function openViewer(index: number) {
  setViewerIndex(index);
  setViewerOpen(true);
}

  // 🔒 Seal animation overlay
const [sealOverlayOpen, setSealOverlayOpen] = useState(false);

  const [taggedPeople, setTaggedPeople] = useState<
  {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    avatar_signed?: string | null;
  }[]
  >([]);

  const removePersonFromCapsule = async (familyMemberId: string) => {
  await supabase
    .from("capsule_tags")
    .delete()
    .eq("capsule_id", capsuleId)
    .eq("family_member_id", familyMemberId);

  setTaggedPeople((prev) =>
    prev.filter((p) => p.id !== familyMemberId)
  );
};


  const [confirmSeal, setConfirmSeal] = useState(false);
  const [sealing, setSealing] = useState(false);

  // The viewer and the seal confirm: Escape closes them (as the close button and Cancel
  // do), Tab stays inside, and focus returns to the button that opened them.
  const viewerTitleId = useId();
  const confirmTitleId = useId();
  const confirmTextId = useId();
  const viewerRef = useDialog<HTMLDivElement>(viewerOpen && viewerIndex !== null, () => setViewerOpen(false));
  const confirmRef = useDialog<HTMLDivElement>(confirmSeal, () => setConfirmSeal(false));

  const handleDeleteMedia = async (m: Media) => {
  try {

    // 🔹 If library media → unlink only
    if (m.library_media_id) {
      const { error } = await supabase
        .from("capsule_media")
        .delete()
        .eq("id", m.id);

      if (error) throw error;

      setMedia((prev) => prev.filter((x) => x.id !== m.id));
      toast.success("Removed from capsule.");
      return;
    }

    // 🔹 Direct upload → delete storage file
    if (m.file_path) {
      const objectPath = m.file_path.includes("capsule-media/")
        ? m.file_path.split("capsule-media/")[1]
        : m.file_path;

      await supabase.storage
        .from("capsule-media")
        .remove([objectPath]);
    }

    const { error } = await supabase
      .from("capsule_media")
      .delete()
      .eq("id", m.id);

    if (error) throw error;

    setMedia((prev) => prev.filter((x) => x.id !== m.id));

    toast.success("Memory deleted.");
  } catch (e) {
    console.error(e);
    toast.error("Failed to delete memory.");
  }
};

const handlePickFromLibrary = async (item: LibraryPickerItem) => {
  try {
    const { data: sess } = await supabase.auth.getSession();
    const u = sess?.session?.user;
    if (!u) throw new Error("Not authenticated.");

    const { data, error } = await supabase
      .from("capsule_media")
      .insert({
        capsule_id: capsuleId,
        library_media_id: item.id,
        file_path: null,
        file_type: item.file_type,
      })
      .select(`
        id,
        capsule_id,
        file_path,
        file_type,
        created_at,
        library_media_id,
        library_media:library_media_id (
          id,
          file_path,
          file_type,
          created_at
        )
      `)
      .single();

    if (error) throw error;

    const lib = Array.isArray((data as any)?.library_media)
      ? (data as any).library_media[0]
      : (data as any).library_media;

    const realPath = lib?.file_path;
    if (!realPath) throw new Error("Missing library file path.");

    const { data: signed } = await supabase.storage
      .from("library-media")
      .createSignedUrl(realPath, 60 * 60 * 24 * 7);

    const rowWithSigned = {
      ...data,
      signed_url: signed?.signedUrl
        ? `${signed.signedUrl}&cb=${Date.now()}`
        : null,
    };

    setMedia((prev) => [rowWithSigned as any, ...prev]);

    toast.success("Added from your library.");
  } catch (e: any) {
    console.error(e);
    toast.error(e?.message || "Failed to add from library.");
  }
};

const loadTaggedPeople = async () => {
  const { data, error } = await supabase
    .from('capsule_tags')
    .select(`
      family_members (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('capsule_id', capsuleId);

  if (error) {
    console.error(error);
    return;
  }

  const mapped =
    data?.map((x: any) => x.family_members).filter(Boolean) || [];

  const withSigned = await Promise.all(
    mapped.map(async (p: any) => {
      if (!p.avatar_url) return { ...p, avatar_signed: null };

      const { data: signed } = await supabase.storage
        .from('user-media')
        .createSignedUrl(p.avatar_url, 60 * 60 * 24 * 7);

      return {
        ...p,
        avatar_signed: signed?.signedUrl || null,
      };
    })
  );

  setTaggedPeople(withSigned);
};

 useEffect(() => {
  function handleKey(e: KeyboardEvent) {
    if (!viewerOpen) return;

    if (e.key === "ArrowRight") nextMedia();
    if (e.key === "ArrowLeft") prevMedia();
    if (e.key === "Escape") setViewerOpen(false);
  }

  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}, [viewerOpen, viewerIndex, media]);


  // ------- Fetch capsule & media -------
  useEffect(() => {
    if (!capsuleId) return;
    (async () => {
      try {
        setLoading(true);

        const { data: capsuleData, error: capsuleErr } = await supabase
          .from('memory_capsules')
          .select('id,title,description,unlock_date,is_locked,created_at')
          .eq('id', capsuleId)
          .single();
        if (capsuleErr) throw capsuleErr;

       const { data: mediaData, error: mediaErr } = await supabase
  .from('capsule_media')
  .select(`
  id,
  capsule_id,
  file_path,
  file_type,
  created_at,
  library_media_id,
  library_media:library_media_id (
    id,
    file_path,
    file_type,
    created_at
  )
`)
  .eq('capsule_id', capsuleId)
  .order('created_at', { ascending: false });

if (mediaErr) throw mediaErr;

// split library vs capsule files
const capsuleRows = (mediaData ?? []).filter((m: any) => !m.library_media_id);
const libraryRows = (mediaData ?? []).filter((m: any) => m.library_media_id);

// extract paths
const capsulePaths = capsuleRows
  .map((m: any) => {
    if (!m.file_path) return null;
    return m.file_path.includes("capsule-media/")
      ? m.file_path.split("capsule-media/")[1]
      : m.file_path;
  })
  .filter(Boolean);

const libraryPaths = libraryRows
  .map((m: any) => m.library_media?.file_path)
  .filter(Boolean);

// batch sign URLs
const [capsuleSigned, librarySigned] = await Promise.all([
  capsulePaths.length
    ? supabase.storage.from("capsule-media").createSignedUrls(capsulePaths, 60 * 60 * 24 * 7)
    : { data: [] },

  libraryPaths.length
    ? supabase.storage.from("library-media").createSignedUrls(libraryPaths, 60 * 60 * 24 * 7)
    : { data: [] },
]);

// rebuild media list
const signedMedia: Media[] = (mediaData ?? []).map((m: any) => {
  const isLibrary = !!m.library_media_id;

  if (isLibrary) {
    const idx = libraryRows.findIndex((r: any) => r.id === m.id);
    const url = librarySigned.data?.[idx]?.signedUrl ?? null;
    return { ...m, signed_url: url ? `${url}&cb=${Date.now()}` : null };
  }

  const idx = capsuleRows.findIndex((r: any) => r.id === m.id);
  const url = capsuleSigned.data?.[idx]?.signedUrl ?? null;

  return { ...m, signed_url: url ? `${url}&cb=${Date.now()}` : null };
});

setCapsule(capsuleData);
setMedia(signedMedia);
await loadTaggedPeople();
      } catch (e) {
        console.error(e);
        toast.error('Failed to load capsule.');
      } finally {
        setLoading(false);
      }
    })();
  }, [capsuleId, supabase]);


  const handleSealCapsule = async () => {
  try {
    setSealing(true);

    const { error } = await supabase
      .from('memory_capsules')
      .update({ is_locked: true })
      .eq('id', capsuleId);

    if (error) throw error;

    // Update local state
    setCapsule((prev) =>
      prev ? { ...prev, is_locked: true } : prev
    );

    setConfirmSeal(false);

    // 🔒 PLAY SEAL ANIMATION
    setSealOverlayOpen(true);
    // ⏱️ After animation, go back to dashboard
setTimeout(() => {
  router.push('/dashboard/capsules');
}, 2200); // match your overlay animation length
  } catch (e) {
    console.error(e);
    toast.error('Failed to seal capsule.');
  } finally {
    setSealing(false);
  }
};


  if (loading) {
    return (
      <div className={ui.page}>
        <AppLoader label="Loading capsule" />
      </div>
    );
  }

  if (!capsule) {
    return (
      <div className={ui.page}>
        <div className={ui.wrapNarrow}>
          <EmptyState Icon={Package} tone={toneByKey('pink')} title="Capsule not found">
            <Btn
              variant="soft"
              onClick={() => router.push('/dashboard/capsules')}
              icon={<ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />}
            >
              Back to Capsules
            </Btn>
          </EmptyState>
        </div>
      </div>
    );
  }

  const currentMedia =
  viewerIndex !== null ? media[viewerIndex] : null;

function nextMedia() {
  if (viewerIndex === null) return;
  setViewerIndex((viewerIndex + 1) % media.length);
}

function prevMedia() {
  if (viewerIndex === null) return;
  setViewerIndex(
    (viewerIndex - 1 + media.length) % media.length
  );
}

  // The state chip (display only), as on the capsule cards: sealed until its date, sealed
  // and its date has come (ready to open), not sealed yet (its date is ahead and it is still
  // being filled), or open (unsealed with its date passed: unlock_due_capsules() unseals a
  // sealed capsule on its date, and a capsule never sealed is open too).
  const unlockTime = new Date(capsule.unlock_date).getTime();
  const hasUnlockDate = !Number.isNaN(unlockTime);
  const dateAhead = hasUnlockDate && unlockTime > Date.now();
  const capsuleState: 'sealed' | 'ready' | 'opens' | 'opened' = capsule.is_locked
    ? dateAhead
      ? 'sealed'
      : 'ready'
    : dateAhead
    ? 'opens'
    : 'opened';

  const viewerIsVideo =
    !!currentMedia &&
    (currentMedia.file_type === "video" ||
      currentMedia.library_media?.file_type === "video");
  const viewerType = currentMedia
    ? (currentMedia.file_type ?? currentMedia.library_media?.file_type) || ""
    : "";
  const viewerIsAudio = !viewerIsVideo && viewerType.startsWith("audio");

  return (
    <div className={cx(ui.page, s.page)}>
      <div className={ui.wrap}>
        {/* -------- Header: back, the capsule's actions, its title and state -------- */}
        <div className={s.headerWrap}>
          <header className={cx(ui.header, s.header)}>
            <div className={ui.headerGlow} aria-hidden="true" />

            <Btn
              variant="soft"
              size="sm"
              onClick={() => router.push('/dashboard/capsules')}
              icon={<ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />}
              className={s.back}
            >
              Back to Capsules
            </Btn>

            {/* Actions */}
            <div className={s.actions}>
              <Btn
                variant="soft"
                size="sm"
                onClick={() => setLibraryPickerOpen(true)}
                aria-haspopup="dialog"
                icon={<BookOpen size={17} strokeWidth={2.2} aria-hidden="true" />}
              >
                My Library
              </Btn>

              <Btn
                variant="soft"
                size="sm"
                onClick={() => setTagOpen(true)}
                aria-haspopup="dialog"
                icon={<Users size={17} strokeWidth={2.2} aria-hidden="true" />}
              >
                Tag Someone
              </Btn>

              {!capsule.is_locked && (
                <Btn
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmSeal(true)}
                  aria-haspopup="dialog"
                  icon={<Lock size={17} strokeWidth={2.4} aria-hidden="true" />}
                  className={s.actSeal}
                >
                  Seal Capsule
                </Btn>
              )}

              <Btn
                size="sm"
                onClick={() => setUploadOpen(true)}
                aria-haspopup="dialog"
                tile={<Upload size={16} strokeWidth={2.4} />}
                className={s.actUpload}
              >
                Upload Memory
              </Btn>
            </div>

            <div className={s.titleBlock}>
              <Eyebrow dot="var(--c0)">Capsule</Eyebrow>

              <h1 className={cx(ui.title, ui.titleMd, s.title)}>{capsule.title}</h1>

              <div className={ui.meta}>
                {capsuleState === 'sealed' && (
                  <span className={cx(ui.chip, ui.chipInk)}>
                    <Lock size={14} strokeWidth={2.6} aria-hidden="true" />
                    Sealed
                  </span>
                )}
                {capsuleState === 'sealed' && (
                  <span className={ui.chip}>Unlocks on {longDate(capsule.unlock_date)}</span>
                )}
                {capsuleState === 'opens' && (
                  <span
                    className={cx(ui.chip, ui.chipDot)}
                    style={{ '--dot': 'var(--c0)' } as CSSProperties}
                  >
                    Not sealed yet
                  </span>
                )}
                {capsuleState === 'ready' && (
                  <span
                    className={cx(ui.chip, ui.chipDot)}
                    style={{ '--dot': 'var(--c3)' } as CSSProperties}
                  >
                    Ready to open
                  </span>
                )}
                {capsuleState === 'opened' && (
                  <span className={ui.chip}>
                    <LockOpen size={14} strokeWidth={2.6} aria-hidden="true" />
                    Open
                  </span>
                )}
                <span className={ui.chip}>
                  <Images size={15} strokeWidth={2.4} aria-hidden="true" />
                  {plural(media.length, 'memory', 'memories')}
                </span>
              </div>

              {capsule.description && (
                <div className={cx(ui.card, s.message)}>
                  <IconTile Icon={Quote} tone={toneByKey('pink')} size="sm" />
                  <p className={s.messageText}>{capsule.description}</p>
                </div>
              )}

              {/* Tagged people */}
              {taggedPeople.length > 0 && (
                <ul className={s.people} aria-label="People in this capsule">
                  {taggedPeople.map((p) => (
                    <li key={p.id} className={cx(ui.chip, s.person)}>
                      <span className={s.personAvatar} aria-hidden="true">
                        <Avatar src={p.avatar_signed} name={p.full_name} size={24} plain />
                      </span>
                      <span className={s.personName}>{p.full_name}</span>
                      <button
                        type="button"
                        onClick={() => removePersonFromCapsule(p.id)}
                        className={s.personRemove}
                        aria-label={`Remove ${p.full_name} from this capsule`}
                        title="Remove from this capsule"
                      >
                        <X size={14} strokeWidth={2.6} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </header>
        </div>

        <div className={s.body}>
          {/* -------- Media Grid -------- */}
          <section className={s.mediaCol} aria-label="Memories">
            {media.length === 0 ? (
              <EmptyState
                Icon={ImagePlus}
                tone={toneByKey('pink')}
                title="No memories yet"
                text="Add your first photo or video."
              />
            ) : (
              <ul className={s.grid}>
                {media.map((m, i) => {
                  const realType = (m.file_type ?? m.library_media?.file_type) || "";
                  const isVideo = realType === "video";
                  // A voice note uploaded as a memory (the upload accepts audio): it showed as a
                  // broken image before.
                  const isAudio = !isVideo && realType.startsWith("audio");

                  return (
                    <li key={m.id} className={s.tile}>
                      <button
                        type="button"
                        onClick={() => openViewer(i)}
                        aria-haspopup="dialog"
                        aria-label={isVideo ? 'Play video' : isAudio ? 'Play voice note' : 'Open photo'}
                        className={cx(ui.photoTile, s.tileOpen)}
                      >
                        {isVideo ? (
                          <video
                            key={m.signed_url ?? m.file_path ?? ""}
                            src={m.signed_url ?? m.file_path ?? ""}
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : isAudio ? (
                          <span className={s.audioFace}>
                            <IconTile Icon={Mic} tone={toneByKey('blue')} />
                            Voice note
                          </span>
                        ) : (
                          <CapsuleMediaImage src={m.signed_url ?? m.file_path ?? ""} />
                        )}

                        {isVideo && (
                          <span className={cx(ui.chip, ui.chipInk, ui.chipSm, s.playChip)} aria-hidden="true">
                            <Play size={11} strokeWidth={0} fill="currentColor" />
                            Video
                          </span>
                        )}
                      </button>

                      {/* Delete button */}
                      {!capsule.is_locked && (
                        <IconBtn
                          label={isVideo ? 'Delete this video' : isAudio ? 'Delete this voice note' : 'Delete this photo'}
                          size="sm"
                          onPhoto
                          onClick={() => handleDeleteMedia(m)}
                          className={s.tileDelete}
                        >
                          <Trash2 size={16} strokeWidth={2.4} aria-hidden="true" />
                        </IconBtn>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* -------- Letter and voice notes -------- */}
          <CapsuleMediaInteractionsPanel capsuleId={capsule.id} />
        </div>
      </div>

      {/* -------- Drawers -------- */}
      <CapsuleAI
        capsuleTitle={capsule.title}
        unlockDate={capsule.unlock_date}
        taggedPeopleNames={taggedPeople.map((p) => p.full_name)}
      />
      <UploadCapsuleMediaDrawer
        capsuleId={capsule.id}
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={async (newMedia: Media) => {
  const signed = newMedia.file_path
  ? await signCapsuleMedia(newMedia.file_path)
  : null;

  setMedia((prev) => [{ ...newMedia, signed_url: signed }, ...prev]);
}}
      />

      <UniversalPeopleTagger
       parentType="capsule"
       parentId={capsule.id}
       open={tagOpen}
       onClose={() => setTagOpen(false)}
       onSaved={async () => {
       const { data } = await supabase
      .from('capsule_tags')
      .select(`
        family_member_id,
        family_members (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('capsule_id', capsule.id);

    const mapped =
      data?.map((x: any) => x.family_members).filter(Boolean) || [];

    const withSigned = await Promise.all(
      mapped.map(async (p: any) => {
        if (!p.avatar_url) return { ...p, avatar_signed: null };

        const { data: signed } = await supabase.storage
          .from('user-media')
          .createSignedUrl(p.avatar_url, 60 * 60 * 24 * 7);

        return {
          ...p,
          avatar_signed: signed?.signedUrl || null,
        };
      })
    );

    setTaggedPeople(withSigned);
  }}
/>
<CapsuleSealOverlay
  open={sealOverlayOpen}
  capsuleTitle={capsule.title}
  unlockDate={capsule.unlock_date}
  onClose={() => setSealOverlayOpen(false)}
/>

<LibraryPickerModal
  open={libraryPickerOpen}
  onClose={() => setLibraryPickerOpen(false)}
  onPick={(item) => handlePickFromLibrary(item)}
/>

      {/* -------- Confirm Seal Modal -------- */}
      {confirmSeal && (
        <div className={cx(ui.scrim, s.fadeIn, 'scrim-blur z-[1000] flex items-center justify-center p-4')}>
          <div
            ref={confirmRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={confirmTitleId}
            aria-describedby={confirmTextId}
            className={cx(ui.sheet, s.confirm, s.popIn)}
          >
            <h2 id={confirmTitleId} className={s.confirmTitle}>
              Seal this Capsule?
            </h2>
            <p id={confirmTextId} className={s.confirmText}>
              Once sealed, you won’t be able to open or edit it until the unlock date.
            </p>
            <div className={s.confirmActions}>
              <Btn variant="soft" onClick={() => setConfirmSeal(false)}>
                Cancel
              </Btn>
              <Btn
                variant="danger"
                onClick={handleSealCapsule}
                disabled={sealing}
                icon={
                  sealing ? (
                    <Spinner size={16} />
                  ) : (
                    <Lock size={17} strokeWidth={2.4} aria-hidden="true" className={s.confirmIcon} />
                  )
                }
              >
                {sealing ? 'Sealing…' : 'Confirm & Seal'}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* -------- Full-screen viewer: a click on the backdrop closes it, as before -------- */}
      {viewerOpen && currentMedia && (
        <div
          ref={viewerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={viewerTitleId}
          className={cx(ui.viewer, s.viewer)}
          onClick={() => setViewerOpen(false)}
        >
          <h2 id={viewerTitleId} className={ui.srOnly}>
            {viewerIsVideo ? 'Video' : viewerIsAudio ? 'Voice note' : 'Photo'}
          </h2>

          <div className={ui.viewerBar}>
            <span className={cx(ui.chip, ui.chipSm)}>
              {(viewerIndex ?? 0) + 1} / {media.length}
            </span>
            <IconBtn
              label="Close"
              onPhoto
              onClick={(e) => {
                e.stopPropagation();
                setViewerOpen(false);
              }}
            >
              <X size={20} strokeWidth={2.4} aria-hidden="true" />
            </IconBtn>
          </div>

          <div className={cx(ui.viewerStage, s.viewerStage)}>
            {media.length > 1 && (
              <IconBtn
                label="Previous"
                onPhoto
                onClick={(e) => {
                  e.stopPropagation();
                  prevMedia();
                }}
                className={cx(s.viewerNav, s.viewerPrev)}
              >
                <ChevronLeft size={22} strokeWidth={2.4} aria-hidden="true" />
              </IconBtn>
            )}

            <div className={s.viewerMedia} onClick={(e) => e.stopPropagation()}>
              {viewerIsVideo ? (
                <video src={currentMedia.signed_url ?? ""} controls autoPlay />
              ) : viewerIsAudio ? (
                <div className={s.viewerAudio}>
                  <div className={s.viewerAudioHead} aria-hidden="true">
                    <IconTile Icon={Mic} tone={toneByKey('blue')} />
                    <span className={s.viewerAudioTitle}>Voice note</span>
                  </div>
                  <audio src={currentMedia.signed_url ?? ""} controls autoPlay />
                </div>
              ) : (
                // Full size at its own shape, so a plain img (next/image needs a sized box).
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentMedia.signed_url ?? ""} alt="" />
              )}
            </div>

            {media.length > 1 && (
              <IconBtn
                label="Next"
                onPhoto
                onClick={(e) => {
                  e.stopPropagation();
                  nextMedia();
                }}
                className={cx(s.viewerNav, s.viewerNext)}
              >
                <ChevronRight size={22} strokeWidth={2.4} aria-hidden="true" />
              </IconBtn>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
