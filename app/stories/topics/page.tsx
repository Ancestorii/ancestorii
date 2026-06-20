import { getServerClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight } from 'lucide-react';
import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';
import { TOPICS } from '@/lib/stories/topics';

const SITE = 'https://www.ancestorii.com';

export const metadata: Metadata = {
  title: 'Browse Family Stories by Topic | Ancestorii',
  description:
    'Explore real family stories by topic — family, food and recipes, childhood, love, life lessons, traditions, and travel. Real memories from real families on Ancestorii.',
  alternates: { canonical: `${SITE}/stories/topics` },
  openGraph: {
    type: 'website',
    title: 'Browse Family Stories by Topic | Ancestorii',
    description:
      'Explore real family stories by topic. Real memories from real families, kept and told together.',
    url: `${SITE}/stories/topics`,
    siteName: 'Ancestorii',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Browse family stories by topic' }],
    locale: 'en_GB',
  },
  robots: { index: true, follow: true },
};

export default async function TopicsIndexPage() {
  const supabase = await getServerClient();

  // Count published stories per category
  const { data: rows } = await supabase
    .from('stories')
    .select('category')
    .eq('status', 'published')
    .not('category', 'is', null);

  const counts = new Map<string, number>();
  (rows ?? []).forEach((r) => {
    if (r.category) counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
  });

  return (
    <>
      <Script id="topics-collection-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': `${SITE}/stories/topics`,
          name: 'Family stories by topic',
          description:
            'Browse real family stories grouped by topic, from family and food to traditions and travel.',
          url: `${SITE}/stories/topics`,
          isPartOf: { '@type': 'WebSite', name: 'Ancestorii', url: SITE },
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: TOPICS.map((t, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: t.label,
              url: `${SITE}/stories/topics/${t.slug}`,
            })),
          },
        })}
      </Script>

      <Script id="topics-breadcrumb-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'Topics', item: `${SITE}/stories/topics` },
          ],
        })}
      </Script>

      <main
        className="w-full relative overflow-hidden"
        style={{ background: '#FFFDF8', fontFamily: "'DM Sans', sans-serif" }}
      >
        <PublicNav />

        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pt-16 sm:pt-20 md:pt-28 lg:pt-36 xl:pt-44 pb-20 md:pb-32 xl:pb-40">
          {/* HERO */}
          <div className="flex items-center gap-2.5 mb-5 md:mb-6 xl:mb-8">
            <div className="h-px w-5 xl:w-6 bg-[#B8932A]" />
            <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
              Stories by topic
            </span>
          </div>

          <h1
            className="text-[clamp(36px,7vw,90px)] leading-[0.95] tracking-[-0.03em] text-[#181512] mb-4 md:mb-5 xl:mb-6"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            Find the stories<br />
            <span className="italic text-[#A9782F]">that feel like yours.</span>
          </h1>

          <p className="text-[15px] md:text-[17px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-[1.85] text-[#3D3526] max-w-[44ch] mb-16 md:mb-20 xl:mb-24">
            Real memories from real families, gathered by theme. Read the ones that move you, then add your own.
          </p>

          {/* TOPIC LIST */}
          <div className="space-y-0">
            {TOPICS.map((t, i) => {
              const count = counts.get(t.key) ?? 0;
              return (
                <Link
                  key={t.slug}
                  href={`/stories/topics/${t.slug}`}
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
                        {t.label}
                      </h2>
                      <p className="mt-2 text-[14px] md:text-[16px] xl:text-[17px] leading-[1.7] text-[#3D3526]/60 max-w-[52ch]">
                        {t.intro}
                      </p>
                      {count > 0 && (
                        <span className="mt-3 inline-block text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.1em] text-[#B8924A]">
                          {count} {count === 1 ? 'story' : 'stories'}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 xl:w-6 xl:h-6 text-[#C8A557] opacity-0 group-hover:opacity-100 transition shrink-0 mt-1" />
                </Link>
              );
            })}
            <div className="border-t border-[#ECE5D8]" />
          </div>

          {/* CTA */}
          <div className="mt-20 md:mt-28 xl:mt-32 flex justify-center">
            <div
              className="w-full max-w-[560px] xl:max-w-[640px] 2xl:max-w-[720px] px-8 py-10 md:px-10 md:py-12 xl:px-12 xl:py-14"
              style={{ background: '#1A1612' }}
            >
              <p
                className="text-[22px] md:text-[26px] xl:text-[30px] 2xl:text-[34px] leading-[1.2] tracking-[-0.02em] text-white mb-3 text-center"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
              >
                Every family has one.<br />
                <span className="italic text-[#C8A557]">Share yours.</span>
              </p>
              <p className="text-[13px] md:text-[14px] xl:text-[15px] text-[#A09888] mb-6 leading-relaxed text-center">
                Two minutes. Your words. A memory that stays.
              </p>
              <Link
                href="/signup"
                prefetch
                className="block w-full px-8 py-3.5 xl:py-4 text-[13px] xl:text-[14px] font-semibold tracking-[0.06em] text-[#1A1612] text-center transition hover:opacity-90"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  background: 'linear-gradient(135deg, #C8A557 0%, #D4AF37 100%)',
                }}
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
