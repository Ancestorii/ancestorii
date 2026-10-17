import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  BookOpen,
  Clock,
  Coffee,
  Fingerprint,
  FolderOpen,
  HeartHandshake,
  MapPin,
  Mic,
  Milestone,
  PenLine,
  Printer,
  Quote,
  Sparkles,
  Speech,
  Users,
} from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import {
  GuideFigure,
  Point,
  Points,
  QuestionSet,
  QuestionSets,
  Step,
  Steps,
  Tip,
  Tips,
} from '../_components/GuideBlocks';

const PATH = '/guides/how-to-write-a-life-story';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Write a Life Story or Life Story Book';
const HEADLINE = 'How to write a life story, for a parent or yourself';
const DESCRIPTION =
  'Gather the dates, collect stories in their own words, sort them into chapters and add photos: how to write a life story or life story book, step by step.';
const PUBLISHED = '2026-10-17';
const CRUMB = 'How to Write a Life Story';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to write a life story' }],
    locale: 'en_GB',
    type: 'article',
    publishedTime: PUBLISHED,
    modifiedTime: PUBLISHED,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | Ancestorii`,
    description: DESCRIPTION,
    images: ['/og-default.jpg'],
  },
};

// The same plain-text questions and answers feed the FAQ on the page and the FAQPage schema.
const FAQ_PLAIN = [
  {
    q: 'How do I start writing someone’s life story?',
    a: 'Start with a one-page timeline: when and where they were born, schools, moves, jobs, marriages and children. Then pick one chapter, such as their childhood, and record a conversation about it. As Dementia UK points out, you don’t have to start at the beginning or work in order, so begin with whatever matters most.',
  },
  {
    q: 'What is a life story book for someone with dementia?',
    a: 'A record of the person’s life, in photos and short, clear text, that helps them reminisce and helps carers understand who they are. Dementia UK suggests one font and size, no more than two contrasting colours and laminated pages or a ring binder. Alzheimer’s Society’s free ‘This is me’ leaflet records a person’s background, preferences and routines for professional carers.',
  },
  {
    q: 'What questions should I ask for a life story?',
    a: 'Open ones, which the Oral History Society describes as questions that need more than a yes or no answer. Dementia UK suggests opening a topic and letting the person lead, for example ‘Can you tell me about where you grew up?’, rather than firing lots of specific questions. Then follow the thread: who was there, what happened next, how it felt.',
  },
  {
    q: 'Should a life story be written in the first or third person?',
    a: 'If the person is telling their own story, write it in the first person, in their words. If you are writing about someone, use the third person and quote them often, so their voice comes through. Either works, as long as you keep to one.',
  },
  {
    q: 'How do I turn a life story into a printed book?',
    a: 'Choose your strongest photos, write a short caption or paragraph for each, group them into chapters and lay them out a spread at a time. In Ancestorii, a Memory Book is an A4 landscape hardcover of 24, 36 or 48 printed pages, from £44.99 plus delivery, and you can download a free PDF of the design before you order.',
  },
];

const KEY_FACTS = [
  <>
    Dementia UK describes a life story as <strong>a record of someone’s life</strong> that can help a
    person with dementia reminisce, reflect on what matters to them now and communicate it to others.
  </>,
  <>
    For a life story book for someone with dementia, Dementia UK suggests <strong>one font and size</strong>{' '}
    and <strong>no more than two contrasting colours</strong>.
  </>,
  <>
    Dementia and Alzheimer’s disease were the <strong>leading cause of death</strong> in England and Wales
    in 2025: <strong>72,272 deaths</strong>, 12.7% of the total (ONS).
  </>,
  <>
    Certificates for England and Wales cost <strong>£12.50</strong> from the General Register Office and
    are sent <strong>4&nbsp;days</strong> after you apply, if you have the GRO index reference.
  </>,
  <>
    <strong>FreeBMD</strong> indexes births, marriages and deaths in England and Wales from{' '}
    <strong>1837 to 1999</strong>, free, though not every year is transcribed yet.
  </>,
];

// Seven chapters that suit most lives, each opened with one question.
const CHAPTERS = [
  'Where it began: where were you born, and what was home like?',
  'Growing up: who were your friends, and what did you get up to?',
  'Work: what was your first job, and which job mattered most?',
  'Love: how did you meet, and when did you know?',
  'Family: what changed when the children came along?',
  'Later years: what have you enjoyed most since?',
  'What they believe: what do you want the next generation to know?',
];

const SOURCES: Source[] = [
  {
    publisher: 'Dementia UK',
    title: 'Creating a life story for a person with dementia (leaflet DUK16)',
    href: 'https://dementiauk.org/wp-content/uploads/dementia-uk-life-story-leaflet.pdf',
    date: 'January\u00a02025',
  },
  {
    publisher: 'Office for National Statistics',
    title: 'Deaths registered in England and Wales: 2025',
    href: 'https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/deaths/bulletins/deathsregistrationsummarytables/2025',
    date: '25\u00a0September\u00a02026',
  },
  {
    publisher: 'Alzheimer’s Society',
    title: 'This is me',
    href: 'https://www.alzheimers.org.uk/get-support/publications-factsheets/this-is-me',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Oral History Society',
    title: 'For family historians',
    href: 'https://ohs.org.uk/for-family-historians/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'GOV.UK',
    title: 'Order a birth, death, marriage or civil partnership certificate',
    href: 'https://www.gov.uk/order-copy-birth-death-marriage-certificate',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'FreeBMD',
    title: 'FreeBMD home page',
    href: 'https://www.freebmd.org.uk/',
    date: 'figures updated 25\u00a0September\u00a02026',
  },
];

// Room above the key facts and the author box, and above the sources (a section's step).
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function HowToWriteALifeStoryPage() {
  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            path: PATH,
            headline: HEADLINE,
            description: DESCRIPTION,
            datePublished: PUBLISHED,
            dateModified: PUBLISHED,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Guides', path: '/guides' },
            { name: CRUMB, path: PATH },
          ]),
          faqSchema(FAQ_PLAIN),
        ]}
      />

      <SiteShell>
        <GuideArticle
          guideLink
          crumb={CRUMB}
          title={
            <>
              How to write <Accent>a life story.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              To write a life story, start with a simple timeline of dates and places, gather stories in the person’s own words through recorded conversations, group them into chapters, add captioned photos and share drafts so family can add what they remember. Write plainly, and keep their phrases.
            </Lead>
            <p>
              The same steps work for a parent’s life or your own, and for the life story books many care settings use.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <GuideSection
            title={
              <>
                What goes into <Accent tone="pink">a life story?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                The facts of a life, the people in it and the everyday detail that made the person who they are. Dementia UK’s guide to creating a life story suggests covering:
              </p>
            </Prose>
            <Points>
              <Point icon={Fingerprint} title="The basics.">
                Their name and how they like to be addressed, date of birth, where they live and the languages they speak.
              </Point>
              <Point icon={Users} title="The people.">
                Family, friends, colleagues and pets, and the relationships that mattered most.
              </Point>
              <Point icon={MapPin} title="The places.">
                Homes, schools, workplaces, holiday destinations and their children’s schools.
              </Point>
              <Point icon={Milestone} title="The big events.">
                Childhood and education, working life, achievements, weddings, births, house moves and new jobs.
              </Point>
              <Point icon={Coffee} title="The everyday.">
                Food they love and hate, favourite music, TV and films, routines, beliefs and values.
              </Point>
            </Points>
            <Prose>
              <p>For a family history rather than a care setting, add the reasons behind the facts: why they moved, how they met, what they would do differently.</p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you <Accent tone="pink">gather the material?</Accent>
              </>
            }
          >
            <Steps>
              <Step number="01" title="Make a one-page timeline.">
                <p>Birth, schools, moves, jobs, marriages, children and grandchildren, each with a year and a place. The gaps show you what to ask about.</p>
              </Step>
              <Step number="02" title="Collect the paperwork.">
                <p>Certificates, school reports, payslips, letters, passports and the writing on the backs of photos all hold names and dates.</p>
              </Step>
              <Step number="03" title="Record the conversations.">
                <p>Take one topic at a time so it never becomes overwhelming, as Dementia UK suggests, and ask open questions that need more than a yes or no answer, as the Oral History Society advises. Explain what the recording is for before you start.</p>
              </Step>
              <Step number="04" title="Ask the rest of the family.">
                <p>Brothers, sisters, cousins and old friends remember different things. If the person finds it hard to tell their story, Dementia UK notes, other family members and friends may be able to provide key information.</p>
              </Step>
            </Steps>
            <Prose>
              <p>
                Our guides to{' '}
                <Link href="/guides/questions-to-ask-your-parents-about-their-life">questions to ask your parents</Link> and{' '}
                <Link href="/guides/how-to-interview-your-grandparents">interviewing your grandparents</Link> have questions to start with and advice on recording.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How should you <Accent tone="pink">structure it?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Most life stories read best in chapters, each one a stage of life or a theme. Dementia UK points out that you don’t have to start at the beginning or work in chronological order, and you don’t have to include everything, just what is most meaningful. A plan that suits most lives, with a question to open each chapter:
              </p>
            </Prose>
            <QuestionSets>
              <QuestionSet icon={BookOpen} title="Seven chapters" questions={CHAPTERS} tone="blue" />
            </QuestionSets>
          </GuideSection>

          <GuideSection
            title={
              <>
                What is a life story book, <Accent tone="pink">and why do care homes ask for one?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                A life story book is a record of someone’s life in photos and short, clear text. In dementia care it helps people see the person behind the condition. Dementia UK says compiling one can strengthen a person’s sense of identity, encourage reminiscence, bring family closer and give carers a better understanding of the person’s life, so they can provide better care. It matters to many families: dementia and Alzheimer’s disease were the leading cause of death in England and Wales in 2025, with 72,272 deaths registered, 12.7% of the total, according to the Office for National Statistics.
              </p>
              <p>
                Dementia UK lists several formats: books, collages or memory boards, videos, memory boxes, apps and one-page profiles, which are often used in hospitals. For a book, it suggests clear text with photos, one font and size, no more than two contrasting colours, and laminated pages or punched pockets in a ring binder. Many care settings have their own format, so you may need to copy key details into their template. Alzheimer’s Society’s ‘This is me’ leaflet, now in its fourth edition and free to download, records a person’s background, the people and places that matter to them, and their preferences and routines, for use at home, in hospital, in respite care or in a care home.
              </p>
              <p>Dementia UK also suggests keeping one version for family and close friends, and a second, briefer one to share with carers.</p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you write it so it <Accent tone="pink">sounds like them?</Accent>
              </>
            }
          >
            <Tips>
              <Tip icon={Quote}>
                Use their words. Dementia UK suggests letting the person comment on a photograph and using their words as the caption: ‘remember it is their story, not yours.’
              </Tip>
              <Tip icon={PenLine}>
                Pick one voice, first person or third, and keep to it all the way through.
              </Tip>
              <Tip icon={Sparkles}>
                Choose detail over adjectives. What he kept in his shed says more than ‘he was practical’.
              </Tip>
              <Tip icon={Speech}>
                Keep their sayings, nicknames and dialect, even when they look untidy on the page.
              </Tip>
              <Tip icon={Clock}>
                Keep it short. A page per memory is plenty, and short chapters are easier to share and add to.
              </Tip>
            </Tips>
          </GuideSection>

          <PullQuote>
            A date tells you when it happened.{' '}
            <Accent tone="blue">Their words tell you what it meant.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                How do you check <Accent tone="pink">names and dates?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Memories blur, so check the dates that matter against records. In England and Wales, the General Register Office sells birth, marriage and death certificates for £12.50, sent 4&nbsp;days after you apply if you have the GRO index reference. Without one, each search costs £3.50 extra and the certificate is sent 15&nbsp;working&nbsp;days after you apply, GOV.UK says. Scotland and Northern Ireland have their own processes.
              </p>
              <p>
                FreeBMD, a free index of births, marriages and deaths in England and Wales covering 1837 to 1999, can help you find the right entry first. It holds more than 300&nbsp;million distinct records, though not every year is fully transcribed yet.
              </p>
              <p>When two relatives remember something differently, write both versions down and say whose is whose. The disagreement is part of the story.</p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you turn it into <Accent tone="pink">something to keep?</Accent>
              </>
            }
          >
            <Prose>
              <p>Decide who it is for first. A care home needs something short, sturdy and easy to read; grandchildren may want every photo. The usual choices:</p>
            </Prose>
            <Points>
              <Point icon={Printer} title="A printed book.">
                Sturdy and easy to pass round. Order a copy for each branch of the family.
              </Point>
              <Point icon={FolderOpen} title="A ring binder.">
                Punched pockets let you add pages, and laminated pages survive handling, as Dementia UK suggests.
              </Point>
              <Point icon={Mic} title="The recordings.">
                Keep the audio with the text, so the next generation can hear the voice as well as read the words.
              </Point>
              <Point icon={HeartHandshake} title="Copies for everyone.">
                When it is finished, Dementia UK suggests sharing it with family, friends and professional carers.
              </Point>
            </Points>
          </GuideSection>

          <GuideSection
            title={
              <>
                How it <Accent tone="pink">helps.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                In Ancestorii, each person can have a <Link href="/features/loved-ones">Loved Ones</Link> profile with their photo, relationship and dates, and their life story told in four chapters: Early years, Important moments, Special memories and Who they are. Each chapter comes with guiding questions and a photo, and the profile gathers every timeline, album and capsule tagged with them.
              </p>
              <p>
                <Link href="/features/writing-help">Story Assistance</Link>, optional writing help that is on by default and can be switched off, suggests prompts for each chapter. It never edits your text: you choose what to keep. Dated events can go on a timeline, which you can download as a PDF.
              </p>
              <p>
                When it’s ready, print it as a <Link href="/memory-books">Memory Book</Link>: an A4 landscape hardcover with 24, 36 or 48 printed pages, at £44.99, £54.99 or £64.99 plus delivery. It holds photos and written words, and you can download a free PDF of your design first. If the book is for someone with dementia, keep each page simple, one photo and a short caption, and check whether their care home has its own template.
              </p>
              <p>
                The Free plan includes one loved one, and Premium, at £3.99 a month for the whole family, includes as many as you like. For writing the pages themselves, see{' '}
                <Link href="/guides/what-to-write-in-a-memory-book">what to write in a memory book</Link>.
              </p>
              <p>
                Andrea, from Dudley, has a Memory Book about her dad. In her words: ‘I recently lost my dad, so this book became incredibly special. It captured the essence of him and the life he lived.’
              </p>
            </Prose>
            {/* Andrea's photo is only 639px wide, so its frame is never wider than that
                (it would turn soft); centred in the reading column. */}
            <div style={{ maxWidth: 639, marginInline: 'auto' }}>
              <GuideFigure
                src="/testimonial4.png"
                alt="Andrea holding her printed Ancestorii Memory Book about her dad"
                label="Andrea · Dudley, UK"
                color="var(--c2)"
                position="50% 15%"
              />
            </div>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">writing a life story.</Accent>
              </>
            }
          >
            <FaqList items={FAQ_PLAIN} variant="open" />
          </GuideSection>

          <div style={SECTION_GAP}>
            <Sources items={SOURCES} />
          </div>
          <div style={STACK_GAP}>
            <AuthorBox updated="17 October 2026" />
          </div>
        </GuideArticle>

        <GuideCta
          title={
            <>
              Start their story
              <br />
              <Accent tone="pink">with one chapter.</Accent>
            </>
          }
        >
          Keep the words, photos and voices together in one private place your family can add to.
        </GuideCta>
      </SiteShell>
    </>
  );
}
