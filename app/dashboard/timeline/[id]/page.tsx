'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, FileDown, Monitor, Plus, Users, X } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import HorizontalTimeline, { TimelineEvent } from '@app/dashboard/timeline/_components/HorizontalTimeline';
import CreateEventDrawer from '@app/dashboard/timeline/_components/CreateEventDrawer';
import UniversalPeopleTagger from '@/components/UniversalPeopleTagger';
import ExportTimelineDrawer from '@app/dashboard/timeline/_components/ExportTimelineDrawer';
import TimelineAI from '../_components/TimelineAI';
import {
  ui,
  AppLoader,
  Avatar,
  Btn,
  btnClass,
  Eyebrow,
  EmptyState as KitEmptyState,
  IconTile,
  toneByKey,
} from '@/components/dashboard/ui/AppBits';
import s from './timelineDetail.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

const thumbnailCache = new Map<string, TimelineThumbnail[]>();


const isUuid = (v?: string) =>
  typeof v === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

function CenterLoader({ label = 'Loading timeline…' }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <AppLoader label={label} />
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <KitEmptyState
      Icon={Calendar}
      tone={toneByKey('aqua')}
      title="Your timeline is empty"
      text="Add your first memory to begin your story."
    >
      <Btn onClick={onCreate} aria-haspopup="dialog" tile={<Plus size={18} strokeWidth={2.6} />}>
        Add your first memory
      </Btn>
    </KitEmptyState>
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

  if (thumbnailCache.has(ev.id)) {
    return thumbnailCache.get(ev.id)!;
  }

  try {
    const { data } = await supabase
      .from('timeline_event_media')
      .select('file_path, file_type')
      .eq('event_id', ev.id)
      .in('file_type', ['photo', 'video'])
      .order('created_at', { ascending: true })
      .limit(4);

    if (!data || data.length === 0) {
    thumbnailCache.set(ev.id, []);
  return [];
}

    const paths = data
  .map((r) => r.file_path)
  .filter(Boolean) as string[];

    const { data: signed } = await supabase.storage
      .from('timeline-media')
      .createSignedUrls(paths, 3600);

    const result = signed
      ?.map((s, i) =>
        s?.signedUrl
          ? {
              url: s.signedUrl,
              type: data[i].file_type,
            }
          : null
      )
      .filter(Boolean) as TimelineThumbnail[];

    thumbnailCache.set(ev.id, result);
    // preload images
  result.forEach((img) => {
  const i = new Image();
  i.src = img.url;
});

    return result;
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

  // The first load of the memories (later reloads keep the drawing in place): a loader, not a
  // flash of the empty state, and the count chip holds its place.
  const firstLoad = loading && events.length === 0;

 return (
  <div className={s.page}>
    {/* Phones and tablets: a notice over the page (display:none from 1024px) */}
    <div className={cx('flex lg:hidden', s.gate)}>
      <div className={cx(ui.empty, s.gateCard)}>
        <IconTile Icon={Monitor} tone={toneByKey('aqua')} size="lg" />
        <h2 className={ui.emptyTitle}>Bigger screen needed</h2>
        <p className={ui.emptyText}>
          The timeline builder works best on a laptop, desktop, or tablet. Open Ancestorii on a bigger screen to view your timeline.
        </p>
        <div className={ui.emptyActions}>
          <a href="/dashboard/timeline" className={btnClass()}>
            <ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
            <span>Back to Timelines</span>
          </a>
        </div>
      </div>
    </div>

    <div className={s.inner}>
      <header className={ui.header}>
        <div className={ui.headerGlow} aria-hidden="true" />

        {/* Top row: back to the list, the timeline's actions on the right */}
        <div className={s.topRow}>
          <Btn
            variant="soft"
            size="sm"
            onClick={() => router.push('/dashboard/timeline')}
            icon={<ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />}
          >
            Back to Timelines
          </Btn>

          <div className={s.actions}>
            {/* The PDF export drawer was mounted but nothing opened it, so the "Preserve My
                Legacy" download the feature page promises could not be reached. */}
            <Btn
              variant="soft"
              size="sm"
              onClick={() => setExportOpen(true)}
              aria-haspopup="dialog"
              icon={<FileDown size={17} strokeWidth={2.2} aria-hidden="true" />}
            >
              Preserve My Legacy
            </Btn>
            <Btn
              variant="soft"
              size="sm"
              onClick={() => setTagOpen(true)}
              aria-haspopup="dialog"
              icon={<Users size={17} strokeWidth={2.2} aria-hidden="true" />}
            >
              Tag someone you love
            </Btn>
            <Btn
              size="sm"
              onClick={() => setCreateOpen(true)}
              aria-haspopup="dialog"
              tile={<Plus size={16} strokeWidth={2.6} />}
            >
              Create A Memory
            </Btn>
          </div>
        </div>

        {/* Title, count, description, people */}
        <div className={s.titleBlock}>
          <div className={ui.headerTop}>
            <Eyebrow dot="var(--c3)">Timeline</Eyebrow>
          </div>

          <h1 className={cx(ui.title, ui.titleMd)}>{timeline?.title}</h1>

          <div className={ui.meta}>
            <span
              className={cx(ui.chip, ui.chipInk, ui.chipDot, firstLoad && 'invisible')}
              style={{ '--dot': 'var(--c3)' } as CSSProperties}
              aria-hidden={firstLoad || undefined}
            >
              {events.length} {events.length === 1 ? 'memory' : 'memories'}
            </span>
          </div>

          {timeline?.description && (
            <p className={cx(ui.lead, s.lead)}>
              {timeline.description}
            </p>
          )}

          {/* Tagged people: below the title and description */}
          {taggedPeople.length > 0 && (
            <ul className={s.people} aria-label="People on this timeline">
              {taggedPeople.map((p) => (
                <li key={p.id} className={cx(ui.chip, s.person)}>
                  <span className={s.personAvatar} aria-hidden="true">
                    <Avatar src={p.avatar_signed} name={p.full_name} size={24} plain />
                  </span>
                  <span className={s.personName}>{p.full_name}</span>
                  <button
                    type="button"
                    onClick={() => removePersonFromTimeline(p.id)}
                    className={s.remove}
                    title="Remove from this timeline"
                    aria-label={`Remove ${p.full_name} from this timeline`}
                  >
                    <X size={14} strokeWidth={2.6} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>
    </div>

    {/* The timeline (display:none below 1024px: the notice above covers the page there, so phones skip laying it out) */}
    <section
      className={cx('hidden lg:block', s.band, !firstLoad && events.length > 0 && s.bandTimeline)}
      aria-label="Timeline"
    >
      {firstLoad ? (
        <AppLoader compact label="Loading timeline…" className={s.bandLoader} />
      ) : events.length === 0 ? (
        <EmptyState onCreate={() => setCreateOpen(true)} />
      ) : (
        <HorizontalTimeline
          key={timelineId} // 👈 IMPORTANT
          events={events}
          thumbnailResolver={thumbnailResolver}
          onCreateMemory={() => setCreateOpen(true)}
          height={420}
        />
      )}
    </section>

    <TimelineAI
        timelineTitle={timeline?.title || ''}
        taggedPeopleNames={taggedPeople.map((p) => p.full_name)}
      />

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
