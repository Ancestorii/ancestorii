'use client';

import type { CSSProperties } from 'react';
import { Mail } from 'lucide-react';
import { ui, Btn } from '@/components/dashboard/ui/AppBits';
import s from './family.module.css';

type PendingInvite = {
  id: string;
  email: string;
  role: string;
  invited_by: string;
  expires_at: string;
  created_at: string;
  inviter_name?: string | null;
};

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export default function PendingInviteCard({
  invite,
  onCancel,
}: {
  invite: PendingInvite;
  onCancel: () => void;
}) {
  const sentDate = new Date(invite.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });

  const expiresDate = new Date(invite.expires_at);
  const now = new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  const isExpired = daysLeft === 0;

  return (
    <div className={cx(ui.card, 'h-full')}>
      <div className="flex items-start justify-between gap-3">
        {/* An empty seat, waiting for them */}
        <span className={cx(s.seat, isExpired && s.seatExpired)} aria-hidden="true">
          <Mail size={22} strokeWidth={2.2} />
        </span>

        {/* Cancel button */}
        <Btn
          variant="dangerSoft"
          size="sm"
          onClick={onCancel}
          aria-label={`Cancel invite to ${invite.email}`}
          className={s.tapSafe}
        >
          Cancel
        </Btn>
      </div>

      {/* Info */}
      <p className="mt-4 truncate text-[17px] font-extrabold leading-[1.25] tracking-[-0.03em]">
        {invite.email}
      </p>

      <p className="mt-1 text-[14px] font-medium leading-snug">
        Invited as{' '}
        <span className="font-extrabold capitalize">{invite.role}</span>
        {invite.inviter_name && (
          <span>
            {' '}
            by {invite.inviter_name}
          </span>
        )}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={cx(ui.chip, ui.chipSm)}>Sent {sentDate}</span>
        <span
          className={cx(ui.chip, ui.chipSm, ui.chipDot)}
          style={{ '--dot': isExpired ? 'var(--danger)' : 'var(--c2)' } as CSSProperties}
        >
          {isExpired ? 'Expired' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
        </span>
      </div>
    </div>
  );
}
