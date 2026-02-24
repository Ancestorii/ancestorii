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

        <div className="max-w-[1600px] mx-auto px-6 lg:px-20 py-6">

          <div className="flex items-center justify-between">

            {/* LOGO */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo1.png"
                alt="Ancestorii Logo"
                width={260}
                height={70}
                className="hidden lg:block object-contain"
                priority
              />
              <Image
                src="/logo1.png"
                alt="Ancestorii Logo"
                width={170}
                height={50}
                className="block lg:hidden object-contain"
                priority
              />
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden lg:flex items-center gap-6">

              {links.map((link) => {
                const active = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative font-serif text-[1.15rem] tracking-wide px-2"
                  >
                    {link.label}
                    <span
                      className={`
                        absolute left-0 -bottom-2 h-[2px] bg-[#E3B341] transition-all duration-300
                        ${active ? 'w-full' : 'w-0 hover:w-full'}
                      `}
                    />
                  </Link>
                );
              })}

              <button
                onClick={() => setIsVideoOpen(true)}
                className="relative font-serif text-[1.15rem] tracking-wide px-2"
              >
                Watch Demo
              </button>

            </nav>

            {/* DESKTOP ACTIONS */}
            <div className="hidden lg:flex items-center gap-8">

              {userEmail ? (
                <>
                  <Link href="/app" className="font-serif text-[1.05rem]">
                    Library
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="font-serif text-[1.05rem]"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-7 py-2.5 border-2 border-[#0F2040] font-serif text-[1.05rem] rounded-full hover:bg-[#0F2040] hover:text-white transition"
                  >
                    Login
                  </Link>

                  <Link
                    href="/signup"
                    className="px-9 py-3 bg-[#E3B341] text-[#0F2040] font-serif text-[1.1rem] rounded-full shadow-md hover:bg-[#d6a834] transition"
                  >
                    Start For Free
                  </Link>
                </>
              )}

            </div>

            {/* MOBILE TOGGLE */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-3xl font-serif"
            >
              {isOpen ? '×' : '☰'}
            </button>

          </div>

          {/* MOBILE MENU */}
          {isOpen && (
            <div className="lg:hidden mt-8">

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

                  {userEmail ? (
                    <>
                      <Link
                        href="/app"
                        onClick={() => setIsOpen(false)}
                        className="block w-full"
                      >
                        Library
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}

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

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6))]" />

          <div
            className="relative w-full max-w-[1100px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute -top-14 right-0 text-white text-4xl opacity-70 hover:opacity-100 transition"
            >
              ×
            </button>

            <div className="relative rounded-2xl overflow-hidden">

  <video
    src="/demo-video-v2.mp4"
    controls
    autoPlay
    className="w-full max-h-[82vh]"
  />

  {/* cinematic scrim */}
  <div className="pointer-events-none absolute inset-0 bg-black/15" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}