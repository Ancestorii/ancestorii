import { getServerClient } from '@/lib/supabase/server';
import DashboardHomeLogic from './DashboardHomeLogic';

export default async function DashboardHomePage() {
  const supabase = await getServerClient();

  /* ======================================== */
  /* AUTH */
  /* ======================================== */
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return null;

  const uid = user.id;

  /* ======================================== */
  /* PROFILE */
  /* ======================================== */
  let { data: profile } = await supabase
    .from('Profiles')
    .select(
      'full_name, home_image_0, home_image_1, home_image_2, home_image_3, home_image_4'
    )
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
      .select(
        'full_name, home_image_0, home_image_1, home_image_2, home_image_3, home_image_4'
      )
      .single();

    profile = inserted;
  }

  /* ======================================== */
  /* HOME IMAGES */
  /* ======================================== */
  const images = await Promise.all(
    [0, 1, 2, 3, 4].map(async (i) => {
      const path = profile?.[
        `home_image_${i}` as
          | 'home_image_0'
          | 'home_image_1'
          | 'home_image_2'
          | 'home_image_3'
          | 'home_image_4'
      ];

      if (!path) return null;

      const { data } = await supabase.storage
        .from('user-media')
        .createSignedUrl(path, 60 * 60 * 24 * 7);

      return data?.signedUrl ?? null;
    })
  );

  /* ======================================== */
  /* METRICS */
  /* ======================================== */

 const [
  { count: lovedOnesCount },
  { count: memoriesCount },
  { count: timelinesCount },
  { count: albumsCount },
  { count: capsulesCount },
] = await Promise.all([
  supabase.from('family_members').select('*', { count: 'exact', head: true }).eq('owner_id', uid),
  supabase.from('library_media').select('*', { count: 'exact', head: true }).eq('user_id', uid),
  supabase.from('timelines').select('*', { count: 'exact', head: true }).eq('owner_id', uid),
  supabase.from('albums').select('*', { count: 'exact', head: true }).eq('user_id', uid),
  supabase.from('memory_capsules').select('*', { count: 'exact', head: true }).eq('user_id', uid),
]);

 /* ======================================== */
/* LOVED ONES (for list) */
/* ======================================== */
const { data: lovedOnesRaw } = await supabase
  .from('family_members')
  .select(`
    id,
    full_name,
    relationship_to_user,
    avatar_url
  `)
  .eq('owner_id', uid)
  .order('created_at', { ascending: false })
  .limit(6);

const lovedOneIds = (lovedOnesRaw || []).map((person) => person.id);

const [
  { data: timelineTags },
  { data: capsuleTags },
  { data: albumTags },
  { data: eventTags },
] = lovedOneIds.length
  ? await Promise.all([
      supabase
        .from('timeline_loved_ones')
        .select('loved_one_id')
        .in('loved_one_id', lovedOneIds),

      supabase
        .from('capsule_loved_ones')
        .select('loved_one_id')
        .in('loved_one_id', lovedOneIds),

      supabase
        .from('album_loved_ones')
        .select('loved_one_id')
        .in('loved_one_id', lovedOneIds),

      supabase
        .from('timeline_tags')
        .select('family_member_id')
        .in('family_member_id', lovedOneIds),
    ])
  : [
      { data: [] as any[] },
      { data: [] as any[] },
      { data: [] as any[] },
      { data: [] as any[] },
    ];

const lovedOneMemoryCounts = lovedOneIds.reduce<Record<string, number>>(
  (acc, id) => {
    acc[id] = 0;
    return acc;
  },
  {}
);

(timelineTags || []).forEach((row: any) => {
  lovedOneMemoryCounts[row.loved_one_id] =
    (lovedOneMemoryCounts[row.loved_one_id] || 0) + 1;
});

(capsuleTags || []).forEach((row: any) => {
  lovedOneMemoryCounts[row.loved_one_id] =
    (lovedOneMemoryCounts[row.loved_one_id] || 0) + 1;
});

(albumTags || []).forEach((row: any) => {
  lovedOneMemoryCounts[row.loved_one_id] =
    (lovedOneMemoryCounts[row.loved_one_id] || 0) + 1;
});

(eventTags || []).forEach((row: any) => {
  lovedOneMemoryCounts[row.family_member_id] =
    (lovedOneMemoryCounts[row.family_member_id] || 0) + 1;
});

const relationshipLabelMap: Record<string, string> = {
  parent: 'Parent',
  sibling: 'Sibling',
  child: 'Child',
  partner: 'Spouse / Partner',
  grandparent: 'Grandparent',
  aunt_uncle: 'Aunt / Uncle',
  extended: 'Extended Family',
  friend: 'Friend',
  mother: 'Parent',
  father: 'Parent',
  mum: 'Parent',
  mom: 'Parent',
  dad: 'Parent',
};

const lovedOnes = await Promise.all(
  (lovedOnesRaw || []).map(async (person: any) => {
    const relKey = (person.relationship_to_user || '').trim().toLowerCase();

    let relationship_label =
      relationshipLabelMap[relKey] ||
      person.relationship_to_user?.replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase()) ||
      'Loved one';

    let avatar_signed: string | null = null;

    if (person.avatar_url) {
      const { data: signed } = await supabase.storage
        .from('user-media')
        .createSignedUrl(person.avatar_url, 60 * 60 * 24);

      avatar_signed = signed?.signedUrl ? `${signed.signedUrl}&cb=${Date.now()}` : null;
    }

    return {
      ...person,
      relationship_label,
      memories_count: lovedOneMemoryCounts[person.id] || 0,
      avatar_signed,
    };
  })
);

 /* ======================================== */
/* RECENT ACTIVITY */
/* ======================================== */
const [
  { data: recentLovedOnes },
  { data: recentTimelines },
  { data: recentCapsules },
  { data: recentAlbums },
  { data: recentLibraryMedia },
] = await Promise.all([
  supabase
    .from('family_members')
    .select('id, full_name, created_at')
    .eq('owner_id', uid)
    .order('created_at', { ascending: false })
    .limit(5),

  supabase
    .from('timelines')
    .select('id, title, created_at')
    .eq('owner_id', uid)
    .order('created_at', { ascending: false })
    .limit(5),

  supabase
    .from('memory_capsules')
    .select('id, title, created_at')
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .limit(5),

  supabase
    .from('albums')
    .select('id, title, created_at')
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .limit(5),

  supabase
    .from('library_media')
    .select('id, file_type, created_at')
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .limit(5),
]);

const activity = [
  ...(recentLovedOnes || []).map((item: any) => ({
    id: `family-${item.id}`,
    action: `Added loved one ${item.full_name}`,
    target_type: 'family_member',
    created_at: item.created_at,
  })),
  ...(recentTimelines || []).map((item: any) => ({
    id: `timeline-${item.id}`,
    action: `Created timeline ${item.title}`,
    target_type: 'timeline',
    created_at: item.created_at,
  })),
  ...(recentCapsules || []).map((item: any) => ({
    id: `capsule-${item.id}`,
    action: `Created capsule ${item.title}`,
    target_type: 'capsule',
    created_at: item.created_at,
  })),
  ...(recentAlbums || []).map((item: any) => ({
    id: `album-${item.id}`,
    action: `Created album ${item.title}`,
    target_type: 'album',
    created_at: item.created_at,
  })),
  ...(recentLibraryMedia || []).map((item: any) => ({
    id: `library-${item.id}`,
    action: `Uploaded ${item.file_type || 'media'} to your library`,
    target_type: 'library_media',
    created_at: item.created_at,
  })),
]
  .sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  .slice(0, 5);
  /* ======================================== */
  /* CAPSULE (latest) */
  /* ======================================== */
  const { data: latestCapsule } = await supabase
    .from('memory_capsules')
    .select('id, title, unlock_date')
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  /* ======================================== */
  /* VOICE NOTES COUNT */
  /* ======================================== */
  const [{ count: albumVoices }, { count: capsuleVoices }, { count: timelineVoices }] =
    await Promise.all([
      supabase.from('album_voice_notes').select('*', { count: 'exact', head: true }).eq('user_id', uid),
      supabase.from('capsule_voice_notes').select('*', { count: 'exact', head: true }).eq('user_id', uid),
      supabase.from('timeline_event_media_voice_notes').select('*', { count: 'exact', head: true }).eq('user_id', uid),
    ]);

  const voiceNotesCount =
    (albumVoices || 0) +
    (capsuleVoices || 0) +
    (timelineVoices || 0);

  /* ======================================== */
  /* RETURN */
  /* ======================================== */
  return (
    <DashboardHomeLogic
      name={profile?.full_name ?? user.user_metadata?.full_name ?? null}
      email={user.email ?? null}
      homeImages={images}

      /* NEW DATA */
     metrics={{
  lovedOnes: lovedOnesCount || 0,
  memories: memoriesCount || 0,
  timelines: timelinesCount || 0,
  albums: albumsCount || 0,
  capsules: capsulesCount || 0,
  voiceNotes: voiceNotesCount,
  totalCollectionItems:
    (lovedOnesCount || 0) +
    (timelinesCount || 0) +
    (capsulesCount || 0) +
    (albumsCount || 0),
}}

      lovedOnes={lovedOnes || []}
      activity={activity || []}
      latestCapsule={latestCapsule}
    />
  );
}