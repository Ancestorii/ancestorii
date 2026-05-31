import { getServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import MemoryEditorPage from './MemoryEditorPage';

export default async function EditMemoryPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const supabase = await getServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return notFound();

  const memoryId = params.id;

  const { data: memory } = await supabase
    .from('family_memories')
    .select('id, family_id, author_id, title, body, voice_note_path, video_path')
    .eq('id', memoryId)
    .single();

  if (!memory) return notFound();

  // Only the author can edit
  if (memory.author_id !== user.id) return notFound();

  // Fetch existing images
  const { data: mediaRows } = await supabase
    .from('family_memory_media')
    .select('id, file_path, file_type')
    .eq('memory_id', memoryId)
    .eq('file_type', 'image')
    .order('display_order');

  const [existingImages, videoUrl, voiceUrl] = await Promise.all([
    Promise.all(
      (mediaRows || []).map(async (m) => {
        const { data: signed } = await supabase.storage.from('memory-media').createSignedUrl(m.file_path, 3600);
        return signed?.signedUrl ? { id: m.id, url: signed.signedUrl } : null;
      })
    ).then((results) => results.filter((img): img is { id: string; url: string } => img !== null)),
    memory.video_path
      ? supabase.storage.from('memory-media').createSignedUrl(memory.video_path, 3600).then((r) => r.data?.signedUrl || null)
      : Promise.resolve(null),
    memory.voice_note_path
      ? supabase.storage.from('memory-media').createSignedUrl(memory.voice_note_path, 3600).then((r) => r.data?.signedUrl || null)
      : Promise.resolve(null),
  ]);
  
  return (
    <MemoryEditorPage
      mode="edit"
      memoryId={memory.id}
      familyId={memory.family_id}
      initialTitle={memory.title}
      initialBody={memory.body}
      initialImages={existingImages}
      initialVideoUrl={videoUrl}
      initialVoiceUrl={voiceUrl}
    />
  );
}