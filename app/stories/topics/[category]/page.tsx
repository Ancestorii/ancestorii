import { getServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';
import StoryCard from '@/components/stories/feed/StoryCard';
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

      <main
        className="w-full relative overflow-hidden"
        style={{ background: '#FFFDF8', fontFamily: "'DM Sans', sans-serif" }}
      >
        <PublicNav />

        {/* HERO */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pt-16 sm:pt-20 md:pt-28 lg:pt-36 xl:pt-44 pb-12 md:pb-16">
          <div className="flex items-center gap-2.5 mb-5 md:mb-6 xl:mb-8">
            <div className="h-px w-5 xl:w-6 bg-[#B8932A]" />
            <Link
              href="/stories/topics"
              className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold hover:text-[#A9782F] transition"
            >
              Stories by topic
            </Link>
          </div>

          <h1
            className="text-[clamp(36px,7vw,90px)] leading-[0.95] tracking-[-0.03em] text-[#181512] mb-4 md:mb-5 xl:mb-6"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            {topic.heading}
            <br />
            <span className="italic text-[#A9782F]">{topic.headingAccent}</span>
          </h1>

          <div
            className="mb-8 md:mb-10 xl:mb-12"
            style={{
              height: '1px',
              width: '10rem',
              background: 'linear-gradient(to right, rgba(184,147,42,0.85), transparent)',
            }}
          />

          <div className="space-y-5 md:space-y-6 text-[15px] md:text-[17px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-[1.85] text-[#3D3526] max-w-[46ch]">
            <p>{topic.intro}</p>
            <p>{topic.secondary}</p>
          </div>
        </div>

        {/* STORIES */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pb-16 md:pb-24">
          {feedStories.length > 0 ? (
            <>
              <div className="mb-8 md:mb-10" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
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
            </>
          ) : (
            <div className="border-t border-[#ECE5D8] pt-12 md:pt-16">
              <p
                className="text-[20px] md:text-[24px] xl:text-[28px] leading-[1.3] text-[#181512] max-w-[28ch]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
              >
                No {topic.navLabel.toLowerCase()} stories yet.{' '}
                <span className="italic text-[#A9782F]">Yours could be the first.</span>
              </p>
            </div>
          )}
        </div>

        {/* STORY STARTERS */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pb-16 md:pb-24">
          <div className="mb-10 md:mb-14" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />
          <span className="text-[11px] md:text-[12px] xl:text-[13px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
            Worth sharing
          </span>
          <h2
            className="mt-4 mb-8 md:mb-12 text-[clamp(28px,5vw,60px)] leading-[1.0] tracking-[-0.03em] text-[#181512]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            Memories that <span className="italic text-[#A9782F]">belong here.</span>
          </h2>
          <div className="space-y-6 md:space-y-8">
            {topic.prompts.map((p, i) => (
              <div key={i} className="flex gap-5 md:gap-7">
                <span
                  className="shrink-0 text-[24px] md:text-[30px] leading-none text-[#C8A557] mt-1"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[16px] md:text-[19px] xl:text-[21px] leading-[1.6] text-[#3D3526] max-w-[40ch]">
                  {p}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* OTHER TOPICS */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pb-16 md:pb-24">
          <div className="mb-8 md:mb-10" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />
          <span className="text-[11px] md:text-[12px] xl:text-[13px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
            Explore more
          </span>
          <div className="mt-6 flex flex-wrap gap-3">
            {otherTopics.map((t) => (
              <Link
                key={t.slug}
                href={`/stories/topics/${t.slug}`}
                className="px-5 py-2.5 border border-[#E4D2AE] text-[14px] md:text-[15px] text-[#3D3526] hover:bg-[#FAF5EB] hover:text-[#A9782F] transition"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pb-20 md:pb-32 xl:pb-40">
          <div className="flex justify-center">
            <div
              className="w-full max-w-[560px] xl:max-w-[640px] 2xl:max-w-[720px] px-8 py-10 md:px-10 md:py-12 xl:px-12 xl:py-14"
              style={{ background: '#1A1612' }}
            >
              <p
                className="text-[22px] md:text-[26px] xl:text-[30px] 2xl:text-[34px] leading-[1.2] tracking-[-0.02em] text-white mb-3 text-center"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
              >
                Add your {topic.navLabel.toLowerCase()} story.
                <br />
                <span className="italic text-[#C8A557]">Keep it for good.</span>
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
