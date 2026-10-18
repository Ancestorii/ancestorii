'use client';

import { ReactNode, useEffect, useState, useCallback } from 'react';
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
import { appRoot, btnClass, ui, useDialog } from '@/components/dashboard/ui/AppBits';



const supabase = getBrowserClient();

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


/* ---------- Layout ---------- */
export default function DashboardClientLayout({ children }: { children: ReactNode }) {
  const [lovedOnesCount, setLovedOnesCount] = useState(0);
  const [capsulesCount, setCapsulesCount] = useState(0);
  const [albumsCount, setAlbumsCount] = useState(0);
  const [timelinesCount, setTimelinesCount] = useState(0);
  const [libraryMediaCount, setLibraryMediaCount] = useState(0);
  const [hydrated, setHydrated] = useState(false);
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
  const [familyName, setFamilyName] = useState('My Family');
  const [familyMemberCount, setFamilyMemberCount] = useState(1);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [usedStorage, setUsedStorage] = useState(0);
  const [maxStorage, setMaxStorage] = useState(1 * 1024 ** 3);


  const router = useRouter();
  const pathname = usePathname();
  const hideSidebar = /\/dashboard\/\w+\/[^/]+/.test(pathname);
  // The print editors keep the old desktop overflow (their stage may need to scroll sideways on
  // small laptops); every other page's main is a plain clipping box at every width.
  const isEditor = /^\/dashboard\/(books|canvas|acrylic)\/[^/]+/.test(pathname);
  useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
}, [pathname]);

  const loadDashboardCounts = useCallback(async () => {
    const { data: sess } = await supabase.auth.getSession();
    const user = sess?.session?.user;
    if (!user) return;

    const uid = user.id;

    // Build capsule query: must filter by family_id because
    // capsule RLS has an OR clause that leaks unlocked capsules
    // from other families
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

    setLovedOnesCount(loved || 0);
    setCapsulesCount(caps || 0);
    setAlbumsCount(albums || 0);
    setTimelinesCount(timelines || 0);
  }, [familyId]);

  useEffect(() => {
    if (!hydrated) return;

    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push('/login');
        return;
      }

      setUserId(data.user.id);
      setUserEmail(data.user.email ?? null);
    })();
  }, [hydrated, router]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
  const loadSidebarData = async () => {
    const supabase = getBrowserClient();

    const { data: authResp } = await supabase.auth.getUser();
    const uid = authResp?.user?.id;

    if (!uid) return;

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan_id, status, cancel_at_period_end, current_period_end')
      .eq('user_id', uid)
      .maybeSingle();

    const { data: plans } = await supabase
      .from('plans')
      .select('id, name, max_storage');

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

    // Family-wide storage (shared pool), matching the plans page. get_total_storage_used
    // is family-scoped: it sums storage across every member sharing this user's family_id.
    const { data: totalBytes } = await supabase.rpc('get_total_storage_used', { uid });

    if (totalBytes != null) {
      setUsedStorage(Number(totalBytes));
    }
    // Fetch family data
    const { data: membership } = await supabase
      .from('family_memberships')
      .select('family_id, role')
      .eq('user_id', uid)
      .limit(1)
      .single();

    if (membership) {
      setFamilyId(membership.family_id);
      const { data: family } = await supabase
        .from('families')
        .select('name')
        .eq('id', membership.family_id)
        .single();
      if (family?.name) setFamilyName(family.name);

      const { count: memberCount } = await supabase
        .from('family_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', membership.family_id);
      setFamilyMemberCount(memberCount || 1);
    }
  };

  loadSidebarData();
}, []);

  useEffect(() => {
    if (!hydrated) return;
    loadDashboardCounts();
  }, [hydrated, loadDashboardCounts]);

  useEffect(() => {
    const handler = () => loadDashboardCounts();
    window.addEventListener('dashboard-data-changed', handler);
    return () => window.removeEventListener('dashboard-data-changed', handler);
  }, [loadDashboardCounts]);

  useEffect(() => {
    const handleFamilyRename = (e: Event) => {
      const name = (e as CustomEvent).detail;
      if (name) setFamilyName(name);
    };
    window.addEventListener('family-name-updated', handleFamilyRename);
    return () => window.removeEventListener('family-name-updated', handleFamilyRename);
  }, []);

  useEffect(() => {
    const handleMemberCount = (e: Event) => {
      const count = (e as CustomEvent).detail;
      if (count) setFamilyMemberCount(count);
    };
    window.addEventListener('family-members-updated', handleMemberCount);
    return () => window.removeEventListener('family-members-updated', handleMemberCount);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/dashboard') router.replace('/dashboard/our-family');
    }
  }, [router, hydrated]);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      const { data: welcomeExists } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'welcome')
        .maybeSingle();

      if (!welcomeExists) {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'welcome',
          actor_name: 'Ancestorii',
        });
      }
    })();
  }, [userId]);

  const fetchProfile = async () => {
    if (!userId) return;

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;

    let { data: prof } = await supabase
      .from('Profiles')
      .select('full_name, profile_image_url')
      .eq('id', userId)
      .maybeSingle();

    if (!prof?.full_name) {
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        null;

      if (fullName) {
        await supabase
          .from('Profiles')
          .update({ full_name: fullName })
          .eq('id', userId);

        prof = { ...prof!, full_name: fullName };
      }
    }

    setFullName(prof?.full_name ?? null);

    if (prof?.profile_image_url) {
      const { data } = await supabase.storage
        .from('user-media')
        .createSignedUrl(prof.profile_image_url, 3600);

      setAvatarUrl(
        data?.signedUrl ? `${data.signedUrl}&cb=${Date.now()}` : null
      );
    } else {
      setAvatarUrl(null);
    }
  };

  useEffect(() => {
    if (!hydrated) return;

    const refresh = () => fetchProfile();

    window.addEventListener('profile-updated', refresh);
    window.addEventListener('profile-image-updated', refresh);

    return () => {
      window.removeEventListener('profile-updated', refresh);
      window.removeEventListener('profile-image-updated', refresh);
    };
  }, [hydrated, userId]);

 useEffect(() => {
  if (memoriesOpen || heirloomsOpen || accountOpen) {
    document.body.style.overflow = "hidden";
  } else {
    // clear it rather than "auto", which overrode body's overflow-x:hidden and let pages wobble sideways
    document.body.style.overflow = "";
  }
}, [memoriesOpen, heirloomsOpen, accountOpen]);

  useEffect(() => {
    if (!userId) return;

    fetchProfile();
    const interval = setInterval(fetchProfile, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userId]);

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: 'local' });
    setUserEmail(null);
    setUserId(null);
    setAvatarUrl(null);
    setFullName(null);
    router.push('/login');
  };

  if (!hydrated) return null;

 return (
  <>

    <div className={`${appRoot} antialiased`} suppressHydrationWarning>

    {!hideSidebar && <PublicNav />}

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
  familyName={familyName}
  familyMemberCount={familyMemberCount}
  totalMemories={lovedOnesCount + capsulesCount + albumsCount + timelinesCount + libraryMediaCount}
  usedStorage={usedStorage}
  maxStorage={maxStorage}
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-[300] flex items-end justify-center"
          style={{ backgroundColor: 'rgba(10,10,15,0.45)' }}
          onClick={() => setMemoriesOpen(false)}
        >
          <motion.div
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-[300] flex items-end justify-center"
          style={{ backgroundColor: 'rgba(10,10,15,0.45)' }}
          onClick={() => setHeirloomsOpen(false)}
        >
          <motion.div
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
              className={`${sheetBody} space-y-2`}
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            >
              {heirloomsLinks.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <motion.div
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-[300] flex items-end justify-center"
          style={{ backgroundColor: 'rgba(10,10,15,0.45)' }}
          onClick={() => setAccountOpen(false)}
        >
          <motion.div
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
              className={`${sheetBody} space-y-2`}
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            >
              {accountLinks.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <motion.div
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

    <style jsx global>{`
      /* Kept: the create drawers' loading bars animate "shimmer" and are drawn for this
         sliding version (globals.css has a different, pulsing one). */
      @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
        /* The desktop sidebar starts right under the 72px top bar (PublicNav). */
        @media (min-width: 1024px) {
          .dashboard-sidebar {
            top: 72px !important;
            height: calc(100vh - 72px) !important;
          }
        }
        /* A sidebar section's links fade in as it opens (opacity and transform only). */
        .sidebar-reveal {
          animation: sidebarReveal 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        @keyframes sidebarReveal {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: none; }
        }
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(10, 10, 15, 0.18) transparent;
        }
        .sidebar-scroll::-webkit-scrollbar {
  width: 5px;
}
.sidebar-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar-scroll::-webkit-scrollbar-thumb {
  background: rgba(10, 10, 15, 0.18);
  border-radius: 10px;
}
.sidebar-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(10, 10, 15, 0.32);
}
    `}</style>
      </div>
  </>
)}