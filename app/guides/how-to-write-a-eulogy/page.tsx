import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import {
  CalendarHeart,
  Clock,
  Eye,
  FileText,
  GlassWater,
  HandHelping,
  Hourglass,
  ListChecks,
  Mic,
  NotebookPen,
  PenLine,
  Printer,
  Quote,
  Scissors,
  Slash,
  Star,
  Timer,
  Users,
  Video,
} from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { Compare, CompareRow, GuideFigure, Point, Points, Step, Steps, Tip, Tips } from '../_components/GuideBlocks';

const PATH = '/guides/how-to-write-a-eulogy';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Write a Eulogy: Length, Structure, Tips';
const HEADLINE = 'How to write a eulogy';
const DESCRIPTION =
  'Aim for five to ten minutes, about 700 to 1,200 words, built on two or three true stories. How to gather them, structure it, start, end and get through it.';
const PUBLISHED = '2026-10-17';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to write a eulogy' }],
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
const FAQ = [
  {
    q: 'How long should a eulogy be?',
    a: 'Five to ten minutes when spoken aloud, which is about 700 to 1,200\u00a0words, according to the National Association of Funeral Directors. Most funeral services last 30 to 45\u00a0minutes in all, so ask the funeral director or celebrant how long you have.',
  },
  {
    q: 'How do you start a eulogy?',
    a: 'With one sentence that brings the person to life, such as a habit or a saying everyone will recognise, then say who you are to them. The National Association of Funeral Directors advises against opening with “I was asked to say a few words today”.',
  },
  {
    q: 'What if I cry while giving the eulogy?',
    a: 'That is normal, and people will wait. Pause, breathe and take a sip of water. The National Association of Funeral Directors says tears “are a sign of love”. Ask a friend, or the celebrant, to be ready to finish reading it if you can’t go on.',
  },
  {
    q: 'Can more than one person give a eulogy?',
    a: 'Yes. Some services have several short eulogies, for example a family member followed by a friend. Agree beforehand who will cover what, so the same story isn’t told twice, and share the time between you.',
  },
  {
    q: 'Should a eulogy mention the difficult parts of someone’s life?',
    a: 'Be honest without being unkind. The National Association of Funeral Directors says a eulogy should be truthful but is not the place for complicated feelings, and that if the relationship was difficult you should focus on what was good. Humanists UK says it is fine to acknowledge challenges if you do it sensitively.',
  },
];

const KEY_FACTS = [
  <>
    <strong>Five to ten minutes.</strong> That is about 700 to 1,200 written words, says the National
    Association of Funeral Directors (NAFD).
  </>,
  <>
    <strong>Nerves speed you up.</strong> Most people speak at around 120 to 150&nbsp;words a minute when nervous
    (NAFD). Humanists UK suggests assuming 130 to 140.
  </>,
  <>
    <strong>The service is short.</strong> Most funeral services last 30 to 45&nbsp;minutes in all, including music,
    readings, prayers and one or two eulogies (NAFD).
  </>,
  <>
    <strong>Two or three stories at the heart.</strong> NAFD suggests a 30 to 60&nbsp;second opening, a 1 to 2&nbsp;minute
    life story, 3 to 5&nbsp;minutes of stories, 1 to 2&nbsp;minutes on their legacy and a 30 to 60&nbsp;second close.
  </>,
  <>
    <strong>Print it large.</strong> At least 14-point, double-spaced, practised aloud three or four times,
    with someone ready to step in and finish it (NAFD).
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'National Association of Funeral Directors (NAFD Funeral Directory)',
    title: 'How to Write a Eulogy',
    href: 'https://www.funeral-directory.co.uk/guides/how-to-write-a-eulogy/',
    date: '25\u00a0February\u00a02026, reviewed 7\u00a0May\u00a02026',
  },
  {
    publisher: 'Humanists UK',
    title: 'How to Write a Funeral Speech (Eulogy): A Step-by-Step Guide',
    href: 'https://humanists.uk/ceremonies/funerals/blog/how-to-write-a-funeral-speech-eulogy-a-step-by-step-guide/',
    date: '17\u00a0April\u00a02025',
  },
  {
    publisher: 'Cruse Bereavement Support',
    title: 'Helpline',
    href: 'https://www.cruse.org.uk/get-support/helpline/',
    date: 'accessed October\u00a02026',
  },
];

// Space above a block that follows running text, and above the sources after the last section.
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function WriteAEulogyPage() {
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
            { name: 'How to Write a Eulogy', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <GuideArticle
          crumb="How to Write a Eulogy"
          title={
            <>
              How to write{' '}
              <br />
              <Accent>a eulogy.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              To write a eulogy, gather stories from family first, then write five to ten minutes’ worth, roughly
              700 to 1,200&nbsp;words: an opening line that brings the person to life, a short life story, two or three
              true stories that show who they were, what they leave behind, and a gentle close.
            </Lead>
            <p>
              Then print it in large type, read it aloud a few times and ask someone to be ready to take over. The
              timings here come from the National Association of Funeral Directors, whose members carry out more
              than 80% of UK funerals, and from Humanists UK, whose celebrants help families write tributes.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <PullQuote>
            Don’t tell them she was kind. <Accent tone="blue">Tell them the story that shows it.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                How long should <Accent tone="pink">a eulogy be?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Five to ten minutes spoken aloud, which the National Association of Funeral Directors (NAFD) puts
                at about 700 to 1,200 written words. Most people speak at around 120 to 150&nbsp;words a minute when
                they are nervous, so the same page can run long or short depending on the day.
              </p>
              <p>
                The whole service usually lasts 30 to 45&nbsp;minutes, NAFD says, and has to fit music, readings,
                prayers and perhaps two eulogies. Ask the funeral director or celebrant how long you have; Humanists
                UK says its celebrants tell each speaker the word count for their piece, so the ceremony keeps to
                time. If two or three of you are speaking, split the time between you. At 120 to 150&nbsp;words a
                minute:
              </p>
            </Prose>
            <Tips>
              <Tip icon={Clock}>About 700&nbsp;words takes five to six minutes.</Tip>
              <Tip icon={Timer}>About 1,000&nbsp;words takes seven to eight minutes.</Tip>
              <Tip icon={Hourglass}>About 1,200&nbsp;words takes eight to ten minutes.</Tip>
              <Tip icon={Scissors}>
                Running over? Cut a story rather than speaking faster. In NAFD’s words, five heartfelt, specific
                minutes are “always more powerful than a fifteen-minute speech that loses focus”.
              </Tip>
            </Tips>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you gather <Accent tone="pink">what to say?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Talk to other people before you write. As NAFD puts it, even if you knew the person well, you may
                not know all aspects of their life, and family, friends and colleagues can reveal stories and
                qualities you were unaware of.
              </p>
            </Prose>
            <Tips>
              <Tip icon={Users}>
                <strong>Ask three or four people for one story each.</strong> A sibling, an old friend, a colleague. “What’s a story about her you always come back to?” gets more than “What was she like?”
              </Tip>
              <Tip icon={PenLine}>
                <strong>Write everything down first.</strong> NAFD suggests writing down whatever comes to mind without filtering, and shaping it later.
              </Tip>
              <Tip icon={Quote}>
                <strong>Collect their words.</strong> Sayings, habits, the phrase they always used. Cards, letters and photos help people remember.
              </Tip>
              <Tip icon={ListChecks}>
                <strong>Check the facts.</strong> Dates, places, jobs and names. Ask a close relative to read the life-story part before the day.
              </Tip>
              <Tip icon={Star}>
                <strong>Pick two or three stories.</strong> Choose the ones that show who they were. Humanists UK suggests two to four short ones.
              </Tip>
            </Tips>
          </GuideSection>

          <GuideSection
            title={
              <>
                How should a eulogy <Accent tone="pink">be structured?</Accent>
              </>
            }
          >
            <Prose>
              <p>There is no fixed format, but NAFD suggests five parts, with rough timings.</p>
            </Prose>
            <Steps>
              <Step number="01" title={'Opening, 30 to 60\u00a0seconds.'}>
                <p>One sentence that brings them to life, and who you are to them.</p>
              </Step>
              <Step number="02" title={'A brief life story, 1 to 2\u00a0minutes.'}>
                <p>Where they were born and grew up, work, marriage, family. Keep it short: NAFD warns that “a chronology of facts alone does not make a moving eulogy”.</p>
              </Step>
              <Step number="03" title={'Character and stories, 3 to 5\u00a0minutes.'}>
                <p>The heart of it. Show their qualities through specific stories instead of listing them: the exact phrase they used, the look on their face.</p>
              </Step>
              <Step number="04" title={'Legacy, 1 to 2\u00a0minutes.'}>
                <p>What they leave behind in the people who knew them: what they taught you, what they passed on.</p>
              </Step>
              <Step number="05" title={'Closing, 30 to 60\u00a0seconds.'}>
                <p>A favourite poem or quote, a few words to them directly, or a simple goodbye. Don’t rush it.</p>
              </Step>
            </Steps>
            <Prose>
              <p>
                Humour belongs if it was part of them. NAFD says it should be affectionate, the kind that “would
                have made the person themselves smile”, and Humanists UK adds that if you tell a funny story you
                should smile, because people sometimes need permission to laugh at a funeral.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you start <Accent tone="pink">and end a eulogy?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Skip the throat-clearing. NAFD advises against opening with “I was asked to say a few words today”
                and suggests a first sentence that brings the person to life. Specific beats general.
              </p>
            </Prose>
            <Compare labels={['Instead of', 'Try something like']}>
              <CompareRow left="I was asked to say a few words today." right="If you ever needed a lift at two in the morning, you rang Dad." />
              <CompareRow left="She was kind and generous." right="She knitted a cardigan for every baby born on our street." />
              <CompareRow left="He loved his garden." right="He named his tomato plants, and he had favourites." />
            </Compare>
            <Prose>
              <p>
                For the end, NAFD suggests something that brings comfort: a favourite poem or quote, a few words
                spoken to them directly, a call to carry on a tradition they loved, or your own goodbye. Then give
                it a moment before you sit down. The last line needs time to land.
              </p>
            </Prose>
          </GuideSection>

          <PullQuote>
            Nobody is judging your speaking.{' '}
            <Accent tone="blue">They are remembering the same person you are.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                How do you get through <Accent tone="pink">delivering it?</Accent>
              </>
            }
          >
            <Points>
              <Point icon={Printer} title="Print it. Don’t memorise it.">
                NAFD’s advice is to always read from a printed script, in at least 14-point type, double-spaced, with
                wide margins. Humanists UK suggests using only the top two thirds of each page, so your head stays up.
              </Point>
              <Point icon={Slash} title="Mark your pauses.">
                Put a forward slash (/) wherever you want to stop and breathe.
              </Point>
              <Point icon={Mic} title="Practise out loud.">
                Three or four times before the day, NAFD says, and once in the room itself if you can.
              </Point>
              <Point icon={GlassWater} title="Ask for water.">
                A glass at the lectern gives you a reason to pause.
              </Point>
              <Point icon={Eye} title="Look just above their heads.">
                NAFD says it keeps a connection with the room without the intensity of direct eye contact.
              </Point>
              <Point icon={HandHelping} title="Have a stand-in.">
                Ask a friend to be ready to step in and finish if you can’t, or ask the celebrant to read it for you.
              </Point>
            </Points>
            <Prose>
              <p>
                If you cry, you cry. NAFD’s guide puts it simply: “Tears are not a sign of weakness or failure; they
                are a sign of love.” People will wait.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What should you do with <Accent tone="pink">the eulogy afterwards?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Keep it. It may be the clearest summary of their life anyone has written, and it took real work to
                gather.
              </p>
            </Prose>
            <Tips>
              <Tip icon={FileText}>Offer a copy to close family, and keep one with the order of service.</Tip>
              <Tip icon={Video}>If the service was recorded, save the recording in more than one place.</Tip>
              <Tip icon={NotebookPen}>Write down the stories people told you that didn’t fit. They are the start of a memorial book or a fuller life story.</Tip>
              <Tip icon={CalendarHeart}>Read it again on their birthday or the anniversary, if that helps.</Tip>
            </Tips>
            <Prose>
              <p>
                Our guide to{' '}
                <Link href="/guides/how-to-keep-memories-of-a-loved-one-alive">
                  keeping memories of a loved one alive
                </Link>{' '}
                has more for the months after the funeral, and{' '}
                <Link href="/guides/how-to-record-family-stories">recording family stories</Link> covers capturing
                the rest. If the weeks after the funeral are hard, Cruse Bereavement Support’s free helpline is on{' '}
                <a href="tel:08088081677">0808&nbsp;808&nbsp;1677</a>.
              </p>
            </Prose>
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
                Before you write, you can ask relatives for their memories in your family’s private space on
                Ancestorii. Send each person a question from the free app, or write your own, such as “What’s the
                story about Dad you always come back to?”. They answer in the app, and the answers arrive as memories
                only your family can see. When two people remember the same moment differently, the second can add their version, and
                both sit side by side on one page: often exactly what a eulogy needs.
              </p>
              <p>
                Afterwards, keep the eulogy itself as a memory, with a voice note of it being read, so it isn’t lost
                in a drawer with the order of service. You can also give the person a{' '}
                <Link href="/features/loved-ones">Loved One profile</Link>, with their dates and their life in four
                chapters. The Free plan includes one profile; Premium, £3.99 a month for the whole family, adds as
                many as you need. See how <Link href="/features/voice-notes">voice notes</Link> work.
              </p>
              <p>
                Some families also keep the stories in a printed <Link href="/memory-books">Memory Book</Link>.
                Andrea, from Dudley, has one about her dad.
              </p>
            </Prose>
            {/* testimonial4.png is 639 by 655, so its frame is never wider than that (it would turn
                soft); the top-weighted crop keeps both faces and the book in the 5:4 frame. */}
            <div style={{ maxWidth: 639, marginInline: 'auto' }}>
              <GuideFigure
                src="/testimonial4.png"
                alt="Andrea holding her printed Ancestorii Memory Book about her dad"
                label="Andrea · Dudley, UK"
                color="var(--c1)"
                position="50% 20%"
              />
            </div>
          </GuideSection>

          <GuideSection
            title={
              <>
                Frequently asked <Accent tone="pink">questions.</Accent>
              </>
            }
          >
            <FaqList items={FAQ} variant="open" />
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
              Gather the stories.
              <br />
              <Accent tone="pink">Keep every word.</Accent>
            </>
          }
        >
          Ask the family for their memories, keep the eulogy with them, and give the person a page that holds
          their story.
        </GuideCta>
      </SiteShell>
    </>
  );
}
