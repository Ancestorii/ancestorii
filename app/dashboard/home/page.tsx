import { getServerClient } from '@/lib/supabase/server';
import FamilyHeader from './_components/FamilyHeader';
import ActionHub from './_components/ActionHub';
import LibrarySection from './_components/LibrarySection';
import ActivitySection from './_components/ActivitySection';

export default async function DashboardHomePage() {
  const supabase = await getServerClient();

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return null;

  const uid = user.id;

  /* ── Profile ── */
  let { data: profile } = await supabase
    .from('Profiles')
    .select('full_name, home_image_0, home_image_1, home_image_2, home_image_3, home_image_4')
    .eq('id', uid)
    .maybeSingle();

  if (!profile) {
    const { data: inserted } = await supabase
      .from('Profiles')
      .insert({
        id: uid,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      })
      .select('full_name, home_image_0, home_image_1, home_image_2, home_image_3, home_image_4')
      .single();
    profile = inserted;
  }

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

  if (myMembership) {
    familyRole = myMembership.role;
    const { data: family } = await supabase
      .from('families')
      .select('name')
      .eq('id', myMembership.family_id)
      .single();
    if (family?.name) familyName = family.name;

    const { count } = await supabase
      .from('family_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', myMembership.family_id);
    familyMemberCount = count || 1;
  }

  /* ── Home images ── */
  const homeImages = await Promise.all(
    [0, 1, 2, 3, 4].map(async (i) => {
      const path = profile?.[`home_image_${i}` as keyof typeof profile] as string | null;
      if (!path) return null;
      const { data } = await supabase.storage.from('user-media').createSignedUrl(path, 60 * 60 * 24 * 7);
      return data?.signedUrl ?? null;
    })
  );

  /* ── Metrics (RLS scopes to family automatically) ── */
  const [
    { count: lovedOnesCount },
    { count: memoriesCount },
    { count: timelinesCount },
    { count: albumsCount },
    { count: capsulesCount },
  ] = await Promise.all([
    supabase.from('family_members').select('*', { count: 'exact', head: true }),
    supabase.from('library_media').select('*', { count: 'exact', head: true }),
    supabase.from('timelines').select('*', { count: 'exact', head: true }),
    supabase.from('albums').select('*', { count: 'exact', head: true }),
    supabase.from('memory_capsules').select('*', { count: 'exact', head: true }).eq('family_id', myMembership?.family_id ?? ''),
  ]);

  const metrics = {
    lovedOnes: lovedOnesCount || 0,
    memories: memoriesCount || 0,
    timelines: timelinesCount || 0,
    albums: albumsCount || 0,
    capsules: capsulesCount || 0,
    totalCollectionItems: (lovedOnesCount || 0) + (timelinesCount || 0) + (capsulesCount || 0) + (albumsCount || 0),
  };

  /* ── Recent activity (RLS scopes to family automatically) ── */
  const [
    { data: recentLovedOnes },
    { data: recentTimelines },
    { data: recentCapsules },
    { data: recentAlbums },
    { data: recentLibraryMedia },
  ] = await Promise.all([
    supabase.from('family_members').select('id, full_name, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('timelines').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
   supabase.from('memory_capsules').select('id, title, created_at').eq('family_id', myMembership?.family_id ?? '').order('created_at', { ascending: false }).limit(5),
    supabase.from('albums').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('library_media').select('id, file_type, created_at').order('created_at', { ascending: false }).limit(5),
  ]);

  const activity = [
    ...(recentLovedOnes || []).map((i: any) => ({ id: `family-${i.id}`, action: `Added loved one ${i.full_name}`, created_at: i.created_at })),
    ...(recentTimelines || []).map((i: any) => ({ id: `timeline-${i.id}`, action: `Created timeline ${i.title}`, created_at: i.created_at })),
    ...(recentCapsules || []).map((i: any) => ({ id: `capsule-${i.id}`, action: `Created capsule ${i.title}`, created_at: i.created_at })),
    ...(recentAlbums || []).map((i: any) => ({ id: `album-${i.id}`, action: `Created album ${i.title}`, created_at: i.created_at })),
    ...(recentLibraryMedia || []).map((i: any) => ({ id: `library-${i.id}`, action: `Uploaded ${i.file_type || 'media'} to library`, created_at: i.created_at })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-white text-stone-900">
      <div className="flex">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <FamilyHeader
            familyName={familyName}
            familyRole={familyRole}
            familyMemberCount={familyMemberCount}
            totalMemories={metrics.totalCollectionItems}
          />

          <ActionHub
            homeImages={homeImages}
            email={user.email ?? null}
          />

          <LibrarySection metrics={metrics} />
        </div>

        {/* Recent Activity — right panel */}
        <div className="hidden xl:block w-[300px] flex-shrink-0 border-l border-stone-200">
          <ActivitySection activity={activity} />
        </div>
      </div>
    </div>
  );
}