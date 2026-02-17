'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';

export default function SignupForm() {
  const supabase = getBrowserClient();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [newsletter, setNewsletter] = useState(false);
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

  // ---------------------------
// GOOGLE SIGNUP
// ---------------------------
const handleGoogleSignup = async () => {
  setError('');

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
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            promo_code: promoCode || null,
            newsletter_opt_in: newsletter,
          },
        },
      });

      if (signUpError) throw signUpError;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Send verification email (non-blocking)
      if (session?.user && !sessionStorage.getItem('verification_sent')) {
        sessionStorage.setItem('verification_sent', '1');

        supabase.functions.invoke('send-verification-email', {
          body: {
            userId: session.user.id,
            email: session.user.email,
          },
        });
      }

      // 🔵 META — COMPLETE REGISTRATION
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'CompleteRegistration');
      }

      // 🔴 REDDIT — COMPLETE REGISTRATION
      if (typeof window !== 'undefined' && (window as any).rdt) {
        (window as any).rdt('track', 'CompleteRegistration');
      }

      // 🟡 GA / GTM — SIGNUP COMPLETE
      if (typeof window !== 'undefined') {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({ event: 'signup_complete' });
      }

      // ⏳ Allow auth cookies to persist
      await new Promise((res) => setTimeout(res, 200));

      // ✅ Redirect to dashboard
      router.replace('/dashboard/home');
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-[#d4af37]/30 rounded-2xl shadow-md p-6">
      <h1 className="text-3xl font-extrabold text-[#0f2040] text-center">
        Create your Ancestorii account
      </h1>
      {/* Google Signup */}
<button
  type="button"
  onClick={handleGoogleSignup}
  className="w-full mb-5 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="h-5 w-5"
  >
    <path fill="#EA4335" d="M24 9.5c3.2 0 6 1.1 8.2 3.2l6.1-6.1C34.6 2.4 29.7 0 24 0 14.6 0 6.4 5.8 2.6 14.2l7.5 5.8C12.1 13.2 17.6 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4H24v7.6h12.6c-.3 2-1.6 5-4.4 7l6.8 5.3c4-3.7 7.1-9.2 7.1-15.9z"/>
    <path fill="#FBBC05" d="M10.1 28c-1-3-1-6.2 0-9.2l-7.5-5.8C.9 16.3 0 20 0 24c0 4 1 7.7 2.6 11l7.5-5.8z"/>
    <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-6.8-5.3c-1.9 1.3-4.5 2.2-9.2 2.2-6.4 0-11.9-3.7-13.9-8.5l-7.5 5.8C6.4 42.2 14.6 48 24 48z"/>
  </svg>
  Continue with Google
</button>

<div className="flex items-center my-4">
  <div className="flex-grow h-px bg-gray-200" />
  <span className="px-3 text-sm text-gray-400">or</span>
  <div className="flex-grow h-px bg-gray-200" />
</div>


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
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 rounded-lg border focus:ring-[#d4af37]"
          />
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

        <div>
          <label className="block font-semibold text-sm mb-1">
            Promo / Referral Code (optional)
          </label>
          <input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="w-full p-2.5 rounded-lg border focus:ring-[#d4af37]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={newsletter}
            onChange={() => setNewsletter(!newsletter)}
          />
          Keep me updated
        </div>

        <div className="flex items-center gap-2 text-xs">
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
          className="w-full bg-[#d4af37] py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm mt-5">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-[#0f2040]">
          Log in
        </Link>
      </p>
    </div>
  );
}
