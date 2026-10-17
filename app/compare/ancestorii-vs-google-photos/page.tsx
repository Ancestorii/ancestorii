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
  CompareTable,
  FaqBlock,
  PlatformCard,
  PlatformList,
  QuoteBlock,
  Reading,
  TableNote,
} from '@/components/site/seo-articles/ArticleBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';

const PATH = '/compare/ancestorii-vs-google-photos';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Ancestorii vs Google Photos for Family Memories';
const HEADLINE = 'Ancestorii vs Google Photos: backup or family archive?';
const DESCRIPTION =
  'Google Photos backs up every photo; Ancestorii keeps the stories, dates and voices behind the ones that matter. Storage, prices and features, October 2026.';
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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Ancestorii vs Google Photos' }],
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
    q: 'Is Ancestorii a replacement for Google Photos?',
    a: 'No. Google Photos backs up the photos and videos on your phone automatically, and Ancestorii doesn’t. Ancestorii is for the photos that matter most, with the dates, stories and voice notes your family adds to them. The two work best together: Google Photos or iCloud as the backup, Ancestorii as the family archive.',
  },
  {
    q: 'How much free storage does Google Photos have?',
    a: 'Every Google Account includes up to 15\u00a0GB of free storage, shared across Gmail, Google Drive and Google Photos. As of October\u00a02026, Google’s UK plans start at £1.59 a month for 100\u00a0GB.',
  },
  {
    q: 'Can my family add stories to photos in Google Photos?',
    a: 'Partly. People in a shared album can add photos and videos, comment and like, but only its creator can make other changes, and anyone who leaves takes everything they added with them. In Ancestorii, each photo has a story thread, a free-text date and voice notes that anyone in the family space can add to.',
  },
  {
    q: 'What happens to Google Photos when someone dies?',
    a: 'If they set up Google’s Inactive Account Manager, up to 10 people they chose can be notified or receive parts of their data after a set period of inactivity. If not, family can ask Google for data from the account, which Google decides after a careful review. Accounts unused for two years may be deleted.',
  },
  {
    q: 'Which is cheaper for a family?',
    a: 'For storage alone, Google: 100\u00a0GB costs £1.59 a month, shareable with up to 5 others. Ancestorii Premium is £3.99 a month for 100\u00a0GB shared by the whole family, with no member limit. They do different jobs, so a paid backup plan alongside Ancestorii’s Free plan is one sensible setup.',
  },
];

const KEY_FACTS = [
  <>
    Every Google Account includes <strong>up to 15&nbsp;GB</strong> of free storage, shared across Gmail, Google
    Drive and Google Photos.
  </>,
  <>
    Google’s UK plans, as of October&nbsp;2026: <strong>100&nbsp;GB for £1.59 a month</strong>, 2&nbsp;TB for £7.99 and
    5&nbsp;TB for £18.99, each shareable with up to 5 others.
  </>,
  <>
    Google Photos’ Storage saver resizes photos over 16&nbsp;MP to 16&nbsp;MP and videos above 1080p to 1080p.
    Original quality keeps them as you took them.
  </>,
  <>
    Ancestorii’s Free plan gives a family <strong>1&nbsp;GB</strong> of shared storage. Premium gives{' '}
    <strong>100&nbsp;GB for £3.99 a month</strong> for the whole family, with no limit on members.
  </>,
  <>
    In Ancestorii each album photo can carry <strong>a date, a family story thread and voice notes</strong>,
    alongside Loved Ones profiles, timelines and capsules.
  </>,
];

const SIDE_BY_SIDE = [
  ['Built for', 'A private family archive of the photos you choose', 'Automatic backup of your photos and videos'],
  ['Free storage', '1\u00a0GB per family', '15\u00a0GB per account, shared with Gmail and Drive'],
  ['Paid storage (UK)', '100\u00a0GB for £3.99 a month per family', '100\u00a0GB £1.59, 2\u00a0TB £7.99, 5\u00a0TB £18.99 a month'],
  ['Who the plan covers', 'Everyone in the family space, no member limit', 'You plus up to 5 others'],
  ['Automatic phone backup', 'No, you choose what to add', 'Yes'],
  ['Beside each photo', 'A name, a date, a story thread and voice notes', 'Its date and time, plus comments and likes in shared albums'],
  ['Printed books (UK)', 'A4 landscape hardcover, 24 to 48 pages, from £44.99 plus delivery', '7-inch softcover or 9-inch hardcover, 20 to 140 pages, priced when you order'],
];

const SOURCES: Source[] = [
  {
    publisher: 'Google',
    title: 'Google One Help: How your Google storage works',
    href: 'https://support.google.com/googleone/answer/9312312?hl=en-GB',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Google',
    title: 'Google One plans (UK prices)',
    href: 'https://one.google.com/about/plans?hl=en-GB&gl=GB',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Google',
    title: 'Google Photos Help: Choose the backup quality of your photos and videos',
    href: 'https://support.google.com/photos/answer/6220791?hl=en-GB',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Google',
    title: 'Google Photos Help: Create and edit photo albums',
    href: 'https://support.google.com/photos/answer/6128849?hl=en-GB',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Google',
    title: 'Google Photos Help: Share photos and videos',
    href: 'https://support.google.com/photos/answer/6131416?hl=en-GB',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Google',
    title: 'Google Photos Help: Edit your photos',
    href: 'https://support.google.com/photos/answer/6128850?hl=en-GB',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Google',
    title: 'Inactive Google Account Policy',
    href: 'https://support.google.com/accounts/answer/12418290?hl=en-GB',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Google',
    title: 'About Inactive Account Manager',
    href: 'https://support.google.com/accounts/answer/3036546?hl=en-GB',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Google',
    title: 'Submit a request regarding a deceased user’s account',
    href: 'https://support.google.com/accounts/troubleshooter/6357590?hl=en-GB',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Google',
    title: 'Check photo book product and delivery info (United Kingdom)',
    href: 'https://support.google.com/photos/answer/9079710?hl=en-GB&co=GENIE.CountryCode%3DGB',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Personal Archiving: Digital Photos',
    href: 'https://digitalpreservation.gov/personalarchiving/photos.html',
    date: 'accessed October 2026',
  },
];

export default function AncestoriiVsGooglePhotosPage() {
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
            { name: 'Ancestorii vs Google Photos', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[
            { href: '/', label: 'Home' },
            { href: '/compare', label: 'Compare' },
            { label: 'Ancestorii vs Google Photos' },
          ]}
          size="md"
          title={
            <>
              Ancestorii vs Google Photos: <Accent>backup or family archive?</Accent>
            </>
          }
          intro={[
            'Google Photos is built to back up every photo on your phone automatically, with 15\u00a0GB of free storage shared with Gmail and Google Drive. Ancestorii is built for the photos that matter most: a private family space where relatives add the dates, stories and voices behind them, so most families are best served by using both.',
            'Google’s figures below come from its own UK help and plan pages, as of October\u00a02026.',
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        {/* Key facts beside one of the founder's own captioned family photos */}
        <ArticleSection
          aside={
            <CaptionedPhoto
              src="/outdoor.jpg"
              alt="Dante as a boy in a cap and pink shirt, posing in the woods"
              label="Dante · July 2010"
              color="var(--c0)"
              caption="“Me, pretending I was too cool to smile.” July&nbsp;2010, from the founder’s own family photos."
              position="42% 50%"
              priority
            />
          }
        >
          <KeyFacts items={KEY_FACTS} />
        </ArticleSection>

        <ArticleSection
          id="what-each-is-for"
          kicker="The difference"
          dot="var(--c1)"
          title={
            <>
              What is each one <Accent tone="blue">built for?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Google Photos is a backup and photo library. Turn on backup and it copies the photos and
              videos on your phone to your Google Account, where you can browse, edit and share them.
            </p>
            <p>
              Ancestorii does a different job. Nothing uploads automatically. You and the relatives you
              invite choose the photos worth keeping and add the context around them: who is in the
              picture, roughly when it was taken, the story behind it and the voices telling it. It all
              sits in My Family, a private space only invited members can see.
            </p>
            <p>
              The useful question is which job you need doing. Most families need both.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="storage-and-cost"
          kicker="Storage and price"
          dot="var(--c2)"
          title={
            <>
              How much storage do you get, <Accent tone="pink">and what does it cost?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Every Google Account includes up to 15&nbsp;GB of free storage, but it is shared across Gmail,
              Google Drive and Google Photos, so a full inbox eats into the room for photos. Original
              quality backups count towards it, and so do Storage saver backups made since 1&nbsp;June&nbsp;2021.
            </p>
            <p>
              Google’s paid plans are called Basic (100&nbsp;GB), Google AI Plus (2&nbsp;TB) and Google AI Pro
              (5&nbsp;TB), and Google says paying annually saves up to 16%.
            </p>
            <p>
              Ancestorii’s Free plan gives the whole family one shared pool of 1&nbsp;GB, with files up to
              20&nbsp;MB. Premium raises that to 100&nbsp;GB, with files up to 10&nbsp;GB, for £3.99, €4.99 or $5.99 a
              month. It is paid per family, not per person,
              with no limit on how many relatives you invite.
            </p>
            <p>
              On storage per pound, Google is far cheaper, and its 2&nbsp;TB and 5&nbsp;TB plans have no Ancestorii
              equivalent. Ancestorii is priced for a chosen archive, not a camera roll.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="family-stories"
          kicker="Together"
          dot="var(--c3)"
          title={
            <>
              Can the whole family add <Accent tone="blue">stories and voices?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Google Photos lets you share albums with family. People can join, like, comment and add
              their own photos, and an album holds up to 20,000 photos or videos. If you are a
              collaborator but didn’t create the album, Google says you can only add photos and videos;
              other changes are left to its creator. You can also correct a photo’s date and time, though
              Google notes a downloaded or shared copy may still show the original date.
            </p>
            <p>
              One detail matters for a family archive: when someone leaves a shared album, all the photos,
              videos, comments and likes they added are removed with them.
            </p>
            <p>
              In Ancestorii, everyone you invite sees the whole family space and can add to it. Each photo
              in an album can have a name, a date written however you know it (“Summer&nbsp;1994” works), a
              thread called The Story where relatives add what they remember, and voice notes, recorded or
              uploaded. Only the person who created something can delete it.
            </p>
            <p>
              Around the albums sit Loved Ones profiles, timelines and time capsules; the Free plan includes
              one Loved Ones profile and Premium has no limit. See how{' '}
              <Link href="/features/family-photo-albums">albums with stories and voices</Link> work.
            </p>
          </Reading>
        </ArticleSection>

        <QuoteBlock>
          A backup keeps the photo. <Accent tone="blue">A family archive keeps the story behind it.</Accent>
        </QuoteBlock>

        <ArticleSection
          id="if-an-account-goes-quiet"
          kicker="The long run"
          title={
            <>
              What happens to photos <Accent tone="pink">if an account goes quiet?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Google’s Inactive Account Policy says it may delete an account that hasn’t been used for two
              years, after emailing the account and its recovery address. Separately, if an account stays
              over its storage quota for two years or longer, all of its content may be removed, with at
              least three months’ notice.
            </p>
            <p>
              The safeguard is Google’s Inactive Account Manager, which lets you choose up to 10 people to
              be notified or to receive parts of your data after a period of inactivity you set.
            </p>
            <p>
              Ancestorii keeps the archive in a shared family space rather than one person’s account, and
              one Premium subscription covers everyone in it. If Premium ends, nothing is deleted: the
              terms say you keep access to view your family library, and only new uploads above the Free
              limits pause. Our guide to{' '}
              <Link href="/guides/what-happens-to-your-photos-when-you-die">
                what happens to your photos when you die
              </Link>{' '}
              covers the wider picture.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="printed-books"
          kicker="In print"
          dot="var(--c1)"
          title={
            <>
              Can you print books <Accent tone="blue">from each?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              In the UK, Google Photos offers a 7-inch softcover and a 9-inch
              hardcover photo book, each from 20 to 140 pages. Google doesn’t list prices on its help page;
              you see the price when you start an order. Printing takes two to four working days, then
              economy delivery takes 8 to 11 working days and priority 4 to 7.
            </p>
            <p>
              Ancestorii Memory Books are A4 landscape hardcovers, 297&nbsp;×&nbsp;210&nbsp;mm. A Chapter has 24 printed
              pages for £44.99, A Story has 36 for £54.99 and A Legacy has 48 for £64.99, each plus
              delivery. You design every page, and each photo can carry a subheading and a written comment,
              so the story behind each photo can go in the book too.
              Standard delivery is £4.99, takes 10 to 14 working days and reaches 20 countries.
            </p>
          </Reading>
          {/* A real customer's Memory Book (the photo the old-photos guide uses), with her own words */}
          <div className={site.sectionBody}>
            <CaptionedPhoto
              src="/Testimonial2.png"
              alt="Alison and her dad holding his printed Ancestorii Memory Book"
              label="Alison · Nevada, US"
              color="var(--c1)"
              position="50% 30%"
              caption="“I walked past my dad’s room and caught him looking through his memory book again.” Alison, on the Memory Book she made for her dad."
            />
          </div>
          <div className={site.sectionBody}>
            <Reading>
              <p>
                One honest limit: a printed book holds photos and words, not sound, so voice notes stay in
                the app and on the website. See <Link href="/memory-books">how Memory Books work</Link>.
              </p>
            </Reading>
          </div>
        </ArticleSection>

        <ArticleSection
          id="side-by-side"
          layout="wide"
          kicker="Side by side"
          dot="var(--c2)"
          title={
            <>
              Ancestorii vs Google Photos, <Accent tone="pink">side by side.</Accent>
            </>
          }
        >
          <CompareTable
            head={['Feature', 'Ancestorii', 'Google Photos']}
            rows={SIDE_BY_SIDE}
            highlight={1}
            size="mid"
            labelledBy="side-by-side-title"
          />
          <TableNote>
            Figures as of October&nbsp;2026, from Google’s UK help and plan pages. Comparing Apple instead?
            See{' '}
            <Link href="/compare/ancestorii-vs-icloud-shared-albums" className={site.textLink}>
              Ancestorii vs iCloud Shared Albums
            </Link>
            .
          </TableNote>
        </ArticleSection>

        <ArticleSection
          id="which-to-use"
          layout="wide"
          kicker="The answer"
          dot="var(--c3)"
          title={
            <>
              Which should you use? <Accent tone="blue">Probably both.</Accent>
            </>
          }
        >
          <PlatformList>
            <PlatformCard
              name="Google Photos"
              tone="blue"
              oneLiner="The automatic backup of everything on your phone."
              strengths={[
                'Backs up your photos and videos automatically once backup is on.',
                '15\u00a0GB free, with 2\u00a0TB and 5\u00a0TB plans for very large libraries.',
              ]}
              bestFor="Keeping a full copy of every photo and video, in case a phone is lost or replaced."
            />
            <PlatformCard
              name="Ancestorii"
              tone="pink"
              featured
              oneLiner="The private family archive for the photos that matter."
              strengths={[
                'A date, a story thread and voice notes on each photo.',
                'Everyone you invite can add to it, with no limit on members.',
              ]}
              bestFor="Keeping the stories behind your photos, told by the people who were there."
            />
          </PlatformList>
          <TableNote>
            Let Google Photos back up everything, then bring the photos worth explaining into Ancestorii.
            The Library of Congress advises keeping at least two copies of important photos, stored as far
            apart as practical. Our guide to{' '}
            <Link href="/guides/how-to-back-up-family-photos" className={site.textLink}>
              backing up family photos
            </Link>{' '}
            has the full setup.
          </TableNote>
        </ArticleSection>

        <ArticleSection
          id="how-ancestorii-helps"
          kicker="Where we fit"
          title={
            <>
              Using <Accent tone="pink">both together.</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Ancestorii isn’t a backup service, and it doesn’t try to be. It doesn’t copy your camera roll,
              and iPhone HEIC photos are converted to JPEG as they upload, so keep your originals in Google
              Photos or iCloud. The Free plan’s 1&nbsp;GB suits a chosen set of photos, not everything on
              everyone’s phones.
            </p>
            <p>
              What it adds is the family side. Your family gets one private space, with free
              apps for iPhone and Android and the same login on the website. Photos go into the shared{' '}
              <Link href="/features/family-library">family Library</Link> and into albums, where each can
              carry its date, its story and the voices of the people who remember it.
            </p>
            <p>
              Ancestorii shows no ads and doesn’t sell your data, and nothing in My Family becomes public
              unless someone chooses to publish it on Our Stories, the separate public feed. The Free plan
              needs no card; Premium is £3.99 a month for the whole family.
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
              Back it all up.
              <br />
              Keep the stories.
            </>
          }
          lead="Free to start, with no card. Invite the whole family and add the story behind each photo."
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
