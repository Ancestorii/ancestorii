'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  Calendar,
  Home,
  Package,
  Image,
  Megaphone,
  CreditCard,
  HelpCircle,
  Settings,
  Menu,
  X,
  User as UserIcon,
  Heart,
  Lock,
  HandHeart,
  User
} from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import NotificationBell from './_components/NotificationBell';

const supabase = getBrowserClient();


/* ---------- Sidebar Nav Item ---------- */
function NavItem({
  href,
  label,
  Icon,
  onClick,
  badge,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  badge?: string;
}) {
  const pathname = usePathname();
  const active =
    href === '/dashboard/home'
      ? pathname === '/dashboard' || pathname === '/dashboard/home'
      : pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative flex items-center justify-between group px-5 py-3 rounded-xl transition-colors duration-300 ease-out ${
        active
          ? 'text-[#D4AF37] font-semibold bg-[#D4AF37]/15'
          : 'text-white/85 hover:text-[#D4AF37]'
      }`}
    >
      {/* ✨ Gold Accent Bar (GPU-accelerated pseudo-element) */}
      <span
        className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-[#D4AF37] transition-transform duration-300 ease-out origin-left ${
          active ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
        } group-hover:scale-y-100 group-hover:opacity-70`}
      />

      <div className="flex items-center gap-4 transition-transform duration-300 group-hover:scale-[1.02]">
        <Icon
          className={`h-5 w-5 transition-colors duration-300 ${
            active ? 'text-[#D4AF37]' : 'group-hover:text-[#D4AF37]'
          }`}
        />
        <span className="text-[14px] font-medium">{label}</span>
      </div>

      {badge && (
        <span className="text-[10px] font-semibold text-[#0F2040] bg-[#D4AF37]/85 px-2 py-[2px] rounded-full uppercase tracking-wider shadow-sm flex items-center justify-center leading-tight">
          {badge}
        </span>
      )}
    </Link>
  );
}

/* ---------- Layout ---------- */
export default function DashboardClientLayout({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const router = useRouter();

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


  /* Hydration fix */
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user || user.email_confirmed_at) return;

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
    const { data: prof } = await supabase
      .from('Profiles')
      .select('username, profile_image_url')
      .eq('id', userId)
      .maybeSingle();

    setUsername(prof?.username ?? null);

    if (prof?.profile_image_url) {
      const { data } = await supabase.storage
        .from('user-media')
        .createSignedUrl(prof.profile_image_url, 3600); // 1 hour
      // Force change so React re-renders (cache-bust)
setAvatarUrl(data?.signedUrl ? `${data.signedUrl}&cb=${Date.now()}` : null);
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
  if (!userId) return;

  // Fetch immediately when layout loads
  fetchProfile();

  // Refresh avatar + username every 5 min
  const interval = setInterval(fetchProfile, 5 * 60 * 1000);

  // Cleanup
  return () => clearInterval(interval);
}, [userId]);
  

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    setUserId(null);
    setAvatarUrl(null);
    setUsername(null);
    router.push('/');
  };

  if (!hydrated) return null;

  /* ---------- Sidebar Content ---------- */
  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between overflow-y-auto">
      <div className="px-3 pt-2 sm:pt-4 md:pt-8 lg:pt-12 space-y-8">
        <div className="space-y-2">
          <NavItem
           href="/dashboard/home"
           label="Home"
           Icon={Home}
           onClick={() => {
           if (window.innerWidth < 1024) setDrawerOpen(false);
           }}
           />
          <NavItem
            href="/dashboard/profile"
            label="My Profile"
            Icon={User}
            onClick={() => {
              if (window.innerWidth < 1024) setDrawerOpen(false);
            }}
          />
          <NavItem
          href="/dashboard/family"
          label="My Loved Ones"
          Icon={HandHeart}
          onClick={() => {
             if (window.innerWidth < 1024) setDrawerOpen(false);
            }}
          />
            <NavItem
            href="/dashboard/timeline"
            label="Timelines"
            Icon={Calendar}
            onClick={() => {
              if (window.innerWidth < 1024) setDrawerOpen(false);
            }}
          />
          <NavItem
            href="/dashboard/capsules"
            label="Capsules"
            Icon={Package}
            onClick={() => {
              if (window.innerWidth < 1024) setDrawerOpen(false);
            }}
          />
          <NavItem
            href="/dashboard/albums"
            label="Albums"
            Icon={Image}
            onClick={() => {
              if (window.innerWidth < 1024) setDrawerOpen(false);
            }}
          />
        </div>

        <div className="border-t border-white/20 my-3" />

        <div className="space-y-2">
          <NavItem
            href="/dashboard/plans"
            label="Plans"
            Icon={CreditCard}
            onClick={() => {
              if (window.innerWidth < 1024) setDrawerOpen(false);
            }}
          />
          <NavItem
            href="/dashboard/updates"
            label="Updates"
            Icon={Megaphone}
            onClick={() => {
              if (window.innerWidth < 1024) setDrawerOpen(false);
            }}
          />
        </div>

        <div className="border-t border-white/20 my-3" />

        <div className="space-y-2 mb-6">
          <NavItem
            href="/dashboard/help"
            label="Help"
            Icon={HelpCircle}
            onClick={() => {
              if (window.innerWidth < 1024) setDrawerOpen(false);
            }}
          />
          <NavItem
            href="/dashboard/settings"
            label="Settings"
            Icon={Settings}
            onClick={() => {
              if (window.innerWidth < 1024) setDrawerOpen(false);
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="antialiased bg-white text-gray-900" suppressHydrationWarning>
      {/* 🌟 Topbar */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-gradient-to-r from-white/90 to-[#F7F8FA]/90 backdrop-blur-md shadow-[0_4px_20px_rgba(15,32,64,0.1)]'
            : 'bg-gradient-to-r from-white to-[#F7F8FA] shadow-[0_2px_12px_rgba(15,32,64,0.06)]'
        } rounded-b-2xl border-b border-[#D4AF37]/20`}
      >
        <nav className="relative px-4 sm:px-6 md:px-10 py-2 md:py-4">
          <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-2xl">
            <Link href="/dashboard/home" className="flex items-center">
              <img
                src="/logo1.png"
                className="mr-3 h-11 md:h-14 lg:h-[3.8rem]"
                alt="Ancestorii Logo"
              />
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              <NotificationBell />
              <span className="text-2xl font-bold text-[#0F2040] tracking-wide">
                Hi,{' '}
                <span className="text-[#D4AF37] font-extrabold bg-clip-text hover:animate-shimmer transition">
                  {username || userEmail || 'Guest'}
                </span>
              </span>

              <Link
                href="/dashboard/home"
                className="h-12 w-12 rounded-full overflow-hidden border-2 border-[#D4AF37]/40 flex items-center justify-center bg-white hover:shadow-[0_0_12px_rgba(212,175,55,0.4)] hover:scale-105 transition-all duration-300"
                title="Home"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-6 w-6 text-[#0F2040]" />
                )}
              </Link>

              <div className="pl-5 border-l border-gray-300">
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 shadow-sm hover:shadow-[0_0_12px_rgba(255,0,0,0.3)] transition-all"
                >
                  Logout
                </button>
              </div>
            </div>

            <button
              className="lg:hidden p-2 text-[#0F2040] rounded-md hover:bg-[#D4AF37]/10"
              onClick={() => setDrawerOpen(!drawerOpen)}
              aria-label="Toggle menu"
            >
              {drawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/80 to-transparent" />
        </nav>
      </header>

      {/* ---------- Sidebar ---------- */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-24 bg-gradient-to-br from-[#0F2040] to-[#182C54] shadow-[4px_0_25px_rgba(15,32,64,0.25)] rounded-r-3xl transform transition-transform duration-500 ease-in-out overflow-y-auto ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <SidebarContent />
      </aside>

      <main className="pt-20 md:pt-28 px-4 md:px-8 md:ml-64 transition-all duration-300">
        {children}
      </main>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
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
  );
}
