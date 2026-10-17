import Link from 'next/link';
import type { Metadata } from 'next';
import SiteShell from '@/components/site/SiteShell';
import { Accent, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox } from '@/components/site/seo/SeoBits';
import { FOUNDER } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { GuideFigure, Step, Steps } from '../_components/GuideBlocks';

export const metadata: Metadata = {
  title: 'What to Write in a Memory Book',
  description:
    'A practical guide to what to write in a memory book, what to include on every page, and how to turn scattered memories into a keepsake your family will actually return to.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides/what-to-write-in-a-memory-book',
  },
};

export default function WhatToWriteInAMemoryBookPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org', '@type': 'Article',
          headline: 'What to write in a memory book',
          description: 'A practical guide to what to write in a memory book and what to include on every page.',
          author: FOUNDER,
          publisher: { '@type': 'Organization', name: 'Ancestorii', logo: { '@type': 'ImageObject', url: 'https://www.ancestorii.com/logo.png' } },
          mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.ancestorii.com/guides/what-to-write-in-a-memory-book' },
          datePublished: '2026-06-20', dateModified: '2026-06-20',
        }}
      />

      <JsonLd
        data={{
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ancestorii.com/' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://www.ancestorii.com/guides' },
            { '@type': 'ListItem', position: 3, name: 'What to Write in a Memory Book', item: 'https://www.ancestorii.com/guides/what-to-write-in-a-memory-book' },
          ],
        }}
      />

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'What to write in a memory book',
          description: 'Five things to include so a memory book becomes a keepsake your family returns to.',
          step: [
            { '@type': 'HowToStep', position: 1, name: 'Start with the story, not the photo', text: 'Write what was actually happening when the picture was taken. Who was there, what it felt like, and why the moment mattered.' },
            { '@type': 'HowToStep', position: 2, name: 'Add the small specific details', text: 'The name of the street, the song on the radio, the smell of the kitchen. Specifics are what make a memory feel alive years later.' },
            { '@type': 'HowToStep', position: 3, name: 'Write in your own voice', text: 'Do not write like a textbook. Write the way you would tell it out loud to someone you love, in your own words.' },
            { '@type': 'HowToStep', position: 4, name: 'Include the people, not just the events', text: 'Describe what someone was like, not only what they did. A turn of phrase, a habit, a kindness. That is what people forget first.' },
            { '@type': 'HowToStep', position: 5, name: 'End each page with why it is here', text: 'A single line on why this memory earned its place tells the next generation what mattered to you, and why.' },
          ],
        }}
      />

      <SiteShell>
        <GuideArticle
          guideLink
          crumb="What to Write in a Memory Book"
          title={
            <>
              What to write in{' '}
              <br />
              <Accent>a memory book.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              A blank page is intimidating. You have the photographs, you have the memories, and yet the moment you sit down to write something it all feels either too small to bother with or too big to begin. So the book stays empty, and the stories stay in your head.
            </Lead>
            <p>
              The truth is that a memory book is not an essay. It is a series of small, honest captures. You do not need to be a writer. You need to write down what you would say if you were sitting beside someone, turning the pages together.
            </p>
          </Prose>

          <GuideFigure
            src="/testimonial1.png"
            alt="Looking through a printed Ancestorii Memory Book together"
            label="Nicole · Nampa, US"
            color="var(--c3)"
            position="50% 60%"
          />

          <PullQuote>
            A photo shows what happened.{' '}
            <Accent tone="blue">The words tell us why it mattered.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                What makes one <Accent tone="pink">worth keeping.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                The memory books families treasure are never the ones with the most pages. They are the ones where you can hear the person who made them. A grandmother’s dry humour. A father noting, almost in passing, how proud he was. That is the difference between a photo album and an heirloom.
              </p>
              <p>
                You get there not by writing more, but by writing truer. A few real sentences on a page will outlast a paragraph of polished nothing.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Five things to <Accent tone="pink">put on the page.</Accent>
              </>
            }
          >
            <Steps>
              <Step number="01" title="Start with the story, not the photo.">
                <p>The image is the prompt, not the point. Write what was actually happening when it was taken. Who was there, what you were laughing about, what you did not yet know was about to change.</p>
              </Step>
              <Step number="02" title="Add the small specific details.">
                <p>The name of the street. The song on the radio. The smell of the kitchen on a Sunday. Specifics are what make a memory feel alive when someone reads it forty years from now.</p>
              </Step>
              <Step number="03" title="Write in your own voice.">
                <p>Do not write like a museum caption. Write the way you would tell it out loud to someone you love. If you would say it with a laugh, write it with a laugh.</p>
              </Step>
              <Step number="04" title="Include the people, not just the events.">
                <p>Describe what someone was like, not only what they did. A turn of phrase they always used. A habit. A kindness nobody else saw. That is what people forget first, and miss most.</p>
              </Step>
              <Step number="05" title="End each page with why it is here.">
                <p>One line on why this memory earned its place. It is the most important sentence on the page, because it tells the people who come after you exactly what mattered to you, and why.</p>
              </Step>
            </Steps>
          </GuideSection>

          <PullQuote>
            You are not making a book.{' '}
            <Accent tone="blue">You are leaving a voice behind.</Accent>
          </PullQuote>

          <Prose>
            <p>
              With Ancestorii, you do not write into a void and hope it comes together. Your memories already live in your family library as stories, photos, and voice recordings. When you are ready, you arrange them into a Memory Book, designing each page yourself and printing a keepsake your family can hold. The words you write today become the pages they keep.
            </p>
            <p>
              If you would like more help capturing the raw material first, our guide on{' '}
              <Link href="/guides/how-to-preserve-family-memories">how to preserve family memories</Link>{' '}
              is a good place to begin.
            </p>
          </Prose>
          <div style={{ marginTop: 'clamp(64px, 8vw, 104px)' }}>
            <AuthorBox updated="20 June 2026" />
          </div>
        </GuideArticle>

        <GuideCta
          title={
            <>
              Fill the first page.
              <br />
              <Accent tone="pink">The book follows.</Accent>
            </>
          }
        >
          It takes two minutes to start.
        </GuideCta>
      </SiteShell>
    </>
  );
}
