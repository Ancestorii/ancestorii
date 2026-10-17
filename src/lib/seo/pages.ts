// Every public page, grouped the way the footer and the hubs show them. One list, so a new
// page is added here once and the footer, hubs and sitemap can all draw on it.

export type PageLink = { href: string; label: string };
export type PageGroup = { title: string; href?: string; links: PageLink[] };

export const PRODUCT_PAGES: PageLink[] = [
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/features', label: 'All Features' },
  { href: '/memory-books', label: 'Memory Books' },
  { href: '/canvas-prints', label: 'Canvas Prints' },
  { href: '/acrylic-prints', label: 'Acrylic Prints' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/why-this-exists', label: 'Why Ancestorii Exists' },
];

export const FEATURE_PAGES: PageLink[] = [
  { href: '/features/private-family-feed', label: 'My Family feed' },
  { href: '/features/family-questions', label: 'Family questions' },
  { href: '/features/loved-ones', label: 'Loved Ones' },
  { href: '/features/family-photo-albums', label: 'Photo albums' },
  { href: '/features/family-timeline', label: 'Family timeline' },
  { href: '/features/digital-time-capsule', label: 'Time capsules' },
  { href: '/features/family-library', label: 'Family library' },
  { href: '/features/voice-notes', label: 'Voice notes' },
  { href: '/features/invite-family', label: 'Invite family' },
  { href: '/features/writing-help', label: 'Writing help' },
  { href: '/features/our-stories', label: 'Our Stories' },
];

export const COMPARE_PAGES: PageLink[] = [
  { href: '/compare', label: 'Compare platforms' },
  { href: '/compare/storyworth-alternative', label: 'Storyworth alternative' },
  { href: '/compare/remento-alternative', label: 'Remento alternative' },
  { href: '/compare/best-family-memory-apps', label: 'Best family memory apps' },
  { href: '/compare/ancestorii-vs-ancestry', label: 'Ancestorii vs Ancestry' },
  { href: '/compare/ancestorii-vs-google-photos', label: 'Ancestorii vs Google Photos' },
  { href: '/compare/ancestorii-vs-icloud-shared-albums', label: 'Ancestorii vs iCloud Albums' },
  { href: '/compare/ancestorii-vs-whatsapp', label: 'Ancestorii vs WhatsApp' },
  { href: '/compare/ancestorii-vs-facebook-groups', label: 'Ancestorii vs Facebook Groups' },
  { href: '/compare/ancestorii-vs-tinybeans', label: 'Ancestorii vs Tinybeans' },
];

/** The guide hub and its sections, for the footer: the hub holds every guide. */
export const GUIDE_HUB_PAGES: PageLink[] = [
  { href: '/guides', label: 'All guides' },
  { href: '/guides#photos-and-archives', label: 'Photos and archives' },
  { href: '/guides#voices-and-stories', label: 'Voices and stories' },
  { href: '/guides#questions-to-ask', label: 'Questions to ask' },
  { href: '/guides#remembrance', label: 'Remembrance' },
  { href: '/guides#time-capsules-and-legacy', label: 'Time capsules and legacy' },
  { href: '/guides#gifts-and-occasions', label: 'Gifts and occasions' },
  { href: '/guides#family-history', label: 'Family history' },
];

export const DISCOVER_PAGES: PageLink[] = [
  { href: '/stories', label: 'Our Stories' },
  { href: '/stories/topics', label: 'Browse by topic' },
  { href: '/digital-legacy', label: 'What is a digital legacy?' },
  { href: '/living-library', label: 'What is a living library?' },
];

export const COMPANY_PAGES: PageLink[] = [
  { href: '/why-this-exists', label: 'Our roots' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms and Conditions' },
  { href: '/delete-account', label: 'Delete your account' },
];

export const GUIDE_GROUPS: PageGroup[] = [
  {
    title: 'Photos and archives',
    links: [
      { href: '/guides/what-to-do-with-old-family-photos', label: 'What to do with old family photos' },
      { href: '/guides/how-to-digitize-old-photos', label: 'How to digitise old photos' },
      { href: '/guides/how-to-scan-photos-with-your-phone', label: 'Scan photos with your phone' },
      { href: '/guides/how-to-digitize-slides-and-negatives', label: 'Digitise slides and negatives' },
      { href: '/guides/how-to-digitize-home-videos', label: 'Digitise old home videos' },
      { href: '/guides/how-to-organize-family-photos', label: 'Organise family photos' },
      { href: '/guides/how-to-label-old-photos', label: 'Label old photos' },
      { href: '/guides/how-to-store-old-photos', label: 'Store old photos so they last' },
      { href: '/guides/how-long-do-photos-last', label: 'How long do photos last?' },
      { href: '/guides/how-to-back-up-family-photos', label: 'Back up family photos' },
      { href: '/guides/how-to-preserve-old-letters-and-documents', label: 'Preserve old letters and documents' },
    ],
  },
  {
    title: 'Voices and stories',
    links: [
      { href: '/guides/how-to-preserve-family-memories', label: 'How to preserve family memories' },
      { href: '/guides/how-to-record-family-stories', label: 'How to record family stories' },
      { href: '/guides/how-to-save-family-voices', label: 'How to save family voices' },
      { href: '/guides/how-to-digitize-cassette-tapes', label: 'Digitise cassette tapes' },
      { href: '/guides/how-to-get-family-to-share-memories', label: 'Get your family sharing memories' },
      { href: '/guides/how-to-write-a-life-story', label: 'How to write a life story' },
      { href: '/guides/how-to-preserve-family-recipes', label: 'Preserve family recipes' },
      { href: '/guides/what-to-write-in-a-memory-book', label: 'What to write in a memory book' },
    ],
  },
  {
    title: 'Questions to ask',
    links: [
      { href: '/guides/questions-to-ask-your-parents-about-their-life', label: 'Questions to ask your parents' },
      { href: '/guides/questions-to-ask-your-mum', label: 'Questions to ask your mum' },
      { href: '/guides/questions-to-ask-your-dad', label: 'Questions to ask your dad' },
      { href: '/guides/questions-to-ask-your-grandparents', label: 'Questions to ask your grandparents' },
      { href: '/guides/how-to-interview-your-grandparents', label: 'How to interview your grandparents' },
    ],
  },
  {
    title: 'Remembrance',
    links: [
      { href: '/guides/how-to-keep-memories-of-a-loved-one-alive', label: 'Keep memories of a loved one alive' },
      { href: '/guides/how-to-save-voicemails-from-a-loved-one', label: 'Save voicemails from a loved one' },
      { href: '/guides/how-to-save-text-messages-from-a-loved-one', label: 'Save text messages from a loved one' },
      { href: '/guides/how-to-make-a-memorial-book', label: 'How to make a memorial book' },
      { href: '/guides/how-to-write-a-eulogy', label: 'How to write a eulogy' },
    ],
  },
  {
    title: 'Legacy and family history',
    links: [
      { href: '/guides/what-to-put-in-a-time-capsule', label: 'What to put in a time capsule' },
      { href: '/guides/how-to-write-a-legacy-letter', label: 'How to write a legacy letter' },
      { href: '/guides/what-happens-to-your-photos-when-you-die', label: 'What happens to your photos when you die?' },
      { href: '/guides/living-library-vs-digital-vault', label: 'Living library vs digital vault' },
      { href: '/guides/family-history-vs-family-tree', label: 'Family history vs family tree' },
      { href: '/guides/how-to-start-researching-your-family-history', label: 'Start researching your family history' },
      { href: '/guides/how-to-create-a-family-archive', label: 'How to create a family archive' },
    ],
  },
  {
    title: 'Gifts and occasions',
    links: [
      { href: '/guides/gifts-for-grandparents', label: 'Gifts for grandparents' },
      { href: '/guides/80th-birthday-ideas', label: '80th birthday ideas' },
      { href: '/guides/anniversary-gift-ideas-by-year', label: 'Anniversary gifts by year' },
      { href: '/guides/family-traditions-ideas', label: 'Family tradition ideas' },
    ],
  },
];

/** Every guide page, flat. */
export const GUIDE_PAGES: PageLink[] = GUIDE_GROUPS.flatMap((g) => g.links);
