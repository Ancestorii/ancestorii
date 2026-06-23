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

  const toggleSection = (key: string) => {
    setOpenSection(key);
  };

  const storagePct = maxStorage > 0
  ? Math.min(100, Math.max(usedStorage > 0 ? 1 : 0, Math.round((usedStorage / maxStorage) * 100)))
  : 0;

  return (
    <>
      <div className="relative flex h-full flex-col overflow-hidden bg-white">

       {/* ─── TOP SPACER ─── */}
        <div className="pt-[16px]" />

        {/* ─── NAVIGATION ─── */}
        <nav className="flex-1 overflow-y-auto px-[12px] pt-[28px] pb-4 sidebar-scroll" data-lenis-prevent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <NavItem href="/dashboard/our-family" label="My Family" Icon={Users} onClick={closeDrawer} />

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

            {planName === 'Premium' ? (
              <button
                onClick={() => { closeDrawer(); window.location.href = '/dashboard/plans'; }}
                className="mt-[14px] flex w-full items-center justify-center rounded-[12px] h-[40px] text-[14px] font-semibold transition-all duration-[180ms] text-[#8F7A2A] hover:bg-[#F0EDE6]"
                style={{
                  background: '#F7F5F0',
                  border: '1px solid #E7D9AF',
                }}
              >
                Premium Plan
              </button>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}