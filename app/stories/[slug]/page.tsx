import { getServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Script from 'next/script';
import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';
import StoryPageContent from '@/components/stories/detail/StoryPageContent';
import { getStoryComments } from '@/lib/stories/queries';

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object\b[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<link\b[^>]*>/gi, '');
}

type Props = {
  params: Promise<{ slug: string }>;
};

// ─── SEO: dynamic metadata per story ───
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await getServerClient();

  const { data: story } = await supabase
    .from('stories')
    .select('title, body, author_name, slug, category, id')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!story) {
    return { title: 'Story Not Found — Ancestorii' };
  }

  const plainBody = story.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const description = plainBody.length > 160 ? plainBody.slice(0, 157).trim() + '…' : plainBody;

  let ogImageUrl = '/og-image.jpg';
  const { data: media } = await supabase
    .from('story_media')
    .select('file_path, file_type')
    .eq('story_id', story.id)
    .order('display_order', { ascending: true })
    .limit(1);

  const coverMedia = media?.find((m) => m.file_type?.startsWith('image/'));
  if (coverMedia) {
    ogImageUrl = supabase.storage
      .from('story-media')
      .getPublicUrl(coverMedia.file_path).data.publicUrl;
  }

  return {
    title: story.title,
    description,
    authors: [{ name: story.author_name }],
    openGraph: {
      type: 'article',
      title: story.title,
      description,
      url: `https://www.ancestorii.com/stories/${story.slug}`,
      siteName: 'Ancestorii',
      images: [
        { url: ogImageUrl, width: 1200, height: 630, alt: story.title },
      ],
      locale: 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title: story.title,
      description,
      images: [ogImageUrl],
      creator: '@ancestorii',
    },
    alternates: {
      canonical: `https://www.ancestorii.com/stories/${story.slug}`,
    },
    robots: { index: true, follow: true },
  };
}

// ─── Page ───
export default async function StoryPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  // Fetch story
  const { data: story } = await supabase
    .from('stories')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!story) notFound();

  const isAuthor = user?.id === story.author_id;

  // Fetch media
  const { data: media } = await supabase
    .from('story_media')
    .select('*')
    .eq('story_id', story.id)
    .order('display_order', { ascending: true });

  // Build image URLs
  const images = (media ?? [])
    .filter((m) => m.file_type?.startsWith('image/'))
    .map((m) => ({
      url: supabase.storage
        .from('story-media')
        .getPublicUrl(m.file_path).data.publicUrl,
      alt: story.title,
    }));

  const coverUrl = images.length > 0 ? images[0].url : null;

  // Video URL
  const videoMedia = (media ?? []).find((m) => m.file_type?.startsWith('video/'));
  const videoUrl = videoMedia
    ? supabase.storage
        .from('story-media')
        .getPublicUrl(videoMedia.file_path).data.publicUrl
    : null;

  // Voice note URL
  const voiceNoteUrl = story.voice_note_path
    ? supabase.storage
        .from('story-media')
        .getPublicUrl(story.voice_note_path).data.publicUrl
    : null;

  // Reaction count
  const { count: reactionCount } = await supabase
    .from('story_reactions')
    .select('*', { count: 'exact', head: true })
    .eq('story_id', story.id);

  // Comment count
  const { count: commentCount } = await supabase
    .from('story_comments')
    .select('*', { count: 'exact', head: true })
    .eq('story_id', story.id);

  // User reaction check
  let userReacted = false;
  if (user) {
    const { data: reaction } = await supabase
      .from('story_reactions')
      .select('id')
      .eq('story_id', story.id)
      .eq('user_id', user.id)
      .maybeSingle();
    userReacted = !!reaction;
  }

  // Author profile
  const { data: authorProfile } = await supabase
    .from('Profiles')
    .select('bio, location, title, profile_image_url')
    .eq('id', story.author_id)
    .maybeSingle();

  let authorAvatarUrl = story.author_avatar_url;
  if (authorProfile?.profile_image_url) {
    const { data: signed } = await supabase.storage
      .from('user-media')
      .createSignedUrl(authorProfile.profile_image_url, 3600);
    if (signed?.signedUrl) authorAvatarUrl = signed.signedUrl;
  }

  // Fetch comments for SSR (avoids flash of "0 Comments")
  const initialComments = await getStoryComments(supabase, story.id);

  // Related stories (same category, exclude current)
  let relatedQuery = supabase
    .from('stories')
    .select('id, slug, title')
    .eq('status', 'published')
    .neq('id', story.id)
    .order('published_at', { ascending: false })
    .limit(4);

  if (story.category) {
    relatedQuery = relatedQuery.eq('category', story.category);
  }

  const { data: relatedRaw } = await relatedQuery;

  const relatedIds = (relatedRaw ?? []).map((s) => s.id);
  const { data: relatedMedia } = relatedIds.length
    ? await supabase
        .from('story_media')
        .select('story_id, file_path, file_type')
        .in('story_id', relatedIds)
        .order('display_order', { ascending: true })
    : { data: [] };

  const { data: relatedReactions } = relatedIds.length
    ? await supabase
        .from('story_reactions')
        .select('story_id')
        .in('story_id', relatedIds)
    : { data: [] };

  const relatedMediaMap = new Map<string, string>();
  (relatedMedia ?? []).forEach((m: { story_id: string; file_path: string; file_type: string }) => {
    if (!relatedMediaMap.has(m.story_id) && m.file_type?.startsWith('image/')) {
      relatedMediaMap.set(
        m.story_id,
        supabase.storage.from('story-media').getPublicUrl(m.file_path).data.publicUrl
      );
    }
  });

  const relatedReactionMap = new Map<string, number>();
  ((relatedReactions ?? []) as { story_id: string }[]).forEach((r) => {
    relatedReactionMap.set(r.story_id, (relatedReactionMap.get(r.story_id) ?? 0) + 1);
  });

  const relatedStories = (relatedRaw ?? []).map((s) => ({
    slug: s.slug,
    title: s.title,
    coverUrl: relatedMediaMap.get(s.id) ?? null,
    reactionCount: relatedReactionMap.get(s.id) ?? 0,
  }));

  return (
    <>
      <Script
        id="story-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: story.title,
          description:
            story.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().length > 160
              ? story.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 157) + '…'
              : story.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
          author: { '@type': 'Person', name: story.author_name },
          datePublished: story.published_at,
          dateModified: story.updated_at,
          url: `https://www.ancestorii.com/stories/${story.slug}`,
          publisher: {
            '@type': 'Organization',
            name: 'Ancestorii',
            url: 'https://www.ancestorii.com',
          },
          ...(coverUrl && {
            image: { '@type': 'ImageObject', url: coverUrl },
          }),
          interactionStatistic: [
            {
              '@type': 'InteractionCounter',
              interactionType: 'https://schema.org/LikeAction',
              userInteractionCount: reactionCount ?? 0,
            },
            {
              '@type': 'InteractionCounter',
              interactionType: 'https://schema.org/CommentAction',
              userInteractionCount: commentCount ?? 0,
            },
          ],
        })}
      </Script>

      <div className="min-h-screen flex flex-col bg-white">
        <PublicNav />
        <main className="flex-1">
          <StoryPageContent
            story={{
              id: story.id,
              slug: story.slug,
              title: story.title,
              body: sanitizeHtml(story.body),
              authorName: story.author_name,
              authorAvatarUrl: authorAvatarUrl,
              authorId: story.author_id,
              category: story.category ?? null,
              voiceNotePath: voiceNoteUrl,
              publishedAt: story.published_at ?? null,
              excerpt: story.excerpt ?? null,
            }}
            images={images}
            video={videoUrl}
            reactionCount={reactionCount ?? 0}
            commentCount={commentCount ?? 0}
            userHasReacted={userReacted}
            isLoggedIn={isLoggedIn}
            isAuthor={isAuthor}
            authorBio={authorProfile?.bio ?? null}
            authorLocation={authorProfile?.location ?? null}
            authorTitle={authorProfile?.title ?? null}
            relatedStories={relatedStories}
            initialComments={initialComments}
          />
        </main>
        <PublicFooter />
      </div>
    </>
  );
}