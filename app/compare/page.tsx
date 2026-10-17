import Link from 'next/link';
import type { Metadata } from 'next';
import SiteShell from '@/components/site/SiteShell';
import JsonLd from '@/components/site/seo/JsonLd';
import { Accent } from '@/components/site/SiteBits';
import {
  ArticleCta,
  ArticleHero,
  ArticleSection,
  CompareTable,
  FaqBlock,
  PlatformCard,
  PlatformList,
  QuoteBlock,
  TableNote,
} from '@/components/site/seo-articles/ArticleBits';
import articles from '@/components/site/seo-articles/articles.module.css';
import site from '@/components/site/site.module.css';

export const metadata: Metadata = {
  title: { absolute: 'Ancestorii vs StoryWorth vs Remento: Which Family Memory Platform Is Right for You?' },
  description: 'An honest comparison of Ancestorii, StoryWorth, and Remento. See how a living family library compares to prompt-based book services — and decide which approach fits your family.',
  alternates: { canonical: 'https://www.ancestorii.com/compare' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Ancestorii vs StoryWorth vs Remento | Honest Comparison',
    description: 'Compare three family memory platforms side by side.',
    url: 'https://www.ancestorii.com/compare',
    siteName: 'Ancestorii',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Ancestorii vs StoryWorth vs Remento comparison' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Ancestorii vs StoryWorth vs Remento', description: 'An honest comparison of three family memory platforms.', images: ['/og-default.jpg'] },
};

const FEATURES = [
  ['Core concept', 'Living library + public stories + physical heirlooms', 'Weekly prompts → printed book', 'Voice recordings → AI written book'],
  ['Public sharing', 'Yes: Our Stories feed', 'No', 'No'],
  ['Private family space', 'Yes: My Family, invite only', 'No', 'No'],
  ['Digital library', 'Timelines, albums, stories, profiles', 'No', 'No'],
  ['Printed book', 'Memory Book: you design every page', 'Auto compiled hardcover', 'Auto compiled with QR codes'],
  ['Canvas prints', 'Yes', 'No', 'No'],
  ['Acrylic prints', 'Yes', 'No', 'No'],
  ['Voice recordings', 'Yes: stored in library', 'Yes: phone recording', 'Yes: voice and video'],
  ['Who contributes', 'Whole family', 'One storyteller', 'One storyteller'],
  ['Family app on your phone', 'Yes: free on iPhone and Android', 'No app: email, website or phone', 'No app: a link by email or text'],
  ['Prompt system', 'Optional questions you send when you like', '500+ email prompts', 'Weekly prompts'],
  ['AI rewrites your words', 'No: optional AI writing help suggests, never rewrites', 'No', 'Yes'],
  ['Continues after the book', 'Yes: library keeps growing', 'Only if you renew', 'Only if you renew'],
  ['Feed order and follower counts', 'Newest first by default, no follower counts', 'N/A', 'N/A'],
  ['Religion and politics', 'Not allowed on public feed', 'N/A', 'N/A'],
  ['Delivery', 'To 20 countries, from £4.99', 'Free US, extra internationally', 'Free US, extra internationally'],
  ['Built in', 'United Kingdom', 'United States', 'United States'],
];

const QUESTIONS = [
  {
    q: 'What is the main difference between Ancestorii and StoryWorth?',
    a: 'StoryWorth is a book service. One storyteller writes to prompts for a year, and those responses become a book. Ancestorii is a living library with two layers — a public feed for sharing stories with the world, and a private space only your family can see. You can also print Memory Books, Canvas Prints, and Acrylic Prints from your library whenever you want.',
  },
  {
    q: 'What is the main difference between Ancestorii and Remento?',
    a: 'Remento records your voice and uses AI to rewrite it into a polished book. Ancestorii never rewrites your words. Its optional writing help, Story Assistance, can suggest openings and captions, and you choose what to keep. Your words stay your words. And instead of a year of recordings and a single book, your library keeps growing and you can create physical heirlooms from it at any point.',
  },
  {
    q: 'Which platform gives you the most control over the book?',
    a: 'Ancestorii. StoryWorth and Remento auto compile books from your content. Ancestorii gives you a visual editor where you design every spread, choose layouts, arrange photos, and control exactly how the finished book looks.',
  },
  {
    q: 'Do I need to print a book to use Ancestorii?',
    a: 'No. The digital library is the core of the platform. Plenty of families use Ancestorii purely as a private space to capture timelines, albums, stories, and voice recordings without ever printing a physical product.',
  },
  {
    q: 'Can my whole family contribute on Ancestorii?',
    a: 'Yes. Ancestorii is built for family collaboration. You invite members into your private library and everyone can add stories, upload photos, fill in names, and help build the archive together. StoryWorth and Remento are built around one storyteller per subscription.',
  },
  {
    q: 'Is Ancestorii a good alternative to StoryWorth in the UK?',
    a: 'Yes. Ancestorii is built in the UK, charges in pounds, euros or dollars, and delivers its prints to 20 countries, including the UK. StoryWorth is US based, and as of October\u00a02026 its UK plans start at £49. Ancestorii has no prompt schedule: you write and record freely at your own pace, and send a family member a question only when you want one.',
  },
];

// The other comparison pages, each summed up from its own description.
const MORE_COMPARISONS = [
  { href: '/compare/storyworth-alternative', label: 'StoryWorth alternative', text: 'A year of weekly questions and one book, or a family library that keeps growing.' },
  { href: '/compare/remento-alternative', label: 'Remento alternative', text: "One storyteller's recordings turned into a book, or a private library the whole family adds to." },
  { href: '/compare/best-family-memory-apps', label: 'Best family memory apps', text: 'Eight apps for family photos, voices and stories, compared on price, free plans and printing.' },
  { href: '/compare/ancestorii-vs-ancestry', label: 'Ancestorii vs Ancestry', text: "Researching records and a family tree, or keeping your family's own photos, voices and stories." },
  { href: '/compare/ancestorii-vs-google-photos', label: 'Ancestorii vs Google Photos', text: 'Backing up every photo, or keeping the stories, dates and voices behind the ones that matter.' },
  { href: '/compare/ancestorii-vs-icloud-shared-albums', label: 'Ancestorii vs iCloud Shared Albums', text: "How Apple's shared albums compare for keeping family photos." },
  { href: '/compare/ancestorii-vs-whatsapp', label: 'Ancestorii vs a WhatsApp family group', text: 'Where to keep family memories so they do not get buried in the chat.' },
  { href: '/compare/ancestorii-vs-facebook-groups', label: 'Ancestorii vs a private Facebook group', text: 'A free group funded by ads, or an ad-free private family library.' },
  { href: '/compare/ancestorii-vs-tinybeans', label: 'Ancestorii vs Tinybeans', text: "Sharing a child's photos with family, or keeping every generation's photos, voices and stories." },
];

export default function ComparePage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org', '@type': 'WebPage',
          name: 'Ancestorii vs StoryWorth vs Remento',
          description: 'An honest, side-by-side comparison of three different approaches to preserving family stories.',
          url: 'https://www.ancestorii.com/compare',
          isPartOf: { '@type': 'WebSite', name: 'Ancestorii' },
        }}
      />

      {/* Built from the questions the page shows, so the two can never differ. */}
      <JsonLd
        data={{
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: QUESTIONS.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        }}
      />

      <SiteShell>
        <ArticleHero
          eyebrow={"Compare"}
          title={
            <>
              Three platforms.
              <br />
              <Accent>Three different ideas.</Accent>
            </>
          }
          intro={[
            'StoryWorth, Remento, and Ancestorii all help families preserve memories. But they are built around fundamentally different ideas about what preservation means. One sends you prompts. One records your voice. One builds a library your whole family can grow together.',
            'This page is an honest breakdown. We will tell you what each platform does well, where each one falls short, and which one makes sense depending on what your family actually needs.',
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        {/* Each platform */}
        <ArticleSection
          id="the-platforms"
          layout="wide"
          kicker={"The platforms"}
          dot="var(--c1)"
          title={
            <>
              What each one <Accent tone="blue">actually does.</Accent>
            </>
          }
        >
          <PlatformList>
            <PlatformCard
              name="StoryWorth"
              tone="blue"
              oneLiner="A weekly email prompt that builds a book over twelve months."
              strengths={[
                'One email per week with a thoughtful question. The storyteller replies, photos are attached, and after a year everything is compiled into a hardcover book.',
                'Over 500 prompts to choose from. The experience is hands off for the gift giver and structured for the writer.',
                'Pioneered this category. Over a million books printed since 2013. They deserve credit for making family storytelling mainstream.',
                'Works beautifully for a single storyteller who enjoys writing to a schedule and is comfortable with email.',
              ]}
              bestFor="Gifting one person a structured writing experience that ends with a single book. Minimal decisions, minimal effort, proven results."
            />

            <PlatformCard
              name="Remento"
              tone="orange"
              oneLiner="Speak instead of write. AI turns your voice into a polished book."
              strengths={[
                'The storyteller records voice or video responses to prompts. AI transcribes them into polished written stories.',
                'Removes the writing barrier completely. For families where the person with the stories will talk but will not type, this solves a real problem.',
                'The printed book includes QR codes that play the original recordings. So you get the written version and the voice.',
                'The founder built Remento after his mother was diagnosed with cancer. That personal motivation shows in every detail of the product.',
              ]}
              bestFor="Families where the storyteller prefers speaking over writing. Especially powerful when preserving someone's voice matters as much as their words."
            />

            <PlatformCard
              name="Ancestorii"
              tone="pink"
              featured
              oneLiner="A living library with two layers, built for the whole family."
              strengths={[
                'Two distinct spaces. Our Stories is public — share memories with the world, newest first by default, no follower counts, just real stories from real families. My Family is private — only invited family members can see what is inside.',
                'Not built around one storyteller or one year. Your whole family contributes. Timelines, albums, stories, and voice recordings grow together over time.',
                'My Heirlooms lets you turn your library into physical keepsakes. Memory Books designed page by page in a visual editor. Canvas Prints. Acrylic Prints. Things you hold, frame, and pass down.',
                'No prompt schedule. Optional AI writing help, Story Assistance, can suggest words but never rewrites yours. You write what you want, when you want, in your own voice.',
                'There is a free Ancestorii app for your phone, so the whole family can add photos, memories, and voices from anywhere. It is on iPhone and Android.',
                'Built in the UK. Delivery to 20 countries on all physical products, except the Heritage canvas (UK only).',
              ]}
              bestFor="Families who want more than a book. A private digital library that grows with every generation, a public space to share stories with the world, and physical heirlooms whenever you are ready."
            />
          </PlatformList>
        </ArticleSection>

        <QuoteBlock>
          Some platforms build a book.{' '}
          <Accent tone="blue">Ancestorii builds a library your family keeps returning to.</Accent>
        </QuoteBlock>

        {/* Table */}
        <ArticleSection
          id="side-by-side"
          layout="wide"
          kicker={"Side by side"}
          title={
            <>
              Feature <Accent tone="pink">comparison.</Accent>
            </>
          }
        >
          <CompareTable
            head={['Feature', 'Ancestorii', 'StoryWorth', 'Remento']}
            rows={FEATURES}
            highlight={1}
            size="wide"
            labelledBy="side-by-side-title"
          />
          <TableNote>Last checked against StoryWorth&apos;s and Remento&apos;s own websites on 17&nbsp;October&nbsp;2026.</TableNote>
        </ArticleSection>

        {/* Common questions */}
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
          <FaqBlock items={QUESTIONS} variant="open" />
        </ArticleSection>

        {/* Every other comparison page, one card each */}
        <ArticleSection
          id="more-comparisons"
          layout="wide"
          kicker={"More comparisons"}
          dot="var(--c2)"
          title={
            <>
              Something <Accent tone="pink">else in mind?</Accent>
            </>
          }
        >
          <div className={site.grid3}>
            {MORE_COMPARISONS.map((item) => (
              <Link key={item.href} href={item.href} className={`${site.card} ${articles.linkCard}`}>
                <h3 className={site.cardTitle}>{item.label}</h3>
                <p className={site.cardText}>{item.text}</p>
                <span className={articles.linkArrow} aria-hidden="true">
                  <span className={articles.linkArrowTile}>→</span>
                </span>
              </Link>
            ))}
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
          lead={"Free to start. No credit card. No prompt schedule. No AI rewriting your words."}
          primary={{ href: '/signup', label: 'Start For Free' }}
          note={"Free forever · No credit card · Takes 2\u00a0minutes"}
        />
      </SiteShell>
    </>
  );
}
