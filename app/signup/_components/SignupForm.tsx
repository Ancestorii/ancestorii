'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';

export default function SignupForm() {
  const supabase = getBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Capture invite token from URL (e.g. /signup?invite_token=xxx)
  useEffect(() => {
  const token = searchParams.get('invite_token');
  if (token) sessionStorage.setItem('invite_token', token);
}, [searchParams]);

  // Step state
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [familyName, setFamilyName] = useState('');

  // Step 2 fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [emailError, setEmailError] = useState('');

  // Shared state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getStrength = (pwd: string) => {
    if (pwd.length < 6) return 'weak';
    if (/[A-Z]/.test(pwd) && /\d/.test(pwd) && pwd.length >= 8) return 'strong';
    return 'medium';
  };

  const strength = getStrength(password);

  // Step 1 → Step 2
  const handleContinue = () => {
    if (!familyName.trim()) {
      setError('Give your family library a name to continue.');
      return;
    }
    setError('');
    // Save to sessionStorage for Google OAuth flow
    sessionStorage.setItem('family_name', familyName.trim());
    setStep(2);
  };

  // Google signup
  const handleGoogleSignup = async () => {
    setError('');
    // family_name is already in sessionStorage from step 1
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

  // Email signup
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');

    if (!agree) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    setEmailSuggestion(null);

    // Validate email via Kickbox
    try {
      const validateRes = await fetch('/api/validate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const validation = await validateRes.json();

      if (!validation.allow) {
        if (validation.did_you_mean) {
          setEmailSuggestion(validation.did_you_mean);
          setError(`Did you mean ${validation.did_you_mean}?`);
        } else if (validation.disposable) {
          setError('Please use a permanent email address.');
        } else {
          setError('This email address appears to be invalid. Please check it.');
        }
        setLoading(false);
        return;
      }
    } catch {
      // Validation failed — proceed anyway (fail open)
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            family_name: familyName.trim(),
            invite_token: sessionStorage.getItem('invite_token') || null,
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

      // Clean up sessionStorage
      sessionStorage.removeItem('family_name');
      sessionStorage.removeItem('invite_token');

      // Allow auth cookies to persist
      await new Promise((res) => setTimeout(res, 200));

      // Redirect to dashboard
      router.replace('/dashboard/home');
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* ── Progress dots ── */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className={`h-2.5 rounded-full transition-all duration-300 ${
          step === 1 ? 'w-8 bg-[#d4af37]' : 'w-2.5 bg-[#d4af37]/30'
        }`} />
        <div className={`h-2.5 rounded-full transition-all duration-300 ${
          step === 2 ? 'w-8 bg-[#d4af37]' : 'w-2.5 bg-[#d4af37]/30'
        }`} />
      </div>

      {/* ── Step 1: Name your library ── */}
      {step === 1 && (
        <>
          {/* Headline above card */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-[#0F2040]">
              Start your
              <br />
              <span className="text-[#D4AF37]">Family Library</span>
            </h2>
            <p className="text-sm sm:text-base text-[#0F2040]/70 mt-3 max-w-sm mx-auto">
              You&apos;ll be the owner. Invite family members to contribute memories, photos, and stories together.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white border border-[#d4af37]/30 rounded-2xl shadow-md p-6 pb-8">
            <div className="space-y-5">
              <div>
                <label className="block font-semibold text-sm mb-1 text-[#0f2040]">
                  Family Library Name
                </label>
                <input
                  required
                  value={familyName}
                  onChange={(e) => {
                    setFamilyName(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleContinue();
                    }
                  }}
                  placeholder="e.g. The Smith Family"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] text-[#0f2040]"
                />
              </div>

              {/* Live preview */}
              {familyName.trim() && (
                <div className="bg-[#FDFAF5] border border-[#d4af37]/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-[#0F2040]/50 uppercase tracking-widest mb-1">
                    Your library will appear as
                  </p>
                  <p className="text-xl font-bold text-[#0F2040]">
                    {familyName.trim()}
                  </p>
                </div>
              )}

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="button"
                onClick={handleContinue}
                className="w-full bg-[#d4af37] text-white py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition"
              >
                Continue
              </button>
            </div>

            <p className="text-center text-sm mt-5 text-[#0f2040]/60">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#0f2040]">
                Log in
              </Link>
            </p>
          </div>

          {/* Free reassurance */}
          <p className="text-center text-sm font-semibold text-[#0F2040] mt-6">
            Completely free. <span className="text-[#D4AF37]">No payment details required.</span>
          </p>
        </>
      )}

      {/* ── Step 2: Create your account ── */}
      {step === 2 && (
        <>
          {/* Headline above card */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-[#0F2040]">
              Create your
              <br />
              <span className="text-[#D4AF37]">account</span>
            </h2>
            <p className="text-sm sm:text-base text-[#0F2040]/70 mt-3">
              Almost there — just need your details.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white border border-[#d4af37]/30 rounded-2xl shadow-md p-6 pb-8">
            {/* Back button */}
            <button
              type="button"
              onClick={() => { setStep(1); setError(''); }}
              className="text-sm text-[#0f2040]/60 hover:text-[#d4af37] transition mb-4 flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Back
            </button>

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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailSuggestion(null);
                    if (emailError) setEmailError('');
                  }}
                  onBlur={() => {
                    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                      setEmailError('Please enter a valid email address.');
                    } else {
                      setEmailError('');
                    }
                  }}
                  className={`w-full p-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] ${
                    emailError ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-500">{emailError}</p>
                )}
                {emailSuggestion && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(emailSuggestion);
                      setEmailSuggestion(null);
                      setError('');
                    }}
                    className="mt-1 text-sm text-[#d4af37] underline"
                  >
                    Use {emailSuggestion} instead
                  </button>
                )}
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

              <div>
                <label className="block font-semibold text-sm mb-1 text-[#0f2040]">
                  Promo / Referral Code <span className="font-normal text-[#0f2040]/50">(optional)</span>
                </label>
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37]"
                />
              </div>

              <div className="flex items-start gap-3 text-xs sm:text-sm">
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={() => setNewsletter(!newsletter)}
                  className="mt-0.5"
                />
                <span className="text-[#0f2040]/70">Send me updates on preserving family memories</span>
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
                className="w-full bg-[#d4af37] text-white py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition"
              >
                {loading
                  ? 'Creating your library…'
                  : `Create ${familyName.trim() || 'your'} Library`}
              </button>
            </form>

            <p className="text-center text-sm mt-5 text-[#0f2040]/60">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#0f2040]">
                Log in
              </Link>
            </p>
          </div>
        </>
      )}
    </div>
  );
}