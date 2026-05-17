'use client';

import StoryAssistanceCard, { AssistOption } from '@/components/StoryAssistanceCard';

type AlbumAIProps = {
  albumTitle: string;
  albumDescription?: string | null;
  mediaCount: number;
  taggedPeopleNames?: string[];
  assistanceEnabled?: boolean;
  familyId?: string;
};

const ALBUM_OPTIONS: AssistOption[] = [
  {
    key: 'album_description',
    label: 'Album Description',
    icon: 'I',
    description: 'Set the scene for this collection of memories.',
    assistType: 'album-description',
  },
  {
    key: 'album_caption',
    label: 'Photo Captions',
    icon: 'II',
    description: 'Warm, personal captions for your photos.',
    assistType: 'album-caption',
  },
  {
    key: 'album_voice_note',
    label: 'Voice Note Ideas',
    icon: 'III',
    description: 'What to say when you hit record.',
    assistType: 'album-voice-note',
  },
];

export default function AlbumAI({
  albumTitle,
  albumDescription,
  mediaCount,
  taggedPeopleNames,
  assistanceEnabled = true,
  familyId,
}: AlbumAIProps) {
  const lovedOneName = taggedPeopleNames?.length
    ? taggedPeopleNames.join(' & ')
    : undefined;

  return (
    <StoryAssistanceCard
      welcomeHeading={
        <>
          Need help writing about{' '}
          <span className="text-[#A9782F]">{albumTitle}</span>?
        </>
      }
      welcomeBody="We can help you describe this album and write captions that bring your photos to life."
      entityName={albumTitle}
      options={ALBUM_OPTIONS}
      assistContext={{
        album_title: albumTitle,
        loved_one_name: lovedOneName,
        media_count: mediaCount,
      }}
      familyId={familyId}
      assistanceEnabled={assistanceEnabled}
    />
  );
}