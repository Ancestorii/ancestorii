'use client';

import { useEffect, useState, useMemo } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import Image from 'next/image';
import { ensureDisplayableImage } from '@/lib/convertImage';
import {
  Camera,
  MapPin,
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  Shield,
} from 'lucide-react';

type Profile = {
  id: string;
  full_name: string | null;
  dob: string | null;
  profile_image_url: string | null;
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

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
  const [avatarLoaded, setAvatarLoaded] = useState(false);

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

  // Avatar
  useEffect(() => {
    (async () => {
      if (!profile?.profile_image_url) {
        setAvatarUrl(null);
        setAvatarLoaded(false);
        return;
      }
      const { data } = await supabase.storage
        .from('user-media')
        .createSignedUrl(profile.profile_image_url, 3600);
      setAvatarUrl(
        data?.signedUrl ? `${data.signedUrl}&cb=${Date.now()}` : null
      );
      setAvatarLoaded(false);
    })();
  }, [profile?.profile_image_url]);

  const onChange = (field: keyof Profile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
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
        dob: profile.dob,
        profile_image_url: profile.profile_image_url,
        bio: profile.bio,
        phone: profile.phone,
        location: profile.location,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (upErr) setError(upErr.message);
    else {
      setSuccess('Profile updated.');
      window.dispatchEvent(new Event('profile-updated'));
    }
    setSaving(false);
  };

  const uploadAvatar = async (rawFile: File) => {
    if (!userId) return;
    setSaving(true);

    const file = await ensureDisplayableImage(rawFile);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${userId}/avatar.${ext}`;

    await supabase.storage
      .from('user-media')
      .upload(path, file, { upsert: true });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[13px] uppercase tracking-[0.22em] text-[#9B8E7D]">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#17120E]">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HEADER — full bleed, matches FamilyHeader
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative overflow-hidden" style={{ background: 'rgb(250,245,235)' }}>
        <div className="px-[clamp(1.5rem,3vw,4rem)] py-[clamp(2rem,3vw,3rem)]">
          <div className="mx-auto max-w-[1200px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#B8932A]">
              My Account
            </p>

            <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              {/* Left — avatar + name */}
              <div className="flex items-center gap-5 sm:gap-7">
                {/* Avatar */}
                <label className="group relative shrink-0 cursor-pointer">
                  <div
                    className="h-[clamp(5rem,10vw,7.5rem)] w-[clamp(5rem,10vw,7.5rem)] overflow-hidden border-2 flex items-center justify-center"
                    style={{ borderColor: '#C8A557', backgroundColor: '#EDE8DC' }}
                  >
                    {avatarUrl ? (
  <div className="relative h-full w-full">
    <Image
      src={avatarUrl}
      alt="Avatar"
      fill
      sizes="240px"
      quality={90}
      className={`object-cover transition-opacity duration-300 ${
        avatarLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      priority
      onLoadingComplete={() => setAvatarLoaded(true)}
    />
  </div>
) : (
                      <span className="text-[11px] uppercase tracking-wide text-[#9B8E7D]">
                        No photo
                      </span>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-[#16120C]/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Camera className="h-5 w-5 text-white" strokeWidth={1.8} />
                    </div>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadAvatar(f);
                    }}
                  />
                </label>

                {/* Name + badge */}
                <div className="min-w-0">
                  <h1
                    className="font-serif font-bold leading-[0.95] text-[#1A1612]"
                    style={{
                      fontSize: 'clamp(1.8rem, 4vw, 3.2rem)',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {profile?.full_name || 'Your Profile'}
                  </h1>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#E4D2AE] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#A06A1C]">
                      <Shield size={12} className="text-[#B8924A]" strokeWidth={1.8} />
                      Member since {formattedDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right — meta stats (desktop) */}
              <div className="hidden md:flex items-center gap-6">
                <MetaStat icon={<Mail size={14} strokeWidth={1.6} />} label="Email" value={userEmail ?? '—'} />
                <MetaStat icon={<MapPin size={14} strokeWidth={1.6} />} label="Location" value={profile?.location || '—'} />
              </div>
            </div>

            {/* Mobile meta row */}
            <div className="mt-4 flex flex-wrap items-center gap-4 md:hidden">
              <span className="text-[13px] text-[#57534E]">{userEmail ?? '—'}</span>
              {profile?.location && (
                <>
                  <span className="text-[#DCC7A4]">·</span>
                  <span className="text-[13px] text-[#57534E]">{profile.location}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom gold line */}
        <div
          className="h-[3px]"
          style={{
            background: 'linear-gradient(to right, rgba(184,147,42,0.9), rgba(184,147,42,0.3))',
          }}
        />
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FORM — matches ActionHub / LibrarySection layout
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="w-full bg-[#FCFAF7] px-4 sm:px-6 py-10">
        <div className="mx-auto max-w-[1200px]">
          {/* Section heading */}
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#B8924A]">
                Your Details
              </p>
              <h3 className="mt-2 font-serif text-[28px] leading-[1.1] tracking-[-0.03em] text-[#17120E]">
                The details that{' '}
                <em className="italic text-[#A9782F]">define you</em>
              </h3>
            </div>
            <p className="hidden sm:block text-[14px] text-[#7D6F5F] text-right">
              All changes save when you hit the button below.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            {/* ── Contact card ── */}
            <div
              className="rounded-[20px] border bg-[#FFFDF9] px-5 py-6 sm:px-8 sm:py-8 shadow-[0_14px_36px_rgba(44,36,27,0.05)]"
              style={{ borderColor: '#EAD8B8' }}
            >
              <div className="mb-5 flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#B8924A]" strokeWidth={1.7} />
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#B8924A]">
                  Contact
                </p>
              </div>

              <div className="space-y-5">
                <Field label="Email" icon={<Mail size={15} strokeWidth={1.5} />}>
                  <input
                    type="email"
                    value={userEmail ?? ''}
                    disabled
                    className="h-[52px] w-full rounded-[12px] border border-[#E7DFD3] bg-[#F5F0E8] px-4 text-[14px] text-[#9B8E7D] outline-none"
                    style={{ cursor: 'not-allowed' }}
                  />
                  <p className="mt-1.5 text-[12px] text-[#9B8E7D]">
                    Email is managed through your login and cannot be changed here.
                  </p>
                </Field>

                <Field label="Phone" icon={<Phone size={15} strokeWidth={1.5} />}>
                  <ProfileInput
                    type="tel"
                    placeholder="+44 7700 900000"
                    value={profile?.phone ?? ''}
                    onChange={(v) => onChange('phone', v)}
                  />
                </Field>

                <Field label="Location" icon={<MapPin size={15} strokeWidth={1.5} />}>
                  <ProfileInput
                    type="text"
                    placeholder="London, UK"
                    value={profile?.location ?? ''}
                    onChange={(v) => onChange('location', v)}
                  />
                </Field>
              </div>
            </div>

            {/* ── Personal details card ── */}
            <div
              className="rounded-[20px] border bg-[#FFFDF9] px-5 py-6 sm:px-8 sm:py-8 shadow-[0_14px_36px_rgba(44,36,27,0.05)]"
              style={{ borderColor: '#EAD8B8' }}
            >
              <div className="mb-5 flex items-center gap-2.5">
                <UserIcon className="h-4 w-4 text-[#B8924A]" strokeWidth={1.7} />
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#B8924A]">
                  Personal Details
                </p>
              </div>

              <div className="space-y-5">
                <Field label="Full name" icon={<UserIcon size={15} strokeWidth={1.5} />}>
                  <ProfileInput
                    type="text"
                    placeholder="e.g. Michael Brown"
                    value={profile?.full_name ?? ''}
                    onChange={(v) => onChange('full_name', v)}
                  />
                </Field>

                <Field label="Date of birth" icon={<Calendar size={15} strokeWidth={1.5} />}>
                  <ProfileInput
                    type="date"
                    value={profile?.dob ?? ''}
                    onChange={(v) => onChange('dob', v)}
                    className="uppercase"
                  />
                </Field>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ABOUT — alternating bg like LibrarySection
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="w-full bg-white px-4 sm:px-6 py-10">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#6F6255]">
              Your Story
            </p>
            <h3 className="mt-2 font-serif text-[28px] leading-[1.1] tracking-[-0.03em] text-[#17120E]">
              A few words about{' '}
              <em className="italic text-[#A9782F]">you</em>
            </h3>
          </div>

          <div
            className="rounded-[20px] border bg-[#FFFDF9] px-5 py-6 sm:px-8 sm:py-8 shadow-[0_14px_36px_rgba(44,36,27,0.05)]"
            style={{ borderColor: '#EAD8B8' }}
          >
            <textarea
              rows={6}
              placeholder="Share a little about yourself — stories your family will love to remember…"
              value={profile?.bio ?? ''}
              onChange={(e) => onChange('bio', e.target.value)}
              className="w-full rounded-[12px] border border-[#DCC7A4] bg-white px-5 py-4 text-[15px] leading-[1.8] text-[#2C241B] outline-none transition placeholder:text-[#9B8E7D] focus:border-[#C8A557] resize-y"
              style={{ minHeight: '160px' }}
            />
          </div>

          {/* ── Save bar ── */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {success && (
                <p className="text-[14px] font-medium text-emerald-600">
                  {success}
                </p>
              )}
              {error && (
                <p className="text-[14px] font-medium text-red-500">
                  {error}
                </p>
              )}
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="flex h-[52px] items-center justify-center gap-2.5 rounded-[12px] bg-[#C8A557] px-8 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(184,146,74,0.2)] transition hover:bg-[#B8924A] disabled:opacity-50 w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────
   UI Helpers
   ───────────────────────────────────────────── */

function MetaStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white/70 text-[#A9782F]">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-[#9B8E7D]">
          {label}
        </p>
        <p className="text-[13px] font-semibold text-[#17120E] truncate max-w-[200px]">
          {value}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        {icon && <span className="text-[#9B8E7D]">{icon}</span>}
        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6F6255]">
          {label}
        </span>
      </div>
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
      className={`h-[52px] w-full rounded-[12px] border border-[#DCC7A4] bg-white px-4 text-[14px] text-[#2C241B] outline-none transition placeholder:text-[#9B8E7D] focus:border-[#C8A557] ${className}`}
    />
  );
}