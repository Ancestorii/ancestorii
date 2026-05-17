'use client';

import StoryAssistanceCard, { AssistOption } from '@/components/StoryAssistanceCard';

type BookAIProps = {
  bookTitle: string;
  assistanceEnabled?: boolean;
  familyId?: string;
};

const BOOK_OPTIONS: AssistOption[] = [
  {
    key: 'book_page_comment',
    label: 'Page Descriptions',
    icon: 'I',
    description: 'Describe what is happening in the photo or on the page.',
    assistType: 'book-page-comment',
  },
  {
    key: 'book_chapter_intro',
    label: 'Page Headings',
    icon: 'II',
    description: 'Short, warm headings that set the scene.',
    assistType: 'book-chapter-intro',
  },
  {
    key: 'book_intro',
    label: 'Book Introduction',
    icon: 'III',
    description: 'The opening words of your memory book.',
    assistType: 'book-intro',
  },
];

export default function BookAI({
  bookTitle,
  assistanceEnabled = true,
  familyId,
}: BookAIProps) {
  return (
    <StoryAssistanceCard
      welcomeHeading={
        <>
          Need help writing for{' '}
          <span className="text-[#A9782F]">{bookTitle}</span>?
        </>
      }
      welcomeBody="We can help you describe your photos, write headings, and craft the opening words of your memory book."
      entityName={bookTitle}
      options={BOOK_OPTIONS}
      assistContext={{
        name: bookTitle,
      }}
      familyId={familyId}
      assistanceEnabled={assistanceEnabled}
    />
  );
}