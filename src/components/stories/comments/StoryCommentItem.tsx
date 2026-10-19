'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { StoryComment } from '@/lib/stories/types';
import StoryVoicePlayer from '@/components/stories/detail/StoryVoicePlayer';
import { useTimeLabel } from './timeLabel';
import styles from './storyComments.module.css';

// The public story page's copy of CommentItem (the dashboard keeps using CommentItem):
// the same props and behaviour, in the landing's look.

const TONES = [styles.tone0, styles.tone1, styles.tone2, styles.tone3];

// Initials avatars take one of the four colours, chosen from the author's name.
function toneFor(name: string) {
  let n = 0;
  for (let i = 0; i < name.length; i++) n += name.charCodeAt(i);
  return TONES[n % TONES.length];
}

export default function StoryCommentItem({
  authorName,
  authorAvatarUrl,
  authorTitle,
  content,
  voiceNoteUrl,
  createdAt,
  now,
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
  /** When the page was rendered on the server; "3h ago" is counted from it on both sides. */
  now?: number;
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
  // Counted from the server's clock (timeLabel.ts), so the HTML and the first client render
  // agree and hydration never redraws the list.
  const dateLabel = useTimeLabel(createdAt, now);

  return (
    <div>
      <div className={styles.row}>
        {/* Avatar */}
        <div className={`${styles.avatar} ${toneFor(authorName)} ${authorAvatarUrl ? styles.avatarPhoto : ''}`}>
          {authorAvatarUrl ? (
            <Image src={authorAvatarUrl} alt={authorName} width={44} height={44} className={styles.avatarImg} />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div className={styles.main}>
          <div className={styles.head}>
            <div className={styles.who}>
              <span className={styles.name}>{authorName}</span>
              <span className={styles.date}>{dateLabel}</span>
              {authorTitle && <p className={styles.role}>{authorTitle}</p>}
            </div>
            {isOwn && onDelete && (
              <div className={styles.controls}>
                {confirmDelete ? (
                  <div className={styles.confirm}>
                    <button onClick={() => { onDelete(); setConfirmDelete(false); }} className={styles.confirmDelete}>Delete</button>
                    <button onClick={() => setConfirmDelete(false)} className={styles.textBtn}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(true)} className={`${styles.textBtn} ${styles.reveal}`}>Delete</button>
                )}
              </div>
            )}
          </div>
          {voiceNoteUrl ? (
            <div className={styles.voice}><StoryVoicePlayer src={voiceNoteUrl} compact showDownload={false} /></div>
          ) : (
            <p className={styles.text}>{content}</p>
          )}

          {isTopLevel && onReply && (
            <button onClick={onReply} className={`${styles.textBtn} ${styles.replyBtn}`}>
              Reply
            </button>
          )}
        </div>
      </div>

      {/* Replies */}
      {replies && replies.length > 0 && (
        <div className={styles.replies}>
          {replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              now={now}
              isOwn={currentUserId === reply.user_id}
              onDelete={() => onDeleteReply?.(reply.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReplyItem({
  reply,
  now,
  isOwn,
  onDelete,
}: {
  reply: StoryComment;
  now?: number;
  isOwn: boolean;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const initials = reply.author_name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const dateLabel = useTimeLabel(reply.created_at, now);

  return (
    <div className={styles.row}>
      <div className={`${styles.avatar} ${styles.avatarSm} ${toneFor(reply.author_name)} ${reply.author_avatar_url ? styles.avatarPhoto : ''}`}>
        {reply.author_avatar_url ? (
          <Image src={reply.author_avatar_url} alt={reply.author_name} width={32} height={32} className={styles.avatarImg} />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <div className={styles.main}>
        <div className={styles.head}>
          <div className={styles.who}>
            <span className={styles.name}>{reply.author_name}</span>
            <span className={styles.date}>{dateLabel}</span>
            {reply.author_title && <p className={styles.role}>{reply.author_title}</p>}
          </div>
          {isOwn && (
            <div className={styles.controls}>
              {confirmDelete ? (
                <div className={styles.confirm}>
                  <button onClick={() => { onDelete(); setConfirmDelete(false); }} className={styles.confirmDelete}>Delete</button>
                  <button onClick={() => setConfirmDelete(false)} className={styles.textBtn}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className={`${styles.textBtn} ${styles.reveal}`}>Delete</button>
              )}
            </div>
          )}
        </div>
        {reply.voice_note_path ? (
          <div className={styles.voice}><StoryVoicePlayer src={reply.voice_note_path} compact showDownload={false} /></div>
        ) : (
          <p className={styles.text}>{reply.content}</p>
        )}
      </div>
    </div>
  );
}
