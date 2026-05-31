import { getServerClient } from '@/lib/supabase/server';
import FamilyHeader from './_components/FamilyHeader';
import MemoryFeed from './_components/MemoryFeed';

export default async function DashboardHomePage() {
  const supabase = await getServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return null;
  const uid = user.id;

  /* ── Family ── */
  const { data: myMembership } = await supabase
    .from('family_memberships')
    .select('family_id, role')
    .eq('user_id', uid)
    .limit(1)
    .maybeSingle();

  let familyName = 'My Family';
  let familyRole = 'owner';
  let familyMemberCount = 1;
  const familyId = myMembership?.family_id || '';

  if (myMembership) {
    familyRole = myMembership.role;
    const { data: family } = await supabase
      .from('families')
      .select('name')
      .eq('id', familyId)
      .single();
    if (family?.name) familyName = family.name;

    const { count } = await supabase
      .from('family_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', familyId);
    familyMemberCount = count || 1;
  }

  /* ── Family memories (root only, no tabs) ── */
  const { data: memories } = await supabase
    .from('family_memories')
    .select('id, title, body, author_id, voice_note_path, prompt_id, created_at')
    .is('parent_memory_id', null)
    .order('created_at', { ascending: false })
    .limit(20);

  const memoryIds = (memories || []).map((m) => m.id);
  const authorIds = [...new Set((memories || []).map((m) => m.author_id))];

  /* ── Batch: media, reactions, comments, tabs ── */
  const [
    { data: allMedia },
    { data: reactionRows },
    { data: commentRows },
    { data: tabRows },
    { data: authorProfiles },
  ] = await Promise.all([
    memoryIds.length
      ? supabase
          .from('family_memory_media')
          .select('memory_id, file_path')
          .in('memory_id', memoryIds)
          .eq('file_type', 'image')
          .order('display_order')
      : { data: [] },
    memoryIds.length
      ? supabase.from('family_memory_reactions').select('memory_id').in('memory_id', memoryIds)
      : { data: [] },
    memoryIds.length
      ? supabase.from('family_memory_comments').select('memory_id').in('memory_id', memoryIds)
      : { data: [] },
    memoryIds.length
      ? supabase.from('family_memories').select('parent_memory_id').in('parent_memory_id', memoryIds)
      : { data: [] },
    authorIds.length
      ? supabase.from('Profiles').select('id, full_name, profile_image_url, avatar_url').in('id', authorIds)
      : { data: [] },
  ]);

  /* ── Build maps ── */
  const mediaMap = new Map<string, string>();
  (allMedia || []).forEach((m: any) => {
    if (!mediaMap.has(m.memory_id)) mediaMap.set(m.memory_id, m.file_path);
  });

  const reactionMap = new Map<string, number>();
  (reactionRows || []).forEach((r: any) => {
    reactionMap.set(r.memory_id, (reactionMap.get(r.memory_id) || 0) + 1);
  });

  const commentMap = new Map<string, number>();
  (commentRows || []).forEach((c: any) => {
    commentMap.set(c.memory_id, (commentMap.get(c.memory_id) || 0) + 1);
  });

  const tabMap = new Map<string, number>();
  (tabRows || []).forEach((t: any) => {
    tabMap.set(t.parent_memory_id, (tabMap.get(t.parent_memory_id) || 0) + 1);
  });

  /* ── Sign avatar URLs ── */
  const avatarMap = new Map<string, string>();
  for (const p of authorProfiles || []) {
    const imgPath = (p as any).profile_image_url || (p as any).avatar_url;
    if (imgPath) {
      if (imgPath.startsWith('http')) {
        avatarMap.set((p as any).id, imgPath);
      } else {
        const { data: signed } = await supabase.storage.from('user-media').createSignedUrl(imgPath, 3600);
        if (signed?.signedUrl) avatarMap.set((p as any).id, signed.signedUrl);
      }
    }
  }

  /* ── Sign cover images ── */
  const coverUrlMap = new Map<string, string>();
  for (const [memId, filePath] of mediaMap) {
    const { data: signed } = await supabase.storage.from('memory-media').createSignedUrl(filePath, 3600);
    if (signed?.signedUrl) coverUrlMap.set(memId, signed.signedUrl);
  }

  /* ── Total memories count ── */
  const { count: totalMemories } = await supabase
    .from('family_memories')
    .select('*', { count: 'exact', head: true })
    .is('parent_memory_id', null);

  /* ── Build feed ── */
  const feedMemories = (memories || []).map((m) => {
    const prof = (authorProfiles || []).find((p: any) => p.id === m.author_id) as any;
    return {
      id: m.id,
      title: m.title,
      body: m.body,
      author_name: prof?.full_name || 'Family Member',
      author_avatar_url: avatarMap.get(m.author_id) || null,
      cover_url: coverUrlMap.get(m.id) || null,
      voice_note_path: m.voice_note_path,
      reaction_count: reactionMap.get(m.id) || 0,
      comment_count: commentMap.get(m.id) || 0,
      tab_count: tabMap.get(m.id) || 0,
      created_at: m.created_at,
    };
  });

  return (
    <div className="min-h-screen bg-[#FCFAF7]">
      <FamilyHeader
        familyName={familyName}
        familyRole={familyRole}
        familyMemberCount={familyMemberCount}
        totalMemories={totalMemories || 0}
      />
      <MemoryFeed
        initialMemories={feedMemories}
        familyName={familyName}
        familyId={familyId}
      />
    </div>
  );
}