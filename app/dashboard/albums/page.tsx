'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getBrowserClient } from '@/lib/supabase/browser';
import CreateAlbumDrawer from './_components/CreateAlbumDrawer';
import { safeToast as toast } from '@/lib/safeToast';
import { motion } from 'framer-motion';
import LegacyCelebration from "@/components/LegacyCelebration";
import { ContextMenuDots } from "@/components/ContextMenuDots";
import { usePlanLimits } from '@/lib/usePlanLimits';


const Particles = dynamic(() => import('@/components/ParticlesPlatform'), { ssr: false });

type Album = {
  id: string;
  title: string;
  description: string | null;
  visibility: string;
  created_at: string;
  cover_image: string | null;
};

export default function AlbumsPage() {
  const supabase = getBrowserClient();
  const [albums, setAlbums] = useState<Album[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoaded = useRef(false);
  const [celebrate, setCelebrate] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { loading: limitsLoading, canCreate, limits, counts } = usePlanLimits();

  const TYPING_KEY = "albums_typing_last_run";
  const TYPING_RESET_MS = 24 * 60 * 60 * 1000; // 24 hours


  // Typed quote animation (same as Timeline/Capsules)
  const line1 = '“Preserve your favorite moments — organized, visual, timeless.”';
  const line2 = 'Create albums to group photos, videos, and voice notes.';
  const [typed1, setTyped1] = useState('');
  const [typed2, setTyped2] = useState('');
  const [isTyping1Done, setIsTyping1Done] = useState(false);

 useEffect(() => {
  const lastRun = localStorage.getItem(TYPING_KEY);
  const now = Date.now();

  if (lastRun && now - Number(lastRun) < TYPING_RESET_MS) {
    setTyped1(line1);
    setTyped2(line2);
    setIsTyping1Done(true);
    return;
  }

  localStorage.setItem(TYPING_KEY, String(now));

  let i1 = 0,
    i2 = 0,
    t1: any,
    t2: any;

  const speed = 45;

  t1 = setInterval(() => {
    i1++;
    setTyped1(line1.slice(0, i1));
    if (i1 >= line1.length) {
      clearInterval(t1);
      setIsTyping1Done(true);

      const start2 = setTimeout(() => {
        t2 = setInterval(() => {
          i2++;
          setTyped2(line2.slice(0, i2));
          if (i2 >= line2.length) clearInterval(t2);
        }, speed);
      }, 600);
    }
  }, speed);

  return () => {
    clearInterval(t1);
    clearInterval(t2);
  };
}, []);


  // Signed URL helper
  const getSignedCoverUrl = async (url: string | null): Promise<string | null> => {
    if (!url) return null;
    try {
      const match = url.match(/album-media\/(.+)$/);
      const path = match ? match[1] : url;
      const { data: signed } = await supabase.storage
        .from('album-media')
        .createSignedUrl(path, 60 * 60 * 24 * 7);
      return signed?.signedUrl ?? url;
    } catch {
      return url;
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load albums
  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    (async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        const user = sess?.session?.user;
        if (!user) {
          setError('You need to sign in to view your albums.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('albums')
          .select('id, title, description, visibility, created_at, cover_image')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const signedAlbums = await Promise.all(
          (data || []).map(async (a: Album) => ({
            ...a,
            cover_image: await getSignedCoverUrl(a.cover_image),
          }))
        );

        setAlbums(signedAlbums);
      } catch (e: any) {
        setError(e?.message || String(e));
        toast.error('Failed to load albums.');
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  const handleDeleteAlbum = async (id: string) => {
    try {
      await supabase.from('albums').delete().eq('id', id);
      setAlbums((prev) => (prev ? prev.filter((a) => a.id !== id) : prev));
      toast.success('Album deleted.');
    } catch {
      toast.error('Failed to delete album.');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-[Inter] bg-gradient-to-b from-white via-[#fefaf3] to-[#faf7ed]">
      <Particles />

      <div className="relative z-10 px-6 sm:px-8 pt-16 pb-24 max-w-7xl mx-auto">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 mb-12">
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-[#222B3A] mb-4 relative inline-block">
              <span className="relative">
                My
                <motion.span
                  className="absolute left-0 -bottom-2 h-[3px] bg-[#C8A557] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: 70 }}
                  transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
                />
              </span>{' '}
              <span className="text-[#C8A557]">Albums</span>
            </h1>

            <p className="text-[#5B6473] mt-3 text-lg italic min-h-[30px]">{typed1}</p>
            <p
              className={`text-[#7A8596] text-sm mt-2 transition-opacity duration-500 ${
                isTyping1Done ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {typed2}
            </p>
          </div>

          <div className="flex justify-center md:justify-end flex-1">
            <button
              className="px-8 py-4 rounded-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837] font-semibold text-lg shadow-md hover:shadow-lg transition-transform hover:scale-[1.03] relative overflow-hidden"
              onClick={() => {
               if (limitsLoading) return;
               if (!canCreate.album) {
               toast.error(
                `Album limit reached (${counts?.albums} / ${limits?.max_albums})` );
                return;
                }
  setDrawerMode('create');
  setSelectedAlbum(null);
  setDrawerOpen(true);
}}

            >
              <span className="relative z-10">+ Create New Album</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shine_3s_linear_infinite]" />
            </button>
          </div>
        </div>

        {/* states */}
        {loading && <p className="text-[#778199] italic text-center mb-4">Loading your albums...</p>}
        {!loading && error && <p className="text-[#C33838] text-center mb-4">{error}</p>}
        {!loading && !error && (albums ?? []).length === 0 && (
          <div className="text-center text-[#0f2040] italic mt-12">
            No albums yet. Start organizing your memories ✨
          </div>
        )}

        {/* cards */}
        {!loading && !error && (albums ?? []).length > 0 && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 transition-opacity duration-500"
            key="albums"
          >
            {(albums ?? []).map((a) => (
              <div
                key={a.id}
                className="rounded-3xl border border-[#B7932F]/60 shadow-md hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden bg-white/95 relative"
              >
                <div className="aspect-[16/9] bg-gradient-to-b from-[#F3F4F6] to-[#EAECEF] overflow-hidden">
                  {a.cover_image ? (
                    <img
                      src={a.cover_image}
                      alt={a.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#9AA3AF] text-sm">
                      No cover image
                    </div>
                  )}
                </div>

                <div className="absolute top-3 right-3 z-20">
                  <ContextMenuDots
                  editLabel="Edit Album"
                  onEdit={() => {
                    setDrawerMode("edit");
                    setSelectedAlbum(a);
                     setDrawerOpen(true);
                     }}
                  onDelete={() =>
                    setConfirmDelete({ id: a.id, title: a.title || "Untitled Album" })
                    }
                    />
                  </div>
                  
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#222B3A] mb-2 line-clamp-1">
                    {a.title || 'Untitled Album'}
                  </h3>
                  <p className="text-[#5B6473] text-sm mb-4 line-clamp-2">
                    {a.description || 'A collection of your memories.'}
                  </p>
                  <p className="text-xs text-[#7A8596] mb-4">
                    Created {new Date(a.created_at).toLocaleDateString()}
                  </p>

                  <Link
                    href={`/dashboard/albums/${a.id}`}
                    className="block text-center font-semibold px-4 py-3 rounded-full text-[#1F2837] bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] shadow hover:shadow-md transition-transform duration-200 hover:scale-[1.02]"
                  >
                    View Album →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm text-center">
            <h3 className="text-lg font-semibold text-[#1F2837] mb-3">
              Delete “{confirmDelete.title}”?
            </h3>
            <p className="text-sm text-[#5B6473] mb-6">
              This action cannot be undone. All media inside this album will be lost.
            </p>
            <div className="flex justify-center gap-3">
              <button
                className="px-5 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 rounded-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837] font-medium shadow hover:shadow-md transition"
                onClick={() => {
                  handleDeleteAlbum(confirmDelete.id);
                  setConfirmDelete(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* drawer */}
      <CreateAlbumDrawer
        open={drawerOpen}
        mode={drawerMode}
        album={selectedAlbum}
        onClose={() => setDrawerOpen(false)}
        onCreated={async (album) => {
          const signed = await getSignedCoverUrl(album.cover_image);
           setDrawerOpen(false);

          setTimeout(() => {
          setAlbums((prev) => [{ ...album, cover_image: signed }, ...(prev ?? [])]); }, 120);
            // ✅ Trigger legacy celebration (NOT a toast moment)
           setTimeout(() => {
            setCelebrate(true);  }, 220);
}}
        onUpdated={async (album) => {
          const signed = await getSignedCoverUrl(album.cover_image);
          setAlbums((prev) =>
            prev
              ? prev.map((x) => (x.id === album.id ? { ...x, ...album, cover_image: signed } : x))
              : prev
          );
        }}
      />

      <LegacyCelebration
  open={celebrate}
  onClose={() => setCelebrate(false)}
  emoji="🎉"
  message="A new chapter of memories begins."
/>
      <style jsx global>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
