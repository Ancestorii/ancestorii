'use client';

import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';

export default function StoryCTA({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();

  if (isLoggedIn) return null;

  return (
    <section className="w-full bg-[#FCFAF7] px-4 sm:px-6 py-16">
      <div className="mx-auto max-w-[520px] text-center">
        <div className="mx-auto mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#F5EDD8]">
          <Heart className="h-6 w-6 text-[#A9782F]" strokeWidth={1.6} />
        </div>

        <h3
          className="text-[26px] leading-[1.15] tracking-[-0.02em] text-[#17120E]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Every family has a story{' '}
          <em className="italic text-[#A9782F]">worth keeping.</em>
        </h3>

        <p className="mt-4 text-[15px] leading-[1.8] text-[#6F6255]">
          Start preserving yours — share memories, upload photos, and build
          something your family can hold onto.
        </p>

        <button
          onClick={() => router.push('/signup')}
          className="mt-7 inline-flex h-[52px] items-center justify-center rounded-[12px] bg-[#C8A557] px-8 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(184,146,74,0.2)] transition hover:bg-[#B8924A]"
        >
          Start Your Family Library
        </button>
      </div>
    </section>
  );
}