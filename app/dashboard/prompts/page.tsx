import { getServerClient } from '@/lib/supabase/server';
import PromptLibrary from './PromptLibrary';

export default async function PromptsPage() {
  const supabase = await getServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return null;

  const { data: membership } = await supabase
    .from('family_memberships')
    .select('family_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  const familyId = membership?.family_id || '';

  const { data: family } = familyId
    ? await supabase.from('families').select('name').eq('id', familyId).single()
    : { data: null };

  const { data: chapters } = await supabase
    .from('memory_prompt_chapters')
    .select('id, name, description, icon, display_order')
    .order('display_order');

  const { data: prompts } = await supabase
    .from('memory_prompts')
    .select('id, chapter_id, question, display_order')
    .order('display_order');

  // Get existing family members for the "send to" picker
  const { data: members } = await supabase
    .from('family_memberships')
    .select('user_id')
    .eq('family_id', familyId)
    .neq('user_id', user.id);

  const memberIds = (members || []).map((m: any) => m.user_id);

  const { data: memberProfiles } = memberIds.length
    ? await supabase
        .from('Profiles')
        .select('id, full_name, email')
        .in('id', memberIds)
    : { data: [] };

  return (
    <PromptLibrary
      chapters={chapters || []}
      prompts={prompts || []}
      familyId={familyId}
      familyName={family?.name || 'your family'}
      userId={user.id}
      familyMembers={(memberProfiles || []).map((p: any) => ({
        id: p.id,
        name: p.full_name || 'Family Member',
        email: p.email || '',
      }))}
    />
  );
}