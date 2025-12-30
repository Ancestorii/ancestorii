'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';

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

      const { data: prof } = await supabase.from('Profiles').select('*').eq('id', uid).maybeSingle();

      if (!prof) {
        const { data: inserted } = await supabase
          .from('Profiles')
          .insert({ id: uid })
          .select('*')
          .single();
        setProfile(inserted);
      } else {
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
      return;
    }

    const { data } = await supabase.storage
      .from("user-media")
      .createSignedUrl(profile.profile_image_url, 3600);

    setAvatarUrl(
      data?.signedUrl ? `${data.signedUrl}&cb=${Date.now()}` : null
    );
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

  const uploadAvatar = async (file: File) => {
    if (!userId) return;
    setSaving(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${userId}/avatar.${ext}`;
    await supabase.storage.from('user-media').upload(path, file, { upsert: true });
    await supabase.from('Profiles').update({ profile_image_url: path }).eq('id', userId);
    setProfile((p) => (p ? { ...p, profile_image_url: path } : p));
    // 🔥 Tell the rest of the app the avatar changed
setTimeout(() => {
  window.dispatchEvent(new Event("profile-image-updated"));
}, 150);
    setSaving(false);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[#0f2040] text-white">
        <div className="px-4 py-5 md:px-8 md:py-7 flex flex-col md:flex-row md:justify-between md:items-start gap-5 md:gap-6">
          {/* Left side - Avatar + info */}
          <div className="flex flex-col md:flex-row md:items-start gap-5 md:gap-6">
            {/* Avatar */}
            <div className="shrink-0 flex md:block items-center gap-4">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden border-2 border-[#d4af37] bg-white/10 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-white/70">No photo</span>
                )}
              </div>

              <label className="mt-0 md:mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/25 bg-white/10 text-xs font-medium cursor-pointer hover:bg-white/20">
                Upload new photo
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
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-semibold leading-tight">
                {profile?.full_name || 'Your profile'}
              </h1>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge
                  label="Member since"
                  value={memberSince ? new Date(memberSince).toLocaleDateString() : '—'}
                />
                <Badge label="Email" value={userEmail ?? '—'} />
              </div>
            </div>
          </div>

          {/* Right side - Stats */}
          <div className="flex gap-3 md:mt-0">
            <ProfileStat label="Location" value={profile?.location ?? '—'} />
            <ProfileStat label="Status" value="Active" />
          </div>
        </div>
      </section>

      {/* Content grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Contact */}
        <AccentCard title="Contact" accent="gold">

          <Field label="Email">
            <input
              type="email"
              value={userEmail ?? ''}
              disabled
              className="w-full rounded-md border px-3 py-2 bg-white text-slate-700 border-slate-300 text-sm md:text-base"
            />
          </Field>

          <Field label="Phone">
            <input
              type="tel"
              placeholder="+44 7700 900000"
              value={profile?.phone ?? ''}
              onChange={(e) => onChange('phone', e.target.value)}
              className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] border-slate-300 text-sm md:text-base"
            />
          </Field>

          <Field label="Location">
            <input
              type="text"
              placeholder="London, UK"
              value={profile?.location ?? ''}
              onChange={(e) => onChange('location', e.target.value)}
              className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] border-slate-300 text-sm md:text-base"
            />
          </Field>
        </AccentCard>

        {/* Personal details */}
        <AccentCard title="Personal details" accent="navy">
          <Field label="Full name">
            <input
              type="text"
              placeholder="e.g. Dante Leon"
              value={profile?.full_name ?? ''}
              onChange={(e) => onChange('full_name', e.target.value)}
              className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[#0f2040] focus:border-[#0f2040] border-slate-300 text-sm md:text-base"
            />
          </Field>

          <Field label="Date of birth">
            <input
              type="date"
              value={profile?.dob ?? ''}
              onChange={(e) => onChange('dob', e.target.value)}
              className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[#0f2040] focus:border-[#0f2040] border-slate-300 text-sm md:text-base"
            />
          </Field>
        </AccentCard>
      </section>

      {/* About */}
      <section className="grid grid-cols-1 gap-4 md:gap-6">
        <AccentCard title="About" accent="lavender">
          <textarea
            rows={4}
            placeholder="Share a little about yourself — stories your family will love to remember…"
            value={profile?.bio ?? ''}
            onChange={(e) => onChange('bio', e.target.value)}
            className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-violet-300 focus:border-violet-300 border-violet-200 text-sm md:text-base"
          />
        </AccentCard>
      </section>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
        {success && <span className="text-green-600 text-sm">{success}</span>}
        {error && <span className="text-red-600 text-sm">{error}</span>}

        <button
          onClick={saveProfile}
          disabled={saving}
          className="inline-flex justify-center items-center px-4 md:px-5 py-2 rounded-md text-white bg-[#0f2040] hover:bg-[#152a52] disabled:opacity-50 w-full sm:w-auto"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

/* ---------- UI Helpers ---------- */
function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 md:gap-2 rounded-full border border-[#d4af37]/60 bg-white/90 px-2.5 md:px-3 py-1 text-[11px] md:text-xs text-[#0f2040] shadow-sm max-w-full">
      <span className="font-medium text-slate-500 truncate">{label}</span>
      <span className="font-semibold text-[#0f2040] truncate">{value}</span>
    </div>
  );
}

function ProfileStat({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="rounded-lg border border-slate-300/60 bg-white/80 px-3 py-2 text-left min-w-[140px]">
      <div className="text-[10px] md:text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="text-sm font-semibold text-[#0f2040]">{value ?? '—'}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      {children}
    </label>
  );
}

function AccentCard({
  title,
  accent = 'gold',
  children,
}: {
  title: string;
  accent?: 'gold' | 'navy' | 'lavender';
  children: React.ReactNode;
}) {
  const accents = {
    gold: {
      bar: 'from-[#f8e2a6] via-[#d4af37] to-[#b68f1f]',
      chip: 'bg-amber-50 text-amber-900 ring-1 ring-amber-200',
    },
    navy: {
      bar: 'from-[#152a52] via-[#0f2040] to-[#0c1a33]',
      chip: 'bg-slate-100 text-[#0f2040] ring-1 ring-slate-200',
    },
    lavender: {
      bar: 'from-violet-100 via-violet-200 to-violet-300',
      chip: 'bg-violet-50 text-violet-900 ring-1 ring-violet-200',
    },
  }[accent];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className={`h-1.5 w-full bg-gradient-to-r ${accents.bar}`} />
      <div className="p-4 md:p-6">
        <div
          className={`inline-flex items-center px-2.5 md:px-3 py-1 rounded-full text-[11px] md:text-xs font-semibold ${accents.chip}`}
        >
          {title}
        </div>
        <div className="mt-3 md:mt-4 grid grid-cols-1 gap-3 md:gap-4">{children}</div>
      </div>
    </div>
  );
}
