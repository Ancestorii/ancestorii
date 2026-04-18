'use client';

import { getBrowserClient } from '@/lib/supabase/browser';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHomeClient from './DashboardHomeClient';

export default function DashboardHomeLogic({
  name,
  homeImages: initialImages,
  email,

  /* NEW */
  metrics,
  lovedOnes,
  activity,
  latestCapsule,
}: {
  name: string | null;
  homeImages: (string | null)[];
  email: string | null;

  /* NEW TYPES */
 metrics: {
  lovedOnes: number;
  memories: number;
  timelines: number;
  albums: number;
  capsules: number;
  voiceNotes: number;
  totalCollectionItems: number;
};
  lovedOnes: Array<{
  id: string;
  full_name: string;
  relationship_to_user?: string | null;
  relationship_label?: string;
  avatar_signed?: string | null;
  memories_count?: number;
}>;

activity: Array<{
  id: string;
  action: string;
  target_type?: string;
  created_at: string;
}>;
  latestCapsule: any;
}) {
  const supabase = getBrowserClient();
  const router = useRouter();

  const [homeImages, setHomeImages] = useState(initialImages);
  const [displayName, setDisplayName] = useState(name);
  const [activeMemory, setActiveMemory] = useState(0);
  const [showDesktopToast, setShowDesktopToast] = useState(false);

  const DESKTOP_TOAST_KEY = 'desktop_recommend_last_seen';
  const DESKTOP_TOAST_RESET_MS = 24 * 60 * 60 * 1000;

  const firstName =
    displayName?.trim()?.split(/\s+/)?.[0] ||
    name?.trim()?.split(/\s+/)?.[0] ||
    'there';

  const pinnedCount = useMemo(
    () => homeImages.filter(Boolean).length,
    [homeImages]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    const lastSeen = localStorage.getItem(DESKTOP_TOAST_KEY);
    const now = Date.now();

    if (!lastSeen || now - Number(lastSeen) > DESKTOP_TOAST_RESET_MS) {
      setShowDesktopToast(true);
    }
  }, []);

  useEffect(() => {
    if (displayName) return;

    const loadName = async () => {
      const { data } = await supabase
        .from('Profiles')
        .select('full_name')
        .single();

      if (data?.full_name) {
        setDisplayName(data.full_name);
      }
    };

    loadName();
  }, [displayName, supabase]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const trackSignup = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) return;

      const created = new Date(user.created_at).getTime();
      const lastSignIn = new Date(user.last_sign_in_at || '').getTime();
      const isNewUser = Math.abs(lastSignIn - created) < 10000;

      if (!isNewUser) return;
      if (sessionStorage.getItem('signup_tracked')) return;

      if ((window as any).fbq) {
        (window as any).fbq('track', 'CompleteRegistration', {
          em: email,
        });
      }

      if ((window as any).rdt) {
        (window as any).rdt('track', 'CompleteRegistration');
      }

      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: 'signup_complete',
      });

      sessionStorage.setItem('signup_tracked', '1');
    };

    trackSignup();
  }, [email, supabase]);

  const nextMemory = () => {
    setActiveMemory((prev) => (prev + 1) % 5);
  };

  const prevMemory = () => {
    setActiveMemory((prev) => (prev - 1 + 5) % 5);
  };

  const uploadHomeImage = async (file: File, index: number) => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id;
    if (!uid) return;

    const ext = file.name.split('.').pop();
    const path = `${uid}/home-${index}-${Date.now()}.${ext}`;

    await supabase.storage.from('user-media').upload(path, file, { upsert: true });

    await supabase
      .from('Profiles')
      .update({ [`home_image_${index}`]: path })
      .eq('id', uid);

    const { data } = await supabase.storage
      .from('user-media')
      .createSignedUrl(path, 60 * 60 * 24 * 7);

    setHomeImages((prev) => {
      const copy = [...prev];
      copy[index] = data?.signedUrl ?? null;
      return copy;
    });
  };

  const dismissDesktopToast = () => {
    localStorage.setItem(DESKTOP_TOAST_KEY, String(Date.now()));
    setShowDesktopToast(false);
  };

  return (
    <DashboardHomeClient
      displayName={displayName}
      firstName={firstName}
      email={email}

      /* EXISTING */
      homeImages={homeImages}
      activeMemory={activeMemory}
      pinnedCount={pinnedCount}
      showDesktopToast={showDesktopToast}
      onDismissDesktopToast={dismissDesktopToast}
      onNextMemory={nextMemory}
      onPrevMemory={prevMemory}
      onSetActiveMemory={setActiveMemory}
      onUploadHomeImage={uploadHomeImage}

      /* NEW DATA */
      metrics={metrics}
      lovedOnes={lovedOnes}
      activity={activity}
      latestCapsule={latestCapsule}

      /* NAV */
      onGoToFamilyAdd={() => router.push('/dashboard/family?add=true')}
      onGoToLibrary={() => router.push('/dashboard/library')}
      onGoToFamily={() => {
        router.push('/dashboard/family');
        window.scrollTo(0, 0);
      }}
      onGoToTimeline={() => {
        router.push('/dashboard/timeline');
        setTimeout(() => window.scrollTo(0, 0), 0);
      }}
      onGoToCapsules={() => {
        router.push('/dashboard/capsules');
        setTimeout(() => window.scrollTo(0, 0), 0);
      }}
      onGoToAlbums={() => {
        router.push('/dashboard/albums');
        setTimeout(() => window.scrollTo(0, 0), 0);
      }}
      onGoToBooks={() => {
  router.push('/dashboard/books');
  setTimeout(() => window.scrollTo(0, 0), 0);
}}
    />
  );
}