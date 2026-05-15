'use client';

import { Users, UserPlus } from 'lucide-react';

export default function OurFamilyHeader({
  familyName,
  memberCount,
  myRole,
  canInvite,
  onInvite,
}: {
  familyName: string;
  memberCount: number;
  myRole: string;
  canInvite: boolean;
  onInvite: () => void;
}) {
  const roleLabel =
    myRole === 'owner' ? 'Owner' : myRole === 'admin' ? 'Admin' : 'Member';

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'rgb(250,245,235)' }}
    >
      <div className="px-[clamp(1.5rem,3vw,4rem)] py-[clamp(2.5rem,3vw,3.5rem)]">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#B8932A]">
            Our Family
          </p>

          <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            {/* Left — family name + meta */}
            <div className="min-w-0 flex-1">
              <h1
                className="font-serif font-bold leading-[0.95] text-[#1A1612]"
                style={{
                  fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                  letterSpacing: '-0.03em',
                }}
              >
                {familyName}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#E4D2AE] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#A06A1C]">
                  <Users size={12} className="text-[#B8924A]" strokeWidth={1.8} />
                  {roleLabel}
                </span>

                <span className="text-[14px] text-[#57534E]">
                  {memberCount} {memberCount === 1 ? 'member' : 'members'}
                </span>
              </div>

              <p className="mt-4 max-w-[520px] text-[15px] leading-[1.7] text-[#6F6255]">
                Everyone here shares your family library — the photos, timelines,
                albums, and stories you&apos;re preserving together.
              </p>
            </div>

            {/* Right — invite button */}
            {canInvite && (
              <div className="flex-shrink-0">
                <button
                  onClick={onInvite}
                  className="inline-flex items-center justify-center gap-2.5 h-[52px] rounded-[12px] bg-[#C8A557] px-7 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(184,146,74,0.2)] transition hover:bg-[#B8924A]"
                >
                  <UserPlus size={16} strokeWidth={1.8} />
                  Invite Member
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom gold line */}
      <div
        className="h-[3px]"
        style={{
          background:
            'linear-gradient(to right, rgba(184,147,42,0.9), rgba(184,147,42,0.3))',
        }}
      />
    </section>
  );
}