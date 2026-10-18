'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { StoryComment } from '@/lib/stories/types';
import VoiceNotePlayer from '@/components/voice/VoiceNotePlayer';
import { Avatar } from '@/components/dashboard/ui/AppBits';
import s from './memoryComments.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export default function CommentItem({
  authorName,
  authorAvatarUrl,
  authorTitle,
  content,
  voiceNoteUrl,
  createdAt,
  isOwn,
  onDelete,
  isTopLevel,
  onReply,
  replies,
  currentUserId,
  onDeleteReply,
}: {
  authorName: string;
  authorAvatarUrl: string | null;
  authorTitle?: string | null;
  content: string;
  voiceNoteUrl?: string | null;
  createdAt: string;
  isOwn?: boolean;
  onDelete?: () => void;
  isTopLevel?: boolean;
  onReply?: () => void;
  replies?: StoryComment[];
  currentUserId?: string | null;
  onDeleteReply?: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const initials = authorName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const dateLabel = formatRelative(createdAt);
  const canReply = !!(isTopLevel && onReply);
  const canDelete = !!(isOwn && onDelete);

  return (
    <div>
      <div className={s.row}>
        <CommentAvatar url={authorAvatarUrl} name={authorName} initials={initials} size={40} />

        <div className={s.main}>
          <p className={s.head}>
            <span className={s.name}>{authorName}</span>
            <span className={s.time}>{dateLabel}</span>
          </p>
          {authorTitle && <p className={s.role}>{authorTitle}</p>}

          {voiceNoteUrl ? (
            <div className={s.voice}><VoiceNotePlayer src={voiceNoteUrl} compact showDownload={false} /></div>
          ) : (
            <p className={s.text}>{content}</p>
          )}

          {(canReply || canDelete) && (
            <div className={s.actions}>
              {canReply && (
                <button type="button" onClick={onReply} className={s.act}>
                  Reply
                </button>
              )}
              {canDelete && (confirmDelete ? (
                <>
                  <button type="button" onClick={() => { onDelete?.(); setConfirmDelete(false); }} className={cx(s.act, s.actDanger)}>Delete</button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className={s.act}>Cancel</button>
                </>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} className={cx(s.act, s.reveal)}>Delete</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {replies && replies.length > 0 && (
        <div className={s.replies}>
          {replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              isOwn={currentUserId === reply.user_id}
              onDelete={() => onDeleteReply?.(reply.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReplyItem({ reply, isOwn, onDelete }: { reply: StoryComment; isOwn: boolean; onDelete: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const initials = reply.author_name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const dateLabel = formatRelative(reply.created_at);

  return (
    <div className={s.row}>
      <CommentAvatar url={reply.author_avatar_url} name={reply.author_name} initials={initials} size={30} />
      <div className={s.main}>
        <p className={s.head}>
          <span className={s.name}>{reply.author_name}</span>
          <span className={s.time}>{dateLabel}</span>
        </p>
        {reply.author_title && <p className={s.role}>{reply.author_title}</p>}

        {reply.voice_note_path ? (
          <div className={s.voice}><VoiceNotePlayer src={reply.voice_note_path} compact showDownload={false} /></div>
        ) : (
          <p className={s.text}>{reply.content}</p>
        )}

        {isOwn && (
          <div className={s.actions}>
            {confirmDelete ? (
              <>
                <button type="button" onClick={() => { onDelete(); setConfirmDelete(false); }} className={cx(s.act, s.actDanger)}>Delete</button>
                <button type="button" onClick={() => setConfirmDelete(false)} className={s.act}>Cancel</button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className={cx(s.act, s.reveal)}>Delete</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** The kit's round avatar with a ring in the person's colour: their photo, or their initials. */
function CommentAvatar({ url, name, initials, size }: { url: string | null; name: string; initials: string; size: number }) {
  return (
    <Avatar name={name} size={size} className={s.avatar}>
      {url ? (
        <Image src={url} alt="" fill sizes={`${size}px`} />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </Avatar>
  );
}

function formatRelative(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
