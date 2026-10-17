import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { CalendarClock, Clock, Heart, Mail, Mic, PenLine, Printer, Scale, Sofa, Users } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import {
  Compare,
  CompareRow,
  GuideFigure,
  Point,
  Points,
  Prompt,
  Prompts,
  Step,
  Steps,
  Tip,
  Tips,
} from '../_components/GuideBlocks';

const PATH = '/guides/how-to-write-a-legacy-letter';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Write a Legacy Letter (an Ethical Will)';
const HEADLINE = 'How to write a legacy letter (an ethical will)';
const DESCRIPTION =
  'A legacy letter passes on your values, stories and hopes, not money. How to write one, what to include, where to keep it and how it differs from a will.';
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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to write a legacy letter' }],
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
    q: 'What is the difference between a legacy letter and a will?',
    a: 'A will legally decides who inherits your money, property and possessions; in England and Wales it must be in writing and signed in front of 2 witnesses over 18. A legacy letter passes on your stories, values and hopes. It has no legal force and does not replace a will.',
  },
  {
    q: 'What should I write in a legacy letter to my children?',
    a: 'A few specific memories of each child, where the family comes from, the lessons you learned and the stories behind them, what you are proud of, any apology you owe, and what you hope for them. Write to each child by name, and keep it to a page or two.',
  },
  {
    q: 'When should a legacy letter be read?',
    a: 'Whenever you choose. You can give it while you are alive, at a wedding, a birth or an 18th birthday, or leave it to be read after you die. Write the opening date on the envelope and tell people when it is.',
  },
  {
    q: 'Where should I keep a legacy letter?',
    a: 'Keep the original with your important papers and a copy somewhere else. Tell three people you trust where it is; GOV.UK gives similar advice for wills. If the only copy is digital, set up Apple’s Legacy Contact or Google’s Inactive Account Manager.',
  },
  {
    q: 'Can I write a legacy letter to grandchildren who aren’t born yet?',
    a: 'Yes. Address it to your future grandchildren, or to a child at the age they will be when they read it, such as 18. Write about who you are now and what you hope for them, and choose an opening date that makes sense.',
  },
];

const KEY_FACTS = [
  <>
    <strong>An old tradition.</strong> Jewish ethical wills go back to biblical times: near death,
    Jacob blessed his children and told them where he wanted to be buried (My Jewish Learning).
  </>,
  <>
    <strong>No legal force.</strong> Ethical wills are not legal documents, so they can take any shape
    the writer wishes (My Jewish Learning). Who inherits what belongs in your will.
  </>,
  <>
    <strong>A will has rules.</strong> In England and Wales, a will must be in writing and signed in
    front of 2 witnesses over 18, who then sign it in your presence (GOV.UK).
  </>,
  <>
    <strong>A letter of wishes is different.</strong> It sits with a will and, unlike the will, is not
    legally binding (Age UK).
  </>,
  <>
    <strong>Tell three people.</strong> For anything meant to be opened on a future date, the
    International Time Capsule Society suggests telling 3 trusted people, in different places, when to
    open it, with a yearly calendar reminder.
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'My Jewish Learning',
    title: 'Jewish Ethical Wills (Tzava’ot)',
    href: 'https://www.myjewishlearning.com/article/jewish-ethical-wills-tzavaot/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'GOV.UK',
    title: 'Making a will: overview',
    href: 'https://www.gov.uk/make-will',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'GOV.UK',
    title: 'Making a will: make sure your will is legal',
    href: 'https://www.gov.uk/make-will/make-sure-your-will-is-legal',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'GOV.UK',
    title: 'Making a will: write your will',
    href: 'https://www.gov.uk/make-will/writing-your-will',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Age UK',
    title: 'Factsheet 7: Making a will',
    href: 'https://www.ageuk.org.uk/siteassets/documents/factsheets/fs7_making_a_will_fcs.pdf',
    date: 'July\u00a02026',
  },
  {
    publisher: 'International Time Capsule Society',
    title: 'The ITCSOC recommendation',
    href: 'https://www.itcsoc.org/_files/ugd/6271cd_4824cd5269b84eda90d1b80404de1658.pdf',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Apple Support',
    title: 'How to add a Legacy Contact for your Apple Account',
    href: 'https://support.apple.com/en-gb/102631',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Apple Support',
    title: 'Request access to an Apple Account as a Legacy Contact',
    href: 'https://support.apple.com/en-gb/102678',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Google Account Help',
    title: 'About Inactive Account Manager',
    href: 'https://support.google.com/accounts/answer/3036546?hl=en-GB',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Google Account Help',
    title: 'Inactive Google Account Policy',
    href: 'https://support.google.com/accounts/answer/12418290?hl=en-GB',
    date: 'accessed October\u00a02026',
  },
];

// Space above a block that follows running text, and above the sources after the last section.
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function LegacyLetterPage() {
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
            { name: 'How to Write a Legacy Letter', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <GuideArticle
          crumb="How to Write a Legacy Letter"
          title={
            <>
              How to write{' '}
              <br />
              <Accent>a legacy letter.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              A legacy letter, also called an ethical will, is a personal letter that passes on your stories,
              values and hopes rather than your possessions. To write one, choose who it is for, share a few
              specific memories, say what you have learned and what you wish for them, then keep it where
              they will find it.
            </Lead>
            <p>
              It has no legal force and does not replace a will, so there are no rules about length or form:
              a page in your own handwriting is enough.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <PullQuote>
            A will says who gets what. <Accent tone="blue">A legacy letter says who you were.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                What is <Accent tone="pink">a legacy letter?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                It is a letter about the things a will cannot hold: where the family comes from, what you have
                learned, what you are proud of and sorry for, and what you hope for the people you love. You
                can write one to your children, a partner, or grandchildren not yet born.
              </p>
              <p>
                The idea is old. In Jewish tradition it is called an ethical will, and My Jewish Learning
                traces it to biblical times, when the patriarch Jacob, near death, blessed his children and
                told them where he wanted to be buried. In the 12th century, the Spanish Jewish physician and
                scholar Judah ibn Tibbon wrote one for his son Samuel that ran to more than 50&nbsp;pages.
              </p>
              <p>
                Modern ones, the same source says, are less about instruction and more about passing on wisdom
                and wishes, often as letters to children. Because they are not legal documents, they can take
                any shape: a letter, a list, a video or a collage of photos.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Is a legacy letter <Accent tone="pink">the same as a will?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                No. A will legally decides who inherits your money, property and possessions, so it has to meet
                formal rules. GOV.UK lists them: you must be 18 or over, make it voluntarily, be of sound mind,
                put it in writing, sign it in the presence of 2 witnesses who are both over 18, and have them
                sign it in your presence. Scotland and Northern Ireland have their own rules. Three documents
                often get mixed up:
              </p>
            </Prose>
            <Points>
              <Point icon={Scale} title="A will.">
                Decides who inherits what. Legally binding, with formal rules for signing and witnessing.
              </Point>
              <Point icon={Mail} title="A letter of wishes.">
                Sits alongside a will and guides the people carrying it out, often about personal things such as
                furniture, books or jewellery. Age UK notes it is not legally binding.
              </Point>
              <Point icon={Heart} title="A legacy letter.">
                Passes on your stories, values and hopes. No legal force, no rules, and you can give it while you
                are alive.
              </Point>
            </Points>
            <Prose>
              <p>
                Keep them separate. GOV.UK says you can write your own will but should get advice if it is not
                straightforward. A legacy letter needs no advice at all, only honesty.
              </p>
            </Prose>
          </GuideSection>

          <PullQuote>
            If something has to happen, put it in your will.{' '}
            <Accent tone="blue">If something has to be said, put it in a letter.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                What should you write <Accent tone="pink">in a legacy letter?</Accent>
              </>
            }
          >
            <Prose>
              <p>There is no template, but these six questions are a good place to begin.</p>
            </Prose>
            <Prompts>
              <Prompt
                question="Where do we come from?"
                context="The village, the move, the reason the family settled where it did. You may be the last person who knows."
              />
              <Prompt
                question="What did I learn the hard way?"
                context="One or two lessons, each with the story that taught you. The story is what makes the lesson stay."
              />
              <Prompt
                question="What am I proud of, and what do I regret?"
                context="Honesty makes a letter believable. Keep any apology about your own part, not about what others did."
              />
              <Prompt
                question="What do I see in you?"
                context="Something specific about each person you are writing to: a moment, a quality, a habit you love."
              />
              <Prompt
                question="What do I hope for you?"
                context="Hopes rather than instructions. “I hope you keep travelling” reads very differently from “you must”."
              />
              <Prompt
                question="What do I want to say while I can?"
                context="Thank you, I love you, I forgive you, I am proud of you. Say it plainly, even if you have said it before."
              />
            </Prompts>
            <Compare labels={['Leave out', 'Put in instead']}>
              <CompareRow left="Who gets the house or the ring" right="Why those things mattered to you" />
              <CompareRow left="Rules for how they should live" right="What you hope for them, and why" />
              <CompareRow left="Old arguments and who was right" right="An apology for your own part, if you owe one" />
              <CompareRow left="General praise, such as “you were a good child”" right="One moment you remember about each person" />
            </Compare>
            <Prose>
              <p>
                For the longer story, our guide to{' '}
                <Link href="/guides/how-to-write-a-life-story">writing a life story</Link> takes it chapter by
                chapter.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you start <Accent tone="pink">when it feels too big?</Accent>
              </>
            }
          >
            <Steps>
              <Step number="01" title="Write to one person.">
                <p>A letter to “my family” is harder to write than a letter to your eldest grandchild. Start with one name; write the next one later.</p>
              </Step>
              <Step number="02" title="Start with a memory, not a message.">
                <p>Open with one scene you can see clearly, such as the day they were born. What you want to say usually follows.</p>
              </Step>
              <Step number="03" title="Write the way you talk.">
                <p>Use your own phrases, nicknames and jokes. When they read it, it should sound like you.</p>
              </Step>
              <Step number="04" title="Keep it short.">
                <p>One to three pages is plenty. Several short letters written over the years can say more than one long one.</p>
              </Step>
              <Step number="05" title="Date it and come back to it.">
                <p>Read it again each year, or after a birth, a wedding or a diagnosis, and add a postscript if something has changed.</p>
              </Step>
            </Steps>
            <Prose>
              <p>One photo can be enough to start. The one below is from our founder’s own family album.</p>
            </Prose>
            {/* sister.jpg is 720 by 482: at 600px wide the 5:4 frame never enlarges it, so it stays sharp. */}
            <div style={{ maxWidth: 600, marginInline: 'auto' }}>
              <GuideFigure
                src="/sister.jpg"
                alt="A childhood memory"
                label="A childhood memory · the kind of moment that disappears if nobody writes it down"
                color="var(--c0)"
                position="45% 50%"
              />
            </div>
          </GuideSection>

          <GuideSection
            title={
              <>
                Where should you keep it <Accent tone="pink">so it is found?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                A letter nobody finds is a letter nobody reads. GOV.UK’s advice for wills works for letters
                too: tell your executor, a close friend or a relative where it is. If it is meant to be opened
                on a set date, such as an 18th birthday, borrow the International Time Capsule Society’s advice
                for time capsules:
              </p>
            </Prose>
            <Tips>
              <Tip icon={Users}>Tell 3 people you trust, who live in different places, when it should be opened.</Tip>
              <Tip icon={CalendarClock}>Set a yearly reminder in their calendars and yours.</Tip>
              <Tip icon={PenLine}>Mark the opening date on the outside of the envelope or file.</Tip>
              <Tip icon={Printer}>Keep the original with your important papers, and a copy somewhere else.</Tip>
            </Tips>
            <Prose>
              <p>
                Digital copies need a plan of their own. Apple’s Legacy Contact, on iOS 15.2, iPadOS 15.2 or
                macOS Monterey 12.1 or later, lets someone you choose request access to data such as your
                photos, messages, notes and files after you die, with an access key you give them and a death
                certificate. Access lasts three years from when Apple approves the first request, and then the
                account is permanently deleted.
              </p>
              <p>
                Google’s Inactive Account Manager can share your data with up to 10 people, or send them an
                email you wrote, once your account has been inactive for a period you choose. Google also says
                it may delete a personal account that has been inactive across Google for at least two years.
                Our guide to{' '}
                <Link href="/guides/what-happens-to-your-photos-when-you-die">
                  what happens to your photos when you die
                </Link>{' '}
                goes into more detail.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Should you record it <Accent tone="pink">in your own voice?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                If you can, yes. A letter keeps your words; a recording keeps how you said them. A phone is
                enough.
              </p>
            </Prose>
            <Points>
              <Point icon={Clock} title="Say who and when.">
                Start with the date and who the recording is for.
              </Point>
              <Point icon={Mic} title="Read it, then talk.">
                Read the letter once, then say whatever else comes to mind.
              </Point>
              <Point icon={Sofa} title="Choose a soft room.">
                Curtains and cushions cut echo. Record ten seconds and listen back first.
              </Point>
            </Points>
            <Prose>
              <p>
                Keep the file in two places, not only on your phone. Our guide to{' '}
                <Link href="/guides/how-to-save-family-voices">saving family voices</Link> has more on
                recording the people you love.
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
                An Ancestorii capsule is a natural home for a legacy letter. Give it a title, a short message
                for the front and the date it should open, then add the letter itself, photos, videos and voice
                notes, so they hear you say it as well as read it. Once you seal it, Ancestorii will not let you
                open or edit it until that date, and then it opens for your family automatically.
              </p>
              <p>
                Two things to know. Everyone in your family space can see a sealed capsule’s card, with its
                title, short message and cover photo, so keep the private words inside. And no notification is
                sent when it opens, so tell the people it is for. Capsules are made on the website and are
                unlimited on every plan, including Free, and Story Assistance, Ancestorii’s optional writing
                help, can suggest a message for you to edit.
              </p>
              <p>
                A legacy letter is not a will, and Ancestorii is not a legal or estate-planning service. See
                how <Link href="/features/digital-time-capsule">digital time capsules</Link> work, what else to{' '}
                <Link href="/guides/what-to-put-in-a-time-capsule">put in a time capsule</Link>, or read about
                planning your <Link href="/digital-legacy">digital legacy</Link>.
              </p>
            </Prose>
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
              Say what matters.
              <br />
              <Accent tone="pink">Choose the day.</Accent>
            </>
          }
        >
          Seal your letter, your photos and your voice in a capsule that opens on the day you choose.
        </GuideCta>
      </SiteShell>
    </>
  );
}
