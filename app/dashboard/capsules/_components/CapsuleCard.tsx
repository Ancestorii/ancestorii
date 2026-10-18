'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { ArrowRight, Lock, LockOpen, Package } from 'lucide-react';
import { ContextMenuDots } from '@/components/ContextMenuDots';
import { safeToast as toast } from '@/lib/safeToast';
import { ui, btnClass, IconTile, toneByKey, toneFor } from '@/components/dashboard/ui/AppBits';
import s from './capsules.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// Dates on the card, the British way: "28 Mar 2026".
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

type Capsule = {
  id: string;
  title: string;
  description: string | null;
  unlock_date: string;
  is_locked: boolean;
  created_at: string;
  cover_image: string | null;
  // The signed link for the cover (cover_image is its path in storage).
  cover_url: string | null;
};

type Props = {
  capsule: Capsule;
  onEdit: () => void;
  onDelete: () => void;
};

export default function CapsuleCard({ capsule, onEdit, onDelete }: Props) {
    const [coverLoaded, setCoverLoaded] = useState(false);

  useEffect(() => {
    setCoverLoaded(false);
  }, [capsule.cover_url]);

  // 🔐 LOCK STATE (frontend auto-unlock logic)
  const now = Date.now();
  const unlockTime = new Date(capsule.unlock_date).getTime();

  const isStillLocked =
    capsule.is_locked && unlockTime > now;

  // ⏳ TIME REMAINING
const timeRemaining = useMemo(() => {
  if (!isStillLocked) return null;

  const nowDate = new Date();
  const unlockDate = new Date(capsule.unlock_date);

  const diffMs = unlockDate.getTime() - nowDate.getTime();
  if (diffMs <= 0) return 'Unlocking soon';

  const daysTotal = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let years =
    unlockDate.getFullYear() - nowDate.getFullYear();
  let months =
    unlockDate.getMonth() - nowDate.getMonth();
  let days =
    unlockDate.getDate() - nowDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(
      unlockDate.getFullYear(),
      unlockDate.getMonth(),
      0
    ).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  // 🔑 RULES
  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''}${
      months > 0 ? ` ${months} month${months > 1 ? 's' : ''}` : ''
    } remaining`;
  }

  if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''} remaining`;
  }

  return `${daysTotal} day${daysTotal > 1 ? 's' : ''} remaining`;
}, [isStillLocked, capsule.unlock_date]);

  // The state chip (display only): sealed until its date, sealed and its date has come
  // (ready to open), not sealed yet (its date is ahead and it is still being filled), or open
  // (unsealed with its date passed: unlock_due_capsules() unseals a sealed capsule on its
  // date, and a capsule never sealed is open too).
  const state: 'sealed' | 'ready' | 'opens' | 'opened' = capsule.is_locked
    ? isStillLocked
      ? 'sealed'
      : 'ready'
    : unlockTime > now
    ? 'opens'
    : 'opened';

  // A stable frame colour for this capsule.
  const frame = toneFor(capsule.id);

  return (
    <article className={s.card}>
      {/* Cover in a solid colour frame */}
      <div className={ui.frame} style={{ '--frame': frame.bg } as CSSProperties}>
        <div className={cx(ui.frameInner, s.cover)}>
          {capsule.cover_url ? (
            <Image
              src={capsule.cover_url}
              alt={capsule.title || 'Capsule cover'}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 400px"
              quality={90}
              className={cx(s.coverImg, coverLoaded ? 'opacity-100' : 'opacity-0')}
              onLoadingComplete={() => setCoverLoaded(true)}
            />
          ) : (
            <div className={s.noCover}>
              {/* The pink Capsules tile, as the other lists use their feature's colour */}
              <IconTile Icon={isStillLocked ? Lock : Package} tone={toneByKey('pink')} size="lg" />
              No cover image
            </div>
          )}

          {/* State */}
          {state === 'sealed' && (
            <span className={cx(s.state, s.stateInk)}>
              <Lock size={13} strokeWidth={2.6} aria-hidden="true" />
              <span>Sealed</span>
            </span>
          )}
          {state === 'opens' && (
            <span className={cx(s.state, s.stateDot)} style={{ '--dot': 'var(--c0)' } as CSSProperties}>
              <span>Not sealed yet</span>
            </span>
          )}
          {state === 'ready' && (
            <span className={cx(s.state, s.stateDot)} style={{ '--dot': 'var(--c3)' } as CSSProperties}>
              <span>Ready to open</span>
            </span>
          )}
          {state === 'opened' && (
            <span className={s.state}>
              <LockOpen size={13} strokeWidth={2.6} aria-hidden="true" />
              <span>Open</span>
            </span>
          )}
        </div>

        {/* Context menu */}
        <div className={s.menu}>
          <ContextMenuDots
            editLabel="Edit Capsule"
            onEdit={() => {
              if (isStillLocked) {
                toast.error('This capsule is locked.');
                return;
              }
              onEdit();
            }}
            onDelete={onDelete}
          />
        </div>
      </div>

      {/* Content */}
      <div className={s.body}>
        <h2 className={s.title}>{capsule.title}</h2>

        <p className={s.text}>
          {capsule.description || 'A sealed message for your future self'}
        </p>

        {/* Created / Locked info */}
        <div className={s.meta}>
          {!isStillLocked ? (
            <span className={cx(ui.chip, ui.chipSm)}>
              Created {formatDate(capsule.created_at)}
            </span>
          ) : (
            <span className={cx(ui.chip, ui.chipSm)}>
              Unlocks on {formatDate(capsule.unlock_date)}
            </span>
          )}
        </div>

        {isStillLocked && timeRemaining && <p className={s.remaining}>{timeRemaining}</p>}

        {/* CTA */}
        <div className={s.open}>
          {!isStillLocked ? (
            <Link
              href={`/dashboard/capsules/${capsule.id}`}
              aria-label={`View Capsule: ${capsule.title}`}
              className={btnClass({ variant: 'soft', block: true })}
            >
              View Capsule
              <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
            </Link>
          ) : (
            <div className={cx(btnClass({ variant: 'soft', block: true }), s.locked)}>
              <Lock size={17} strokeWidth={2.4} aria-hidden="true" />
              Capsule Locked
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
