'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';
import NotificationBell from '@/components/stories/notifications/NotificationBell';

// ── Palette ────────────────────────────────────────────────────
const GOLD = '#C8A557';
const GOLD_HOVER = '#B8953F';
const INK = '#111827';
const MUTED = '#6B7280';
const BG = '#FFFDF8';
const BORDER = '#F0EDE6';

// ── Icons ──────────────────────────────────────────────────────
const SearchIcon = ({ size = 20, color = MUTED }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const BellIcon = ({ size = 22, color = INK }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const MenuIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round">
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
);

const CloseIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round">
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

const UserIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// ── Component ──────────────────────────────────────────────────
export default function PublicNav() {
  const supabase = getBrowserClient();
  const router = useRouter();
  const pathname = usePathname();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnread, setHasUnread] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchResults, setSearchResults] = useState<{ id: string; title: string; subtitle: string; href: string }[]>([]);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);

  const isDashboard = pathname.startsWith('/dashboard');

  const isLoggedIn = !!userEmail;

  // ── Auth ──
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserEmail(data.user.email ?? null);
        const { data: profile } = await supabase
          .from('Profiles')
          .select('profile_image_url')
          .eq('id', data.user.id)
          .single();
        if (profile?.profile_image_url) {
          const { data: signed } = await supabase.storage
            .from('user-media')
            .createSignedUrl(profile.profile_image_url, 3600);
          if (signed?.signedUrl) setAvatarUrl(`${signed.signedUrl}&cb=${Date.now()}`);
        }
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    setProfileOpen(false);
    router.push('/');
  };

  // ── Scroll shadow ──
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Search click-outside ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Debounced search (context-aware) ──
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setSearchResults([]);
      setSearchDropdownOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      if (isDashboard) {
        const pattern = `%${trimmed}%`;
        const [lovedOnes, timelines, albums, capsules] = await Promise.all([
          supabase.from('family_members').select('id, full_name').ilike('full_name', pattern).limit(5),
          supabase.from('timelines').select('id, title').ilike('title', pattern).limit(5),
          supabase.from('albums').select('id, title').ilike('title', pattern).limit(5),
          supabase.from('memory_capsules').select('id, title').ilike('title', pattern).limit(5),
        ]);
        const combined = [
          ...(lovedOnes.data ?? []).map((r) => ({ id: r.id, title: r.full_name || 'Unnamed', subtitle: 'Loved One', href: `/dashboard/family/${r.id}` })),
          ...(timelines.data ?? []).map((r) => ({ id: r.id, title: r.title || 'Untitled', subtitle: 'Timeline', href: `/dashboard/timeline/${r.id}` })),
          ...(albums.data ?? []).map((r) => ({ id: r.id, title: r.title || 'Untitled', subtitle: 'Album', href: `/dashboard/albums/${r.id}` })),
          ...(capsules.data ?? []).map((r) => ({ id: r.id, title: r.title || 'Untitled', subtitle: 'Capsule', href: `/dashboard/capsules/${r.id}` })),
        ];
        setSearchResults(combined);
        setSearchDropdownOpen(combined.length > 0);
      } else {
        const { data } = await supabase
          .from('stories')
          .select('id, title, slug, author_name')
          .eq('status', 'published')
          .ilike('title', `%${trimmed}%`)
          .limit(6);
        const hits = (data ?? []).map((s) => ({ id: s.id, title: s.title, subtitle: s.author_name, href: `/stories/${s.slug}` }));
        setSearchResults(hits);
        setSearchDropdownOpen(hits.length > 0);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, supabase, isDashboard]);

  // ── Search autofocus ──
  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  // ── Click-outside for profile dropdown ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Lock body scroll on mobile menu ──
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const navLinks = isLoggedIn
    ? [
        { href: '/', label: 'Our Stories' },
        { href: '/dashboard/home', label: 'My Family' },
      ]
    : [
        { href: '/', label: 'Our Stories' },
        { href: '/how-it-works', label: 'How It Works' },
        { href: '/why-this-exists', label: 'Our Roots' },
        { href: '/login', label: 'My Family' },
      ];

  return (
    <>
      <style>{`

        /* ── Root ── */
        .pn-root {
          position: sticky;
          top: 0;
          z-index: 100;
          background: ${BG};
          font-family: 'DM Sans', sans-serif;
          transition: box-shadow 0.3s ease;
        }
        .pn-root.scrolled {
          box-shadow: 0 1px 24px rgba(0,0,0,0.04);
        }

        .pn-inner {
          width: 100%;
          max-width: 1800px;
          margin: 0 auto;
          /* Fluid padding: 20px on mobile → 80px on ultrawide */
          padding: 0 clamp(20px, 4vw, 80px);
          /* Fluid height: 64px on mobile → 88px on large */
          height: clamp(64px, 6vw, 88px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: clamp(16px, 3vw, 48px);
        }

        /* ── Logo ── */
        .pn-logo {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700;
          /* Fluid: 28px on mobile → 42px on large */
          font-size: clamp(28px, 2.6vw, 42px);
          letter-spacing: -0.03em;
          color: ${INK};
          text-decoration: none;
          line-height: 1;
          flex-shrink: 0;
          user-select: none;
        }
        .pn-logo-accent { color: ${GOLD}; }

        /* ── Nav links ── */
        .pn-links {
          display: flex;
          align-items: center;
          gap: clamp(28px, 3.5vw, 56px);
        }
        .pn-link {
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          /* Fluid: 16px → 20px */
          font-size: clamp(16px, 1.2vw, 20px);
          letter-spacing: 0.02em;
          color: ${MUTED};
          text-decoration: none;
          position: relative;
          padding: 4px 0;
          transition: color 0.2s ease;
          white-space: nowrap;
        }
        .pn-link:hover, .pn-link.active {
          color: ${INK};
        }
        .pn-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1.5px;
          background: ${GOLD};
          transition: width 0.3s ease;
        }
        .pn-link:hover::after, .pn-link.active::after {
          width: 100%;
        }

        /* ── Search ── */
        .pn-search-bar {
          position: relative;
          display: flex;
          align-items: center;
        }
        .pn-search-trigger {
          display: flex;
          align-items: center;
          justify-content: center;
          width: clamp(38px, 3vw, 44px);
          height: clamp(38px, 3vw, 44px);
          border-radius: 50%;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: background 0.2s;
        }
        .pn-search-trigger:hover {
          background: rgba(0,0,0,0.04);
        }
        .pn-search-wrap {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          background: #fff;
          border: 1px solid ${BORDER};
          border-radius: 100px;
          overflow: hidden;
          width: 0;
          opacity: 0;
          transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
          pointer-events: none;
        }
        .pn-search-wrap.open {
          width: clamp(220px, 20vw, 320px);
          opacity: 1;
          pointer-events: all;
          border-color: ${GOLD};
        }
        .pn-search-input {
          width: 100%;
          padding: 10px 16px 10px 14px;
          border: none;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(13px, 1vw, 15px);
          color: ${INK};
          background: transparent;
        }
        .pn-search-input::placeholder { color: #B0ADA6; }
        .pn-search-icon-in {
          flex-shrink: 0;
          padding-right: 12px;
          display: flex;
        }
          .pn-search-results {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: clamp(280px, 24vw, 380px);
          background: #fff;
          border: 1px solid #D4D0C8;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.12);
          padding: 6px;
          max-height: 320px;
          overflow-y: auto;
          z-index: 50;
        }
        .pn-search-result {
          display: flex;
          flex-direction: column;
          width: 100%;
          text-align: left;
          padding: 10px 14px;
          border: none;
          background: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .pn-search-result:hover { background: #F7F5F0; }
        .pn-result-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: ${INK};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pn-result-author {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: ${MUTED};
          margin-top: 2px;
        }

        /* ── Bell ── */
        .pn-bell {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: clamp(38px, 3vw, 44px);
          height: clamp(38px, 3vw, 44px);
          border-radius: 50%;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: background 0.2s;
        }
        .pn-bell:hover { background: rgba(0,0,0,0.04); }
        .pn-bell-dot {
          position: absolute;
          top: 7px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: #E25C5C;
          border-radius: 50%;
          border: 2px solid ${BG};
        }

        /* ── Profile ── */
        .pn-profile-btn {
          width: clamp(40px, 3vw, 48px);
          height: clamp(40px, 3vw, 48px);
          border-radius: 50%;
          overflow: hidden;
          border: 1.5px solid ${BORDER};
          background: #F7F5F0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
          color: ${MUTED};
          flex-shrink: 0;
        }
        .pn-profile-btn:hover {
          border-color: ${GOLD};
          box-shadow: 0 0 0 3px rgba(200,165,87,0.1);
        }
          .pn-avatar-img {
          object-fit: cover;
          border-radius: 50%;
        }
        .pn-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          min-width: 210px;
          background: #fff;
          border: 1px solid #D4D0C8;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.12), 0 24px 48px rgba(0,0,0,0.08);
          padding: 6px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-4px);
          transition: all 0.2s ease;
        }
        .pn-dropdown.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .pn-dropdown a,
        .pn-dropdown button {
          display: block;
          width: 100%;
          text-align: left;
          padding: 10px 14px;
          border: none;
          background: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: ${INK};
          text-decoration: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .pn-dropdown a:hover,
        .pn-dropdown button:hover {
          background: #F7F5F0;
        }
        .pn-dropdown .pn-logout { color: #DC2626; }
        .pn-dropdown .pn-logout:hover { background: #FEF2F2; }
        .pn-divider {
          height: 1px;
          background: ${BORDER};
          margin: 4px 8px;
        }

        /* ── Right-side groups ── */
        .pn-actions {
          display: flex;
          align-items: center;
          gap: clamp(2px, 0.5vw, 6px);
        }
        .pn-auth {
          display: flex;
          align-items: center;
          gap: clamp(12px, 1.5vw, 24px);
          flex-shrink: 0;
        }
        .pn-btn-login {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
          font-size: clamp(15px, 1.1vw, 18px);
          color: ${INK};
          text-decoration: none;
          padding: 8px 4px;
          transition: color 0.2s;
        }
        .pn-btn-login:hover { color: ${GOLD_HOVER}; }
        .pn-btn-signup {
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: clamp(13px, 1vw, 15px);
          letter-spacing: 0.01em;
          color: ${INK};
          background: ${GOLD};
          border: none;
          padding: clamp(10px, 0.8vw, 14px) clamp(20px, 1.8vw, 32px);
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s;
        }
        .pn-btn-signup:hover {
          background: ${GOLD_HOVER};
          transform: translateY(-1px);
        }
        .pn-btn-signup:active { transform: translateY(0); }

        /* ── Bottom rules ── */
        .pn-rule {
          height: 1px;
          background: ${BORDER};
          transition: background 0.3s;
        }
        .pn-root.scrolled .pn-rule { background: transparent; }
        .pn-gold-line {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, ${GOLD} 30%, ${GOLD} 70%, transparent 100%);
          opacity: 0.35;
        }

        /* ── Mobile drawer ── */
        .pn-overlay {
          position: fixed;
          inset: 0;
          z-index: 250;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .pn-overlay.open { pointer-events: all; opacity: 1; }
        .pn-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.2);
          backdrop-filter: blur(4px);
        }
        .pn-drawer {
          position: absolute;
          top: 0;
          right: 0;
          width: min(340px, 85vw);
          height: 100%;
          background: ${BG};
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          padding: 28px;
        }
        .pn-overlay.open .pn-drawer { transform: translateX(0); }
        .pn-drawer-close {
          align-self: flex-end;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          margin-bottom: 32px;
        }
        .pn-drawer-link {
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 18px;
          color: ${MUTED};
          text-decoration: none;
          padding: 14px 0;
          display: block;
          transition: color 0.2s;
          border-bottom: 1px solid ${BORDER};
        }
        .pn-drawer-link:hover, .pn-drawer-link.active { color: ${INK}; }
        .pn-drawer-auth {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 28px;
        }
        .pn-drawer-login {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: ${INK};
          text-decoration: none;
          text-align: center;
          padding: 14px;
          border: 1px solid ${BORDER};
        }
        .pn-drawer-signup {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: ${INK};
          text-decoration: none;
          text-align: center;
          padding: 14px;
          background: ${GOLD};
        }
        .pn-drawer-logout {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: #C25550;
          background: none;
          border: 1px solid #E8D5D4;
          padding: 14px;
          cursor: pointer;
          text-align: center;
        }
        .pn-drawer-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 0 24px;
          border-bottom: 1px solid ${BORDER};
          margin-bottom: 8px;
        }
        .pn-drawer-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          overflow: hidden;
          background: #F7F5F0;
          border: 1.5px solid ${BORDER};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${MUTED};
        }
        .pn-drawer-info { flex: 1; min-width: 0; }
        .pn-drawer-name {
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 15px;
          color: ${INK};
        }
        .pn-drawer-email {
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          color: ${MUTED};
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ── Responsive breakpoint ── */
        @media (max-width: 768px) {
          .pn-links, .pn-actions, .pn-auth { display: none !important; }
        }
        @media (min-width: 769px) {
          .pn-mobile-toggle { display: none !important; }
        }
      `}</style>

      <div className={`pn-root ${scrolled ? 'scrolled' : ''}`}>
        <div className="pn-inner">

          {/* Logo */}
          <Link href="/" className="pn-logo">
            Ancestor<span className="pn-logo-accent">ii</span>
          </Link>

          {/* Centre links */}
          <nav className="pn-links">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`pn-link ${
  link.href === '/'
    ? pathname === '/' || pathname.startsWith('/stories')
      ? 'active'
      : ''
    : link.href.startsWith('/dashboard')
      ? pathname.startsWith('/dashboard')
        ? 'active'
        : ''
      : pathname === link.href
        ? 'active'
        : ''
}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right — logged in */}
          {isLoggedIn && (
            <div className="pn-actions">
             {/* Search */}
              <div className="pn-search-bar" ref={searchWrapperRef}>
                <div className={`pn-search-wrap ${searchOpen ? 'open' : ''}`}>
                  <input
                    ref={searchRef}
                    className="pn-search-input"
                    type="text"
                    placeholder={isDashboard ? "Search memories, people..." : "Search stories..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if (searchResults.length > 0) setSearchDropdownOpen(true); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') { setSearchQuery(''); setSearchOpen(false); setSearchDropdownOpen(false); }
                      if (e.key === 'Enter' && searchQuery.trim() && !isDashboard) {
                        if (searchResults.length > 0) {
                          router.push(searchResults[0].href);
                        }
                        setSearchOpen(false);
                        setSearchQuery('');
                        setSearchDropdownOpen(false);
                      }
                    }}
                  />
                  <div className="pn-search-icon-in">
                    <SearchIcon size={15} color="#B0ADA6" />
                  </div>
                </div>
                {!searchOpen && (
                  <button className="pn-search-trigger" onClick={() => setSearchOpen(true)} aria-label="Search">
                    <SearchIcon />
                  </button>
                )}
                {searchDropdownOpen && (
                  <div className="pn-search-results">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        className="pn-search-result"
                        onClick={() => {
                          router.push(result.href);
                          setSearchQuery('');
                          setSearchOpen(false);
                          setSearchDropdownOpen(false);
                        }}
                      >
                        <span className="pn-result-title">{result.title}</span>
                        <span className="pn-result-author">{result.subtitle}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bell */}
              <NotificationBell />

              {/* Profile */}
              <div style={{ position: 'relative' }} ref={profileRef}>
               <button className="pn-profile-btn" onClick={() => setProfileOpen(!profileOpen)} aria-label="Profile menu">
                  {avatarUrl ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <Image src={avatarUrl} alt="" fill sizes="96px" quality={90} className="pn-avatar-img" priority />
                    </div>
                  ) : (
                    <UserIcon />
                  )}
                </button>
                <div className={`pn-dropdown ${profileOpen ? 'open' : ''}`}>
                  <Link href="/dashboard/profile" onClick={() => setProfileOpen(false)}>My Profile</Link>
                  <Link href="/dashboard/plans" onClick={() => setProfileOpen(false)}>Plans</Link>
                  <div className="pn-divider" />
                  <button className="pn-logout" onClick={handleLogout}>Log Out</button>
                </div>
              </div>
            </div>
          )}

          {/* Right — logged out */}
          {!isLoggedIn && (
            <div className="pn-auth">
              <Link href="/login" className="pn-btn-login">Log In</Link>
              <Link href="/signup" className="pn-btn-signup">Start For Free</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="pn-mobile-toggle"
            onClick={() => setIsOpen(true)}
            aria-label="Menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <MenuIcon />
          </button>
        </div>

        <div className="pn-rule" />
        <div className="pn-gold-line" />
      </div>

      {/* Mobile drawer */}
      <div className={`pn-overlay ${isOpen ? 'open' : ''}`}>
        <div className="pn-backdrop" onClick={() => setIsOpen(false)} />
        <div className="pn-drawer">
          <button className="pn-drawer-close" onClick={() => setIsOpen(false)} aria-label="Close menu">
            <CloseIcon />
          </button>

          {isLoggedIn && (
            <div className="pn-drawer-profile">
              <div className="pn-drawer-avatar">
                {avatarUrl ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Image src={avatarUrl} alt="" fill sizes="96px" quality={90} className="pn-avatar-img" priority />
                  </div>
                ) : (
                  <UserIcon size={20} />
                )}
              </div>
              <div className="pn-drawer-info">
                <div className="pn-drawer-name">My Account</div>
                <div className="pn-drawer-email">{userEmail}</div>
              </div>
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`pn-drawer-link ${
  link.href === '/'
    ? pathname === '/' || pathname.startsWith('/stories')
      ? 'active'
      : ''
    : link.href.startsWith('/dashboard')
      ? pathname.startsWith('/dashboard')
        ? 'active'
        : ''
      : pathname === link.href
        ? 'active'
        : ''
}`}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="pn-drawer-auth">
            {isLoggedIn ? (
              <button className="pn-drawer-logout" onClick={() => { handleLogout(); setIsOpen(false); }}>
                Log Out
              </button>
            ) : (
              <>
                <Link href="/login" className="pn-drawer-login" onClick={() => setIsOpen(false)}>Log In</Link>
                <Link href="/signup" className="pn-drawer-signup" onClick={() => setIsOpen(false)}>Start For Free</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}