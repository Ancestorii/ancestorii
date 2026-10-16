import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getServerClient } from '@/lib/supabase/server';
import StoryEditorPage from '@/components/stories/editor/StoryEditorPage';

// The root layout's template adds " | Ancestorii"
export const metadata: Metadata = {
  title: 'Share a Memory',
};

export default async function CreateStoryPage() {
  const supabase = await getServerClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth?.user) {
    redirect('/login?redirect=/stories/create');
  }

  return <StoryEditorPage mode="create" />;
}