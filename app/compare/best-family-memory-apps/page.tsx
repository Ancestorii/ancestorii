import Link from 'next/link';
import type { Metadata } from 'next';
import SiteShell from '@/components/site/SiteShell';
import { Accent } from '@/components/site/SiteBits';
import site from '@/components/site/site.module.css';
import {
  ArticleCta,
  ArticleHero,
  ArticleSection,
  CompareTable,
  FaqBlock,
  PlatformCard,
  PlatformList,
  Reading,
  TableNote,
  type Tone,
} from '@/components/site/seo-articles/ArticleBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';

const PATH = '/compare/best-family-memory-apps';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Best Family Memory Apps in 2026, Compared';
const HEADLINE = 'The best family memory apps, compared honestly';
const DESCRIPTION =
  'Eight apps for keeping family photos, voices and stories, compared on price, free plans and printing as of October 2026, with where each one falls short.';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'The best family memory apps, compared honestly' }],
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

// Every competitor fact was checked on the company's own website, help centre or App Store
// listing on 17 October 2026 (see SOURCES). Ancestorii's come from the live plans and checkout.

type App = {
  name: string;
  tone: Tone;
  oneLiner: string;
  strengths: string[];
  bestFor: string;
};

const STORYWORTH: App = {
  name: 'Storyworth',
  tone: 'blue',
  oneLiner: 'Weekly questions for a year, then a hardcover book.',
  strengths: [
    'UK plans start at £49 as of October\u00a02026, and the base plan includes one premium hardcover book.',
    'Your storyteller gets weekly questions by text or email from a library of 500+, and can reply by email or on the website, or by phone on an upgraded plan.',
    'Falls short: it is built around a year of questions that ends in a book, not an ongoing family library.',
  ],
  bestFor: 'Giving one person a year of questions that ends in a book they can hold.',
};

const REMENTO: App = {
  name: 'Remento',
  tone: 'orange',
  oneLiner: 'Recorded stories, turned into a book that plays their voice.',
  strengths: [
    '$99 for the first year as of October\u00a02026, including one hardcover book credit of up to 200 pages, then $99 a year or $12 a month.',
    'Storytellers record by clicking a link on any phone, with no app or login. Each recording becomes editable text, and every chapter has a QR code that plays it.',
    'Falls short: each book is for one storyteller (another costs $99), prices are in US dollars, and UK shipping is $15 for the first book.',
  ],
  bestFor: 'A parent or grandparent who would rather talk than write.',
};

const TINYBEANS: App = {
  name: 'Tinybeans',
  tone: 'aqua',
  oneLiner: 'A private photo journal that parents keep and share with family.',
  strengths: [
    'Free accounts show ads around the journal and have a 5\u00a0GB storage limit. Tinybeans+ is $74.99 a year or $7.99 a month.',
    'Apps for iPhone and Android, email updates for family without the app, and photobooks you can print.',
    'Falls short: free accounts are capped at 20 photos and videos a month, and its help centre lists prices in US dollars outside Australia.',
  ],
  bestFor: 'Parents sharing photos of their children with grandparents and close family.',
};

const FAMILYALBUM: App = {
  name: 'FamilyAlbum',
  tone: 'blue',
  oneLiner: 'A shared album for baby and family photos, made by MIXI.',
  strengths: [
    'Its website promises uploads with no fees or storage limits, and only family members you invite can see your album.',
    'Family can comment and react on every photo and video. Premium is sold in the app: the UK App Store lists Premium Family at £54.99 a year.',
    "Falls short: it is designed around photos of babies and children, so it is less suited to recording older relatives' stories.",
  ],
  bestFor: "Sharing a baby's photos and videos with grandparents, privately.",
};

const FAMILYSEARCH: App = {
  name: 'FamilySearch Memories',
  tone: 'orange',
  oneLiner: 'Free photos, recordings and stories, attached to a family tree.',
  strengths: [
    'FamilySearch is an international non-profit funded by The Church of Jesus Christ of Latter-day Saints, and its Memories app is free.',
    'Add photos, documents, recordings and stories, and name the relatives in them.',
    'Falls short: memories attach to people in its Family Tree, so it suits ancestors more than everyday family life.',
  ],
  bestFor: 'Adding photos and stories to ancestors while you research your family tree.',
};

const GOOGLE_PHOTOS: App = {
  name: 'Google Photos',
  tone: 'aqua',
  oneLiner: 'Automatic backup for the photos and videos on your phone.',
  strengths: [
    'Turn on backup and your photos and videos save to your Google Account automatically.',
    'If you need more space, 100\u00a0GB costs £1.59 a month in the UK as of October\u00a02026.',
    "Falls short: the free 15\u00a0GB is shared with Gmail and Google Drive, so a family's photos and videos can fill it quickly.",
  ],
  bestFor: 'Making sure nothing on your phone is lost.',
};

const ICLOUD: App = {
  name: 'iCloud Shared Albums',
  tone: 'blue',
  oneLiner: 'Shared albums for up to 100 people, built into Apple Photos.',
  strengths: [
    'Up to 100 participants per album, including the owner. Albums created on iOS 27 or later keep photos and videos at full resolution.',
    'iCloud includes 5\u00a0GB free, and 50\u00a0GB of iCloud+ costs £0.99 a month in the UK as of October\u00a02026.',
    "Falls short: new shared albums count towards the owner's iCloud storage, including everything participants add.",
  ],
  bestFor: 'Families with iPhones sharing photos from a holiday or a birthday.',
};

const ANCESTORII: App = {
  name: 'Ancestorii',
  tone: 'pink',
  oneLiner: 'A private family library, with books and prints you design.',
  strengths: [
    'Everyone you invite adds memories, photos, video and voice notes, with no cap on family members and no ads. Only your family can see it.',
    'Albums, timelines, capsules sealed until a date you choose, and Loved Ones profiles.',
    'A Free plan with 1\u00a0GB for the family and no card. Premium is £3.99 a month for the whole family, with 100\u00a0GB.',
    'Memory Books you lay out yourself, from £44.99 plus delivery, and canvas and acrylic prints from £99.99 plus delivery.',
    'Falls short: answering family questions needs the free app, printed books have no audio, Premium is monthly only and the Free plan includes one Loved Ones profile.',
  ],
  bestFor: 'Families who want everyone adding to one private place, and something printed to keep.',
};

const ALL_APPS = [STORYWORTH, REMENTO, TINYBEANS, FAMILYALBUM, FAMILYSEARCH, GOOGLE_PHOTOS, ICLOUD, ANCESTORII];

function AppCard({ app, featured = false }: { app: App; featured?: boolean }) {
  return (
    <PlatformCard
      name={app.name}
      tone={app.tone}
      oneLiner={app.oneLiner}
      strengths={app.strengths}
      bestFor={app.bestFor}
      featured={featured}
    />
  );
}

// Shown on the page and written into the FAQPage structured data, word for word.
const FAQ = [
  {
    q: 'What is the best app for preserving family memories?',
    a: "It depends on the job. Remento suits a storyteller who would rather talk, and Storyworth sends weekly questions for a book. Tinybeans and FamilyAlbum share children's photos, Google Photos and iCloud back up pictures, and FamilySearch Memories links memories to a family tree. For a private library the whole family adds to, with voice notes and printed books, Ancestorii is built for that.",
  },
  {
    q: 'Which family memory app is free?',
    a: 'FamilySearch Memories is free, and FamilyAlbum says it has no fees or storage limits. Ancestorii has a Free plan with 1\u00a0GB of family storage and no card, Tinybeans is free for 20 photos and videos a month with ads, Google gives up to 15\u00a0GB shared with Gmail and Drive, and iCloud includes 5\u00a0GB. Storyworth and Remento are paid services that include a printed book.',
  },
  {
    q: "What's the best app for recording a grandparent's stories?",
    a: "If they would rather talk than write, Remento lets them record by clicking a link on any phone, for up to 30\u00a0minutes a story, and turns each recording into text for a book. Storyworth lets them reply by email or on its website, or by phone on an upgraded plan. In Ancestorii you can send them one of 46 ready-made questions to answer in the free app, and keep voice notes in your family's private library.",
  },
  {
    q: 'Which app is best for sharing baby photos privately?',
    a: "Tinybeans and FamilyAlbum are both built for it. FamilyAlbum says only the family members you invite can see your album, and Tinybeans is free for 20 uploads a month with ads, or $74.99 a year for Tinybeans+. Ancestorii is private too, and suits families who also want grandparents' stories in the same place.",
  },
  {
    q: 'Can I print a book from these apps?',
    a: 'Yes, from several. Storyworth and Remento include one hardcover book in their price, Tinybeans and FamilyAlbum offer photobooks, and Ancestorii prints A4 landscape Memory Books you lay out page by page, from £44.99 plus delivery. We did not compare printing for Google Photos, iCloud or FamilySearch Memories.',
  },
];

const KEY_FACTS = [
  <>
    As of October&nbsp;2026, Storyworth&apos;s UK plans <strong>start at £49</strong>. It sends weekly
    questions by text or email and prints the stories as a book after a year.
  </>,
  <>
    <strong>Remento costs $99 for the first year</strong>, including one hardcover book, then $99 a
    year or $12 a month. Each chapter has a QR code that plays the recording.
  </>,
  <>
    Tinybeans is <strong>free for 20 photos and videos a month</strong>, with ads and a 5&nbsp;GB limit.
    Tinybeans+ is $74.99 a year or $7.99 a month.
  </>,
  <>
    Every Google Account gets{' '}
    <strong>up to 15&nbsp;GB free, shared across Gmail, Google Drive and Google Photos</strong>. 100&nbsp;GB costs
    £1.59 a month in the UK.
  </>,
  <>
    iCloud includes <strong>5&nbsp;GB free</strong>, and 50&nbsp;GB costs £0.99 a month in the UK. Shared
    albums created on iOS 27 or later count towards the owner&apos;s storage.
  </>,
  <>
    Ancestorii is <strong>free to start, with 1&nbsp;GB for the family</strong>. Premium is £3.99 a month
    for the whole family, and Memory Books start at £44.99 plus delivery.
  </>,
];

// App, free option, paid plan, best for: the prices sit next to the names, so phones show them first.
const SIDE_BY_SIDE = [
  ['Ancestorii', 'Yes: 1\u00a0GB for the family, no card', 'Premium £3.99 a month per family', 'A private library the whole family adds to, with prints'],
  ['Storyworth', 'No', 'From £49 (UK)', "One person's stories in a book after a year"],
  ['Remento', 'No', '$99 first year with one book, then $99 a year or $12 a month', 'Recorded stories turned into a book with QR codes'],
  ['Tinybeans', '20 uploads a month and 5\u00a0GB, with ads', 'Tinybeans+ $74.99 a year or $7.99 a month', "Sharing children's photos with family"],
  ['FamilyAlbum', 'Yes, with no storage limits', 'Premium Family £54.99 a year (UK App Store)', 'Sharing baby photos and videos privately'],
  ['FamilySearch Memories', 'Yes, free', 'None: it is free', 'Photos and stories attached to a family tree'],
  ['Google Photos', '15\u00a0GB, shared with Gmail and Drive', '100\u00a0GB for £1.59 a month', 'Backing up every photo automatically'],
  ['iCloud Shared Albums', '5\u00a0GB of iCloud storage', '50\u00a0GB for £0.99 a month', 'Sharing albums with up to 100 people'],
];

// The eight apps the page compares, in the order the page discusses them.
const ITEM_LIST = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: HEADLINE,
  itemListOrder: 'https://schema.org/ItemListUnordered',
  numberOfItems: ALL_APPS.length,
  itemListElement: ALL_APPS.map((app, i) => ({ '@type': 'ListItem', position: i + 1, name: app.name })),
};

const SOURCES: Source[] = [
  {
    publisher: 'Storyworth',
    title: 'Storyworth UK homepage: plans, weekly questions and books',
    href: 'https://welcome.storyworth.com/gb',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Remento',
    title: 'Remento’s Pricing Guide',
    href: 'https://help.remento.co/en/articles/8365892-remento-s-pricing-guide',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Remento',
    title: 'Remento homepage: recording, Speech-to-Story and QR codes',
    href: 'https://www.remento.co/',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Remento',
    title: 'Where does Remento ship books (internationally)?',
    href: 'https://help.remento.co/en/articles/8365901-where-does-remento-ship-books-internationally',
    date: '30 June 2026',
  },
  {
    publisher: 'Tinybeans',
    title: 'How much is a Tinybeans+ subscription?',
    href: 'https://tinybeans.helpscoutdocs.com/article/22-how-much-is-a-tinybeans-premium-subscription',
    date: '29 July 2026',
  },
  {
    publisher: 'Tinybeans',
    title: 'What’s the difference between free Tinybeans and Tinybeans+?',
    href: 'https://tinybeans.helpscoutdocs.com/article/83-whats-the-difference-between-free-tinybeans-and-tinybeans',
    date: '28 July 2026',
  },
  {
    publisher: 'Tinybeans',
    title: 'Tinybeans homepage',
    href: 'https://tinybeans.com/',
    date: 'accessed October 2026',
  },
  {
    publisher: 'FamilyAlbum (MIXI, Inc.)',
    title: 'FamilyAlbum homepage',
    href: 'https://family-album.com/',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Apple App Store (UK)',
    title: 'FamilyAlbum: Share Baby Photos',
    href: 'https://apps.apple.com/gb/app/familyalbum-photo-sharing/id935672069',
    date: 'accessed October 2026',
  },
  {
    publisher: 'FamilySearch',
    title: 'Why is FamilySearch free?',
    href: 'https://www.familysearch.org/en/united-states/whyfamilysearchfree',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Apple App Store',
    title: 'FamilySearch Memories',
    href: 'https://apps.apple.com/app/id885970971',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Google',
    title: 'How your Google storage works',
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
    title: 'Back up photos and videos (Google Photos Help)',
    href: 'https://support.google.com/photos/answer/6193313?hl=en-GB',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Apple',
    title: 'iCloud+ plans and pricing',
    href: 'https://support.apple.com/en-gb/108047',
    date: '29 September 2026',
  },
  {
    publisher: 'Apple',
    title: 'Shared Albums limits',
    href: 'https://support.apple.com/en-gb/148868',
    date: '21 September 2026',
  },
];

export default function BestFamilyMemoryAppsPage() {
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
            { name: 'Compare', path: '/compare' },
            { name: 'Best family memory apps', path: PATH },
          ]),
          faqSchema(FAQ),
          ITEM_LIST,
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[
            { href: '/', label: 'Home' },
            { href: '/compare', label: 'Compare' },
            { label: 'Best family memory apps' },
          ]}
          size="md"
          title={
            <>
              The best family memory apps, <Accent>compared honestly.</Accent>
            </>
          }
          intro={[
            "The best family memory app depends on the job. Remento or Storyworth turn one person's stories into a book, Tinybeans or FamilyAlbum share a child's photos with family, Google Photos or iCloud back up and share everyday pictures, FamilySearch Memories is free and tied to a family tree, and Ancestorii is a private, ad-free library the whole family adds to, with prints.",
            "Ancestorii publishes this page, so we have said where each app is strongest and where ours falls short. Every price comes from the company's own website, help centre or App Store listing, checked on 17\u00a0October\u00a02026.",
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        <ArticleSection
          id="at-a-glance"
          kicker="At a glance"
          dot="var(--c1)"
          title={
            <>
              Prices and plans, <Accent tone="blue">in six facts.</Accent>
            </>
          }
        >
          <KeyFacts items={KEY_FACTS} />
        </ArticleSection>

        {/* How we compared */}
        <ArticleSection
          id="how-we-compared"
          kicker="How we compared"
          dot="var(--c2)"
          title={
            <>
              How did we <Accent tone="blue">compare&nbsp;them?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              We picked eight apps that families use to keep photos, voices and stories, and asked the
              same three questions of each one.
            </p>
            <ol>
              <li>
                <strong>What is it built for?</strong> A book, a baby journal, a photo backup, a family
                tree or a family library.
              </li>
              <li>
                <strong>What does it cost?</strong> The free option and the main paid price as of
                October&nbsp;2026, in the currency each company quotes.
              </li>
              <li>
                <strong>Where does it fall short?</strong> Every app has a gap, ours included.
              </li>
            </ol>
          </Reading>
        </ArticleSection>

        {/* Stories into a book */}
        <ArticleSection
          id="stories-into-a-book"
          layout="wide"
          kicker="Stories into a book"
          dot="var(--c3)"
          title={
            <>
              Which app turns a parent&apos;s stories <Accent tone="pink">into a book?</Accent>
            </>
          }
        >
          <PlatformList>
            <AppCard app={REMENTO} />
            <AppCard app={STORYWORTH} />
          </PlatformList>
          <TableNote>
            More detail in our{' '}
            <Link href="/compare/remento-alternative" className={site.textLink}>
              Remento alternative
            </Link>{' '}
            and{' '}
            <Link href="/compare/storyworth-alternative" className={site.textLink}>
              Storyworth alternative
            </Link>{' '}
            comparisons.
          </TableNote>
        </ArticleSection>

        {/* Children's photos */}
        <ArticleSection
          id="childrens-photos"
          layout="wide"
          kicker="Children's photos"
          dot="var(--c0)"
          title={
            <>
              Which is best for sharing <Accent tone="blue">photos of children?</Accent>
            </>
          }
        >
          <PlatformList>
            <AppCard app={TINYBEANS} />
            <AppCard app={FAMILYALBUM} />
          </PlatformList>
          <TableNote>
            See{' '}
            <Link href="/compare/ancestorii-vs-tinybeans" className={site.textLink}>
              Ancestorii vs Tinybeans
            </Link>
            .
          </TableNote>
        </ArticleSection>

        {/* Backup */}
        <ArticleSection
          id="backing-up-photos"
          layout="wide"
          kicker="Backing up"
          dot="var(--c1)"
          title={
            <>
              Which is best for backing up <Accent tone="pink">every photo?</Accent>
            </>
          }
        >
          <PlatformList>
            <AppCard app={GOOGLE_PHOTOS} />
            <AppCard app={ICLOUD} />
          </PlatformList>
          <TableNote>
            See{' '}
            <Link href="/compare/ancestorii-vs-google-photos" className={site.textLink}>
              Ancestorii vs Google Photos
            </Link>{' '}
            and{' '}
            <Link href="/compare/ancestorii-vs-icloud-shared-albums" className={site.textLink}>
              Ancestorii vs iCloud Shared Albums
            </Link>
            .
          </TableNote>
        </ArticleSection>

        {/* Family history */}
        <ArticleSection
          id="family-history"
          layout="wide"
          kicker="Family history"
          dot="var(--c2)"
          title={
            <>
              Which is best if you are researching <Accent tone="blue">family history?</Accent>
            </>
          }
        >
          <PlatformList>
            <AppCard app={FAMILYSEARCH} />
          </PlatformList>
        </ArticleSection>

        {/* Private family library */}
        <ArticleSection
          id="private-family-library"
          layout="wide"
          kicker="A private family library"
          dot="var(--c3)"
          title={
            <>
              Which is best for a library <Accent tone="pink">the whole family adds to?</Accent>
            </>
          }
        >
          <PlatformList>
            <AppCard app={ANCESTORII} featured />
          </PlatformList>
        </ArticleSection>

        {/* Side by side */}
        <ArticleSection
          id="side-by-side"
          layout="wide"
          kicker="Side by side"
          dot="var(--c0)"
          title={
            <>
              Family memory apps compared <Accent tone="blue">side by side.</Accent>
            </>
          }
        >
          <CompareTable
            head={['App', 'Free option', 'Paid plan', 'Best for']}
            rows={SIDE_BY_SIDE}
            highlight={-1}
            size="wide"
            labelledBy="side-by-side-title"
          />
          <TableNote>
            Checked on 17&nbsp;October&nbsp;2026. Remento and Tinybeans quote prices in US dollars.
          </TableNote>
        </ArticleSection>

        {/* Where Ancestorii helps */}
        <ArticleSection
          id="where-ancestorii-helps"
          kicker="Where Ancestorii helps"
          dot="var(--c1)"
          title={
            <>
              How does <Accent tone="pink">Ancestorii help?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Ancestorii is built for one job: keeping a whole family&apos;s photos, stories and
              voices in one private place that everyone adds to. A
              memory can hold up to 10 photos, a video and a voice note, and when two relatives
              remember the same moment differently, both versions sit side by side as tabs.
            </p>
            <p>
              It is not the cheapest place to store thousands of photos: Google Photos and iCloud are
              built for that, and Ancestorii&apos;s Free plan has 1&nbsp;GB. Nor does it transcribe
              recordings or print QR codes, as Remento does. What it adds is the story around each
              photo, kept private.
            </p>
            <p>
              When you want something to hold, <Link href="/memory-books">Memory Books</Link> are A4
              landscape hardcovers of 24, 36 or 48 pages, from £44.99 plus delivery, laid out page by
              page from your family&apos;s library.
            </p>
          </Reading>
        </ArticleSection>

        {/* Questions */}
        <ArticleSection
          id="questions"
          kicker="Questions"
          dot="var(--c2)"
          title={
            <>
              Family memory app <Accent tone="blue">questions.</Accent>
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
          size="md"
          title={
            <>
              The whole family.
              <br />
              One private place.
            </>
          }
          lead="Free to start. No card needed. Invite everyone."
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
