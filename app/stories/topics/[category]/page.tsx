import { getServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import SiteShell from '@/components/site/SiteShell';
import { Accent, Eyebrow } from '@/components/site/SiteBits';
import StoryCard from '@/components/stories/feed/StoryCard';
import TopicsCta from '@/components/site/stories-browse/TopicsCta';
import { toneClass, topicToneClass } from '@/components/site/stories-browse/topicTone';
import landing from '@/components/landing/landing.module.css';
import site from '@/components/site/site.module.css';
import topicsCss from '@/components/site/stories-browse/topics.module.css';
import { TOPICS, getTopicBySlug } from '@/lib/stories/topics';

const SITE = 'https://www.ancestorii.com';
const PAGE_SIZE = 24;

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

  if (!topic) {
    return { title: 'Topic Not Found — Ancestorii' };
  }

  const url = `${SITE}/stories/topics/${topic.slug}`;

  return {
    title: `${topic.metaTitle} | Ancestorii`,
    description: topic.metaDescription,
    openGraph: {
      type: 'website',
      title: `${topic.metaTitle} | Ancestorii`,
      description: topic.metaDescription,
      url,
      siteName: 'Ancestorii',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: topic.metaTitle }],
      locale: 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${topic.metaTitle} | Ancestorii`,
      description: topic.metaDescription,
      images: ['/og-image.jpg'],
      creator: '@ancestorii',
    },
    alternates: { canonical: url },
    robots: { index: true, follow: true },
  };
}

type MediaRow = {
  story_id: string;
  file_path: string;
  file_type: string;
  display_order: number;
};

export default async function TopicPage({ params }: Props) {
  const { category } = await params;
  const topic = getTopicBySlug(category);
  if (!topic) notFound();

  const supabase = await getServerClient();

  // Stories in this topic
  const { data: stories } = await supabase
    .from('stories')
    .select(
      'id, slug, title, body, excerpt, author_id, author_name, author_avatar_url, voice_note_path, category, published_at'
    )
    .eq('status', 'published')
    .eq('category', topic.key)
    .order('published_at', { ascending: false })
    .limit(PAGE_SIZE);

  const storyIds = (stories ?? []).map((s) => s.id);

  const { data: allMedia } = storyIds.length
    ? await supabase
        .from('story_media')
        .select('story_id, file_path, file_type, display_order')
        .in('story_id', storyIds)
        .order('display_order', { ascending: true })
    : { data: [] };

  const { data: reactionRows } = storyIds.length
    ? await supabase.from('story_reactions').select('story_id').in('story_id', storyIds)
    : { data: [] };

  const { data: commentRows } = storyIds.length
    ? await supabase.from('story_comments').select('story_id').in('story_id', storyIds)
    : { data: [] };

  // Author avatars + titles
  const authorIds = [...new Set((stories ?? []).map((s) => s.author_id))];
  const { data: authorProfiles } = authorIds.length
    ? await supabase.from('Profiles').select('id, profile_image_url, title').in('id', authorIds)
    : { data: [] };

  const authorProfileMap = new Map<string, { title: string | null }>();
  const authorAvatarMap = new Map<string, string>();
  if (authorProfiles) {
    authorProfiles.forEach((p) => authorProfileMap.set(p.id, { title: p.title }));
    await Promise.all(
      authorProfiles
        .filter((p) => p.profile_image_url)
        .map(async (p) => {
          const { data: signed } = await supabase.storage
            .from('user-media')
            .createSignedUrl(p.profile_image_url!, 3600);
          if (signed?.signedUrl) authorAvatarMap.set(p.id, signed.signedUrl);
        })
    );
  }

  const mediaByStory = new Map<string, MediaRow[]>();
  ((allMedia ?? []) as MediaRow[]).forEach((m) => {
    if (!mediaByStory.has(m.story_id)) mediaByStory.set(m.story_id, []);
    mediaByStory.get(m.story_id)!.push(m);
  });

  const reactionMap = new Map<string, number>();
  ((reactionRows ?? []) as { story_id: string }[]).forEach((r) => {
    reactionMap.set(r.story_id, (reactionMap.get(r.story_id) ?? 0) + 1);
  });

  const commentMap = new Map<string, number>();
  ((commentRows ?? []) as { story_id: string }[]).forEach((c) => {
    commentMap.set(c.story_id, (commentMap.get(c.story_id) ?? 0) + 1);
  });

  const feedStories = (stories ?? []).map((s) => {
    const media = mediaByStory.get(s.id) ?? [];
    const coverMedia = media.find(
      (m) => m.file_type?.startsWith('image/') || m.file_type?.startsWith('video/')
    );
    const coverUrl = coverMedia
      ? supabase.storage.from('story-media').getPublicUrl(coverMedia.file_path).data.publicUrl
      : null;
    const coverType = coverMedia
      ? coverMedia.file_type.startsWith('video/')
        ? ('video' as const)
        : ('image' as const)
      : null;

    return {
      id: s.id,
      slug: s.slug,
      title: s.title,
      body: s.body,
      excerpt: s.excerpt ?? null,
      author_name: s.author_name,
      author_avatar_url: authorAvatarMap.get(s.author_id) || s.author_avatar_url,
      author_title: authorProfileMap.get(s.author_id)?.title || null,
      cover_url: coverUrl,
      cover_type: coverType,
      voice_note_path: s.voice_note_path ?? null,
      media_count: media.length,
      category: s.category ?? null,
      reaction_count: reactionMap.get(s.id) ?? 0,
      comment_count: commentMap.get(s.id) ?? 0,
      published_at: s.published_at,
    };
  });

  const url = `${SITE}/stories/topics/${topic.slug}`;
  const otherTopics = TOPICS.filter((t) => t.slug !== topic.slug);

  return (
    <>
      {/* CollectionPage + ItemList of the topic's stories */}
      <Script id="topic-collection-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
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
        })}
      </Script>

      <Script id="topic-breadcrumb-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'Topics', item: `${SITE}/stories/topics` },
            { '@type': 'ListItem', position: 3, name: topic.label, item: url },
          ],
        })}
      </Script>

      <SiteShell storiesBar>
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
                    isLoggedIn={false}
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
