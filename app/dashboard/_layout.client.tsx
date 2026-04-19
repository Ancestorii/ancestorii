'use client';

import { ReactNode, useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';

import { memoriesLinks, booksLinks, accountLinks } from "@/lib/dashboardNavigation";
import SidebarContent from "@/components/dashboard/SidebarContent";
import BottomNavigation from "@/components/dashboard/BottomNavigation";
import { motion, AnimatePresence } from "framer-motion";
import ProgressBar from '@/components/ProgressBar';
import NProgress from 'nprogress';


const supabase = getBrowserClient();


/* ---------- Layout ---------- */
export default function DashboardClientLayout({ children }: { children: ReactNode }) {
  const [lovedOnesCount, setLovedOnesCount] = useState(0);
  const [capsulesCount, setCapsulesCount] = useState(0);
  const [albumsCount, setAlbumsCount] = useState(0);
  const [timelinesCount, setTimelinesCount] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [memoriesOpen, setMemoriesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [planName, setPlanName] = useState<'Free' | 'Premium'>('Free');


  const router = useRouter();
  const pathname = usePathname();
  const hideSidebar = /\/dashboard\/\w+\/[^/]+/.test(pathname);
  useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
}, [pathname]);

  const loadDashboardCounts = useCallback(async () => {
    const { data: sess } = await supabase.auth.getSession();
    const user = sess?.session?.user;
    if (!user) return;

    const uid = user.id;

    const [
      { count: loved },
      { count: caps },
      { count: albums },
      { count: timelines },
    ] = await Promise.all([
      supabase
        .from('family_members')
        .select('id', { head: true, count: 'exact' })
        .eq('owner_id', uid),

      supabase
        .from('memory_capsules')
        .select('id', { head: true, count: 'exact' })
        .eq('user_id', uid),

      supabase
        .from('albums')
        .select('id', { head: true, count: 'exact' })
        .eq('user_id', uid),

      supabase
        .from('timelines')
        .select('id', { head: true, count: 'exact' })
        .eq('user_id', uid),
    ]);

    setLovedOnesCount(loved || 0);
    setCapsulesCount(caps || 0);
    setAlbumsCount(albums || 0);
    setTimelinesCount(timelines || 0);
  }, []);

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
      .select('id, name');

    const matchedPlan = plans?.find((p) => p.id === sub?.plan_id);

    const isPremium =
      matchedPlan?.name === 'Premium' &&
      sub?.status === 'active' &&
      sub?.cancel_at_period_end === false &&
      (!sub?.current_period_end ||
        new Date(sub.current_period_end) > new Date());

    setPlanName(isPremium ? 'Premium' : 'Free');
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

  const scrolledRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!hydrated) return;

    const onScroll = () => {
      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;

        const next = window.scrollY > 30;
        if (next !== scrolledRef.current) {
          scrolledRef.current = next;
          setScrolled(next);
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/dashboard') router.replace('/dashboard/home');
    }
  }, [router, hydrated]);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      const { data: verification } = await supabase
        .from('email_verifications')
        .select('used_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (verification?.used_at) return;

      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('title', 'Verify your email')
        .maybeSingle();

      if (!existing) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          title: 'Verify your email',
          content: 'Please confirm your email address to unlock all features.',
          read: false,
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
  if (memoriesOpen || accountOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }
}, [memoriesOpen, accountOpen]);

  useEffect(() => {
    if (!userId) return;

    fetchProfile();
    const interval = setInterval(fetchProfile, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    setUserId(null);
    setAvatarUrl(null);
    setFullName(null);
    router.push('/');
  };

  if (!hydrated) return null;

 return (
  <>
    <ProgressBar />

    <div className="antialiased bg-white text-gray-900" suppressHydrationWarning>

    {/* ---------- Sidebar ---------- */}
{!hideSidebar && (
<aside
  className={`
    fixed top-0 left-0 z-[150] lg:z-40 h-screen
    ${collapsed ? 'w-[80px]' : 'w-[240px]'}

    bg-[linear-gradient(180deg,#0F1A2E_0%,#162844_70%,#1E355A_100%)]
    shadow-[4px_0_25px_rgba(15,32,64,0.25)]
    overflow-hidden
    pointer-events-auto

    ${drawerOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 lg:translate-x-0 lg:opacity-100'}

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
/>
</aside>
)}
<main
  className={`
    ${hideSidebar ? '' : collapsed ? 'lg:ml-[80px]' : 'lg:ml-[240px]'}
    min-h-screen
    bg-[#F7F3EC]
  `}
>
  {children}
</main>
    {/* ================= MEMORIES ================= */}
    <AnimatePresence>
      {memoriesOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-[300] flex items-end justify-center px-3 pb-[72px]"
          style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(15,26,46,0.25)' }}
          onClick={() => setMemoriesOpen(false)}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 260 }}
            className="w-full max-w-[300px] sm:max-w-[420px] rounded-[24px] bg-white border border-[#D4AF37]/40 shadow-[0_-8px_40px_rgba(15,32,64,0.18)] px-4 sm:px-6 pt-3 pb-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-[3px] bg-[#D4AF37]/40 rounded-full mx-auto mb-4" />

            <div className="px-2 mb-4">
              <div className="flex justify-between items-end border-b border-[#D4AF37]/30 pb-3">
                <h2 className="text-[20px] font-light text-[#0F1A2E] tracking-tight">
                  My <span className="font-serif italic text-[#D4AF37]">Memories</span>
                </h2>
                <button
                  onClick={() => setMemoriesOpen(false)}
                  className="text-[12px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>

            <motion.div
              className="space-y-4"
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
                      variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
                    >
                      <Link
  href={item.href}
  onClick={() => {
    NProgress.start();
    setMemoriesOpen(false);
  }}
  className={`flex items-center justify-between rounded-[14px] px-4 py-3 transition-all duration-200 ${
    active
      ? "bg-[#0F1A2E] text-white border border-[#D4AF37]"
      : "bg-[#fafafa] border border-[#EBEBEB] text-[#0F1A2E] hover:border-[#D4AF37]/40"
  }`}
>
                        <div className="flex items-center gap-2.5">
                          <item.icon size={15} className={active ? "text-[#D4AF37]" : "text-[#0F1A2E]/60"} />
                          <span className="text-[14px] font-medium">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {active && (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">
                              Viewing
                            </span>
                          )}
                          <div className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[#D4AF37]" : "bg-[#DDDDE8]"}`} />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="pt-1">
                <div className="flex items-center gap-2 px-2 mb-2">
                  <div className="h-[1px] flex-1 bg-[#D4AF37]/20" />
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#D4AF37]">My Books</p>
                  <div className="h-[1px] flex-1 bg-[#D4AF37]/20" />
                </div>
                <div className="space-y-2">
                  {booksLinks.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <motion.div
                        key={item.href}
                        variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
                      >
                        <Link
  href={item.href}
  onClick={() => {
    NProgress.start();
    setMemoriesOpen(false);
  }}
  className={`flex items-center justify-between rounded-[14px] px-4 py-3 transition-all duration-200 ${
    active
      ? "bg-[#0F1A2E] text-white border border-[#D4AF37]"
      : "bg-[#fafafa] border border-[#EBEBEB] text-[#0F1A2E] hover:border-[#D4AF37]/40"
  }`}
>
                          <div className="flex items-center gap-2.5">
                            <item.icon size={15} className={active ? "text-[#D4AF37]" : "text-[#0F1A2E]/60"} />
                            <span className="text-[14px] font-medium">{item.label}</span>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
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
          className="lg:hidden fixed inset-0 z-[300] flex items-end justify-center px-3 pb-[72px]"
          style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(15,26,46,0.4)' }}
          onClick={() => setAccountOpen(false)}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 260 }}
            className="w-full max-w-[300px] sm:max-w-[420px] rounded-[24px] bg-white border border-[#D4AF37]/40 shadow-[0_-8px_40px_rgba(15,32,64,0.18)] px-4 sm:px-6 pt-3 pb-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-[3px] bg-[#D4AF37]/40 rounded-full mx-auto mb-4" />

            <div className="px-2 mb-4">
              <div className="flex justify-between items-end border-b border-[#0F1A2E]/15 pb-3">
                <h2 className="text-[20px] font-light text-[#0F1A2E] tracking-tight">
                  My <span className="font-serif italic text-[#0F1A2E]">Account</span>
                </h2>
                <button
                  onClick={() => setAccountOpen(false)}
                  className="text-[12px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>

            <motion.div
              className="space-y-2"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            >
              {accountLinks.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <motion.div
                    key={item.href}
                    variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
                  >
                    <Link
  href={item.href}
  onClick={() => {
    NProgress.start();
    setAccountOpen(false); // ✅ CORRECT
  }}
  className={`flex items-center justify-between rounded-[14px] px-4 py-3 transition-all duration-200 ${
    active
      ? "bg-[#0F1A2E] text-white border border-[#D4AF37]"
      : "bg-[#fafafa] border border-[#EBEBEB] text-[#0F1A2E] hover:border-[#D4AF37]/40"
  }`}
>
                      <div className="flex items-center gap-2.5">
                        <item.icon size={15} className={active ? "text-[#D4AF37]" : "text-[#0F1A2E]/60"} />
                        <span className="text-[14px] font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {active && (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">
                            Viewing
                          </span>
                        )}
                        <div className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[#D4AF37]" : "bg-[#DDDDE8]"}`} />
                      </div>
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
      setAccountOpen={setAccountOpen}
    />

    <style jsx global>{`
      @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      .animate-shimmer {
        background: linear-gradient(90deg, #d4af37, #fff8d4, #d4af37);
        background-size: 200%;
        animation: shimmer 3s infinite linear;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    `}</style>
      </div>
  </>
)}