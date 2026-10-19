'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, BookHeart, PenLine } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { plainTextFromHtml } from '@/lib/stories/format';
import { safeToast as toast } from '@/lib/safeToast';
import { ui, Accent, Btn, EmptyState, SectionHead, Spinner, toneByKey } from '@/components/dashboard/ui/AppBits';
import FamilyMemoryCard, { type FamilyMemory } from './FamilyMemoryCard';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

type Supabase = ReturnType<typeof getBrowserClient>;

type MemoryRow = {
  id: string;
  title: string;
  body: string;
  author_id: string;
  prompt_id: string | null;
  video_path: string | null;
  is_onboarding: boolean;
  created_at: string;
};

const PAGE_SIZE = 12;

// Long enough for the three lines the card shows.
const EXCERPT_LENGTH = 280;

// One page of the family's memories, newest first. A perspective added to a memory
// (parent_memory_id set) opens inside that memory, so only first tellings are listed, as in
// the app's Feed. The next page starts below the oldest memory shown, not at a count, so a
// memory written meanwhile can't shift the pages.
const fetchPage = (supabase: Supabase, familyId: string, before?: string) => {
  let query = supabase
    .from('family_memories')
    .select('id, title, body, author_id, prompt_id, video_path, is_onboarding, created_at')
    .eq('family_id', familyId)
    .is('parent_memory_id', null);
  if (before) query = query.lt('created_at', before);
  return query.order('created_at', { ascending: false }).limit(PAGE_SIZE);
};

/** One signing call for a whole bucket: path -> signed URL (paths that fail are left out). */
async function signAll(supabase: Supabase, bucket: string, paths: string[]) {
  const map = new Map<string, string>();
  const unique = [...new Set(paths)];
  if (!unique.length) return map;
  const { data } = await supabase.storage.from(bucket).createSignedUrls(unique, 3600);
  for (const entry of data ?? []) {
    if (entry.path && entry.signedUrl && !entry.error) map.set(entry.path, entry.signedUrl);
  }
  return map;
}

const tally = (rows: Record<string, string | null>[] | null, key: string) => {
  const counts = new Map<string, number>();
  for (const row of rows ?? []) {
    const id = row[key];
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
};

// Two rounds for a page of cards: everything about the memories side by side, then one
// signing call per bucket (photos and posters, avatars). Throws when a part the card needs
// can't be read, so the list offers a retry instead of showing wrong counts.
async function buildCards(supabase: Supabase, rows: MemoryRow[]): Promise<FamilyMemory[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const authorIds = [...new Set(rows.map((r) => r.author_id))];
  const promptIds = [...new Set(rows.map((r) => r.prompt_id).filter((p): p is string => !!p))];

  const [mediaRes, reactionsRes, commentsRes, perspectivesRes, voiceRes, profilesRes, promptsRes] =
    await Promise.all([
      supabase
        .from('family_memory_media')
        .select('memory_id, file_path')
        .in('memory_id', ids)
        .eq('file_type', 'image')
        .order('display_order'),
      supabase.from('family_memory_reactions').select('memory_id').in('memory_id', ids),
      // Every comment, replies too: the same number the memory page shows.
      supabase.from('family_memory_comments').select('memory_id').in('memory_id', ids),
      supabase.from('family_memories').select('parent_memory_id').in('parent_memory_id', ids),
      // Voice notes are only a cue on the card: a failed read just leaves it off. These rows
      // are what the memory page plays (as in the app's Feed), so the cue never promises a
      // note the page doesn't have.
      supabase.from('family_memory_voice_notes').select('memory_id').in('memory_id', ids),
      supabase.from('Profiles').select('id, full_name, profile_image_url, avatar_url').in('id', authorIds),
      promptIds.length
        ? supabase.from('memory_prompts').select('id, question').in('id', promptIds)
        : Promise.resolve({ data: [] as { id: string; question: string }[], error: null }),
    ]);

  const failed =
    mediaRes.error || reactionsRes.error || commentsRes.error || perspectivesRes.error || profilesRes.error;
  if (failed) throw failed;

  // The first photo (by display order) is the cover.
  const coverPath = new Map<string, string>();
  for (const m of mediaRes.data ?? []) if (!coverPath.has(m.memory_id)) coverPath.set(m.memory_id, m.file_path);
  const photoCounts = tally(mediaRes.data, 'memory_id');

  // A video with no photo shows the frame the app saves beside it; a video added on the web
  // has none, and its card keeps the video tile.
  const posterPath = new Map<string, string>();
  for (const r of rows) if (r.video_path && !coverPath.has(r.id)) posterPath.set(r.id, `${r.video_path}.poster.jpg`);

  const profiles = profilesRes.data ?? [];
  const avatarPathOf = (p: { profile_image_url: string | null; avatar_url: string | null }) =>
    p.profile_image_url || p.avatar_url || null;

  const [mediaSigned, avatarSigned] = await Promise.all([
    signAll(supabase, 'memory-media', [...coverPath.values(), ...posterPath.values()]),
    signAll(
      supabase,
      'user-media',
      profiles.map(avatarPathOf).filter((p): p is string => !!p && !p.startsWith('http'))
    ),
  ]);

  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const questionById = new Map((promptsRes.data ?? []).map((p) => [p.id, p.question]));
  const reactionCounts = tally(reactionsRes.data, 'memory_id');
  const commentCounts = tally(commentsRes.data, 'memory_id');
  const perspectiveCounts = tally(perspectivesRes.data, 'parent_memory_id');
  const withVoice = new Set((voiceRes.data ?? []).map((v) => v.memory_id));

  return rows.map((r) => {
    const profile = profileById.get(r.author_id);
    const avatarPath = profile ? avatarPathOf(profile) : null;
    const cover = coverPath.get(r.id) ?? posterPath.get(r.id);
    // Rich text (Quill) loses its tags; a plain body (onboarding's textarea) is kept as typed,
    // so "Nan <3 the beach ... Mum > Dad" isn't read as a tag and cut.
    const body = r.body ?? '';
    const text = /<\/?[a-z][^>]*>/i.test(body) ? plainTextFromHtml(body) : body.replace(/\s+/g, ' ').trim();
    return {
      id: r.id,
      title: r.title,
      excerpt: text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH).trimEnd()}…` : text,
      createdAt: r.created_at,
      isOnboarding: r.is_onboarding,
      question: r.prompt_id ? questionById.get(r.prompt_id) ?? null : null,
      authorName: profile?.full_name || 'Family Member',
      authorAvatar: !avatarPath ? null : avatarPath.startsWith('http') ? avatarPath : avatarSigned.get(avatarPath) ?? null,
      cover: cover ? mediaSigned.get(cover) ?? null : null,
      photoCount: photoCounts.get(r.id) ?? 0,
      perspectives: 1 + (perspectiveCounts.get(r.id) ?? 0),
      hasVoice: withVoice.has(r.id),
      hasVideo: !!r.video_path,
      reactions: reactionCounts.get(r.id) ?? 0,
      comments: commentCounts.get(r.id) ?? 0,
    };
  });
}

const WRITE_HREF = '/dashboard/memories/create';

/** The family's private memories on My Family, newest first, a page at a time. */
export default function FamilyMemories({ familyId }: { familyId: string }) {
  const supabase = getBrowserClient();

  const [memories, setMemories] = useState<FamilyMemory[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  // After "Show more", focus moves to the first new card (the button may be gone).
  const [focusId, setFocusId] = useState<string | null>(null);
  // Only the newest load may write state, so a slow earlier one can't overwrite it.
  const loadSeq = useRef(0);

  const loadFirst = useCallback(async () => {
    const seq = ++loadSeq.current;
    setStatus('loading');
    try {
      const [pageRes, countRes] = await Promise.all([
        fetchPage(supabase, familyId),
        supabase
          .from('family_memories')
          .select('id', { count: 'exact', head: true })
          .eq('family_id', familyId)
          .is('parent_memory_id', null),
      ]);
      if (pageRes.error) throw pageRes.error;
      const rows = (pageRes.data ?? []) as MemoryRow[];
      const cards = await buildCards(supabase, rows);
      if (seq !== loadSeq.current) return;
      const known = countRes.error ? null : countRes.count ?? null;
      setMemories(cards);
      // A full page with the total still ahead: with exactly 12 there is nothing more to show.
      setHasMore(rows.length === PAGE_SIZE && (known == null || rows.length < known));
      setTotal(known);
      setStatus('ready');
    } catch {
      if (seq === loadSeq.current) setStatus('error');
    }
  }, [supabase, familyId]);

  useEffect(() => {
    loadFirst();
    // Leaving the page drops a load still in flight.
    const seqRef = loadSeq;
    return () => {
      seqRef.current++;
    };
  }, [loadFirst]);

  const loadMore = async () => {
    const before = memories[memories.length - 1]?.createdAt;
    if (!before || loadingMore) return;
    const seq = loadSeq.current;
    setLoadingMore(true);
    try {
      const { data, error } = await fetchPage(supabase, familyId, before);
      if (error) throw error;
      const rows = (data ?? []) as MemoryRow[];
      const cards = await buildCards(supabase, rows);
      if (seq !== loadSeq.current) return;
      const seen = new Set(memories.map((m) => m.id));
      const fresh = cards.filter((c) => !seen.has(c.id));
      setMemories([...memories, ...fresh]);
      setHasMore(rows.length === PAGE_SIZE && (total == null || memories.length + fresh.length < total));
      if (fresh[0]) setFocusId(fresh[0].id);
    } catch {
      toast.error('Could not load more memories. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!focusId) return;
    document.getElementById(`memory-${focusId}`)?.focus({ preventScroll: true });
    setFocusId(null);
  }, [focusId]);

  const count = total ?? memories.length;

  return (
    <section className={ui.section} aria-labelledby="family-memories-title">
      <SectionHead
        id="family-memories-title"
        tag="Family Memories"
        tagDot="var(--c0)"
        title={
          <>
            The moments you&apos;re <Accent>keeping</Accent>
          </>
        }
        lead="Private to your family. Nothing here appears on Our Stories."
        action={
          status === 'ready' && memories.length > 0 ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:block">
                <span className={ui.chip}>
                  {count} {count === 1 ? 'memory' : 'memories'}
                </span>
              </span>
              <Btn
                href={WRITE_HREF}
                variant="soft"
                icon={<PenLine size={17} strokeWidth={2.4} aria-hidden="true" />}
              >
                Write a Memory
              </Btn>
            </div>
          ) : undefined
        }
      />

      {status === 'loading' && (
        <div className="@container" role="status" aria-live="polite">
          <span className={ui.srOnly}>Loading your family&apos;s memories</span>
          <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cx(ui.card, 'flex flex-col gap-3 rounded-[28px] p-1.5')}>
                <span className={cx(ui.skeleton, 'block aspect-[3/2] rounded-[22px]')} />
                <span className="flex flex-col gap-2 px-3 pb-4 pt-1">
                  <span className={cx(ui.skeleton, 'block h-5 w-3/4 rounded-full')} />
                  <span className={cx(ui.skeleton, 'block h-4 w-full rounded-full')} />
                  <span className={cx(ui.skeleton, 'block h-4 w-2/3 rounded-full')} />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className={ui.noticeError} role="alert">
          <span>
            We couldn&apos;t load your family&apos;s memories.{' '}
            <button type="button" onClick={loadFirst} className={ui.textLink}>
              Try again
            </button>
          </span>
        </div>
      )}

      {status === 'ready' && memories.length === 0 && (
        <EmptyState
          Icon={BookHeart}
          tone={toneByKey('pink')}
          title="No memories yet"
          text="Write the first one: a moment, a person or a place you don't want to lose. Only your family will see it."
        >
          <Btn href={WRITE_HREF} tile={<ArrowRight size={20} strokeWidth={2.4} />}>
            Write a Memory
          </Btn>
        </EmptyState>
      )}

      {status === 'ready' && memories.length > 0 && (
        <>
          {/* Columns follow the space beside the sidebar, as the member cards do */}
          <div className="@container">
            <ul role="list" className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
              {memories.map((memory) => (
                <li key={memory.id} className="min-w-0">
                  <FamilyMemoryCard memory={memory} />
                </li>
              ))}
            </ul>
          </div>

          {hasMore && (
            <div className="mt-6 flex justify-center">
              {/* aria-disabled, not disabled: a disabled button drops keyboard focus to the
                  page while it loads (loadMore ignores presses meanwhile) */}
              <Btn
                variant="soft"
                onClick={loadMore}
                aria-disabled={loadingMore}
                icon={loadingMore ? <Spinner size={17} /> : undefined}
              >
                {loadingMore ? 'Loading…' : 'Show more memories'}
              </Btn>
            </div>
          )}
        </>
      )}
    </section>
  );
}
