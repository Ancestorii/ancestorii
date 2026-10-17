import type { Metadata } from 'next';
import SiteShell from '@/components/site/SiteShell';
import { Accent, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox } from '@/components/site/seo/SeoBits';
import { FOUNDER } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { Compare, CompareRow, GuideFigure } from '../_components/GuideBlocks';

export const metadata: Metadata = {
  title: 'What to Do with Old Family Photos',
  description:
    'A practical guide on how to preserve old family photos by adding context, stories, and meaning so each image becomes part of a living family library.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides/what-to-do-with-old-family-photos',
  },
};

export default function OldFamilyPhotosPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org', '@type': 'Article',
          headline: 'What to do with old family photos',
          description: 'A practical guide on how to preserve old family photos by adding context, stories, and meaning.',
          author: FOUNDER,
          publisher: { '@type': 'Organization', name: 'Ancestorii', logo: { '@type': 'ImageObject', url: 'https://www.ancestorii.com/logo.png' } },
          mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.ancestorii.com/guides/what-to-do-with-old-family-photos' },
          datePublished: '2026-02-10', dateModified: '2026-05-22',
        }}
      />

      <JsonLd
        data={{
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ancestorii.com/' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://www.ancestorii.com/guides' },
            { '@type': 'ListItem', position: 3, name: 'What to Do with Old Family Photos', item: 'https://www.ancestorii.com/guides/what-to-do-with-old-family-photos' },
          ],
        }}
      />

      <SiteShell>
        <GuideArticle
          crumb="What to Do with Old Family Photos"
          title={
            <>
              What to do with{' '}
              <br />
              <Accent>old family photos.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              Every family has them. A shoebox in the loft. A drawer that does not close properly because it is stuffed with prints. A folder on a hard drive with three thousand images that nobody has opened since 2016. Hundreds of photos, maybe thousands, and most of them mean absolutely nothing to anyone who was not there when they were taken.
            </Lead>
            <p>
              That is the problem. Not that the photos are lost, but that the meaning behind them is. The names fade. The dates blur. The stories that made those photos worth taking in the first place live in someone&apos;s memory and nowhere else. And memories are not permanent.
            </p>
          </Prose>

          <PullQuote>
            The photo survives.{' '}
            <Accent tone="blue">The story behind it usually does not.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                Scanning is not <Accent tone="pink">preserving.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Most advice about old photos starts and ends with scanning. Digitise them. Back them up. Put them in the cloud. And yes, that protects the image from physical damage. But a scanned photo with no context is just a higher resolution mystery.
              </p>
              <p>
                Who are these people? Where was this taken? What year? Why did someone keep this specific photo out of all the ones they could have kept? Those answers are the difference between an image and a memory. And those answers live in people, not in files.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What actually <Accent tone="pink">helps.</Accent>
              </>
            }
          >
            <Compare labels={['What most people do', 'What actually preserves them']}>
              <CompareRow left="Scan everything and dump it in a folder" right="Pick ten photos that matter and add context to each one" />
              <CompareRow left="Organise by date or filename" right="Organise by person, event, or chapter of life" />
              <CompareRow left="Keep them in a cloud drive nobody opens" right="Put them somewhere your family actually wants to return to" />
              <CompareRow left="Wait until you have time to do them all" right="Start with one photo this week and add to it over time" />
              <CompareRow left="Assume someone else will remember the details" right="Ask now, while the person who knows is still here to tell you" />
            </Compare>
          </GuideSection>

          <GuideSection
            title={
              <>
                Start with <Accent tone="pink">one photo.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Pick up the photo that catches your eye first. Not the best one. Not the oldest one. The one that makes you stop and think. The one where you can almost hear the conversation that was happening when it was taken.
              </p>
              <p>
                Write down who is in it. Write down where it was taken if you know, and roughly when. Then write one sentence about why this photo matters. That is it. That is a preserved memory. You have done more than most families ever do.
              </p>
              <p>
                If someone in your family can tell you more about it, ask them. Sit with them and show them the photo. Do not ask &quot;do you remember this?&quot; Ask &quot;what was happening here?&quot; That second question opens the door to stories you did not know existed.
              </p>
              <p>
                Then do another one next week. And another the week after that. In a year you will have fifty photos that actually mean something, and that is worth more than three thousand unnamed files in a cloud folder that nobody ever opens.
              </p>
            </Prose>
          </GuideSection>

          {/* Alison's photo is only 651px wide, so its frame is never wider than that
              (it would turn soft); centred in the reading column. */}
          <div style={{ maxWidth: 651, marginInline: 'auto' }}>
            <GuideFigure
              src="/Testimonial2.png"
              alt="Alison and her dad holding his printed Ancestorii Memory Book"
              label="Alison · Nevada, US"
              color="var(--c1)"
              position="50% 30%"
            />
          </div>

          <PullQuote>
            A photo with three sentences of context{' '}
            <Accent tone="blue">is worth more than a thousand without.</Accent>
          </PullQuote>
          <div style={{ marginTop: 'clamp(64px, 8vw, 104px)' }}>
            <AuthorBox updated="22 May 2026" />
          </div>
        </GuideArticle>

        <GuideCta
          title={
            <>
              Give your photos
              <br />
              <Accent tone="pink">their story back.</Accent>
            </>
          }
        >
          Start with one. Add the story. Let it grow.
        </GuideCta>
      </SiteShell>
    </>
  );
}
