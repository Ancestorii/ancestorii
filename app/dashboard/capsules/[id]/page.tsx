'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import Image from "next/image";
import {
  Lock, BookOpen
} from 'lucide-react';
import UploadCapsuleMediaDrawer from '../_components/UploadCapsuleMediaDrawer';
import CapsuleMediaInteractionsPanel from '../_components/media-interactions/CapsuleMediaInteractionsPanel';
import UniversalPeopleTagger from '@/components/UniversalPeopleTagger';
import CapsuleSealOverlay from '@/components/CapsuleSealOverlay';
import LibraryPickerModal, { LibraryPickerItem } from '@/components/LibraryPickerModal';


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

function CapsuleMediaImage({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className="relative w-full">
      <Image
        src={src}
        alt=""
        width={1600}
        height={1200}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        quality={75}
        className={`w-full h-auto object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoadingComplete={() => setLoaded(true)}
      />
    </div>
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
    return <div className="p-10 text-center text-gray-500">Loading capsule…</div>;
  }

  if (!capsule) {
    return (
      <div className="p-10 text-center text-gray-500">
        Capsule not found.
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

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* -------- Left: Header + Media Grid -------- */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8 border-b border-[#E6C26E]/55 pb-6 gap-8">
          <div className="space-y-2 max-w-2xl">
             <button
             onClick={() => router.push('/dashboard/capsules')}
             className="mb-6 text-sm font-medium text-[#000000] hover:text-[#C8A557] transition"
              >
                 ← Back to Capsules
              </button>
              
            <h1 className="text-5xl font-bold mb-6"
              style={{
              color: "#1F2837",
              letterSpacing: "-0.01em",
              }}
              >
              {capsule.title}
              </h1>


            {capsule.description && (
              <p className="text-gray-600 max-w-2xl">{capsule.description}</p>
            )}

            {/* TAGGED PEOPLE — MATCH TIMELINES */}
{taggedPeople.length > 0 && (
  <div className="mt-8 flex flex-wrap items-center gap-3">
    {taggedPeople.map((p) => (
      <div
        key={p.id}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full
                   bg-[#F6F3EA] border border-[#E6C26E]/40"
      >
        {p.avatar_signed ? (
          <img
            src={p.avatar_signed}
            alt={p.full_name}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-7 h-7 rounded-full bg-[#E6C26E]
                       text-[#1F2837] text-xs font-semibold
                       flex items-center justify-center"
          >
            {p.full_name?.[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-sm text-[#1F2837] font-medium">
          {p.full_name}
        </span>
<span
  onClick={() => removePersonFromCapsule(p.id)}
  className="ml-1 cursor-pointer text-gray-400 hover:text-red-600 transition"
  title="Remove from this capsule"
>
  ✕
</span>

      </div>
    ))}
  </div>
)}
</div>

         {/* Actions */}
<div className="grid grid-cols-2 gap-4 w-full max-w-[440px]">

  <button
    onClick={() => setUploadOpen(true)}
    className="
    flex items-center justify-center gap-2
    px-5 h-[44px]
    rounded-full
    bg-emerald-50 border border-emerald-200
    text-[15px] font-semibold text-emerald-700
    hover:bg-emerald-100
    transition
    "
  >
    + Upload Memory
  </button>


  <button
    onClick={() => setLibraryPickerOpen(true)}
    className="
    flex items-center justify-center gap-2
    px-5 h-[44px]
    rounded-full
    bg-amber-50 border border-amber-200
    text-[15px] font-semibold text-amber-800
    hover:bg-amber-100
    transition
    "
  >
    <BookOpen className="w-5 h-5" />
    My Library
  </button>


  <button
    onClick={() => setTagOpen(true)}
    className="
    flex items-center justify-center gap-2
    px-5 h-[44px]
    rounded-full
    bg-violet-50 border border-violet-200
    text-[15px] font-semibold text-violet-700
    hover:bg-violet-100
    transition
    "
  >
    💜 Tag Someone
  </button>


  {!capsule.is_locked && (
    <button
      onClick={() => setConfirmSeal(true)}
      className="
      flex items-center justify-center gap-2
      px-5 h-[44px]
      rounded-full
      bg-blue-50 border border-blue-200
      text-[15px] font-semibold text-blue-800
      hover:bg-blue-100
      transition
      "
    >
      <Lock className="w-5 h-5" />
      Seal Capsule
    </button>
  )}

</div>
        </div>

        {/* Media Grid */}
        {media.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 italic">
            No memories yet. Add your first photo or video. 
          </div>
        ) : (
         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {media.map((m, i) => {
               const realType = (m.file_type ?? m.library_media?.file_type) || "";

                return (
                <div key={m.id} className="relative group overflow-hidden rounded-xl">

                        {/* Delete button */}
                        {!capsule.is_locked && (
                        <button
                        onClick={() => handleDeleteMedia(m)}
                        className="
                          absolute top-2 right-2 z-10
                          opacity-0 group-hover:opacity-100
                            transition
                           bg-white/90 backdrop-blur
                         border border-red-200
                           text-red-600
            text-xs font-semibold
            px-3 py-1 rounded-full
            hover:bg-red-50
          "
        >
          Delete
        </button>
      )}

{realType === "video" ? (
  <div className="overflow-hidden">
  <div className="transition-transform duration-300 group-hover:scale-105">
    <video
  key={m.signed_url ?? m.file_path ?? ""}
  src={m.signed_url ?? m.file_path ?? ""}
  controls
  playsInline
  preload="metadata"
  onClick={() => openViewer(i)}
  className="w-full rounded-lg cursor-pointer"
/>
  </div>
</div>
) : (
  <div className="overflow-hidden">
  <div className="transition-transform duration-300 group-hover:scale-105">
    <div
  onClick={() => openViewer(i)}
  className="cursor-pointer"
>
  <CapsuleMediaImage src={m.signed_url ?? m.file_path ?? ""} />
</div>
  </div>
</div>
)}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* -------- Right: Media Interactions -------- */}
      <CapsuleMediaInteractionsPanel capsuleId={capsule.id} />
      {/* -------- Drawers -------- */}
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm text-center shadow-xl">
            <h3 className="text-lg font-semibold text-[#1F2837] mb-3">
              Seal this Capsule?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Once sealed, you won’t be able to open or edit it until the unlock date.
            </p>
            <div className="flex justify-center gap-3">
              <button
                className="px-5 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                onClick={() => setConfirmSeal(false)}
              >
                Cancel
              </button>
              <button
                onClick={handleSealCapsule}
                disabled={sealing}
                className={`px-5 py-2 rounded-full font-semibold text-white ${
                  sealing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#C33838] hover:bg-[#A12C2C]'
                }`}
              >
                {sealing ? 'Sealing…' : 'Confirm & Seal'}
              </button>
            </div>
          </div>
        </div>
      )}
      {viewerOpen && currentMedia && (
  <div
    className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100]"
    onClick={() => setViewerOpen(false)}
  >
    <button
  onClick={(e) => {
    e.stopPropagation();
    prevMedia();
  }}
  className="absolute left-6 top-1/2 -translate-y-1/2
             text-6xl font-bold
             text-[#D4AF37]
             hover:scale-110
             transition cursor-pointer select-none"
>
  ‹
</button>

    <div
      className="relative max-w-[90vw] max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}
    >
      {(currentMedia.file_type === "video" ||
        currentMedia.library_media?.file_type === "video") ? (
        <video
          src={currentMedia.signed_url ?? ""}
          controls
          autoPlay
          className="max-w-full max-h-[95vh] rounded-lg"
        />
      ) : (
        <img
          src={currentMedia.signed_url ?? ""}
          className="max-w-full max-h-[95vh] object-contain rounded-lg"
        />
      )}
    </div>

    <button
  onClick={(e) => {
    e.stopPropagation();
    nextMedia();
  }}
  className="absolute right-6 top-1/2 -translate-y-1/2
             text-6xl font-bold
             text-[#D4AF37]
             hover:scale-110
             transition cursor-pointer select-none"
>
  ›
</button>
  </div>
)}
    </div>
  );
}
