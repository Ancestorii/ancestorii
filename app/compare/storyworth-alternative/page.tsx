import Link from 'next/link';
import type { Metadata } from 'next';
import { CalendarX2, ListChecks, MapPin, UserRound } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { AuthorBox } from '@/components/site/seo/SeoBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { Accent } from '@/components/site/SiteBits';
import site from '@/components/site/site.module.css';
import {
  ArticleCta,
  ArticleHero,
  ArticleSection,
  CompareTable,
  FaqBlock,
  QuoteBlock,
  ReasonCards,
  TableNote,
} from '@/components/site/seo-articles/ArticleBits';

const SITE = 'https://www.ancestorii.com';

export const metadata: Metadata = {
  title: 'The Best Storyworth Alternative for 2026',
  description:
    'Looking for a Storyworth alternative? See how Ancestorii compares: a living family library with a private space, a public story feed, and printed Memory Books you design yourself. Built in the UK, delivering to 20 countries.',
  alternates: { canonical: `${SITE}/compare/storyworth-alternative` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'The Best Storyworth Alternative | Ancestorii',
    description:
      'A living family library instead of a one year prompt service. See how Ancestorii compares to Storyworth.',
    url: `${SITE}/compare/storyworth-alternative`,
    siteName: 'Ancestorii',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Ancestorii, a Storyworth alternative' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Best Storyworth Alternative | Ancestorii',
    description: 'A living family library instead of a one year prompt service.',
    images: ['/og-default.jpg'],
    creator: '@ancestorii',
  },
};

const FAQ = [
  {
    q: 'What is the best alternative to Storyworth?',
    a: 'It depends on what you want. If you want more than a single book, Ancestorii is the strongest alternative. Storyworth sends one storyteller weekly email prompts for a year and compiles the replies into a hardcover. Ancestorii is a living family library with a private space for your family and a public story feed, plus printed Memory Books, Canvas Prints, and Acrylic Prints you design yourself.',
  },
  {
    q: 'Is there a Storyworth alternative in the UK?',
    a: 'Yes. Ancestorii is built in the UK, charges in pounds, euros or dollars, and delivers its prints to 20 countries, including the UK. Storyworth is US based, and as of October 2026 its UK plans start at £49. Ancestorii has no prompt schedule: you write and record freely at your own pace, and send a family member a question only when you want one.',
  },
  {
    q: 'How is Ancestorii different from Storyworth?',
    a: 'Storyworth is a book service built around one storyteller and one year. Ancestorii is a permanent digital library the whole family can add to, with timelines, albums, stories, and voice recordings that keep growing. You can turn any of it into physical heirlooms whenever you want, and you design every page yourself rather than letting it auto compile.',
  },
  {
    q: 'Is Ancestorii cheaper than Storyworth?',
    a: 'Ancestorii has a free forever plan, so you can build a family library at no cost and only pay if you choose to print something or upgrade. As of October 2026, Storyworth\'s UK plans start at £49 for a year of weekly questions and one hardcover book. The two are priced around different ideas, so the better question is whether you want one book or a library that lasts.',
  },
  {
    q: 'Can the whole family contribute, not just one person?',
    a: 'Yes. Ancestorii is built for family collaboration. You invite members into your private library and everyone can add stories, upload photos, and help build the archive together. Storyworth is built around one storyteller per subscription.',
  },
  {
    q: 'Does my content disappear after the book is printed?',
    a: 'No. With Storyworth, the plan ends with the book unless you renew for another year. With Ancestorii the library is the core of the product and keeps growing after any book is printed. You can create more heirlooms from it at any point in the future.',
  },
];

const REASONS = [
  {
    title: 'It is built around one storyteller.',
    text: 'Storyworth works beautifully for a single person writing to prompts. Each subscription covers one storyteller and one book, and collaborative books need a higher plan.',
    Icon: UserRound,
  },
  {
    title: 'It ends.',
    text: 'After a year, the plan ends with the book unless you renew for another year. There is no living library that keeps growing as life carries on.',
    Icon: CalendarX2,
  },
  {
    title: 'It runs on weekly prompts.',
    text: 'Some people love them. Others find that a question every week produces tidy answers rather than the stories they actually wanted to tell.',
    Icon: ListChecks,
  },
  {
    title: 'It is built for the US.',
    text: 'Shipping is included only within the US. Elsewhere it costs extra, and some countries collect customs or import fees from the recipient on delivery.',
    Icon: MapPin,
  },
];

const FEATURES = [
  ['Core concept', 'Living library + public stories + heirlooms', 'Weekly prompts → one printed book'],
  ['Who contributes', 'The whole family', 'One storyteller per subscription'],
  ['Family app on your phone', 'Yes, free on iPhone and Android', 'No app: email, website or phone'],
  ['Continues after the book', 'Yes, the library keeps growing', 'Only if you renew for another year'],
  ['Prompt system', 'Optional questions you send when you like', '500+ questions or your own, weekly by text or email'],
  ['Private family space', 'Yes, invite only', 'No'],
  ['Public story feed', 'Yes, Our Stories', 'No'],
  ['Voice recordings', 'Yes, kept in the library', 'Limited'],
  ['Book design control', 'You design every page', 'Auto compiled'],
  ['Canvas and acrylic prints', 'Yes', 'No'],
  ['Free plan', 'Yes, free forever', 'No'],
  ['Built in / pricing', 'United Kingdom; pounds, euros or dollars', 'United States; UK plans from £49'],
  ['Delivery', 'To 20 countries, from £4.99', 'Free US, extra internationally'],
];

export default function StoryworthAlternativePage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org', '@type': 'WebPage',
          name: 'The best Storyworth alternative',
          description: 'How Ancestorii compares to Storyworth as a way to preserve family stories.',
          url: `${SITE}/compare/storyworth-alternative`,
          isPartOf: { '@id': `${SITE}/#website` },
        }}
      />

      <JsonLd
        data={{
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'Compare', item: `${SITE}/compare` },
            { '@type': 'ListItem', position: 3, name: 'Storyworth alternative', item: `${SITE}/compare/storyworth-alternative` },
          ],
        }}
      />

      <JsonLd
        data={{
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: FAQ.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        }}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[
            { href: '/', label: 'Home' },
            { href: '/compare', label: 'Compare' },
            { label: 'Storyworth alternative' },
          ]}
          size="md"
          title={
            <>
              A Storyworth alternative <Accent>that does not end with the book.</Accent>
            </>
          }
          intro={[
            'Storyworth helped make family storytelling mainstream, and it does one thing genuinely well. It sends a weekly prompt to one person for a year, then turns their answers into a hardcover book. If that is exactly what you want, it is a lovely gift.',
            'But many families want something the book model cannot give them. A space the whole family can add to. Something that keeps going after the twelve months are up. Stories in their own words rather than answers to set prompts. That is the gap Ancestorii was built to fill.',
            'There is also a free Ancestorii app for your phone, so the whole family can add photos, memories, and voices from anywhere. It is on iPhone and Android.',
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        {/* Why look */}
        <ArticleSection
          id="the-honest-version"
          layout="wide"
          kicker={"The honest version"}
          dot="var(--c1)"
          title={
            <>
              Why people look <Accent tone="blue">for an alternative.</Accent>
            </>
          }
        >
          <ReasonCards items={REASONS} />
        </ArticleSection>

        <QuoteBlock>
          Storyworth gives a family one book.{' '}
          <Accent tone="blue">Ancestorii gives them a library that keeps growing.</Accent>
        </QuoteBlock>

        {/* Table */}
        <ArticleSection
          id="side-by-side"
          layout="wide"
          kicker={"Side by side"}
          title={
            <>
              Ancestorii vs <Accent tone="pink">Storyworth.</Accent>
            </>
          }
        >
          <CompareTable
            head={['Feature', 'Ancestorii', 'Storyworth']}
            rows={FEATURES}
            highlight={1}
            size="mid"
            labelledBy="side-by-side-title"
          />
          <TableNote>
            Storyworth details last checked on its own website on 17 October 2026. Want the full picture?{' '}
            <Link href="/compare" className={site.textLink}>
              Compare Ancestorii, Storyworth, and Remento side by side.
            </Link>
          </TableNote>
        </ArticleSection>

        {/* FAQ */}
        <ArticleSection
          id="questions"
          kicker={"Questions"}
          dot="var(--c3)"
          title={
            <>
              Things people <Accent tone="blue">ask us.</Accent>
            </>
          }
        >
          <FaqBlock items={FAQ} variant="open" />
        </ArticleSection>

        <ArticleSection>
          <div className={site.sectionBody}>
            <AuthorBox updated="17 October 2026" />
          </div>
        </ArticleSection>

        <ArticleCta
          title={
            <>
              More than a book.
              <br />
              A library that lasts.
            </>
          }
          lead={"Free to start. No credit card. No prompt schedule. Built in the UK."}
          primary={{ href: '/signup', label: 'Start For Free' }}
          note={"Free forever · No credit card · Takes 2 minutes"}
        />
      </SiteShell>
    </>
  );
}
