import type { Metadata } from 'next';
import SiteShell from '@/components/site/SiteShell';
import { Accent, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { Step, Steps } from '../_components/GuideBlocks';

const PATH = '/guides/how-to-preserve-family-memories';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Capture and Grow Family Memories';
const HEADLINE = 'How to preserve family memories';
const DESCRIPTION =
  'A practical guide to capturing family memories while life is happening: simple ways to record stories, voices and moments and grow a living family library.';
const PUBLISHED = '2026-02-10';
const MODIFIED = '2026-05-22';
const CRUMB = 'How to Preserve Family Memories';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: `${TITLE} | Ancestorii`,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: 'Ancestorii',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to preserve family memories' }],
    locale: 'en_GB',
    type: 'article',
    publishedTime: PUBLISHED,
    modifiedTime: MODIFIED,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | Ancestorii`,
    description: DESCRIPTION,
    images: ['/og-default.jpg'],
  },
};

// The five steps shown on the page, for the HowTo schema.
const HOW_TO = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to preserve family memories',
  description: 'A practical guide to capturing family memories while life is happening. Five simple ways to start today.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Pick the memory you are most afraid of losing',
      text: 'Not the prettiest photo or the most dramatic story. The one that lives in someone\'s head right now and would disappear if they did. That is your starting point.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Write three sentences about it',
      text: 'Who was there. What happened. Why it mattered. You are not writing a novel. You are leaving a note for the people who come after you. Three sentences is more than most families ever write down.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Ask someone to tell you a story',
      text: 'Call your mum. Visit your grandad. Ask them about a memory they think about often. Just listen, and write it down afterwards while it is still fresh.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Add context to one photo',
      text: 'Pick any photo on your phone. Write who is in it, where it was taken, and what was happening in your life at the time. That is the difference between an image and a memory.',
    },
    {
      '@type': 'HowToStep',
      position: 5,
      name: 'Put it somewhere that lasts',
      text: 'Not a notes app. Not a text message. Not a Google Doc that nobody will ever open again. Put it somewhere intentional, structured, and private. Somewhere your family can find it in ten years without having to search through folders.',
    },
  ],
};

export default function PreserveFamilyMemoriesPage() {
  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            path: PATH,
            headline: HEADLINE,
            description: DESCRIPTION,
            datePublished: PUBLISHED,
            dateModified: MODIFIED,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Guides', path: '/guides' },
            { name: CRUMB, path: PATH },
          ]),
          HOW_TO,
        ]}
      />

      <SiteShell>
        <GuideArticle
          crumb={CRUMB}
          title={
            <>
              How to preserve{' '}
              <br />
              <Accent>family memories.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              Nobody wakes up one morning and decides to let their family history disappear. It happens slowly. A story that used to get told at every gathering stops being told because the person who told it is no longer around. A photo sits in a drawer for so long that nobody remembers who is in it. A recipe lives in one person&apos;s head until the day it no longer does.
            </Lead>
            <p>
              Preserving family memories is not about building an archive. It is about paying attention while you still can.
            </p>
          </Prose>

          <PullQuote>
            The best time to capture a memory{' '}
            <Accent tone="blue">is while the person who holds it is still here.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                Why it feels <Accent tone="pink">harder than it is.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Most people think preserving memories means scanning every old photograph, recording hours of interviews, and building some kind of complete family history from scratch. That is not what this is.
              </p>
              <p>
                The reason most families never start is because the task feels enormous. So they wait. They wait until they have more time, more energy, more photos organised. And then one day they realise they waited too long, because the person who knew the story is gone and the details went with them.
              </p>
              <p>
                The truth is much simpler. You do not need to do everything. You just need to start doing something.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Five ways to <Accent tone="pink">start today.</Accent>
              </>
            }
          >
            <Steps>
              <Step number="01" title="Pick the memory you are most afraid of losing.">
                <p>Not the prettiest photo or the most dramatic story. The one that lives in someone&apos;s head right now and would disappear if they did. That is your starting point.</p>
              </Step>

              <Step number="02" title="Write three sentences about it.">
                <p>Who was there. What happened. Why it mattered. You are not writing a novel. You are leaving a note for the people who come after you. Three sentences is more than most families ever write down.</p>
              </Step>

              <Step number="03" title="Ask someone to tell you a story.">
                <p>Call your mum. Visit your grandad. Ask them about a memory they think about often. Do not record it formally. Just listen, and write it down afterwards while it is still fresh. People speak more naturally when they do not know they are being preserved.</p>
              </Step>

              <Step number="04" title="Add context to one photo.">
                <p>Pick any photo on your phone. Write who is in it, where it was taken, and what was happening in your life at the time. That is the difference between an image and a memory.</p>
              </Step>

              <Step number="05" title="Put it somewhere that lasts.">
                <p>Not a notes app. Not a text message. Not a Google Doc that nobody will ever open again. Put it somewhere intentional, structured, and private. Somewhere your family can find it in ten years without having to search through folders.</p>
              </Step>
            </Steps>
          </GuideSection>

          <PullQuote>
            You do not need a perfect system.{' '}
            <Accent tone="blue">You just need to start before the stories are gone.</Accent>
          </PullQuote>

          <Prose>
            <p>
              A family library is not built in a weekend. It is built one memory at a time, over months and years. The important thing is that you begin. Because every memory you capture today is one your grandchildren will not have to guess about.
            </p>
          </Prose>
          <div style={{ marginTop: 'clamp(64px, 8vw, 104px)' }}>
            <AuthorBox updated="22 May 2026" />
          </div>
        </GuideArticle>

        <GuideCta
          title={
            <>
              One memory today.
              <br />
              <Accent tone="pink">A life preserved.</Accent>
            </>
          }
        >
          It takes two minutes to start.
        </GuideCta>
      </SiteShell>
    </>
  );
}
