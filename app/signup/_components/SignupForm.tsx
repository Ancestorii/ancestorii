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
    sessionStorage.setItem('family_name', familyName.trim());
    setStep(2);
  };

  // Google signup
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

      // Check if this was an invite signup
      const hadInvite = !!sessionStorage.getItem('invite_token');

      // Clean up sessionStorage
      sessionStorage.removeItem('family_name');
      sessionStorage.removeItem('invite_token');

      // Allow auth cookies to persist
      await new Promise((res) => setTimeout(res, 200));

      // Invited users go straight to dashboard, new users write first memory
      router.replace(hadInvite ? '/dashboard/home' : '/onboarding/first-memory');
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center px-5 sm:px-8 pt-10 sm:pt-14 md:pt-16 pb-12"
      style={{ background: '#FFFDF8', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Logo */}
      <Link href="/" className="inline-block text-[34px] sm:text-[38px] tracking-[-0.03em] text-[#181512] no-underline mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 }}>
        Ancestor<span className="text-[#C8A557]">ii</span>
      </Link>

      {/* Tagline */}
      <p className="text-[13px] sm:text-[14px] text-[#181512] mb-10 text-center max-w-[360px] leading-relaxed">
        Stories, voices, and the moments no photo can capture. All in one place your family can share and grow.
      </p>

      <div className="w-full max-w-[440px]">
        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`h-[3px] transition-all duration-300 ${step === 1 ? 'w-8 bg-[#B8932A]' : 'w-2.5 bg-[#ECE5D8]'}`} />
          <div className={`h-[3px] transition-all duration-300 ${step === 2 ? 'w-8 bg-[#B8932A]' : 'w-2.5 bg-[#ECE5D8]'}`} />
        </div>

        {/* ── Step 1 ── */}
        {step === 1 && (
          <>
            <h2 className="text-[26px] sm:text-[30px] tracking-[-0.03em] text-[#181512] leading-[1.05] text-center mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
              Name your <span className="italic text-[#A9782F]">Family Library.</span>
            </h2>
            <p className="text-[13px] text-[#181512] text-center mb-7 leading-relaxed max-w-[340px] mx-auto">
              You&apos;ll be the owner. Invite family members to contribute memories, photos, and stories together.
            </p>

            <div className="border border-[#ECE5D8] bg-white px-7 py-8 sm:px-9 sm:py-10">
              <div className="space-y-5">
                <div>
                  <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">Family Library Name</label>
                  <input required value={familyName} onChange={(e) => { setFamilyName(e.target.value); setError(''); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleContinue(); } }} placeholder="e.g. The Smith Family" className="w-full border border-[#E0D6C8] px-3.5 py-2.5 text-[14px] text-[#181512] placeholder-[#C0B9AE] focus:outline-none focus:border-[#B8932A] focus:ring-1 focus:ring-[#B8932A]" style={{ background: '#FDFCFA' }} />
                </div>

                {familyName.trim() && (
                  <div className="border border-[#ECE5D8] bg-[#FDFCFA] px-4 py-3 text-center">
                    <p className="text-[11px] text-[#8A7F72] uppercase tracking-[0.12em] mb-0.5">Your library</p>
                    <p className="text-[17px] font-medium text-[#181512]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>{familyName.trim()}</p>
                  </div>
                )}

                {error && <div className="border border-[#E8C4C0] bg-[#FDF6F5] px-4 py-3"><p className="text-[13px] text-[#8B3A32]">{error}</p></div>}

                <button type="button" onClick={handleContinue} className="w-full py-3 text-[13px] font-semibold tracking-[0.04em] text-[#FFFDF8] transition-all hover:shadow-lg active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #B8932A 0%, #C8A557 100%)' }}>
                  Continue
                </button>
              </div>

              <p className="text-center text-[13px] mt-6 pt-5 border-t border-[#ECE5D8] text-[#8A7F72]">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-[#B8932A] no-underline hover:text-[#96751E]">Log in</Link>
              </p>
            </div>

            <p className="text-center text-[11px] text-[#B5AFA6] tracking-[0.04em] mt-5">No credit card required · Takes 2 minutes</p>
          </>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <>
            <h2 className="text-[26px] sm:text-[30px] tracking-[-0.03em] text-[#181512] leading-[1.05] text-center mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
              Create your <span className="italic text-[#A9782F]">account.</span>
            </h2>
            <p className="text-[13px] text-[#8A7F72] text-center mb-7">Almost there — just need your details.</p>

            <div className="border border-[#ECE5D8] bg-white px-7 py-8 sm:px-9 sm:py-10">
              <button type="button" onClick={() => { setStep(1); setError(''); }} className="flex items-center gap-1 text-[12px] font-medium text-[#8A7F72] hover:text-[#B8932A] transition-colors mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Back
              </button>

              <button type="button" onClick={handleGoogleSignup} className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-[#E0D6C8] text-[13px] font-medium text-[#3D3526] transition-all duration-200 hover:border-[#B8932A] hover:text-[#181512] active:scale-[0.98]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5"><path fill="#EA4335" d="M24 9.5c3.2 0 6 1.1 8.2 3.2l6.1-6.1C34.6 2.4 29.7 0 24 0 14.6 0 6.4 5.8 2.6 14.2l7.5 5.8C12.1 13.2 17.6 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4H24v7.6h12.6c-.3 2-1.6 5-4.4 7l6.8 5.3c4-3.7 7.1-9.2 7.1-15.9z"/><path fill="#FBBC05" d="M10.1 28c-1-3-1-6.2 0-9.2l-7.5-5.8C.9 16.3 0 20 0 24c0 4 1 7.7 2.6 11l7.5-5.8z"/><path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-6.8-5.3c-1.9 1.3-4.5 2.2-9.2 2.2-6.4 0-11.9-3.7-13.9-8.5l-7.5 5.8C6.4 42.2 14.6 48 24 48z"/></svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-5"><div className="flex-1 h-px bg-[#ECE5D8]" /><span className="text-[11px] tracking-[0.08em] uppercase text-[#B5AFA6] font-medium">or</span><div className="flex-1 h-px bg-[#ECE5D8]" /></div>

              <form onSubmit={onSubmit} noValidate className="space-y-5">
                <div>
                  <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">Full Name</label>
                  <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border border-[#E0D6C8] px-3.5 py-2.5 text-[14px] text-[#181512] focus:outline-none focus:border-[#B8932A] focus:ring-1 focus:ring-[#B8932A]" style={{ background: '#FDFCFA' }} />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">Email</label>
                  <input required type="email" value={email} onChange={(e) => { setEmail(e.target.value); setEmailSuggestion(null); if (emailError) setEmailError(''); }} onBlur={() => { if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Please enter a valid email address.'); } else { setEmailError(''); } }} className={`w-full border px-3.5 py-2.5 text-[14px] text-[#181512] focus:outline-none focus:border-[#B8932A] focus:ring-1 focus:ring-[#B8932A] ${emailError ? 'border-[#C25550]' : 'border-[#E0D6C8]'}`} style={{ background: '#FDFCFA' }} />
                  {emailError && <p className="mt-1.5 text-[12px] text-[#8B3A32]">{emailError}</p>}
                  {emailSuggestion && (
                    <button type="button" onClick={() => { setEmail(emailSuggestion); setEmailSuggestion(null); setError(''); }} className="mt-1.5 text-[12px] text-[#B8932A] hover:text-[#96751E] underline">
                      Use {emailSuggestion} instead
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">Password</label>
                  <div className="relative">
                    <input required type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-[#E0D6C8] px-3.5 py-2.5 pr-16 text-[14px] text-[#181512] focus:outline-none focus:border-[#B8932A] focus:ring-1 focus:ring-[#B8932A]" style={{ background: '#FDFCFA' }} />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#8A7F72] hover:text-[#B8932A] transition-colors">{showPassword ? 'Hide' : 'Show'}</button>
                  </div>
                  {password && (
                    <div className="mt-2 h-[3px] bg-[#ECE5D8]">
                      <div className={`h-[3px] transition-all duration-300 ${strength === 'weak' ? 'bg-[#C25550] w-1/3' : strength === 'medium' ? 'bg-[#C8A557] w-2/3' : 'bg-[#5A8A4A] w-full'}`} />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">
                    Promo / Referral Code <span className="font-normal text-[#B5AFA6]">(optional)</span>
                  </label>
                  <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="w-full border border-[#E0D6C8] px-3.5 py-2.5 text-[14px] text-[#181512] focus:outline-none focus:border-[#B8932A] focus:ring-1 focus:ring-[#B8932A]" style={{ background: '#FDFCFA' }} />
                </div>

                <div className="flex items-start gap-3 pt-1">
                  <input type="checkbox" checked={newsletter} onChange={() => setNewsletter(!newsletter)} className="mt-0.5 accent-[#B8932A]" />
                  <span className="text-[12px] sm:text-[13px] text-[#6F6255] leading-relaxed">Send me updates on preserving family memories</span>
                </div>

                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} required className="mt-0.5 accent-[#B8932A]" />
                  <span className="text-[12px] sm:text-[13px] text-[#6F6255] leading-relaxed">
                    I agree to the{' '}
                    <Link href="/terms" className="text-[#B8932A] hover:text-[#96751E]">Terms</Link>{' '}and{' '}
                    <Link href="/privacy-policy" className="text-[#B8932A] hover:text-[#96751E]">Privacy Policy</Link>
                  </span>
                </div>

                {error && <div className="border border-[#E8C4C0] bg-[#FDF6F5] px-4 py-3"><p className="text-[13px] text-[#8B3A32] leading-relaxed whitespace-pre-line">{error}</p></div>}

                <button disabled={loading} className="w-full py-3 text-[13px] font-semibold tracking-[0.04em] text-[#FFFDF8] transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #B8932A 0%, #C8A557 100%)' }}>
                  {loading ? 'Creating your library…' : `Create ${familyName.trim() || 'your'} Library`}
                </button>
              </form>

              <p className="text-center text-[13px] mt-6 pt-5 border-t border-[#ECE5D8] text-[#8A7F72]">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-[#B8932A] no-underline hover:text-[#96751E]">Log in</Link>
              </p>
            </div>

            <p className="text-center text-[11px] text-[#B5AFA6] tracking-[0.04em] mt-5">No credit card required · Takes 2 minutes</p>
          </>
        )}
      </div>
    </div>
  );
}