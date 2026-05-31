import { getServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import MemoryEditorPage from '../[id]/edit/MemoryEditorPage';

export default async function CreateMemoryPage() {
  const supabase = await getServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return notFound();

  const { data: membership } = await supabase
    .from('family_memberships')
    .select('family_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) return notFound();

  return (
    <MemoryEditorPage
      mode="create"
      familyId={membership.family_id}
    />
  );
}