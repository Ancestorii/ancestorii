import type { Metadata } from 'next';
import SiteShell from '@/components/site/SiteShell';
import { Accent, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox } from '@/components/site/seo/SeoBits';
import { FOUNDER } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { Compare, CompareRow } from '../_components/GuideBlocks';

export const metadata: Metadata = {
  title: 'Living Library vs Digital Vault | What Preserves Family Memories Best?',
  description:
    'What is the difference between a digital vault and a living library? Discover why structure, context, and connection matter when preserving family memories.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides/living-library-vs-digital-vault',
  },
};

export default function LivingLibraryVsVaultPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org', '@type': 'Article',
          headline: 'Living library vs digital vault',
          description: 'Understanding the difference between storing memories and helping them grow.',
          author: FOUNDER,
          publisher: { '@type': 'Organization', name: 'Ancestorii', logo: { '@type': 'ImageObject', url: 'https://www.ancestorii.com/logo.png' } },
          mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.ancestorii.com/guides/living-library-vs-digital-vault' },
          datePublished: '2026-02-17', dateModified: '2026-05-22',
        }}
      />

      <JsonLd
        data={{
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ancestorii.com/' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://www.ancestorii.com/guides' },
            { '@type': 'ListItem', position: 3, name: 'Living Library vs Digital Vault', item: 'https://www.ancestorii.com/guides/living-library-vs-digital-vault' },
          ],
        }}
      />

      <SiteShell>
        <GuideArticle
          crumb="Living Library vs Digital Vault"
          title={
            <>
              Living library vs{' '}
              <br />
              <Accent>digital vault.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              Both sound like they do the same thing. Both promise to keep your family&apos;s memories safe. But they work in completely different ways, and the difference matters more than most people realise.
            </Lead>
          </Prose>

          <GuideSection
            title={
              <>
                A vault <Accent tone="pink">holds.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                A digital vault is built for security. It takes your files, locks them away, and keeps them safe from damage, loss, or unauthorised access. That is its job and it does it well.
              </p>
              <p>
                But a vault does not care what is inside it. A photo of your grandmother has the same status as a tax return. A voice recording of your dad telling his favourite story sits next to a scanned utility bill. Everything is treated as data. Nothing is treated as meaning.
              </p>
              <p>
                You open a vault when you need to retrieve something specific. You do not open it to remember. You do not open it to feel something. You do not open it because your family wants to sit together and look through it on a Sunday afternoon.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                A library <Accent tone="pink">grows.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                A living library is built for connection. Every memory links to a person. Every person links to a timeline. Every timeline tells a story that your family can follow, add to, and return to over years.
              </p>
              <p>
                It is not static. Your mum adds a recipe she has been meaning to write down for years. Your brother uploads photos from a trip nobody else had copies of. Your cousin fills in a name that was on the tip of everyone&apos;s tongue but nobody could quite remember. The library grows because your family grows.
              </p>
              <p>
                You open a living library because you want to. Because something reminded you of a story and you want to read it again. Because your kids asked a question about their grandparents and the answer is right there, in the words of someone who was actually there.
              </p>
            </Prose>
          </GuideSection>

          <PullQuote>
            A vault protects your files.{' '}
            <Accent tone="blue">A&nbsp;library protects your story.</Accent>
          </PullQuote>

          <Compare labels={['Digital vault', 'Living library']}>
            <CompareRow left="Stores files in folders" right="Connects memories to people" />
            <CompareRow left="Organised by file type" right="Organised by meaning and relationships" />
            <CompareRow left="One person manages it" right="Your whole family contributes" />
            <CompareRow left="Opened when you need a file" right="Opened when you want to remember" />
            <CompareRow left="Stays the same once filled" right="Grows with every generation" />
            <CompareRow left="Treats everything as data" right="Treats everything as a story" />
          </Compare>

          <Prose>
            <p>
              If your goal is to keep files safe, a vault works. If your goal is to keep your family&apos;s story alive, readable, and growing, you need something different. You need a space that cares about what is inside it, not just that it is there.
            </p>
          </Prose>
          <div style={{ marginTop: 'clamp(64px, 8vw, 104px)' }}>
            <AuthorBox updated="22 May 2026" />
          </div>
        </GuideArticle>

        <GuideCta
          title={
            <>
              Give your family
              <br />
              <Accent tone="pink">more than a vault.</Accent>
            </>
          }
        >
          Build something your family actually wants to open.
        </GuideCta>
      </SiteShell>
    </>
  );
}
