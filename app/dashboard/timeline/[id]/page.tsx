'use client';

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, FileDown, Monitor, Plus, Users, X } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
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


const isUuid = (v?: string) =>
  typeof v === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

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

// A link that isn't one of this family's timelines (or isn't a timeline at all): say so, instead
// of a loader that never ends, or an empty page whose "Add your first memory" button can't.
function NotFound() {
  return (
    <div className={s.page}>
      <div className={s.inner}>
        <KitEmptyState
          Icon={Calendar}
          tone={toneByKey('aqua')}
          title="Timeline not found"
          text="It may have been deleted, or it belongs to another family."
        >
          <Btn href="/dashboard/timeline" icon={<ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />}>
            Back to Timelines
          </Btn>
        </KitEmptyState>
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

type TaggedPerson = { id: string; full_name: string; avatar_signed?: string | null };

// A memory as the events query returns it, its media embedded (with a library file's own path).
type MediaRow = {
  file_path: string | null;
  file_type: string;
  created_at: string | null;
  library_media: { file_path: string } | { file_path: string }[] | null;
};
type EventRow = {
  id: string;
  title: string;
  event_date: string;
  timeline_event_media: MediaRow[] | null;
};
type Bucket = 'timeline-media' | 'library-media';

export default function TimelineDetailPage() {
  // One client for the page (the loader below is memoised on it).
  const supabase = useMemo(() => getBrowserClient(), []);
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const routeId = (params?.id as string | undefined) || undefined;
  const timelineId = useMemo(() => (isUuid(routeId) ? routeId : undefined), [routeId]);

  const [timeline, setTimeline] = useState<TimelineMeta | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, TimelineThumbnail[]>>({});
  const [taggedPeople, setTaggedPeople] = useState<TaggedPerson[]>([]);
  // False until the first load lands: the page's chrome shows at once, and the title, the count
  // and the drawing arrive together (there used to be a whole-page loader, then the header with
  // a second loader under it).
  const [ready, setReady] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);

  // Everything the page shows, in two rounds: the timeline, its memories (with their media) and
  // its people go out together, then the signed URLs, one call per bucket. It used to be a query
  // and a signing call per memory, plus one per avatar. Later calls (after a memory changes)
  // update the drawing in place.
  const load = useCallback(async () => {
    if (!timelineId) return;

    const [tlRes, evRes, tagRes] = await Promise.all([
      supabase
        .from('timelines')
        .select('id, title, description, cover_path, created_at')
        .eq('id', timelineId)
        .maybeSingle(),
      supabase
        .from('timeline_events')
        .select(
          'id, title, event_date, timeline_event_media(file_path, file_type, created_at, library_media:library_media_id(file_path))'
        )
        .eq('timeline_id', timelineId)
        .order('event_date', { ascending: true }),
      supabase
        .from('timeline_tags')
        .select('family_members(id, full_name, avatar_url)')
        .eq('timeline_id', timelineId),
    ]);

    if (tlRes.error || !tlRes.data) {
      setNotFound(true);
      setReady(true);
      return;
    }
    if (evRes.error) toast.error('Failed to load the memories on this timeline.');

    const rows = (evRes.data ?? []) as unknown as EventRow[];

    // The first four photos or videos of each memory, and the bucket each one lives in.
    type Pick = { path: string; bucket: Bucket; type: 'photo' | 'video' };
    const perEvent: Record<string, Pick[]> = {};
    const paths: Record<Bucket, Set<string>> = { 'timeline-media': new Set(), 'library-media': new Set() };
    for (const r of rows) {
      const list: Pick[] = [];
      const media = [...(r.timeline_event_media ?? [])]
        .filter((m) => m.file_type === 'photo' || m.file_type === 'video')
        .sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''))
        .slice(0, 4);
      for (const m of media) {
        const lib = Array.isArray(m.library_media) ? m.library_media[0] : m.library_media;
        const bucket: Bucket = lib?.file_path ? 'library-media' : 'timeline-media';
        const path = lib?.file_path ?? m.file_path;
        if (!path) continue;
        paths[bucket].add(path);
        list.push({ path, bucket, type: m.file_type as 'photo' | 'video' });
      }
      perEvent[r.id] = list;
    }

    type Person = { id: string; full_name: string; avatar_url: string | null };
    const people = ((tagRes.data ?? []) as unknown as { family_members: Person | Person[] | null }[])
      .map((row) => (Array.isArray(row.family_members) ? row.family_members[0] : row.family_members))
      .filter((p): p is Person => !!p);
    const avatarPaths = people
      .map((p) => p.avatar_url)
      .filter((u): u is string => !!u && !u.startsWith('http'));

    const sign = async (bucket: string, list: string[]) => {
      const map = new Map<string, string>();
      if (!list.length) return map;
      const { data } = await supabase.storage.from(bucket).createSignedUrls(list, 3600);
      data?.forEach((row, i) => {
        if (row?.signedUrl) map.set(row.path ?? list[i], row.signedUrl);
      });
      return map;
    };
    const [tlUrls, libUrls, avatarUrls] = await Promise.all([
      sign('timeline-media', [...paths['timeline-media']]),
      sign('library-media', [...paths['library-media']]),
      sign('user-media', avatarPaths),
    ]);

    const nextThumbs: Record<string, TimelineThumbnail[]> = {};
    for (const [id, list] of Object.entries(perEvent)) {
      nextThumbs[id] = list.flatMap((m) => {
        const url = (m.bucket === 'library-media' ? libUrls : tlUrls).get(m.path);
        return url ? [{ url, type: m.type }] : [];
      });
    }
    // Warm the cache, so the cards off to the right don't pop in when panned to.
    for (const list of Object.values(nextThumbs)) {
      for (const t of list) {
        if (t.type === 'photo') {
          const img = new Image();
          img.src = t.url;
        }
      }
    }

    setTimeline(tlRes.data as TimelineMeta);
    setEvents(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        happened_at: r.event_date ? `${r.event_date}T00:00:00Z` : new Date().toISOString(),
      }))
    );
    setThumbs(nextThumbs);
    setTaggedPeople(
      people.map((p) => ({
        id: p.id,
        full_name: p.full_name,
        avatar_signed: !p.avatar_url
          ? null
          : p.avatar_url.startsWith('http')
          ? p.avatar_url
          : avatarUrls.get(p.avatar_url) ?? null,
      }))
    );
    setReady(true);
  }, [supabase, timelineId]);

  useEffect(() => {
    void load();
  }, [load]);

  // A memory changed inside its modal (media added or removed, or the memory deleted): redraw.
  useEffect(() => {
    const refresh = () => {
      void load();
    };
    window.addEventListener('timeline-media-updated', refresh);
    return () => window.removeEventListener('timeline-media-updated', refresh);
  }, [load]);

  const removePersonFromTimeline = async (familyMemberId: string) => {
    // RLS lets only the timeline's creator delete tags, silently: check a row really went.
    const { data, error } = await supabase
      .from('timeline_tags')
      .delete()
      .eq('timeline_id', timelineId)
      .eq('family_member_id', familyMemberId)
      .select('id');
    if (error || !data?.length) {
      toast.error('Only the person who created this timeline can remove people from it.');
      return;
    }
    setTaggedPeople((prev) => prev.filter((p) => p.id !== familyMemberId));
  };

  if (!timelineId || notFound) return <NotFound />;

 return (
  <div className={s.page}>
    {/* Phones and tablets: a notice over the page (display:none from 1024px) */}
    <div className={cx('flex lg:hidden', s.gate)}>
      <div className={cx(ui.empty, s.gateCard)}>
        <IconTile Icon={Monitor} tone={toneByKey('aqua')} size="lg" />
        <h2 className={ui.emptyTitle}>Bigger screen needed</h2>
        <p className={ui.emptyText}>
          The timeline builder needs a wider screen: a laptop, a desktop, or a tablet turned sideways. Open Ancestorii on one to view your timeline.
        </p>
        <div className={ui.emptyActions}>
          <Link href="/dashboard/timeline" className={btnClass()}>
            <ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
            <span>Back to Timelines</span>
          </Link>
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

        {/* Title, count, description, people. Until the first load lands the title and the
            count hold their place (invisible), so nothing moves when they appear. */}
        <div className={s.titleBlock}>
          <div className={ui.headerTop}>
            <Eyebrow dot="var(--c3)">Timeline</Eyebrow>
          </div>

          <h1 className={cx(ui.title, ui.titleMd, !ready && 'invisible')}>
            {timeline?.title || ' '}
          </h1>

          <div className={ui.meta}>
            <span
              className={cx(ui.chip, ui.chipInk, ui.chipDot, !ready && 'invisible')}
              style={{ '--dot': 'var(--c3)' } as CSSProperties}
              aria-hidden={!ready || undefined}
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
      className={cx('hidden lg:block', s.band, ready && events.length > 0 && s.bandTimeline)}
      aria-label="Timeline"
    >
      {!ready ? (
        <AppLoader compact label="Loading timeline…" className={s.bandLoader} />
      ) : events.length === 0 ? (
        <EmptyState onCreate={() => setCreateOpen(true)} />
      ) : (
        <HorizontalTimeline
          key={timelineId} // 👈 IMPORTANT
          events={events}
          thumbnails={thumbs}
          onCreateMemory={() => setCreateOpen(true)}
          height={420}
        />
      )}
    </section>

    {ready && timeline && (
      <TimelineAI
        timelineTitle={timeline.title || ''}
        taggedPeopleNames={taggedPeople.map((p) => p.full_name)}
      />
    )}

      <UniversalPeopleTagger
       parentType="timeline"
       parentId={timelineId}
       open={tagOpen}
       onClose={() => setTagOpen(false)}
       onSaved={() => {
        void load(); // 👈 refresh tags after save
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
      onCreated={() => {
        void load();
      }}
    />
  </div>
);
}
