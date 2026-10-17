import Link from 'next/link';
import type { Metadata } from 'next';
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
  QuoteBlock,
  Reading,
  TableNote,
} from '@/components/site/seo-articles/ArticleBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';

const PATH = '/compare/ancestorii-vs-icloud-shared-albums';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Ancestorii vs iCloud Shared Albums for Families';
const HEADLINE = 'Ancestorii vs iCloud Shared Albums after iOS 27';
const DESCRIPTION =
  'iOS 27 changed iCloud Shared Albums: new ones keep full resolution but count against your storage. How they compare with Ancestorii, as of October 2026.';
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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Ancestorii vs iCloud Shared Albums' }],
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
    q: 'Do iCloud Shared Albums count against my storage now?',
    a: 'Albums created on version 27 or later, or on the web, do: everything in them counts towards the owner’s iCloud storage, including what participants add. The exception is a temporary shared album, which is deleted after 30\u00a0days. Albums created on version 26 or earlier don’t count. After you upgrade an older album, its existing items still don’t count, but new ones do.',
  },
  {
    q: 'How many people can join an iCloud Shared Album?',
    a: 'Up to 100 participants, including the owner, for albums created on version 27 or later or on the web. Older albums allow up to 100 subscribers each, and an owner can share up to 200 albums.',
  },
  {
    q: 'Can Android users see an iCloud Shared Album?',
    a: 'Yes. Since iOS 27, friends and family can join and add photos on the web, even without an Apple Account or Apple device. For albums created on iOS 26 or earlier, the owner can turn on Public Website, which publishes the photos to a website anyone can see in a browser.',
  },
  {
    q: 'Are photos in shared albums full quality?',
    a: 'In albums created on version 27 or later, or on the web, yes: Apple stores them in their original formats at full resolution. In older albums, photos are reduced to 2,048\u00a0pixels on the long edge and videos are delivered at up to 720p.',
  },
  {
    q: 'What happens if I delete a shared album?',
    a: 'Apple says deleting a shared album deletes all of its photos permanently. Photos that someone has saved or downloaded to their own library stay there. If an album is the only copy of a photo, save it somewhere else first.',
  },
];

const KEY_FACTS = [
  <>
    Shared albums created on version 27 or later, or on the web, keep photos and videos{' '}
    <strong>at full resolution in their original formats</strong>, and everything in them counts towards
    the owner’s iCloud storage.
  </>,
  <>
    Albums created on version 26 or earlier don’t count towards storage, but photos are{' '}
    <strong>reduced to 2,048&nbsp;pixels</strong> on the long edge and videos are delivered at up to 720p.
  </>,
  <>
    Since iOS 27, friends and family can join a new or upgraded album and add photos{' '}
    <strong>on the web, without an Apple Account or Apple device</strong>.
  </>,
  <>
    iCloud includes <strong>5&nbsp;GB free</strong>. In the UK, iCloud+ costs £0.99 a month for 50&nbsp;GB, £2.99
    for 200&nbsp;GB and £8.99 for 2&nbsp;TB.
  </>,
  <>
    In Ancestorii each album photo can carry <strong>a date, a story thread and voice notes</strong>, and
    families also get Loved Ones profiles, timelines, capsules and printed Memory Books.
  </>,
];

const WHAT_ANCESTORII_ADDS = [
  <>
    <strong>A date and a story on each photo.</strong> Write the date however you know it, “Summer&nbsp;1994”
    included, and add to a thread called The Story, where relatives add what they remember.
  </>,
  <>
    <strong>Voices.</strong> Record or upload{' '}
    <Link href="/features/voice-notes" className={site.textLink}>
      voice notes
    </Link>{' '}
    on photos, timeline moments, capsules and memories. New recordings are converted to M4A so they play
    on any phone.
  </>,
  <>
    <strong>People and their lives.</strong> Loved Ones profiles hold a person’s dates and a life story in
    four chapters, and timelines put moments in order. Free includes one profile; Premium has no limit.
  </>,
  <>
    <strong>Something to hold.</strong> Turn the same photos into an A4{' '}
    <Link href="/memory-books" className={site.textLink}>
      Memory Book
    </Link>{' '}
    from £44.99, or a canvas or acrylic print from £99.99, each plus delivery.
  </>,
];

const SIDE_BY_SIDE = [
  ['Built for', 'A private family archive with stories and voices', 'Sharing photos and videos from Apple’s Photos app'],
  ['Free storage', '1\u00a0GB per family', '5\u00a0GB per Apple Account'],
  ['Paid storage (UK)', '100\u00a0GB for £3.99 a month per family', '£0.99 (50\u00a0GB) to £54.99 (12\u00a0TB) a month'],
  ['Whose storage it uses', 'One shared family pool', 'New albums: the owner’s. Older albums: none'],
  ['Photo files', 'Up to 20\u00a0MB each on Free, 10\u00a0GB on Premium', 'New albums: full resolution. Older: 2,048\u00a0px long edge'],
  ['How many people', 'No limit on family members', 'Up to 100, owner included'],
  ['Without an Apple device', 'iPhone and Android apps, plus the website', 'New albums: join on the web. Older: a public website'],
  ['Beside each photo', 'A name, a date, a story thread and voice notes', 'Comments from participants'],
  ['Who can delete', 'Only the person who created something', 'The owner and anyone allowed to manage the album: anything. Others: what they added'],
];

const SOURCES: Source[] = [
  {
    publisher: 'Apple',
    title: 'Shared Albums limits',
    href: 'https://support.apple.com/en-gb/148868',
    date: 'published 21 September 2026',
  },
  {
    publisher: 'Apple',
    title: 'Upgrade your shared albums',
    href: 'https://support.apple.com/en-gb/108916',
    date: 'published 17 September 2026',
  },
  {
    publisher: 'Apple',
    title: 'How to use Shared Albums in Photos on your iPhone, iPad or Apple Vision Pro',
    href: 'https://support.apple.com/en-gb/108314',
    date: 'published 7 October 2026',
  },
  {
    publisher: 'Apple',
    title: 'iCloud+ plans and pricing',
    href: 'https://support.apple.com/en-gb/108047',
    date: 'published 29 September 2026',
  },
  {
    publisher: 'Apple',
    title: 'How to add a Legacy Contact for your Apple Account',
    href: 'https://support.apple.com/en-gb/102631',
    date: 'published 22 September 2026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Personal Archiving: Digital Photos',
    href: 'https://digitalpreservation.gov/personalarchiving/photos.html',
    date: 'accessed October 2026',
  },
];

export default function AncestoriiVsIcloudSharedAlbumsPage() {
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
            { name: 'Compare', path: '/compare' },
            { name: 'Ancestorii vs iCloud Shared Albums', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[
            { href: '/', label: 'Home' },
            { href: '/compare', label: 'Compare' },
            { label: 'Ancestorii vs iCloud Shared Albums' },
          ]}
          size="md"
          title={
            <>
              Ancestorii vs iCloud Shared Albums <Accent>after iOS 27.</Accent>
            </>
          }
          intro={[
            'iCloud Shared Albums are built into Apple’s Photos app, and since iOS 27 new albums keep full-resolution originals that count against the owner’s iCloud storage. Ancestorii is a private family archive that gives each photo a date, a story thread and voice notes, adds life timelines and printed books, and works on iPhone, Android and the web with one login.',
            'Apple changed how shared albums work with iOS 27, iPadOS 27 and macOS 27, so much of what is written about them online now applies only to older albums. Every Apple figure here comes from Apple’s UK support pages, as of October\u00a02026.',
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        {/* Key facts beside one of the founder's own captioned family photos */}
        <ArticleSection
          aside={
            <CaptionedPhoto
              src="/snow.jpg"
              alt="Dante and his little sister in the snow on a hilly street, his sister holding a snowball"
              label="Dante and his sister · March 2010"
              color="var(--c1)"
              caption="“She still says she won the snowball fight.” March&nbsp;2010, from the founder’s own family photos."
              position="38% 50%"
              priority
            />
          }
        >
          <KeyFacts items={KEY_FACTS} />
        </ArticleSection>

        <ArticleSection
          id="ios-27"
          kicker="What changed"
          dot="var(--c1)"
          title={
            <>
              What changed in iCloud Shared Albums <Accent tone="blue">with iOS 27?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Apple now treats shared albums differently depending on the software they were created on.
              Its Shared Albums limits page says albums created on version 27 or later, or on the web,
              store photos and videos in their original formats at full resolution, with no limit on
              albums or items beyond your iCloud storage and up to 100 participants, including the owner.
            </p>
            <p>
              The catch is storage. Everything in an album you own counts towards your iCloud storage,
              including the photos and videos other people add, unless it is a temporary shared album,
              which is deleted after 30&nbsp;days. In a busy family album, one person’s plan pays for
              everyone’s uploads.
            </p>
            <p>
              Older albums can be upgraded. Afterwards, existing items still don’t count towards storage,
              but new ones do, and they are shared at original resolution. Opening an upgraded album on a
              device needs iOS 27, iPadOS 27 or macOS 27 or later; anyone on older software can update or
              view it on iCloud.com.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="older-albums"
          kicker="Older albums"
          dot="var(--c2)"
          title={
            <>
              What are the limits <Accent tone="pink">on older shared albums?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Albums created on version 26 or earlier work the way most guides still describe. They don’t
              count towards your iCloud storage, but shared photos are reduced to 2,048&nbsp;pixels on the long
              edge (panoramas can be 5,400&nbsp;pixels wide), and videos can run to 15&nbsp;minutes at up to 720p.
            </p>
            <ul>
              <li>Up to 5,000 photos and videos per album, from all contributors combined.</li>
              <li>Up to 200 shared albums per owner, and 100 subscribers per album.</li>
              <li>Up to 1,000 items an hour, or 10,000 a day, from one contributor across all shared albums.</li>
            </ul>
            <p>An older album is a good way to look through photos together, but not a full-quality copy.</p>
          </Reading>
        </ArticleSection>

        <QuoteBlock>
          A shared album passes the photos round.{' '}
          <Accent tone="blue">An archive keeps the story with them.</Accent>
        </QuoteBlock>

        <ArticleSection
          id="storage-and-cost"
          kicker="Storage and price"
          dot="var(--c3)"
          title={
            <>
              How much does iCloud storage <Accent tone="blue">cost in the UK?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Everyone gets 5&nbsp;GB of iCloud storage free. As of October&nbsp;2026, Apple’s UK iCloud+ prices, tax
              included, are £0.99 a month for 50&nbsp;GB, £2.99 for 200&nbsp;GB, £8.99 for 2&nbsp;TB, £26.99 for 6&nbsp;TB and
              £54.99 for 12&nbsp;TB. Family Sharing lets one plan cover up to five other family members.
            </p>
            <p>
              Ancestorii’s Free plan gives the family one shared pool of 1&nbsp;GB, with files up to 20&nbsp;MB.
              Premium gives 100&nbsp;GB, with files up to 10&nbsp;GB, for £3.99, €4.99 or $5.99 a month, paid per
              family with no limit on members. On storage per pound, iCloud+ is far cheaper; Ancestorii is
              priced for the photos you choose to keep, not a whole photo library.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="without-an-iphone"
          kicker="Mixed families"
          title={
            <>
              Can relatives <Accent tone="pink">without an iPhone join?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Since iOS 27, yes. Apple says friends and family can join and contribute their own photos on
              the web, even without an Apple Account or Apple device. That makes shared albums far more
              useful for families with Android phones.
            </p>
            <p>
              For albums created on iOS 26 or earlier, the owner can turn on Public Website, which
              publishes the photos to a website anyone can see in an up-to-date browser.
            </p>
            <p>
              Ancestorii doesn’t depend on which phone anyone has: there are free apps for iPhone and
              Android, the same email and password work on the website, and you can invite relatives by
              link, email or family join code.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="what-ancestorii-adds"
          kicker="The story layer"
          dot="var(--c1)"
          title={
            <>
              What can Ancestorii add <Accent tone="blue">to a shared album?</Accent>
            </>
          }
        >
          <CheckList items={WHAT_ANCESTORII_ADDS} />
          <Reading>
            <p>
              None of this replaces the album you already have. It gives you a place for why a photo
              matters, in the words and voices of the people who were there. See how{' '}
              <Link href="/features/family-photo-albums">family photo albums</Link> work on Ancestorii.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="side-by-side"
          layout="wide"
          kicker="Side by side"
          dot="var(--c2)"
          title={
            <>
              Ancestorii vs iCloud Shared Albums, <Accent tone="pink">side by side.</Accent>
            </>
          }
        >
          <CompareTable
            head={['Feature', 'Ancestorii', 'iCloud Shared Albums']}
            rows={SIDE_BY_SIDE}
            highlight={1}
            size="mid"
            labelledBy="side-by-side-title"
          />
          <TableNote>
            Apple’s figures are from its UK support pages, as of October&nbsp;2026. Comparing Google instead?
            See{' '}
            <Link href="/compare/ancestorii-vs-google-photos" className={site.textLink}>
              Ancestorii vs Google Photos
            </Link>
            .
          </TableNote>
        </ArticleSection>

        <ArticleSection
          id="which-to-use"
          kicker="The answer"
          dot="var(--c3)"
          title={
            <>
              Which should <Accent tone="blue">your family use?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              If everyone uses an iPhone and you mainly want to pass round holiday photos, a shared album is
              simple, built in and free within your storage, and since iOS 27 relatives on Android can join
              on the web. Just remember that new albums count towards the owner’s storage, so whoever
              creates the family album may need a bigger plan.
            </p>
            <p>
              If you want the story kept with each photo, voices you can play back and a record organised
              around the people in it, that is what Ancestorii adds. The two work well together, but neither
              should be the only copy. Apple says deleting a shared album deletes all its photos
              permanently, although copies people saved to their own libraries stay. The Library of
              Congress recommends at least two copies of important photos, stored as far apart as
              practical, and our guide to{' '}
              <Link href="/guides/how-to-back-up-family-photos">backing up family photos</Link> shows how.
            </p>
            <p>
              For the long term, Apple’s Legacy Contact lets someone you choose request data from your
              account after your death, which may include photos. They need the access key you generate and
              a death certificate, and setting it up needs iOS 15.2, iPadOS 15.2 or macOS Monterey 12.1 or
              later. See{' '}
              <Link href="/guides/what-happens-to-your-photos-when-you-die">
                what happens to your photos when you die
              </Link>
              .
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="how-ancestorii-helps"
          kicker="Where we fit"
          title={
            <>
              How we <Accent tone="pink">help.</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Ancestorii isn’t a photo library or a backup, and it won’t replace iCloud Photos. It is My
              Family, a private space only the people you invite can see, where everyone can add photos to
              albums, give them dates and stories and record voice notes, from the iPhone or Android app or
              the website.
            </p>
            <p>
              Free families share 1&nbsp;GB with unlimited albums, timelines and capsules, and no card is
              needed. Premium is £3.99 a month for the whole family. Ancestorii shows no ads and doesn’t
              sell your data, and nothing becomes public unless someone chooses to publish it on Our
              Stories, the separate public feed.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="questions"
          kicker="Questions"
          dot="var(--c2)"
          title={
            <>
              Things people <Accent tone="blue">ask us.</Accent>
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
              Share the photos.
              <br />
              Keep the stories.
            </>
          }
          lead="Free to start, with no card. One private family space on iPhone, Android and the web."
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
