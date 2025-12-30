'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import VoiceNoteDrawer from '../../_components/VoiceNoteDrawer';
import { Trash2 } from 'lucide-react';

type ProfileShape = { full_name: string | null } | { full_name: string | null }[];

type Comment = {
  id: string;
  media_id: string;
  user_id: string;
  text: string;
  created_at: string;
  Profiles?: ProfileShape;
};

type VoiceNote = {
  id: string;
  media_id: string;
  user_id: string;
  file_path: string;
  created_at: string;
  Profiles?: ProfileShape;
};

type Media = {
  id: string;
  album_id: string;
  user_id?: string | null;
  file_path: string;
  file_type: string;
  created_at: string;
};

export default function MediaInteractionsPanel({
  selectedMedia,
  albumId,
  user,
 onDelete,
}: {
  selectedMedia: Media | null;
  albumId: string;
  user: { id: string } | null;
 onDelete: (media: Media) => void;
}) {
  const supabase = getBrowserClient();

  const [comments, setComments] = useState<Comment[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [newComment, setNewComment] = useState('');

  // ✅ Fetch comments + voice notes for selected media
  useEffect(() => {
    if (!selectedMedia) {
      setComments([]);
      setVoiceNotes([]);
      return;
    }

    (async () => {
      try {
        const [commentRes, voiceRes] = await Promise.all([
          supabase
            .from('album_media_comments')
            .select('id,media_id,user_id,text,created_at,Profiles(full_name)')
            .eq('media_id', selectedMedia.id)
            .order('created_at', { ascending: false }),

          supabase
            .from('album_media_voice_notes')
            .select('id,media_id,user_id,file_path,created_at,Profiles(full_name)')
            .eq('media_id', selectedMedia.id)
            .order('created_at', { ascending: false }),
        ]);

        if (commentRes.error) throw commentRes.error;
        if (voiceRes.error) throw voiceRes.error;

        setComments(commentRes.data ?? []);
        const signedVoices = await Promise.all(
  (voiceRes.data ?? []).map(async (v) => {
    const { data } = await supabase.storage
      .from('album-media')
      .createSignedUrl(v.file_path, 3600);

    return {
      ...v,
      file_path: data?.signedUrl ?? '',
    };
  })
);

setVoiceNotes(signedVoices);

      } catch (e) {
        console.error(e);
        toast.error('Failed to load comments/voice notes.');
      }
    })();
  }, [selectedMedia, supabase]);

  // ✅ Add comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedMedia) return;

    try {
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess?.session?.user?.id;
      if (!userId) throw new Error('Not signed in');

      const { data, error } = await supabase
        .from('album_media_comments')
        .insert({
          media_id: selectedMedia.id,
          user_id: userId,
          text: newComment.trim(),
        })
        .select('id,media_id,user_id,text,created_at,Profiles(full_name)')
        .single();

      if (error) throw error;

      setComments((prev) => [data as Comment, ...prev]);
      setNewComment('');
      toast.success('Comment added.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to add comment.');
    }
  };

  // ✅ Delete comment
  const handleDeleteComment = async (id: string) => {
    try {
      await supabase.from('album_media_comments').delete().eq('id', id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      toast.success('Comment deleted.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete comment.');
    }
  };

  // ✅ Delete voice note
  const handleDeleteVoiceNote = async (id: string) => {
    try {
      await supabase.from('album_media_voice_notes').delete().eq('id', id);
      setVoiceNotes((prev) => prev.filter((v) => v.id !== id));
      toast.success('Voice note deleted.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete voice note.');
    }
  };

  return (
    <div className="w-full lg:w-[420px] border-t lg:border-t-0 lg:border-l border-[#E6C26E]/55 px-10 py-12 overflow-y-auto">

      {!selectedMedia ? (
        <div className="text-center text-gray-500 mt-40 italic">
          Select a photo or video to view details.
        </div>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-[#0f2040] mb-2">
            Comments for selected media
          </h3>

          {/* Add comment */}
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            className="w-full border rounded-lg p-2 text-sm mb-2 focus:ring-2 focus:ring-[#E6C26E] outline-none"
          />

          <button
            onClick={handleAddComment}
            className="px-6 py-3 bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837] rounded-full text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition"
          >
            Post Comment
          </button>

          {/* Comments */}
          <div className="mt-8 space-y-6">
            {comments.length > 0 ? (
              comments.map((c) => {
                const name = Array.isArray(c.Profiles)
                  ? c.Profiles[0]?.full_name
                  : c.Profiles?.full_name;

                return (
                  <div
                    key={c.id}
                    className="comment-card border border-gray-100 rounded-xl p-4 shadow-sm flex justify-between items-start gap-4 fade-in-soft"
                  >
                    <div>
                      <p className="text-base text-[#1F2837] leading-relaxed">
                        {c.text}
                        </p>

                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                         <span className="font-semibold text-[#1F2837]">
                            {name || 'Anonymous'}
                         </span>

                         •

                          <span>
                             {new Date(c.created_at).toLocaleDateString()} at{" "}
                             {new Date(c.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                 })}
                          </span>
                         </div> 
                        </div> 

                    {c.user_id === user?.id && (
                      <button
                      onClick={(e) => {
                        const card = (e.currentTarget as HTMLElement).closest(".comment-card");
                         if (card) {
                            card.classList.add("fade-out-soft");
                            setTimeout(() => {
                                handleDeleteComment(c.id);
                                }, 250);
                                } else {
                                    handleDeleteComment(c.id);
                                     }
                                      }}
                        className="text-red-500 hover:text-red-700 transition confirm-shake-hover"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 italic">No comments yet.</p>
            )}
          </div>

          {/* Voice notes */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-[#0f2040] mt-24 mb-4">
              Voice Notes for selected media
            </h3>

            <button
              onClick={() => setVoiceOpen(true)}
              className="px-6 py-3 mb-8 bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837] rounded-full text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition"
            >
              + Add Voice Note
            </button>

            {voiceNotes.length > 0 ? (
              voiceNotes.map((v) => {
                const name = Array.isArray(v.Profiles)
                  ? v.Profiles[0]?.full_name
                  : v.Profiles?.full_name;

                return (
                  <div
                    key={v.id}
                    className="border border-gray-100 rounded-lg p-3 shadow-sm relative"
                  >
                    <p className="text-sm font-semibold text-[#1F2837] mb-2">
                      {name || 'Anonymous'}
                    </p>

                    <audio controls src={v.file_path} className="w-full" />

                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(v.created_at).toLocaleString()}
                    </p>

                    {v.user_id === user?.id && (
                      <button
                        onClick={() => handleDeleteVoiceNote(v.id)}
                        className="absolute top-2 right-2 bg-white/85 text-red-600 text-xs font-semibold px-2 py-1 rounded-full hover:bg-red-50"
                        title="Delete"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 italic">
                No voice notes yet.
              </p>
            )}
          </div>

          {/* Voice Note Drawer */}
          {selectedMedia && (
            <VoiceNoteDrawer
              albumId={albumId}
              mediaId={selectedMedia.id}
              open={voiceOpen}
              onClose={() => setVoiceOpen(false)}
              onUploaded={(note: VoiceNote) => {
                setVoiceNotes((prev) => [note, ...prev]);
                toast.success('Voice note added!');
              }}
            />
          )}
         
         {/* ✅ DELETE MEMORY (ONLY HERE) */}
            {selectedMedia && (
             <div className="mt-16 pt-10 border-t border-[#E6C26E]/55">
            <button
             onClick={() => onDelete(selectedMedia)}
             className="w-full flex items-center justify-center gap-2 px-6 py-3
                 rounded-full bg-red-50 border border-red-200
                 text-red-600 font-semibold text-sm
                 hover:bg-red-100 transition"
                >
                Delete This Memory
          </button>
          </div>
           )}
        </>
      )}
    </div>
  );
}
