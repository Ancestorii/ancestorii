import type { Metadata } from 'next';
import Script from 'next/script';
import SiteShell from '@/components/site/SiteShell';
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
} from '@/components/site/seo-articles/ArticleBits';

export const metadata: Metadata = {
  title: 'Ancestorii vs StoryWorth vs Remento: Which Family Memory Platform Is Right for You?',
  description: 'An honest comparison of Ancestorii, StoryWorth, and Remento. See how a living family library compares to prompt-based book services — and decide which approach fits your family.',
  alternates: { canonical: 'https://www.ancestorii.com/compare' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Ancestorii vs StoryWorth vs Remento | Honest Comparison',
    description: 'Compare the three leading family memory platforms side by side.',
    url: 'https://www.ancestorii.com/compare',
    siteName: 'Ancestorii',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Ancestorii vs StoryWorth vs Remento comparison' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Ancestorii vs StoryWorth vs Remento', description: 'An honest comparison of the three leading family memory platforms.', images: ['/og-default.jpg'] },
};

const FEATURES = [
  ['Core concept', 'Living library + public stories + physical heirlooms', 'Weekly prompts → printed book', 'Voice recordings → AI written book'],
  ['Public sharing', 'Yes — Our Stories feed', 'No', 'No'],
  ['Private family space', 'Yes — My Family, invite only', 'No', 'No'],
  ['Digital library', 'Timelines, albums, stories, profiles', 'No', 'No'],
  ['Printed book', 'Memory Book — you design every page', 'Auto compiled hardcover', 'Auto compiled with QR codes'],
  ['Canvas prints', 'Yes', 'No', 'No'],
  ['Acrylic prints', 'Yes', 'No', 'No'],
  ['Voice recordings', 'Yes — stored in library', 'Yes — phone recording', 'Yes — voice and video'],
  ['Who contributes', 'Whole family', 'One storyteller', 'One storyteller'],
  ['Family app on your phone', 'Yes, free on iPhone and Android', 'Storyteller app only', 'Storyteller app only'],
  ['Prompt system', 'No — write freely', '500+ email prompts', 'Weekly prompts'],
  ['AI rewrites your words', 'No', 'No', 'Yes'],
  ['Continues after the book', 'Yes — library keeps growing', 'No', 'No'],
  ['Algorithm or follower counts', 'No — stories shown in order', 'N/A', 'N/A'],
  ['Religion and politics', 'Not allowed on public feed', 'N/A', 'N/A'],
  ['Worldwide shipping', 'Ships worldwide', 'Free US, extra internationally', 'Free US, extra internationally'],
  ['Built in', 'United Kingdom', 'United States', 'United States'],
];

const QUESTIONS = [
  {
    q: 'What is the main difference between Ancestorii and StoryWorth?',
    a: 'StoryWorth is a book service. One storyteller writes to prompts for a year, and those responses become a book. Ancestorii is a living library with two layers — a public feed for sharing stories with the world, and a private space only your family can see. You can also print Memory Books, Canvas Prints, and Acrylic Prints from your library whenever you want.',
  },
  {
    q: 'What is the main difference between Ancestorii and Remento?',
    a: 'Remento records your voice and uses AI to rewrite it into a polished book. Ancestorii does not use AI to rewrite anything. Your words stay your words. And instead of ending with a single book, your library keeps growing and you can create physical heirlooms from it at any point.',
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
    a: 'Yes. Ancestorii is built in the UK, charges in pounds, and ships all physical products worldwide. StoryWorth is US based, charges in dollars, and its prompts lean American. Ancestorii does not use prompts at all — you write and record freely at your own pace.',
  },
];

export default function ComparePage() {
  return (
    <>
      <Script id="compare-webpage-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebPage',
          name: 'Ancestorii vs StoryWorth vs Remento',
          description: 'An honest, side-by-side comparison of three different approaches to preserving family stories.',
          url: 'https://www.ancestorii.com/compare',
          isPartOf: { '@type': 'WebSite', name: 'Ancestorii' },
        })}
      </Script>

      <Script id="compare-faq-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'What is the difference between Ancestorii and StoryWorth?', acceptedAnswer: { '@type': 'Answer', text: 'StoryWorth sends weekly email prompts to one storyteller over a year, then compiles responses into a printed book. Ancestorii is a living digital library with two layers — a public story feed and a private family space — plus printed Memory Books, Canvas Prints, and Acrylic Prints.' } },
            { '@type': 'Question', name: 'What is the difference between Ancestorii and Remento?', acceptedAnswer: { '@type': 'Answer', text: 'Remento captures voice and video recordings and uses AI to transcribe them into a printed book. Ancestorii combines a persistent digital library with physical heirlooms and gives full creative control over every page of the Memory Book.' } },
            { '@type': 'Question', name: 'Which platform gives the most creative control over the book?', acceptedAnswer: { '@type': 'Answer', text: 'Ancestorii. Both StoryWorth and Remento auto-compile books. Ancestorii gives you a visual page editor where you design every spread yourself.' } },
            { '@type': 'Question', name: 'Is Ancestorii a good StoryWorth alternative in the UK?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Ancestorii is built in the UK and ships worldwide. StoryWorth is US-based and charges in dollars.' } },
            { '@type': 'Question', name: 'Do StoryWorth or Remento offer a digital library?', acceptedAnswer: { '@type': 'Answer', text: 'No. Both platforms end with a printed book. Ancestorii is a living library that continues to grow after any book is printed.' } },
          ],
        })}
      </Script>

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
                'Two distinct spaces. Our Stories is public — share memories with the world, no algorithms, no follower counts, just real stories from real families. My Family is private — only invited family members can see what is inside.',
                'Not built around one storyteller or one year. Your whole family contributes. Timelines, albums, stories, and voice recordings grow together over time.',
                'My Heirlooms lets you turn your library into physical keepsakes. Memory Books designed page by page in a visual editor. Canvas Prints. Acrylic Prints. Things you hold, frame, and pass down.',
                'No prompts. No AI rewriting your words. You write what you want, when you want, in your own voice.',
                'There is a free Ancestorii app for your phone, so the whole family can add photos, stories, and voices from anywhere. It is on iPhone and Android.',
                'Built in the UK. Worldwide delivery on all physical products.',
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
          <FaqBlock items={QUESTIONS} />
        </ArticleSection>

        <ArticleCta
          title={
            <>
              More than a book.
              <br />
              A library that lasts.
            </>
          }
          lead={"Free to start. No credit card. No prompts. No AI rewriting your words."}
          primary={{ href: '/signup', label: 'Start For Free' }}
          note={"Free forever · No credit card · Takes 2 minutes"}
        />
      </SiteShell>
    </>
  );
}
