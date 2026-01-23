'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import CreateCapsuleDrawer from './_components/CreateCapsuleDrawer';
import { motion } from 'framer-motion';
import CapsuleCreatedOverlay from '@/components/CapsuleCreatedOverlay';
import CapsuleCard from './_components/CapsuleCard';
import CapsuleUnlock from '@/components/CapsuleUnlock';
import { usePlanLimits } from '@/lib/usePlanLimits';

const Particles = dynamic(
  () => import('@/components/ParticlesPlatform'),
  { ssr: false }
);

type Capsule = {
  id: string;
  title: string;
  description: string | null;
  unlock_date: string;
  is_locked: boolean;
  created_at: string;
  cover_image: string | null;
};

export default function CapsulesPage() {
  const supabase = getBrowserClient();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoaded = useRef(false);
  const hasCheckedUnlock = useRef(false);

  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);

  const { loading: limitsLoading, canCreate, limits, counts } = usePlanLimits();

  const TYPING_KEY = "capsules_typing_last_run";
  const TYPING_RESET_MS = 24 * 60 * 60 * 1000; // 24 hours


  // typing effect (matches Timeline)
  const line1 = '“Preserve your thoughts, emotions, and memories — sealed for the future.”';
  const line2 = 'Your legacy sealed for tomorrow.';
  const [typed1, setTyped1] = useState('');
  const [typed2, setTyped2] = useState('');
  const [isTyping1Done, setIsTyping1Done] = useState(false);

  // 🔵 Capsule CREATED overlay
const [createdOpen, setCreatedOpen] = useState(false);

// 🔓 Capsule unlock animation
const [unlockOpen, setUnlockOpen] = useState(false);
const [unlockNotificationId, setUnlockNotificationId] = useState<string | null>(null);


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

  // signed url helper (tries 'capsule-media', falls back gracefully)
  const getSignedCoverUrl = async (url: string | null): Promise<string | null> => {
    if (!url) return null;
    try {
      // If the stored value looks like 'capsule-media/xyz.jpg', extract the path.
      const match = url.match(/capsule-media\/(.+)$/);
      const path = match ? match[1] : url;
      const { data: signed, error: signErr } = await supabase.storage
        .from('capsule-media')
        .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days
      if (signErr) return url;
      return signed?.signedUrl ?? url;
    } catch {
      return url;
    }
  };



  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    (async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        if (!sess?.session?.user) {
          setError('You need to sign in to view your capsules.');
          setLoading(false);
          return;
        }

        const { data, error: qErr } = await supabase
          .from('memory_capsules')
          .select('id, title, description, unlock_date, is_locked, created_at, cover_image')
          .eq('user_id', sess.session.user.id)
          .order('created_at', { ascending: false });

        if (qErr) throw qErr;

        const signed = await Promise.all(
          (data as Capsule[]).map(async (c) => ({
            ...c,
            cover_image: await getSignedCoverUrl(c.cover_image),
          }))
        );

        setCapsules(signed ?? []);
      } catch (e: any) {
        setError(e?.message || String(e));
        toast.error('Failed to load capsules.');
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

useEffect(() => {
  if (loading) return;
  if (hasCheckedUnlock.current) return;

  hasCheckedUnlock.current = true;

  (async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // 1️⃣ Find unseen unlock notification
    const { data: notif } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'update')
      .eq('seen', false)
      .ilike('title', '%Capsule Unlocked%')
      .limit(1)
      .maybeSingle();

    if (!notif) return;

    // 2️⃣ Confirm there is ACTUALLY an unlocked capsule
    const { data: unlockedCapsule } = await supabase
      .from('memory_capsules')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_locked', false)
      .lte('unlock_date', new Date().toISOString())
      .limit(1)
      .maybeSingle();

    // ❌ No real unlock → ignore notification
    if (!unlockedCapsule) return;

    // ✅ Legit unlock → play animation
    setUnlockNotificationId(notif.id);
    setUnlockOpen(true);
  })();
}, [loading, supabase]);


  const handleDeleteCapsule = async (id: string) => {
    try {
      const { error: delErr } = await supabase
      .from('memory_capsules')
      .delete()
      .eq('id', id)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (delErr) throw delErr;
      setCapsules((prev) => (prev ? prev.filter((t) => t.id !== id) : prev));
      toast.success('Capsule deleted.');
    } catch {
      toast.error('Failed to delete capsule.');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-[Inter] bg-gradient-to-b from-white via-[#fefaf3] to-[#faf7ed]">
      <Particles />

      <div className="relative z-10 px-6 sm:px-8 pt-16 pb-24 max-w-7xl mx-auto">
        {/* header (matches Timeline) */}
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
              <span className="text-[#C8A557]">Capsules</span>
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
  if (!canCreate.capsule) {
    toast.error(
      `You’ve reached your current plan limit for capsules (${counts?.capsules} / ${limits?.max_capsules}). Upgrade your plan to create more.`
    );
    return;
  }
  setDrawerMode('create');
  setSelectedCapsule(null);
  setDrawerOpen(true);
}}

            >
              <span className="relative z-10">+ Create New Capsule</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shine_3s_linear_infinite]" />
            </button>
          </div>
        </div>

        {/* states */}
        {loading && <p className="text-[#778199] italic text-center mb-4">Loading your capsules...</p>}
        {!loading && error && <p className="text-[#C33838] text-center mb-4">{error}</p>}
        {!loading && !error && (capsules ?? []).length === 0 && (
          <div className="text-center text-[#0f2040] italic mt-12">
            Nothing sealed for the future yet. Create your first capsule ✨
          </div>
        )}

 {/* cards */}
{!loading && !error && (capsules ?? []).length > 0 && (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 transition-opacity duration-500">
    {capsules.map((c) => (
      <CapsuleCard
        key={c.id}
        capsule={c}
        onEdit={() => {
          if (c.is_locked) {
            toast.error('This capsule is locked.');
            return;
            }
          setDrawerMode('edit');
          setSelectedCapsule(c);
          setDrawerOpen(true);
        }}
        onDelete={() =>
          setConfirmDelete({
            id: c.id,
            title: c.title || 'Untitled Capsule',
          })
        }
      />
    ))}
  </div>
  )}
  </div>  {/* 🔴 THIS WAS MISSING */}

{/* Drawer */}
<CreateCapsuleDrawer
  open={drawerOpen}
  mode={drawerMode}
  capsule={selectedCapsule}
  onClose={() => {
    setDrawerOpen(false);
    setSelectedCapsule(null);
    setDrawerMode('create');
    }}

  onCreated={async (cap) => {
    const signed = await getSignedCoverUrl(cap.cover_image);
    setCapsules((prev) => {
      const safe = prev ?? [];
      const newItem: Capsule = {
        id: cap.id,
        title: cap.title,
        description: cap.description ?? null,
        unlock_date: cap.unlock_date,
        is_locked: cap.is_locked,
        created_at: cap.created_at,
        cover_image: signed,
      };
      return [newItem, ...safe];
    });
      // ✅ SHOW "CAPSULE CREATED" ANIMATION
  setCreatedOpen(true);

  }}
  onUpdated={async (cap) => {
    const signed = await getSignedCoverUrl(cap.cover_image);
    setCapsules((prev) =>
      prev
        ? prev.map((c) =>
            c.id === cap.id ? { ...c, ...cap, cover_image: signed } : c
          )
        : prev
    );
    toast.success('Capsule updated!');
  }}
/>


<CapsuleCreatedOverlay
  open={createdOpen}
  onClose={() => setCreatedOpen(false)}
/>

{unlockOpen && (
  <CapsuleUnlock
    onComplete={async () => {
      if (unlockNotificationId) {
        await supabase
          .from('notifications')
          .update({ seen: true })
          .eq('id', unlockNotificationId);
      }

      // 🔓 Update UI immediately (no refresh)
      setCapsules((prev) =>
        prev.map((c) =>
          c.is_locked && new Date(c.unlock_date) <= new Date()
            ? { ...c, is_locked: false }
            : c
        )
      );

      setUnlockOpen(false);
      setUnlockNotificationId(null);
    }}
  />
)}

      <style jsx global>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      {/* delete confirmation */}

{confirmDelete && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm text-center">
      <h3 className="text-lg font-semibold text-[#1F2837] mb-3">
        Delete “{confirmDelete.title}”?
      </h3>
      <p className="text-sm text-[#5B6473] mb-6">
        This action cannot be undone. All media, voice notes, and messages inside this capsule will be lost.
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
            handleDeleteCapsule(confirmDelete.id);
            setConfirmDelete(null);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
