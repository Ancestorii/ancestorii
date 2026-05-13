'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Upload,
  BookOpen,
  Users,
  Check,
  LayoutGrid,
  Image as ImageIcon,
  Play,
} from 'lucide-react';

type TaggedPerson = {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  avatar_signed?: string | null;
};

type Album = {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  created_at: string;
};

type MediaFilter = 'all' | 'photo' | 'video';

export default function AlbumHeader({
  album,
  taggedPeople,
  mediaCount,
  voiceNoteCount,
  activeFilter,
  onFilterChange,
  onUpload,
  onLibrary,
  onTag,
  onRemoveTag,
}: {
  album: Album;
  taggedPeople: TaggedPerson[];
  mediaCount: number;
  voiceNoteCount: number;
  activeFilter: MediaFilter;
  onFilterChange: (f: MediaFilter) => void;
  onUpload: () => void;
  onLibrary: () => void;
  onTag: () => void;
  onRemoveTag: (familyMemberId: string) => void;
}) {
  const router = useRouter();

  void voiceNoteCount;
  void onRemoveTag;

  const createdDate = new Date(album.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const filters: { key: MediaFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All Memories', icon: <LayoutGrid size={14} /> },
    { key: 'photo', label: 'Photos', icon: <ImageIcon size={14} /> },
    { key: 'video', label: 'Videos', icon: <Play size={14} /> },
  ];

  return (
    <div className="px-5 sm:px-8 lg:px-10">
      {/* Back link */}
      <button
        onClick={() => router.push('/dashboard/albums')}
        className="inline-flex items-center gap-1.5 pt-6 mb-5 text-[13px] font-medium text-[#8f8a82] bg-transparent border-none cursor-pointer"
      >
        <ArrowLeft size={14} />
        Albums
      </button>

      {/* Title + buttons row */}
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        {/* Left: title, description, meta */}
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold italic leading-[0.98] tracking-[-0.03em] text-[#171614] m-0"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.75rem, 3vw, 4rem)' }}
          >
            {album.title}
          </h1>

          {album.description && (
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-[#3d3830] font-medium leading-relaxed">
              {album.description}
            </p>
          )}

          <div className="mt-4 sm:mt-6 flex items-center flex-wrap gap-x-2 gap-y-1 text-sm sm:text-[15px]">
            <span className="font-semibold text-[#171614]">{mediaCount} memories</span>
            <span className="text-[#8d877d]">·</span>
            <span className="text-[#4a4035] font-medium">Created {createdDate}</span>
          </div>

          {taggedPeople.length > 0 && (
            <div className="mt-3 flex items-center flex-wrap gap-2">
              {taggedPeople.map((p) => (
                <div
                  key={p.id}
                  className="inline-flex items-center gap-1.5 py-1 pl-1 pr-3 rounded-full bg-[#f5f0e6] border border-[#d8cdb8]"
                >
                  {p.avatar_signed ? (
                    <img
                      src={p.avatar_signed}
                      alt={p.full_name}
                      className="w-[26px] h-[26px] rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-[26px] h-[26px] rounded-full bg-[#2c2418] text-[#d4af37] text-[11px] font-bold flex items-center justify-center">
                      {p.full_name?.[0]?.toUpperCase()}
                    </span>
                  )}
                  <span className="text-[13px] font-medium text-[#3d2e1c]">{p.full_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 flex-shrink-0 pb-1">
          <SaveButton />
          <button
            onClick={onUpload}
            className="inline-flex items-center gap-2 h-10 px-4 sm:px-5 rounded-full bg-white text-[#2c2418] text-[13px] sm:text-sm font-semibold border border-[#ccc1ab] cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
          >
            <Upload size={15} /> Upload
          </button>
          <button
            onClick={onLibrary}
            className="inline-flex items-center gap-2 h-10 px-4 sm:px-5 rounded-full bg-[#faf0dc] border border-[#d4a940] text-[#7a5a10] text-[13px] sm:text-sm font-semibold cursor-pointer"
          >
            <BookOpen size={15} /> Library
          </button>
          <button
            onClick={onTag}
            className="inline-flex items-center gap-2 h-10 px-4 sm:px-5 rounded-full bg-[#f0eaf5] border border-[#b8a0d4] text-[#5b3a8a] text-[13px] sm:text-sm font-semibold cursor-pointer"
          >
            <Users size={15} /> Tag
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-6 sm:mt-8 border-b border-[#dfd8ce]" />

      {/* Filter tabs */}
      <div className="py-3 sm:py-4 flex items-center">
        <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto">
          {filters.map((f) => {
            const active = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => onFilterChange(f.key)}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full h-10 px-5 text-sm border-none cursor-pointer outline-none transition-all duration-200"
                style={{
                  background: active ? '#2c2418' : 'transparent',
                  color: active ? '#d4af37' : '#4a4035',
                  fontWeight: active ? 700 : 500,
                  boxShadow: active ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                }}
              >
                <span style={{ color: active ? '#d4af37' : '#6e675d' }}>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SaveButton() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <button
      onClick={handleSave}
      className={`inline-flex items-center gap-2 h-10 px-4 sm:px-5 rounded-full text-[13px] sm:text-sm font-semibold cursor-pointer transition-all duration-300 ${
        saved
          ? 'bg-[#2c2418] text-[#d4af37] border border-[#2c2418]'
          : 'bg-white text-[#2c2418] border border-[#ccc1ab] shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
      }`}
    >
      {saved ? <Check size={15} /> : null}
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}