'use client';

import { Mail, Clock, X } from 'lucide-react';

type PendingInvite = {
  id: string;
  email: string;
  role: string;
  invited_by: string;
  expires_at: string;
  created_at: string;
  inviter_name?: string | null;
};

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
    <div
      className="rounded-[20px] border bg-[#FFFDF9] px-5 py-6 sm:px-6 sm:py-7 shadow-[0_14px_36px_rgba(44,36,27,0.05)] relative"
      style={{
        borderColor: isExpired ? '#E5D5D5' : '#EAD8B8',
        opacity: isExpired ? 0.6 : 1,
      }}
    >
      {/* Cancel button */}
      <button
        onClick={onCancel}
        className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F0E8] text-[#9B8E7D] transition hover:bg-[#EAD8B8] hover:text-[#6F6255]"
        title="Cancel invite"
      >
        <X size={14} strokeWidth={2} />
      </button>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="h-[56px] w-[56px] flex-shrink-0 overflow-hidden rounded-full flex items-center justify-center"
          style={{
            border: '2px dashed #DCC7A4',
            backgroundColor: '#FAF4EA',
          }}
        >
          <Mail size={20} className="text-[#C8A557]" strokeWidth={1.6} />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 pr-6">
          <p className="text-[15px] font-semibold text-[#17120E] truncate">
            {invite.email}
          </p>

          <p className="mt-1 text-[13px] text-[#9B8E7D]">
            Invited as{' '}
            <span className="font-semibold text-[#6F6255] capitalize">
              {invite.role}
            </span>
            {invite.inviter_name && (
              <span>
                {' '}
                by {invite.inviter_name}
              </span>
            )}
          </p>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-[12px] text-[#9B8E7D]">Sent {sentDate}</span>

            <span className="text-[#DCC7A4]">·</span>

            <span
              className={`inline-flex items-center gap-1 text-[12px] font-medium ${
                isExpired ? 'text-[#B35454]' : 'text-[#A9782F]'
              }`}
            >
              <Clock size={11} strokeWidth={2} />
              {isExpired ? 'Expired' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}