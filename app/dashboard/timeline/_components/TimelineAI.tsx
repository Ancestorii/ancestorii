'use client';

import StoryAssistanceCard, { AssistOption } from '@/components/StoryAssistanceCard';

type TimelineAIProps = {
  timelineTitle: string;
  taggedPeopleNames?: string[];
  assistanceEnabled?: boolean;
  familyId?: string;
};

const TIMELINE_OPTIONS: AssistOption[] = [
  {
    key: 'timeline_prompts',
    label: 'Memory Prompts',
    icon: 'I',
    description: 'Questions to help you remember what happened.',
    assistType: 'timeline-prompts',
  },
  {
    key: 'timeline_event_description',
    label: 'Event Descriptions',
    icon: 'II',
    description: 'Help describing a moment on your timeline.',
    assistType: 'timeline-event-description',
  },
];

export default function TimelineAI({
  timelineTitle,
  taggedPeopleNames,
  assistanceEnabled = true,
  familyId,
}: TimelineAIProps) {
  const lovedOneName = taggedPeopleNames?.length
    ? taggedPeopleNames.join(' & ')
    : undefined;

  return (
    <StoryAssistanceCard
      welcomeHeading={
        <>
          Need help adding memories to{' '}
          <span className="text-[#A9782F]">{timelineTitle}</span>?
        </>
      }
      welcomeBody="We can help you remember the moments that belong on this timeline and find the words to describe them."
      entityName={timelineTitle}
      options={TIMELINE_OPTIONS}
      assistContext={{
        name: lovedOneName || timelineTitle,
        event_title: timelineTitle,
      }}
      familyId={familyId}
      assistanceEnabled={assistanceEnabled}
    />
  );
}