'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import Link from 'next/link';
import { safeToast as toast } from '@/lib/safeToast';
import { ContextMenuDots } from '@/components/ContextMenuDots';
import CreateTimelineDrawer from './_components/CreateTimelineDrawer';
import { motion } from 'framer-motion';
import LegacyCelebration from '@/components/LegacyCelebration';
import { usePlanLimits } from '@/lib/usePlanLimits';


const Particles = dynamic(
  () => import('@/components/ParticlesPlatform'),
  { ssr: false }
);

type Timeline = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at?: string;
  cover_path: string | null;
  cover_signed?: string | null;
};


export default function TimelinePage() {
  const supabase = getBrowserClient();
  const [timelines, setTimelines] = useState<Timeline[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoaded = useRef(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedTimeline, setSelectedTimeline] = useState<Timeline | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const { loading: limitsLoading, canCreate, limits, counts } = usePlanLimits();

  const TYPING_KEY = "timelines_typing_last_run";
  const TYPING_RESET_MS = 24 * 60 * 60 * 1000; // 24 hours

  // typing effect (slowed)
  const line1 = '“Every story deserves to be remembered.”';
  const line2 = 'Your legacy lives through your timeline.';
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

  // signed url helper
  const getSignedCoverUrl = async (path: string | null): Promise<string | null> => {
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from('timeline-media')
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  if (error) return null;
  return data.signedUrl;
};

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    (async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        if (!sess?.session?.user) {
          setError('You need to sign in to view your timelines.');
          setLoading(false);
          return;
        }
         const { data, error } = await supabase
         .from('timelines')
         .select('id, title, description, created_at, cover_path')
         .order('created_at', { ascending: false });

         if (error) throw error;

         const signed = await Promise.all(
  (data ?? []).map(async (t) => ({
    ...t,
    cover_signed: t.cover_path
      ? await getSignedCoverUrl(t.cover_path)
      : null,
  }))
);
setTimelines(signed);



      } catch (e: any) {
        setError(e?.message || String(e));
        toast.error('Failed to load timelines.');
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  const handleDeleteTimeline = async (id: string) => {
    try {
      const { error: delErr } = await supabase.from('timelines').delete().eq('id', id);
      if (delErr) throw delErr;
      setTimelines((prev) => (prev ? prev.filter((t) => t.id !== id) : prev));
      toast.success('Timeline deleted.');
    } catch { toast.error('Failed to delete timeline.'); }
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
                {/* underline recreated using Framer Motion */}
                <motion.span
                  className="absolute left-0 -bottom-2 h-[3px] bg-[#C8A557] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: 70 }}
                  transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
                />
              </span>{' '}
              <span className="text-[#C8A557]">Timelines</span>
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
  if (!canCreate.timeline) {
    toast.error(
      `Timeline limit reached (${counts?.timelines} / ${limits?.max_timelines})`
    );
    return;
  }
  setDrawerMode('create');
  setSelectedTimeline(null);
  setDrawerOpen(true);
}}

            >
              <span className="relative z-10">+ Create New Timeline</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shine_3s_linear_infinite]" />
            </button>
          </div>
        </div>

        {/* states */}
        {loading && <p className="text-[#778199] italic text-center mb-4">Loading your timelines...</p>}
        {!loading && error && <p className="text-[#C33838] text-center mb-4">{error}</p>}
        {!loading && !error && (timelines ?? []).length === 0 && (
          <div className="text-center text-[#0f2040] italic mt-12">
            No timelines yet. Start creating your legacy ✨
          </div>
        )}

        {/* cards */}
        {!loading && !error && (timelines ?? []).length > 0 && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 transition-opacity duration-500"
            key="timelines"
          >
            {(timelines ?? []).map((t) => (
              <div
                key={t.id}
                className="rounded-3xl border border-[#B7932F]/60 shadow-md hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden bg-white/95 relative"
              >
               <div className="relative aspect-[16/9] bg-gradient-to-b from-[#F3F4F6] to-[#EAECEF] overflow-hidden">
                  {t.cover_signed ? (
                    <img
                      src={t.cover_signed}
                      alt={t.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#9AA3AF] text-sm">
                      No cover image
                    </div>
                  )}
                </div>
                <div className="absolute top-3 right-3 z-30">
                    <ContextMenuDots
                      editLabel="Edit Timeline"
                      onEdit={() => {
                       setDrawerMode('edit');
                       setSelectedTimeline(t);
                       setDrawerOpen(true);
                       }}
                        onDelete={() =>
                           setConfirmDelete({
                            id: t.id,
                           title: t.title || 'Untitled Timeline',
                           })
                           }
                            />
                    </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#222B3A] mb-2 line-clamp-1">{t.title}</h3>
                  <p className="text-[#5B6473] text-sm mb-4 line-clamp-2">{t.description || 'Your personal life timeline'}</p>
                  <p className="text-xs text-[#7A8596] mb-4">
                    Created {new Date(t.created_at).toLocaleDateString()}
                  </p>

                  <Link
                    href={`/dashboard/timeline/${t.id}`}
                    className="block text-center font-semibold px-4 py-3 rounded-full text-[#1F2837] bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] shadow hover:shadow-md transition-transform duration-200 hover:scale-[1.02]"
                  >
                    View Timeline →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      <CreateTimelineDrawer
        open={drawerOpen}
        mode={drawerMode}
        timeline={selectedTimeline}
        onClose={() => setDrawerOpen(false)}
        onCreated={async (tl: Timeline) => {
          const signed = await getSignedCoverUrl(tl.cover_path);
          setTimelines((prev) => {
          const safe = prev ?? [];
          const newItem: Timeline = {
           id: tl.id,
           title: tl.title,
           description: tl.description ?? null,
           created_at: tl.created_at ?? new Date().toISOString(),
           cover_path: tl.cover_path ?? null,
           cover_signed: signed,
           };
           return [newItem, ...safe];
           });
            // 🎉 Timeline celebration (same pattern as Albums)
            setTimeout(() => {
            setCelebrate(true);
           }, 220);
          }}

        onUpdated={async (tl: Timeline) => {
          const signed = await getSignedCoverUrl(tl.cover_path);
          setTimelines((prev) =>
          prev
           ? prev.map((x) =>
            x.id === tl.id
            ? {
              ...x,
              title: tl.title,
              description: tl.description ?? null,
              cover_path: tl.cover_path ?? null,
              cover_signed: signed,
            }
          : x
      )
    : prev
);

        }}
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
      {confirmDelete && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
      <h2 className="text-xl font-semibold text-[#1F2837] mb-4">
        Delete “{confirmDelete.title}”?
      </h2>

      <p className="text-[#5B6473] text-sm mb-8">
        This action cannot be undone. All events and media inside this timeline will be permanently deleted.

      </p>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setConfirmDelete(null)}
          className="px-6 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            handleDeleteTimeline(confirmDelete.id);
            setConfirmDelete(null);
          }}
          className="px-6 py-2 rounded-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837] font-semibold shadow hover:shadow-md transition"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
<LegacyCelebration
  open={celebrate}
  onClose={() => setCelebrate(false)}
  emoji="✨"
  message="A new timeline begins."
/>

    </div>
  );
}
