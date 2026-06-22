'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { StoryComment } from '@/lib/stories/types';
import VoiceNotePlayer from '@/components/voice/VoiceNotePlayer';

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

  return (
    <div>
      <div className="group flex items-start gap-3.5">
        {/* Avatar */}
        <div
          className="h-[36px] w-[36px] flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden mt-1"
          style={{ border: '1.5px solid #DCC7A4', backgroundColor: '#EDE8DC' }}
        >
          {authorAvatarUrl ? (
            <Image src={authorAvatarUrl} alt={authorName} width={36} height={36} className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] font-bold text-[#A9782F]">{initials}</span>
          )}
        </div>

        {/* Bubble */}
        <div className="flex-1 min-w-0">
          <div className="bg-[#F7F2EA] rounded-[12px] rounded-tl-[2px] px-4 py-3.5 transition-colors duration-150 group-hover:bg-[#F2EBDF]">
            <div className="flex items-center justify-between">
              <div>
               <span className="text-[13px] lg:text-[15px] font-semibold text-[#1A1612]">{authorName}</span>
                <span className="ml-2 text-[11px] lg:text-[12px] text-[#9B8E7D]">{dateLabel}</span>
                {authorTitle && <p className="text-[12px] lg:text-[13px] italic text-[#A9782F] mt-0.5">{authorTitle}</p>}
              </div>
              {isOwn && onDelete && (
                <div>
                  {confirmDelete ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => { onDelete(); setConfirmDelete(false); }} className="text-[11px] font-semibold text-[#DC2626] hover:text-[#B91C1C] transition">Delete</button>
                      <button onClick={() => setConfirmDelete(false)} className="text-[11px] font-medium text-[#9B8E7D] hover:text-[#6F6255] transition">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(true)} className="text-[11px] font-medium text-[#9B8E7D] opacity-0 group-hover:opacity-100 hover:text-[#DC2626] transition">Delete</button>
                  )}
                </div>
              )}
            </div>
           {voiceNoteUrl ? (
              <div className="mt-2"><VoiceNotePlayer src={voiceNoteUrl} compact showDownload={false} /></div>
            ) : (
              <p className="mt-1 text-[14px] lg:text-[15px] leading-[1.75] text-[#2E2820]">{content}</p>
            )}
          </div>

          {isTopLevel && onReply && (
            <button onClick={onReply} className="mt-1.5 ml-4 text-[11px] font-medium text-[#9B8E7D] hover:text-[#A9782F] transition">
              Reply
            </button>
          )}
        </div>
      </div>

      {/* Replies */}
      {replies && replies.length > 0 && (
        <div className="ml-[50px] mt-2 space-y-2">
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
    <div className="group flex items-start gap-3">
      <div
        className="h-[26px] w-[26px] flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden mt-1"
        style={{ border: '1.5px solid #DCC7A4', backgroundColor: '#EDE8DC' }}
      >
        {reply.author_avatar_url ? (
          <Image src={reply.author_avatar_url} alt={reply.author_name} width={26} height={26} className="h-full w-full object-cover" />
        ) : (
          <span className="text-[8px] font-bold text-[#A9782F]">{initials}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-[#F7F2EA]/60 rounded-[10px] rounded-tl-[2px] px-3.5 py-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[12px] font-semibold text-[#1A1612]">{reply.author_name}</span>
              <span className="ml-2 text-[10px] text-[#9B8E7D]">{dateLabel}</span>
              {reply.author_title && <p className="text-[11px] italic text-[#A9782F] mt-0.5">{reply.author_title}</p>}
            </div>
            {isOwn && (
              <div>
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => { onDelete(); setConfirmDelete(false); }} className="text-[10px] font-semibold text-[#DC2626] hover:text-[#B91C1C] transition">Delete</button>
                    <button onClick={() => setConfirmDelete(false)} className="text-[10px] font-medium text-[#9B8E7D] hover:text-[#6F6255] transition">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(true)} className="text-[10px] font-medium text-[#9B8E7D] opacity-0 group-hover:opacity-100 hover:text-[#DC2626] transition">Delete</button>
                )}
              </div>
            )}
          </div>
          {reply.voice_note_path ? (
            <div className="mt-1.5"><VoiceNotePlayer src={reply.voice_note_path} compact showDownload={false} /></div>
          ) : (
            <p className="mt-0.5 text-[13px] leading-[1.7] text-[#2E2820]">{reply.content}</p>
          )}
        </div>
      </div>
    </div>
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