'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { User as UserIcon, PenLine } from 'lucide-react';

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
  const router = useRouter();

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
    ? 'clamp(2.1rem,3.8vw,4.25rem)'
    : len <= 25
    ? 'clamp(1.9rem,3.2vw,3.4rem)'
    : len <= 35
    ? 'clamp(1.5rem,2.7vw,2.7rem)'
    : 'clamp(1.3rem,2.1vw,2.1rem)';
  const mobileSize = len <= 15
    ? 'clamp(1.9rem,6.8vw,2.55rem)'
    : len <= 25
    ? 'clamp(1.5rem,5.5vw,2.1rem)'
    : len <= 35
    ? 'clamp(1.3rem,4.7vw,1.9rem)'
    : 'clamp(1.1rem,3.8vw,1.5rem)';

  return (
    <section className="relative overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Desktop + Tablet */}
      <div className="hidden md:block" style={{ background: 'rgb(250,245,235)' }}>
        <div className="px-[clamp(1.5rem,3vw,4rem)] py-[clamp(1.7rem,2vw,2rem)]">
          <div className="flex items-end justify-between gap-6">
            {/* Left — name + stats */}
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B8932A]">
                {todayLabel}
              </p>
              <h1 className="mt-2 font-serif font-bold leading-[0.95] text-[#1A1612]" style={{ fontSize: desktopSize, letterSpacing: '-0.03em' }}>
                {familyName}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFFFF] border border-[#E4D2AE] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#A06A1C]">
                  <UserIcon size={12} className="text-[#B8924A]" />
                  {familyRole}
                </span>
                <span className="text-[12px] text-[#57534E]">
                  {familyMemberCount} {familyMemberCount === 1 ? 'member' : 'members'} · {totalMemories} {totalMemories === 1 ? 'memory' : 'memories'} preserved
                </span>
              </div>
            </div>

            {/* Right — CTAs */}
            <div className="flex items-center gap-3 flex-shrink-0 pb-1">
  <button
    onClick={() => router.push('/dashboard/memories/create')}
    className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98]"
    style={{ background: 'linear-gradient(135deg, #B8932A 0%, #C8A557 100%)' }}
  >
    <PenLine size={15} />
    Write a memory
  </button>
</div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden" style={{ background: 'rgb(250,245,235)' }}>
        <div className="px-[clamp(1.5rem,3vw,4rem)] py-[clamp(1.7rem,2vw,2.5rem)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B8932A]">
            {todayLabel}
          </p>
          <h1 className="mt-2 font-serif font-bold leading-[0.95] text-[#1A1612]" style={{ fontSize: mobileSize, letterSpacing: '-0.03em' }}>
            {familyName}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFFFF] border border-[#E4D2AE] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#A06A1C]">
              <UserIcon size={12} className="text-[#B8924A]" />
              {familyRole}
            </span>
            <span className="text-[12px] text-[#57534E]">
              {familyMemberCount} {familyMemberCount === 1 ? 'member' : 'members'} · {totalMemories} {totalMemories === 1 ? 'memory' : 'memories'} preserved
            </span>
          </div>
          {/* CTAs */}
          <div className="mt-3 flex items-center gap-2.5">
            <button
              onClick={() => router.push('/dashboard/memories/create')}
              className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-white transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #B8932A 0%, #C8A557 100%)' }}
            >
              <PenLine size={14} />
              Write a memory
            </button>
          </div>
        </div>
      </div>

      {/* Bottom gold line */}
      <div className="h-[2px]" style={{ background: 'linear-gradient(to right, rgba(184,147,42,0.9), rgba(184,147,42,0.3))' }} />
    </section>
  );
}