'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';

export default function Nav() {
  const supabase = getBrowserClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUserEmail(data.user.email ?? null);
    };
    getUser();
  }, []);

  useEffect(() => {
    document.body.style.overflow = isVideoOpen ? 'hidden' : 'auto';
  }, [isVideoOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    router.push('/');
  };

  const links = [
    { href: '/', label: 'Home' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/memory-books', label: 'Memory Books' },
    { href: '/guides', label: 'Guides' },
  ];

  return (
    <>
      <header className="relative bg-[#FFFDF6] text-[#0F2040]">

        <Image
          src="/parchment.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.15] pointer-events-none -z-10"
        />

        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#E3B341]" />

        <div className="w-full px-6 md:px-10 lg:px-20 xl:px-28 py-6">

          {/* SCALE WRAPPER */}
          <div className="flex items-center justify-between md:scale-[0.85] lg:scale-100 origin-top">

            {/* LOGO */}
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/logo.png"
                alt="Ancestorii Logo"
                width={300}
                height={85}
                className="w-[160px] sm:w-[180px] md:w-[200px] lg:w-[260px] object-contain"
                priority
              />
            </Link>

            {/* NAV LINKS */}
            <nav className="hidden xl:flex flex-1 items-center justify-center gap-10 xl:gap-14">

              {links.map((link) => {
                const active = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative font-serif text-[1.15rem] tracking-wide px-2 whitespace-nowrap"
                  >
                    {link.label}
                    <span
                      className={`absolute left-0 -bottom-2 h-[2px] bg-[#E3B341] transition-all duration-300 ${
                        active ? 'w-full' : 'w-0 hover:w-full'
                      }`}
                    />
                  </Link>
                );
              })}

              <button
                onClick={() => setIsVideoOpen(true)}
                className="relative font-serif text-[1.15rem] tracking-wide px-2 whitespace-nowrap"
              >
                Watch Demo
              </button>

            </nav>

            {/* ACTION BUTTONS */}
            <div className="hidden xl:flex items-center gap-8 shrink-0">

              {userEmail ? (
                <>
                  <Link
                    href="/dashboard/home"
                    className="font-serif text-[1.05rem] px-3 py-2 rounded-full hover:bg-black/5 transition"
                  >
                    Home
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="font-serif text-[1.05rem] px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-7 py-2.5 border-2 border-[#0F2040] font-serif text-[1.05rem] rounded-full hover:bg-[#0F2040] hover:text-white transition whitespace-nowrap"
                  >
                    Login
                  </Link>

                  <Link
                    href="/signup"
                    className="px-9 py-3 bg-[#E3B341] text-[#0F2040] font-serif text-[1.1rem] rounded-full shadow-md hover:bg-[#d6a834] transition whitespace-nowrap"
                  >
                    Start For Free
                  </Link>
                </>
              )}

            </div>

            {/* MOBILE MENU */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="xl:hidden text-3xl font-serif"
            >
              {isOpen ? '×' : '☰'}
            </button>

          </div>

          {/* MOBILE DROPDOWN */}
          {isOpen && (
            <div className="xl:hidden mt-8">

              <div className="px-2 space-y-6 font-serif text-xl">

                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block w-full"
                  >
                    {link.label}
                  </Link>
                ))}

                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsVideoOpen(true);
                  }}
                  className="block w-full text-left"
                >
                  Watch Demo
                </button>

                <div className="pt-6 border-t border-[#E3B341] space-y-5">

                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-6 py-3 border-2 border-[#0F2040] rounded-full text-center"
                  >
                    Login
                  </Link>

                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-6 py-3 bg-[#E3B341] rounded-full text-center"
                  >
                    Start For Free
                  </Link>

                </div>

              </div>

            </div>
          )}

        </div>
      </header>

      {/* VIDEO MODAL */}
      {isVideoOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center px-6"
          onClick={() => setIsVideoOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          <div className="relative w-full max-w-[1100px]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute -top-14 right-0 text-white text-4xl opacity-70 hover:opacity-100 transition"
            >
              ×
            </button>

            <div className="relative rounded-2xl overflow-hidden">

              <video
                src="/ancestorii_cinematic.mp4"
                controls
                autoPlay
                className="w-full max-h-[82vh]"
              />

              <div className="pointer-events-none absolute inset-0 bg-black/15" />

            </div>
          </div>
        </div>
      )}
    </>
  );
}