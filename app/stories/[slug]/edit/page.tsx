import { redirect, notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getServerClient } from '@/lib/supabase/server';
import StoryEditorPage from '@/components/stories/editor/StoryEditorPage';

// The root layout's template adds " | Ancestorii". A writing page, not one to index.
export const metadata: Metadata = {
  title: 'Edit Story',
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ slug: string }>;
};

type MediaRow = { id: string; file_path: string; file_type: string; display_order: number };

export default async function EditStoryPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await getServerClient();

  /* ── Auth gate ── */
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    redirect(`/login?redirect=/stories/${slug}/edit`);
  }

  /* ── Fetch the story with its media (one query; RLS lets the author see a draft) ── */
  const { data: story, error } = await supabase
    .from('stories')
    .select('*, story_media(id, file_path, file_type, display_order)')
    .eq('slug', slug)
    .maybeSingle();

  // A failed query is an error, not a missing story
  if (error) throw new Error(`Could not load story "${slug}": ${error.message}`);
  if (!story) notFound();

  /* ── Only author can edit ── */
  if (story.author_id !== auth.user.id) {
    redirect(`/stories/${slug}`);
  }

  const existingMedia = ([...((story.story_media ?? []) as MediaRow[])]).sort(
    (a, b) => a.display_order - b.display_order
  );

  const existingImages = existingMedia
    .filter((m) => m.file_type?.startsWith('image/'))
    .map((m) => ({
      id: m.id,
      url: supabase.storage.from('story-media').getPublicUrl(m.file_path).data.publicUrl,
    }));

  const videoMedia = existingMedia.find((m) => m.file_type?.startsWith('video/'));
  const existingVideoUrl = videoMedia
    ? supabase.storage.from('story-media').getPublicUrl(videoMedia.file_path).data.publicUrl
    : null;

  const existingVoiceUrl = story.voice_note_path
    ? supabase.storage.from('story-media').getPublicUrl(story.voice_note_path).data.publicUrl
    : null;

  return (
    <StoryEditorPage
      mode="edit"
      storyId={story.id}
      initialTitle={story.title}
      initialBody={story.body}
      initialStatus={story.status}
      initialCategory={story.category ?? null}
      initialExcerpt={story.excerpt ?? ''}
      initialImages={existingImages}
      initialVideoUrl={existingVideoUrl}
      initialVoiceUrl={existingVoiceUrl}
    />
  );
}
