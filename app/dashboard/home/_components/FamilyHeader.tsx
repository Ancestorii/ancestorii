'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { User as UserIcon } from 'lucide-react';

export default function FamilyHeader({
  familyName,
  familyRole,
  familyMemberCount,
  totalMemories,
}: {
  familyName: string;
  familyRole: string;
  familyMemberCount: number;
  totalMemories: number;
}) {
  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  const len = familyName.length;
  const desktopSize = len <= 15
    ? 'clamp(2.5rem,4.5vw,5rem)'
    : len <= 25
    ? 'clamp(2.2rem,3.8vw,4rem)'
    : len <= 35
    ? 'clamp(1.8rem,3.2vw,3.2rem)'
    : 'clamp(1.5rem,2.5vw,2.5rem)';
  const mobileSize = len <= 15
    ? 'clamp(2.2rem,8vw,3rem)'
    : len <= 25
    ? 'clamp(1.8rem,6.5vw,2.5rem)'
    : len <= 35
    ? 'clamp(1.5rem,5.5vw,2.2rem)'
    : 'clamp(1.3rem,4.5vw,1.8rem)';

  return (
    <section className="relative overflow-hidden">
      <div className="hidden md:grid" style={{ gridTemplateColumns: '7fr 3fr' }}>
        {/* Left — Content */}
        <div className="relative flex flex-col justify-center px-[clamp(1.5rem,3vw,4rem)] py-[clamp(2.5rem,3vw,3.5rem)]" style={{ background: 'rgb(250,245,235)' }}>
          <div className="relative z-10">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#B8932A]">
              {todayLabel}
            </p>

            <h1 className="mt-3 font-serif font-bold leading-[0.95] text-[#1A1612]" style={{ fontSize: desktopSize, letterSpacing: '-0.03em' }}>
              {familyName}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFFFF] border border-[#E4D2AE] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#A06A1C]">
                <UserIcon size={12} className="text-[#B8924A]" />
                {familyRole}
              </span>
              <span className="text-[14px] text-[#57534E]">
                {familyMemberCount} {familyMemberCount === 1 ? 'member' : 'members'} · {totalMemories} {totalMemories === 1 ? 'memory' : 'memories'} preserved
              </span>
            </div>
          </div>
        </div>

        {/* Right — Image */}
        <div className="relative w-full h-full overflow-hidden">
          <Image
            src="/hero.png"
            alt=""
            fill
            priority
            quality={60}
            sizes="33vw"
            className="object-cover"
            style={{ objectPosition: '60% 20%' }}
          />

          {/* Soft wide fade — no hard seam */}
          <div className="absolute inset-y-0 left-0 w-[70%] pointer-events-none bg-gradient-to-r from-[#faf5eb] via-[#faf5eb]/50 to-transparent" />

          {/* Bottom fade */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-[#f0eadc]/20" />
        </div>
      </div>

      {/* Mobile — no image */}
      <div className="md:hidden px-[clamp(1.5rem,3vw,4rem)] py-[clamp(2rem,2.5vw,3rem)]" style={{ background: 'rgb(250,245,235)' }}>
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#B8932A]">
          {todayLabel}
        </p>

        <h1 className="mt-3 font-serif font-bold leading-[0.95] text-[#1A1612]" style={{ fontSize: mobileSize, letterSpacing: '-0.03em' }}>
          {familyName}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFFFF] border border-[#E4D2AE] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#A06A1C]">
            <UserIcon size={12} className="text-[#B8924A]" />
            {familyRole}
          </span>
          <span className="text-[14px] text-[#57534E]">
            {familyMemberCount} {familyMemberCount === 1 ? 'member' : 'members'} · {totalMemories} {totalMemories === 1 ? 'memory' : 'memories'} preserved
          </span>
        </div>
      </div>

      {/* Bottom gold line */}
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, rgba(184,147,42,0.9), rgba(184,147,42,0.3))' }} />
    </section>
  );
}