import { getServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import MemoryEditorPage from '../[id]/edit/MemoryEditorPage';

export default async function CreateMemoryPage() {
  const supabase = await getServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return notFound();

  // The family to write into, and whether this member wants Story Assistance: both at once.
  const [{ data: membership }, { data: profile }] = await Promise.all([
    supabase
      .from('family_memberships')
      .select('family_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle(),
    supabase
      .from('Profiles')
      .select('writing_assistance_enabled')
      .eq('id', user.id)
      .maybeSingle(),
  ]);

  if (!membership) return notFound();

  return (
    <MemoryEditorPage
      mode="create"
      familyId={membership.family_id}
      assistanceEnabled={profile?.writing_assistance_enabled !== false}
    />
  );
}
