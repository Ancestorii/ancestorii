'use client';

import StoryAssistanceCard, { AssistOption } from '@/components/StoryAssistanceCard';

type CapsuleAIProps = {
  capsuleTitle: string;
  unlockDate?: string | null;
  taggedPeopleNames?: string[];
  assistanceEnabled?: boolean;
  familyId?: string;
};

const CAPSULE_OPTIONS: AssistOption[] = [
  {
    key: 'capsule_message',
    label: 'Capsule Message',
    icon: 'I',
    description: 'A heartfelt letter to whoever opens this one day.',
    assistType: 'capsule-message',
  },
  {
    key: 'capsule_description',
    label: 'Capsule Description',
    icon: 'II',
    description: 'Describe what this capsule holds and why it matters.',
    assistType: 'capsule-description',
  },
  {
    key: 'capsule_voice_note',
    label: 'Voice Note Ideas',
    icon: 'III',
    description: 'What to say when you press record for the future.',
    assistType: 'capsule-voice-note',
  },
];

export default function CapsuleAI({
  capsuleTitle,
  unlockDate,
  taggedPeopleNames,
  assistanceEnabled = true,
  familyId,
}: CapsuleAIProps) {
  const lovedOneName = taggedPeopleNames?.length
    ? taggedPeopleNames.join(' & ')
    : undefined;

  return (
    <StoryAssistanceCard
      welcomeHeading={
        <>
          Need help writing a message for{' '}
          <span className="text-[#A9782F]">{capsuleTitle}</span>?
        </>
      }
      welcomeBody="This capsule is a gift to the future. We can help you find the right words to seal inside it."
      entityName={capsuleTitle}
      options={CAPSULE_OPTIONS}
      assistContext={{
        capsule_title: capsuleTitle,
        unlock_date: unlockDate,
        loved_one_name: lovedOneName,
      }}
      familyId={familyId}
      assistanceEnabled={assistanceEnabled}
    />
  );
}