'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation'; // ✅ added

export default function SignupPage() {
  const router = useRouter(); // ✅ added

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const features = [
    {
      title: 'Upload Photos & Videos',
      description: 'Save your most cherished memories with ease and security.',
    },
    {
      title: 'Timelines & Albums',
      description: 'Organize your life events into beautiful collections.',
    },
    {
      title: 'Memory Capsules',
      description: 'Add voice notes and lock memories for the future.',
    },
    {
      title: 'Private & Secure',
      description: 'Safeguard your memories so they remain accessible for generations.',
    },
    {
      title: 'Unlimited Growth',
      description: 'From a single moment to a lifetime of stories — scale effortlessly.',
    },
    {
      title: '24/7 Secure Access',
      description: 'Access your memories anytime, anywhere, fully protected.',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [features.length]);

  const getStrength = (pwd: string) => {
    if (pwd.length < 6) return 'weak';
    if (/[A-Z]/.test(pwd) && /\d/.test(pwd) && pwd.length >= 8) return 'strong';
    return 'medium';
  };
  const strength = getStrength(password);

const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  if (!agree) {
    setError('You must agree to the Terms of Service and Privacy Policy.');
    return;
  }

  setLoading(true);

 const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/confirm`,
    data: {
      full_name: fullName,
      promo_code: promoCode || null,
      newsletter_opt_in: newsletter,
    },
  },
});

setLoading(false);

if (error) {
  setError(error.message);
  return;
}

// 🔑 Email confirmation ON → user exists but no session yet
if (data.user && !data.session) {
  setSuccess(
    'Account created! Please check your email to confirm your account before choosing a plan.'
  );
  return;
}

// 🔑 Email confirmation OFF (instant login)
router.push('/choose-plan');};


  return (
    <main className="h-screen overflow-hidden flex flex-col md:flex-row">
      {/* LEFT: Signup Form */}
      <div className="md:w-1/2 w-full bg-[#fffdf7] flex items-center justify-center px-6 border-r border-[#d4af37]/40">
        <div className="w-full max-w-md bg-white border border-[#d4af37]/30 rounded-2xl shadow-md p-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0f2040] text-center">
            Create Your Ancestorii Account
          </h1>
          <p className="text-center text-gray-600 mt-2 text-sm">
            Preserve your family legacy securely and beautifully.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-[#0f2040] font-semibold mb-1 text-sm">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#d4af37] outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-[#0f2040] font-semibold mb-1 text-sm">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#d4af37] outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-[#0f2040] font-semibold mb-1 text-sm">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#d4af37] outline-none text-sm"
              />

              {password.length > 0 && (
                <>
                  <div className="mt-2 h-2 w-full bg-gray-200 rounded-full">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        strength === 'weak'
                          ? 'w-1/3 bg-red-500'
                          : strength === 'medium'
                          ? 'w-2/3 bg-yellow-500'
                          : 'w-full bg-green-500'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use 8+ characters with a mix of letters, numbers, and symbols.
                  </p>
                </>
              )}
            </div>

            <div>
              <label className="block text-[#0f2040] font-semibold mb-1 text-sm">
                Promo / Referral Code (optional)
              </label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#d4af37] outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newsletter}
                onChange={() => setNewsletter(!newsletter)}
                className="w-4 h-4 text-[#d4af37] focus:ring-[#d4af37] rounded"
              />
              <label className="text-gray-700 text-xs">
                Keep me updated with new features and stories.
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={agree}
                onChange={() => setAgree(!agree)}
                required
                className="w-4 h-4 text-[#d4af37] focus:ring-[#d4af37] rounded"
              />
              <label className="text-gray-700 text-xs">
                I agree to the{' '}
                <Link href="/terms" className="text-[#d4af37] underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[#d4af37] underline">
                  Privacy Policy
                </Link>.
              </label>
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {success && (
            <div className="mt-4 rounded-xl border border-[#d4af37]/40 bg-[#fffdf7] p-4 text-center">
           <p className="font-semibold text-[#0f2040] mb-1">
             Confirm your email to continue
            </p>
            <p className="text-sm text-gray-600">
            We’ve sent a confirmation link to your email.  
            Please confirm your email address before choosing your plan.
           </p>
           <p className="text-xs text-gray-500 mt-2">
           Didn’t receive it? Check your spam folder or try again shortly.
          </p>
          </div>
           )}
            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full bg-[#d4af37] hover:bg-[#b9972b] text-black text-sm font-semibold py-3 rounded-full shadow-md transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.6)] disabled:opacity-60"
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>

            <p className="text-center text-gray-500 text-xs mt-3">
              Secure & encrypted • Private by default • Cancel anytime
            </p>
          </form>

          <p className="text-center text-gray-600 text-sm mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-[#0f2040] font-semibold hover:text-[#d4af37]">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT: Carousel Side */}
      <motion.div
        className="md:w-1/2 w-full flex flex-col justify-center items-center text-center text-white px-10 py-10 relative"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        style={{ backgroundColor: '#1a2c5b' }}
      >
        <div className="flex flex-col justify-center items-center h-full space-y-12">
          <div>
            <h2 className="text-3xl font-extrabold text-[#D4AF37] mb-3">
              Built for memories that last generations.
            </h2>
            <p className="text-gray-200 max-w-md mx-auto text-lg">
              Every photo, story, and milestone preserved with purpose — for your family’s legacy.
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -40 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            >
              <div className="bg-[#FFFFFF] p-10 rounded-2xl shadow-lg max-w-sm mx-auto border border-[#d4af37]/140 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <h3 className="text-xl font-semibold text-[#D4AF37] mb-4">
                  {features[currentIndex].title}
                </h3>
                <p className="text-[#0F2040] leading-relaxed text-base">
                  {features[currentIndex].description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex space-x-2">
            {features.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'bg-[#D4AF37] w-4' : 'bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
