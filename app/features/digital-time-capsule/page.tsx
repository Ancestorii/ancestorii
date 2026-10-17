import Link from 'next/link';
import type { Metadata } from 'next';
import { CalendarCheck, ImagePlus, Lock, PenLine } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent } from '@/components/site/SiteBits';
import site from '@/components/site/site.module.css';
import {
  ArticleCta,
  ArticleHero,
  ArticleSection,
  CheckList,
  FaqBlock,
  NumberedPanels,
  QuoteBlock,
  Reading,
} from '@/components/site/seo-articles/ArticleBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';

const PATH = '/features/digital-time-capsule';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Digital Time Capsule App for Families';
const HEADLINE = 'A digital time capsule that opens on the day you choose';
const DESCRIPTION =
  'Seal photos, videos, a letter and voice notes in a digital time capsule that opens on the date you choose. Unlimited capsules on every Ancestorii plan.';

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
    q: "Can I add to a capsule after it's sealed?",
    a: 'No. Once a capsule is sealed, Ancestorii will not let you open or edit it until its date, so add everything first. Until you press Seal Capsule, you can change the title, message, date and cover photo, and add or remove photos, videos, the letter and voice notes.',
  },
  {
    q: 'Will anyone be notified when a capsule opens?',
    a: 'No. Ancestorii does not send a notification when a capsule opens. It opens automatically on its date, because a scheduled check runs every 10 minutes, and you will see it open on the Capsules page. Put the date in your calendar and tell the people it is for.',
  },
  {
    q: 'Who can see a sealed capsule?',
    a: "Everyone in your family space can see the capsule's card: its cover photo, title, short message and a countdown to the date. What is inside stays locked in Ancestorii until then, and nobody outside your family space can see any of it.",
  },
  {
    q: 'Can I make a time capsule on my phone?',
    a: 'Capsules are made on the Ancestorii website, not in the iPhone or Android app. Sign in on the website with the same email and password you use in the app.',
  },
  {
    q: 'What should I put in a family time capsule?',
    a: 'A letter, photos and videos of everyday life as it is now, and a voice note or two, because they keep what changes fastest: faces, voices, homes and routines. Tag the people the capsule is about so it also appears on their Loved Ones pages.',
  },
];

const KEY_FACTS = [
  <>
    Each capsule has a <strong>title, a short message, an opening date</strong> and an optional
    cover photo.
  </>,
  <>
    Inside go <strong>photos and videos, a letter and voice notes</strong>, plus tags for the loved
    ones it is about.
  </>,
  <>
    Once sealed, a capsule <strong>shows as locked until its date</strong>, and Ancestorii will not
    open it or let you edit it. A scheduled check opens due capsules every 10&nbsp;minutes.
  </>,
  <>
    <strong>Unlimited capsules on every plan</strong>, including Free. Premium is £3.99 a month for
    the whole family.
  </>,
  <>
    Capsules are made on the <strong>Ancestorii website</strong>. They are not part of the phone
    app.
  </>,
  <>
    The International Time Capsule Society estimates that{' '}
    <strong>80&nbsp;percent of time capsules will be lost</strong>.
  </>,
];

const STEPS = [
  {
    number: '01',
    title: 'Create it',
    body: 'Give it a title, a short message for the front, the date it should open and, if you like, a cover photo. The date can be today or any day after.',
    Icon: PenLine,
  },
  {
    number: '02',
    title: 'Fill it',
    body: 'Add photos and videos, or pick them from your family Library. Write the letter, record voice notes and tag the people it is about. Everything stays editable until you seal it.',
    Icon: ImagePlus,
  },
  {
    number: '03',
    title: 'Seal it',
    body: 'Press Seal Capsule and confirm. From then on it shows as locked, with its opening date and a countdown, and you cannot open or edit it until that date.',
    Icon: Lock,
  },
  {
    number: '04',
    title: 'Open it',
    body: 'On the date, the capsule opens for everyone in your family. A scheduled check runs every 10 minutes, but nobody is sent a notification, so put the date in your calendar.',
    Icon: CalendarCheck,
  },
];

const BEFORE_YOU_SEAL = [
  <>
    <strong>Sealing is final until the date.</strong> You cannot add a forgotten photo or fix a
    typo afterwards, so check everything first.
  </>,
  <>
    <strong>The front stays visible.</strong> The title, short message and cover photo show while
    it is sealed, so keep the surprise inside.
  </>,
  <>
    <strong>Nobody is notified when it opens.</strong> Put the date in your calendar and tell the
    people it is for.
  </>,
  <>
    <strong>It stays with the account that made it.</strong> Only that person can delete it, and if
    they delete their Ancestorii account, their capsules are deleted too.
  </>,
  <>
    <strong>Keep your originals.</strong> A capsule should never be the only copy of a photo or
    recording you cannot replace.
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'Oglethorpe University',
    title: 'Crypt of Civilization',
    href: 'https://oglethorpe.edu/about/history/crypt/',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Oglethorpe University',
    title: 'International Time Capsule Society to digitally preserve thousands of records',
    href: 'https://oglethorpe.edu/news/time-capsule-society-to-preserve-records/',
    date: '11 January 2021',
  },
  {
    publisher: 'Library of Congress',
    title: 'Personal Archiving: Keeping Personal Digital Photographs',
    href: 'https://www.digitalpreservation.gov/personalarchiving/photos.html',
    date: 'accessed October 2026',
  },
];

export default function DigitalTimeCapsulePage() {
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
            { name: 'Digital time capsule', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[
            { href: '/', label: 'Home' },
            { href: '/features', label: 'Features' },
            { label: 'Digital time capsule' },
          ]}
          size="md"
          title={
            <>
              A digital time capsule <Accent>that opens on the day you choose.</Accent>
            </>
          }
          intro={[
            'A digital time capsule is a private collection of photos, videos, a letter and voice recordings that stays sealed until a date you choose. Ancestorii capsules open automatically for your family on that date, and you can make as many as you like on every plan, including the free one.',
            "A capsule suits a child's 18th birthday, a wedding anniversary or a letter to yourself ten years from now. Below is exactly how sealing works, what to put inside, and what to know before you press the button.",
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        <ArticleSection
          id="at-a-glance"
          kicker="At a glance"
          dot="var(--c1)"
          title={
            <>
              Time capsules, <Accent tone="blue">in short.</Accent>
            </>
          }
        >
          <KeyFacts items={KEY_FACTS} />
        </ArticleSection>

        {/* What goes inside */}
        <ArticleSection
          id="what-goes-inside"
          kicker="What goes inside"
          dot="var(--c2)"
          title={
            <>
              What can you put in a <Accent tone="blue">digital time capsule?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              An Ancestorii capsule has a front and an inside. The front is what your family sees
              while they wait: a title, a short message and, if you like, a cover photo. The inside is
              what stays sealed:
            </p>
            <ul>
              <li>
                <strong>Photos and videos.</strong> Upload them, or pick them from your family
                Library.
              </li>
              <li>
                <strong>A letter.</strong> Each capsule has room for one letter, which starts from the
                prompt &ldquo;Dear future me&hellip;&rdquo; and shows who wrote it and when.
              </li>
              <li>
                <strong>Voice notes.</strong> Record them in your browser or upload an audio file.
                Each one shows who left it and when, and recordings are converted to M4A where needed
                so they play on any phone. More on <Link href="/features/voice-notes">voice notes</Link>.
              </li>
              <li>
                <strong>The people it is about.</strong> Tag a loved one and the capsule also appears
                on their <Link href="/features/loved-ones">Loved Ones page</Link>.
              </li>
            </ul>
            <p>
              The things that make a capsule worth opening are usually the ordinary details that feel
              too obvious to record: what a normal Tuesday looks like, who sits where at Sunday lunch,
              what a loaf of bread costs, the song nobody can escape this year. Photos of the house,
              the street and the people as they are today will mean more in 18&nbsp;years than one perfect
              portrait. Our guide to{' '}
              <Link href="/guides/what-to-put-in-a-time-capsule">what to put in a time capsule</Link>{' '}
              has a longer list.
            </p>
          </Reading>
        </ArticleSection>

        {/* How sealing works */}
        <ArticleSection
          id="how-sealing-works"
          layout="wide"
          kicker="How it works"
          dot="var(--c0)"
          title={
            <>
              How does sealing work, <Accent tone="pink">and when does it open?</Accent>
            </>
          }
        >
          <NumberedPanels items={STEPS} />
        </ArticleSection>

        {/* Why capsules get lost */}
        <ArticleSection
          id="why-capsules-get-lost"
          kicker="A short history"
          dot="var(--c3)"
          title={
            <>
              Why do so many time capsules <Accent tone="blue">get lost?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              The Crypt of Civilization at Oglethorpe University is a time capsule the size of a
              room: 20&nbsp;feet long, 10&nbsp;feet high and 10&nbsp;feet wide. It was sealed on
              28&nbsp;May&nbsp;1940 and is not to be opened until 28&nbsp;May&nbsp;8113. Thornwell
              Jacobs, the university&apos;s president at the time, reasoned that the first known date in
              recorded history, 4241&nbsp;BC, lay 6,177&nbsp;years in the past, so the crypt should wait
              6,177&nbsp;years too. The 1990 Guinness Book of World Records
              called it &ldquo;the first successful attempt to bury a record for any future
              inhabitants&rdquo;.
            </p>
            <p>
              Most capsules fare worse. The International Time Capsule Society, set up at Oglethorpe
              in 1990, estimates that 80&nbsp;percent of time capsules will be lost &ldquo;due to thievery,
              secrecy or just poor planning&rdquo;. In practice that means a box whose location nobody
              wrote down, or an opening date that passes without anyone remembering.
            </p>
            <p>
              A digital capsule takes care of the &ldquo;where is it?&rdquo; problem, because it sits
              in your family&apos;s account with its date on the front. It has weak points of its own:
              accounts get closed, services change and file formats age. So treat a capsule as the
              way something gets delivered on a date, not the only place it is kept. The Library of
              Congress advises keeping at least two copies of the photos you care about, stored
              &ldquo;in different locations that are as physically far apart as practical&rdquo;, and
              checking them at least once a year.
            </p>
          </Reading>
        </ArticleSection>

        <QuoteBlock>
          Write the date where your family will see it.{' '}
          <Accent tone="blue">Then tell them it is coming.</Accent>
        </QuoteBlock>

        {/* Choosing a date */}
        <ArticleSection
          id="choosing-a-date"
          kicker="Choosing a date"
          dot="var(--c1)"
          title={
            <>
              When should a capsule <Accent tone="pink">open?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Choose a date that already means something to the people who will open it. Ancestorii
              does not send a reminder when a capsule opens, so a birthday or an anniversary is far
              easier to remember than a date picked at random. Dates that work well:
            </p>
            <ul>
              <li>
                <strong>An 18th birthday.</strong> A capsule made in a child&apos;s first years and
                opened at 18 is the classic. Ancestorii accounts are for people aged 16 and over
                (under-18s need a parent&apos;s consent), so they can have their own account in time
                to open it.
              </li>
              <li>
                <strong>A wedding anniversary.</strong> Seal the photos, the speeches and a letter to
                each other, then open them on your 10th or 25th.
              </li>
              <li>
                <strong>A new chapter.</strong> A first day at school, leaving home or moving house:
                seal what life looks like now and open it five or ten years on.
              </li>
              <li>
                <strong>A round number.</strong> Ten or twenty years from today. A short gap means
                the people who sealed it will probably open it; a long one makes it a gift to the
                next generation.
              </li>
            </ul>
            <p>
              You can change the date as often as you like until you seal the capsule. After that, it
              is fixed.
            </p>
          </Reading>
        </ArticleSection>

        {/* Who can see it */}
        <ArticleSection
          id="who-can-see-it"
          kicker="Privacy"
          dot="var(--c2)"
          title={
            <>
              Who can see <Accent tone="blue">a capsule?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              A capsule belongs to My Family, your family&apos;s private space on Ancestorii. Only
              members of your family space can see it. It never appears on Our Stories,
              Ancestorii&apos;s public story feed, or in search results.
            </p>
            <p>
              Inside the family, everyone can see that a capsule exists. Its card shows the cover
              photo, title, short message, opening date and a countdown such as
              &ldquo;2&nbsp;years 3&nbsp;months remaining&rdquo;. The photos, videos, letter and voice notes inside stay locked
              in Ancestorii until the date, then open for everyone in the family space.
            </p>
            <p>
              The seal is there to keep a surprise, not to guard a secret. Do not use a capsule for
              passwords, legal papers or anything that must stay hidden from your family.
            </p>
          </Reading>
        </ArticleSection>

        {/* Before you seal */}
        <ArticleSection
          id="before-you-seal"
          kicker="Before you seal"
          dot="var(--c0)"
          title={
            <>
              What should you know <Accent tone="pink">before you seal one?</Accent>
            </>
          }
        >
          <CheckList items={BEFORE_YOU_SEAL} />
        </ArticleSection>

        {/* Where Ancestorii fits */}
        <ArticleSection
          id="where-ancestorii-fits"
          kicker="Where Ancestorii fits"
          dot="var(--c3)"
          title={
            <>
              How does <Accent tone="blue">Ancestorii help?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Ancestorii is a private library for a family&apos;s photos, voices and stories, and
              capsules are one part of it. A capsule can draw on photos already in your family
              Library and be tagged to the people it is about, so it sits alongside their albums and
              timelines rather than in a folder of its own.
            </p>
            <p>
              Capsules are unlimited on both plans. The Free plan costs nothing and includes 1&nbsp;GB of
              storage for the whole family, with files up to 20&nbsp;MB each. Premium is £3.99 a month
              for the whole family, with 100&nbsp;GB and files up to 10&nbsp;GB (see{' '}
              <Link href="/pricing">pricing</Link>). If the words will not come, Story Assistance,
              Ancestorii&apos;s optional AI <Link href="/features/writing-help">writing help</Link>,
              can suggest a two-paragraph letter, a description and ideas for what to say in a voice
              note. You choose what to keep.
            </p>
            <p>What it does not do: send an alert on the day, or make capsules in the phone app.</p>
          </Reading>
        </ArticleSection>

        {/* Questions */}
        <ArticleSection
          id="questions"
          kicker="Questions"
          dot="var(--c1)"
          title={
            <>
              Questions about <Accent tone="pink">capsules.</Accent>
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
              Seal it today.
              <br />
              Open it on its day.
            </>
          }
          lead="Free to start. Unlimited capsules on every plan."
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
