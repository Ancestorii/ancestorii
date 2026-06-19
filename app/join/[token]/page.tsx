// app/join/[token]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBrowserClient } from '@/lib/supabase/browser';

interface LinkDetails {
  valid: boolean;
  familyName: string;
  creatorName: string;
}

export default function JoinPage() {
  const supabase = getBrowserClient();
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  // ── Link lookup state ──
  const [linkDetails, setLinkDetails] = useState<LinkDetails | null>(null);
  const [loadingLink, setLoadingLink] = useState(true);
  const [linkError, setLinkError] = useState('');

  // ── Auth state ──
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ── Signup form state ──
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Join (logged-in) state ──
  const [joining, setJoining] = useState(false);

  const getStrength = (pwd: string) => {
    if (pwd.length < 6) return 'weak';
    if (/[A-Z]/.test(pwd) && /\d/.test(pwd) && pwd.length >= 8) return 'strong';
    return 'medium';
  };

  const strength = getStrength(password);

  // Check auth status
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, [supabase]);

  // Fetch link details on mount
  useEffect(() => {
    async function fetchLink() {
      try {
        const res = await fetch(`/api/join/${token}`);
        const data = await res.json();

        if (!res.ok || !data.valid) {
          setLinkError(data.error || 'This invite link is no longer valid.');
          return;
        }

        setLinkDetails(data);
      } catch {
        setLinkError('Unable to load invite details.');
      } finally {
        setLoadingLink(false);
      }
    }

    if (token) fetchLink();
  }, [token]);

  // ── Join family (logged-in user) ──
  const handleJoin = async () => {
    if (joining) return;
    setJoining(true);
    setError('');

    try {
      const res = await fetch('/api/join-via-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to join family');
        setJoining(false);
        return;
      }

      router.replace('/dashboard/home');
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong');
      setJoining(false);
    }
  };

  // ── Signup + join (new user) ──
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
      // 1. Sign up — trigger creates profile + solo family
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Allow auth cookies to persist
      await new Promise((res) => setTimeout(res, 300));

      // 2. Now join the family via the link token
      const joinRes = await fetch('/api/join-via-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const joinData = await joinRes.json();

      if (!joinRes.ok) {
        // Signed up but join failed — still redirect, they can try again
        console.error('Join after signup failed:', joinData.error);
      }

      router.replace('/dashboard/home');
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong');
      setLoading(false);
    }
  };

  // Google signup + join
  const handleGoogleSignup = async () => {
    setError('');
    // Store the join token so we can process it after OAuth callback
    sessionStorage.setItem('join_token', token);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
    }
  };

  // ── Loading state ──
  if (loadingLink || checkingAuth) {
    return (
      <main className="min-h-screen bg-[#fffdf7] flex items-center justify-center px-6">
        <div className="w-full max-w-md mx-auto bg-white border border-[#d4af37]/30 rounded-2xl shadow-md p-6 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-[3px] border-[#E1C99D] border-t-[#C8A557]" />
          <p className="text-[#0f2040]/60">Loading your invitation…</p>
        </div>
      </main>
    );
  }

  // ── Invalid/deactivated link ──
  if (linkError) {
    return (
      <main className="min-h-screen bg-[#fffdf7] flex items-center justify-center px-6">
        <div className="w-full max-w-md mx-auto bg-white border border-[#d4af37]/30 rounded-2xl shadow-md p-6 text-center">
          <h1 className="text-2xl font-extrabold text-[#0f2040] mb-4">
            Link Unavailable
          </h1>
          <p className="text-[#0f2040]/70 mb-6">{linkError}</p>
          <Link
            href="/signup"
            className="inline-block bg-[#d4af37] px-6 py-3 rounded-full font-semibold text-white shadow-md hover:shadow-lg transition"
          >
            Create your own library
          </Link>
        </div>
      </main>
    );
  }

  // ── Logged-in user: show join button ──
  if (isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#fffdf7] flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-screen-xl mx-auto mb-10 px-[clamp(1.5rem,5vw,5rem)] text-center">
          <h2 className="text-[clamp(2.25rem,6vw,3.75rem)] font-extrabold tracking-tight leading-[1.1] text-[#0F2040]">
            You&apos;ve been invited to
            <br />
            <span className="text-[#D4AF37]">{linkDetails!.familyName}</span>
          </h2>
          <p className="text-sm sm:text-base text-[#0F2040]/80 mt-3">
            {linkDetails!.creatorName} wants you to help preserve your family&apos;s memories.
          </p>
        </div>

        <div className="w-full max-w-md mx-auto bg-white border border-[#d4af37]/30 rounded-2xl shadow-md p-6 pb-10 text-center">
          <h3 className="text-2xl font-extrabold text-[#0f2040] mb-3">
            Join this library
          </h3>
          <p className="text-[#0f2040]/70 mb-6">
            You&apos;ll be able to view and contribute to everything in{' '}
            <span className="font-semibold">{linkDetails!.familyName}</span>.
          </p>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full bg-[#d4af37] text-white py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition disabled:opacity-50"
          >
            {joining ? 'Joining…' : `Join ${linkDetails!.familyName}`}
          </button>

          <p className="text-center text-sm mt-5 text-[#0f2040]/60">
            Wrong account?{' '}
            <Link href="/login" className="font-semibold text-[#0f2040]">
              Switch account
            </Link>
          </p>
        </div>
      </main>
    );
  }

  // ── Not logged in: show signup form ──
  return (
    <main className="min-h-screen bg-[#fffdf7] flex flex-col items-center justify-center px-6 py-16">
      {/* Headline */}
      <div className="w-full max-w-screen-xl mx-auto mb-10 px-[clamp(1.5rem,5vw,5rem)] text-center">
        <h2 className="text-[clamp(2.25rem,6vw,3.75rem)] font-extrabold tracking-tight leading-[1.1] text-[#0F2040]">
          You&apos;ve been invited to
          <br />
          <span className="text-[#D4AF37]">{linkDetails!.familyName}</span>
        </h2>
        <p className="text-sm sm:text-base text-[#0F2040]/80 mt-3">
          {linkDetails!.creatorName} wants you to help preserve your family&apos;s memories.
        </p>
      </div>

      {/* Signup form */}
      <div className="w-full max-w-md mx-auto bg-white border border-[#d4af37]/30 rounded-2xl shadow-md p-6 pb-8">
        <h1 className="text-3xl font-extrabold text-[#0f2040] text-center mb-2">
          Create your account
        </h1>
        <p className="text-center text-sm text-[#0f2040]/60 mb-6">
          Sign up to join {linkDetails!.familyName}
        </p>

        {/* Google signup */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
            <path fill="#EA4335" d="M24 9.5c3.2 0 6 1.1 8.2 3.2l6.1-6.1C34.6 2.4 29.7 0 24 0 14.6 0 6.4 5.8 2.6 14.2l7.5 5.8C12.1 13.2 17.6 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4H24v7.6h12.6c-.3 2-1.6 5-4.4 7l6.8 5.3c4-3.7 7.1-9.2 7.1-15.9z"/>
            <path fill="#FBBC05" d="M10.1 28c-1-3-1-6.2 0-9.2l-7.5-5.8C.9 16.3 0 20 0 24c0 4 1 7.7 2.6 11l7.5-5.8z"/>
            <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-6.8-5.3c-1.9 1.3-4.5 2.2-9.2 2.2-6.4 0-11.9-3.7-13.9-8.5l-7.5 5.8C6.4 42.2 14.6 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="px-3 text-sm text-gray-400">or</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>

        {/* Email signup form */}
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <div>
            <label className="block font-semibold text-sm mb-1 text-[#0f2040]">Full Name</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37]"
            />
          </div>

          <div>
            <label className="block font-semibold text-sm mb-1 text-[#0f2040]">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37]"
            />
          </div>

          <div>
            <label className="block font-semibold text-sm mb-1 text-[#0f2040]">Password</label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 pr-12 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37]"
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
              className="mt-0.5"
            />
            <span className="text-[#0f2040]/70">
              I agree to the{' '}
              <Link href="/terms" className="underline text-[#d4af37]">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="underline text-[#d4af37]">
                Privacy Policy
              </Link>
            </span>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            disabled={loading}
            className="w-full bg-[#d4af37] text-white py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Creating account…' : `Join ${linkDetails!.familyName}`}
          </button>
        </form>

        <p className="text-center text-sm mt-5 text-[#0f2040]/60">
          Already have an account?{' '}
          <Link
            href={`/login?redirect=/join/${token}`}
            className="font-semibold text-[#0f2040]"
          >
            Log in
          </Link>
        </p>
      </div>

      {/* Free reassurance */}
      <p className="text-center text-sm font-semibold text-[#0F2040] mt-6">
        Completely free. <span className="text-[#D4AF37]">No payment details required.</span>
      </p>
    </main>
  );
}