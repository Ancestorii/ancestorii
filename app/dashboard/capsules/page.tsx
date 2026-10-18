'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Package, Plus } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import CreateCapsuleDrawer from './_components/CreateCapsuleDrawer';
import CapsuleCreatedOverlay from '@/components/CapsuleCreatedOverlay';
import CapsuleCard from './_components/CapsuleCard';
import CapsuleUnlock from '@/components/CapsuleUnlock';
import { usePlanLimits } from '@/lib/usePlanLimits';
import { deleteWithOwnerCheck } from '@/lib/deleteWithOwnerCheck';
import {
  ui,
  Accent,
  AppLoader,
  Btn,
  EmptyState,
  PageHeader,
  toneByKey,
  useDialog,
} from '@/components/dashboard/ui/AppBits';
import s from './_components/capsules.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

type Capsule = {
  id: string;
  title: string;
  description: string | null;
  unlock_date: string;
  is_locked: boolean;
  created_at: string;
  // The cover's path inside the capsule-media bucket (what the database holds), and the
  // signed link made from it for display. Only the path is ever handed back to the drawer or
  // written to the database: a signed link can't be signed again.
  cover_image: string | null;
  cover_url: string | null;
};

// The stored cover is a path inside the capsule-media bucket (older rows carried the
// bucket's name in front of it). A full link is not a path and is left out.
const coverPath = (value: string | null): string | null => {
  if (!value || /^https?:\/\//.test(value)) return null;
  const match = value.match(/capsule-media\/(.+)$/);
  return match ? match[1] : value;
};

export default function CapsulesPage() {
  const supabase = getBrowserClient();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoaded = useRef(false);

  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);

  const { loading: limitsLoading, canCreate, limits, counts } = usePlanLimits();

  // Escape cancels the delete question, Tab stays inside it.
  const confirmRef = useDialog<HTMLDivElement>(!!confirmDelete, () => setConfirmDelete(null));
  const confirmTitleId = useId();
  const confirmTextId = useId();

  // The header's lead
  const line1 = '“Write something today that someone will read years from now.”';
  const line2 = 'Create capsules to store words and memories for the future.';

  // The plan-limit message (the create button also shows it as a toast).
  const limitMessage = `You’ve reached your current plan limit for capsules (${counts?.capsules} / ${limits?.max_capsules}). Upgrade your plan to create more.`;

  // 🔵 Capsule CREATED overlay
const [createdOpen, setCreatedOpen] = useState(false);

// 🔓 Capsule unlock animation: shown once when the unlock job has left an unread
// "capsule_unlocked" notification for this person (notifications has is_read, no seen).
const [unlockOpen, setUnlockOpen] = useState(false);
const [unlockNotificationIds, setUnlockNotificationIds] = useState<string[]>([]);

  // Signs every cover in one request. No cache buster: a file at a path never changes (a new
  // cover is uploaded under a new name), so the browser may keep it between visits.
  const signCovers = async (paths: (string | null)[]): Promise<(string | null)[]> => {
    const wanted = paths.filter((p): p is string => !!p);
    if (!wanted.length) return paths.map(() => null);
    try {
      const { data } = await supabase.storage
        .from('capsule-media')
        .createSignedUrls(wanted, 60 * 60 * 24 * 7); // 7 days
      const byPath = new Map<string, string>();
      (data ?? []).forEach((row, i) => {
        if (row.signedUrl) byPath.set(wanted[i], row.signedUrl);
      });
      return paths.map((p) => (p ? byPath.get(p) ?? null : null));
    } catch {
      return paths.map(() => null);
    }
  };


  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    (async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        const uid = sess?.session?.user?.id;
        if (!uid) {
          setError('You need to sign in to view your capsules.');
          setLoading(false);
          return;
        }

        // The capsules and any unlock waiting to be celebrated, in one round.
        const [{ data, error: qErr }, { data: unlocks }] = await Promise.all([
          supabase
            .from('memory_capsules')
            .select('id, title, description, unlock_date, is_locked, created_at, cover_image')
            .order('created_at', { ascending: false }),
          supabase
            .from('notifications')
            .select('id')
            .eq('user_id', uid)
            .eq('type', 'capsule_unlocked')
            .eq('is_read', false),
        ]);

        if (qErr) throw qErr;

        const rows = (data ?? []) as Omit<Capsule, 'cover_url'>[];
        const urls = await signCovers(rows.map((c) => coverPath(c.cover_image)));

        setCapsules(rows.map((c, i) => ({ ...c, cover_url: urls[i] })));

        if (unlocks?.length) {
          setUnlockNotificationIds(unlocks.map((n) => n.id));
          setUnlockOpen(true);
        }
      } catch (e: any) {
        setError(e?.message || String(e));
        toast.error('Failed to load capsules.');
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  const handleDeleteCapsule = async (id: string) => {
    try {
      const deleted = await deleteWithOwnerCheck(supabase, 'memory_capsules', id, 'capsule');
      if (!deleted) return;
      setCapsules((prev) => (prev ? prev.filter((t) => t.id !== id) : prev));
      // The sidebar's count
      window.dispatchEvent(new Event('dashboard-data-changed'));
      toast.success('Capsule deleted.');
    } catch {
      toast.error('Failed to delete capsule.');
    }
  };

  // The create button (in the header and in the empty state).
  const openCreate = () => {
    if (limitsLoading) return;
    if (!canCreate.capsule) {
      toast.error(limitMessage);
      return;
    }
    setDrawerMode('create');
    setSelectedCapsule(null);
    setDrawerOpen(true);
  };

  const createButton = (
    <Btn onClick={openCreate} aria-haspopup="dialog" tile={<Plus size={18} strokeWidth={2.6} />}>
      Create New Capsule
    </Btn>
  );

  const list = capsules ?? [];

  return (
    <div className={ui.page}>
      <div className={ui.wrap}>
        <PageHeader
          eyebrow="Capsules"
          eyebrowDot="var(--c0)"
          title={
            <>
              My <Accent>Capsules</Accent>
            </>
          }
          lead={`${line1} ${line2}`}
          actions={createButton}
        />

        {!limitsLoading && !canCreate.capsule && (
          <p className={cx(ui.noticeWarn, 'mt-8')} role="status">
            {limitMessage}
          </p>
        )}

        <section className={ui.section} aria-label="Your capsules">
          {/* states */}
          {loading && <AppLoader label="Loading your capsules" />}

          {!loading && error && (
            <p className={ui.noticeError} role="alert">
              {error}
            </p>
          )}

          {!loading && !error && list.length === 0 && (
            <EmptyState
              Icon={Package}
              tone={toneByKey('pink')}
              title="Nothing sealed for the future yet"
              text="Create your first capsule."
            >
              {createButton}
            </EmptyState>
          )}

          {/* cards: columns follow the space beside the sidebar, 1 on phones, 2 on tablets, 3 on desktops */}
          {!loading && !error && list.length > 0 && (
            <div className="@container">
              <ul role="list" className="grid grid-cols-1 gap-5 @xl:grid-cols-2 @4xl:grid-cols-3">
                {list.map((c) => (
                  <li key={c.id} className="min-w-0">
                    <CapsuleCard
                      capsule={c}
                      onEdit={() => {
                        if (c.is_locked) {
                          toast.error('This capsule is locked.');
                          return;
                        }
                        setDrawerMode('edit');
                        setSelectedCapsule(c);
                        setDrawerOpen(true);
                      }}
                      onDelete={() =>
                        setConfirmDelete({
                          id: c.id,
                          title: c.title || 'Untitled Capsule',
                        })
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      {/* Drawer */}
      <CreateCapsuleDrawer
        open={drawerOpen}
        mode={drawerMode}
        capsule={selectedCapsule}
        limitsLoading={limitsLoading}
        canCreateCapsule={canCreate.capsule}
        limitMessage={limitMessage}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedCapsule(null);
          setDrawerMode('create');
        }}
        onCreated={async (cap) => {
          const [signed] = await signCovers([coverPath(cap.cover_image)]);

          // 🔑 Tell dashboard layout a story now exists
          window.dispatchEvent(new Event('dashboard-data-changed'));

          setCapsules((prev) => {
            const safe = prev ?? [];
            const newItem: Capsule = {
              id: cap.id,
              title: cap.title,
              description: cap.description ?? null,
              unlock_date: cap.unlock_date,
              is_locked: cap.is_locked,
              created_at: cap.created_at,
              cover_image: cap.cover_image,
              cover_url: signed,
            };
            return [newItem, ...safe];
          });

          // ✅ capsule created animation
          setCreatedOpen(true);
        }}
        onUpdated={async (cap) => {
          const [signed] = await signCovers([coverPath(cap.cover_image)]);
          setCapsules((prev) =>
            prev
              ? prev.map((c) =>
                  c.id === cap.id ? { ...c, ...cap, cover_url: signed } : c
                )
              : prev
          );
          toast.success('Capsule updated!');
        }}
      />

      <CapsuleCreatedOverlay
        open={createdOpen}
        onClose={() => setCreatedOpen(false)}
      />

      {/* The unlock card fades out when it's done (it unmounts on onComplete) */}
      <AnimatePresence>
        {unlockOpen && (
          <CapsuleUnlock
            key="capsule-unlock"
            onComplete={async () => {
              setUnlockOpen(false);

              // 🔓 Update UI immediately (no refresh)
              setCapsules((prev) =>
                prev.map((c) =>
                  c.is_locked && new Date(c.unlock_date).getTime() <= Date.now()
                    ? { ...c, is_locked: false }
                    : c
                )
              );

              // Seen: it plays once.
              if (unlockNotificationIds.length) {
                setUnlockNotificationIds([]);
                await supabase
                  .from('notifications')
                  .update({ is_read: true })
                  .in('id', unlockNotificationIds);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* delete confirmation */}
      {confirmDelete && (
        <div className={cx(ui.scrim, s.fadeIn, 'scrim-blur z-[9999] flex items-center justify-center p-4')}>
          <div
            ref={confirmRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={confirmTitleId}
            aria-describedby={confirmTextId}
            className={cx(ui.sheet, s.confirm, s.popIn)}
          >
            <h2 id={confirmTitleId} className={s.confirmTitle}>
              Delete “{confirmDelete.title}”?
            </h2>
            <p id={confirmTextId} className={s.confirmText}>
              This action cannot be undone. All media, voice notes, and messages inside this capsule will be lost.
            </p>
            <div className={s.confirmActions}>
              <Btn variant="soft" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Btn>
              <Btn
                variant="danger"
                onClick={() => {
                  handleDeleteCapsule(confirmDelete.id);
                  setConfirmDelete(null);
                }}
              >
                Delete
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
