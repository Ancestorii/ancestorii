import { getServerClient } from '@/lib/supabase/server';
import DashboardHomeClient from './DashboardHomeClient';

export default async function DashboardHomePage() {
  const supabase = await getServerClient();

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;

  if (!user) return null;

  const uid = user.id;

  // Fetch profile
  let { data: profile } = await supabase
    .from('Profiles')
    .select('full_name, home_image_0, home_image_1, home_image_2')
    .eq('id', uid)
    .maybeSingle();

  if (!profile) {
    const { data: inserted } = await supabase
      .from('Profiles')
      .insert({
        id: uid,
        full_name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          null,
      })
      .select('full_name, home_image_0, home_image_1, home_image_2')
      .single();

    profile = inserted;
  }

  const images = await Promise.all(
    [0, 1, 2].map(async (i) => {
      const path = profile?.[`home_image_${i}` as 'home_image_0' | 'home_image_1' | 'home_image_2'];
      if (!path) return null;

      const { data } = await supabase.storage
        .from('user-media')
        .createSignedUrl(path, 60 * 60 * 24 * 7);

      return data?.signedUrl ?? null;
    })
  );

  return (
    <DashboardHomeClient
      name={profile?.full_name ?? null}
      homeImages={images}
    />
  );
}