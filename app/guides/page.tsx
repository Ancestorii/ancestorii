import Link from 'next/link';
import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Family Memory Guides | Ancestorii',
  description:
    'Practical guides on capturing stories, voices, and photos while life is happening. Learn how to begin building your family library with clarity and intention.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides',
  },
};

const guides = [
  {
    title: 'Living library vs digital vault',
    desc: 'Why storing files and preserving meaning are two completely different things.',
    href: '/guides/living-library-vs-digital-vault',
  },
  {
    title: 'How to preserve family memories',
    desc: 'A starting point for anyone who has been meaning to write things down but never has.',
    href: '/guides/how-to-preserve-family-memories',
  },
  {
    title: 'How to save family voices',
    desc: 'Because the way someone tells a story matters as much as the story itself.',
    href: '/guides/how-to-save-family-voices',
  },
  {
    title: 'What to do with old family photos',
    desc: 'Turn scattered images into something your family actually wants to return to.',
    href: '/guides/what-to-do-with-old-family-photos',
  },
  {
    title: 'How to record family stories',
    desc: 'Simple ways to capture the stories that only get told when a certain person is in the room.',
    href: '/guides/how-to-record-family-stories',
  },
];

export default function GuidesPage() {
  return (
    <>
      <Script id="collection-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': 'https://www.ancestorii.com/guides',
          name: 'Family Memory Guides',
          description: 'A collection of practical guides for building a living family library.',
          url: 'https://www.ancestorii.com/guides',
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: guides.map((g, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: g.title,
              url: `https://www.ancestorii.com${g.href}`,
            })),
          },
          publisher: { '@type': 'Organization', name: 'Ancestorii' },
        })}
      </Script>

      <Script id="breadcrumb-schema-guides" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ancestorii.com/' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://www.ancestorii.com/guides' },
          ],
        })}
      </Script>

      <main className="w-full relative overflow-hidden" style={{ background: '#FFFDF8', fontFamily: "'DM Sans', sans-serif" }}>
        <PublicNav />

        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pt-16 sm:pt-20 md:pt-28 lg:pt-36 xl:pt-44 pb-20 md:pb-32 xl:pb-40">

          {/* HERO */}
          <div className="flex items-center gap-2.5 mb-5 md:mb-6 xl:mb-8">
            <div className="h-px w-5 xl:w-6 bg-[#B8932A]" />
            <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
              Guides
            </span>
          </div>

          <h1
            className="text-[clamp(36px,7vw,90px)] leading-[0.95] tracking-[-0.03em] text-[#181512] mb-4 md:mb-5 xl:mb-6"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            Practical steps for<br />
            <span className="italic text-[#A9782F]">keeping what matters.</span>
          </h1>

          <p className="text-[15px] md:text-[17px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-[1.85] text-[#3D3526] max-w-[42ch] mb-16 md:mb-20 xl:mb-24">
            Short, focused guides for the moments when you are ready to start capturing your family's story. No pressure. No overwhelm. Just a place to begin.
          </p>

          {/* GUIDE LIST */}
          <div className="space-y-0">
            {guides.map((guide, i) => (
              <Link
                key={i}
                href={guide.href}
                className="group flex items-start sm:items-center justify-between gap-6 py-8 md:py-10 xl:py-12 border-t border-[#ECE5D8] transition hover:pl-2"
              >
                <div className="flex items-start gap-5 md:gap-7">
                  <span
                    className="shrink-0 text-[24px] md:text-[28px] xl:text-[32px] leading-none text-[#C8A557] mt-1"
                    style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h2
                      className="text-[20px] md:text-[24px] xl:text-[28px] 2xl:text-[30px] leading-[1.2] tracking-[-0.02em] text-[#181512] group-hover:text-[#A9782F] transition"
                      style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                    >
                      {guide.title}
                    </h2>
                    <p className="mt-2 text-[14px] md:text-[16px] xl:text-[17px] leading-[1.7] text-[#3D3526]/60">
                      {guide.desc}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 xl:w-6 xl:h-6 text-[#C8A557] opacity-0 group-hover:opacity-100 transition shrink-0 mt-1" />
              </Link>
            ))}
            <div className="border-t border-[#ECE5D8]" />
          </div>

          {/* CTA */}
          <div className="mt-20 md:mt-28 xl:mt-32 flex justify-center">
            <div className="w-full max-w-[560px] xl:max-w-[640px] 2xl:max-w-[720px] px-8 py-10 md:px-10 md:py-12 xl:px-12 xl:py-14" style={{ background: '#1A1612' }}>
              <p
                className="text-[22px] md:text-[26px] xl:text-[30px] 2xl:text-[34px] leading-[1.2] tracking-[-0.02em] text-white mb-3 text-center"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
              >
                Start with one memory.<br />
                <span className="italic text-[#C8A557]">The rest follows.</span>
              </p>
              <p className="text-[13px] md:text-[14px] xl:text-[15px] text-[#A09888] mb-6 leading-relaxed text-center">
                Two minutes. Your words. A memory that stays.
              </p>
              <Link
                href="/signup"
                prefetch
                className="block w-full px-8 py-3.5 xl:py-4 text-[13px] xl:text-[14px] font-semibold tracking-[0.06em] text-[#1A1612] text-center transition hover:opacity-90"
                style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(135deg, #C8A557 0%, #D4AF37 100%)' }}
              >
                START FOR FREE
              </Link>
              <p className="mt-3 text-[11px] xl:text-[12px] text-[#6F6255] tracking-[0.04em] text-center">
                Free forever · No credit card · Takes 2 minutes
              </p>
            </div>
          </div>
        </div>

        <PublicFooter />
      </main>
    </>
  );
}