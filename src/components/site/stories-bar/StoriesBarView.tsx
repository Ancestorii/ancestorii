'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { flushSync } from 'react-dom';
import { Bell, Check, LogOut, Search, User, X } from 'lucide-react';
import { formatRelative, getNotificationMeta } from './notificationMeta';
import styles from './storiesBar.module.css';

export type StorySearchResult = { id: string; title: string; subtitle: string; href: string };

export type BarNotification = {
  id: string;
  type: string;
  actor_name: string | null;
  story_title?: string | null;
  is_read: boolean;
  created_at: string;
};

type Menu = 'notifications' | 'profile';

export type StoriesBarViewProps = {
  /** What is in the search box, and the stories found for it (none below two characters). */
  query: string;
  results: StorySearchResult[];
  onQueryChange: (value: string) => void;
  /** Enter in the search box: go to the highlighted (or first) story. */
  onOpenResult: (href: string) => void;

  unreadCount: number;
  notifications: BarNotification[];
  notificationsLoading: boolean;
  onNotificationsOpen: () => void;
  /** Resolves to true when the notification led somewhere, so the panel closes. */
  onNotificationSelect: (id: string) => Promise<boolean>;
  onMarkAllRead: () => void;

  avatarUrl: string | null;
  initial: string;
  email: string | null;
  onLogout: () => void;

  /** Start with a panel open, or the phone search unfolded (used for previews). */
  initialMenu?: Menu | null;
  initialSearchOpen?: boolean;
};

// Coloured squares down the result rows, in the landing's order.
const DOT_TONES = ['pink', 'blue', 'orange', 'aqua'] as const;

// The places PublicNav offers signed-in readers from its profile menu and drawer.
const ACCOUNT_LINKS = [
  { href: '/dashboard/home', label: 'My Family', tone: 'pink' },
  { href: '/dashboard/profile', label: 'My Profile', tone: 'blue' },
  { href: '/dashboard/plans', label: 'Plans', tone: 'orange' },
] as const;

/**
 * The look of the signed-in bar on Our Stories pages: a search pill, the bell and the profile
 * menu, in the landing's style. It holds only what is on screen (which panel is open, the
 * highlighted result); StoriesUserBar supplies the data and the actions.
 */
export default function StoriesBarView({
  query,
  results,
  onQueryChange,
  onOpenResult,
  unreadCount,
  notifications,
  notificationsLoading,
  onNotificationsOpen,
  onNotificationSelect,
  onMarkAllRead,
  avatarUrl,
  initial,
  email,
  onLogout,
  initialMenu = null,
  initialSearchOpen = false,
}: StoriesBarViewProps) {
  const uid = useId();
  const ids = {
    form: `${uid}-search`,
    input: `${uid}-search-input`,
    label: `${uid}-search-label`,
    list: `${uid}-results`,
    notes: `${uid}-notifications`,
    notesTitle: `${uid}-notifications-title`,
    profile: `${uid}-profile`,
    account: `${uid}-account`,
  };

  const [menu, setMenu] = useState<Menu | null>(initialMenu);
  // Phones only: the search icon unfolds into a full-width field.
  const [searchOpen, setSearchOpen] = useState(initialSearchOpen);
  // Results show whenever there are some, until Escape or a click elsewhere hides them.
  const [resultsHidden, setResultsHidden] = useState(false);
  // Highlighted result; it resets whenever a new set of results arrives.
  const [active, setActive] = useState({ list: results, index: -1 });

  const searchWrapRef = useRef<HTMLDivElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const notesWrapRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const profileWrapRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const resultsOpen = results.length > 0 && !resultsHidden;
  const activeIndex = active.list === results ? active.index : -1;
  const listUnread = notifications.filter((n) => !n.is_read).length;

  // A click or tap anywhere else closes the results and whichever menu is open.
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (searchWrapRef.current && !searchWrapRef.current.contains(target)) {
        setResultsHidden(true);
        setSearchOpen(false);
      }
      const inMenus = notesWrapRef.current?.contains(target) || profileWrapRef.current?.contains(target);
      if (!inMenus) setMenu(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  // Escape closes an open menu and puts focus back on its button.
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMenu(null);
      (menu === 'notifications' ? bellRef : profileButtonRef).current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menu]);

  const toggleMenu = (which: Menu) => {
    if (menu === which) {
      setMenu(null);
      return;
    }
    setMenu(which);
    if (which === 'notifications') onNotificationsOpen();
  };

  // Tabbing out of a menu closes it.
  const closeOnFocusOut = (which: Menu) => (e: FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget;
    if (next instanceof Node && !e.currentTarget.contains(next)) {
      setMenu((current) => (current === which ? null : current));
    }
  };

  // Tabbing out of the search hides the results (and folds the phone field), as a click elsewhere does.
  const closeSearchOnFocusOut = (e: FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget;
    if (next instanceof Node && !e.currentTarget.contains(next)) {
      setResultsHidden(true);
      setSearchOpen(false);
    }
  };

  const openSearch = () => {
    // Render the field first so focusing it can bring up the phone keyboard.
    flushSync(() => setSearchOpen(true));
    inputRef.current?.focus();
  };

  const closeSearch = () => {
    flushSync(() => {
      setResultsHidden(true);
      setSearchOpen(false);
    });
    searchToggleRef.current?.focus();
  };

  const pickResult = () => {
    setResultsHidden(true);
    setSearchOpen(false);
    onQueryChange('');
  };

  // Enter, as in PublicNav: open the highlighted (or first) story, then clear and close the search.
  const submitSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    const pick = results[activeIndex >= 0 ? activeIndex : 0];
    if (pick) {
      setResultsHidden(true);
      setSearchOpen(false);
      onOpenResult(pick.href);
      return;
    }
    onQueryChange('');
    if (searchOpen) closeSearch();
    else setResultsHidden(true);
  };

  const onSearchKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (results.length === 0) return;
      e.preventDefault();
      const last = results.length - 1;
      const down = e.key === 'ArrowDown';
      let next: number;
      if (!resultsOpen || activeIndex < 0) next = down ? 0 : last;
      else if (down) next = activeIndex >= last ? 0 : activeIndex + 1;
      else next = activeIndex <= 0 ? last : activeIndex - 1;
      setResultsHidden(false);
      setActive({ list: results, index: next });
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onQueryChange('');
      if (searchOpen) closeSearch();
      else setResultsHidden(true);
    }
  };

  const selectNotification = async (id: string) => {
    if (await onNotificationSelect(id)) setMenu(null);
  };

  return (
    <div className={styles.bar} data-search-open={searchOpen}>
      <div className={styles.row}>
        {/* Search */}
        <div ref={searchWrapRef} className={styles.search} onBlur={closeSearchOnFocusOut}>
          <button
            ref={searchToggleRef}
            type="button"
            className={`${styles.iconBtn} ${styles.searchToggle}`}
            aria-expanded={searchOpen}
            aria-controls={ids.form}
            onClick={openSearch}
          >
            <Search size={20} strokeWidth={2.4} aria-hidden="true" />
            <span className={styles.srOnly}>Search</span>
          </button>

          <form id={ids.form} role="search" className={styles.searchForm} onSubmit={submitSearch}>
            <label id={ids.label} htmlFor={ids.input} className={styles.srOnly}>
              Search stories
            </label>
            <div className={styles.field}>
              <Search className={styles.fieldIcon} size={18} strokeWidth={2.6} aria-hidden="true" />
              <input
                ref={inputRef}
                id={ids.input}
                type="search"
                role="combobox"
                aria-expanded={resultsOpen}
                aria-controls={ids.list}
                aria-autocomplete="list"
                aria-activedescendant={resultsOpen && activeIndex >= 0 ? `${ids.list}-${activeIndex}` : undefined}
                autoComplete="off"
                spellCheck={false}
                enterKeyHint="search"
                placeholder="Search stories..."
                className={styles.input}
                value={query}
                onChange={(e) => {
                  setResultsHidden(false);
                  onQueryChange(e.target.value);
                }}
                onFocus={() => setResultsHidden(false)}
                onKeyDown={onSearchKeyDown}
              />
            </div>
            <button
              type="button"
              className={`${styles.iconBtn} ${styles.searchClose}`}
              aria-expanded={searchOpen}
              aria-controls={ids.form}
              onClick={closeSearch}
            >
              <X size={20} strokeWidth={2.4} aria-hidden="true" />
              <span className={styles.srOnly}>Search</span>
            </button>

            <div
              id={ids.list}
              role="listbox"
              aria-labelledby={ids.label}
              className={styles.results}
              hidden={!resultsOpen}
            >
              {results.map((result, i) => (
                <Link
                  key={result.id}
                  id={`${ids.list}-${i}`}
                  href={result.href}
                  role="option"
                  aria-selected={i === activeIndex}
                  tabIndex={-1}
                  className={styles.result}
                  onClick={pickResult}
                >
                  <span className={styles.resultDot} data-tone={DOT_TONES[i % DOT_TONES.length]} aria-hidden="true" />
                  <span className={styles.resultText}>
                    <span className={styles.resultTitle}>{result.title}</span>
                    {result.subtitle && <span className={styles.resultBy}>{result.subtitle}</span>}
                  </span>
                </Link>
              ))}
            </div>
          </form>
        </div>

        <div className={styles.actions}>
          {/* Notifications */}
          <div ref={notesWrapRef} className={styles.menuWrap} onBlur={closeOnFocusOut('notifications')}>
            <button
              ref={bellRef}
              type="button"
              className={styles.iconBtn}
              aria-expanded={menu === 'notifications'}
              aria-controls={ids.notes}
              onClick={() => toggleMenu('notifications')}
            >
              <Bell size={20} strokeWidth={2.4} aria-hidden="true" />
              <span className={styles.srOnly}>Notifications</span>
              {unreadCount > 0 && (
                <span className={styles.count}>{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>

            <div
              id={ids.notes}
              role="region"
              aria-labelledby={ids.notesTitle}
              className={`${styles.panel} ${styles.notesPanel}`}
              hidden={menu !== 'notifications'}
            >
              <div className={styles.panelHead}>
                <p id={ids.notesTitle} className={styles.panelTitle}>
                  Notifications
                </p>
                {listUnread > 0 && (
                  <button type="button" className={styles.markAll} onClick={onMarkAllRead}>
                    <Check size={14} strokeWidth={3} aria-hidden="true" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className={styles.notesBody} aria-busy={notificationsLoading}>
                {notificationsLoading ? (
                  <div className={styles.loading}>
                    <span className={styles.spinner} aria-hidden="true" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className={styles.empty}>
                    <span className={styles.emptyTile} aria-hidden="true">
                      <Bell size={26} strokeWidth={2.4} />
                    </span>
                    <p className={styles.emptyText}>No notifications yet</p>
                  </div>
                ) : (
                  <ul className={styles.notes}>
                    {notifications.map((n) => (
                      <NotificationRow key={n.id} notification={n} onSelect={() => selectNotification(n.id)} />
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Profile */}
          <div ref={profileWrapRef} className={styles.menuWrap} onBlur={closeOnFocusOut('profile')}>
            <button
              ref={profileButtonRef}
              type="button"
              className={styles.profileBtn}
              aria-label="Profile menu"
              aria-expanded={menu === 'profile'}
              aria-controls={ids.profile}
              onClick={() => toggleMenu('profile')}
            >
              <Avatar url={avatarUrl} initial={initial} />
            </button>

            <div
              id={ids.profile}
              className={`${styles.panel} ${styles.profilePanel}`}
              hidden={menu !== 'profile'}
            >
              <div className={styles.account}>
                <Avatar url={avatarUrl} initial={initial} large />
                <div className={styles.accountText}>
                  <p id={ids.account} className={styles.accountName}>
                    My Account
                  </p>
                  {email && <p className={styles.accountEmail}>{email}</p>}
                </div>
              </div>

              <nav aria-labelledby={ids.account}>
                <ul className={styles.menuList}>
                  {ACCOUNT_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={styles.menuLink} onClick={() => setMenu(null)}>
                        <span className={styles.menuDot} data-tone={link.tone} aria-hidden="true" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <button type="button" className={styles.logout} onClick={onLogout}>
                <LogOut size={18} strokeWidth={2.4} aria-hidden="true" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationRow({
  notification,
  onSelect,
}: {
  notification: BarNotification;
  onSelect: () => void;
}) {
  const { Icon, tone, message } = getNotificationMeta(
    notification.type,
    notification.actor_name,
    notification.story_title
  );

  return (
    <li>
      <button type="button" className={styles.note} data-unread={!notification.is_read} onClick={onSelect}>
        <span className={styles.noteTile} data-tone={tone} aria-hidden="true">
          <Icon size={18} strokeWidth={2.4} />
        </span>
        <span className={styles.noteBody}>
          <span className={styles.noteText}>{message}</span>
          <span className={styles.noteTime}>{formatRelative(notification.created_at)}</span>
        </span>
        {!notification.is_read && <span className={styles.noteDot} aria-hidden="true" />}
      </button>
    </li>
  );
}

// Profile photo, else the first letter of the name or email, else a person icon. The letter (or
// icon) always sits underneath, so it shows while the photo loads or if the photo fails.
function Avatar({ url, initial, large = false }: { url: string | null; initial: string; large?: boolean }) {
  return (
    <span className={`${styles.avatar} ${large ? styles.avatarLarge : ''}`} aria-hidden="true">
      {initial ? initial : <User size={large ? 20 : 18} strokeWidth={2.4} />}
      {url && <Image src={url} alt="" fill sizes="96px" quality={90} className={styles.avatarImg} />}
    </span>
  );
}
