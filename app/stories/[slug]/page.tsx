import { getServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import JsonLd from '@/components/site/seo/JsonLd';
import SiteShell from '@/components/site/SiteShell';
import StoryPageContent from '@/components/stories/detail/StoryPageContent';
import { getPublicStory, loadRelatedStories } from '@/lib/stories/publicStory';
import { loadProfileCards, publicMediaUrl } from '@/lib/stories/publicFeed';
import { getPublicClient } from '@/lib/stories/publicClient';
import { signAvatarUrls } from '@/lib/stories/avatars';
import { plainTextFromHtml } from '@/lib/stories/format';
import { sanitizeRichText } from '@/lib/richText/server';

// An allow-list (sanitize-html) instead of the old regex clean-up, which let <img/onerror=...>
// and javascript: links through. Plain-text bodies stay as typed (they are shown as text).
function sanitizeHtml(html: string): string {
  return html.includes('<') ? sanitizeRichText(html) : html;
}

type Props = {
  params: Promise<{ slug: string }>;
};

// ─── SEO: dynamic metadata per story ───
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // The same read as the page (shared within the request); a failed query throws, as there.
  const story = await getPublicStory(slug);
  if (!story) {
    return { title: 'Story Not Found' };
  }

  const plainBody = plainTextFromHtml(story.body);
  const description = plainBody.length > 160 ? plainBody.slice(0, 157).trim() + '…' : plainBody;

  const coverMedia = story.media.find((m) => m.file_type?.startsWith('image/'));
  const ogImageUrl = coverMedia ? publicMediaUrl(coverMedia.file_path) : '/og-default.jpg';

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

  // The reader and the story (with its media, comments and like count, in one query), side by
  // side. Only a story that isn't there is a 404; a failed query (a timeout, say) throws to the
  // error boundary, so a blip never tells search engines the story is gone.
  const [
    {
      data: { user },
    },
    story,
  ] = await Promise.all([supabase.auth.getUser(), getPublicStory(slug)]);
  if (!story) notFound();

  const isLoggedIn = !!user;
  const isAuthor = user?.id === story.author_id;

  // Build image URLs
  const images = story.media
    .filter((m) => m.file_type?.startsWith('image/'))
    .map((m) => ({ url: publicMediaUrl(m.file_path), alt: story.title }));

  const coverUrl = images.length > 0 ? images[0].url : null;

  // Video URL
  const videoMedia = story.media.find((m) => m.file_type?.startsWith('video/'));
  const videoUrl = videoMedia ? publicMediaUrl(videoMedia.file_path) : null;

  // Voice note URL
  const voiceNoteUrl = story.voice_note_path ? publicMediaUrl(story.voice_note_path) : null;

  // Everyone on the page (the author and the commenters), the related stories and the reader's
  // own like, side by side.
  const [cards, relatedStories, ownReaction] = await Promise.all([
    loadProfileCards(getPublicClient(), [story.author_id, ...story.comments.map((c) => c.user_id)]),
    loadRelatedStories(story.id, story.category),
    user
      ? supabase
          .from('story_reactions')
          .select('id')
          .eq('story_id', story.id)
          .eq('user_id', user.id)
          .maybeSingle()
      : null,
  ]);
  const userReacted = !!ownReaction?.data;

  // Then their photos (one signed URL a day per photo, see src/lib/stories/avatars.ts).
  const avatars = await signAvatarUrls([...cards.values()].map((c) => c.profile_image_url));
  const avatarOf = (userId: string, fallback: string | null) => {
    const path = cards.get(userId)?.profile_image_url;
    return (path && avatars.get(path)) || fallback;
  };

  const authorCard = cards.get(story.author_id);
  const authorAvatarUrl = avatarOf(story.author_id, story.author_avatar_url);

  // Comments rendered on the server (no flash of "0 Comments"), with each writer's current name,
  // title and photo.
  const initialComments = story.comments.map((c) => {
    const card = cards.get(c.user_id);
    return {
      ...c,
      author_name: card?.full_name || c.author_name,
      author_avatar_url: avatarOf(c.user_id, c.author_avatar_url),
      author_title: card?.title || null,
    };
  });
  const reactionCount = story.reaction_count;
  const commentCount = story.comments.length;

  // When this HTML was made: the comments count their "3h ago" from it on both sides.
  const renderedAt = Date.now();

  const plainBody = plainTextFromHtml(story.body);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: story.title,
          description: plainBody.length > 160 ? plainBody.slice(0, 157) + '…' : plainBody,
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
              userInteractionCount: reactionCount,
            },
            {
              '@type': 'InteractionCounter',
              interactionType: 'https://schema.org/CommentAction',
              userInteractionCount: commentCount,
            },
          ],
        }}
      />

      <SiteShell isLoggedIn={isLoggedIn} storiesBar>
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
            reactionCount={reactionCount}
            commentCount={commentCount}
            userHasReacted={userReacted}
            isLoggedIn={isLoggedIn}
            isAuthor={isAuthor}
            currentUserId={user?.id ?? null}
            authorBio={authorCard?.bio ?? null}
            authorLocation={authorCard?.location ?? null}
            authorTitle={authorCard?.title ?? null}
            relatedStories={relatedStories}
            initialComments={initialComments}
            renderedAt={renderedAt}
          />
      </SiteShell>
    </>
  );
}
