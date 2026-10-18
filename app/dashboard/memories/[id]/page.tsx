import { getServerClient } from '@/lib/supabase/server';
import { sanitizeRichText } from '@/lib/richText/server';
import { notFound, redirect } from 'next/navigation';
import MemoryPageContent from './MemoryPageContent';

export type MemoryVoiceNote = {
  id: string;
  memoryId: string;
  recorderId: string;
  recorderName: string;
  recorderAvatarUrl: string | null;
  url: string;
  /** The storage path (memory-media), so the recorder's delete can remove the file too. */
  path: string;
  createdAt: string;
  isRecorder: boolean;
};

export type MemoryTab = {
  id: string;
  title: string;
  body: string;
  authorName: string;
  authorAvatarUrl: string | null;
  authorId: string;
  images: { url: string }[];
  voiceNotes: MemoryVoiceNote[];
  videoPath: string | null;
  createdAt: string;
  isAuthor: boolean;
};

export type MemoryComment = {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar_url: string | null;
  content: string | null;
  /** A signed URL for the voice comment, when it has one. */
  voice_note_path: string | null;
  /** The storage path (memory-media) of that voice comment, for the delete. */
  voice_path: string | null;
  created_at: string;
  parent_id: string | null;
};

type SignedMap = Map<string, string>;

/** One signing call for a whole bucket: path -> signed URL (paths that fail are left out). */
async function signAll(
  supabase: Awaited<ReturnType<typeof getServerClient>>,
  bucket: string,
  paths: string[]
): Promise<SignedMap> {
  const map: SignedMap = new Map();
  const unique = [...new Set(paths.filter(Boolean))];
  if (!unique.length) return map;
  const { data } = await supabase.storage.from(bucket).createSignedUrls(unique, 3600);
  (data || []).forEach((r) => {
    if (r.path && r.signedUrl && !r.error) map.set(r.path, r.signedUrl);
  });
  return map;
}

export default async function MemoryPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const supabase = await getServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return notFound();

  const memoryId = params.id;

  /* ── Fetch the memory (row security already limits it to the user's families) ── */
  const { data: memory } = await supabase
    .from('family_memories')
    .select('id, family_id, author_id, parent_memory_id, prompt_id, title, body, video_path, created_at')
    .eq('id', memoryId)
    .maybeSingle();

  if (!memory) return notFound();

  /* ── If this is a child memory, redirect to the parent ── */
  if (memory.parent_memory_id) {
    redirect(`/dashboard/memories/${memory.parent_memory_id}`);
  }

  /* ── Everything that only needs the memory, in one round ── */
  const [
    { data: membership },
    { data: childMemories },
    { count: reactionCount },
    { data: userReaction },
    { data: commentsData },
    { data: prompt },
  ] = await Promise.all([
    supabase
      .from('family_memberships')
      .select('id')
      .eq('user_id', user.id)
      .eq('family_id', memory.family_id)
      .maybeSingle(),
    supabase
      .from('family_memories')
      .select('id, author_id, title, body, video_path, created_at')
      .eq('parent_memory_id', memoryId)
      .order('created_at'),
    supabase
      .from('family_memory_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('memory_id', memoryId),
    supabase
      .from('family_memory_reactions')
      .select('id')
      .eq('memory_id', memoryId)
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('family_memory_comments')
      .select('id, user_id, author_name, author_avatar_url, content, voice_note_path, created_at, parent_id')
      .eq('memory_id', memoryId)
      .order('created_at'),
    memory.prompt_id
      ? supabase.from('memory_prompts').select('question').eq('id', memory.prompt_id).maybeSingle()
      : Promise.resolve({ data: null as { question: string } | null }),
  ]);

  if (!membership) return notFound();

  const allMemoryRows = [memory, ...(childMemories || [])];
  const allMemoryIds = allMemoryRows.map((m) => m.id);
  const allAuthorIds = [...new Set(allMemoryRows.map((m) => m.author_id))];

  /* ── Media (images) + voice notes for every perspective, keyed by memory id ── */
  const [{ data: allMedia }, { data: allVoiceNotes }] = await Promise.all([
    supabase
      .from('family_memory_media')
      .select('memory_id, file_path, file_type, display_order')
      .in('memory_id', allMemoryIds)
      .eq('file_type', 'image')
      .order('display_order'),
    supabase
      .from('family_memory_voice_notes')
      .select('id, memory_id, user_id, file_path, created_at')
      .in('memory_id', allMemoryIds)
      .order('created_at'),
  ]);

  /* ── Profiles for authors and recorders, and every memory-media file, in one round ── */
  const allProfileIds = [...new Set([...allAuthorIds, ...(allVoiceNotes || []).map((v) => v.user_id)])];
  const comments = commentsData || [];
  const [{ data: authorProfiles }, mediaSigned] = await Promise.all([
    supabase
      .from('Profiles')
      .select('id, full_name, profile_image_url, avatar_url')
      .in('id', allProfileIds),
    signAll(supabase, 'memory-media', [
      ...(allMedia || []).map((m) => m.file_path),
      ...(allVoiceNotes || []).map((v) => v.file_path),
      ...allMemoryRows.map((m) => m.video_path).filter((p): p is string => !!p),
      ...comments.map((c) => c.voice_note_path).filter((p): p is string => !!p),
    ]),
  ]);

  /* ── Avatars (authors, recorders and commenters): one signing call for user-media ── */
  const avatarPathOf = (p: { profile_image_url: string | null; avatar_url: string | null }) =>
    p.profile_image_url || p.avatar_url || null;
  const avatarSigned = await signAll(supabase, 'user-media', [
    ...(authorProfiles || []).map(avatarPathOf).filter((p): p is string => !!p && !p.startsWith('http')),
    ...comments.map((c) => c.author_avatar_url).filter((p): p is string => !!p && !p.startsWith('http')),
  ]);
  const avatarUrlFor = (path: string | null) =>
    !path ? null : path.startsWith('http') ? path : avatarSigned.get(path) || null;

  const mediaByMemory = new Map<string, string[]>();
  (allMedia || []).forEach((m) => {
    const url = mediaSigned.get(m.file_path);
    if (!url) return;
    if (!mediaByMemory.has(m.memory_id)) mediaByMemory.set(m.memory_id, []);
    mediaByMemory.get(m.memory_id)!.push(url);
  });

  const profileMap = new Map<string, string>();
  const avatarMap = new Map<string, string>();
  (authorProfiles || []).forEach((p) => {
    profileMap.set(p.id, p.full_name || 'Family Member');
    const url = avatarUrlFor(avatarPathOf(p));
    if (url) avatarMap.set(p.id, url);
  });

  /* ── Group voice notes per memory (per tab) ── */
  const voiceNotesByMemory = new Map<string, MemoryVoiceNote[]>();
  (allVoiceNotes || []).forEach((v) => {
    const url = mediaSigned.get(v.file_path);
    if (!url) return;
    const note: MemoryVoiceNote = {
      id: v.id,
      memoryId: v.memory_id,
      recorderId: v.user_id,
      recorderName: profileMap.get(v.user_id) || 'Family Member',
      recorderAvatarUrl: avatarMap.get(v.user_id) || null,
      url,
      path: v.file_path,
      createdAt: v.created_at,
      isRecorder: v.user_id === user.id,
    };
    if (!voiceNotesByMemory.has(v.memory_id)) voiceNotesByMemory.set(v.memory_id, []);
    voiceNotesByMemory.get(v.memory_id)!.push(note);
  });

  const tabs: MemoryTab[] = allMemoryRows.map((m) => ({
    id: m.id,
    title: m.title,
    // Cleaned here, before the page renders it with dangerouslySetInnerHTML (plain text stays
    // as typed: it is shown as text).
    body: m.body && m.body.includes('<') ? sanitizeRichText(m.body) : m.body,
    authorName: profileMap.get(m.author_id) || 'Family Member',
    authorAvatarUrl: avatarMap.get(m.author_id) || null,
    authorId: m.author_id,
    images: (mediaByMemory.get(m.id) || []).map((url) => ({ url })),
    voiceNotes: voiceNotesByMemory.get(m.id) || [],
    videoPath: (m.video_path && mediaSigned.get(m.video_path)) || null,
    createdAt: m.created_at,
    isAuthor: m.author_id === user.id,
  }));

  const commentRows: MemoryComment[] = comments.map((c) => ({
    id: c.id,
    user_id: c.user_id,
    author_name: c.author_name,
    author_avatar_url: avatarUrlFor(c.author_avatar_url),
    content: c.content,
    voice_note_path: (c.voice_note_path && mediaSigned.get(c.voice_note_path)) || null,
    voice_path: c.voice_note_path,
    created_at: c.created_at,
    parent_id: c.parent_id,
  }));

  return (
    <MemoryPageContent
      memoryId={memoryId}
      familyId={memory.family_id}
      tabs={tabs}
      reactionCount={reactionCount || 0}
      userHasReacted={!!userReaction}
      comments={commentRows}
      currentUserId={user.id}
      promptQuestion={prompt?.question || null}
    />
  );
}
