import { redirect, notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getServerClient } from '@/lib/supabase/server';
import StoryEditorPage from '@/components/stories/editor/StoryEditorPage';

export const metadata: Metadata = {
  title: 'Edit Story — Ancestorii',
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EditStoryPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await getServerClient();

  /* ── Auth gate ── */
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    redirect(`/login?redirect=/stories/${slug}/edit`);
  }

  /* ── Fetch story ── */
  const { data: story, error } = await supabase
    .from('stories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!story || error) notFound();

  /* ── Only author can edit ── */
  if (story.author_id !== auth.user.id) {
    redirect(`/stories/${slug}`);
  }

  /* ── Fetch existing media ── */
  const { data: existingMedia } = await supabase
    .from('story_media')
    .select('id, file_path, file_type, display_order')
    .eq('story_id', story.id)
    .order('display_order', { ascending: true });

  const existingImages = (existingMedia ?? [])
    .filter((m) => m.file_type?.startsWith('image/'))
    .map((m) => ({
      id: m.id,
      url: supabase.storage.from('story-media').getPublicUrl(m.file_path).data.publicUrl,
    }));

  const videoMedia = (existingMedia ?? []).find((m) => m.file_type?.startsWith('video/'));
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