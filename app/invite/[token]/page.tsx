'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBrowserClient } from '@/lib/supabase/browser';

interface InviteDetails {
  valid: boolean;
  email: string;
  role: string;
  familyName: string;
  inviterName: string;
}

export default function InvitePage() {
  const supabase = getBrowserClient();
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState('');

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const getStrength = (pwd: string) => {
    if (pwd.length < 6) return 'weak';
    if (/[A-Z]/.test(pwd) && /\d/.test(pwd) && pwd.length >= 8) return 'strong';
    return 'medium';
  };

  const strength = getStrength(password);

  // Fetch invite details on mount
  useEffect(() => {
    async function fetchInvite() {
      try {
        const res = await fetch(`/api/invite/${token}`);
        const data = await res.json();

        if (!res.ok || !data.valid) {
          setInviteError(data.error || 'This invite is no longer valid.');
          return;
        }

        setInvite(data);
      } catch {
        setInviteError('Unable to load invite details.');
      } finally {
        setLoadingInvite(false);
      }
    }

    if (token) fetchInvite();
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');

    if (!agree) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: invite!.email,
        password,
        options: {
          data: {
            full_name: fullName,
            invite_token: token,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Allow auth cookies to persist
      await new Promise((res) => setTimeout(res, 200));

      // Redirect to dashboard
      router.replace('/dashboard/our-family');
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong');
      setLoading(false);
    }
  };

  // ── Loading state ──
  if (loadingInvite) {
    return (
      <main className="min-h-screen bg-[#fffdf7] flex items-center justify-center px-6">
        <div className="w-full max-w-md mx-auto bg-white border border-[#d4af37]/30 rounded-2xl shadow-md p-6 text-center">
          <p className="text-[#0f2040]/60">Loading your invitation…</p>
        </div>
      </main>
    );
  }

  // ── Invalid/expired invite ──
  if (inviteError) {
    return (
      <main className="min-h-screen bg-[#fffdf7] flex items-center justify-center px-6">
        <div className="w-full max-w-md mx-auto bg-white border border-[#d4af37]/30 rounded-2xl shadow-md p-6 text-center">
          <h1 className="text-2xl font-extrabold text-[#0f2040] mb-4">
            Invitation Unavailable
          </h1>
          <p className="text-[#0f2040]/70 mb-6">{inviteError}</p>
          <Link
            href="/signup"
            className="inline-block bg-[#d4af37] px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition"
          >
            Create your own account
          </Link>
        </div>
      </main>
    );
  }

  // ── Valid invite — show signup form ──
  return (
    <main className="min-h-screen bg-[#fffdf7] flex flex-col items-center justify-center px-6 py-16">
      {/* Headline */}
      <div className="w-full max-w-screen-xl mx-auto mb-10 px-[clamp(1.5rem,5vw,5rem)] text-center">
        <h2 className="text-[clamp(2.25rem,6vw,3.75rem)] font-extrabold tracking-tight leading-[1.1] text-[#0F2040]">
          You&apos;re invited to join
          <br />
          <span className="text-[#D4AF37]">{invite!.familyName}</span>
        </h2>
        <p className="text-sm sm:text-base text-[#0F2040]/80 mt-3">
          {invite!.inviterName} wants you to help preserve your family&apos;s memories.
        </p>
      </div>

      {/* Signup form */}
      <div className="w-full max-w-md mx-auto bg-white border border-[#d4af37]/30 rounded-2xl shadow-md p-6 pb-10">
        <h1 className="text-3xl font-extrabold text-[#0f2040] text-center mb-4">
          Create your account
        </h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block font-semibold text-sm mb-1">Full Name</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2.5 rounded-lg border focus:ring-[#d4af37]"
            />
          </div>

          <div>
            <label className="block font-semibold text-sm mb-1">Email</label>
            <input
              type="email"
              value={invite!.email}
              disabled
              className="w-full p-2.5 rounded-lg border bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-[#0f2040]/50 mt-1">
              This is the email the invite was sent to
            </p>
          </div>

          <div>
            <label className="block font-semibold text-sm mb-1">Password</label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 pr-12 rounded-lg border focus:ring-[#d4af37]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#0F2040]/70 hover:text-[#D4AF37]"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {password && (
              <div className="mt-2 h-2 bg-gray-200 rounded-full">
                <div
                  className={`h-2 rounded-full transition-all ${
                    strength === 'weak'
                      ? 'bg-red-500 w-1/3'
                      : strength === 'medium'
                      ? 'bg-yellow-500 w-2/3'
                      : 'bg-green-500 w-full'
                  }`}
                />
              </div>
            )}
          </div>

          <div className="flex items-start gap-3 text-xs sm:text-sm">
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
              required
            />
            I agree to the{' '}
            <Link href="/terms" className="underline text-[#d4af37]">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy-policy" className="underline text-[#d4af37]">
              Privacy Policy
            </Link>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            disabled={loading}
            className="w-full bg-[#d4af37] text-white py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition"
          >
            {loading ? 'Joining family…' : `Join ${invite!.familyName}`}
          </button>
        </form>

        <p className="text-center text-sm mt-5">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#0f2040]">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}