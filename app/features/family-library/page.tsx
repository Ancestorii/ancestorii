import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { Copy, FolderOpen, ListChecks, Search } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent } from '@/components/site/SiteBits';
import site from '@/components/site/site.module.css';
import {
  ArticleCta,
  ArticleHero,
  ArticleSection,
  CaptionedPhoto,
  CheckList,
  CompareTable,
  FaqBlock,
  NumberedPanels,
  QuoteBlock,
  Reading,
  TableNote,
} from '@/components/site/seo-articles/ArticleBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';

const PATH = '/features/family-library';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Family Photo Storage: One Shared Family Library';
const HEADLINE = 'One shared library for your family’s photos and videos';
const DESCRIPTION =
  'One shared, private library for your family’s photos and videos, sorted into folders. 1 GB free or 100 GB on Premium, shared by the whole family.';
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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'The Ancestorii family Library' }],
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
    q: 'How much free storage do I get?',
    a: 'The Free plan includes 1 GB of storage for the whole family, with files up to 20 MB each. It needs no card and is not a trial. Premium raises that to 100 GB, with files up to 10 GB, for £3.99 a month per family.',
  },
  {
    q: 'Is storage per person or per family?',
    a: 'Per family. Everything uploaded by anyone in your family space comes out of one shared pool, and one Premium subscription covers everyone in it.',
  },
  {
    q: 'Can I sort photos into folders?',
    a: 'Yes. Each folder has a name, an optional description and an optional date, such as “Holiday 2026”, and you open a folder to upload into it. Photos uploaded straight into the Memory Book, canvas or acrylic editors go into an automatic folder called Uncategorised.',
  },
  {
    q: 'Should I delete photos from my phone once they are uploaded?',
    a: 'Not unless you have other copies. The Library of Congress advises keeping at least two copies of the photos that matter, in different places, and CISA’s 3-2-1 rule suggests three copies on two types of storage with one off-site. iPhone HEIC photos are also converted to JPEG on upload, so keep the originals in your own backup.',
  },
  {
    q: 'What happens to my photos if I stop paying for Premium?',
    a: 'Nothing is deleted. Premium runs to the end of the period you have paid for, then your family moves to the Free plan. Everything already uploaded stays viewable, and only new uploads above the Free limits stop.',
  },
];

const KEY_FACTS = [
  <>
    Folders have a <strong>name, an optional description and an optional date</strong>, such as
    “Holiday 2026”. Photos uploaded in the print editors land in an automatic “Uncategorised” folder.
  </>,
  <>
    The Library is <strong>shared by everyone in your family space</strong>, and nobody outside it can
    see it.
  </>,
  <>
    <strong>Albums, time capsules and timeline events</strong> can use Library photos, and the{' '}
    <strong>Memory Book, canvas and acrylic</strong> editors take their photos from it.
  </>,
  <>
    <strong>Free:</strong> 1&nbsp;GB shared by the family, files up to 20&nbsp;MB.{' '}
    <strong>Premium:</strong> 100&nbsp;GB, files up to 10&nbsp;GB, for £3.99 a month per family.
  </>,
  <>
    Upload <strong>up to 20 photos and videos at a time</strong>. iPhone HEIC photos are converted to
    JPEG.
  </>,
  <>
    If you stop Premium, <strong>nothing is deleted</strong>. Only new uploads above the Free limits
    stop.
  </>,
];

const PLAN_ROWS = [
  ['Price', '£0, no card needed', '£3.99 a month per family'],
  ['Family storage', '1 GB', '100 GB'],
  ['Largest single file', '20 MB', '10 GB'],
  ['Albums, timelines, capsules', 'Unlimited', 'Unlimited'],
  ['Loved Ones profiles', '1', 'Unlimited'],
];

const USES = [
  <>
    <strong>Albums.</strong> Add a Library photo to any album, then give it a name, a date, a story and
    voice notes. See{' '}
    <Link href="/features/family-photo-albums" className={site.textLink}>
      family photo albums
    </Link>
    .
  </>,
  <>
    <strong>Timelines.</strong> Attach Library photos and videos to the events on a{' '}
    <Link href="/features/family-timeline" className={site.textLink}>
      family timeline
    </Link>
    .
  </>,
  <>
    <strong>Time capsules.</strong> Put Library photos in a capsule that opens on a date you choose.
  </>,
  <>
    <strong>Printed keepsakes.</strong> The Memory Book, canvas and acrylic editors all take their
    photos from the Library. Books start at £44.99, and canvases and acrylic prints at £99.99, plus
    delivery.
  </>,
];

const FIRST_STEPS = [
  {
    number: '01',
    title: 'Find them all.',
    body: 'List everywhere your photos live: phones, old computers, memory cards, discs, external drives and online accounts.',
    Icon: Search,
  },
  {
    number: '02',
    title: 'Choose what matters.',
    body: 'Pick the photos that matter most. Keeping everything is not the same as keeping what is important.',
    Icon: ListChecks,
  },
  {
    number: '03',
    title: 'Organise the chosen ones.',
    body: 'Give them clear names and folders, and note who is in each one, where it was taken and when.',
    Icon: FolderOpen,
  },
  {
    number: '04',
    title: 'Copy them, and spread the copies.',
    body: 'Make at least two copies and keep them in different places, then add the chosen photos to your family Library.',
    Icon: Copy,
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
    publisher: 'Cybersecurity and Infrastructure Security Agency (CISA)',
    title: 'Back Up Business Data',
    href: 'https://www.cisa.gov/audiences/small-and-medium-businesses/secure-your-business/back-up-business-data',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Google One Help',
    title: 'How your Google storage works',
    href: 'https://support.google.com/googleone/answer/9312312?hl=en-GB',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Apple Support',
    title: 'iCloud+ plans and pricing',
    href: 'https://support.apple.com/en-gb/108047',
    date: '2026',
  },
  {
    publisher: 'Apple Support',
    title: 'Using HEIF or HEVC media on Apple devices',
    href: 'https://support.apple.com/en-gb/116944',
    date: '2025',
  },
];

// Space above a block that follows long text (the same step the article kit uses after a check list).
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };

export default function FamilyLibraryPage() {
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
            { name: 'Family Library', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[
            { href: '/', label: 'Home' },
            { href: '/features', label: 'Features' },
            { label: 'Family Library' },
          ]}
          size="md"
          title={
            <>
              One shared library <Accent>for your family’s photos and videos.</Accent>
            </>
          }
          intro={[
            'The Ancestorii Library is one private, shared place for your family’s photos and videos, sorted into folders you name and date, and ready to use in any album, timeline, time capsule or printed keepsake. The Free plan includes 1 GB of storage and Premium 100 GB, and either way the space belongs to the whole family, not one person.',
            'Think of it as the family’s working collection: the photos someone has chosen and sorted, ready for everyone else to see and use. It sits alongside your backups rather than replacing them.',
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        {/* Key facts beside a real customer's photo and her own words */}
        <ArticleSection
          aside={
            <CaptionedPhoto
              src="/testimonial1.png"
              alt="Looking through a printed Ancestorii Memory Book together"
              label="Nicole · Nampa, US"
              color="var(--c1)"
              caption="“In my case, I have external hard drives full of photos I never get to see, but Ancestorii finally gave those memories a place where they can be easily enjoyed and shared.”"
              position="58% 50%"
              priority
            />
          }
        >
          <KeyFacts items={KEY_FACTS} />
        </ArticleSection>

        <ArticleSection
          id="what-is-it"
          kicker="The basics"
          dot="var(--c1)"
          title={
            <>
              What is the <Accent tone="blue">family Library?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              The Library is the shared store underneath everything else in your family space. Upload
              photos and videos once, sort them into folders, and they are ready wherever you need them:
              in an album with their stories, on a timeline event, in a time capsule or on the pages of a
              Memory Book.
            </p>
            <p>
              Everyone you invite to your family space shares the same Library, and any member can upload
              photos and videos and create folders. It sits in private storage, and nobody outside your
              family space can see it. You keep ownership of everything you upload; Ancestorii holds only
              the limited licence it needs to run the service.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="storage"
          kicker="Storage"
          dot="var(--c2)"
          title={
            <>
              How much can <Accent tone="pink">your family store?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Storage is per family, not per person. Everything anyone in your family space uploads
              comes out of one shared pool, and one Premium subscription covers everybody. The sidebar
              in your dashboard shows how much of it has been used.
            </p>
            <p>
              For context, as of October&nbsp;2026 Google says each Google Account includes up to
              15&nbsp;GB, shared across Gmail, Google Drive and Google Photos, and Apple gives everyone
              5&nbsp;GB of iCloud storage free. Those allowances are per person and cover everything on
              the account. The Free plan’s 1&nbsp;GB is smaller and is meant for a chosen collection, not
              every picture on every phone. Premium’s 100&nbsp;GB is room for whole archives and video.
            </p>
          </Reading>
          <div style={STACK_GAP}>
            <CompareTable
              head={['Plan', 'Free', 'Premium']}
              rows={PLAN_ROWS}
              highlight={2}
              size="fit"
              labelledBy="storage-title"
            />
          </div>
          <TableNote>
            Plan allowances as of October&nbsp;2026, shared by the whole family. See{' '}
            <Link href="/pricing" className={site.textLink}>
              pricing
            </Link>{' '}
            for everything each plan includes.
          </TableNote>
        </ArticleSection>

        <QuoteBlock>
          Back up every photo. <Accent tone="blue">Explain the ones that matter.</Accent>
        </QuoteBlock>

        <ArticleSection
          id="folders"
          kicker="Folders"
          dot="var(--c3)"
          title={
            <>
              How do <Accent tone="blue">folders work?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Each folder has a name of up to 80 characters, an optional description of up to 300 and an
              optional date, so “Holiday 2026” or “Family Portraits” can carry a line about what is
              inside and when it is from. Open a folder and upload into it: up to 20 photos and videos at
              a time, dragged in or chosen from your device, with iPhone HEIC files converted to JPEG on
              the way.
            </p>
            <p>
              Photos you upload straight into the Memory Book, canvas or acrylic editors are saved to the
              Library too, in a folder called Uncategorised, which Ancestorii creates automatically so
              nothing goes missing.
            </p>
            <p>
              A simple scheme is enough: a folder for each event or year (“Spain 1987”, “Nan’s 80th”) and
              a few for people or themes (“Grandad’s army photos”). Our guide to{' '}
              <Link href="/guides/how-to-organize-family-photos">organising family photos</Link> goes
              further.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="what-uses-it"
          kicker="Reuse"
          title={
            <>
              Which features <Accent tone="pink">use the Library?</Accent>
            </>
          }
        >
          <CheckList items={USES} />
          <Reading>
            <p>
              Because they all draw on the same Library, a photo you put there only needs uploading once.
              The same picture can sit in an album, on a timeline and on a page of a{' '}
              <Link href="/memory-books">Memory Book</Link>.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="backups"
          kicker="Backups"
          dot="var(--c1)"
          title={
            <>
              Should the Library be <Accent tone="blue">your only copy?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              No, and the same goes for any single service. The Library of Congress advises keeping at
              least two copies of the photos you care about, in places as physically far apart as
              practical, checking them at least once a year and making new copies on fresh media every
              five years or when needed. The US Cybersecurity and Infrastructure Security Agency (CISA)
              sums it up as the 3-2-1 rule: three copies of important files, on two different types of
              storage, with one kept off-site.
            </p>
            <p>
              For a family that might mean the originals on a computer, a copy on an external drive kept
              at a relative’s house, and a cloud backup. The Library then holds the chosen, sorted copy
              that the family actually looks at.
            </p>
            <p>
              There is one more reason to keep originals. iPhone HEIC photos are converted to JPEG when
              they upload, so the Library copy isn’t the original file. Apple also notes that photos
              copied from an iPhone to a computer may be converted unless you turn on Keep Originals (open
              Settings, tap Apps, tap Photos, then tap Keep Originals). Our guide to{' '}
              <Link href="/guides/how-to-back-up-family-photos">backing up family photos</Link> has more.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="getting-started"
          layout="wide"
          kicker="Getting started"
          dot="var(--c2)"
          title={
            <>
              How do you start organising <Accent tone="pink">thousands of family photos?</Accent>
            </>
          }
        >
          <NumberedPanels items={FIRST_STEPS} />
          <TableNote>
            These four steps follow the Library of Congress’s advice on keeping digital photos: identify
            them, decide which matter, organise them, then make copies and store them in different places.
          </TableNote>
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
              The Library gives your family one private place for the photos and videos you have chosen,
              sorted the way you want and shared with the people you invite. Albums, timelines, capsules
              and the print editors all draw on it, so the work of sorting pays off everywhere else.
            </p>
            <p>
              You manage the Library on the Ancestorii website. The Free plan needs no card and isn’t a
              trial. Premium is £3.99 a month for the whole family and adds 100&nbsp;GB, larger files, priority
              support, early access to new features and 10% off printed keepsakes. There are no ads, and
              Ancestorii doesn’t sell your data.
            </p>
            <p>
              The Library holds what your family chooses to put in it, which is what keeps it useful. Keep
              your full backup elsewhere, and bring the photos that matter here.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="questions"
          kicker="Questions"
          title={
            <>
              Questions about <Accent tone="blue">the Library.</Accent>
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
              Keep the photos
              <br />
              that matter.
            </>
          }
          lead={'Free to start with 1 GB of family storage, and no credit card needed.'}
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
