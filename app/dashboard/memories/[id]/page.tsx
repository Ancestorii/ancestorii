import { getServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import MemoryPageContent from './MemoryPageContent';

export type MemoryTab = {
  id: string;
  title: string;
  body: string;
  authorName: string;
  authorAvatarUrl: string | null;
  authorId: string;
  images: { url: string }[];
  voiceNotePath: string | null;
  videoPath: string | null;
  createdAt: string;
  isAuthor: boolean;
};

export type MemoryComment = {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar_url: string | null;
  content: string;
  created_at: string;
  parent_id: string | null;
};

export default async function MemoryPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const supabase = await getServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return notFound();

  const memoryId = params.id;

  /* ── Fetch the memory ── */
  const { data: memory } = await supabase
    .from('family_memories')
   .select('id, family_id, author_id, parent_memory_id, prompt_id, title, body, voice_note_path, video_path, created_at')
    .eq('id', memoryId)
    .single();

  if (!memory) return notFound();

  /* ── Verify family membership ── */
  const { data: membership } = await supabase
    .from('family_memberships')
    .select('id')
    .eq('user_id', user.id)
    .eq('family_id', memory.family_id)
    .maybeSingle();

  if (!membership) return notFound();

  /* ── If this is a child memory, redirect to the parent ── */
  if (memory.parent_memory_id) {
    const { redirect } = await import('next/navigation');
    redirect(`/dashboard/memories/${memory.parent_memory_id}`);
  }

  /* ── Fetch child memories (tabs) ── */
  const { data: childMemories } = await supabase
    .from('family_memories')
    .select('id, author_id, title, body, voice_note_path, video_path, created_at')
    .eq('parent_memory_id', memoryId)
    .order('created_at');

  const allMemoryRows = [memory, ...(childMemories || [])];
  const allMemoryIds = allMemoryRows.map((m) => m.id);
  const allAuthorIds = [...new Set(allMemoryRows.map((m) => m.author_id))];

  /* ── Batch fetch: media, profiles ── */
  const [{ data: allMedia }, { data: authorProfiles }] = await Promise.all([
    supabase
      .from('family_memory_media')
      .select('memory_id, file_path, file_type, display_order')
      .in('memory_id', allMemoryIds)
      .eq('file_type', 'image')
      .order('display_order'),
    supabase
      .from('Profiles')
      .select('id, full_name, profile_image_url, avatar_url')
      .in('id', allAuthorIds),
  ]);

  /* ── Sign all URLs ── */
  const mediaByMemory = new Map<string, string[]>();
  const mediaResults = await Promise.all(
    (allMedia || []).map(async (m) => {
      const { data: signed } = await supabase.storage.from('memory-media').createSignedUrl(m.file_path, 3600);
      return { memory_id: m.memory_id, signedUrl: signed?.signedUrl || null };
    })
  );
  mediaResults.forEach((r) => {
    if (!r.signedUrl) return;
    if (!mediaByMemory.has(r.memory_id)) mediaByMemory.set(r.memory_id, []);
    mediaByMemory.get(r.memory_id)!.push(r.signedUrl);
  });

  const avatarMap = new Map<string, string>();
  const voiceNoteUrlMap = new Map<string, string>();
  const videoUrlMap = new Map<string, string>();

  await Promise.all([
    ...(authorProfiles || []).map(async (p: any) => {
      const imgPath = p.profile_image_url || p.avatar_url;
      if (!imgPath) return;
      if (imgPath.startsWith('http')) { avatarMap.set(p.id, imgPath); return; }
      const { data: signed } = await supabase.storage.from('user-media').createSignedUrl(imgPath, 3600);
      if (signed?.signedUrl) avatarMap.set(p.id, signed.signedUrl);
    }),
    ...allMemoryRows.filter((m) => m.voice_note_path).map(async (m) => {
      const { data: signed } = await supabase.storage.from('memory-media').createSignedUrl(m.voice_note_path, 3600);
      if (signed?.signedUrl) voiceNoteUrlMap.set(m.id, signed.signedUrl);
    }),
    ...allMemoryRows.filter((m) => m.video_path).map(async (m) => {
      const { data: signed } = await supabase.storage.from('memory-media').createSignedUrl(m.video_path, 3600);
      if (signed?.signedUrl) videoUrlMap.set(m.id, signed.signedUrl);
    }),
  ]);

  /* ── Build tabs ── */
  const profileMap = new Map<string, string>();
  (authorProfiles || []).forEach((p: any) => profileMap.set(p.id, p.full_name || 'Family Member'));

  const tabs: MemoryTab[] = allMemoryRows.map((m) => ({
    id: m.id,
    title: m.title,
    body: m.body,
    authorName: profileMap.get(m.author_id) || 'Family Member',
    authorAvatarUrl: avatarMap.get(m.author_id) || null,
    authorId: m.author_id,
    images: (mediaByMemory.get(m.id) || []).map((url) => ({ url })),
    voiceNotePath: voiceNoteUrlMap.get(m.id) || null,
    videoPath: videoUrlMap.get(m.id) || null,
    createdAt: m.created_at,
    isAuthor: m.author_id === user.id,
  }));

  /* ── Reactions ── */
  const { count: reactionCount } = await supabase
    .from('family_memory_reactions')
    .select('*', { count: 'exact', head: true })
    .eq('memory_id', memoryId);

  const { data: userReaction } = await supabase
    .from('family_memory_reactions')
    .select('id')
    .eq('memory_id', memoryId)
    .eq('user_id', user.id)
    .maybeSingle();

  /* ── Comments ── */
  const { data: commentsData } = await supabase
    .from('family_memory_comments')
    .select('id, user_id, author_name, author_avatar_url, content, created_at, parent_id')
    .eq('memory_id', memoryId)
    .order('created_at');

  const commentsWithAvatars = await Promise.all(
    (commentsData || []).map(async (c: any) => {
      let avatarUrl = c.author_avatar_url;
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        const { data: signed } = await supabase.storage.from('user-media').createSignedUrl(avatarUrl, 3600);
        avatarUrl = signed?.signedUrl || null;
      }
      return {
        id: c.id, user_id: c.user_id, author_name: c.author_name,
        author_avatar_url: avatarUrl, content: c.content,
        created_at: c.created_at, parent_id: c.parent_id,
      };
    })
  );
  const comments: MemoryComment[] = commentsWithAvatars;

  /* ── Prompt question (if memory came from a prompt) ── */
  let promptQuestion: string | null = null;
  if (memory.prompt_id) {
    const { data: prompt } = await supabase
      .from('memory_prompts')
      .select('question')
      .eq('id', memory.prompt_id)
      .single();
    promptQuestion = prompt?.question || null;
  }

  return (
    <MemoryPageContent
      memoryId={memoryId}
      familyId={memory.family_id}
      tabs={tabs}
      reactionCount={reactionCount || 0}
      userHasReacted={!!userReaction}
      comments={comments}
      currentUserId={user.id}
      promptQuestion={promptQuestion}
    />
  );
}