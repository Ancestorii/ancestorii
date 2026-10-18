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
    .maybeSingle();

  if (!memory) return notFound();

  // Only the author can edit
  if (memory.author_id !== user.id) return notFound();

  // The saved photos and whether this member wants Story Assistance: both at once.
  const [{ data: mediaRows }, { data: profile }] = await Promise.all([
    supabase
      .from('family_memory_media')
      .select('id, file_path, file_type')
      .eq('memory_id', memoryId)
      .eq('file_type', 'image')
      .order('display_order'),
    supabase
      .from('Profiles')
      .select('writing_assistance_enabled')
      .eq('id', user.id)
      .maybeSingle(),
  ]);

  // One signing call for every file (photos, video, voice note).
  const paths = [
    ...(mediaRows || []).map((m) => m.file_path),
    ...(memory.video_path ? [memory.video_path] : []),
    ...(memory.voice_note_path ? [memory.voice_note_path] : []),
  ];
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data } = await supabase.storage.from('memory-media').createSignedUrls([...new Set(paths)], 3600);
    (data || []).forEach((r) => {
      if (r.path && r.signedUrl && !r.error) signed.set(r.path, r.signedUrl);
    });
  }

  const existingImages = (mediaRows || []).flatMap((m) => {
    const url = signed.get(m.file_path);
    return url ? [{ id: m.id, url, path: m.file_path }] : [];
  });

  return (
    <MemoryEditorPage
      mode="edit"
      memoryId={memory.id}
      familyId={memory.family_id}
      initialTitle={memory.title}
      initialBody={memory.body}
      initialImages={existingImages}
      initialVideoUrl={(memory.video_path && signed.get(memory.video_path)) || null}
      initialVoiceUrl={(memory.voice_note_path && signed.get(memory.voice_note_path)) || null}
      assistanceEnabled={profile?.writing_assistance_enabled !== false}
    />
  );
}
