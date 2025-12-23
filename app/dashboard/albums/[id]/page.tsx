'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import UploadMemoryDrawer from '../_components/UploadMemoryDrawer';
import UniversalPeopleTagger from "@/components/UniversalPeopleTagger";
import DeleteMemoryModal from '../_components/DeleteMemoryModal';
import MediaInteractionsPanel from '../_components/media-interactions/MediaInteractionsPanel';


type Album = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
};

type Media = {
  id: string;
  album_id: string;
  user_id?: string | null;
  file_path: string;
  file_type: string;
  created_at: string;
};

export default function AlbumDetailPage() {
  const supabase = getBrowserClient();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const albumId = (params?.id as string) || '';

  const [user, setUser] = useState<{ id: string } | null>(null);
  const [album, setAlbum] = useState<Album | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);

  const [uploadOpen, setUploadOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    file_path: string;
  } | null>(null);

  const [tagOpen, setTagOpen] = useState(false);
  const [taggedPeople, setTaggedPeople] = useState<
    { id: string; full_name: string; avatar_url?: string | null; avatar_signed?: string | null }[]
  >([]);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const u = sess?.session?.user ?? null;
      setUser(u ? { id: u.id } : null);
    })();
  }, [supabase]);

  // ✅ Fetch album + media
  useEffect(() => {
    if (!albumId) return;
    (async () => {
      try {
        setLoading(true);

        const { data: albumData, error: albumErr } = await supabase
          .from('albums')
          .select('id,title,description,created_at')
          .eq('id', albumId)
          .single();

        if (albumErr) throw albumErr;

        const { data: mediaDataRaw, error: mediaErr } = await supabase
          .from('album_media')
          .select('id,album_id,user_id,file_path,file_type,created_at')
          .eq('album_id', albumId)
          .order('created_at', { ascending: false });

        if (mediaErr) throw mediaErr;

        const mediaWithSigned = await Promise.all(
          (mediaDataRaw ?? []).map(async (m) => {
            const objectPath = m.file_path.includes('album-media/')
              ? m.file_path.split('album-media/')[1]
              : m.file_path;

            const { data: signed } = await supabase.storage
              .from('album-media')
              .createSignedUrl(objectPath, 60 * 60 * 24 * 7);

            return {
              ...m,
              signed_url: signed?.signedUrl || null
            };
          })
        );

        setAlbum(albumData);
        setMedia(mediaWithSigned);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load album.');
      } finally {
        setLoading(false);
      }
    })();
  }, [albumId, supabase]);

// ✅ Fetch tagged people (WITH SIGNED AVATARS)
useEffect(() => {
  if (!albumId) return;

  (async () => {
    const { data } = await supabase
      .from("album_tags")
      .select("family_member_id, family_members(id, full_name, avatar_url)")
      .eq("album_id", albumId);

    const mapped =
      data?.map((x: any) => x.family_members).filter(Boolean) || [];

    const withSigned = await Promise.all(
      mapped.map(async (p: any) => {
        if (!p.avatar_url) return { ...p, avatar_signed: null };

        const { data: signed } = await supabase.storage
          .from("user-media")
          .createSignedUrl(p.avatar_url, 60 * 60 * 24 * 7);

        return {
          ...p,
          avatar_signed: signed?.signedUrl || null,
        };
      })
    );

    setTaggedPeople(withSigned);
  })();
}, [albumId, supabase]);

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading album…</div>;
  }

  if (!album) {
    return (
      <div className="p-10 text-center text-gray-500">
        Album not found.
        <div className="mt-4">
          <button
            onClick={() => router.push('/dashboard/albums')}
            className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50"
          >
            ← Back to Albums
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      
      {/* ✅ LEFT SIDE */}
      <div className="flex-1 p-8">

        <button
          onClick={() => router.push('/dashboard/albums')}
          className="mb-6 text-sm font-medium text-[#000000] hover:text-[#C8A557] transition"
        >
          ← Back to Albums
        </button>

        <div className="flex flex-row items-start justify-between gap-6 w-full mb-8 border-b border-[#E6C26E]/55 pb-6">
          
          <div>
            <h1 className="text-5xl font-bold mb-6"
            style={{
              color: "#D4AF37",
              fontStyle: "italic",
              }}
            
            >{album.title}
            </h1>

            {album.description && (
              <p className="text-gray-600 mt-3 max-w-2xl">{album.description}</p>
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
      </div>
    ))}
  </div>
)}

          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setUploadOpen(true)}
              className="inline-flex items-center gap-2 px-5 h-[42px] rounded-full bg-emerald-50 border border-emerald-200 shadow-sm text-sm text-emerald-700 hover:bg-emerald-100 transition"
            >
              + Upload Memory
            </button>

            <button
              onClick={() => setTagOpen(true)}
              className="inline-flex items-center gap-2 px-5 h-[42px] rounded-full bg-violet-50 border border-violet-200 shadow-sm text-sm text-violet-700 hover:bg-violet-100 transition"
            >
              💜 Tag someone you love
            </button>
          </div>

        </div>

        {media.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 italic">
            No memories yet. Add your first photo or video.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {media.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMedia(m)}
                className={`break-inside-avoid relative group rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer ${
                  selectedMedia?.id === m.id ? 'ring-4 ring-[#E6C26E]' : ''
                }`}
              >

                {m.file_type === 'video' ? (
                  <video src={(m as any).signed_url || m.file_path} controls className="w-full rounded-lg" />
                ) : (
                  <img
                    src={(m as any).signed_url || m.file_path}
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ RIGHT SIDE PANEL */}
      <MediaInteractionsPanel
        selectedMedia={selectedMedia}
        albumId={album.id}
        user={user}
        onDelete={(media) => {
          setDeleteTarget({
            id: media.id,
             file_path: media.file_path,
              });
               setDeleteOpen(true);
                }}
      />

      {/* ✅ DRAWERS */}
      <UploadMemoryDrawer
        albumId={album.id}
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={(newMedia: Media) => {
          setMedia((prev) => [newMedia, ...prev]);
        }}
      />

      {deleteTarget && (
        <DeleteMemoryModal
          open={deleteOpen}
          mediaId={deleteTarget.id}
          filePath={deleteTarget.file_path}
          onClose={() => setDeleteOpen(false)}
          onDeleted={() => {
            setMedia((prev) => prev.filter((item) => item.id !== deleteTarget.id));
            setSelectedMedia(null);
            setDeleteTarget(null);
          }}
        />
      )}

      <UniversalPeopleTagger
        parentType="album"
        parentId={album.id}
        open={tagOpen}
        onClose={() => setTagOpen(false)}
        onSaved={async () => {
  const { data } = await supabase
    .from("album_tags")
    .select("family_member_id, family_members(id, full_name, avatar_url)")
    .eq("album_id", album.id);

  const mapped =
    data?.map((x: any) => x.family_members).filter(Boolean) || [];

  const withSigned = await Promise.all(
    mapped.map(async (p: any) => {
      if (!p.avatar_url) return { ...p, avatar_signed: null };

      const { data: signed } = await supabase.storage
        .from("user-media")
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
    </div>
  );
}
