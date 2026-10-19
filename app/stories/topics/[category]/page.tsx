import { getServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteShell from '@/components/site/SiteShell';
import { Accent, Eyebrow } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import StoryCard from '@/components/stories/feed/StoryCard';
import TopicsCta from '@/components/site/stories-browse/TopicsCta';
import { toneClass, topicToneClass } from '@/components/site/stories-browse/topicTone';
import landing from '@/components/landing/landing.module.css';
import site from '@/components/site/site.module.css';
import topicsCss from '@/components/site/stories-browse/topics.module.css';
import { TOPICS, getTopicBySlug } from '@/lib/stories/topics';
import { applyAvatars, getTopicFeed } from '@/lib/stories/publicFeed';
import { signAvatarUrls } from '@/lib/stories/avatars';

const SITE = 'https://www.ancestorii.com';

type Props = {
  params: Promise<{ category: string }>;
};

export function generateStaticParams() {
  return TOPICS.map((t) => ({ category: t.slug }));
}

// ─── SEO: per-topic metadata ───
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const topic = getTopicBySlug(category);

  // The root layout's template adds " | Ancestorii" to both titles
  if (!topic) {
    return { title: 'Topic Not Found' };
  }

  const url = `${SITE}/stories/topics/${topic.slug}`;

  return {
    title: topic.metaTitle,
    description: topic.metaDescription,
    openGraph: {
      type: 'website',
      title: `${topic.metaTitle} | Ancestorii`,
      description: topic.metaDescription,
      url,
      siteName: 'Ancestorii',
      images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: topic.metaTitle }],
      locale: 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${topic.metaTitle} | Ancestorii`,
      description: topic.metaDescription,
      images: ['/og-default.jpg'],
      creator: '@ancestorii',
    },
    alternates: { canonical: url },
    robots: { index: true, follow: true },
  };
}

export default async function TopicPage({ params }: Props) {
  const { category } = await params;
  const topic = getTopicBySlug(category);
  if (!topic) notFound();

  const supabase = await getServerClient();

  // The reader (so the signed-in bar is there from the first paint) and the topic's stories
  // (kept for a minute, shared by every visitor), side by side.
  const [
    {
      data: { user },
    },
    feed,
  ] = await Promise.all([supabase.auth.getUser(), getTopicFeed(topic.key)]);
  const isLoggedIn = !!user;

  // The authors' photos: one signed URL a day per photo (src/lib/stories/avatars.ts).
  const avatars = await signAvatarUrls(feed.stories.map((s) => s.avatar_path));
  const feedStories = applyAvatars(feed.stories, avatars);

  const url = `${SITE}/stories/topics/${topic.slug}`;
  const otherTopics = TOPICS.filter((t) => t.slug !== topic.slug);

  return (
    <>
      {/* CollectionPage + ItemList of the topic's stories */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': url,
          name: `${topic.label} stories`,
          description: topic.metaDescription,
          url,
          isPartOf: { '@type': 'WebSite', name: 'Ancestorii', url: SITE },
          ...(feedStories.length > 0 && {
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: feedStories.map((s, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: s.title,
                url: `${SITE}/stories/${s.slug}`,
              })),
            },
          }),
        }}
      />

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'Topics', item: `${SITE}/stories/topics` },
            { '@type': 'ListItem', position: 3, name: topic.label, item: url },
          ],
        }}
      />

      <SiteShell isLoggedIn={isLoggedIn} storiesBar>
        {/* HERO */}
        <section className={topicsCss.hero}>
          <div className={topicsCss.heroInner}>
            <div className={site.heroTop}>
              <Link
                href="/stories/topics"
                className={`${landing.badge} ${topicsCss.dotPink} ${topicsCss.badgeLink}`}
              >
                <span className={landing.badgeDot} />
                Stories by topic
              </Link>
            </div>

            <h1 className={site.heroTitle}>
              {topic.heading}
              <br />
              <span className={topicsCss.heroAccent}>
                <Accent>{topic.headingAccent}</Accent>
              </span>
            </h1>

            <div className={topicsCss.intro}>
              <p>{topic.intro}</p>
              <p>{topic.secondary}</p>
            </div>
          </div>
        </section>

        {/* STORIES */}
        <section className={site.sectionSm}>
          <div className={landing.wrap}>
            {feedStories.length > 0 ? (
              <div className={topicsCss.storyGrid}>
                {feedStories.map((s) => (
                  <StoryCard
                    key={s.id}
                    slug={s.slug}
                    title={s.title}
                    body={s.body}
                    excerpt={s.excerpt}
                    authorName={s.author_name}
                    authorAvatarUrl={s.author_avatar_url}
                    authorTitle={s.author_title}
                    coverUrl={s.cover_url}
                    coverType={s.cover_type}
                    voiceNotePath={s.voice_note_path}
                    voiceNoteDuration={null}
                    mediaCount={s.media_count}
                    category={s.category}
                    reactionCount={s.reaction_count}
                    commentCount={s.comment_count}
                    publishedAt={s.published_at}
                  />
                ))}
              </div>
            ) : (
              <div className={`${topicsCss.empty} ${topicToneClass(topic.key)}`}>
                <span className={topicsCss.emptyMark} aria-hidden="true">
                  “
                </span>
                <p className={topicsCss.emptyText}>
                  No {topic.navLabel.toLowerCase()} stories yet.{' '}
                  <Accent tone="pink">Yours could be the first.</Accent>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* STORY STARTERS */}
        <section className={site.section}>
          <div className={landing.wrap}>
            <div className={topicsCss.startersHead}>
              <Eyebrow dot="var(--c3)">Worth sharing</Eyebrow>
              <h2 className={`${landing.h2} ${topicsCss.startersTitle}`}>
                Memories that <Accent tone="blue">belong here.</Accent>
              </h2>
            </div>
            <ul className={topicsCss.prompts}>
              {topic.prompts.map((p, i) => (
                <li key={i} className={`${topicsCss.prompt} ${toneClass(i)}`}>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* OTHER TOPICS */}
        <section className={site.section}>
          <div className={`${landing.wrap} ${topicsCss.explore}`}>
            <Eyebrow dot="var(--c1)">Explore more</Eyebrow>
            <div className={topicsCss.pills}>
              {otherTopics.map((t) => (
                <Link
                  key={t.slug}
                  href={`/stories/topics/${t.slug}`}
                  // A topic page is rendered per request, so a prefetch brought nothing back.
                  prefetch={false}
                  className={landing.topic}
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <TopicsCta
          title={
            <>
              Add your {topic.navLabel.toLowerCase()} story.
              <br />
              <span className={topicsCss.ctaAccent}>Keep it for good.</span>
            </>
          }
        />
      </SiteShell>
    </>
  );
}
