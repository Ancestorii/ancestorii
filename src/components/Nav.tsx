'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';

export default function Nav() {
  const supabase = getBrowserClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  // check logged in user
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setUserEmail(data.user.email ?? null);
      }
    };
    getUser();
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    router.push('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(15,32,64,0.08)]'
          : 'bg-white shadow-[0_2px_12px_rgba(15,32,64,0.04)]'
      }`}
    >
      <nav className="relative px-6 lg:px-12 py-3">
        {/* ✅ MAIN FLEX ROW */}
        <div className="flex items-center justify-between mx-auto max-w-screen-2xl">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img
              src="/logo1.png"
              className="h-11 md:h-14 lg:h-[3.8rem]"
              alt="Ancestorii Logo"
            />
          </Link>

          {/* Desktop buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {userEmail ? (
              <button
                onClick={handleLogout}
                className="px-5 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 shadow-sm hover:shadow-[0_0_12px_rgba(255,0,0,0.3)] transition-all"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-32 px-5 py-2 text-sm font-medium text-white bg-[#0F2040] rounded-lg text-center hover:bg-[#1a2c5b] shadow-sm hover:shadow-[0_0_12px_rgba(15,32,64,0.4)] transition-all"
                >
                  Log In
                </Link>
                <Link
                  href="/signup" prefetch
                  className="w-32 px-5 py-2 text-sm font-medium text-white bg-[#D4AF37] rounded-lg text-center hover:bg-[#c39b2e] hover:shadow-[0_0_15px_rgba(212,175,55,0.6)] transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-700 rounded-md hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile dropdown */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-[#f0f0f0]">
            <ul className="flex flex-col space-y-3 font-medium py-4">
              <li className="pt-2 border-t border-gray-200">
                {userEmail ? (
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
                  >
                    Logout
                  </button>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link
                      href="/login"
                      className="w-full px-5 py-2 text-sm font-medium text-white bg-[#0F2040] rounded-lg text-center hover:bg-[#1a2c5b]"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup" prefetch
                      className="w-full px-5 py-2 text-sm font-medium text-white bg-[#D4AF37] rounded-lg text-center hover:bg-[#c39b2e]"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>

        {/* Gold underline */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
      </nav>
    </header>
  );
}
