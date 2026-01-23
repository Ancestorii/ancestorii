import { getBrowserClient } from '@/lib/supabase/browser';

export async function postAuthRedirect(router: {
  replace: (path: string) => void;
}) {
  const supabase = getBrowserClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return;

  router.replace('/dashboard/home');
}
