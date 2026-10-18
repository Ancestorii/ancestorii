'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Menu, Search as SearchIcon, User as UserIcon, X } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import NotificationBell from '@/components/stories/notifications/NotificationBell';
import { Logo } from '@/components/landing/LandingBits';
import { ui, useDialog } from '@/components/dashboard/ui/AppBits';
import css from './publicNav.module.css';

// Round dots for menu rows, in the landing's order: pink, blue, orange, aqua.
const DOTS = ['var(--c0)', 'var(--c1)', 'var(--c2)', 'var(--c3)'];

// Each kind of search result takes its feature's colour, as on its page's eyebrow: Loved Ones
// and Timelines aqua, Albums orange, Capsules pink.
const RESULT_DOT: Record<string, string> = {
  'Loved One': 'var(--c3)',
  Timeline: 'var(--c3)',
  Album: 'var(--c2)',
  Capsule: 'var(--c0)',
};

// The menu panel's links in their feature colours (Our Stories aqua, My Family pink).
const LINK_DOT: Record<string, string> = {
  'Our Stories': 'var(--c3)',
  'My Family': 'var(--c0)',
};

const dot = (color: string) => ({ '--dot': color }) as CSSProperties;

// ── Component ──────────────────────────────────────────────────
export default function PublicNav() {
  const supabase = getBrowserClient();
  const router = useRouter();
  const pathname = usePathname();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  // The phone menu panel: Escape closes it, Tab stays inside, focus returns to the menu button.
  const menuPanelRef = useDialog<HTMLDivElement>(isOpen, () => setIsOpen(false));
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const profileBtnRef = useRef<HTMLButtonElement>(null);
  const keepClosedRef = useRef(false);
  // Below 1024px: when the unfolded field folds again (Escape, the close button), focus goes back
  // to the search icon instead of dropping to the page.
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const refocusTriggerRef = useRef(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchResults, setSearchResults] = useState<{ id: string; title: string; subtitle: string; href: string }[]>([]);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);

  const isDashboard = pathname.startsWith('/dashboard');

  // The dashboard only ever renders for a signed-in user (its layout checks the session), so the
  // bar is drawn signed in from the first paint there, instead of flashing Log In and Start For
  // Free while the user loads.
  const isLoggedIn = !!userEmail || isDashboard;

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

    const onAvatarChange = () => getUser();
    window.addEventListener('profile-image-updated', onAvatarChange);
    return () => window.removeEventListener('profile-image-updated', onAvatarChange);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: 'local' });
    setUserEmail(null);
    setProfileOpen(false);
    router.push('/login');
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
    if (!searchOpen && refocusTriggerRef.current) {
      refocusTriggerRef.current = false;
      const trigger = searchTriggerRef.current;
      if (trigger && trigger.offsetParent !== null) trigger.focus();
    }
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

  // ── Escape closes the profile menu and hands focus back to the avatar (while focus is in the
  //    menu, or after it dropped to the page; a dialog opened over it keeps its own Escape) ──
  useEffect(() => {
    if (!profileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      const focused = document.activeElement;
      if (focused && focused !== document.body && !profileRef.current?.contains(focused)) return;
      setProfileOpen(false);
      profileBtnRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [profileOpen]);

  // ── Lock body scroll on mobile menu ──
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const navLinks = isLoggedIn
    ? [
        { href: '/stories', label: 'Our Stories' },
        { href: '/dashboard/home', label: 'My Family' },
      ]
    : [
        { href: '/stories', label: 'Our Stories' },
        { href: '/how-it-works', label: 'How It Works' },
        { href: '/why-this-exists', label: 'Our Roots' },
        { href: '/login', label: 'My Family' },
      ];

  // Which link the current page sits under: Our Stories by prefix, My Family for the whole
  // dashboard, anything else by exact path.
  const isActive = (href: string) =>
    href === '/stories'
      ? pathname.startsWith('/stories')
      : href.startsWith('/dashboard')
        ? pathname.startsWith('/dashboard')
        : pathname === href;

  // The signed-in user's photo, else a person icon.
  const avatar = (large = false) => (
    <span className={`${css.avatar} ${large ? css.avatarLg : ''}`} aria-hidden="true">
      {avatarUrl ? (
        <Image src={avatarUrl} alt="" fill sizes="96px" quality={90} className={css.avatarImg} preload />
      ) : (
        <UserIcon size={large ? 20 : 18} strokeWidth={2.4} />
      )}
    </span>
  );

  return (
    <>
      <header
        className={`${css.bar} ${scrolled ? css.scrolled : ''}`}
        data-search-open={searchOpen}
        data-signed-in={isLoggedIn}
      >
        <div className={css.inner}>
          <div className={css.logoWrap}>
            <Logo href="/" />
          </div>

          {/* Centre links */}
          <nav className={css.links} aria-label="Main">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`${css.link} ${isActive(link.href) ? css.linkActive : ''}`}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: logged in */}
          {isLoggedIn && (
            <div className={css.actions}>
              {/* Search: a pill from 1024px; below that an icon that unfolds the field across the bar */}
              <div className={css.search} ref={searchWrapperRef}>
                <div className={css.field}>
                  <SearchIcon className={css.fieldIcon} size={18} strokeWidth={2.6} aria-hidden="true" />
                  <input
                    ref={searchRef}
                    className={css.input}
                    type="text"
                    aria-label="Search"
                    placeholder={isDashboard ? "Search memories, people..." : "Search stories..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (keepClosedRef.current) { keepClosedRef.current = false; return; }
                      if (searchResults.length > 0) setSearchDropdownOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') { refocusTriggerRef.current = searchOpen; setSearchQuery(''); setSearchOpen(false); setSearchDropdownOpen(false); }
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
                </div>
                {/* Folds the unfolded field again (below 1024px), as Escape does */}
                <button
                  type="button"
                  className={`${css.iconBtn} ${css.searchClose}`}
                  aria-label="Close search"
                  onClick={() => { refocusTriggerRef.current = true; setSearchQuery(''); setSearchOpen(false); setSearchDropdownOpen(false); }}
                >
                  <X size={20} strokeWidth={2.4} aria-hidden="true" />
                </button>
                {!searchOpen && (
                  <button
                    ref={searchTriggerRef}
                    type="button"
                    className={`${css.iconBtn} ${css.searchTrigger}`}
                    // flushSync shows the field inside the tap itself, so focusing it there raises
                    // the keyboard on iOS (focus from an effect, after the tap, does not).
                    onClick={() => {
                      flushSync(() => setSearchOpen(true));
                      searchRef.current?.focus();
                    }}
                    aria-label="Search"
                  >
                    <SearchIcon size={20} strokeWidth={2.4} aria-hidden="true" />
                  </button>
                )}
                {searchDropdownOpen && (
                  <div
                    className={`${ui.menu} ${css.results}`}
                    // Escape on a result closes the list and goes back to the field (which keeps the
                    // words, and doesn't reopen the list for that one focus).
                    onKeyDown={(e) => {
                      if (e.key !== 'Escape') return;
                      keepClosedRef.current = true;
                      setSearchDropdownOpen(false);
                      searchRef.current?.focus();
                    }}
                  >
                    {searchResults.map((result, i) => (
                      <button
                        key={result.id}
                        type="button"
                        className={css.result}
                        onClick={() => {
                          router.push(result.href);
                          setSearchQuery('');
                          setSearchOpen(false);
                          setSearchDropdownOpen(false);
                        }}
                      >
                        <span
                          className={css.resultDot}
                          style={dot(RESULT_DOT[result.subtitle] ?? DOTS[i % DOTS.length])}
                          aria-hidden="true"
                        />
                        <span className={css.resultText}>
                          <span className={css.resultTitle}>{result.title}</span>
                          <span className={css.resultSub}>{result.subtitle}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bell */}
              <div className={css.bellWrap}>
                <NotificationBell />
              </div>

              {/* Profile */}
              <div className={css.profile} ref={profileRef}>
                <button
                  ref={profileBtnRef}
                  type="button"
                  className={css.profileBtn}
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-label="Profile menu"
                  aria-expanded={profileOpen}
                >
                  {avatar()}
                </button>
                <div className={`${ui.menu} ${css.dropdown} ${profileOpen ? css.dropdownOpen : ''}`}>
                  <Link href="/dashboard/profile" className={ui.menuItem} onClick={() => setProfileOpen(false)}>
                    <span className={css.menuDot} style={dot('var(--c1)')} aria-hidden="true" />
                    My Profile
                  </Link>
                  <Link href="/dashboard/plans" className={ui.menuItem} onClick={() => setProfileOpen(false)}>
                    <span className={css.menuDot} style={dot('var(--c1)')} aria-hidden="true" />
                    Plans
                  </Link>
                  <div className={ui.menuRule} />
                  <button type="button" className={ui.menuItem} onClick={handleLogout}>
                    <LogOut size={18} strokeWidth={2.4} aria-hidden="true" />
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Right: logged out */}
          {!isLoggedIn && (
            <div className={css.auth}>
              <Link href="/login" className={css.login}>Log In</Link>
              <Link href="/signup" className={css.signup}>Start For Free</Link>
            </div>
          )}

          {/* Phones: the avatar opens the menu panel */}
          <button
            type="button"
            className={css.mobileToggle}
            onClick={() => setIsOpen(true)}
            aria-label="Menu"
            aria-expanded={isOpen}
          >
            {isLoggedIn ? avatar() : <Menu size={22} strokeWidth={2.4} aria-hidden="true" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`${css.overlay} ${isOpen ? css.overlayOpen : ''}`}>
        <div className={css.backdrop} onClick={() => setIsOpen(false)} />
        <div className={css.panel} role="dialog" aria-modal="true" aria-label="Menu" ref={menuPanelRef}>
          <div className={css.panelTop}>
            {isLoggedIn && (
              <Link href="/dashboard/profile" className={css.account} onClick={() => setIsOpen(false)}>
                {avatar(true)}
                <span className={css.accountText}>
                  <span className={css.accountName}>My Account</span>
                  <span className={css.accountEmail}>{userEmail}</span>
                </span>
              </Link>
            )}
            <button type="button" className={css.close} onClick={() => setIsOpen(false)} aria-label="Close menu">
              <X size={22} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>

          <nav className={css.panelLinks} aria-label="Menu">
            {navLinks.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                className={`${css.panelLink} ${isActive(link.href) ? css.panelLinkActive : ''}`}
                aria-current={isActive(link.href) ? 'page' : undefined}
                onClick={() => setIsOpen(false)}
              >
                <span className={css.panelDot} style={dot(LINK_DOT[link.label] ?? DOTS[i % DOTS.length])} aria-hidden="true" />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={css.panelActions}>
            {isLoggedIn ? (
              <button type="button" className={css.logout} onClick={() => { handleLogout(); setIsOpen(false); }}>
                <LogOut size={18} strokeWidth={2.4} aria-hidden="true" />
                Log Out
              </button>
            ) : (
              <>
                <Link href="/login" className={css.panelLogin} onClick={() => setIsOpen(false)}>Log In</Link>
                <Link href="/signup" className={css.panelSignup} onClick={() => setIsOpen(false)}>Start For Free</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
