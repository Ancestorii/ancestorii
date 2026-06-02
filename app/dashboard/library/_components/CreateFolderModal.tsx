'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { X, Folder } from 'lucide-react';

export type LibraryFolderRow = {
  id: string;
  family_id: string | null;
  user_id: string;
  name: string;
  description: string | null;
  folder_date: string | null;
  created_at: string;
  updated_at: string;
};

type EditableFolder = {
  id: string;
  name: string;
  description: string | null;
  folder_date: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  folder?: EditableFolder | null;
  onCreated?: (folder: LibraryFolderRow) => void;
  onUpdated?: (folder: LibraryFolderRow) => void;
};

export default function CreateFolderModal({
  open,
  onClose,
  mode = 'create',
  folder = null,
  onCreated,
  onUpdated,
}: Props) {
  const supabase = getBrowserClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [folderDate, setFolderDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Pre-fill in edit mode whenever the modal opens or the folder changes
  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && folder) {
      setName(folder.name);
      setDescription(folder.description || '');
      setFolderDate(folder.folder_date || '');
    }
  }, [open, mode, folder]);

  // Reset on close
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setName('');
      setDescription('');
      setFolderDate('');
      setSubmitting(false);
    }, 200);
    return () => clearTimeout(t);
  }, [open]);

  const handleSubmit = async () => {
    if (submitting) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Folder name is required.');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'edit' && folder) {
        const { data, error } = await supabase
          .from('library_folders')
          .update({
            name: trimmedName,
            description: description.trim() || null,
            folder_date: folderDate || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', folder.id)
          .select('*')
          .single();

        if (error) throw error;
        toast.success('Folder updated.');
        onUpdated?.(data as LibraryFolderRow);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('Not authenticated.');
          setSubmitting(false);
          return;
        }

        const { data, error } = await supabase
          .from('library_folders')
          .insert({
            user_id: user.id,
            name: trimmedName,
            description: description.trim() || null,
            folder_date: folderDate || null,
          })
          .select('*')
          .single();

        if (error) throw error;
        toast.success('Folder created.');
        onCreated?.(data as LibraryFolderRow);
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.message ||
          (mode === 'edit' ? 'Failed to update folder.' : 'Failed to create folder.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const isEdit = mode === 'edit';

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !submitting && onClose()}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl p-8">
        {/* Close X */}
        <button
          onClick={() => !submitting && onClose()}
          className="absolute top-4 right-4 rounded-full p-2 hover:bg-gray-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-[#1F2837]" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-[#E6C26E]/20 flex items-center justify-center">
            <Folder className="w-7 h-7 text-[#C8A557]" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-[#1F2837] mb-2">
            {isEdit ? 'Edit folder' : 'Create a folder'}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            {isEdit
              ? "Update this folder's name, description, or date."
              : 'Group photos and videos together — like "Holiday 2026" or "Family Portraits".'}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1F2837] mb-1.5 uppercase tracking-wide">
              Folder Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="e.g. Holiday 2026"
              disabled={submitting}
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#1F2837] placeholder:text-gray-400 focus:outline-none focus:border-[#C8A557] transition disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2837] mb-1.5 uppercase tracking-wide">
              Description{' '}
              <span className="text-gray-400 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              placeholder="A short note about what's in this folder."
              disabled={submitting}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#1F2837] placeholder:text-gray-400 focus:outline-none focus:border-[#C8A557] transition disabled:opacity-50 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2837] mb-1.5 uppercase tracking-wide">
              Folder Date{' '}
              <span className="text-gray-400 normal-case font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={folderDate}
              onChange={(e) => setFolderDate(e.target.value)}
              disabled={submitting}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#1F2837] focus:outline-none focus:border-[#C8A557] transition disabled:opacity-50 [&::-webkit-datetime-edit]:uppercase"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => !submitting && onClose()}
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting || !name.trim()}
            className="px-6 py-2 rounded-full text-sm font-semibold
                       bg-gradient-to-r from-[#E6C26E] to-[#F3D99B]
                       text-[#1F2837] shadow
                       hover:shadow-lg hover:scale-[1.01]
                       disabled:opacity-60 disabled:hover:shadow disabled:hover:scale-100
                       transition"
          >
            {submitting
              ? (isEdit ? 'Saving…' : 'Creating…')
              : (isEdit ? 'Save Changes' : 'Create Folder')}
          </button>
        </div>
      </div>
    </div>
  );
}