import type { Metadata } from 'next';
import type { LucideIcon } from 'lucide-react';
import {
  Archive,
  Armchair,
  AudioLines,
  BookHeart,
  BookOpen,
  Box,
  Cake,
  CalendarHeart,
  CassetteTape,
  ChefHat,
  Feather,
  Film,
  Flower2,
  FolderOpen,
  Gem,
  Gift,
  HardDrive,
  Heart,
  Hourglass,
  Images,
  KeyRound,
  Library,
  Mail,
  MailOpen,
  MessageCircleHeart,
  MessageCircleQuestion,
  MessageSquareQuote,
  MessageSquareText,
  MessagesSquare,
  Mic,
  Network,
  NotebookPen,
  PackageOpen,
  PenLine,
  ScanLine,
  Search,
  Smartphone,
  Users,
  Video,
  Voicemail,
} from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import JsonLd from '@/components/site/seo/JsonLd';
import { Accent } from '@/components/site/SiteBits';
import landing from '@/components/landing/landing.module.css';
import { GuideCta, GuideSection, GuidesIndexHero } from './_components/GuideLayout';
import { GuideCard, type GuideTone } from './_components/GuideBlocks';
import styles from './_components/guides.module.css';

export const metadata: Metadata = {
  title: 'Family Memory Guides',
  description:
    'Practical guides on capturing stories, voices, and photos while life is happening. Learn how to begin building your family library with clarity and intention.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides',
  },
};

type Guide = { title: string; desc: string; href: string; icon: LucideIcon };

// The guide that leads the page.
const featured: Guide = {
  title: 'Living library vs digital vault',
  desc: 'Why storing files and preserving meaning are two completely different things.',
  href: '/guides/living-library-vs-digital-vault',
  icon: Library,
};

// Every other guide, by theme: each card has the guide's own title and a line from it.
// `id` is the section's anchor for the topic links under the featured guide.
const sections: { id: string; title: string; guides: Guide[] }[] = [
  {
    id: 'photos-and-archives',
    title: 'Photos and archives',
    guides: [
      {
        title: 'What to do with old family photos',
        desc: 'Turn scattered images into something your family actually wants to return to.',
        href: '/guides/what-to-do-with-old-family-photos',
        icon: Images,
      },
      {
        title: 'How to digitise old photos',
        desc: 'The scan settings archives use: 300\u00a0dpi for most prints, a TIFF master, dated file names and two copies.',
        href: '/guides/how-to-digitize-old-photos',
        icon: ScanLine,
      },
      {
        title: 'How to scan photos with your phone',
        desc: 'Soft daylight, a glare-free app and the phone held square: good scans without a scanner.',
        href: '/guides/how-to-scan-photos-with-your-phone',
        icon: Smartphone,
      },
      {
        title: 'How to digitise slides and negatives',
        desc: 'Film needs far more resolution than a print. How to scan it, and how to spot vinegar syndrome early.',
        href: '/guides/how-to-digitize-slides-and-negatives',
        icon: Film,
      },
      {
        title: 'How to digitise old home videos',
        desc: 'Copy VHS and camcorder tapes yourself, send cine film to a specialist, and keep the right files.',
        href: '/guides/how-to-digitize-home-videos',
        icon: Video,
      },
      {
        title: 'How to organise family photos',
        desc: 'Gather every photo in one place, keep the best of each, name files by date and tag the people.',
        href: '/guides/how-to-organize-family-photos',
        icon: FolderOpen,
      },
      {
        title: 'How to label old photos, and what to write',
        desc: 'Soft pencil on the back edge, never ballpoint or sticky labels, and the who, where and when.',
        href: '/guides/how-to-label-old-photos',
        icon: PenLine,
      },
      {
        title: 'How to store old photos so they last',
        desc: 'Keep them cool, dry, dark and steady, in the right boxes, and out of lofts and damp cellars.',
        href: '/guides/how-to-store-old-photos',
        icon: Box,
      },
      {
        title: 'How long do photos last?',
        desc: 'Prints, slides, discs and drives all age differently: what lasts, what fades and what can fail.',
        href: '/guides/how-long-do-photos-last',
        icon: Hourglass,
      },
      {
        title: 'How to back up family photos',
        desc: 'The 3-2-1 rule: three copies, on two kinds of storage, with one kept away from home.',
        href: '/guides/how-to-back-up-family-photos',
        icon: HardDrive,
      },
      {
        title: 'How to preserve old letters and documents',
        desc: 'Store them flat in acid-free folders, never laminate or tape them, and scan each page for the family to read.',
        href: '/guides/how-to-preserve-old-letters-and-documents',
        icon: Mail,
      },
    ],
  },
  {
    id: 'voices-and-stories',
    title: 'Voices and stories',
    guides: [
      {
        title: 'How to preserve family memories',
        desc: 'A starting point for anyone who has been meaning to write things down but never has.',
        href: '/guides/how-to-preserve-family-memories',
        icon: Heart,
      },
      {
        title: 'How to record family stories',
        desc: 'Simple ways to capture the stories that only get told when a certain person is in the room.',
        href: '/guides/how-to-record-family-stories',
        icon: MessageSquareQuote,
      },
      {
        title: 'How to save family voices',
        desc: 'Because the way someone tells a story matters as much as the story itself.',
        href: '/guides/how-to-save-family-voices',
        icon: Mic,
      },
      {
        title: 'How to digitise cassette tapes',
        desc: 'Tape has a limited life. How to record cassettes to WAV at home and keep the files safe.',
        href: '/guides/how-to-digitize-cassette-tapes',
        icon: CassetteTape,
      },
      {
        title: 'How to get your family to share their memories',
        desc: 'Ask one small question at a time, let them answer from their phone, and welcome different versions of a story.',
        href: '/guides/how-to-get-family-to-share-memories',
        icon: Users,
      },
      {
        title: 'How to write a life story',
        desc: 'Start with a timeline, gather stories in their own words, then shape them into chapters with photos.',
        href: '/guides/how-to-write-a-life-story',
        icon: NotebookPen,
      },
      {
        title: 'How to preserve family recipes',
        desc: 'Scan the handwritten card, add modern measurements and cook it with the person who made it.',
        href: '/guides/how-to-preserve-family-recipes',
        icon: ChefHat,
      },
      {
        title: 'What to write in a memory book',
        desc: 'How to fill the blank page so the finished book is one your family actually returns to.',
        href: '/guides/what-to-write-in-a-memory-book',
        icon: BookOpen,
      },
    ],
  },
  {
    id: 'questions-to-ask',
    title: 'Questions to ask',
    guides: [
      {
        title: 'Questions to ask your parents about their life',
        desc: 'Thirty questions, grouped by theme, for asking while you still can.',
        href: '/guides/questions-to-ask-your-parents-about-their-life',
        icon: MessageCircleQuestion,
      },
      {
        title: 'Questions to ask your mum',
        desc: 'Her childhood, her own mother, her work and the years before you, with Mothering Sunday ideas.',
        href: '/guides/questions-to-ask-your-mum',
        icon: MessageCircleHeart,
      },
      {
        title: 'Questions to ask your dad',
        desc: 'His childhood, his own father, his first jobs and the stories he rarely tells, with Father’s Day ideas.',
        href: '/guides/questions-to-ask-your-dad',
        icon: MessagesSquare,
      },
      {
        title: 'Questions to ask your grandparents, decade by decade',
        desc: 'Questions tied to moments they lived through, from rationing to the 1953 Coronation and Decimal Day.',
        href: '/guides/questions-to-ask-your-grandparents',
        icon: Armchair,
      },
      {
        title: 'How to interview your grandparents',
        desc: 'Pick one theme, ask open questions, record with a clip-on mic and agree in writing how it’s used.',
        href: '/guides/how-to-interview-your-grandparents',
        icon: AudioLines,
      },
    ],
  },
  {
    id: 'remembrance',
    title: 'Remembrance',
    guides: [
      {
        title: 'How to keep memories of a loved one alive',
        desc: 'Save their voice and messages, write their stories down while they’re fresh and keep talking about them.',
        href: '/guides/how-to-keep-memories-of-a-loved-one-alive',
        icon: Flower2,
      },
      {
        title: 'How to save voicemails from a loved one',
        desc: 'Networks can erase voicemail. How to keep their messages as audio files, on iPhone, Android and landlines.',
        href: '/guides/how-to-save-voicemails-from-a-loved-one',
        icon: Voicemail,
      },
      {
        title: 'How to save text messages from a loved one',
        desc: 'Stop your phone deleting old chats, then keep your own copies of their texts and WhatsApp messages.',
        href: '/guides/how-to-save-text-messages-from-a-loved-one',
        icon: MessageSquareText,
      },
      {
        title: 'How to make a memorial book',
        desc: 'Gather photos and memories from the family, put the pages in the order of their life and leave time to print.',
        href: '/guides/how-to-make-a-memorial-book',
        icon: BookHeart,
      },
      {
        title: 'How to write a eulogy',
        desc: 'Five to ten minutes and two or three true stories: how to gather them, shape it and get through it.',
        href: '/guides/how-to-write-a-eulogy',
        icon: Feather,
      },
    ],
  },
  {
    id: 'time-capsules-and-legacy',
    title: 'Time capsules and legacy',
    guides: [
      {
        title: 'What to put in a time capsule',
        desc: 'Letters, named photos, today’s front page and your voices, plus what to leave out and which container to use.',
        href: '/guides/what-to-put-in-a-time-capsule',
        icon: PackageOpen,
      },
      {
        title: 'How to write a legacy letter',
        desc: 'Pass on your stories, values and hopes rather than possessions: what to include and where to keep it.',
        href: '/guides/how-to-write-a-legacy-letter',
        icon: MailOpen,
      },
      {
        title: 'What happens to your photos when you die?',
        desc: 'Without a plan, cloud photos can be locked away or deleted. The legacy settings at Apple, Google and Facebook.',
        href: '/guides/what-happens-to-your-photos-when-you-die',
        icon: KeyRound,
      },
    ],
  },
  {
    id: 'gifts-and-occasions',
    title: 'Gifts and occasions',
    guides: [
      {
        title: 'Gifts for grandparents that mean something',
        desc: 'Photo books, framed prints, recorded voices and time together, plus when Grandparents’ Day falls.',
        href: '/guides/gifts-for-grandparents',
        icon: Gift,
      },
      {
        title: '80th birthday ideas that celebrate a whole life',
        desc: 'A memory book of eight decades, letters from the family and a party built around their stories.',
        href: '/guides/80th-birthday-ideas',
        icon: Cake,
      },
      {
        title: 'Wedding anniversary gifts by year',
        desc: 'Paper, cotton and leather through to ruby, gold and diamond: the traditional British list, with gift ideas.',
        href: '/guides/anniversary-gift-ideas-by-year',
        icon: Gem,
      },
      {
        title: 'Family tradition ideas worth starting',
        desc: 'Small, repeatable traditions, from the same photo every birthday to a recipe cooked on the same day each year.',
        href: '/guides/family-traditions-ideas',
        icon: CalendarHeart,
      },
    ],
  },
  {
    id: 'family-history',
    title: 'Family history',
    guides: [
      {
        title: 'Family history vs family tree: what’s the difference?',
        desc: 'A tree records who connects to whom; family history tells who they were. How the two fit together.',
        href: '/guides/family-history-vs-family-tree',
        icon: Network,
      },
      {
        title: 'How to start researching your family history',
        desc: 'Begin with living relatives, then work back through UK certificates, census returns and the 1939 Register.',
        href: '/guides/how-to-start-researching-your-family-history',
        icon: Search,
      },
      {
        title: 'How to create a family archive',
        desc: 'Decide what to keep, store the originals safely, digitise the best and note who, what, when and why.',
        href: '/guides/how-to-create-a-family-archive',
        icon: Archive,
      },
    ],
  },
];

// Every guide in page order, for the card numbers and the ItemList.
const guides = [featured, ...sections.flatMap((section) => section.guides)];

const TONES: GuideTone[] = ['pink', 'blue', 'orange', 'aqua'];

// How each guide's card looks: its own icon, with the number and the colour (the four in turn) following page order.
const look = (guide: Guide) => {
  const i = guides.indexOf(guide);
  return { num: String(i + 1).padStart(2, '0'), icon: guide.icon, tone: TONES[i % TONES.length] };
};

export default function GuidesPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': 'https://www.ancestorii.com/guides',
          name: 'Family Memory Guides',
          description: 'A collection of practical guides for building a living family library.',
          url: 'https://www.ancestorii.com/guides',
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: guides.map((g, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: g.title,
              url: `https://www.ancestorii.com${g.href}`,
            })),
          },
          publisher: { '@type': 'Organization', name: 'Ancestorii' },
        }}
      />

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ancestorii.com/' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://www.ancestorii.com/guides' },
          ],
        }}
      />

      <SiteShell>
        <GuidesIndexHero
          title={
            <>
              Practical steps for{' '}
              <br />
              <Accent>keeping what matters.</Accent>
            </>
          }
          lead={
            <>
              Short, focused guides for the moments when you are ready to start capturing your family&apos;s story. No pressure. No overwhelm. Just a place to begin.
            </>
          }
        />

        <section className={styles.indexSection}>
          <div className={landing.wrap}>
            <GuideCard featured href={featured.href} title={featured.title} desc={featured.desc} {...look(featured)} />
            <nav aria-label="Guide topics" className={styles.jump}>
              {sections.map((section) => (
                <a key={section.id} href={`#${section.id}`} className={landing.topic}>
                  {section.title}
                </a>
              ))}
            </nav>
            {sections.map((section) => (
              <GuideSection key={section.id} id={section.id} title={section.title}>
                <div className={styles.guideGrid}>
                  {section.guides.map((guide) => (
                    <GuideCard
                      key={guide.href}
                      href={guide.href}
                      title={guide.title}
                      desc={guide.desc}
                      {...look(guide)}
                    />
                  ))}
                </div>
              </GuideSection>
            ))}
          </div>
        </section>

        <GuideCta
          title={
            <>
              One memory first.
              <br />
              <Accent tone="pink">The rest follows.</Accent>
            </>
          }
        >
          Two minutes. Your words. A memory that stays.
        </GuideCta>
      </SiteShell>
    </>
  );
}
