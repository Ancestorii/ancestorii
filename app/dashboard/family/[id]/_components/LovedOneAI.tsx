'use client';

import StoryAssistanceCard, { AssistOption } from '@/components/StoryAssistanceCard';

type LovedOneAIProps = {
  memberName: string;
  firstName: string;
  memberBorn?: string | null;
  memberDied?: string | null;
  memberRelationship?: string | null;
  assistanceEnabled?: boolean;
  familyId?: string;
};

const LOVED_ONE_OPTIONS: AssistOption[] = [
  {
    key: 'early_years',
    label: 'Early Years',
    icon: 'I',
    description: 'Childhood, home, school, where it all began.',
    assistType: 'loved-one-early-years',
  },
  {
    key: 'important_moments',
    label: 'Important Moments',
    icon: 'II',
    description: 'Milestones, turning points, proud moments.',
    assistType: 'loved-one-important-moments',
  },
  {
    key: 'special_memories',
    label: 'Special Memories',
    icon: 'III',
    description: 'The moments that made you smile.',
    assistType: 'loved-one-special-memories',
  },
  {
    key: 'who_they_are',
    label: 'Who They Are',
    icon: 'IV',
    description: 'Their personality, habits, presence.',
    assistType: 'loved-one-who-they-are',
  },
];

export default function LovedOneAI({
  memberName,
  firstName,
  memberBorn,
  memberDied,
  memberRelationship,
  assistanceEnabled = true,
  familyId,
}: LovedOneAIProps) {
  return (
    <StoryAssistanceCard
      welcomeHeading={
        <>
          Need help remembering the small details about{' '}
          <span className="text-[#A9782F]">{firstName}</span>?
        </>
      }
      welcomeBody="We can help you get started with gentle prompts and suggestions. You always stay in control of the words."
      entityName={firstName}
      options={LOVED_ONE_OPTIONS}
      assistContext={{
        name: memberName,
        relationship: memberRelationship,
        born: memberBorn,
        died: memberDied,
      }}
      familyId={familyId}
      assistanceEnabled={assistanceEnabled}
    />
  );
}