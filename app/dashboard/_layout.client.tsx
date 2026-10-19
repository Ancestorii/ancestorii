'use client';

import { ReactNode, useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';

import { memoriesLinks, heirloomsLinks, accountLinks } from "@/lib/dashboardNavigation";
import SidebarContent from "@/components/dashboard/SidebarContent";
import BottomNavigation from "@/components/dashboard/BottomNavigation";
import PublicNav from '@/components/stories/layout/PublicNav';
import { motion, AnimatePresence } from "framer-motion";
import NProgress from 'nprogress';
import { ChevronRight } from 'lucide-react';
import { appRoot, btnClass, ui, useDialog, jsMotion } from '@/components/dashboard/ui/AppBits';



const supabase = getBrowserClient();

// The avatar's signed URL lives a week (as on the album and capsule pages), and nothing re-signs
// it on a timer: the browser keeps one cached copy instead of downloading the photo again.
const AVATAR_TTL = 60 * 60 * 24 * 7;

type ProfileRow = { full_name: string | null; profile_image_url: string | null } | null;

/* Phone sheets (My Memories, My Heirlooms, My Account): the kit's bottom sheet, with rows
   that are white with a hairline, or ink for the page you're on. */
const sheetHead = 'flex flex-none items-center justify-between gap-4 px-5 pb-3 pt-4';
const sheetTitle = 'flex min-w-0 items-center gap-2.5 text-[22px] font-extrabold leading-tight tracking-[-0.04em]';
const sheetBody = 'min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-1.5 pb-[max(20px,env(safe-area-inset-bottom))]';
const sheetRow = 'flex min-h-[56px] items-center justify-between gap-3 rounded-[16px] px-4 transition-[background-color,box-shadow] duration-200';
const sheetRowIdle = 'bg-white text-[var(--ink)] shadow-[inset_0_0_0_1.5px_rgba(10,10,15,0.14)] hover:shadow-[inset_0_0_0_1.5px_#0a0a0f]';
const sheetRowActive = 'bg-[var(--ink)] text-white';
const viewingChip = `${ui.chip} ${ui.chipSm} ${ui.chipDot} flex-none`;
// The kit's small soft button, 44px tall: the sheets only open on touch screens.
const doneBtn = btnClass({ variant: 'soft', size: 'sm' });
const doneBtnStyle = { minHeight: 44 };


/* ---------- Layout ----------
   The shell renders on the server and on the first client paint (the server layout has already
   checked the session). What only the browser knows (counts, storage, plan, name, photo) fills in
   afterwards behind placeholders that hold their place, so nothing jumps. */
export default function DashboardClientLayout({ children }: { children: ReactNode }) {
  const [lovedOnesCount, setLovedOnesCount] = useState(0);
  const [capsulesCount, setCapsulesCount] = useState(0);
  const [albumsCount, setAlbumsCount] = useState(0);
  const [timelinesCount, setTimelinesCount] = useState(0);
  const [libraryMediaCount, setLibraryMediaCount] = useState(0);
  const [countsLoaded, setCountsLoaded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [memoriesOpen, setMemoriesOpen] = useState(false);
  const [heirloomsOpen, setHeirloomsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  // Phone sheets: Escape closes them, Tab stays inside, focus returns to the bottom nav.
  const memoriesSheetRef = useDialog<HTMLDivElement>(memoriesOpen, () => setMemoriesOpen(false));
  const heirloomsSheetRef = useDialog<HTMLDivElement>(heirloomsOpen, () => setHeirloomsOpen(false));
  const accountSheetRef = useDialog<HTMLDivElement>(accountOpen, () => setAccountOpen(false));
  const [collapsed, setCollapsed] = useState(false);
  // null until the subscription is read, so a Premium family never sees "Upgrade Plan" flash first.
  const [planName, setPlanName] = useState<'Free' | 'Premium' | null>(null);
  // The family id only steers the capsule count (see loadDashboardCounts); a ref keeps that
  // callback stable for the "dashboard-data-changed" listener.
  const familyIdRef = useRef<string | null>(null);
  const [usedStorage, setUsedStorage] = useState(0);
  const [maxStorage, setMaxStorage] = useState(1 * 1024 ** 3);
  const [storageLoaded, setStorageLoaded] = useState(false);


  const router = useRouter();
  const pathname = usePathname();
  const hideSidebar = /\/dashboard\/\w+\/[^/]+/.test(pathname);
  // The print editors keep the old desktop overflow (their stage may need to scroll sideways on
  // small laptops); every other page's main is a plain clipping box at every width.
  const isEditor = /^\/dashboard\/(books|canvas|acrylic)\/[^/]+/.test(pathname);

  const loadDashboardCounts = useCallback(async () => {
    const familyId = familyIdRef.current;

    // Capsule count scoped to this family (the live RLS policy is family_id IN get_my_family_ids(),
    // so this is belt and braces, not a leak fix).
    let capsuleQuery = supabase
      .from('memory_capsules')
      .select('id', { head: true, count: 'exact' });
    if (familyId) capsuleQuery = capsuleQuery.eq('family_id', familyId);

    const [
      { count: loved },
      { count: caps },
      { count: albums },
      { count: timelines },
      { count: libraryMedia },
    ] = await Promise.all([
      supabase
        .from('family_members')
        .select('id', { head: true, count: 'exact' }),

      capsuleQuery,

      supabase
        .from('albums')
        .select('id', { head: true, count: 'exact' }),

      supabase
        .from('timelines')
        .select('id', { head: true, count: 'exact' }),

      supabase
        .from('library_media')
        .select('id', { head: true, count: 'exact' }),
    ]);

    setLovedOnesCount(loved || 0);
    setCapsulesCount(caps || 0);
    setAlbumsCount(albums || 0);
    setTimelinesCount(timelines || 0);
    setLibraryMediaCount(libraryMedia || 0);
    setCountsLoaded(true);
  }, []);

  // Name and photo from one Profiles row (the top bar takes them as props instead of reading the
  // same row and signing the same photo again). No cache buster on the signed URL: replacing the
  // photo stores it at a new path, so the browser may keep one cached copy of the old one.
  const applyProfile = useCallback(async (uid: string, prof: ProfileRow, metadataName: string | null) => {
    let name = prof?.full_name ?? null;

    if (!name && metadataName) {
      await supabase
        .from('Profiles')
        .update({ full_name: metadataName })
        .eq('id', uid);
      name = metadataName;
    }

    setFullName(name);

    if (prof?.profile_image_url) {
      const { data } = await supabase.storage
        .from('user-media')
        .createSignedUrl(prof.profile_image_url, AVATAR_TTL);

      setAvatarUrl(data?.signedUrl ?? null);
    } else {
      setAvatarUrl(null);
    }
  }, []);

  // After the profile page saves ("profile-updated", "profile-image-updated").
  const fetchProfile = useCallback(async () => {
    const { data: sess } = await supabase.auth.getSession();
    const user = sess?.session?.user;
    if (!user) return;

    const { data: prof } = await supabase
      .from('Profiles')
      .select('full_name, profile_image_url')
      .eq('id', user.id)
      .maybeSingle();

    await applyProfile(
      user.id,
      prof,
      user.user_metadata?.full_name || user.user_metadata?.name || null
    );
  }, [applyProfile]);

  // Everything the sidebar needs, in two rounds: the user from the local session (no network;
  // the server layout has verified it), then the five independent reads at once, then the counts
  // (they wait for the family id). Before: seven reads one after another, and the counts twice.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const user = sess?.session?.user;
      if (!user) {
        router.push('/login');
        return;
      }

      const uid = user.id;
      setUserId(uid);
      setUserEmail(user.email ?? null);

      const [
        { data: sub },
        { data: plans },
        { data: totalBytes },
        { data: membership },
        { data: prof },
      ] = await Promise.all([
        supabase
          .from('subscriptions')
          .select('plan_id, status, cancel_at_period_end, current_period_end')
          .eq('user_id', uid)
          .maybeSingle(),
        supabase
          .from('plans')
          .select('id, name, max_storage'),
        // Family-wide storage (shared pool), matching the plans page. get_total_storage_used
        // is family-scoped: it sums storage across every member sharing this user's family_id.
        supabase.rpc('get_total_storage_used', { uid }),
        supabase
          .from('family_memberships')
          .select('family_id')
          .eq('user_id', uid)
          .limit(1)
          .maybeSingle(),
        supabase
          .from('Profiles')
          .select('full_name, profile_image_url')
          .eq('id', uid)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      const matchedPlan = plans?.find((p) => p.id === sub?.plan_id);

      const isPremium =
        matchedPlan?.name === 'Premium' &&
        sub?.status === 'active' &&
        sub?.cancel_at_period_end === false &&
        (!sub?.current_period_end ||
          new Date(sub.current_period_end) > new Date());

      setPlanName(isPremium ? 'Premium' : 'Free');

      if (matchedPlan?.max_storage) {
        setMaxStorage(matchedPlan.max_storage);
      }

      if (totalBytes != null) {
        setUsedStorage(Number(totalBytes));
      }
      setStorageLoaded(true);

      familyIdRef.current = membership?.family_id ?? null;
      void loadDashboardCounts();
      void applyProfile(
        uid,
        prof,
        user.user_metadata?.full_name || user.user_metadata?.name || null
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [router, loadDashboardCounts, applyProfile]);

  useEffect(() => {
    const handler = () => {
      void loadDashboardCounts();
    };
    window.addEventListener('dashboard-data-changed', handler);
    return () => window.removeEventListener('dashboard-data-changed', handler);
  }, [loadDashboardCounts]);

  // The welcome note is created once per account. Checked once per browser tab, not on every
  // page load (it used to be a read and sometimes a write on every dashboard visit).
  useEffect(() => {
    if (!userId) return;
    const key = `ancestorii:welcome-checked:${userId}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {}

    (async () => {
      const { data: welcomeExists } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'welcome')
        .limit(1)
        .maybeSingle();

      if (!welcomeExists) {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'welcome',
          actor_name: 'Ancestorii',
        });
      }
      try {
        sessionStorage.setItem(key, '1');
      } catch {}
    })();
  }, [userId]);

  useEffect(() => {
    const refresh = () => {
      void fetchProfile();
    };

    window.addEventListener('profile-updated', refresh);
    window.addEventListener('profile-image-updated', refresh);

    return () => {
      window.removeEventListener('profile-updated', refresh);
      window.removeEventListener('profile-image-updated', refresh);
    };
  }, [fetchProfile]);

 useEffect(() => {
  if (memoriesOpen || heirloomsOpen || accountOpen) {
    document.body.style.overflow = "hidden";
  } else {
    // clear it rather than "auto", which overrode body's overflow-x:hidden and let pages wobble sideways
    document.body.style.overflow = "";
  }
}, [memoriesOpen, heirloomsOpen, accountOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: 'local' });
    setUserEmail(null);
    setUserId(null);
    setAvatarUrl(null);
    setFullName(null);
    router.push('/login');
  };

 return (
  <>

    <div className={`${appRoot} dashboard-shell antialiased`}>

    {!hideSidebar && <PublicNav account={{ email: userEmail, avatarUrl }} />}

    {/* ---------- Sidebar ---------- */}
{!hideSidebar && (
<aside
  className={`
    dashboard-sidebar
    fixed top-0 left-0 z-[150] lg:z-40 h-screen
    ${collapsed ? 'w-[80px]' : 'w-[272px]'}

    bg-white border-r-[1.5px] border-r-[var(--rule)]
    overflow-hidden
    pointer-events-auto

    ${drawerOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 max-lg:invisible lg:translate-x-0 lg:opacity-100'}

    ${drawerOpen
      ? 'transition-[transform,opacity] duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]'
      : 'transition-[transform,opacity] duration-120 ease-in'
    }

    lg:transition-[width] lg:duration-300 lg:ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
    will-change-transform transform-gpu
  `}
>
  <SidebarContent
  collapsed={collapsed}
  setCollapsed={setCollapsed}
  closeDrawer={() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setDrawerOpen(false);
    }
  }}

  fullName={fullName}
  userEmail={userEmail}
  avatarUrl={avatarUrl}
  planName={planName}
  handleLogout={handleLogout}
  totalMemories={lovedOnesCount + capsulesCount + albumsCount + timelinesCount + libraryMediaCount}
  usedStorage={usedStorage}
  maxStorage={maxStorage}
  loaded={countsLoaded && storageLoaded}
/>
</aside>
)}
{/* main is not a scroll container (globals.css gives every main overflow-y:auto): the document scrolls, with no nested scroller, so position:sticky works inside pages. The editors keep it from lg up. */}
<main
  className={`
    ${hideSidebar ? '' : collapsed ? 'lg:ml-[80px]' : 'lg:ml-[272px]'}
    min-h-screen
    bg-white
    ${isEditor ? 'max-lg:overflow-x-clip max-lg:overflow-y-visible' : 'overflow-x-clip overflow-y-visible'}
  `}
>
  {children}
</main>
    {/* Mobile sheets: a transform string (not y) lets Motion run the slide on the compositor,
        and the scrims skip backdrop blur, which re-renders the whole screen every frame */}
    {/* ================= MEMORIES ================= */}
    <AnimatePresence>
      {memoriesOpen && (
        <motion.div
          {...jsMotion}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-[300] flex items-end justify-center"
          style={{ backgroundColor: 'rgba(10,10,15,0.45)' }}
          onClick={() => setMemoriesOpen(false)}
        >
          <motion.div
            {...jsMotion}
            initial={{ transform: 'translateY(100%)', opacity: 0 }}
            animate={{ transform: 'translateY(0%)', opacity: 1 }}
            exit={{ transform: 'translateY(100%)', opacity: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 260 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-memories-title"
            ref={memoriesSheetRef}
            className={`${ui.sheet} ${ui.sheetBottom} w-full sm:max-w-[560px]`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={ui.sheetHandle} />

            <div className={sheetHead}>
              <h2 id="sheet-memories-title" className={sheetTitle}>
                <span className="h-2.5 w-2.5 flex-none rounded-full bg-[var(--c0)]" aria-hidden="true" />
                My Memories
              </h2>
              <button
                onClick={() => setMemoriesOpen(false)}
                className={doneBtn}
                style={doneBtnStyle}
              >
                Done
              </button>
            </div>

            <motion.div
              {...jsMotion}
              className={sheetBody}
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            >
              <div className="space-y-2">
                {memoriesLinks.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <motion.div
                      {...jsMotion}
                      key={item.href}
                      variants={{ hidden: { opacity: 0, transform: 'translateY(6px)' }, show: { opacity: 1, transform: 'translateY(0px)' } }}
                    >
                      <Link
  href={item.href}
  onClick={() => {
    NProgress.start();
    setMemoriesOpen(false);
  }}
  aria-current={active ? "page" : undefined}
  className={`${sheetRow} ${active ? sheetRowActive : sheetRowIdle}`}
>
                        <span className="flex min-w-0 items-center gap-3">
                          <item.icon size={20} strokeWidth={2} className="flex-none" aria-hidden="true" />
                          <span className="truncate text-[15px] font-bold">{item.label}</span>
                        </span>
                        {active ? (
                          <span className={viewingChip}>Viewing</span>
                        ) : (
                          <ChevronRight size={18} strokeWidth={2.4} className="flex-none" aria-hidden="true" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* ================= HEIRLOOMS ================= */}
    <AnimatePresence>
      {heirloomsOpen && (
        <motion.div
          {...jsMotion}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-[300] flex items-end justify-center"
          style={{ backgroundColor: 'rgba(10,10,15,0.45)' }}
          onClick={() => setHeirloomsOpen(false)}
        >
          <motion.div
            {...jsMotion}
            initial={{ transform: 'translateY(100%)', opacity: 0 }}
            animate={{ transform: 'translateY(0%)', opacity: 1 }}
            exit={{ transform: 'translateY(100%)', opacity: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 260 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-heirlooms-title"
            ref={heirloomsSheetRef}
            className={`${ui.sheet} ${ui.sheetBottom} w-full sm:max-w-[560px]`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={ui.sheetHandle} />

            <div className={sheetHead}>
              <h2 id="sheet-heirlooms-title" className={sheetTitle}>
                <span className="h-2.5 w-2.5 flex-none rounded-full bg-[var(--c2)]" aria-hidden="true" />
                My Heirlooms
              </h2>
              <button
                onClick={() => setHeirloomsOpen(false)}
                className={doneBtn}
                style={doneBtnStyle}
              >
                Done
              </button>
            </div>

            <motion.div
              {...jsMotion}
              className={`${sheetBody} space-y-2`}
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            >
              {heirloomsLinks.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <motion.div
                    {...jsMotion}
                    key={item.href}
                    variants={{ hidden: { opacity: 0, transform: 'translateY(6px)' }, show: { opacity: 1, transform: 'translateY(0px)' } }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => {
                        NProgress.start();
                        setHeirloomsOpen(false);
                      }}
                      aria-current={active ? "page" : undefined}
                      className={`${sheetRow} ${active ? sheetRowActive : sheetRowIdle}`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <item.icon size={20} strokeWidth={2} className="flex-none" aria-hidden="true" />
                        <span className="truncate text-[15px] font-bold">{item.label}</span>
                      </span>
                      {active ? (
                        <span className={viewingChip}>Viewing</span>
                      ) : (
                        <ChevronRight size={18} strokeWidth={2.4} className="flex-none" aria-hidden="true" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* ================= ACCOUNT ================= */}
    <AnimatePresence>
      {accountOpen && (
        <motion.div
          {...jsMotion}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-[300] flex items-end justify-center"
          style={{ backgroundColor: 'rgba(10,10,15,0.45)' }}
          onClick={() => setAccountOpen(false)}
        >
          <motion.div
            {...jsMotion}
            initial={{ transform: 'translateY(100%)', opacity: 0 }}
            animate={{ transform: 'translateY(0%)', opacity: 1 }}
            exit={{ transform: 'translateY(100%)', opacity: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 260 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-account-title"
            ref={accountSheetRef}
            className={`${ui.sheet} ${ui.sheetBottom} w-full sm:max-w-[560px]`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={ui.sheetHandle} />

            <div className={sheetHead}>
              <h2 id="sheet-account-title" className={sheetTitle}>
                <span className="h-2.5 w-2.5 flex-none rounded-full bg-[var(--c1)]" aria-hidden="true" />
                My Account
              </h2>
              <button
                onClick={() => setAccountOpen(false)}
                className={doneBtn}
                style={doneBtnStyle}
              >
                Done
              </button>
            </div>

            <motion.div
              {...jsMotion}
              className={`${sheetBody} space-y-2`}
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            >
              {accountLinks.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <motion.div
                    {...jsMotion}
                    key={item.href}
                    variants={{ hidden: { opacity: 0, transform: 'translateY(6px)' }, show: { opacity: 1, transform: 'translateY(0px)' } }}
                  >
                    <Link
  href={item.href}
  onClick={() => {
    NProgress.start();
    setAccountOpen(false); // ✅ CORRECT
  }}
  aria-current={active ? "page" : undefined}
  className={`${sheetRow} ${active ? sheetRowActive : sheetRowIdle}`}
>
                      <span className="flex min-w-0 items-center gap-3">
                        <item.icon size={20} strokeWidth={2} className="flex-none" aria-hidden="true" />
                        <span className="truncate text-[15px] font-bold">{item.label}</span>
                      </span>
                      {active ? (
                        <span className={viewingChip}>Viewing</span>
                      ) : (
                        <ChevronRight size={18} strokeWidth={2.4} className="flex-none" aria-hidden="true" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <BottomNavigation
      setMemoriesOpen={setMemoriesOpen}
      setHeirloomsOpen={setHeirloomsOpen}
      setAccountOpen={setAccountOpen}
    />

    {/* The shell's own CSS (sidebar offset under the top bar, scroll padding, the section reveal,
        the thin scrollbar) lives in app/globals.css under "Dashboard shell": a <style jsx> block
        here reached the page only after hydration, so the server-rendered sidebar painted in the
        wrong place first. */}
      </div>
  </>
)}
