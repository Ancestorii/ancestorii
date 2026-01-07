'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';
import HorizontalTimeline, { TimelineEvent } from '@app/dashboard/timeline/_components/HorizontalTimeline';
import CreateEventDrawer from '@app/dashboard/timeline/_components/CreateEventDrawer';
import UniversalPeopleTagger from '@/components/UniversalPeopleTagger';
import ExportTimelineDrawer from '@app/dashboard/timeline/_components/ExportTimelineDrawer';


const isUuid = (v?: string) =>
  typeof v === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

function CenterLoader({ label = 'Loading timeline…' }: { label?: string }) {
  return (
    <div className="h-[calc(100vh-80px)] grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-indigo-600" />
        <p className="text-sm text-slate-600">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="grid place-items-center py-24">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-10 w-10 rounded-full bg-indigo-50 grid place-items-center">
          <span className="text-xl">✨</span>
        </div>
        <h3 className="text-base font-semibold text-slate-800">Your timeline is empty</h3>
        <p className="text-sm text-slate-600">Add your first memory to begin your story.</p>
        <button
          onClick={onCreate}
          className="mt-4 rounded-full px-6 py-3 bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837] font-semibold shadow-md hover:shadow-lg hover:scale-[1.03] transition-all"
        >
          Add your first memory
        </button>
      </div>
    </div>
  );
}

type TimelineMeta = {
  id: string;
  title: string;
  description: string | null;
  cover_path: string | null;
  created_at: string;
};

type TimelineThumbnail = {
  url: string;
  type: 'photo' | 'video';
};

export default function TimelineDetailPage() {
  const supabase = getBrowserClient();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const routeId = (params?.id as string | undefined) || undefined;
  const timelineId = useMemo(() => (isUuid(routeId) ? routeId : undefined), [routeId]);

  const [timeline, setTimeline] = useState<TimelineMeta | null>(null);
  const [tlLoading, setTlLoading] = useState(true);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const [mediaVersion, setMediaVersion] = useState(0);

  const [tagOpen, setTagOpen] = useState(false);
  const [taggedPeople, setTaggedPeople] = useState<
  { id: string; full_name: string; avatar_signed?: string | null }[]
  >([]);

  const removePersonFromTimeline = async (familyMemberId: string) => {
  await supabase
    .from("timeline_tags")
    .delete()
    .eq("timeline_id", timelineId)
    .eq("family_member_id", familyMemberId);

  setTaggedPeople((prev) =>
    prev.filter((p) => p.id !== familyMemberId)
  );
};


  const thumbnailResolver = async (
  ev: TimelineEvent
): Promise<TimelineThumbnail[]> => {
  try {
    const { data } = await supabase
      .from('timeline_event_media')
      .select('file_path, file_type')
      .eq('event_id', ev.id)
      .in('file_type', ['photo', 'video'])
      .order('created_at', { ascending: true })
      .limit(4);

    if (!data) return [];

    const out: TimelineThumbnail[] = [];

    for (const row of data) {
      if (!row.file_path) continue;

     const { data: signed } = await supabase.storage
  .from('timeline-media')
  .createSignedUrl(row.file_path, 3600);

if (signed?.signedUrl) {
  out.push({
    url: `${signed.signedUrl}&v=${Date.now()}`, // 👈 FORCE REFRESH
    type: row.file_type,
  });
}

    }

    return out;
  } catch {
    return [];
  }
};


  async function loadTimeline() {
    if (!timelineId) return;
    setTlLoading(true);
    const { data } = await supabase
      .from('timelines')
      .select('id, title, description, cover_path, created_at')
      .eq('id', timelineId)
      .single();
    if (data) setTimeline(data as TimelineMeta);
    setTlLoading(false);
  }

  useEffect(() => {
  if (!timelineId) return;

  const refresh = () => {
    loadEvents();
    setMediaVersion((v) => v + 1); // 👈 FORCE re-render
  };

  window.addEventListener('timeline-media-updated', refresh);

  return () => {
    window.removeEventListener('timeline-media-updated', refresh);
  };
}, [timelineId]);



  async function loadTaggedPeople() {
  if (!timelineId) return;

  const { data, error } = await supabase
    .from('timeline_tags')
    .select(`
      family_members (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('timeline_id', timelineId);

  if (error) {
    console.error(error);
    return;
  }

  const people =
    data?.map((row: any) => row.family_members).filter(Boolean) ?? [];

  // sign avatars (same pattern as elsewhere)
  const withSigned = await Promise.all(
    people.map(async (p: any) => {
      if (!p.avatar_url) return p;

      const { data: signed } = await supabase.storage
        .from('user-media')
        .createSignedUrl(p.avatar_url, 60 * 60);

      return {
        ...p,
        avatar_signed: signed?.signedUrl ?? null,
      };
    })
  );

  setTaggedPeople(withSigned);
}


  async function loadEvents() {
    if (!timelineId) return;
    setLoading(true);
    const { data } = await supabase
      .from('timeline_events')
      .select('id, title, event_date')
      .eq('timeline_id', timelineId)
      .order('event_date', { ascending: true });

    if (data) {
      setEvents(
        data.map((r: any) => ({
          id: r.id,
          title: r.title,
          happened_at: r.event_date ? `${r.event_date}T00:00:00Z` : new Date().toISOString(),
        }))
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    if (timelineId) {
      loadTimeline();
      loadEvents();
      loadTaggedPeople(); // 👈 ADD
    }
  }, [timelineId]);

  if (!timelineId) return <CenterLoader />;
  if (tlLoading) return <CenterLoader label="Loading timeline info…" />;

 return (
  <div className="flex flex-col lg:flex-row min-h-screen bg-white">
    {/* LEFT — EXACT Albums container */}
    <div className="flex-1 p-8">
      <button
        onClick={() => router.push('/dashboard/timeline')}
        className="mb-6 text-sm font-medium text-black hover:text-[#C8A557] transition"
      >
        ← Back to Timelines
      </button>

      <div className="flex flex-row items-start justify-between gap-6 w-full border-b border-[#E6C26E]/55 pb-6">
        <div>
          <h1
            className="text-5xl font-bold italic"
            style={{ color: '#D4AF37' }}
          >
            {timeline?.title}
          </h1>

          {timeline?.description && (
            <p className="mt-6 text-gray-600 max-w-2xl">
              {timeline.description}
            </p>
          )}

          {/* TAGGED PEOPLE — BELOW TITLE & DESCRIPTION */}
{taggedPeople.length > 0 && (
  <div className="mt-8 flex flex-wrap items-center gap-3">
    {taggedPeople.map((p) => (
      <div
        key={p.id}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full
                   bg-[#F6F3EA] border border-[#E6C26E]/40"
      >
        {p.avatar_signed ? (
          <img
            src={p.avatar_signed}
            alt={p.full_name}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-7 h-7 rounded-full bg-[#E6C26E]
                       text-[#1F2837] text-xs font-semibold
                       flex items-center justify-center"
          >
            {p.full_name?.[0]?.toUpperCase()}
          </div>
        )}

        <span className="text-sm text-[#1F2837] font-medium">
          {p.full_name}
        </span>
        <span
  onClick={() => removePersonFromTimeline(p.id)}
  className="ml-1 cursor-pointer text-gray-400 hover:text-red-600 transition"
  title="Remove from this timeline"
>
  ✕
</span>
      </div>
    ))}
  </div>
)}
        </div>

        

        <div className="flex items-center gap-4">
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 h-[42px] rounded-full bg-emerald-50 border border-emerald-200 shadow-sm text-sm text-emerald-700 hover:bg-emerald-100 transition"
          >
            + Create A Memory
          </button>

          <button
            onClick={() => setTagOpen(true)}
            className="inline-flex items-center gap-2 px-5 h-[42px] rounded-full bg-violet-50 border border-violet-200 shadow-sm text-sm text-violet-700 hover:bg-violet-100 transition"
          >
            💜 Tag someone you love
          </button>
        </div>
      </div>

      {/* CONTENT — BELOW HEADER */}
     <div className="mt-20 pt-16 pb-16">
     {events.length === 0 ? (
       <EmptyState onCreate={() => setCreateOpen(true)} />
      ) : (
    <HorizontalTimeline
      key={mediaVersion} // 👈 IMPORTANT
      events={events}
      thumbnailResolver={thumbnailResolver}
      onCreateMemory={() => setCreateOpen(true)}
      height={420}
    />
  )}
</div>

    </div>

      <UniversalPeopleTagger
       parentType="timeline"
       parentId={timelineId}
       open={tagOpen}
       onClose={() => setTagOpen(false)}
       onSaved={() => {
        loadTaggedPeople(); // 👈 refresh tags after save
       }}
      />

      <ExportTimelineDrawer
    open={exportOpen}
    onClose={() => setExportOpen(false)}
    timelineId={timelineId}
       />


    <CreateEventDrawer
      open={createOpen}
      onOpenChange={setCreateOpen}
      timelineId={timelineId}
      onCreated={loadEvents}
    />
  </div>
);
}
