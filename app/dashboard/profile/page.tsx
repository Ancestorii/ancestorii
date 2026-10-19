'use client';

import { useEffect, useState, useMemo, useId, type CSSProperties } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import Image from 'next/image';
import Link from 'next/link';
import { ensureDisplayableImage } from '@/lib/convertImage';
import ImageCropModal from '@/components/ImageCropModal';
import { safeToast } from '@/lib/safeToast';
import { ADMIN_USER_ID } from '@/lib/adminUser';
import CookieSettingsButton from '@/components/CookieSettingsButton';
import {
  ui,
  AppLoader,
  Avatar,
  Btn,
  EmptyState,
  Eyebrow,
  SectionHead,
  Spinner,
  Tag,
  btnClass,
  toneByKey,
  toneFor,
} from '@/components/dashboard/ui/AppBits';
import css from './profile.module.css';
import {
  Camera,
  MapPin,
  Mail,
  User as UserIcon,
  Shield,
  FileText,
  Clock,
  Check,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  PenLine,
  Star,
} from 'lucide-react';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

type Profile = {
  id: string;
  full_name: string | null;
  title?: string | null;
  dob: string | null;
  profile_image_url: string | null;
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  writing_assistance_enabled?: boolean;
};

type UserStory = {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'pending_review' | 'rejected';
  category: string | null;
  excerpt: string | null;
  moderation_reason: string | null;
  moderation_category: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  family: 'Family',
  food_and_recipes: 'Food & Recipes',
  childhood: 'Childhood',
  love: 'Love',
  life_lessons: 'Life Lessons',
  traditions: 'Traditions',
  travel: 'Travel',
};

// Each status's words, and its dot coloured by meaning: aqua published (the Our Stories
// colour), blue a draft, orange waiting for review, pink rejected.
const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  published: { label: 'Published', dot: 'var(--c3)' },
  draft: { label: 'Draft', dot: 'var(--c1)' },
  pending_review: { label: 'Under Review', dot: 'var(--c2)' },
  rejected: { label: 'Rejected', dot: 'var(--c0)' },
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function ProfilePage() {
  const supabase = getBrowserClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [stories, setStories] = useState<UserStory[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
 const [activeTab, setActiveTab] = useState<'details' | 'stories' | 'nominate' | 'admin'>('details');
  const [pendingStories, setPendingStories] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [adminAction, setAdminAction] = useState<string | null>(null);
  const [featuredStories, setFeaturedStories] = useState<any[]>([]);
  const [publishedStories, setPublishedStories] = useState<any[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [featuringAction, setFeaturingAction] = useState<string | null>(null);

  // Ids for the tabs, their panel and the form's labels.
  const baseId = useId();

  const isAdmin = userId === ADMIN_USER_ID;

  // Max size for an uploaded profile photo (10 MB).
  const MAX_AVATAR_BYTES = 10 * 1024 * 1024;

  const FEATURE_TYPES = [
    { value: 'story_of_the_week', label: 'Story of the Week' },
    { value: 'best_family', label: 'Best Family Story' },
    { value: 'best_food_and_recipes', label: 'Best Food & Recipes Story' },
    { value: 'best_childhood', label: 'Best Childhood Story' },
    { value: 'best_love', label: 'Best Love Story' },
    { value: 'best_life_lessons', label: 'Best Life Lessons Story' },
    { value: 'best_traditions', label: 'Best Traditions Story' },
    { value: 'best_travel', label: 'Best Travel Story' },
  ];

  // Fetch profile
  useEffect(() => {
    (async () => {
      setLoading(true);
      // The user comes from the local session (no network round trip); RLS guards the rows.
      const { data: sess } = await supabase.auth.getSession();
      const user = sess?.session?.user ?? null;
      const uid = user?.id ?? null;
      setUserId(uid);
      setUserEmail(user?.email ?? null);
      setMemberSince(user?.created_at ?? null);

      if (!uid) return setLoading(false);

      const { data: prof } = await supabase
        .from('Profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (!prof) {
        const fullName =
          user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          null;

        const { data: inserted } = await supabase
          .from('Profiles')
          .insert({ id: uid, full_name: fullName })
          .select('*')
          .maybeSingle();

        // If the insert is refused the form still works (Save updates the row by id).
        setProfile(inserted ?? { id: uid, full_name: fullName, dob: null, profile_image_url: null });
      } else {
        if (!prof.full_name) {
          const fullName =
            user?.user_metadata?.full_name ||
            user?.user_metadata?.name ||
            null;

          if (fullName) {
            await supabase
              .from('Profiles')
              .update({ full_name: fullName })
              .eq('id', uid);
            prof.full_name = fullName;
          }
        }
        setProfile(prof);
      }

      setLoading(false);
    })();
  }, []);

  // Fetch featured stories + all published stories (admin only)
  useEffect(() => {
    if (!isAdmin || activeTab !== 'nominate') return;
    (async () => {
      setFeaturedLoading(true);
      const [{ data: featured }, { data: published }] = await Promise.all([
        supabase
          .from('featured_stories')
          .select('id, story_id, feature_type, featured_at, stories(id, title, slug, author_name)')
          .order('featured_at', { ascending: false }),
        supabase
          .from('stories')
          .select('id, title, slug, author_name, category')
          .eq('status', 'published')
          .order('published_at', { ascending: false }),
      ]);
      setFeaturedStories(featured ?? []);
      setPublishedStories(published ?? []);
      setFeaturedLoading(false);
    })();
  }, [isAdmin, activeTab]);

  // Fetch pending stories (admin only)
  useEffect(() => {
    if (!isAdmin || activeTab !== 'admin') return;
    (async () => {
      setPendingLoading(true);
      try {
        const res = await fetch('/api/admin/moderate');
        const json = res.ok ? await res.json() : { stories: [] };
        setPendingStories(json.stories ?? []);
      } catch {
        setPendingStories([]);
      }
      setPendingLoading(false);
    })();
  }, [isAdmin, activeTab]);

  const handleFeature = async (storyId: string, featureType: string) => {
    setFeaturingAction(featureType);
    try {
      const res = await fetch('/api/feature-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story_id: storyId, feature_type: featureType }),
      });
      if (res.ok) {
        const story = publishedStories.find((s) => s.id === storyId);
        setFeaturedStories((prev) => [
          ...prev.filter((f) => f.feature_type !== featureType),
          { feature_type: featureType, story_id: storyId, stories: story, featured_at: new Date().toISOString() },
        ]);
      } else {
        safeToast.error('Could not feature that story. Please try again.');
        console.error('Feature failed:', await res.json());
      }
    } catch {
      safeToast.error('Could not feature that story. Please try again.');
    } finally {
      setFeaturingAction(null);
    }
  };

  const handleUnfeature = async (featureType: string) => {
    setFeaturingAction(featureType);
    try {
      const res = await fetch('/api/unfeature-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature_type: featureType }),
      });
      if (res.ok) {
        setFeaturedStories((prev) => prev.filter((f) => f.feature_type !== featureType));
      } else {
        safeToast.error('Could not remove that featured story. Please try again.');
      }
    } catch {
      safeToast.error('Could not remove that featured story. Please try again.');
    } finally {
      setFeaturingAction(null);
    }
  };

  const handleAdminAction = async (storyId: string, action: 'approve' | 'reject') => {
    setAdminAction(storyId);
    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story_id: storyId, action }),
      });
      if (res.ok) {
        setPendingStories((prev) => prev.filter((s) => s.id !== storyId));
        safeToast.success(action === 'approve' ? 'Story approved and published.' : 'Story rejected.');
      } else {
        safeToast.error('Could not complete that action. Please try again.');
      }
    } catch {
      safeToast.error('Could not complete that action. Please try again.');
    } finally {
      setAdminAction(null);
    }
  };

  // Fetch stories
  useEffect(() => {
    if (!userId) return;
    (async () => {
      setStoriesLoading(true);
      const { data } = await supabase
        .from('stories')
        .select('id, title, slug, status, category, excerpt, moderation_reason, moderation_category, published_at, created_at, updated_at')
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

      setStories((data as UserStory[]) ?? []);
      setStoriesLoading(false);
    })();
  }, [userId]);

  // Avatar: sign the private URL, then keep re-signing before it expires
  // so the photo never silently disappears on a long-open tab.
  useEffect(() => {
    const path = profile?.profile_image_url;
    if (!path) {
      setAvatarUrl(null);
      setAvatarLoaded(false);
      return;
    }

    let active = true;
    setAvatarLoaded(false);

    // No cache buster on this read path: a fresh photo gets its own URL from uploadAvatar.
    const sign = async () => {
      const { data } = await supabase.storage
        .from('user-media')
        .createSignedUrl(path, 3600);
      if (active && data?.signedUrl) {
        setAvatarUrl(data.signedUrl);
      }
    };

    sign();
    const id = setInterval(sign, 50 * 60 * 1000); // refresh ~10 min before the 1h link expires

    return () => {
      active = false;
      clearInterval(id);
    };
  }, [profile?.profile_image_url]);

  // Warn before leaving with unsaved edits (browser/tab close or refresh).
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const onChange = (field: keyof Profile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
    setDirty(true);
  };

  const saveProfile = async () => {
    if (!profile || !userId) return;
    setError(null);
    setSuccess(null);
    setSaving(true);

    // .select() brings the row back, so an update that touched nothing (RLS) reads as a
    // failure instead of "Profile updated."
    const { data: saved, error: upErr } = await supabase
      .from('Profiles')
      .update({
        full_name: profile.full_name,
        title: profile.title,
        dob: profile.dob || null,
        profile_image_url: profile.profile_image_url,
        bio: profile.bio,
        phone: profile.phone,
        location: profile.location,
        writing_assistance_enabled: profile.writing_assistance_enabled,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id')
      .maybeSingle();

    if (upErr || !saved) {
      setError(upErr?.message ?? 'Your changes could not be saved. Please try again.');
      setTimeout(() => setError(null), 5000);
    } else {
      setSuccess('Profile updated.');
      setDirty(false);
      window.dispatchEvent(new Event('profile-updated'));
      setTimeout(() => setSuccess(null), 4000);
    }
    setSaving(false);
  };

  const uploadAvatar = async (rawFile: File) => {
    if (!userId) return;
    setSaving(true);

    const oldPath = profile?.profile_image_url ?? null;
    const file = await ensureDisplayableImage(rawFile);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('user-media')
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      safeToast.error('Could not upload that photo. Please try again.');
      setSaving(false);
      return;
    }

    // Remove the previous photo if it was stored under a different extension,
    // otherwise it would linger in storage forever.
    if (oldPath && oldPath !== path) {
      await supabase.storage.from('user-media').remove([oldPath]);
    }

    const { data: saved, error: saveErr } = await supabase
      .from('Profiles')
      .update({ profile_image_url: path })
      .eq('id', userId)
      .select('id')
      .maybeSingle();

    if (saveErr || !saved) {
      safeToast.error('Could not save your new photo. Please try again.');
      setSaving(false);
      return;
    }

    setProfile((p) => (p ? { ...p, profile_image_url: path } : p));

    // The photo replaces the old one at the same storage path, so this one time the URL
    // carries a buster: the browser must not show the old file. The old image stays on screen
    // until the new one has decoded (no blank ring in between).
    const { data } = await supabase.storage
      .from('user-media')
      .createSignedUrl(path, 3600);

    setAvatarUrl(
      data?.signedUrl ? `${data.signedUrl}&cb=${Date.now()}` : null
    );
    window.dispatchEvent(new Event('profile-image-updated'));
    setSaving(false);
  };

  const formattedDate = useMemo(() => {
    if (!memberSince) return 'Not recorded';
    return new Date(memberSince).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [memberSince]);

  // Story counts
  const storyCounts = useMemo(() => {
    const counts = { published: 0, draft: 0, pending_review: 0, rejected: 0 };
    stories.forEach((s) => { counts[s.status] = (counts[s.status] || 0) + 1; });
    return counts;
  }, [stories]);

  if (loading) {
    return (
      <div className={ui.page}>
        <AppLoader label="Loading your profile" />
      </div>
    );
  }

  const initials = (profile?.full_name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // The photo's ring: the same stable colour as this person's card on My Family.
  const ring = toneFor(profile?.full_name || userEmail?.split('@')[0] || 'Family Member');
  const assistOn = profile?.writing_assistance_enabled !== false;
  const tabId = (tab: string) => `${baseId}-tab-${tab}`;
  const panelId = `${baseId}-panel`;

  return (
    <div className={ui.page}>
      <div className={ui.wrap}>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            HEADER
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <header className={ui.header}>
          <div className={ui.headerGlow} aria-hidden="true" />

          <div className={ui.headerTop}>
            <Eyebrow dot="var(--c1)">My Profile</Eyebrow>
          </div>

          <div className={css.identity}>
            {/* Avatar: a tap anywhere on it picks a new photo */}
            <label className={css.avatarPick} title="Change profile photo">
              <span
                className={cx(ui.avatar, css.avatar)}
                style={{ '--ring': ring.bg, color: ring.fg } as CSSProperties}
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    fill
                    sizes="(min-width: 1024px) 136px, 112px"
                    quality={90}
                    className={`object-cover transition-opacity duration-300 ${avatarLoaded ? 'opacity-100' : 'opacity-0'}`}
                    priority
                    onLoadingComplete={() => setAvatarLoaded(true)}
                  />
                ) : profile?.profile_image_url ? (
                  // A stored photo is being signed: an empty ring, not initials that then vanish.
                  null
                ) : (
                  <span aria-hidden="true">{initials}</span>
                )}
              </span>
              <span className={cx(ui.iconBtn, ui.iconBtnOnPhoto, css.cam)} aria-hidden="true">
                <Camera size={19} strokeWidth={2.4} />
              </span>
              <input
                type="file"
                accept="image/*"
                aria-label="Change profile photo"
                className={ui.srOnly}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > MAX_AVATAR_BYTES) {
                    safeToast.error('That image is too large. Please choose one under 10MB.');
                    e.target.value = '';
                    return;
                  }
                  const displayable = await ensureDisplayableImage(f);
                  const url = URL.createObjectURL(displayable);
                  setCropSrc(url);
                  e.target.value = '';
                }}
              />
            </label>

            {/* Name + meta */}
            <div className={css.identityText}>
              <h1 className={ui.title}>{profile?.full_name || 'Your Profile'}</h1>
              {profile?.title && <p className={css.role}>{profile.title}</p>}
              <div className={ui.meta}>
                <span className={cx(ui.chip, ui.chipWrap)}>
                  <Shield size={15} strokeWidth={2.4} className={css.chipIcon} aria-hidden="true" />
                  Member since {formattedDate}
                </span>
                {userEmail && (
                  <span className={cx(ui.chip, ui.chipWrap)}>
                    <Mail size={15} strokeWidth={2.4} className={css.chipIcon} aria-hidden="true" />
                    {userEmail}
                  </span>
                )}
                {profile?.location && (
                  <span className={cx(ui.chip, ui.chipWrap)}>
                    <MapPin size={15} strokeWidth={2.4} className={css.chipIcon} aria-hidden="true" />
                    {profile.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TABS
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className={cx(ui.tabs, css.tabs)} role="tablist" aria-label="Profile sections">
          <TabButton id={tabId('details')} panelId={panelId} active={activeTab === 'details'} onClick={() => setActiveTab('details')} icon={<UserIcon size={16} strokeWidth={2.4} aria-hidden="true" />} label="Profile Details" />
          <TabButton id={tabId('stories')} panelId={panelId} active={activeTab === 'stories'} onClick={() => setActiveTab('stories')} icon={<FileText size={16} strokeWidth={2.4} aria-hidden="true" />} label={`My Stories${stories.length > 0 ? ` (${stories.length})` : ''}`} />
          {isAdmin && (
            <TabButton id={tabId('nominate')} panelId={panelId} active={activeTab === 'nominate'} onClick={() => setActiveTab('nominate')} icon={<Star size={16} strokeWidth={2.4} aria-hidden="true" />} label="Nominate Stories" />
          )}
          {isAdmin && (
            <TabButton id={tabId('admin')} panelId={panelId} active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} icon={<Shield size={16} strokeWidth={2.4} aria-hidden="true" />} label="Admin" />
          )}
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TAB CONTENT
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div id={panelId} role="tabpanel" aria-labelledby={tabId(activeTab)} className={css.panel}>

          {activeTab === 'details' && (
            <div className={css.details}>

              {/* ── About ── */}
              <Card id={`${baseId}-about`} label="About You" dot="var(--c0)">
                <textarea
                  rows={4}
                  maxLength={300}
                  placeholder="A sentence or two about who you are…"
                  value={profile?.bio ?? ''}
                  onChange={(e) => onChange('bio', e.target.value)}
                  aria-labelledby={`${baseId}-about`}
                  aria-describedby={`${baseId}-bio-hint`}
                  className={cx(ui.textarea, css.bio)}
                />
                <div className={css.counterRow}>
                  <p id={`${baseId}-bio-hint`} className={ui.hint}>Appears on your public stories.</p>
                  <p className={cx(ui.hint, css.counter, (profile?.bio?.length ?? 0) > 270 && css.counterNear)}>
                    {profile?.bio?.length ?? 0}/300
                  </p>
                </div>
              </Card>

              {/* ── Personal + Contact ── */}
              <div className={css.pair}>
                <Card id={`${baseId}-personal`} label="Personal" dot="var(--c1)">
                  <Field label="Full Name" htmlFor={`${baseId}-name`}>
                    <ProfileInput id={`${baseId}-name`} type="text" placeholder="e.g. Michael Brown" value={profile?.full_name ?? ''} onChange={(v) => onChange('full_name', v)} />
                  </Field>
                  <Field label="Title" htmlFor={`${baseId}-title`}>
                    <ProfileInput id={`${baseId}-title`} type="text" placeholder="e.g. Mother of 2, Retired Teacher" value={profile?.title ?? ''} onChange={(v) => onChange('title', v)} describedBy={`${baseId}-title-hint`} />
                    <p id={`${baseId}-title-hint`} className={ui.hint}>Shown on your public stories.</p>
                  </Field>
                  <Field label="Date of Birth" htmlFor={`${baseId}-dob`}>
                    <ProfileInput id={`${baseId}-dob`} type="date" value={profile?.dob ?? ''} onChange={(v) => onChange('dob', v)} className={css.date} />
                  </Field>
                </Card>

                <Card id={`${baseId}-contact`} label="Contact" dot="var(--c2)">
                  <Field label="Email" htmlFor={`${baseId}-email`}>
                    <input
                      id={`${baseId}-email`}
                      type="email"
                      value={userEmail ?? ''}
                      disabled
                      aria-describedby={`${baseId}-email-hint`}
                      className={ui.input}
                    />
                    <p id={`${baseId}-email-hint`} className={ui.hint}>Managed through your login provider.</p>
                  </Field>
                  <Field label="Phone" htmlFor={`${baseId}-phone`}>
                    <ProfileInput id={`${baseId}-phone`} type="tel" placeholder="+44 7700 900000" value={profile?.phone ?? ''} onChange={(v) => onChange('phone', v)} />
                  </Field>
                  <Field label="Location" htmlFor={`${baseId}-location`}>
                    <ProfileInput id={`${baseId}-location`} type="text" placeholder="London, UK" value={profile?.location ?? ''} onChange={(v) => onChange('location', v)} />
                  </Field>
                </Card>
              </div>

              {/* ── Preferences ── */}
              <Card id={`${baseId}-prefs`} label="Preferences" dot="var(--c3)">
                <div className={cx(css.pref, css.prefSwitch)}>
                  <div className={css.prefText}>
                    <p id={`${baseId}-assist`} className={css.prefTitle}>Story Assistance</p>
                    <p className={css.prefBody}>
                      Get gentle help finding the right words when writing about your loved ones.
                    </p>
                    <p id={`${baseId}-assist-state`} className={ui.hint}>
                      {profile?.writing_assistance_enabled !== false
                        ? 'Currently on. Suggestions will appear across your library.'
                        : 'Currently off. No suggestions will be shown.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={assistOn}
                    aria-labelledby={`${baseId}-assist`}
                    aria-describedby={`${baseId}-assist-state`}
                    onClick={() => {
                      setProfile((p) =>
                        p ? { ...p, writing_assistance_enabled: !p.writing_assistance_enabled } : p
                      );
                      setDirty(true);
                    }}
                    className={cx(ui.switch, css.switch)}
                  >
                    <span />
                  </button>
                </div>
                <div className={css.pref}>
                  <div className={css.prefText}>
                    <p className={css.prefTitle}>Cookies</p>
                    <p className={css.prefBody}>
                      Choose whether the website can use analytics and advertising cookies.
                    </p>
                  </div>
                  <CookieSettingsButton className={btnClass({ variant: 'soft', size: 'sm', className: css.cookieBtn })} />
                </div>
              </Card>

              {/* ── Save ── */}
              <div className={css.saveRow}>
                <div className={css.saveStatus} aria-live="polite">
                  {success && (
                    <p className={cx(ui.notice, css.saveNote)}>
                      <CheckCircle2 size={18} strokeWidth={2.4} aria-hidden="true" />
                      <span>{success}</span>
                    </p>
                  )}
                  {error && (
                    <p className={cx(ui.noticeError, css.saveNote)}>
                      <AlertTriangle size={18} strokeWidth={2.4} aria-hidden="true" />
                      <span>{error}</span>
                    </p>
                  )}
                </div>
                <Btn
                  onClick={saveProfile}
                  disabled={saving}
                  className={css.saveBtn}
                  tile={saving ? <Spinner size={16} /> : <Check size={18} strokeWidth={2.6} />}
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </Btn>
              </div>
            </div>
          )}

          {activeTab === 'stories' && (
            <div className={css.stories}>
              {/* Story status summary */}
              {stories.length > 0 && (
                <ul role="list" className={css.stats}>
                  {(['published', 'draft', 'pending_review', 'rejected'] as const).map((status) => {
                    const config = STATUS_CONFIG[status];
                    return (
                      <li key={status} className={cx(ui.card, css.stat)}>
                        <Tag dot={config.dot}>{config.label}</Tag>
                        <span className={css.statValue}>{storyCounts[status]}</span>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Stories list */}
              {storiesLoading ? (
                <AppLoader compact label="Loading stories" />
              ) : stories.length === 0 ? (
                <EmptyState
                  Icon={FileText}
                  tone={toneByKey('aqua')}
                  title="No stories yet"
                  text="When you write and publish a story to Our Stories, it will appear here."
                >
                  <Btn href="/stories/create" tile={<PenLine size={18} strokeWidth={2.4} />}>
                    Write Your First Story
                  </Btn>
                </EmptyState>
              ) : (
                <ul role="list" className={css.list}>
                  {stories.map((story) => {
                    const config = STATUS_CONFIG[story.status] || STATUS_CONFIG.draft;
                    const date = story.published_at || story.created_at;
                    const dateStr = new Date(date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });
                    const categoryLabel = story.category ? CATEGORY_LABELS[story.category] : null;
                    const hasActions =
                      story.status === 'published' || story.status === 'draft' || story.status === 'rejected';

                    return (
                      <li key={story.id} className="min-w-0">
                        <article className={cx(ui.card, css.story)} aria-labelledby={`${baseId}-story-${story.id}`}>
                          <div className={css.storyRow}>
                            <div className={css.storyMain}>
                              <div className={css.storyHead}>
                                <h3 id={`${baseId}-story-${story.id}`} className={css.storyTitle}>{story.title}</h3>
                                <span
                                  className={cx(ui.chip, ui.chipSm, ui.chipDot)}
                                  style={{ '--dot': config.dot } as CSSProperties}
                                >
                                  {config.label}
                                </span>
                              </div>

                              <p className={css.meta}>
                                <span>{dateStr}</span>
                                {categoryLabel && (
                                  <>
                                    <span className={css.sep} aria-hidden="true" />
                                    <span>{categoryLabel}</span>
                                  </>
                                )}
                              </p>
                            </div>

                            {/* Actions */}
                            {hasActions && (
                              <div className={css.storyActions}>
                                {story.status === 'published' && (
                                  <Link
                                    href={`/stories/${story.slug}`}
                                    className={ui.iconBtn}
                                    title="View story"
                                    aria-label="View story"
                                  >
                                    <ExternalLink size={18} strokeWidth={2.4} aria-hidden="true" />
                                  </Link>
                                )}
                                {(story.status === 'draft' || story.status === 'rejected') && (
                                  <Link
                                    href={`/stories/${story.slug}/edit`}
                                    className={btnClass({ variant: 'soft', size: 'sm' })}
                                  >
                                    <PenLine size={16} strokeWidth={2.4} aria-hidden="true" />
                                    Edit
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Moderation info for pending/rejected */}
                          {(story.status === 'pending_review' || story.status === 'rejected') && story.moderation_reason && (
                            <div className={cx(story.status === 'rejected' ? ui.noticeError : ui.noticeWarn, css.notice)}>
                              <AlertTriangle size={17} strokeWidth={2.4} aria-hidden="true" />
                              <div className="min-w-0">
                                {story.moderation_category && (
                                  <span className={css.noticeCat}>{story.moderation_category.replace(/_/g, ' ')}: </span>
                                )}
                                {story.moderation_reason}
                              </div>
                            </div>
                          )}

                          {story.status === 'pending_review' && !story.moderation_reason && (
                            <p className={cx(ui.noticeWarn, css.notice)}>
                              <Clock size={17} strokeWidth={2.4} aria-hidden="true" />
                              <span>Your story is being reviewed. You&apos;ll receive an email once a decision has been made.</span>
                            </p>
                          )}
                        </article>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

         {activeTab === 'nominate' && isAdmin && (
            <div className={css.adminPanel}>
              <SectionHead
                title="Nominate Stories"
                lead="Choose which stories are featured on the feed. One story per slot. Selecting a new one replaces the old."
              />

              {featuredLoading ? (
                <AppLoader compact label="Loading" />
              ) : (
                <ul role="list" className={css.slots}>
                  {FEATURE_TYPES.map((ft) => {
                    const current = featuredStories.find((f) => f.feature_type === ft.value);
                    const isActing = featuringAction === ft.value;
                    const storyData = current?.stories;

                    return (
                      <li key={ft.value} className="min-w-0">
                        <article className={cx(ui.card, css.slot)} aria-label={ft.label}>
                          <Tag dot="var(--c3)" className={current ? undefined : css.tagEmpty}>
                            {ft.label}
                          </Tag>
                          {storyData ? (
                            <p className={css.slotStory}>
                              <Link
                                href={`/stories/${storyData.slug}`}
                                target="_blank"
                                className={cx(ui.textLink, css.slotLink)}
                              >
                                {storyData.title}
                                <span className={ui.srOnly}> (opens in a new tab)</span>
                              </Link>{' '}
                              by {storyData.author_name}
                            </p>
                          ) : (
                            <p className={css.slotEmpty}>No story featured</p>
                          )}

                          <div className={css.slotActions}>
                            <select
                              disabled={isActing}
                              value=""
                              onChange={(e) => {
                                if (e.target.value) handleFeature(e.target.value, ft.value);
                              }}
                              aria-label={`${current ? 'Replace the story for' : 'Choose a story for'} ${ft.label}`}
                              className={cx(ui.select, css.slotSelect)}
                            >
                              <option value="">{current ? 'Replace…' : 'Select story…'}</option>
                              {publishedStories.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.title} by {s.author_name}
                                </option>
                              ))}
                            </select>
                            {current && (
                              <Btn
                                variant="dangerSoft"
                                onClick={() => handleUnfeature(ft.value)}
                                disabled={isActing}
                                icon={isActing ? <Spinner size={16} /> : undefined}
                                className={css.slotRemove}
                              >
                                Remove
                              </Btn>
                            )}
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'admin' && isAdmin && (
            <div className={css.adminPanel}>
              <SectionHead
                title="Moderation Queue"
                lead="Stories flagged by AI or reported by the community."
              />

              {pendingLoading ? (
                <AppLoader compact label="Loading" />
              ) : pendingStories.length === 0 ? (
                <EmptyState
                  Icon={CheckCircle2}
                  tone={toneByKey('aqua')}
                  title="All clear"
                  text="No stories waiting for review."
                />
              ) : (
                <ul role="list" className={css.list}>
                  {pendingStories.map((story) => {
                    const isActing = adminAction === story.id;
                    const categoryLabel = story.category ? CATEGORY_LABELS[story.category] : null;
                    const dateStr = new Date(story.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    });
                    const statusConfig = STATUS_CONFIG[story.status] || STATUS_CONFIG.pending_review;

                    return (
                      <li key={story.id} className="min-w-0">
                        <article className={cx(ui.card, css.review)} aria-labelledby={`${baseId}-review-${story.id}`}>
                          <div className={css.reviewHead}>
                            <Avatar name={story.author_name} size={44} className={css.reviewAvatar} />
                            <div className={css.reviewMain}>
                              <div className={css.reviewTop}>
                                <h3 id={`${baseId}-review-${story.id}`} className={css.storyTitle}>{story.title}</h3>
                                <span
                                  className={cx(ui.chip, ui.chipSm, ui.chipDot)}
                                  style={{ '--dot': statusConfig.dot } as CSSProperties}
                                >
                                  {statusConfig.label}
                                </span>
                              </div>
                              <p className={css.byline}>{story.author_name}</p>
                              <p className={cx(css.meta, css.metaTight)}>
                                <span>{dateStr}</span>
                                {categoryLabel && (
                                  <>
                                    <span className={css.sep} aria-hidden="true" />
                                    <span>{categoryLabel}</span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>

                          {story.moderation_reason && (
                            <div className={cx(story.status === 'rejected' ? ui.noticeError : ui.noticeWarn, css.notice)}>
                              <AlertTriangle size={17} strokeWidth={2.4} aria-hidden="true" />
                              <div className="min-w-0">
                                {story.moderation_category && (
                                  <span className={css.noticeCat}>{story.moderation_category.replace(/_/g, ' ')}: </span>
                                )}
                                {story.moderation_reason}
                              </div>
                            </div>
                          )}

                          <div className={css.reviewActions}>
                            <Btn
                              size="sm"
                              onClick={() => handleAdminAction(story.id, 'approve')}
                              disabled={isActing}
                              icon={isActing ? <Spinner size={16} /> : undefined}
                            >
                              {isActing ? 'Processing…' : 'Approve'}
                            </Btn>
                            <Btn
                              size="sm"
                              variant="dangerSoft"
                              onClick={() => handleAdminAction(story.id, 'reject')}
                              disabled={isActing}
                            >
                              Reject
                            </Btn>
                            <Link
                              href={`/stories/${story.slug}`}
                              className={btnClass({ variant: 'soft', size: 'sm' })}
                              target="_blank"
                            >
                              <ExternalLink size={16} strokeWidth={2.4} aria-hidden="true" />
                              View
                              <span className={ui.srOnly}> (opens in a new tab)</span>
                            </Link>
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          onCancel={() => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
          onConfirm={(croppedFile) => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
            uploadAvatar(croppedFile);
          }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   UI COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function TabButton({
  id,
  panelId,
  active,
  onClick,
  icon,
  label,
}: {
  id: string;
  panelId: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={active}
      aria-controls={panelId}
      onClick={onClick}
      className={cx(ui.tab, css.tab)}
    >
      {icon}
      {label}
    </button>
  );
}

/** A white card with a tag heading (the tag is the card's h2). */
function Card({
  id,
  label,
  dot,
  children,
}: {
  id: string;
  label: string;
  dot: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cx(ui.card, css.card)} aria-labelledby={id}>
      <h2 id={id} className={css.cardHead}>
        <Tag dot={dot}>{label}</Tag>
      </h2>
      {children}
    </section>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className={ui.field}>
      <label htmlFor={htmlFor} className={ui.label}>
        {label}
      </label>
      {children}
    </div>
  );
}

function ProfileInput({
  id,
  type,
  placeholder,
  value,
  onChange,
  describedBy,
  className = '',
}: {
  id: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  describedBy?: string;
  className?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-describedby={describedBy}
      className={cx(ui.input, className)}
    />
  );
}
