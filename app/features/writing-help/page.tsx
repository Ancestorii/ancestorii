import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import SiteShell from '@/components/site/SiteShell';
import { Accent } from '@/components/site/SiteBits';
import site from '@/components/site/site.module.css';
import {
  ArticleCta,
  ArticleHero,
  ArticleSection,
  CheckList,
  CompareTable,
  FaqBlock,
  QuoteBlock,
  Reading,
  TableNote,
} from '@/components/site/seo-articles/ArticleBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';

const PATH = '/features/writing-help';
const TITLE = 'AI Help Writing Family Memories: Story Assistance';
const DESCRIPTION =
  'Story Assistance is Ancestorii’s optional AI writing help: guiding questions and short drafts you can use or ignore. Included free; switch it off any time.';
const HEADLINE = 'Gentle writing help for when the words won’t come';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    title: `${TITLE} | Ancestorii`,
    description: DESCRIPTION,
    url: `${SITE_URL}${PATH}`,
    siteName: 'Ancestorii',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Story Assistance, the optional writing help in Ancestorii' }],
    locale: 'en_GB',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | Ancestorii`,
    description: DESCRIPTION,
    images: ['/og-default.jpg'],
  },
};

// Every place Story Assistance appears on the website, with the option labels as they
// read on each page (the assist cards in app/dashboard/** and the Our Stories editor).
const SURFACES = [
  [
    'Loved Ones',
    'Early Years · Important Moments · Special Memories · Who They Are',
    'Four or five questions about that part of the person’s life, each with a short prompt',
  ],
  [
    'Timelines',
    'Memory Prompts · Event Descriptions',
    'Questions to help you remember what happened, or to describe one event: what led up to it, who was there and what changed',
  ],
  [
    'Albums',
    'Album Description · Photo Captions · Voice Note Ideas',
    'A description of four or five sentences, four captions in different tones, or four ideas for a voice note',
  ],
  [
    'Capsules',
    'Capsule Message · Capsule Description · Voice Note Ideas',
    'A two-paragraph message to whoever opens it, a short description, or ideas for a voice note to the future',
  ],
  [
    'Memory Books',
    'Page Descriptions · Page Headings · Book Introduction',
    'A few sentences for a page, a short introduction to set the scene for a section, or a two-paragraph opening for the book',
  ],
  [
    'Editing a family memory',
    'Help me start · Help me go deeper · Help me end it',
    'Three or four questions to find your opening, the feeling at the centre of it, or an ending',
  ],
  [
    'Writing for Our Stories',
    'Help me start · Help me go deeper · Help me end it',
    'The same three, for a story you plan to publish on the public feed',
  ],
];

const FAQ = [
  {
    q: 'Does Story Assistance change my words?',
    a: 'No. It never edits your text. Suggestions appear in a separate card, and nothing goes into your page unless you type or paste it in yourself.',
  },
  {
    q: 'Is Story Assistance free?',
    a: 'Yes. It is included on both the Free plan and Premium, which is £3.99 a month per family. There is no extra charge, and your plan does not change what it can do.',
  },
  {
    q: 'How do I turn Story Assistance off?',
    a: 'Sign in on the website, open My Profile, find Story Assistance under Preferences, switch it off and save. While it is off, nothing is sent to the AI model.',
  },
  {
    q: 'Is what I write used to train AI models?',
    a: 'Ancestorii’s privacy policy says Story Assistance inputs are not used to train AI models. Anthropic, which makes the Claude model behind it, says it does not use inputs or outputs from its commercial products, including its API, to train its models by default.',
  },
  {
    q: 'What can it help me write?',
    a: 'Loved Ones chapters, timeline memories and event descriptions, album descriptions and photo captions, capsule messages, Memory Book page notes and introductions, family memories and Our Stories posts, plus ideas for what to say in a voice note.',
  },
  {
    q: 'Which AI model does Story Assistance use?',
    a: 'Claude, made by Anthropic. At the time of writing it uses the Claude Sonnet 4.6 model, with instructions to write in warm British English and to help only with family memory writing.',
  },
];

// What is always better in your own words, shown as a check list.
const OWN_WORDS = [
  <>
    <strong>Things people actually said.</strong> Write a grandparent’s sayings exactly as they said
    them, grammar and all. That is what the family will want to hear again.
  </>,
  <>
    <strong>Names, dates and places.</strong> A suggestion can only use what is on the page. Check
    every detail in a draft before you keep it, and fill in the real ones yourself.
  </>,
  <>
    <strong>Letters to one particular person.</strong> A message for a grandchild to read in twenty
    years should sound like you. Use a draft to get going, then rewrite it in your own voice. Our guide
    on{' '}
    <Link href="/guides/how-to-write-a-legacy-letter" className={site.textLink}>
      how to write a legacy letter
    </Link>{' '}
    walks through it.
  </>,
];

// Space above a block that follows long text (the same step the article kit uses after a check list).
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };

const SOURCES = [
  {
    publisher: 'Anthropic Privacy Center',
    title: 'Is my data used for model training?',
    href: 'https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training',
    date: 'updated 18 August 2026',
  },
  {
    publisher: 'Anthropic Privacy Center',
    title: 'How long do you store my organization’s data?',
    href: 'https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-personal-data',
    date: '1 July 2026',
  },
  {
    publisher: 'Ancestorii',
    title: 'Privacy policy',
    href: 'https://www.ancestorii.com/privacy-policy',
    date: '2026',
  },
];

export default function WritingHelpPage() {
  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            path: PATH,
            headline: HEADLINE,
            description: DESCRIPTION,
            datePublished: '2026-10-17',
            dateModified: '2026-10-17',
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Features', path: '/features' },
            { name: 'Writing help', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[
            { href: '/', label: 'Home' },
            { href: '/features', label: 'Features' },
            { label: 'Writing help' },
          ]}
          size="md"
          title={
            <>
              Gentle writing help <Accent>for when the words won’t come.</Accent>
            </>
          }
          intro={[
            'Story Assistance is Ancestorii’s optional AI writing help: when you are stuck, it asks you a few specific questions or drafts a caption, description or letter, and you write the final words yourself. It is included on the Free and Premium plans, switched on by default, and can be turned off in your profile at any time.',
            'It runs on Claude, an AI model made by Anthropic, and it only helps with family memory writing.',
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        {/* The quotable facts, beside what it is for */}
        <ArticleSection
          aside={
            <KeyFacts
              items={[
                'Found on the Ancestorii website in seven places: Loved Ones, Timelines, Albums, Capsules, Memory Books, the family memory editor and the Our Stories editor.',
                <>
                  Two kinds of help: <strong>guiding questions</strong> to get you writing, and{' '}
                  <strong>short drafts</strong>, such as photo captions or a capsule message, to use as a
                  starting point.
                </>,
                'Suggestions appear in their own card. Nothing is added to your page unless you type or paste it in yourself.',
                'Included on both plans and switched on by default. Turn it off under My Profile, Preferences, Story Assistance.',
                'With it switched off, nothing is sent to the AI model.',
                'Ancestorii’s privacy policy says Story Assistance inputs are not used to train AI models, and Anthropic says it does not train on inputs or outputs from its commercial products, including its API, by default.',
              ]}
            />
          }
        >
          <Reading>
            <p>
              Writing about someone you love is rarely hard because you do not know them. It is hard
              because an empty box for their early years, or for the message inside a time capsule, asks
              for everything at once, so it gets left for another day.
            </p>
            <p>
              Story Assistance is there for that moment. It does not know your family, and it is not there
              to write your family’s story. It works from the details already on the page, such as a name,
              a relationship, a date or an album title, and gives you something smaller to respond to: a
              question about the house they grew up in, or a rough caption you can make your own.
            </p>
          </Reading>
        </ArticleSection>

        {/* What it does */}
        <ArticleSection
          id="what-it-does"
          kicker="What it does"
          dot="var(--c1)"
          title={
            <>
              What does Story Assistance <Accent tone="blue">actually do?</Accent>
            </>
          }
        >
          <Reading>
            <p>It offers two kinds of help, depending on where you are.</p>
            <p>
              <strong>Guiding questions.</strong> Most options reply with three to five questions, each with
              a short paragraph underneath to jog your memory. On a Loved Ones page, ‘Early Years’ asks
              about where the person grew up, school, childhood friends, favourite foods and the sounds and
              smells of their childhood home, using their name. In the Our Stories editor, ‘Help me start’
              asks where you were and who else was there, ‘Help me go deeper’ asks what you only understood
              years later, and ‘Help me end it’ asks where the people in the story are now. These options
              are set up to ask questions, not to write the story for you.
            </p>
            <p>
              <strong>Short drafts.</strong> A few options write a first draft for you to rework: four photo
              captions in different tones (nostalgic, playful, tender and simple), an album description of
              four or five sentences, a two-paragraph capsule message about life now and your hopes for
              whoever opens it, or a two-paragraph introduction for a Memory Book.
            </p>
            <p>
              Either way, the suggestion appears in a separate card on the page, with a note to use it as a
              starting point and write it in your own words. ‘Try another’ asks for a fresh suggestion, and
              ‘Different section’ takes you back to the list of options.
            </p>
          </Reading>
        </ArticleSection>

        {/* Where it appears */}
        <ArticleSection
          id="where-it-appears"
          layout="wide"
          kicker="Where it appears"
          dot="var(--c2)"
          title={
            <>
              Where does <Accent tone="pink">it appear?</Accent>
            </>
          }
        >
          <CompareTable
            head={['Where', 'Options', 'What you get']}
            rows={SURFACES}
            highlight={1}
            size="wide"
            labelledBy="where-it-appears-title"
          />
          <TableNote>
            All seven are on the Ancestorii website, and each one works only from the details on that
            page.
          </TableNote>
        </ArticleSection>

        {/* Your words */}
        <ArticleSection
          id="your-words"
          kicker="Your words"
          dot="var(--c3)"
          title={
            <>
              Does it rewrite <Accent tone="blue">what I’ve written?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              No. Story Assistance never edits your text. Its suggestions stay in their own card, and
              nothing goes into your page unless you type or paste it in yourself. You can close the card
              on any page, ask for another suggestion, or ignore it completely.
            </p>
            <p>
              That matters most for the pieces your family will keep: a capsule message someone opens years
              from now, or the introduction to a printed Memory Book. Treat a draft the way you would treat
              a friend’s suggestion. Keep the line that sounds like you, cut the rest, and add the details
              only you know. A draft can only work from what is on the page, so read it for anything that
              is not true to the person before you keep a word of it.
            </p>
          </Reading>
        </ArticleSection>

        <QuoteBlock>
          It asks the questions. <Accent tone="blue">You write the story.</Accent>
        </QuoteBlock>

        {/* Training and privacy */}
        <ArticleSection
          id="training"
          kicker="Privacy"
          dot="var(--c0)"
          title={
            <>
              Is my writing used <Accent tone="pink">to train AI?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Ancestorii’s privacy policy says it does not use your content to train AI models, and that
              what you send through Story Assistance is not used to train them either.
            </p>
            <p>
              When you ask for a suggestion, the details from that page are sent to Claude, the AI model
              made by Anthropic: for example a name, a relationship and dates on a Loved Ones page, an album
              or capsule title, or, in the memory and story editors, the title and what you have written so
              far. Anthropic’s Privacy Center says that by default it does not use inputs or outputs from
              its commercial products, which include its API, to train its models, unless a customer
              explicitly reports feedback or chooses to allow it. It also says that for API users it
              deletes inputs and outputs from its systems within 30&nbsp;days, with exceptions such as a separate
              data agreement, enforcing its usage policy or complying with the law.
            </p>
            <p>
              On Ancestorii’s side, each request is logged with the type of help, the model, token counts and
              how long it took, not the words themselves. And if you switch Story Assistance off, nothing is
              sent to the model at all.
            </p>
          </Reading>
        </ArticleSection>

        {/* Switching it off */}
        <ArticleSection
          id="switch-off"
          kicker="Your choice"
          dot="var(--c2)"
          title={
            <>
              How do I <Accent tone="blue">switch it off?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Story Assistance is on for every new account, and each person in a family decides for
              themselves. To turn it off:
            </p>
            <ol>
              <li>
                Sign in on the Ancestorii website and choose My Profile from the profile menu at the top of
                the page.
              </li>
              <li>Find the Preferences card, where Story Assistance has its own switch.</li>
              <li>Turn the switch off and save your profile.</li>
            </ol>
            <p>
              While it is off, the help card may still show its options, but no suggestions are generated:
              asking for one shows a message that Story Assistance is turned off. Switch it back on the same
              way whenever you like.
            </p>
          </Reading>
        </ArticleSection>

        {/* Writing without help */}
        <ArticleSection
          id="without-help"
          kicker="Good to know"
          dot="var(--c3)"
          title={
            <>
              When is it better <Accent tone="pink">to write without help?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Often. If the words are already there, use them. A few things are always better in your own
              words:
            </p>
          </Reading>
          <div style={STACK_GAP}>
            <CheckList items={OWN_WORDS} />
            <Reading>
              <p>
                For a Memory Book, it can help to write your own page notes first and only ask for help on
                the pages that stall. Our guide on{' '}
                <Link href="/guides/what-to-write-in-a-memory-book">what to write in a memory book</Link>{' '}
                covers five things to put on every page.
              </p>
            </Reading>
          </div>
        </ArticleSection>

        {/* Honest fit */}
        <ArticleSection
          id="where-ancestorii-helps"
          kicker="Honestly"
          dot="var(--c1)"
          title={
            <>
              Where Ancestorii helps, <Accent tone="blue">and where it doesn’t.</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Story Assistance is built into the places families tend to get stuck: the four chapters of a{' '}
              <Link href="/features/loved-ones">Loved Ones</Link> page, the message inside a{' '}
              <Link href="/features/digital-time-capsule">time capsule</Link>, the page notes of a printed{' '}
              <Link href="/memory-books">Memory Book</Link>, which starts at £44.99 plus delivery, and
              stories for <Link href="/features/our-stories">Our Stories</Link>. It costs nothing extra on
              either plan.
            </p>
            <p>
              What it will not do: it knows nothing about your family beyond the details on the page, so it
              cannot research your family history, check facts or remember people for you. It will not
              write a whole life story in one go, either. It is a prompt for your memory, not a replacement
              for it.
            </p>
          </Reading>
        </ArticleSection>

        {/* FAQ */}
        <ArticleSection
          id="faq"
          kicker="Questions"
          dot="var(--c3)"
          title={
            <>
              Things people <Accent tone="pink">ask us.</Accent>
            </>
          }
        >
          <FaqBlock items={FAQ} variant="open" />
        </ArticleSection>

        {/* Sources and author */}
        <ArticleSection>
          <Sources items={SOURCES} />
          <div className={site.sectionBody}>
            <AuthorBox updated="17 October 2026" />
          </div>
        </ArticleSection>

        <ArticleCta
          title={
            <>
              Your words,
              <br />
              with a little help.
            </>
          }
          lead="Story Assistance is included free on every Ancestorii plan, and you can switch it off whenever you like."
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
