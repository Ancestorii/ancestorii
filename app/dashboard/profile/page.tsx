'use client';

import { useEffect, useState, useMemo } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import Image from 'next/image';
import Link from 'next/link';
import { ensureDisplayableImage } from '@/lib/convertImage';
import ImageCropModal from '@/components/ImageCropModal';
import { safeToast } from '@/lib/safeToast';
import { ADMIN_USER_ID } from '@/lib/adminUser';
import {
  Camera,
  MapPin,
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  Shield,
  Feather,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  PenLine,
  Star,
} from 'lucide-react';

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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  published: {
    label: 'Published',
    color: '#15803D',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    icon: <CheckCircle2 size={13} strokeWidth={2} />,
  },
  draft: {
    label: 'Draft',
    color: '#6B7280',
    bg: '#F9FAFB',
    border: '#E5E7EB',
    icon: <PenLine size={13} strokeWidth={2} />,
  },
  pending_review: {
    label: 'Under Review',
    color: '#B45309',
    bg: '#FFFBEB',
    border: '#FDE68A',
    icon: <Clock size={13} strokeWidth={2} />,
  },
  rejected: {
    label: 'Rejected',
    color: '#DC2626',
    bg: '#FEF2F2',
    border: '#FECACA',
    icon: <XCircle size={13} strokeWidth={2} />,
  },
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
      const { data: authResp } = await supabase.auth.getUser();
      const uid = authResp?.user?.id ?? null;
      setUserId(uid);
      setUserEmail(authResp?.user?.email ?? null);
      setMemberSince(authResp?.user?.created_at ?? null);

      if (!uid) return setLoading(false);

      const { data: prof } = await supabase
        .from('Profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (!prof) {
        const fullName =
          authResp?.user?.user_metadata?.full_name ||
          authResp?.user?.user_metadata?.name ||
          null;

        const { data: inserted } = await supabase
          .from('Profiles')
          .insert({ id: uid, full_name: fullName })
          .select('*')
          .single();

        setProfile(inserted);
      } else {
        if (!prof.full_name) {
          const fullName =
            authResp?.user?.user_metadata?.full_name ||
            authResp?.user?.user_metadata?.name ||
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
      const { data } = await supabase
        .from('stories')
        .select('id, title, slug, status, author_name, category, moderation_reason, moderation_category, created_at')
        .in('status', ['pending_review', 'rejected'])
        .order('created_at', { ascending: false });
      setPendingStories(data ?? []);
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

  // Avatar — sign the private URL, then keep re-signing before it expires
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

    const sign = async () => {
      const { data } = await supabase.storage
        .from('user-media')
        .createSignedUrl(path, 3600);
      if (active && data?.signedUrl) {
        setAvatarUrl(`${data.signedUrl}&cb=${Date.now()}`);
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

    const { error: upErr } = await supabase
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
      .eq('id', userId);

    if (upErr) {
      setError(upErr.message);
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

    await supabase.storage
      .from('user-media')
      .upload(path, file, { upsert: true });

    // Remove the previous photo if it was stored under a different extension,
    // otherwise it would linger in storage forever.
    if (oldPath && oldPath !== path) {
      await supabase.storage.from('user-media').remove([oldPath]);
    }

    await supabase
      .from('Profiles')
      .update({ profile_image_url: path })
      .eq('id', userId);

    setProfile((p) => (p ? { ...p, profile_image_url: path } : p));

    const { data } = await supabase.storage
      .from('user-media')
      .createSignedUrl(path, 3600);

    setAvatarUrl(
      data?.signedUrl ? `${data.signedUrl}&cb=${Date.now()}` : null
    );
    setAvatarLoaded(false);
    window.dispatchEvent(new Event('profile-image-updated'));
    setSaving(false);
  };

  const formattedDate = useMemo(() => {
    if (!memberSince) return '—';
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[13px] uppercase tracking-[0.22em] text-[#9B8E7D]">
          Loading...
        </p>
      </div>
    );
  }

  const initials = (profile?.full_name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#17120E]">

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HEADER
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative overflow-hidden bg-[#FAF5EB]">
        <div className="px-5 sm:px-8 lg:px-12 py-8 sm:py-10">
          <div className="mx-auto max-w-[1200px]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7">
              {/* Avatar */}
              <label className="group relative shrink-0 cursor-pointer">
                <div className="h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-2 border-[#C8A557] bg-[#EDE8DC] flex items-center justify-center">
                  {avatarUrl ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={avatarUrl}
                        alt="Avatar"
                        fill
                        sizes="96px"
                        quality={90}
                        className={`object-cover rounded-full transition-opacity duration-300 ${avatarLoaded ? 'opacity-100' : 'opacity-0'}`}
                        priority
                        onLoadingComplete={() => setAvatarLoaded(true)}
                      />
                    </div>
                  ) : (
                    <span className="text-[18px] font-bold text-[#A9782F]">{initials}</span>
                  )}
                  <div className="absolute inset-0 rounded-full flex items-center justify-center bg-[#16120C]/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-5 w-5 text-white" strokeWidth={1.8} />
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
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
              <div className="min-w-0 flex-1">
              <h1 className="text-[26px] sm:text-[32px] lg:text-[40px] xl:text-[46px] font-bold text-[#1A1612] tracking-[-0.03em] leading-[1.1]">
                  {profile?.full_name || 'Your Profile'}
                </h1>
                {profile?.title && (
                 <p className="mt-1 text-[14px] sm:text-[15px] lg:text-[17px] text-[#A9782F] font-medium">{profile.title}</p>
                )}
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] sm:text-[13px] lg:text-[14px] text-[#7D6F5F]">
                  <span className="flex items-center gap-1.5">
                    <Shield size={11} className="text-[#B8924A]" strokeWidth={2} />
                    Member since {formattedDate}
                  </span>
                  {userEmail && (
                    <span className="flex items-center gap-1.5">
                      <Mail size={11} strokeWidth={2} />
                      {userEmail}
                    </span>
                  )}
                  {profile?.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={11} strokeWidth={2} />
                      {profile.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-[2px]" style={{ background: 'linear-gradient(to right, #C8A557, rgba(200,165,87,0.15))' }} />
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TABS
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bg-white border-b border-[#EDE8DF] sticky top-0 z-10">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12 flex gap-0">
          <TabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')} icon={<UserIcon size={14} strokeWidth={1.8} />} label="Profile Details" />
          <TabButton active={activeTab === 'stories'} onClick={() => setActiveTab('stories')} icon={<FileText size={14} strokeWidth={1.8} />} label={`My Stories${stories.length > 0 ? ` (${stories.length})` : ''}`} />
          {isAdmin && (
            <TabButton active={activeTab === 'nominate'} onClick={() => setActiveTab('nominate')} icon={<Star size={14} strokeWidth={1.8} />} label="Nominate Stories" />
          )}
          {isAdmin && (
            <TabButton active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} icon={<Shield size={14} strokeWidth={1.8} />} label="Admin" />
          )}
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TAB CONTENT
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12 py-8 pb-36 sm:py-10 sm:pb-10">

        {activeTab === 'details' && (
          <div className="space-y-8">

            {/* ── About ── */}
            <Card label="About You" icon={<Feather size={14} strokeWidth={1.8} />}>
              <textarea
                rows={4}
                maxLength={300}
                placeholder="A sentence or two about who you are…"
                value={profile?.bio ?? ''}
                onChange={(e) => onChange('bio', e.target.value)}
               className="w-full rounded-[10px] border border-[#DCC7A4] bg-white px-4 py-3.5 text-[14px] sm:text-[15px] lg:text-[16px] leading-[1.8] text-[#2C241B] outline-none transition placeholder:text-[#B5A99A] focus:border-[#C8A557] resize-none"
              />
              <div className="mt-1.5 flex justify-between">
                <p className="text-[11px] text-[#9B8E7D]">Appears on your public stories.</p>
                <p className={`text-[11px] font-medium ${(profile?.bio?.length ?? 0) > 270 ? 'text-[#DC2626]' : 'text-[#9B8E7D]'}`}>
                  {profile?.bio?.length ?? 0}/300
                </p>
              </div>
            </Card>

            {/* ── Personal + Contact ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card label="Personal" icon={<UserIcon size={14} strokeWidth={1.8} />}>
                <div className="space-y-4">
                  <Field label="Full Name">
                    <ProfileInput type="text" placeholder="e.g. Michael Brown" value={profile?.full_name ?? ''} onChange={(v) => onChange('full_name', v)} />
                  </Field>
                  <Field label="Title">
                    <ProfileInput type="text" placeholder="e.g. Mother of 2, Retired Teacher" value={profile?.title ?? ''} onChange={(v) => onChange('title', v)} />
                    <p className="mt-1 text-[11px] text-[#9B8E7D]">Shown on your public stories.</p>
                  </Field>
                  <Field label="Date of Birth">
                    <ProfileInput type="date" value={profile?.dob ?? ''} onChange={(v) => onChange('dob', v)} className="uppercase" />
                  </Field>
                </div>
              </Card>

              <Card label="Contact" icon={<Phone size={14} strokeWidth={1.8} />}>
                <div className="space-y-4">
                  <Field label="Email">
                    <input
                      type="email"
                      value={userEmail ?? ''}
                      disabled
                      className="h-[44px] sm:h-[48px] lg:h-[52px] w-full rounded-[10px] border border-[#E7DFD3] bg-[#F5F0E8] px-4 text-[14px] sm:text-[15px] lg:text-[16px] text-[#9B8E7D] outline-none cursor-not-allowed"
                    />
                    <p className="mt-1 text-[11px] text-[#9B8E7D]">Managed through your login provider.</p>
                  </Field>
                  <Field label="Phone">
                    <ProfileInput type="tel" placeholder="+44 7700 900000" value={profile?.phone ?? ''} onChange={(v) => onChange('phone', v)} />
                  </Field>
                  <Field label="Location">
                    <ProfileInput type="text" placeholder="London, UK" value={profile?.location ?? ''} onChange={(v) => onChange('location', v)} />
                  </Field>
                </div>
              </Card>
            </div>

            {/* ── Preferences ── */}
            <Card label="Preferences" icon={<Feather size={14} strokeWidth={1.8} />}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                 <p className="text-[14px] sm:text-[15px] lg:text-[16px] font-semibold text-[#17120E]">Story Assistance</p>
                  <p className="mt-1 text-[13px] sm:text-[14px] lg:text-[15px] leading-[1.6] text-[#6F6255]">
                    Get gentle help finding the right words when writing about your loved ones.
                  </p>
                  <p className="mt-1.5 text-[11px] text-[#9B8E7D]">
                    {profile?.writing_assistance_enabled !== false
                      ? 'Currently on — suggestions will appear across your library.'
                      : 'Currently off — no suggestions will be shown.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setProfile((p) =>
                      p ? { ...p, writing_assistance_enabled: !p.writing_assistance_enabled } : p
                    );
                    setDirty(true);
                  }}
                  className={`relative mt-1 h-[26px] w-[48px] flex-shrink-0 rounded-full transition-colors ${
                    profile?.writing_assistance_enabled !== false ? 'bg-[#C8A557]' : 'bg-[#D5CFCA]'
                  }`}
                >
                  <span
                    className={`absolute top-[3px] left-[3px] h-[20px] w-[20px] rounded-full bg-white shadow-sm transition-transform ${
                      profile?.writing_assistance_enabled !== false ? 'translate-x-[22px]' : ''
                    }`}
                  />
                </button>
              </div>
            </Card>

            {/* ── Save ── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3 min-h-[20px]">
                {success && <p className="text-[13px] font-medium text-emerald-600">{success}</p>}
                {error && <p className="text-[13px] font-medium text-red-500">{error}</p>}
              </div>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="flex h-[44px] items-center justify-center gap-2 rounded-[10px] bg-[#C8A557] px-7 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(184,146,74,0.2)] transition hover:bg-[#B8924A] disabled:opacity-50 w-full sm:w-auto"
              >
                {saving ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving…
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'stories' && (
          <div>
            {/* Story status summary */}
            {stories.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {(['published', 'draft', 'pending_review', 'rejected'] as const).map((status) => {
                  const config = STATUS_CONFIG[status];
                  return (
                    <div
                      key={status}
                      className="rounded-[10px] border px-4 py-3"
                      style={{ borderColor: config.border, background: config.bg }}
                    >
                      <div className="flex items-center gap-2" style={{ color: config.color }}>
                        {config.icon}
                        <span className="text-[12px] font-semibold uppercase tracking-[0.06em]">{config.label}</span>
                      </div>
                     <p className="mt-1.5 text-[22px] sm:text-[26px] lg:text-[30px] font-bold text-[#1A1612]">{storyCounts[status]}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Stories list */}
            {storiesLoading ? (
              <div className="py-16 text-center">
                <p className="text-[13px] uppercase tracking-[0.22em] text-[#9B8E7D]">Loading stories…</p>
              </div>
            ) : stories.length === 0 ? (
              <div className="py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF5EB] mx-auto mb-4">
                  <FileText size={22} className="text-[#C8A557]" strokeWidth={1.5} />
                </div>
                <p className="text-[16px] font-semibold text-[#1A1612]">No stories yet</p>
                <p className="mt-1.5 text-[13px] text-[#7D6F5F]">When you write and publish a story to Our Stories, it will appear here.</p>
                <Link
                  href="/stories/create"
                  className="inline-flex items-center gap-2 mt-5 h-[40px] px-5 rounded-[10px] bg-[#C8A557] text-[13px] font-semibold text-white transition hover:bg-[#B8924A]"
                >
                  <PenLine size={14} />
                  Write Your First Story
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {stories.map((story) => {
                  const config = STATUS_CONFIG[story.status] || STATUS_CONFIG.draft;
                  const date = story.published_at || story.created_at;
                  const dateStr = new Date(date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const categoryLabel = story.category ? CATEGORY_LABELS[story.category] : null;

                  return (
                    <div
                      key={story.id}
                      className="rounded-[12px] border border-[#EDE8DF] bg-white px-5 py-4 transition-shadow hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                           <h4 className="text-[15px] sm:text-[16px] lg:text-[17px] font-semibold text-[#1A1612] truncate">{story.title}</h4>
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0"
                              style={{ color: config.color, background: config.bg, border: `1px solid ${config.border}` }}
                            >
                              {config.icon}
                              {config.label}
                            </span>
                          </div>

                          <div className="mt-1.5 flex items-center gap-3 text-[12px] text-[#9B8E7D]">
                            <span>{dateStr}</span>
                            {categoryLabel && (
                              <>
                                <span className="text-[#DCC7A4]">·</span>
                                <span>{categoryLabel}</span>
                              </>
                            )}
                          </div>

                          {/* Moderation info for pending/rejected */}
                          {(story.status === 'pending_review' || story.status === 'rejected') && story.moderation_reason && (
                            <div
                              className="mt-3 flex items-start gap-2 rounded-[8px] px-3 py-2.5 text-[12px] leading-[1.6]"
                              style={{
                                background: story.status === 'rejected' ? '#FEF2F2' : '#FFFBEB',
                                color: story.status === 'rejected' ? '#991B1B' : '#92400E',
                              }}
                            >
                              <AlertTriangle size={13} className="mt-0.5 shrink-0" strokeWidth={2} />
                              <div>
                                {story.moderation_category && (
                                  <span className="font-semibold capitalize">{story.moderation_category.replace(/_/g, ' ')}: </span>
                                )}
                                {story.moderation_reason}
                              </div>
                            </div>
                          )}

                          {story.status === 'pending_review' && !story.moderation_reason && (
                            <p className="mt-2 text-[12px] text-[#B45309]">
                              Your story is being reviewed. You'll receive an email once a decision has been made.
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {story.status === 'published' && (
                            <Link
                              href={`/stories/${story.slug}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EDE8DF] text-[#9B8E7D] transition hover:bg-[#FAF5EB] hover:text-[#A9782F]"
                              title="View story"
                            >
                              <ExternalLink size={13} strokeWidth={2} />
                            </Link>
                          )}
                          {(story.status === 'draft' || story.status === 'rejected') && (
                            <Link
                              href={`/stories/${story.slug}/edit`}
                              className="flex h-8 items-center gap-1.5 rounded-lg border border-[#EDE8DF] px-3 text-[12px] font-semibold text-[#6F6255] transition hover:bg-[#FAF5EB] hover:text-[#A9782F]"
                            >
                              <PenLine size={12} strokeWidth={2} />
                              Edit
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

       {activeTab === 'nominate' && isAdmin && (
          <div>
            <div className="mb-6">
              <h3 className="text-[18px] sm:text-[20px] lg:text-[22px] font-bold text-[#1A1612] tracking-[-0.02em]">Nominate Stories</h3>
              <p className="mt-1 text-[13px] sm:text-[14px] text-[#7D6F5F]">Choose which stories are featured on the feed. One story per slot — selecting a new one replaces the old.</p>
            </div>

            {featuredLoading ? (
              <div className="py-10 text-center">
                <p className="text-[13px] uppercase tracking-[0.22em] text-[#9B8E7D]">Loading…</p>
              </div>
            ) : (
              <div className="space-y-3">
                {FEATURE_TYPES.map((ft) => {
                  const current = featuredStories.find((f) => f.feature_type === ft.value);
                  const isActing = featuringAction === ft.value;
                  const storyData = current?.stories;

                  return (
                    <div
                      key={ft.value}
                      className="rounded-[12px] border border-[#EDE8DF] bg-white p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2.5">
                            <Star size={14} strokeWidth={2} className={current ? 'text-[#C8A557] fill-[#C8A557]' : 'text-[#D5CFCA]'} />
                            <span className="text-[13px] sm:text-[14px] font-semibold text-[#1A1612]">{ft.label}</span>
                          </div>
                          {storyData ? (
                            <div className="mt-2 ml-[30px]">
                              <Link
                                href={`/stories/${storyData.slug}`}
                                target="_blank"
                                className="text-[13px] font-medium text-[#A9782F] hover:underline"
                              >
                                {storyData.title}
                              </Link>
                              <span className="text-[12px] text-[#9B8E7D] ml-2">by {storyData.author_name}</span>
                            </div>
                          ) : (
                            <p className="mt-1.5 ml-[30px] text-[12px] text-[#9B8E7D]">No story featured</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {current && (
                            <button
                              onClick={() => handleUnfeature(ft.value)}
                              disabled={isActing}
                              className="h-8 px-3 rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] text-[11px] font-semibold text-[#DC2626] transition hover:bg-[#FEE2E2] disabled:opacity-50"
                            >
                              {isActing ? '…' : 'Remove'}
                            </button>
                          )}
                          <select
                            disabled={isActing}
                            value=""
                            onChange={(e) => {
                              if (e.target.value) handleFeature(e.target.value, ft.value);
                            }}
                            className="h-8 px-3 rounded-[8px] border border-[#EDE8DF] bg-white text-[11px] font-semibold text-[#6F6255] cursor-pointer transition hover:border-[#C8A557] disabled:opacity-50 max-w-[200px]"
                          >
                            <option value="">{current ? 'Replace…' : 'Select story…'}</option>
                            {publishedStories.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.title} — {s.author_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin' && isAdmin && (
          <div>
            <div className="mb-6">
              <h3 className="text-[18px] sm:text-[20px] lg:text-[22px] font-bold text-[#1A1612] tracking-[-0.02em]">Moderation Queue</h3>
              <p className="mt-1 text-[13px] sm:text-[14px] text-[#7D6F5F]">Stories flagged by AI or reported by the community.</p>
            </div>

            {pendingLoading ? (
              <div className="py-16 text-center">
                <p className="text-[13px] uppercase tracking-[0.22em] text-[#9B8E7D]">Loading…</p>
              </div>
            ) : pendingStories.length === 0 ? (
              <div className="py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F0FDF4] mx-auto mb-4">
                  <CheckCircle2 size={22} className="text-[#10B981]" strokeWidth={1.5} />
                </div>
                <p className="text-[16px] font-semibold text-[#1A1612]">All clear</p>
                <p className="mt-1.5 text-[13px] text-[#7D6F5F]">No stories waiting for review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingStories.map((story) => {
                  const isActing = adminAction === story.id;
                  const categoryLabel = story.category ? CATEGORY_LABELS[story.category] : null;
                  const dateStr = new Date(story.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  });
                  const statusConfig = STATUS_CONFIG[story.status] || STATUS_CONFIG.pending_review;

                  return (
                    <div
                      key={story.id}
                      className="rounded-[12px] border border-[#EDE8DF] bg-white p-5"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="text-[15px] sm:text-[16px] font-semibold text-[#1A1612]">{story.title}</h4>
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0"
                              style={{ color: statusConfig.color, background: statusConfig.bg, border: `1px solid ${statusConfig.border}` }}
                            >
                              {statusConfig.icon}
                              {statusConfig.label}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-3 text-[12px] text-[#9B8E7D]">
                            <span>{story.author_name}</span>
                            <span className="text-[#DCC7A4]">·</span>
                            <span>{dateStr}</span>
                            {categoryLabel && (
                              <>
                                <span className="text-[#DCC7A4]">·</span>
                                <span>{categoryLabel}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {story.moderation_reason && (
                        <div className="flex items-start gap-2 rounded-[8px] bg-[#FFFBEB] px-3 py-2.5 text-[12px] leading-[1.6] text-[#92400E] mb-4">
                          <AlertTriangle size={13} className="mt-0.5 shrink-0" strokeWidth={2} />
                          <div>
                            {story.moderation_category && (
                              <span className="font-semibold capitalize">{story.moderation_category.replace(/_/g, ' ')}: </span>
                            )}
                            {story.moderation_reason}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAdminAction(story.id, 'approve')}
                          disabled={isActing}
                          className="h-9 px-5 rounded-[8px] bg-[#10B981] text-[12px] font-semibold text-white transition hover:bg-[#059669] disabled:opacity-50"
                        >
                          {isActing ? 'Processing…' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleAdminAction(story.id, 'reject')}
                          disabled={isActing}
                          className="h-9 px-5 rounded-[8px] bg-[#EF4444] text-[12px] font-semibold text-white transition hover:bg-[#DC2626] disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <Link
                          href={`/stories/${story.slug}`}
                          className="h-9 flex items-center gap-1.5 px-4 rounded-[8px] border border-[#EDE8DF] text-[12px] font-semibold text-[#6F6255] transition hover:bg-[#FAF5EB]"
                          target="_blank"
                        >
                          <ExternalLink size={12} strokeWidth={2} />
                          View
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
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
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
     className={`flex items-center gap-2 px-5 py-3.5 text-[13px] sm:text-[14px] lg:text-[15px] font-semibold transition-colors border-b-2 ${
        active
          ? 'text-[#A9782F] border-[#C8A557]'
          : 'text-[#9B8E7D] border-transparent hover:text-[#6F6255]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Card({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-[#EAD8B8] bg-[#FFFDF9] p-5 sm:p-6 shadow-[0_2px_10px_rgba(44,36,27,0.03)]">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[#B8924A]">{icon}</span>
        <span className="text-[11px] sm:text-[12px] lg:text-[13px] font-bold uppercase tracking-[0.2em] text-[#B8924A]">{label}</span>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
     <label className="mb-1.5 block text-[12px] sm:text-[13px] lg:text-[14px] font-semibold uppercase tracking-[0.08em] text-[#6F6255]">
        {label}
      </label>
      {children}
    </div>
  );
}

function ProfileInput({
  type,
  placeholder,
  value,
  onChange,
  className = '',
}: {
  type: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
     className={`h-[44px] sm:h-[48px] lg:h-[52px] w-full rounded-[10px] border border-[#DCC7A4] bg-white px-4 text-[14px] sm:text-[15px] lg:text-[16px] text-[#2C241B] outline-none transition placeholder:text-[#B5A99A] focus:border-[#C8A557] ${className}`}
    />
  );
}