import type { Metadata } from 'next';
import Script from 'next/script';
import type { LucideIcon } from 'lucide-react';
import { BookOpen, Heart, Images, Library, MessageCircleQuestion, MessageSquareQuote, Mic } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent } from '@/components/site/SiteBits';
import landing from '@/components/landing/landing.module.css';
import { GuideCta, GuidesIndexHero } from './_components/GuideLayout';
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

const guides = [
  {
    title: 'Living library vs digital vault',
    desc: 'Why storing files and preserving meaning are two completely different things.',
    href: '/guides/living-library-vs-digital-vault',
  },
  {
    title: 'How to preserve family memories',
    desc: 'A starting point for anyone who has been meaning to write things down but never has.',
    href: '/guides/how-to-preserve-family-memories',
  },
  {
    title: 'How to save family voices',
    desc: 'Because the way someone tells a story matters as much as the story itself.',
    href: '/guides/how-to-save-family-voices',
  },
  {
    title: 'What to do with old family photos',
    desc: 'Turn scattered images into something your family actually wants to return to.',
    href: '/guides/what-to-do-with-old-family-photos',
  },
  {
    title: 'How to record family stories',
    desc: 'Simple ways to capture the stories that only get told when a certain person is in the room.',
    href: '/guides/how-to-record-family-stories',
  },
  {
    title: 'Questions to ask your parents about their life',
    desc: 'Thirty questions, grouped by theme, for asking while you still can.',
    href: '/guides/questions-to-ask-your-parents-about-their-life',
  },
  {
    title: 'What to write in a memory book',
    desc: 'How to fill the blank page so the finished book is one your family actually returns to.',
    href: '/guides/what-to-write-in-a-memory-book',
  },
];

// How each guide's card looks, in the same order as the list above.
const LOOKS: { icon: LucideIcon; tone: GuideTone }[] = [
  { icon: Library, tone: 'pink' },
  { icon: Heart, tone: 'blue' },
  { icon: Mic, tone: 'orange' },
  { icon: Images, tone: 'aqua' },
  { icon: MessageSquareQuote, tone: 'pink' },
  { icon: MessageCircleQuestion, tone: 'blue' },
  { icon: BookOpen, tone: 'orange' },
];

const look = (i: number) => LOOKS[i % LOOKS.length];

export default function GuidesPage() {
  const [first, ...rest] = guides;

  return (
    <>
      <Script id="collection-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
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
        })}
      </Script>

      <Script id="breadcrumb-schema-guides" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ancestorii.com/' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://www.ancestorii.com/guides' },
          ],
        })}
      </Script>

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
            <GuideCard
              featured
              num="01"
              href={first.href}
              title={first.title}
              desc={first.desc}
              {...look(0)}
            />
            <div className={styles.guideGrid}>
              {rest.map((guide, i) => (
                <GuideCard
                  key={guide.href}
                  num={String(i + 2).padStart(2, '0')}
                  href={guide.href}
                  title={guide.title}
                  desc={guide.desc}
                  {...look(i + 1)}
                />
              ))}
            </div>
          </div>
        </section>

        <GuideCta
          title={
            <>
              Start with one memory.
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
