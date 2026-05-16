'use client';

import { useEffect, useState, useCallback } from 'react';
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
  Users,
  X,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import Image from 'next/image';

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
  maxStorage = 5 * 1024 ** 3,
}: SidebarContentProps) {
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [familyDropdownOpen, setFamilyDropdownOpen] = useState(false);

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

  const toggleSection = (key: string) => {
    setOpenSection(key);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    handleLogout();
  };

  const storagePct = maxStorage > 0
  ? Math.min(100, Math.max(usedStorage > 0 ? 1 : 0, Math.round((usedStorage / maxStorage) * 100)))
  : 0;

  return (
    <>
      <div className="relative flex h-full flex-col overflow-hidden bg-white">

        {/* ─── LOGO ─── */}
        <div className="px-[24px] pt-[28px]">
          <div
            className="font-serif leading-none text-[#111827]"
            style={{ fontSize: '32px', fontWeight: 500, letterSpacing: '-0.03em' }}
          >
            Ancestor<span className="text-[#C8A557]">ii</span>
          </div>
        </div>

        {/* ─── FAMILY ─── */}
        <div className="px-[24px] mt-[28px]">
          <div className="relative">
            <button
              type="button"
              onClick={() => setFamilyDropdownOpen(!familyDropdownOpen)}
              className="flex w-full items-center gap-3"
            >
              <div
  className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#D4AF37]/40 bg-white"
>
  {avatarUrl ? (
  <div className="relative h-full w-full">
    <Image
      src={avatarUrl}
      alt="Avatar"
      fill
      sizes="96px"
      quality={90}
      className="object-cover"
      priority
    />
  </div>
) : (
  <UserIcon className="h-5 w-5 text-[#C8A557]" />
)}
</div>
              <div className="min-w-0 flex-1 text-left">
                <p className="line-clamp-2 text-[16px] leading-tight text-[#111827]" style={{ fontWeight: 600 }}>
                  {familyName}
                </p>
                <p className="mt-1 text-[14px] text-[#6B7280]">
                  {familyMemberCount} {familyMemberCount === 1 ? 'Member' : 'Members'}
                </p>
              </div>
              <ChevronDown
                className="h-4 w-4 flex-shrink-0 text-[#9CA3AF] transition-transform duration-200"
                style={{ transform: familyDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>

            {familyDropdownOpen && (
              <div
                className="absolute left-0 right-0 top-full z-50 mt-2 rounded-[14px] py-1 bg-white"
                style={{ border: '1px solid #E5E7EB', boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}
              >
                <Link
                  href="/dashboard/profile"
                  onClick={() => { setFamilyDropdownOpen(false); closeDrawer(); }}
                  className="flex items-center gap-3 px-[14px] h-[44px] text-[14px] font-medium text-[#374151] hover:bg-[#F9FAFB] rounded-[10px] mx-1 transition-colors duration-[180ms]"
                >
                  <UserIcon className="h-[18px] w-[18px] text-[#9CA3AF]" />
                  My Profile
                </Link>
                <button
                  onClick={() => { setFamilyDropdownOpen(false); setShowLogoutConfirm(true); }}
                  className="flex items-center gap-3 px-[14px] h-[44px] text-[14px] font-medium text-[#DC2626] hover:bg-red-50 rounded-[10px] mx-1 transition-colors duration-[180ms]"
                  style={{ width: 'calc(100% - 8px)' }}
                >
                  <LogOut className="h-[18px] w-[18px]" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── NAVIGATION ─── */}
        <nav className="flex-1 overflow-y-auto px-[12px] pt-[28px] pb-4 sidebar-scroll" data-lenis-prevent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <NavItem href="/dashboard/home" label="Home" Icon={Home} onClick={closeDrawer} />
            <NavItem href="/dashboard/our-family" label="Our Family" Icon={Users} onClick={closeDrawer} />

            {sections.map((section) => {
              const isOpen = openSection === section.key;

              return (
                <div key={section.key} className="pt-[24px]">
                  <button
                    type="button"
                    onClick={() => toggleSection(section.key)}
                    className="mb-[4px] flex w-full items-center justify-between px-[14px] py-1"
                  >
                    <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#C8A557]">
                      {section.title}
                    </span>
                    <ChevronDown
                      className="h-4 w-4 text-[#9CA3AF] transition-transform duration-200"
                      style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                    />
                  </button>

                  <div
                    className="overflow-hidden transition-all duration-250 ease-in-out"
                    style={{
                      maxHeight: isOpen ? `${section.links.length * 52}px` : '0px',
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '2px' }}>
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
        <div className="px-[16px] pb-[20px]">
          <div
            className="rounded-[20px] p-[18px]"
            style={{ background: '#FAFAFA', border: '1px solid #E5E7EB' }}
          >
            <p className="text-[15px] font-semibold text-[#111827]">
              Your Library
            </p>
            <p className="mt-[2px] text-[13px] text-[#6B7280]">
              {totalMemories.toLocaleString()} memories
            </p>

            <div className="mt-[12px] h-[5px] w-full overflow-hidden rounded-full bg-[#E5E7EB]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${storagePct}%`, background: 'linear-gradient(90deg, #C8A557, #D4AF37)' }}
              />
            </div>
            <p className="mt-[8px] text-[13px] text-[#6B7280]">
              {formatBytes(usedStorage)} of {formatBytes(maxStorage)} used
            </p>

            <button
              onClick={() => { closeDrawer(); window.location.href = '/dashboard/plans'; }}
              className="mt-[14px] flex w-full items-center justify-center rounded-[12px] h-[40px] text-[14px] font-semibold transition-all duration-[180ms]"
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #C8A557)',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(196,165,87,0.35)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #C8A557, #B8924A)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(196,165,87,0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #D4AF37, #C8A557)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(196,165,87,0.35)';
              }}
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>

      {/* ─── LOGOUT CONFIRM ─── */}
      {showLogoutConfirm && (
        <div className="absolute inset-0 z-[300] flex items-end justify-center bg-black/20">
          <div className="w-full px-5 pb-5 pt-4 bg-white" style={{ borderTop: '1px solid #E5E7EB' }}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[#111827]">Log out</h3>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#6B7280]"
                style={{ border: '1px solid #E5E7EB' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-4 text-[14px] text-[#6B7280]">Are you sure you want to log out?</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-[12px] h-[44px] text-[14px] font-semibold text-[#374151] bg-white hover:bg-[#F9FAFB] transition-colors duration-[180ms]"
                style={{ border: '1px solid #E5E7EB' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="rounded-[12px] h-[44px] bg-[#DC2626] text-[14px] font-semibold text-white transition hover:bg-[#B91C1C]"
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