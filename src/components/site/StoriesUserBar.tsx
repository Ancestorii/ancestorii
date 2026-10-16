'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { getBrowserClient } from '@/lib/supabase/browser';
import StoriesBarView, { type StorySearchResult } from './stories-bar/StoriesBarView';
import { useStoryNotifications } from './stories-bar/useStoryNotifications';

/**
 * Slim bar under the nav on Our Stories pages, for signed-in readers only: story search,
 * notifications and the profile menu. This part reads the session and does the data work
 * (the same queries PublicNav uses); stories-bar/StoriesBarView draws it. Signed out, it
 * renders nothing. A page that already knows the reader can pass `isLoggedIn` so the bar is
 * there from the first paint; otherwise it appears once the browser session has been read.
 */
export default function StoriesUserBar({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const router = useRouter();
  // undefined until the browser session has been read
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [avatar, setAvatar] = useState<{ userId: string; url: string } | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StorySearchResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRun = useRef(0);

  const signedIn = session === undefined ? !!isLoggedIn : !!session;
  const user = session?.user ?? null;
  const userId = user?.id ?? null;
  const notifications = useStoryNotifications(signedIn);

  // ── Session (as SiteNav reads it) ──
  useEffect(() => {
    const supabase = getBrowserClient();
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      if (active) setSession(next);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  // ── Avatar (exactly as PublicNav loads it, and again on 'profile-image-updated') ──
  useEffect(() => {
    if (!userId) return;
    const supabase = getBrowserClient();
    let active = true;

    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const { data: profile } = await supabase
          .from('Profiles')
          .select('profile_image_url')
          .eq('id', data.user.id)
          .single();
        if (profile?.profile_image_url) {
          const { data: signed } = await supabase.storage
            .from('user-media')
            .createSignedUrl(profile.profile_image_url, 3600);
          if (active && signed?.signedUrl) {
            setAvatar({ userId: data.user.id, url: `${signed.signedUrl}&cb=${Date.now()}` });
          }
        }
      }
    };
    getUser();

    const onAvatarChange = () => getUser();
    window.addEventListener('profile-image-updated', onAvatarChange);
    return () => {
      active = false;
      window.removeEventListener('profile-image-updated', onAvatarChange);
    };
  }, [userId]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  // ── Story search (PublicNav's query for non-dashboard pages; 300ms debounce, 2+ characters) ──
  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const run = ++searchRun.current;
    const trimmed = value.trim();
    if (!trimmed || trimmed.length < 2) {
      setResults((prev) => (prev.length ? [] : prev));
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const supabase = getBrowserClient();
      const { data } = await supabase
        .from('stories')
        .select('id, title, slug, author_name')
        .eq('status', 'published')
        .ilike('title', `%${trimmed}%`)
        .limit(6);
      if (run !== searchRun.current) return; // a newer search has started since
      const hits = (data ?? []).map((s) => ({
        id: s.id,
        title: s.title,
        subtitle: s.author_name,
        href: `/stories/${s.slug}`,
      }));
      setResults(hits);
    }, 300);
  };

  const openResult = (href: string) => {
    router.push(href);
    handleQueryChange('');
  };

  const handleLogout = async () => {
    const supabase = getBrowserClient();
    await supabase.auth.signOut({ scope: 'local' });
    setSession(null);
    router.push('/login');
  };

  if (!signedIn) return null;

  const fullName = user?.user_metadata?.full_name;
  const initial = (typeof fullName === 'string' && fullName.trim() ? fullName : user?.email ?? '')
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <StoriesBarView
      query={query}
      results={results}
      onQueryChange={handleQueryChange}
      onOpenResult={openResult}
      unreadCount={notifications.count}
      notifications={notifications.notifications}
      notificationsLoading={notifications.loading}
      onNotificationsOpen={notifications.loadRecent}
      onNotificationSelect={notifications.select}
      onMarkAllRead={notifications.markAllRead}
      avatarUrl={avatar && avatar.userId === userId ? avatar.url : null}
      initial={initial}
      email={user?.email ?? null}
      onLogout={handleLogout}
    />
  );
}
