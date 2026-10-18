'use client';

import { useEffect, useRef, useState, useCallback, type CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  memoriesLinks,
  heirloomsLinks,
  accountLinks,
} from '@/lib/dashboardNavigation';
import NavItem from '@/components/dashboard/NavItem';
import { ui, btnClass } from '@/components/dashboard/ui/AppBits';
import {
  User as UserIcon,
  Users,
  X,
  ChevronDown,
  LogOut,
} from 'lucide-react';

type SidebarContentProps = {
  closeDrawer: () => void;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  fullName?: string | null;
  userEmail?: string | null;
  avatarUrl?: string | null;
  planName?: string | null;
  handleLogout: () => void;
  familyName?: string;
  familyMemberCount?: number;
  totalMemories?: number;
  usedStorage?: number;
  maxStorage?: number;
};

const sections = [
  { key: 'memories', title: 'My Memories', links: memoriesLinks },
  { key: 'heirlooms', title: 'My Heirlooms', links: heirloomsLinks },
  { key: 'account', title: 'My Account', links: accountLinks },
];

// Each section's round dot. Heirlooms take orange, as "Memory Books and prints" does in the
// landing's feature index; the account pages take blue.
const SECTION_DOT: Record<string, string> = {
  memories: 'var(--c0)',
  heirlooms: 'var(--c2)',
  account: 'var(--c1)',
};

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return '0 MB';
  const mb = bytes / 1024 ** 2;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

export default function SidebarContent({
  closeDrawer,
  collapsed,
  setCollapsed,
  fullName,
  userEmail,
  avatarUrl,
  planName,
  handleLogout,
  familyName = 'My Family',
  familyMemberCount = 1,
  totalMemories = 0,
  usedStorage = 0,
  maxStorage = 1 * 1024 ** 3,
}: SidebarContentProps) {
  const pathname = usePathname();

  const getActiveSection = useCallback(() => {
    for (const section of sections) {
      if (section.links.some((link) => pathname === link.href || pathname.startsWith(link.href + '/'))) {
        return section.key;
      }
    }
    return 'memories';
  }, [pathname]);

  const [openSection, setOpenSection] = useState<string>(getActiveSection());

  useEffect(() => {
    setOpenSection(getActiveSection());
  }, [getActiveSection]);

  // Short screens (a 1366x768 laptop): the links scroll above the Library card, and the page you
  // are on could sit in the fade at the foot or below it. Bring its link into view, clear of the
  // fade. Its place in the nav is the sum of offsetTops up to the nav (while a section's reveal
  // animation runs, Chrome makes the sliding wrapper the offsetParent; offsets ignore the slide).
  // Once per page: opening another section by hand never scrolls the nav back.
  const navRef = useRef<HTMLElement>(null);
  const shownFor = useRef<string | null>(null);
  useEffect(() => {
    if (shownFor.current === pathname) return;
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLElement>('a[aria-current="page"]');
    if (!nav || !link || !link.offsetHeight) return; // its section opens on the next render
    shownFor.current = pathname;
    let top = 0;
    let el: HTMLElement | null = link;
    while (el && el !== nav) {
      top += el.offsetTop;
      el = el.offsetParent as HTMLElement | null;
    }
    if (el !== nav) return;
    const FADE = 24;
    const bottom = top + link.offsetHeight;
    if (bottom > nav.scrollTop + nav.clientHeight - FADE) nav.scrollTop = bottom - nav.clientHeight + FADE;
    else if (top < nav.scrollTop) nav.scrollTop = Math.max(0, top - 24); // the nav's own top padding
  }, [pathname, openSection]);

  const toggleSection = (key: string) => {
    setOpenSection(key);
  };

  const storagePct = maxStorage > 0
  ? Math.min(100, Math.max(usedStorage > 0 ? 1 : 0, Math.round((usedStorage / maxStorage) * 100)))
  : 0;

  return (
    <>
      <div className="relative flex h-full flex-col overflow-hidden bg-white">

        {/* ─── NAVIGATION ─── */}
        {/* On short screens the links scroll above the Library card; the last 24px fade out. */}
        <nav
          ref={navRef}
          aria-label="Dashboard"
          className="sidebar-scroll relative flex-1 overflow-y-auto px-[12px] pb-6 pt-6 [mask-image:linear-gradient(to_bottom,#000_calc(100%-24px),transparent)]"
        >
          <div className="flex flex-col gap-1">
            <NavItem href="/dashboard/our-family" label="My Family" Icon={Users} onClick={closeDrawer} />

            {sections.map((section) => {
              const isOpen = openSection === section.key;

              return (
                <div key={section.key} className="pt-4">
                  <button
                    type="button"
                    onClick={() => toggleSection(section.key)}
                    aria-expanded={isOpen}
                    aria-controls={`sidebar-section-${section.key}`}
                    className="mb-1 flex min-h-[44px] w-full items-center justify-between rounded-[12px] px-[14px] text-[var(--ink)] transition-colors duration-150 hover:bg-[var(--hover)]"
                  >
                    <span
                      className={ui.tag}
                      style={{ '--dot': SECTION_DOT[section.key] } as CSSProperties}
                    >
                      {section.title}
                    </span>
                    <ChevronDown
                      className="h-4 w-4 transition-transform duration-200"
                      strokeWidth={2.6}
                      style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Shown only when open, so closed sections' links stay out of the tab order */}
                  <div
                    id={`sidebar-section-${section.key}`}
                    hidden={!isOpen}
                    className="sidebar-reveal"
                  >
                    <div className="flex flex-col gap-1 pt-0.5">
                      {section.links.map((item) => (
                        <NavItem
                          key={item.href}
                          href={item.href}
                          label={item.label}
                          Icon={item.icon}
                          onClick={closeDrawer}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        {/* ─── YOUR LIBRARY ─── */}
        <div className="px-[16px] pb-[20px] pt-2">
          <div className={ui.card}>
            <p className="text-[15px] font-extrabold leading-tight tracking-[-0.02em]">
              Your Library
            </p>
            <p className="mt-1 text-[13px] font-semibold">
              {totalMemories.toLocaleString()} memories
            </p>

            <div
              className={`${ui.progress} mt-3`}
              role="progressbar"
              aria-label="Storage used"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={storagePct}
            >
              <div className={ui.progressFill} style={{ width: `${storagePct}%` }} />
            </div>
            <p className="mt-2 text-[13px] font-semibold">
              {formatBytes(usedStorage)} of {formatBytes(maxStorage)} used
            </p>

            {/* 44px tall: tablets in landscape show this sidebar, and they are touch screens.
                Until the plan is known, a quiet placeholder holds the button's place. */}
            {!planName ? (
              <div className={`${ui.skeleton} mt-4`} style={{ height: 44, borderRadius: 12 }} aria-hidden="true" />
            ) : planName === 'Premium' ? (
              <button
                onClick={() => { closeDrawer(); window.location.href = '/dashboard/plans'; }}
                className={btnClass({ variant: 'soft', size: 'sm', block: true, className: 'mt-4' })}
                style={{ minHeight: 44 }}
              >
                <span className="h-2 w-2 flex-none rounded-full bg-[var(--c3)]" aria-hidden="true" />
                Premium Plan
              </button>
            ) : (
              <button
                onClick={() => { closeDrawer(); window.location.href = '/dashboard/plans'; }}
                className={btnClass({ variant: 'primary', size: 'sm', block: true, className: 'mt-4' })}
                style={{ minHeight: 44 }}
              >
                Upgrade Plan
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
