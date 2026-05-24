import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getServerClient } from '@/lib/supabase/server';
import StoryEditorPage from '@/components/stories/editor/StoryEditorPage';

export const metadata: Metadata = {
  title: 'Share a Memory — Ancestorii',
};

export default async function CreateStoryPage() {
  const supabase = await getServerClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth?.user) {
    redirect('/login?redirect=/stories/create');
  }

  return <StoryEditorPage mode="create" />;
}