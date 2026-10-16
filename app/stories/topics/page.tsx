import { getServerClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent } from '@/components/site/SiteBits';
import TopicsCta from '@/components/site/stories-browse/TopicsCta';
import { topicIcon, topicToneClass } from '@/components/site/stories-browse/topicTone';
import landing from '@/components/landing/landing.module.css';
import site from '@/components/site/site.module.css';
import topics from '@/components/site/stories-browse/topics.module.css';
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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Browse family stories by topic' }],
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

      <SiteShell storiesBar>
        {/* HERO */}
        <section className={topics.hero}>
          <div className={topics.heroInner}>
            <div className={site.heroTop}>
              <span className={`${landing.badge} ${topics.dotPink}`}>
                <span className={landing.badgeDot} />
                Stories by topic
              </span>
            </div>

            <h1 className={site.heroTitle}>
              Find the stories<br />
              <span className={topics.heroAccent}>
                <Accent>that feel like yours.</Accent>
              </span>
            </h1>

            <p className={site.heroLead}>
              Real memories from real families, gathered by theme. Read the ones that move you, then add your own.
            </p>
          </div>
        </section>

        {/* TOPIC LIST */}
        <section className={site.sectionSm}>
          <div className={landing.wrap}>
            <div className={topics.topicGrid}>
              {TOPICS.map((t, i) => {
                const count = counts.get(t.key) ?? 0;
                const Icon = topicIcon(t.key);
                return (
                  <Link
                    key={t.slug}
                    href={`/stories/topics/${t.slug}`}
                    className={`${topics.topicCard} ${topicToneClass(t.key)}`}
                  >
                    <div className={topics.topicPanel}>
                      <div className={topics.topicTile}>
                        <Icon size={54} strokeWidth={2.4} aria-hidden="true" />
                      </div>
                    </div>
                    <div className={topics.topicBody}>
                      <span className={topics.topicNum}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h2 className={topics.topicTitle}>
                        {t.label}
                      </h2>
                      <p className={topics.topicIntro}>
                        {t.intro}
                      </p>
                      <div className={topics.topicFoot}>
                        {count > 0 && (
                          <span className={topics.topicCount}>
                            {count} {count === 1 ? 'story' : 'stories'}
                          </span>
                        )}
                        <span className={topics.topicGo}>
                          <ArrowRight size={20} strokeWidth={2.6} aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <TopicsCta
          title={
            <>
              Every family has one.<br />
              <span className={topics.ctaAccent}>Share yours.</span>
            </>
          }
        />
      </SiteShell>
    </>
  );
}
