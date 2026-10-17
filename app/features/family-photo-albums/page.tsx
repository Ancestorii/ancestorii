import Link from 'next/link';
import type { Metadata } from 'next';
import { CalendarDays, MapPin, MessageSquareText, Users } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent } from '@/components/site/SiteBits';
import site from '@/components/site/site.module.css';
import {
  ArticleCta,
  ArticleHero,
  ArticleSection,
  CaptionedPhoto,
  CheckList,
  FaqBlock,
  NumberedPanels,
  QuoteBlock,
  Reading,
  TableNote,
} from '@/components/site/seo-articles/ArticleBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';

const PATH = '/features/family-photo-albums';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Shared Family Photo Albums with Stories and Voices';
const HEADLINE = 'Family photo albums that keep the story behind each picture';
const DESCRIPTION =
  'Group family photos into albums, then add a date, the story and voice notes to each picture. Unlimited albums on every plan, and relatives can add theirs.';
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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Ancestorii family photo albums' }],
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
    q: 'How many photos can I put in an album?',
    a: 'There is no set number. Albums are unlimited, and what limits you is your family’s shared storage: 1 GB on the Free plan, with files up to 20 MB each, or 100 GB on Premium, with files up to 10 GB. You can upload up to 20 photos and videos at a time.',
  },
  {
    q: 'Can relatives add their own memories to my photos?',
    a: 'Yes. Everyone in your family space can add to The Story under any photo, give it a name or a date, and record a voice note. Each story entry shows who wrote it and when. Only the person who created the album can delete it or remove anything from it.',
  },
  {
    q: 'Can I record my voice on a photo?',
    a: 'Yes. Every photo and video in an album has its own voice notes. On the website you can record one in your browser or upload an audio file, and other family members can add theirs too. New recordings are converted to M4A automatically so they play on any phone.',
  },
  {
    q: 'What date should I give a photo if nobody knows the year?',
    a: 'Write what you do know. The date on an album photo is free text, so “Summer 1994”, “about 1962” or “the winter we moved house” all work. A season and a rough year is more use to the next generation than a blank, and a relative can correct it later.',
  },
  {
    q: 'Do albums work in the phone app?',
    a: 'Yes. The free Ancestorii app for iPhone and Android lets you and your invited family capture and view memories, albums, timelines, voice notes and family profiles. Premium upgrades and print orders happen on the website, with the same email and password.',
  },
];

const KEY_FACTS = [
  <>
    <strong>Unlimited albums</strong> on both the Free and Premium plans.
  </>,
  <>
    Every photo or video can have a <strong>name, a date, a story thread and voice notes</strong>. Dates
    are free text, so a rough one is fine.
  </>,
  <>
    Upload <strong>up to 20 photos and videos at a time</strong>, or add them from your family Library.
    iPhone HEIC photos are converted to JPEG automatically.
  </>,
  <>
    Free families share <strong>1&nbsp;GB</strong> of storage, with files up to 20&nbsp;MB. Premium,
    at £3.99 a month per family, shares <strong>100&nbsp;GB</strong>, with files up to 10&nbsp;GB.
  </>,
  <>Only the people you invite to your family space can see an album.</>,
  <>Optional writing help can suggest an album description, photo captions and ideas for a voice note.</>,
];

const PHOTO_PARTS = [
  <>
    <strong>A name.</strong> A short heading such as “Grandad’s first car”, so the picture makes sense
    at a glance.
  </>,
  <>
    <strong>A date.</strong> It is free text, so “about 1962” or “the winter we moved house” work when
    nobody knows the exact day.
  </>,
  <>
    <strong>The story.</strong> Under each picture is a thread called The Story. Anyone in the family
    can add what they remember, and every entry shows who wrote it and when.
  </>,
  <>
    <strong>Voice notes.</strong> Record one in your browser or upload an audio file. New recordings
    are converted to M4A automatically, so they play on any phone. More on{' '}
    <Link href="/features/voice-notes" className={site.textLink}>
      voice notes
    </Link>
    .
  </>,
];

const CAPTION_PARTS = [
  {
    number: '01',
    title: 'Who is in it.',
    body: 'Full names, left to right, and how each person is related to you. “Uncle Ray, Mum’s older brother” will mean far more in fifty years than “Ray”.',
    Icon: Users,
  },
  {
    number: '02',
    title: 'Where it was taken.',
    body: 'The town, the street or the house. Even “Nan’s back garden in Cardiff” gives a grandchild something to look for.',
    Icon: MapPin,
  },
  {
    number: '03',
    title: 'When it happened.',
    body: 'An exact date if you have one, a season and a year if you don’t. A rough date is far more use than a blank.',
    Icon: CalendarDays,
  },
  {
    number: '04',
    title: 'Why it was kept.',
    body: 'A sentence or two on what was happening and why it matters. It is the part nobody else can fill in later.',
    Icon: MessageSquareText,
  },
];

const SOURCES: Source[] = [
  {
    publisher: 'Library of Congress',
    title: 'Personal Archiving: Digital Photos',
    href: 'https://digitalpreservation.gov/personalarchiving/photos.html',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Apple Support',
    title: 'Using HEIF or HEVC media on Apple devices',
    href: 'https://support.apple.com/en-gb/116944',
    date: '2025',
  },
];

export default function FamilyPhotoAlbumsPage() {
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
            { name: 'Features', path: '/features' },
            { name: 'Family photo albums', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[
            { href: '/', label: 'Home' },
            { href: '/features', label: 'Features' },
            { label: 'Family photo albums' },
          ]}
          size="md"
          title={
            <>
              Family photo albums that keep <Accent>the story behind each picture.</Accent>
            </>
          }
          intro={[
            'Ancestorii albums let your family group the photos and videos from one chapter of life, then give each picture a name, a date (even a loose one like “Summer 1994”), a written story and recorded voice notes. Albums are unlimited on every plan, and everyone you invite to your private family space can add to them.',
            'A grid of pictures keeps the faces but not the reasons. Years later nobody can say who is standing next to Grandad, or why that beach mattered. An album on Ancestorii keeps the answers beside each photo, in your family’s own words and voices.',
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        {/* Key facts beside one of the founder's own captioned family photos */}
        <ArticleSection
          aside={
            <CaptionedPhoto
              src="/garden.jpg"
              alt="Dante and his sister in the garden"
              label="Dante and his sister · May 2013"
              color="var(--c3)"
              caption={'“Me and my sister in the garden. Mum’s favourite photo of us.” May 2013, from the founder’s own family photos.'}
              position="50% 40%"
              priority
            />
          }
        >
          <KeyFacts items={KEY_FACTS} />
        </ArticleSection>

        <ArticleSection
          id="each-photo"
          kicker="Each photo"
          dot="var(--c1)"
          title={
            <>
              What can you add to each photo <Accent tone="blue">in an album?</Accent>
            </>
          }
        >
          <CheckList items={PHOTO_PARTS} />
          <Reading>
            <p>
              The album itself has a title, a short description and an optional cover photo. Inside,
              pictures sit in a grid of one to three columns depending on your screen, and photos open
              full screen. Choose one and a panel opens with its name, date, story and voice notes
              together, so the picture and what it means stay in one place.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="how-many"
          kicker="Space"
          dot="var(--c2)"
          title={
            <>
              How many albums and photos <Accent tone="pink">can you keep?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              There is no limit on the number of albums on either plan, and no set number of photos in an
              album. The ceiling is your family’s storage, which is one pool shared by everyone in your
              family space: <strong>1&nbsp;GB on the Free plan and 100&nbsp;GB on Premium</strong>.
              Single files can be up to 20&nbsp;MB on Free and up to 10&nbsp;GB on Premium.
            </p>
            <p>
              Premium costs £3.99 a month for the whole family, not per person, and the{' '}
              <Link href="/pricing">pricing page</Link> sets the two plans side by side. Photos and videos
              upload up to 20 at a time: drag them in, choose them from your device, or add pictures your
              family has already put in the <Link href="/features/family-library">family Library</Link>.
            </p>
            <p>
              To be straight about it, 1&nbsp;GB suits a chosen set of photos rather than everything on
              everyone’s phones. Keep the whole collection backed up elsewhere and bring the pictures worth
              explaining here.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="who-can-add"
          kicker="Together"
          dot="var(--c3)"
          title={
            <>
              Who can add to <Accent tone="blue">a family album?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Everyone you invite into your family space. Any member can add photos and videos to an
              album, name a picture, set its date, add to its story and record a voice note. That is what
              makes it a family album rather than a shared folder: your aunt can put a name to a face
              nobody else knew, and your dad can tell the story behind a photo in his own voice.
            </p>
            <p>
              Deleting is more careful: only the person who created an album can delete it or take
              anything out of it.
            </p>
            <p>
              You can also tag the people an album is about from their Loved Ones profiles, and the album
              then shows on each person’s profile. The Free plan includes one Loved Ones profile; Premium
              has no limit.
            </p>
          </Reading>
        </ArticleSection>

        <QuoteBlock>
          A photo tells you what someone looked like.{' '}
          <Accent tone="blue">It does not tell you who they were.</Accent>
        </QuoteBlock>

        <ArticleSection
          id="heic"
          kicker="iPhone photos"
          title={
            <>
              Do iPhone HEIC <Accent tone="pink">photos work?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Yes. Since iOS&nbsp;11, iPhones have saved photos in HEIF, the High Efficiency Image File
              Format, usually as .heic files. Apple says the format compresses better than JPEG, but it
              also recommends iOS&nbsp;11 or macOS High Sierra or later to view, edit or duplicate these files
              fully, so older devices can struggle with them.
            </p>
            <p>
              Ancestorii converts HEIC photos to JPEG as they upload, so everyone in the family can see
              them on whatever they use. You don’t need to change anything on your phone.
            </p>
            <p>
              If you would rather your iPhone saved JPEGs in the first place, Apple’s steps are: open
              Settings, tap Camera, tap Formats, then tap Most Compatible. New photos and videos are then
              saved as JPEG and H.264. Either way, keep your original files backed up somewhere else as
              well.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="captions"
          layout="wide"
          kicker="Captions"
          dot="var(--c1)"
          title={
            <>
              How should you caption <Accent tone="blue">old family photos?</Accent>
            </>
          }
        >
          <NumberedPanels items={CAPTION_PARTS} />
          <TableNote>
            The Library of Congress gives the same advice for digital photos: descriptive file names, tags
            with the names of the people in them, and a brief description. For prints, see our guides to{' '}
            <Link href="/guides/how-to-label-old-photos" className={site.textLink}>
              labelling old photos
            </Link>{' '}
            and{' '}
            <Link href="/guides/what-to-do-with-old-family-photos" className={site.textLink}>
              what to do with old family photos
            </Link>
            .
          </TableNote>
        </ArticleSection>

        <ArticleSection
          id="memory-book"
          kicker="In print"
          dot="var(--c2)"
          title={
            <>
              Can an album become <Accent tone="pink">a printed Memory Book?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Yes, with one step to know about. The Memory Book editor takes its photos from your family
              Library rather than straight from an album. Pictures you added to an album from the Library
              are already there, and anything else you can upload inside the book editor, which saves it
              to the Library as you go.
            </p>
            <p>
              Every Memory Book is an A4 landscape hardcover. <strong>A Chapter</strong> has 24 printed
              pages for £44.99, <strong>A Story</strong> has 36 for £54.99 and <strong>A Legacy</strong>{' '}
              has 48 for £64.99, each plus delivery, and books ship to 20 countries. Each photo on a page
              can carry a subheading and a written comment, so the names, dates and stories from your
              album can come with it.
            </p>
            <p>
              One honest limit: a printed book holds photos and words, not sound. Voice notes stay in the
              album, where the family can still play them. See{' '}
              <Link href="/memory-books">how Memory Books work</Link>.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="how-ancestorii-helps"
          kicker="Where we fit"
          dot="var(--c3)"
          title={
            <>
              How it <Accent tone="blue">helps.</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Albums are one part of My Family, the private side of Ancestorii. They sit alongside the
              family Library, timelines, time capsules and Loved Ones profiles, and only the people you
              invite can see any of it. Our Stories, the public feed, is separate and shows only what
              someone chooses to publish there.
            </p>
            <p>
              The Free plan needs no card and includes unlimited albums with 1&nbsp;GB of shared
              storage. Premium adds 100&nbsp;GB and larger files for £3.99 a month per family. Albums work on the
              website and in the free iPhone and Android app.
            </p>
            <p>
              If you get stuck for words, Story Assistance, the optional writing help, can suggest an album
              description, a few photo captions or ideas for what to say in a voice note. You edit what it
              suggests or ignore it, and you can switch it off.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="questions"
          kicker="Questions"
          title={
            <>
              Questions about <Accent tone="blue">family albums.</Accent>
            </>
          }
        >
          <FaqBlock items={FAQ} variant="open" />
        </ArticleSection>

        <ArticleSection id="sources">
          <Sources items={SOURCES} />
          <div className={site.sectionBody}>
            <AuthorBox updated="17 October 2026" />
          </div>
        </ArticleSection>

        <ArticleCta
          title={
            <>
              Put the story back
              <br />
              with the photo.
            </>
          }
          lead="Unlimited albums on every plan, and room for the whole family to add theirs."
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
