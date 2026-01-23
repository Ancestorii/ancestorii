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

      // Send verification email (non-blocking UX)
      if (session?.user && !sessionStorage.getItem('verification_sent')) {
        sessionStorage.setItem('verification_sent', '1');

        supabase.functions.invoke('send-verification-email', {
          body: {
            userId: session.user.id,
            email: session.user.email,
          },
        });
      }

       // 🔵 META PIXEL — COMPLETE REGISTRATION (EMAIL SIGNUP)
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "CompleteRegistration");
      }

      // ⏳ Allow auth cookies to persist
      await new Promise((res) => setTimeout(res, 200));

      // ✅ ALWAYS REDIRECT TO DASHBOARD
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
