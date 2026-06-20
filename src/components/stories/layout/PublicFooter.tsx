'use client';

import Link from 'next/link';

const SECTIONS = [
  {
    heading: 'Discover',
    links: [
      { href: '/', label: 'Explore Stories' },
      { href: '/stories/topics', label: 'Browse by Topic' },
      { href: '/digital-legacy', label: 'What is a Digital Legacy?' },
      { href: '/living-library', label: 'What is a Living Library?' },
    ],
  },
  {
    heading: 'Learn',
    links: [
      { href: '/compare', label: 'Compare Platforms' },
      { href: '/guides', label: 'Guides' },
    ],
  },
  {
    heading: 'Product',
    links: [
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/memory-books', label: 'Memory Books' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    heading: 'Get Started',
    links: [
      { href: '/signup', label: 'Create Free Account' },
      { href: '/login', label: 'Log In' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/why-this-exists', label: 'Why Ancestorii Exists' },
      { href: '/privacy-policy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms & Conditions' },
    ],
  },
];

export default function PublicFooter() {
  return (
    <footer
      className="bg-[#1A1612]"
      style={{
        borderTop: '2px solid #C8A557',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── Main content ── */}
      <div
        className="flex flex-wrap"
        style={{
          padding: 'clamp(44px, 5vw, 72px) clamp(28px, 4.5vw, 72px)',
          gap: 'clamp(40px, 5vw, 80px)',
        }}
      >
        {/* ── Left: Brand ── */}
        <div className="flex-shrink-0" style={{ flex: '1 1 300px', maxWidth: 380, minWidth: 260 }}>
          <Link href="/">
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 600,
                fontSize: 'clamp(2.2rem, 2.8vw, 2.8rem)',
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
              }}
            >
              Ancestor<span style={{ color: '#C8A557' }}>ii</span>
            </span>
          </Link>

          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.35rem, 1.6vw, 1.65rem)',
              fontWeight: 500,
              fontStyle: 'italic',
              color: '#C8A557',
              lineHeight: 1.4,
              marginTop: 16,
              letterSpacing: '0.01em',
            }}
          >
            Your family&apos;s greatest stories.
            <br />
            Told together.
          </p>

          {/* Socials */}
          <div className="flex items-center gap-5 mt-7">
            <a href="https://www.facebook.com/profile.php?id=61586259749930" target="_blank" rel="noopener noreferrer" className="text-[#FFFFFF] hover:text-white transition-colors duration-200">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/ancestorii_official/" target="_blank" rel="noopener noreferrer" className="text-[#FFFFFF] hover:text-white transition-colors duration-200">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="3.5" />
                <circle cx="17.5" cy="6.5" r="1" />
              </svg>
            </a>
          </div>
        </div>

        {/* ── Right: Link columns ── */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
          style={{
            flex: '2 1 500px',
            gap: '36px 32px',
          }}
        >
          {SECTIONS.map(({ heading, links }) => (
            <div key={heading}>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(12px, 0.85vw, 14px)',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#C8A557',
                  marginBottom: 18,
                }}
              >
                {heading}
              </div>
              <ul className="space-y-1">
                {links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="hover:text-[#C8A557] transition-colors duration-200"
                      style={{
                        display: 'block',
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 500,
                        fontSize: 'clamp(0.95rem, 1.05vw, 1.05rem)',
                        color: '#FFFFFF',
                        textDecoration: 'none',
                        padding: '6px 0',
                        lineHeight: 1.45,
                        letterSpacing: '0.01em',
                      }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        className="border-t border-[#2E2820] flex flex-col sm:flex-row justify-between items-center"
        style={{
          padding: 'clamp(16px, 1.8vw, 22px) clamp(28px, 4.5vw, 72px)',
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(12px, 0.8vw, 14px)',
            fontWeight: 500,
            color: '#FFFFFF',
          }}
        >
          &copy; {new Date().getFullYear()} Ancestorii™. All Rights Reserved.
        </span>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(12px, 0.8vw, 14px)',
            fontWeight: 500,
            color: '#FFFFFF',
          }}
        >
          support@ancestorii.com
        </span>
      </div>
    </footer>
  );
}