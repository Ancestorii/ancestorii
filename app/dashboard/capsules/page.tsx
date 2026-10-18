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
  cover_image: string | null;
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

// 🔓 Capsule unlock animation
const [unlockOpen, setUnlockOpen] = useState(false);
const [unlockNotificationId, setUnlockNotificationId] = useState<string | null>(null);

  // signed url helper (tries 'capsule-media', falls back gracefully)
  const getSignedCoverUrl = async (url: string | null): Promise<string | null> => {
    if (!url) return null;
    try {
      // If the stored value looks like 'capsule-media/xyz.jpg', extract the path.
      const match = url.match(/capsule-media\/(.+)$/);
      const path = match ? match[1] : url;
      const { data: signed, error: signErr } = await supabase.storage
        .from('capsule-media')
        .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days
      if (signErr) return url;
      return signed?.signedUrl ? `${signed.signedUrl}&cb=${Date.now()}` : url;
    } catch {
      return url;
    }
  };


  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    (async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        if (!sess?.session?.user) {
          setError('You need to sign in to view your capsules.');
          setLoading(false);
          return;
        }

        const { data, error: qErr } = await supabase
          .from('memory_capsules')
          .select('id, title, description, unlock_date, is_locked, created_at, cover_image')
          .order('created_at', { ascending: false });

        if (qErr) throw qErr;

        const signed = await Promise.all(
          (data as Capsule[]).map(async (c) => ({
            ...c,
            cover_image: await getSignedCoverUrl(c.cover_image),
          }))
        );

        setCapsules(signed ?? []);
      } catch (e: any) {
        setError(e?.message || String(e));
        toast.error('Failed to load capsules.');
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

// The "Capsule unlocked" celebration (CapsuleUnlock below) is switched off for now. It looked
// for an unread notification with seen = false and a "Capsule Unlocked" title, but the
// notifications table has neither column (it uses is_read and has no title), so the lookup
// failed with a 400 on every visit; and unlock_due_capsules() no longer creates a notification
// when a capsule unlocks, so there was nothing to find. Bring it back by having the unlock
// create a notification again and looking for that here.



  const handleDeleteCapsule = async (id: string) => {
    try {
      const deleted = await deleteWithOwnerCheck(supabase, 'memory_capsules', id, 'capsule');
      if (!deleted) return;
      setCapsules((prev) => (prev ? prev.filter((t) => t.id !== id) : prev));
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
          lead={
            <>
              <span className="font-bold">{line1}</span> {line2}
            </>
          }
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
        onClose={() => {
          setDrawerOpen(false);
          setSelectedCapsule(null);
          setDrawerMode('create');
        }}
        onCreated={async (cap) => {
          const signed = await getSignedCoverUrl(cap.cover_image);

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
              cover_image: signed,
            };
            return [newItem, ...safe];
          });

          // ✅ capsule created animation
          setCreatedOpen(true);
        }}
        onUpdated={async (cap) => {
          const signed = await getSignedCoverUrl(cap.cover_image);
          setCapsules((prev) =>
            prev
              ? prev.map((c) =>
                  c.id === cap.id ? { ...c, ...cap, cover_image: signed } : c
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
              if (unlockNotificationId) {
                await supabase
                  .from('notifications')
                  .update({ seen: true })
                  .eq('id', unlockNotificationId);
              }

              // 🔓 Update UI immediately (no refresh)
              setCapsules((prev) =>
                prev.map((c) =>
                  c.is_locked && new Date(c.unlock_date) <= new Date()
                    ? { ...c, is_locked: false }
                    : c
                )
              );

              setUnlockOpen(false);
              setUnlockNotificationId(null);
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
