'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  memoriesLinks,
  heirloomsLinks,
  accountLinks,
} from '@/lib/dashboardNavigation';
import NavItem from '@/components/dashboard/NavItem';
import {
  Home,
  User as UserIcon,
  X,
  ChevronDown,
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
};

const sections = [
  { key: 'memories', title: 'My Memories', links: memoriesLinks },
  { key: 'heirlooms', title: 'My Heirlooms', links: heirloomsLinks },
  { key: 'account', title: 'My Account', links: accountLinks },
];

export default function SidebarContent({
  closeDrawer,
  collapsed,
  setCollapsed,
  fullName,
  userEmail,
  avatarUrl,
  planName,
  handleLogout,
}: SidebarContentProps) {
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  /* ── Determine which section owns the current route ── */
  const getActiveSection = useCallback(() => {
    for (const section of sections) {
      if (
        section.links.some(
          (link) =>
            pathname === link.href || pathname.startsWith(link.href + '/')
        )
      ) {
        return section.key;
      }
    }
    return 'memories';
  }, [pathname]);

  const [openSection, setOpenSection] = useState<string>(getActiveSection());

  /* ── Auto-open the section containing the current page ── */
  useEffect(() => {
    setOpenSection(getActiveSection());
  }, [getActiveSection]);

  const toggleSection = (key: string) => {
    setOpenSection(key);
  };

  /* ── Display name logic ── */
  const cleanFullName = fullName?.trim() || '';
  const firstName = cleanFullName.split(' ')[0] || '';
  const fallbackName = userEmail?.split('@')[0] || 'Guest';

  const displayName = cleanFullName
    ? cleanFullName.length > 15
      ? firstName
      : cleanFullName
    : fallbackName;

  const userPlan =
    planName && planName.trim().length > 0
      ? `${planName} Plan`
      : 'Free Plan';

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    handleLogout();
  };

  return (
    <>
      <div
        className="relative flex h-full flex-col overflow-hidden border-r border-[#e7dfd1] text-[#1f2937]"
        style={{
          background: `
            radial-gradient(circle at top left, rgba(212,175,55,0.08), transparent 28%),
            radial-gradient(circle at bottom right, rgba(212,175,55,0.05), transparent 34%),
            linear-gradient(180deg, #fcfbf8 0%, #f7f3ec 100%)
          `,
        }}
      >
        {/* TOP BAR */}
        <div className="border-b border-[#d4af37] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[1.8rem] font-serif text-[#1a1410]">
                Ancestor<span className="text-[#b8924a]">ii</span>
              </div>
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-4">
            <NavItem
              href="/dashboard/home"
              label="Home"
              Icon={Home}
              onClick={closeDrawer}
            />

            {sections.map((section) => {
              const isOpen = openSection === section.key;

              return (
                <section key={section.key}>
                  {/* ── Collapsible header ── */}
                  <button
                    type="button"
                    onClick={() => toggleSection(section.key)}
                    className="mb-1 flex w-full items-center justify-between px-2 py-1.5 transition-colors hover:bg-white/50 rounded-md"
                  >
                    <span className="text-[17px] font-semibold tracking-[0.01em] text-[#d4af37]">
                      {section.title}
                    </span>
                    <ChevronDown
                      className="h-4 w-4 text-[#d4af37] transition-transform duration-200"
                      style={{
                        transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      }}
                    />
                  </button>

                  {/* ── Collapsible content ── */}
                  <div
                    className="overflow-hidden transition-all duration-250 ease-in-out"
                    style={{
                      maxHeight: isOpen ? `${section.links.length * 52}px` : '0px',
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="space-y-1 pt-1">
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
                </section>
              );
            })}
          </div>
        </nav>

        {/* PROFILE */}
        <div className="border-t border-[#d4af37] px-4 py-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden border border-[#ded4bf] bg-[#f3f4f6]">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserIcon className="h-5 w-5 text-[#6b7280]" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="mt-1 truncate text-[15px] font-semibold text-[#1f2937]">
                {displayName}
              </p>
              <p className="mt-0.5 text-[13px] font-medium text-[#8a6a2f]">
                {userPlan}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href="/dashboard/profile"
              onClick={closeDrawer}
              className="
                flex items-center justify-center
                bg-[#d4af37] px-4 py-2.5
                text-[13px] font-semibold text-[#1b2430]
                transition hover:bg-[#cda428]
              "
            >
              Profile
            </Link>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="
                flex items-center justify-center
                bg-[#b42318] px-4 py-2.5
                text-[13px] font-semibold text-[#FFFFFF]
                transition hover:bg-[#9f1f15]
              "
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="absolute inset-0 z-[300] flex items-end justify-center bg-black/30">
          <div className="w-full border-t border-[#d4af37] bg-[#fcfbf8] px-5 pb-5 pt-4 shadow-[0_-10px_30px_rgba(0,0,0,0.12)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-[#1a1410]">
                Log out
              </h3>

              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex h-9 w-9 items-center justify-center border border-[#e7dfd1] bg-white text-[#1f2937]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-5 text-[12px] text-[#5b6472]">
              Are you sure you want to log out?
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="
                  flex items-center justify-center
                  border border-[#ded4bf] bg-white px-4 py-3
                  text-[13px] font-semibold text-[#1f2937]
                  transition hover:bg-[#f7f3ec]
                "
              >
                Cancel
              </button>

              <button
                onClick={confirmLogout}
                className="
                  flex items-center justify-center
                  bg-[#b42318] px-4 py-3
                  text-[13px] font-semibold text-white
                  transition hover:bg-[#9f1f15]
                "
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}