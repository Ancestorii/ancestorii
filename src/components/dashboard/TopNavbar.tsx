'use client';

import Image from 'next/image';
import Link from 'next/link';
import { User as UserIcon } from 'lucide-react';
import NotificationBell from "../../../app/dashboard/_components/NotificationBell";

type Props = {
  scrolled: boolean;
  fullName: string | null;
  userEmail: string | null;
  avatarUrl: string | null;
  handleLogout: () => void;
};

export default function TopNavbar({
  scrolled,
  fullName,
  userEmail,
  avatarUrl,
  handleLogout,
}: Props) {
  return (
    <header
      className={`fixed top-0 left-0 xl:left-[270px] w-full xl:w-[calc(100%-270px)] z-[100] will-change-transform transform-gpu backface-hidden transition-all duration-500 ${
        scrolled
          ? 'bg-white shadow-sm'
          : 'bg-gradient-to-r from-white to-[#F7F8FA] shadow-[0_2px_12px_rgba(15,32,64,0.06)]'
      } rounded-br-2xl border-b border-[#D4AF37]/20`}
    >
      <nav className="relative px-4 sm:px-6 md:px-10 py-2 md:py-4">
        <div className="flex items-center mx-auto max-w-screen-2xl">

          {/* LOGO */}
          <Link href="/dashboard/home" className="flex items-center">
            <img
              src="/logo.png"
              className="mr-3 h-11 md:h-14 lg:h-[3.8rem]"
              alt="Ancestorii Logo"
            />
          </Link>

          {/* DESKTOP RIGHT SIDE */}
          <div className="hidden lg:flex items-center gap-5 ml-auto mr-24">

            <NotificationBell />

            <span className="text-2xl font-bold text-[#0F2040] tracking-wide">
              Hi{' '}
              <span className="text-[#D4AF37] font-extrabold bg-clip-text hover:animate-shimmer transition">
                {fullName || userEmail || 'Guest'}
              </span>
            </span>

            {/* Avatar */}
            <Link
              href="/dashboard/home"
              className="h-12 w-12 rounded-full overflow-hidden border-2 border-[#D4AF37]/40 flex items-center justify-center bg-white hover:shadow-[0_0_12px_rgba(212,175,55,0.4)] hover:scale-105 transition-all duration-300"
            >
              {avatarUrl ? (
                <div className="relative h-full w-full">
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    fill
                    sizes="48px"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <UserIcon className="h-6 w-6 text-[#0F2040]" />
              )}
            </Link>

            {/* Logout — desktop and above */}
<div className="hidden lg:block pl-5 border-l border-gray-300">
              <button
                onClick={handleLogout}
                className="px-5 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 shadow-sm hover:shadow-[0_0_12px_rgba(255,0,0,0.3)] transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* GOLD DIVIDER */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/80 to-transparent" />
      </nav>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .animate-shimmer {
          background: linear-gradient(90deg, #d4af37, #fff8d4, #d4af37);
          background-size: 200%;
          animation: shimmer 3s infinite linear;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </header>
  );
}