'use client';

import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { Users, UserPlus, Pencil } from 'lucide-react';
import { FamilyVerifiedBadge } from '@/components/ui/FamilyVerifiedBadge';
import { ui, Btn, Eyebrow, IconBtn } from '@/components/dashboard/ui/AppBits';
import s from './family.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// The dot on the role chip: the same colour for a role here and on the member cards.
const ROLE_DOT: Record<string, string> = {
  owner: 'var(--c2)',
  admin: 'var(--c1)',
  member: 'var(--c3)',
};

export default function OurFamilyHeader({
  familyName,
  isVerified = false,
  memberCount,
  myRole,
  canInvite,
  onInvite,
  onRename,
}: {
  familyName: string;
  isVerified?: boolean;
  memberCount: number;
  myRole: string;
  canInvite: boolean;
  onInvite: () => void;
  onRename?: (newName: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(familyName);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(familyName); }, [familyName]);
  useEffect(() => {
    if (editing) { inputRef.current?.focus(); inputRef.current?.select(); }
  }, [editing]);

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === familyName) {
      setDraft(familyName);
      setEditing(false);
      return;
    }
    setSaving(true);
    try { await onRename?.(trimmed); } finally { setSaving(false); setEditing(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') { setDraft(familyName); setEditing(false); }
  };

  const isOwner = myRole === 'owner';
  const roleLabel =
    myRole === 'owner' ? 'Owner' : myRole === 'admin' ? 'Admin' : 'Member';

  return (
    <header className={ui.header}>
      <div className={ui.headerGlow} aria-hidden="true" />

      <div className={ui.headerTop}>
        <Eyebrow>My Family</Eyebrow>
      </div>

      <div className={ui.headerRow}>
        {/* Left: family name + meta */}
        <div className={ui.headerText}>
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              disabled={saving}
              maxLength={60}
              aria-label="Family name"
              className={s.titleInput}
            />
          ) : (
            <div className={s.titleLine}>
              <h1 className={cx(ui.title, s.titleText)}>
                {familyName}
                {isVerified && <FamilyVerifiedBadge className={s.seal} />}
              </h1>
              {isOwner && (
                <IconBtn
                  label="Rename family"
                  ghost
                  size="sm"
                  onClick={() => setEditing(true)}
                  className={cx(s.pencil, s.tapSafe)}
                >
                  <Pencil size={18} strokeWidth={2.2} aria-hidden="true" />
                </IconBtn>
              )}
            </div>
          )}

          <div className={ui.meta}>
            <span
              className={cx(ui.chip, ui.chipInk, ui.chipDot)}
              style={{ '--dot': ROLE_DOT[myRole] ?? ROLE_DOT.member } as CSSProperties}
            >
              {roleLabel}
            </span>
            <span className={ui.chip}>
              <Users size={15} strokeWidth={2.4} aria-hidden="true" />
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </span>
          </div>

          <p className={ui.lead}>
            Everyone here shares your family library: the photos, timelines,
            albums, and stories you&apos;re preserving together.
          </p>
        </div>

        {/* Right: invite button */}
        {canInvite && (
          <div className={ui.headerActions}>
            <Btn onClick={onInvite} aria-haspopup="dialog" tile={<UserPlus size={18} strokeWidth={2.4} />}>
              Invite Member
            </Btn>
          </div>
        )}
      </div>
    </header>
  );
}
