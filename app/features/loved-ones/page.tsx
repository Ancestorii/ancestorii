import Link from 'next/link';
import type { Metadata } from 'next';
import { Fingerprint, Milestone, Smile, Sprout } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent } from '@/components/site/SiteBits';
import site from '@/components/site/site.module.css';
import {
  ArticleCta,
  ArticleHero,
  ArticleSection,
  CaptionedPhoto,
  FaqBlock,
  NumberedPanels,
  QuoteBlock,
  Reading,
  TableNote,
} from '@/components/site/seo-articles/ArticleBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';

const PATH = '/features/loved-ones';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Loved Ones: Private Memorial and Life Story Pages';
const HEADLINE = 'A page for every person who shaped your family';
const DESCRIPTION =
  "Give each person in your family, living or passed, a private page with their photo, dates and life story in four chapters, linked to the albums they're in.";

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
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Ancestorii: your family’s greatest stories, told together',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | Ancestorii`,
    description: DESCRIPTION,
    images: ['/og-default.jpg'],
  },
};

// Shown on the page and written into the FAQPage structured data, word for word.
const FAQ = [
  {
    q: "Can I create a page for someone who's still alive?",
    a: 'Yes. Leave the date of death empty and the page shows them as Living, with their age worked out from their birth date and a countdown to their next birthday. It is often easier to write the chapters while they can still answer the questions themselves.',
  },
  {
    q: 'Is a Loved Ones page public like an online memorial?',
    a: "No. It is private to your family space: only the people in it can see it, and it never appears on Our Stories or in search results. If you want to share part of someone's story publicly, you can write it as a separate story on Our Stories.",
  },
  {
    q: 'How many loved ones can I add on the Free plan?',
    a: 'One. Premium, at £3.99 a month for the whole family, lets you add as many as you like. Albums, timelines and capsules are unlimited on both plans, and there is no cap on the family members you invite.',
  },
  {
    q: 'What should I write in the four chapters?',
    a: 'Each chapter comes with guiding questions. Early years asks where they were born and what home was like. Important moments asks what changed the direction of their life and what made them proud. Special memories asks which memory still makes you smile. Who they are asks about their energy, habits and phrases. A few honest sentences in each is a good start, and you can add more later.',
  },
  {
    q: 'Can I link photos and timelines to a person?',
    a: 'Yes. Tag a loved one on an album, timeline or capsule and it appears on their page, which shows a Connected Memories count and shortcuts to add a timeline, album or capsule.',
  },
];

const KEY_FACTS = [
  <>
    Each profile holds a <strong>name, photo, relationship and dates</strong>, with their age or
    &ldquo;Living&rdquo; worked out for you.
  </>,
  <>
    Their life story is told in <strong>four chapters</strong>, each with guiding questions and a
    photo: Early years, Important moments, Special memories and Who they are.
  </>,
  <>
    The page gathers <strong>every timeline, album and capsule</strong> tagged with them, with a
    Connected Memories count.
  </>,
  <>
    <strong>Free families can add 1 loved one.</strong> Premium families, at £3.99 a month for the
    whole family, can add unlimited.
  </>,
  <>
    Profiles are <strong>private to your family space</strong> and never appear on Our Stories or in
    search results.
  </>,
];

const CHAPTERS = [
  {
    number: 'Chapter 1',
    title: 'Early years',
    body: 'Where were they born? What was home like? What do you remember about their childhood? Were there family traditions, routines, or favourite places?',
    Icon: Sprout,
  },
  {
    number: 'Chapter 2',
    title: 'Important moments',
    body: 'What moments changed the direction of their life? What made them proud? Which milestones should never be forgotten? What seasons of life shaped them most?',
    Icon: Milestone,
  },
  {
    number: 'Chapter 3',
    title: 'Special memories',
    body: 'Which memory still makes you smile? What family tradition always stands out? Was there a holiday, gathering, or moment that felt unforgettable? What simple memory meant more than it seemed at the time?',
    Icon: Smile,
  },
  {
    number: 'Chapter 4',
    title: 'Who they are',
    body: 'How would you describe their energy? What little habits or phrases made them feel like them? How do people remember them? What made them different from everyone else?',
    Icon: Fingerprint,
  },
];

const SOURCES: Source[] = [
  {
    publisher: 'Cruse Bereavement Support',
    title: 'Ways to remember',
    href: 'https://www.cruse.org.uk/understanding-grief/managing-grief/ways-to-remember-someone-who-has-died/',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Routledge (Taylor & Francis)',
    title:
      'Continuing Bonds: New Understandings of Grief, edited by Dennis Klass, Phyllis R. Silverman and Steven Nickman',
    href: 'https://www.routledge.com/Continuing-Bonds-New-Understandings-of-Grief/Klass-Nickman-Silverman/p/book/9781560323396',
    date: '1996',
  },
];

export default function LovedOnesPage() {
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
            { name: 'Loved Ones', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[
            { href: '/', label: 'Home' },
            { href: '/features', label: 'Features' },
            { label: 'Loved Ones' },
          ]}
          size="md"
          title={
            <>
              A page for every person <Accent>who shaped your family.</Accent>
            </>
          }
          intro={[
            'A Loved Ones page gives each person in your family, living or passed, a private profile with their photo, relationship and dates, a life story in four guided chapters, and links to every album, timeline and capsule they appear in. Free families can add 1 loved one; Premium families, at £3.99 a month, can add as many as they like.',
            'It is not a public memorial site. Only the people in your family space can see it.',
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        {/* Key facts beside a real photo from the founder's family */}
        <ArticleSection
          aside={
            <CaptionedPhoto
              src="/family.jpg"
              alt="Dante and his mum sitting on the floor"
              label="Dante and his mum · May 2011"
              color="var(--c2)"
              position="88% 50%"
              caption={
                <>
                  &ldquo;Me and my mum. The woman behind everything.&rdquo; From the founder&apos;s own
                  family photos.
                </>
              }
            />
          }
        >
          <KeyFacts items={KEY_FACTS} />
        </ArticleSection>

        {/* What goes on the page */}
        <ArticleSection
          id="the-page"
          kicker="The page"
          dot="var(--c1)"
          title={
            <>
              What goes on a <Accent tone="blue">Loved Ones page?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              You start with the basics: their full name, a photo, who they are to you and their
              dates. The relationships are parent, sibling, child, spouse or partner, grandparent,
              auntie or uncle, extended family and friend, and your Loved Ones page groups everyone
              under those headings. Dates go in as DD/MM/YYYY. Leave the date of death empty and the
              page shows them as Living, with their age worked out for you.
            </p>
            <p>From there, each profile becomes a page of its own, with:</p>
            <ul>
              <li>
                <strong>An &ldquo;About them&rdquo; line</strong> of up to 120 characters, prompted with
                &ldquo;[Name] is&hellip;&rdquo;.
              </li>
              <li>
                <strong>Their life status and span</strong>: Living or Forever Remembered, with the
                year they were born and, where it applies, the year they died.
              </li>
              <li>
                <strong>A birthday countdown</strong> for someone living, such as &ldquo;turns 80 in
                12&nbsp;days&rdquo;.
              </li>
              <li>
                <strong>Their life story</strong> in four chapters, each with its own photo.
              </li>
              <li>
                <strong>Connected Memories</strong>: every timeline, album and capsule tagged with
                them, with shortcuts to add more.
              </li>
            </ul>
          </Reading>
        </ArticleSection>

        {/* Remembering someone who has died */}
        <ArticleSection
          id="remembering"
          kicker="Remembering"
          dot="var(--c3)"
          title={
            <>
              Can you make one for someone <Accent tone="pink">who has died?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Yes. Add their date of death and the page changes with it: their life status reads
              Forever Remembered, the span shows the years they lived, and the page describes itself
              as a dedicated space to preserve their story, albums, moments and messages for the
              future.
            </p>
            <p>
              Keeping a bond with someone who has died has a place in grief research. In 1996, Dennis
              Klass, Phyllis R. Silverman and Steven Nickman published{' '}
              <em>Continuing Bonds: New Understandings of Grief</em>, which challenged the dominant{' '}
              <span style={{ whiteSpace: 'nowrap' }}>20th-century</span> model that the purpose of
              grief is to &ldquo;cut bonds with the
              deceased&rdquo;. The book argued that a healthy resolution of grief lets people keep a
              continuing bond with the person who died, and that &ldquo;such bonds are not
              denial&rdquo;.
            </p>
            <p>
              It works just as well for the living. A page made now for a parent or grandparent can be
              filled in with them, and the chapter questions make a natural conversation. Our list of{' '}
              <Link href="/guides/questions-to-ask-your-parents-about-their-life">
                questions to ask your parents about their life
              </Link>{' '}
              has thirty more.
            </p>
          </Reading>
        </ArticleSection>

        {/* The four chapters */}
        <ArticleSection
          id="four-chapters"
          layout="wide"
          kicker="Four chapters"
          dot="var(--c0)"
          title={
            <>
              How do the four life-story <Accent tone="blue">chapters work?</Accent>
            </>
          }
        >
          <NumberedPanels items={CHAPTERS} />
          <TableNote>
            The questions above are the ones each chapter asks. Every chapter also has its own photo
            and its own space to write, and you can fill them in any order.
          </TableNote>
        </ArticleSection>

        {/* Privacy */}
        <ArticleSection
          id="privacy"
          kicker="Privacy"
          dot="var(--c2)"
          title={
            <>
              Who can see a <Accent tone="pink">Loved Ones page?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Only the people in your family space. Loved Ones pages live in My Family, the private
              side of Ancestorii, where everyone you invite can see everything and nobody else can.
              They do not appear on Our Stories, the public story feed, and they never show up in
              search results.
            </p>
            <p>
              There is no public version of a Loved Ones page. If you want to share part of
              someone&apos;s story more widely, you can write it as a story on Our Stories, which is a
              separate step you take on purpose, and you can take it down at any time.
            </p>
          </Reading>
        </ArticleSection>

        {/* Beyond the page */}
        <ArticleSection
          id="beyond-the-page"
          kicker="Beyond the page"
          dot="var(--c1)"
          title={
            <>
              What else helps keep someone&apos;s <Accent tone="blue">memory alive?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Cruse Bereavement Support describes a memory box as &ldquo;a simple way to remember
              someone who has died&rdquo;. Its other suggestions include speaking to people who knew
              them, making a photo collage, writing them a letter, choosing a day each year to
              dedicate to them (perhaps their birthday), cooking their favourite food and learning
              their favourite song.
            </p>
            <p>
              Several of those carry over to a family library. A collage can become an album tagged
              with their name. A letter can go into a capsule that opens on their birthday. A{' '}
              <Link href="/features/family-timeline">timeline</Link> can set out their life in order,
              and relatives can add voice notes with their own memories of them. A printed{' '}
              <Link href="/memory-books">Memory Book</Link>, from £44.99 plus delivery, turns the
              photos and words into something to hold. Andrea, from Dudley, made one about her late
              dad: &ldquo;It captured the essence of him and the life he lived.&rdquo;
            </p>
            <p>
              Our guide to{' '}
              <Link href="/guides/how-to-keep-memories-of-a-loved-one-alive">
                keeping the memory of a loved one alive
              </Link>{' '}
              goes further.
            </p>
          </Reading>
        </ArticleSection>

        <QuoteBlock>
          A photo tells you what someone looked like.{' '}
          <Accent tone="blue">It does not tell you who they were.</Accent>
        </QuoteBlock>

        {/* Plans */}
        <ArticleSection
          id="plans"
          kicker="Plans"
          dot="var(--c3)"
          title={
            <>
              How many profiles <Accent tone="pink">can you create?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              On the Free plan, a family can add 1 loved one. Premium, at £3.99 a month for the whole
              family rather than per person, removes the limit and raises storage from 1&nbsp;GB to
              100&nbsp;GB. If you try to add a second profile on Free, the website tells you that you have
              reached your plan&apos;s limit. The full plan details are on the{' '}
              <Link href="/pricing">pricing</Link> page.
            </p>
            <p>
              Loved Ones are profiles of the people in your story. They are not the same as the family
              members you invite into your space, and there is no cap on those. Albums, timelines and
              capsules are unlimited on both plans. If you ever cancel Premium, nothing is deleted:
              existing profiles stay, and only adding new ones beyond the Free limit stops.
            </p>
          </Reading>
        </ArticleSection>

        {/* Where Ancestorii fits */}
        <ArticleSection
          id="where-ancestorii-fits"
          kicker="Where Ancestorii fits"
          dot="var(--c0)"
          title={
            <>
              How does <Accent tone="blue">Ancestorii help?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              The pieces of a person usually end up scattered: photos on several phones, stories in a
              few people&apos;s heads. A Loved Ones page gives them one home that grows each time an
              album, timeline or capsule is tagged with their name. It stays private to your family and
              works for the living as well as the dead. If the words will not come, Story Assistance,
              Ancestorii&apos;s optional AI <Link href="/features/writing-help">writing help</Link>,
              can suggest prompts for each of the four chapters, and you decide what to keep.
            </p>
            <p>What it is not: a family tree, a genealogy research tool or a public tribute page.</p>
          </Reading>
        </ArticleSection>

        {/* Questions */}
        <ArticleSection
          id="questions"
          kicker="Questions"
          dot="var(--c1)"
          title={
            <>
              Questions about <Accent tone="pink">Loved Ones.</Accent>
            </>
          }
        >
          <FaqBlock items={FAQ} variant="open" />
        </ArticleSection>

        <ArticleSection>
          <Sources items={SOURCES} />
          <div className={site.sectionBody}>
            <AuthorBox updated="17 October 2026" />
          </div>
        </ArticleSection>

        <ArticleCta
          title={
            <>
              Start with one.
              <br />
              Write their story.
            </>
          }
          lead="Free to start. One loved one on Free, unlimited on Premium."
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
