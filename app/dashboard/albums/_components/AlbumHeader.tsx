'use client';

import { useState, type CSSProperties } from 'react';
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
  Save,
} from 'lucide-react';
import { ui, Avatar, Btn, Eyebrow } from '@/components/dashboard/ui/AppBits';
import s from './albums.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

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

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default function AlbumHeader({
  album,
  taggedPeople,
  mediaCount,
  photoCount,
  videoCount,
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
  /** Photos and videos, split as the filters split them (each chip shown when above 0). */
  photoCount?: number;
  videoCount?: number;
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
    { key: 'all', label: 'All Memories', icon: <LayoutGrid size={16} strokeWidth={2.2} /> },
    { key: 'photo', label: 'Photos', icon: <ImageIcon size={16} strokeWidth={2.2} /> },
    { key: 'video', label: 'Videos', icon: <Play size={16} strokeWidth={2.2} /> },
  ];

  return (
    <header className={cx(ui.header, s.header)}>
      <div className={ui.headerGlow} aria-hidden="true" />

      {/* Top row: back to the list, the album's actions on the right */}
      <div className={s.topRow}>
        <Btn
          variant="soft"
          size="sm"
          onClick={() => router.push('/dashboard/albums')}
          icon={<ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />}
        >
          Back to Albums
        </Btn>

        {/* Narrow columns: Upload moves up beside Back, the other three share the row below */}
        <div className={s.actions}>
          <div className={s.actionsSoft}>
            <SaveButton />
            <Btn
              variant="soft"
              size="sm"
              onClick={onLibrary}
              aria-haspopup="dialog"
              icon={<BookOpen size={17} strokeWidth={2.2} aria-hidden="true" />}
            >
              Library
            </Btn>
            <Btn
              variant="soft"
              size="sm"
              onClick={onTag}
              aria-haspopup="dialog"
              icon={<Users size={17} strokeWidth={2.2} aria-hidden="true" />}
            >
              Tag
            </Btn>
          </div>
          <Btn
            size="sm"
            onClick={onUpload}
            aria-haspopup="dialog"
            tile={<Upload size={16} strokeWidth={2.4} />}
            className={s.uploadBtn}
          >
            Upload
          </Btn>
        </div>
      </div>

      {/* Title, counts, description, people */}
      <div className={s.titleBlock}>
        <div className={ui.headerTop}>
          <Eyebrow dot="var(--c2)">Album</Eyebrow>
        </div>

        <h1 className={cx(ui.title, ui.titleMd)}>{album.title}</h1>

        <div className={ui.meta}>
          <span
            className={cx(ui.chip, ui.chipInk, ui.chipDot)}
            style={{ '--dot': 'var(--c2)' } as CSSProperties}
          >
            {plural(mediaCount, 'memory', 'memories')}
          </span>
          {!!photoCount && (
            <span className={ui.chip}>
              <ImageIcon size={15} strokeWidth={2.4} aria-hidden="true" />
              {plural(photoCount, 'photo', 'photos')}
            </span>
          )}
          {!!videoCount && (
            <span className={ui.chip}>
              <Play size={15} strokeWidth={2.4} aria-hidden="true" />
              {plural(videoCount, 'video', 'videos')}
            </span>
          )}
          <span className={ui.chip}>Created {createdDate}</span>
        </div>

        {album.description && (
          <p className={cx(ui.lead, '[overflow-wrap:anywhere]')}>{album.description}</p>
        )}

        {taggedPeople.length > 0 && (
          <ul className={s.people} aria-label="People in this album">
            {taggedPeople.map((p) => (
              <li key={p.id} className={cx(ui.chip, s.person)}>
                <span aria-hidden="true">
                  <Avatar src={p.avatar_signed} name={p.full_name} size={24} plain />
                </span>
                {p.full_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Filters */}
      <div className={cx(ui.tabs, s.filters)} role="group" aria-label="Filter memories">
        {filters.map((f) => {
          const active = activeFilter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => onFilterChange(f.key)}
              aria-pressed={active}
              className={ui.tab}
            >
              <span className={s.filterIcon} aria-hidden="true">
                {f.icon}
              </span>
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}

function SaveButton() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // As in the print editors: a soft button with the save icon, a tick once saved.
  return (
    <Btn
      variant="soft"
      size="sm"
      onClick={handleSave}
      icon={
        saved ? (
          <Check size={17} strokeWidth={2.6} aria-hidden="true" />
        ) : (
          <Save size={17} strokeWidth={2.2} aria-hidden="true" />
        )
      }
      className={s.saveBtn}
    >
      {saved ? 'Saved' : 'Save'}
    </Btn>
  );
}
