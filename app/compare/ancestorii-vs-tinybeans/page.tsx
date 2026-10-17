import Link from 'next/link';
import type { Metadata } from 'next';
import { BookHeart, Printer, ShieldCheck, UsersRound } from 'lucide-react';
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
  QuoteBlock,
  Reading,
  ReasonCards,
  TableNote,
} from '@/components/site/seo-articles/ArticleBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';

const PATH = '/compare/ancestorii-vs-tinybeans';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Tinybeans Alternative for the Whole Family';
const HEADLINE = 'Ancestorii vs Tinybeans: baby journal or family archive?';
const DESCRIPTION =
  "Tinybeans shares a child's photos with family. Ancestorii keeps every generation's photos, voices and stories. Prices and limits as of October 2026.";

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Ancestorii vs Tinybeans' }],
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

// Tinybeans details checked on tinybeans.com and its help centre on 17 October 2026.
const ROWS = [
  ['Built for', 'Every generation of a family', "Parents sharing their children's moments"],
  ['Free plan', '1\u00a0GB shared storage, 5-minute videos, no monthly upload cap', '20 uploads a month, 5\u00a0GB of storage'],
  ['Ads', 'None on either plan', 'On the free plan; none on Tinybeans+'],
  ['Paid plan', 'Premium: £3.99, €4.99 or $5.99 a month', 'Tinybeans+: $74.99 a year or $7.99 a month'],
  ['Who the paid plan covers', 'Everyone in the family space', 'You and one other person'],
  ['Paid storage', '100\u00a0GB, shared by the family', '200\u00a0GB'],
  ['Video length', '5\u00a0minutes on Free, 15 on Premium', 'Up to 5\u00a0minutes on Tinybeans+'],
  ['Voice notes', 'On both plans', 'A Tinybeans+ feature'],
  ['Pages for people', 'Loved Ones life stories: 1 on Free, unlimited on Premium', 'Height, weight and milestones for each child'],
  ['Who can add', 'Every member of the family space', 'Followers you give permission to'],
  ['Printed books', 'A4 hardcover Memory Books, 24 to 48 pages, from £44.99 plus delivery', 'Photo books from $19.99 on the website, up to 200 pages'],
  ['Exporting', 'PDF downloads of timelines and Memory Book designs', 'Mass export of photos and videos on Tinybeans+'],
];

const HELPS = [
  {
    title: 'One price for the whole family.',
    text: 'Premium is £3.99 a month per family, not per person, and there is no limit on how many relatives can join.',
    Icon: UsersRound,
  },
  {
    title: 'No ads, even on Free.',
    text: 'There are no ads on either plan, and Ancestorii does not sell, rent or trade personal data.',
    Icon: ShieldCheck,
  },
  {
    title: 'Room for every generation.',
    text: "Loved Ones pages, timelines and questions keep grandparents' stories as well as a child's first years.",
    Icon: BookHeart,
  },
  {
    title: 'Keepsakes from the same photos.',
    text: 'Memory Books from £44.99, and canvas and acrylic prints from £99.99, all plus delivery, designed from your family Library.',
    Icon: Printer,
  },
];

// Shown on the page and written into the FAQPage structured data, word for word.
const FAQ_PLAIN = [
  {
    q: 'Is Tinybeans free?',
    a: 'Yes, with limits. Free Tinybeans allows up to 20 photo and video uploads a month and 5\u00a0GB of storage, with ads around the journal. Once a free journal reaches 5\u00a0GB, Tinybeans keeps the newest memories visible, archives older ones and needs a paid plan before you can add more.',
  },
  {
    q: 'How much does Tinybeans+ cost in the UK?',
    a: "As of October\u00a02026, Tinybeans' help centre prices Tinybeans+ at $74.99 a year or $7.99 a month and says all its pricing is in US dollars except in Australia. On the UK App Store, Tinybeans+ is listed as an in-app subscription at £7.99 and £69.99.",
  },
  {
    q: 'Does Ancestorii show ads on the free plan?',
    a: "No. There are no ads on Ancestorii's Free plan or on Premium, and Ancestorii does not sell, rent or trade personal data. The Free plan gives a family 1\u00a0GB of shared storage, files up to 20\u00a0MB, videos up to 5\u00a0minutes and unlimited albums, timelines and capsules.",
  },
  {
    q: 'Can grandparents use Ancestorii as well as parents?',
    a: 'Yes. Invite them into your family space and they get their own account, with the free iPhone and Android app, to add memories, photos and voice notes. You can send them one of 46 ready-made questions to answer in the app, and give them a Loved Ones page for their life story (the Free plan includes one).',
  },
  {
    q: 'Can I make a time capsule for my child?',
    a: 'Yes. On the Ancestorii website, a capsule holds photos, videos, a letter and voice notes, and you choose the date it opens, such as their 18th birthday. You can tag the loved ones in it, and capsules are unlimited on both plans.',
  },
];

const SOURCES: Source[] = [
  {
    publisher: 'Tinybeans',
    title: 'Tinybeans: The Photo-Sharing App That Families Love (home page)',
    href: 'https://tinybeans.com/',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Tinybeans',
    title: 'Tinybeans FAQs',
    href: 'https://tinybeans.com/faqs',
    date: '2024',
  },
  {
    publisher: 'Tinybeans Help Center',
    title: 'How much is a Tinybeans+ subscription?',
    href: 'https://tinybeans.helpscoutdocs.com/article/22-how-much-is-a-tinybeans-premium-subscription',
    date: 'updated 29 July 2026',
  },
  {
    publisher: 'Tinybeans Help Center',
    title: "What's included in the Tinybeans+ subscription?",
    href: 'https://tinybeans.helpscoutdocs.com/article/79-whats-included-in-the-tinybeans-subscription',
    date: 'updated 29 July 2026',
  },
  {
    publisher: 'Tinybeans Help Center',
    title: 'What is Tinybeans+ Legacy?',
    href: 'https://tinybeans.helpscoutdocs.com/article/80-what-is-tinybeans-legacy',
    date: 'updated 15 July 2025',
  },
  {
    publisher: 'Tinybeans Help Center',
    title: 'What happens when I reach the 5GB storage limit on the free plan?',
    href: 'https://tinybeans.helpscoutdocs.com/article/77-what-happens-when-i-reach-the-5gb-storage-limit-on-the-free-plan',
    date: 'updated 15 July 2025',
  },
  {
    publisher: 'Tinybeans Help Center',
    title: 'Can I create more than one journal with Tinybeans?',
    href: 'https://tinybeans.helpscoutdocs.com/article/41-how-do-i-add-a-new-child-to-my-journal',
    date: 'updated 29 July 2026',
  },
  {
    publisher: 'Tinybeans Help Center',
    title: 'What are the different access levels I can grant followers?',
    href: 'https://tinybeans.helpscoutdocs.com/article/105-what-are-the-different-access-levels-i-can-grant-followers',
    date: 'updated 22 September 2025',
  },
  {
    publisher: 'Tinybeans Help Center',
    title: 'What can my family and friends see on Tinybeans?',
    href: 'https://tinybeans.helpscoutdocs.com/article/15-what-can-my-followers-see-on-tinybeans',
    date: 'updated 15 July 2025',
  },
  {
    publisher: 'Tinybeans Help Center',
    title: 'How can I export (or download) all of my memories?',
    href: 'https://tinybeans.helpscoutdocs.com/article/28-how-can-i-export-all-of-my-moments',
    date: 'updated 29 July 2026',
  },
  {
    publisher: 'Tinybeans Help Center',
    title: 'Will my memories be deleted if I cancel my subscription or downgrade?',
    href: 'https://tinybeans.helpscoutdocs.com/article/87-will-my-memories-be-deleted-if-i-cancel-my-subscription-or-downgrade',
    date: 'updated 15 July 2025',
  },
  {
    publisher: 'Tinybeans Help Center',
    title: 'How much does it cost to create a Photo Book?',
    href: 'https://tinybeans.helpscoutdocs.com/article/35-how-much-does-it-cost-to-create-a-photo-book',
    date: 'updated 18 August 2026',
  },
  {
    publisher: 'Tinybeans Help Center',
    title: 'How much does it cost to ship my Photo Book?',
    href: 'https://tinybeans.helpscoutdocs.com/article/66-how-much-does-it-cost-to-ship-my-photo-book',
    date: 'updated 18 August 2026',
  },
  {
    publisher: 'Apple App Store (UK)',
    title: 'Tinybeans Private Family Album: in-app purchases',
    href: 'https://apps.apple.com/gb/app/tinybeans-private-family-album/id521633042',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Ancestorii',
    title: 'Plans and pricing',
    href: 'https://www.ancestorii.com/pricing',
    date: '2026',
  },
];

export default function AncestoriiVsTinybeansPage() {
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
            { name: 'Ancestorii vs Tinybeans', path: PATH },
          ]),
          faqSchema(FAQ_PLAIN),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[
            { href: '/', label: 'Home' },
            { href: '/compare', label: 'Compare' },
            { label: 'Ancestorii vs Tinybeans' },
          ]}
          size="md"
          title={
            <>
              Ancestorii vs Tinybeans: <Accent>baby journal or family archive?</Accent>
            </>
          }
          intro={[
            "Tinybeans is a private photo journal built for parents to share their children's everyday moments with family: free for 20 uploads a month, or $74.99 a year for Tinybeans+ as of October\u00a02026. Ancestorii is a private archive for every generation, with stories, voice notes, timelines and life-story pages for grandparents as well as grandchildren.",
            'The Tinybeans details on this page come from its own website, help centre and UK App Store listing, checked in October\u00a02026.',
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        {/* The short answer, beside a real childhood moment */}
        <ArticleSection
          aside={
            <CaptionedPhoto
              src="/sister.jpg"
              alt="A small child in a pink jumper eating from a mug, from the Ancestorii founder's family album"
              label="A childhood memory · the founder's family"
              color="var(--c2)"
              position="45% 50%"
              caption="From the founder's family album: the kind of moment that disappears if nobody writes it down."
              priority
            />
          }
        >
          <KeyFacts
            items={[
              <>
                <strong>Free Tinybeans</strong> allows up to 20 photo and video uploads a month and 5&nbsp;GB
                of storage, with ads around the journal.
              </>,
              <>
                <strong>Tinybeans+</strong> costs $74.99 a year or $7.99 a month, according to its help
                centre. On the UK App Store it is listed at £7.99 and £69.99.
              </>,
              <>
                <strong>Tinybeans+ adds</strong> unlimited uploads, 200&nbsp;GB of storage, videos up to
                5&nbsp;minutes, no ads and shared benefits with one other person.
              </>,
              <>
                <strong>Ancestorii&apos;s Free plan</strong> gives a family 1&nbsp;GB of shared storage,
                5-minute videos and unlimited albums, timelines and capsules, with no ads.
              </>,
              <>
                <strong>Ancestorii Premium</strong> is £3.99 a month for the whole family: 100&nbsp;GB,
                15-minute videos and unlimited Loved Ones pages.
              </>,
            ]}
          />
        </ArticleSection>

        <ArticleSection
          id="tinybeans"
          kicker="Fair to Tinybeans"
          dot="var(--c1)"
          title={
            <>
              What is Tinybeans <Accent tone="blue">built for?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Tinybeans describes itself as “a journal, visual diary, and time capsule, where parents
              can save their family&apos;s favorite memories”. It is built around children: its help
              centre says it is designed for all of your children to be on one journal together, like
              a family photo album, and you can log each child&apos;s height, weight and milestones.
              Tinybeans says more than 4 million families use it.
            </p>
            <p>
              Family and friends follow the journal with their own login. Tinybeans says followers get
              a daily update on days you add memories, plus flashbacks and weekly summaries, which
              suits grandparents who live far away. You choose what each follower can do, from viewing
              measurements and milestones to adding their own photos, videos and quotes, or full access
              as a co-owner. By default everyone you add sees every memory, except ones you mark as
              hidden when you upload them.
            </p>
            <p>
              It also prints photo books, from $19.99 on the website or $25.99 in the app, with up to
              200 pages on 100-weight glossy paper, in hardcover or softcover.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="prices"
          kicker="Prices"
          dot="var(--c2)"
          title={
            <>
              What do Tinybeans&apos; plans <Accent tone="pink">cost?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              As of October&nbsp;2026, Tinybeans&apos; help centre says all its pricing is in US dollars
              except in Australia, which pays in Australian dollars. The UK App Store, though, lists
              Tinybeans+ as an in-app subscription at £7.99 and £69.99.
            </p>
            <ul>
              <li>
                <strong>Free:</strong> up to 20 photo and video uploads a month and 5&nbsp;GB of storage,
                with ads around your family&apos;s journal. When a free journal reaches 5&nbsp;GB, the
                newest memories stay visible, older ones are archived, and you need a paid plan to keep
                adding.
              </li>
              <li>
                <strong>Tinybeans+:</strong> $74.99 a year or $7.99 a month for unlimited uploads,
                200&nbsp;GB of storage (which Tinybeans says holds 50,000+ photos and videos), videos up to
                5&nbsp;minutes, an ad-free journal, priority support, free photo book shipping in the US,
                voice notes and bulk uploads. You can share the benefits with one other person.
              </li>
              <li>
                <strong>Tinybeans+ Legacy:</strong> for families who upload less often, with 200&nbsp;GB of
                storage, 20 uploads a month and benefits shared with one other user. Its help centre
                does not give a price; the UK App Store lists it at £3.99 and £39.99.
              </li>
            </ul>
            <p>
              Without Tinybeans+ and a US address, photo book shipping on website orders is $5 per book
              in the US or $10 elsewhere. Two more details matter for an archive. A mass export of
              your photos and videos is a Tinybeans+ feature, sent as download links a month at a time.
              And Tinybeans says that if an account is inactive for 12&nbsp;months, meaning no logins,
              upgrades or photo book purchases, its data may be permanently deleted.
            </p>
          </Reading>
        </ArticleSection>

        <QuoteBlock>
          Tinybeans follows a child as they grow.{' '}
          <Accent tone="blue">Ancestorii keeps the whole family&apos;s story.</Accent>
        </QuoteBlock>

        <ArticleSection
          id="ancestorii"
          kicker="Ancestorii"
          dot="var(--c0)"
          title={
            <>
              What is Ancestorii <Accent tone="pink">built for?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Ancestorii is built for a whole family across generations, not one child&apos;s first
              years. Everyone you invite joins the same private library and can add to it, with no
              limit on how many relatives can join, and one £3.99 Premium subscription covers everyone
              in the family space.
            </p>
            <ul>
              <li>
                <strong>Loved Ones pages</strong> give each person, from a new baby to a great-grandparent,
                a page with their dates and life story in four chapters. The Free plan includes 1;
                Premium includes as many as you like.
              </li>
              <li>
                <strong>Memories</strong> in the private feed hold your words, up to 10 photos, a video
                and a voice note. The feed lives in the free iPhone and Android app.
              </li>
              <li>
                <strong>Albums</strong> keep a memory date, the story and voice notes with each photo,
                and <strong>timelines</strong> lay out dated moments in order.
              </li>
              <li>
                <strong>Questions:</strong> send a grandparent one of 46 ready-made questions from the
                app. Their answer lands in the family feed.
              </li>
              <li>
                <strong>Capsules</strong> seal photos, a letter and voice notes until a date you choose,
                such as a child&apos;s 18th birthday.
              </li>
              <li>
                <strong>Memory Books</strong> are A4 landscape hardcovers of 24, 36 or 48 printed pages,
                from £44.99 plus delivery, shipped to 20 countries.
              </li>
            </ul>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="side-by-side"
          layout="wide"
          kicker="Side by side"
          title={
            <>
              Ancestorii vs Tinybeans: <Accent tone="pink">side by side.</Accent>
            </>
          }
        >
          <CompareTable
            head={['Feature', 'Ancestorii', 'Tinybeans']}
            rows={ROWS}
            highlight={1}
            size="mid"
            labelledBy="side-by-side-title"
          />
          <TableNote>
            Tinybeans details as of October&nbsp;2026. Looking wider? See{' '}
            <Link href="/compare/best-family-memory-apps" className={site.textLink}>
              the best family memory apps
            </Link>
            .
          </TableNote>
        </ArticleSection>

        <ArticleSection
          id="which-suits"
          kicker="Choosing"
          dot="var(--c3)"
          title={
            <>
              Which suits <Accent tone="blue">your family?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Tinybeans is the more focused tool if your aim is sharing a baby&apos;s or
              toddler&apos;s photos with grandparents every day. It is built for exactly that,
              Tinybeans+ has unlimited uploads and twice the storage of Ancestorii Premium (200&nbsp;GB
              against 100&nbsp;GB), and its photo books start at a lower price.
            </p>
            <p>Ancestorii suits families who want more than a baby feed:</p>
            <ul>
              <li>
                grandparents, parents and cousins all adding to one library, with one subscription for
                everyone
              </li>
              <li>stories and voices, not just photos, including the older generation&apos;s own</li>
              <li>no ads, even on the free plan</li>
            </ul>
            <p>
              Whichever you choose, keep your original photos somewhere you control as well, and if
              you use Tinybeans, log in now and then because of its 12-month inactivity rule.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="both"
          kicker="Both"
          dot="var(--c1)"
          title={
            <>
              Can you use <Accent tone="pink">both?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Yes. Keep the daily baby journal in Tinybeans, and use Ancestorii for what the wider
              family should keep:
            </p>
            <ul>
              <li>
                a <Link href="/features/digital-time-capsule">digital time capsule</Link> for your
                child, with photos, a letter and voice notes, set to open on their 18th birthday
              </li>
              <li>
                a <Link href="/features/loved-ones">Loved Ones page</Link> for a grandparent, with
                their life story in four chapters
              </li>
              <li>a Memory Book of the first year, designed page by page</li>
            </ul>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="how-ancestorii-helps"
          layout="wide"
          kicker="Where Ancestorii fits"
          dot="var(--c2)"
          title={
            <>
              How it <Accent tone="blue">helps.</Accent>
            </>
          }
        >
          <ReasonCards items={HELPS} />
          <TableNote>
            What it does not do: Premium storage is 100&nbsp;GB against 200&nbsp;GB on Tinybeans+, there is no
            height or weight tracking, the private feed and questions are in the app, and capsules,{' '}
            <Link href="/memory-books" className={site.textLink}>
              Memory Books
            </Link>{' '}
            and prints are made on the website. See{' '}
            <Link href="/features/invite-family" className={site.textLink}>
              how to invite your family
            </Link>{' '}
            and{' '}
            <Link href="/pricing" className={site.textLink}>
              plans and pricing
            </Link>
            .
          </TableNote>
        </ArticleSection>

        <ArticleSection
          id="questions"
          kicker="Questions"
          dot="var(--c3)"
          title={
            <>
              Things people <Accent tone="blue">ask us.</Accent>
            </>
          }
        >
          <FaqBlock items={FAQ_PLAIN} variant="open" />
        </ArticleSection>

        {/* Sources, then who wrote it */}
        <ArticleSection>
          <Sources items={SOURCES} />
          <div className={site.sectionBody}>
            <AuthorBox updated="17 October 2026" />
          </div>
        </ArticleSection>

        <ArticleCta
          title={
            <>
              Their first years,
              <br />
              and those before.
            </>
          }
          lead="Free to start. No ads. One price covers the whole family."
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
