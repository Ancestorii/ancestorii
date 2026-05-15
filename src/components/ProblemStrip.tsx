'use client';

/* ─── ICONS ─── */
const PhoneIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="2" width="12" height="20" rx="2" />
    <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" />
    <line x1="9" y1="6" x2="15" y2="12" opacity="0.5" />
    <line x1="15" y1="6" x2="9" y2="12" opacity="0.5" />
  </svg>
);

const CloudIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    <line x1="14" y1="15" x2="10" y2="15" opacity="0.5" />
  </svg>
);

const StoriesIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" opacity="0.5" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" opacity="0.5" />
  </svg>
);

const AlbumIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" opacity="0.5" />
  </svg>
);

const problems = [
  {
    icon: <PhoneIcon />,
    title: 'Phones break',
    text: 'One cracked screen and years of photos just vanish.',
  },
  {
    icon: <CloudIcon />,
    title: 'Clouds aren\'t forever',
    text: 'Services shut down. Accounts expire. Nobody sends a warning first.',
  },
  {
    icon: <StoriesIcon />,
    title: 'Stories go untold',
    text: 'Nobody writes down what Nan said at Christmas. Then one day, nobody remembers.',
  },
  {
    icon: <AlbumIcon />,
    title: 'Albums gather dust',
    text: 'That box in the attic? When did anyone last open it?',
  },
];

export default function ProblemStrip() {
  return (
    <section className="w-full bg-white relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 50% 0%, rgba(184,147,42,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative w-full px-6 md:px-10 lg:px-16 xl:px-20 py-12 md:py-16 lg:py-20">

        {/* ── MOBILE: single column, clean and spacious ── */}
        <div className="block lg:hidden">
          <p
            className="font-sans uppercase text-[#B8932A] mb-3"
            style={{ fontSize: '0.65rem', letterSpacing: '0.22em', fontWeight: 600 }}
          >
            The Problem
          </p>
          <h2
            className="font-serif text-[#1A1612] font-bold mb-4"
            style={{
              fontSize: 'clamp(1.8rem, 7vw, 2.4rem)',
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
            }}
          >
            Most family history disappears{' '}
            <span style={{ color: '#B8932A' }}>in two generations.</span>
          </h2>
          <p
            className="font-serif text-[#5C5244] mb-10"
            style={{ fontSize: '1rem', lineHeight: 1.6 }}
          >
            Not because anyone stopped caring. Because there was never
            a proper place to keep it all.
          </p>

          <div className="flex flex-col">
            {problems.map((problem) => (
              <div
                key={problem.title}
                className="py-5"
                style={{
                  borderTop: '1px solid rgba(26,22,18,0.08)',
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[#B8932A] flex-shrink-0">
                    {problem.icon}
                  </div>
                  <h3
                    className="font-serif text-[#1A1612]"
                    style={{ fontSize: '1.1rem', fontWeight: 600 }}
                  >
                    {problem.title}
                  </h3>
                </div>
                <p
                  className="font-serif text-[#6B5F50] pl-12"
                  style={{ fontSize: '0.92rem', lineHeight: 1.55 }}
                >
                  {problem.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── DESKTOP: headline left, cards right ── */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_2.2fr] gap-12 xl:gap-20 items-start">

          <div>
            <p
              className="font-sans uppercase text-[#B8932A] mb-4"
              style={{ fontSize: 'clamp(0.65rem, 0.8vw, 0.78rem)', letterSpacing: '0.22em', fontWeight: 600 }}
            >
              The Problem
            </p>

            <h2
              className="font-serif text-[#1A1612] font-bold mb-5"
              style={{
                fontSize: 'clamp(1.8rem, 3.2vw, 3rem)',
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
              }}
            >
              Most family history disappears{' '}
              <span style={{ color: '#B8932A' }}>in two generations.</span>
            </h2>

            <p
              className="font-serif text-[#5C5244]"
              style={{
                fontSize: 'clamp(1rem, 1.3vw, 1.2rem)',
                lineHeight: 1.65,
              }}
            >
              Not because anyone stopped caring. Because there was never
              a proper place to keep it all.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-0">
            {problems.map((problem, i) => (
              <div
                key={problem.title}
                className="ps-card relative"
              >
                {i > 0 && (
                  <div
                    className="absolute left-0 top-3 bottom-3"
                    style={{
                      width: '1px',
                      background: 'rgba(26,22,18,0.08)',
                    }}
                  />
                )}

                <div className="ps-card-inner">
                  <div className="text-[#B8932A] mb-4">
                    {problem.icon}
                  </div>

                  <h3 className="ps-title font-serif text-[#1A1612]">
                    {problem.title}
                  </h3>

                  <p className="ps-text font-serif text-[#6B5F50]">
                    {problem.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gold baseline */}
      <div
        className="absolute bottom-0 left-0 w-full h-[3px]"
        style={{
          background:
            'linear-gradient(to right, rgba(184,147,42,0.5), rgba(184,147,42,0.15))',
        }}
      />

      <style>{`
        .ps-card-inner { padding: 12px 20px; }
        .ps-title      { font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; letter-spacing: -0.01em; }
        .ps-text        { font-size: 0.95rem; line-height: 1.6; }

        @media (min-width: 1280px) {
          .ps-card-inner { padding: 14px 28px; }
          .ps-title      { font-size: 1.2rem; margin-bottom: 10px; }
          .ps-text        { font-size: 1.02rem; line-height: 1.6; }
        }

        @media (min-width: 1536px) {
          .ps-card-inner { padding: 16px 34px; }
          .ps-title      { font-size: 1.3rem; margin-bottom: 10px; }
          .ps-text        { font-size: 1.08rem; line-height: 1.65; }
        }
      `}</style>
    </section>
  );
}