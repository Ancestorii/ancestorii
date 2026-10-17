import Link from 'next/link';
import type { Metadata } from 'next';
import { BellOff, CalendarClock, Globe, TreeDeciduous, UsersRound, VolumeX } from 'lucide-react';
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
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';

const PATH = '/features';
const TITLE = 'Family Memory App Features: What You Can Keep';
const DESCRIPTION =
  'Every Ancestorii feature in one place: the private My Family feed, albums, timelines, capsules, voice notes, Our Stories and prints, with plan limits.';
const HEADLINE = 'Every Ancestorii feature, and what each one does';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    title: `${TITLE} | Ancestorii`,
    description:
      'A private space for family memories, a free public story feed and printed keepsakes. Every feature, with the real limits on each plan.',
    url: `${SITE_URL}${PATH}`,
    siteName: 'Ancestorii',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Ancestorii features' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | Ancestorii`,
    description: 'Every Ancestorii feature, where you use it, and the real limits on each plan.',
    images: ['/og-default.jpg'],
  },
};

const FAQ = [
  {
    q: 'Is Ancestorii free to use?',
    a: 'Yes. Our Stories is free for everyone, and My Family has a free plan with no card needed: 1 GB of family storage, files up to 20 MB, 5-minute videos, unlimited albums, timelines and capsules, and 1 Loved Ones profile. Premium costs £3.99 a month per family if you need more, and prints are paid for separately.',
  },
  {
    q: 'Do I need the app, or can I use the website?',
    a: 'Both, for different things. The private feed and questions are in the free iPhone and Android app; capsules, the Library, Our Stories, upgrades and print orders are on the website; albums, timelines, voice notes and Loved Ones work in both, with one login.',
  },
  {
    q: 'Does one Premium plan cover my whole family?',
    a: 'Yes. Premium is bought per family, not per person. One subscription covers everyone in your family space, and its 100 GB of storage is one pool the whole family shares.',
  },
  {
    q: 'Can Ancestorii build a family tree?',
    a: 'No. Ancestorii keeps memories, photos, voices and stories, and gives each person a Loved Ones profile, but it has no family tree or record search. If you are tracing ancestors, a genealogy service is the right tool, and Ancestorii can hold the stories behind the names.',
  },
  {
    q: 'Which countries do printed products ship to?',
    a: 'Twenty: the United Kingdom, United States, Canada, Australia, New Zealand, Ireland, Germany, France, Spain, Italy, the Netherlands, Belgium, Austria, Switzerland, Sweden, Denmark, Norway, Finland, Portugal and Poland. The Heritage canvas ships to the UK only, and delivery is charged on every order, from £4.99.',
  },
  {
    q: 'Can anyone outside my family see our memories?',
    a: 'No. My Family is visible only to members of your family space, and the database enforces that with row-level security. Something becomes public only if a member publishes it as a story on Our Stories, and a published story can be taken down at any time.',
  },
];

const WHERE = [
  [
    'Private family feed',
    'The iPhone and Android app. Single memories also open on the website from notifications and emails.',
  ],
  ['Albums, timelines, voice notes, Loved Ones', 'The app and the website'],
  ['Questions', 'The app, for sending and answering'],
  ['Rewards', 'Earned in the app, redeemed at print checkout on the website'],
  ['Capsules and the Library', 'The website'],
  ['Our Stories', 'The website: read, publish, react and comment'],
  ['Memory Books, canvases, acrylic prints', 'The website'],
  ['Upgrading to Premium', 'The website'],
  [
    'Inviting family',
    'The website, by share link or email. Sending a question from the app can invite someone too.',
  ],
];

// The prices come straight after the names, so they stay in view on phones.
const PRINTS = [
  [
    'Memory Book',
    '£44.99, £54.99 or £64.99',
    'A4 landscape hardcover: A Chapter (24 printed pages), A Story (36) or A Legacy (48)',
  ],
  [
    'Canvas print',
    '£99.99, £129.99 or £169.99',
    'The Moment 16×36 in, The Heirloom 20×32 in or The Heritage 24×72 in (UK delivery only)',
  ],
  [
    'Acrylic print',
    '£99.99, £149.99 or £199.99',
    'The Portrait 16×24 in, The Centrepiece 24×24 in or The Masterpiece 24×36 in',
  ],
];

const PLANS = [
  ['Price', '£0, no card needed', '£3.99, €4.99 or $5.99 a month per family'],
  ['Family storage', '1 GB, shared', '100 GB, shared'],
  ['Largest file', '20 MB', '10 GB'],
  ['Video length', 'Up to 5 minutes', 'Up to 15 minutes'],
  ['Loved Ones profiles', '1', 'Unlimited'],
  ['Albums, timelines, capsules', 'Unlimited', 'Unlimited'],
  ['Family members', 'No limit', 'No limit'],
  ['Our Stories', 'Free', 'Free'],
  ['Prints', 'Full price', '10% off'],
  ['Support', 'Email', 'Priority'],
  ['New features', 'On release', 'Early access'],
];

const LIMITS = [
  {
    title: 'No family trees.',
    text: 'Ancestorii does not build family trees or search historical records. Its Terms call it a memory-preservation and storytelling service, not a genealogical research service.',
    Icon: TreeDeciduous,
  },
  {
    title: 'No audio in print.',
    text: 'Printed Memory Books hold photos and words. Voice notes stay in your library, and the books carry no QR codes.',
    Icon: VolumeX,
  },
  {
    title: '20 countries, not everywhere.',
    text: 'Prints ship to 20 countries, listed below. The Heritage canvas ships to the UK only.',
    Icon: Globe,
  },
  {
    title: 'Monthly only.',
    text: 'Premium has no annual plan or free trial. To cancel, use the Help page form or email support@ancestorii.com, and Premium runs to the end of the period you have paid for.',
    Icon: CalendarClock,
  },
  {
    title: 'One family space each.',
    text: 'Every account belongs to one family space. Someone already in another family space with other members cannot join yours.',
    Icon: UsersRound,
  },
  {
    title: 'No capsule alerts.',
    text: 'Nothing is sent when a capsule opens on its date, so keep a note of the date somewhere your family will see it.',
    Icon: BellOff,
  },
];

const SOURCES: Source[] = [
  {
    publisher: 'PostgreSQL Global Development Group',
    title: 'PostgreSQL 18 Documentation: 5.9 Row Security Policies',
    href: 'https://www.postgresql.org/docs/current/ddl-rowsecurity.html',
    date: '2026',
  },
  {
    publisher: 'Supabase',
    title: 'Serving assets from Storage',
    href: 'https://supabase.com/docs/guides/storage/serving/downloads',
    date: '2026',
  },
  {
    publisher: "Information Commissioner's Office",
    title: 'Register of fee payers, entry ZC149600 (Ancestorii LTD)',
    href: 'https://ico.org.uk/ESDWebPages/Entry/ZC149600',
    date: '2026',
  },
  {
    publisher: 'Apple App Store',
    title: 'Ancestorii, iPhone app listing',
    href: 'https://apps.apple.com/app/id6784750387',
    date: '2026',
  },
  {
    publisher: 'Google Play',
    title: 'Ancestorii, Android app listing',
    href: 'https://play.google.com/store/apps/details?id=com.ancestorii.app',
    date: '2026',
  },
  {
    publisher: 'Ancestorii',
    title: 'Terms of Service',
    href: 'https://www.ancestorii.com/terms',
    date: '2026',
  },
  {
    publisher: 'Ancestorii',
    title: 'Privacy Policy',
    href: 'https://www.ancestorii.com/privacy-policy',
    date: '2026',
  },
];

export default function FeaturesPage() {
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
            type: 'WebPage',
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Features', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[{ href: '/', label: 'Home' }, { label: 'Features' }]}
          size="md"
          title={
            <>
              Every Ancestorii feature, <Accent>and what each one does.</Accent>
            </>
          }
          intro={[
            'Ancestorii gives each family a private space, My Family, for memories, albums, timelines, capsules, voice notes and a shared photo library, plus a free public feed, Our Stories, for the stories you choose to share. My Family is free to start, Premium costs £3.99 a month for the whole family, and your photos and words can become a printed Memory Book, canvas or acrylic print.',
            <>
              Below is every feature as it works in October&nbsp;2026, where you use it and what each
              plan allows. For a guided tour, see{' '}
              <Link href="/how-it-works" className={site.textLink}>
                how Ancestorii works
              </Link>
              .
            </>,
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        {/* The short answer, beside Andrea's photo and her own words (Nicole's stays on the
            Library page, so the hub and its child page don't repeat a photo) */}
        <ArticleSection
          aside={
            <CaptionedPhoto
              src="/testimonial4.png"
              alt="Andrea holding her printed Ancestorii Memory Book about her dad"
              label="Andrea · Dudley, UK"
              color="var(--c2)"
              position="58% 50%"
              caption="“I recently lost my dad, so this book became incredibly special. It captured the essence of him and the life he lived. Our family will treasure it for years to come.”"
              priority
            />
          }
        >
          <KeyFacts
            items={[
              <>
                <strong>Free plan:</strong> £0 and no card. 1&nbsp;GB of family storage, files up to
                20&nbsp;MB, videos up to 5&nbsp;minutes, unlimited albums, timelines and capsules, and
                1 Loved Ones profile.
              </>,
              <>
                <strong>Premium:</strong> £3.99, €4.99 or $5.99 a month per family, not per person.
                100&nbsp;GB of shared storage, files up to 10&nbsp;GB, videos up to 15&nbsp;minutes and
                unlimited Loved Ones profiles. Monthly only, with no free trial.
              </>,
              <>
                <strong>Apps:</strong> free on iPhone and Android. The same email and password work
                on the website, where upgrades and print orders happen.
              </>,
              <>
                <strong>Our Stories:</strong> free for everyone. Reading needs no account, and every
                story sits under one of seven topics.
              </>,
              <>
                <strong>Prints:</strong> Memory Books from £44.99, canvas and acrylic prints from
                £99.99, plus delivery. They ship to 20 countries.
              </>,
              <>
                <strong>Family members:</strong> no limit on either plan.
              </>,
            ]}
          />
        </ArticleSection>

        {/* The private side, feature by feature */}
        <ArticleSection
          id="my-family"
          kicker="My Family"
          dot="var(--c0)"
          title={
            <>
              What can your family keep <Accent tone="pink">in My Family?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              My Family is the private side of Ancestorii. Everyone you invite shares one library,
              and only members of your family space can open it. It holds:
            </p>
            <ul>
              <li>
                <Link href="/features/private-family-feed">Memories</Link>: a moment in your own
                words, with up to 10 photos, one video and a voice note, shared in a private feed in
                the app. Relatives can add their own version of it as a tab.
              </li>
              <li>
                <Link href="/features/family-photo-albums">Albums</Link>: photos and videos from one
                chapter of life. Each picture can carry a date, a story thread the family adds to,
                and voice notes.
              </li>
              <li>
                <Link href="/features/family-timeline">Timelines</Link>: dated moments in order, each
                with photos, video, comments and voice notes, plus a PDF of the timeline (with an
                Ancestorii watermark) to download.
              </li>
              <li>
                <Link href="/features/digital-time-capsule">Capsules</Link>: photos, a letter and
                voice notes sealed until a date you choose, when the capsule opens.
              </li>
              <li>
                <Link href="/features/voice-notes">Voice notes</Link>: recorded or uploaded on
                memories, album photos, timeline moments, capsules and stories, then converted
                automatically so they play on any phone.
              </li>
              <li>
                <Link href="/features/loved-ones">Loved Ones</Link>: a profile for each person (1 on
                Free, unlimited on Premium), with their dates and their life story in four chapters:
                Early years, Important moments, Special memories and Who they are.
              </li>
              <li>
                <Link href="/features/family-library">The Library</Link>: one shared home for every
                photo and video, sorted into folders and reused in albums, timelines, capsules and
                prints.
              </li>
              <li>
                <Link href="/features/family-questions">Questions</Link>: send a relative one of 46
                ready-made questions across 10 chapters. They answer in the app, the answer becomes
                a memory, and you get an email when it arrives.
              </li>
              <li>
                <Link href="/features/writing-help">Writing help</Link>: optional suggestions for
                openings, captions and descriptions, powered by Anthropic&apos;s Claude. It is on by
                default and can be switched off in your profile.
              </li>
              <li>
                <Link href="/features/invite-family">Invites</Link>: bring relatives in with a
                reusable share link or a personal email invite.
              </li>
            </ul>
            <p>
              As memories add up, families also earn rewards in the app: print discounts from 10% at
              10 memories to 50% at 175, and one free Chapter Memory Book at 100 memories once at
              least two people have contributed. Delivery is still charged on reward orders.
            </p>
          </Reading>
        </ArticleSection>

        <QuoteBlock>
          Private for your family. <Accent tone="blue">Public only when you choose.</Accent>
        </QuoteBlock>

        {/* App or website */}
        <ArticleSection
          id="app-and-website"
          layout="wide"
          kicker="App and website"
          dot="var(--c1)"
          title={
            <>
              Which features are in the app, <Accent tone="blue">and which are on the website?</Accent>
            </>
          }
        >
          <CompareTable
            head={['Feature', 'Where you use it']}
            rows={WHERE}
            highlight={1}
            size="fit"
            labelledBy="app-and-website-title"
          />
          <TableNote>
            The same email and password work in both places. On the website, the timeline builder
            needs a screen at least 1,024&nbsp;pixels wide, and the iPhone app needs iOS&nbsp;15.1
            or&nbsp;later.
          </TableNote>
        </ArticleSection>

        {/* The public side */}
        <ArticleSection
          id="our-stories"
          kicker="Our Stories"
          dot="var(--c2)"
          title={
            <>
              How is Our Stories different <Accent tone="blue">from My Family?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Our Stories is the public side: a free feed of real family stories that anyone can read
              without an account. The two never mix on their own: nothing from My Family appears in
              Our Stories unless a member chooses to publish it, and a published story can be taken
              down at any time.
            </p>
            <p>
              Every story sits under one of seven topics: Family, Food &amp; Recipes, Childhood,
              Love, Life Lessons, Traditions and Travel. Stories can carry photos, a video and a
              voice note. The feed shows the newest first, readers can also sort by Most Loved or
              Most Discussed, and there are no follower counts.
            </p>
            <p>
              It is only for genuine family memories, so religious or political posts, hate speech,
              harassment, spam and self-promotion are not allowed. Each story gets an automatic check
              when it is published, and anything flagged waits for a person to review it. A third
              strike means a permanent ban from Our Stories, though it never touches anyone&apos;s
              private library. <Link href="/stories">Read Our Stories</Link> or see{' '}
              <Link href="/features/our-stories">how Our Stories works</Link>.
            </p>
          </Reading>
        </ArticleSection>

        {/* Printed keepsakes */}
        <ArticleSection
          id="prints"
          layout="wide"
          kicker="Heirlooms"
          dot="var(--c3)"
          title={
            <>
              What can you print <Accent tone="pink">from your family library?</Accent>
            </>
          }
        >
          <CompareTable
            head={['Keepsake', 'Prices plus delivery', 'Sizes']}
            rows={PRINTS}
            highlight={1}
            size="wide"
            labelledBy="prints-title"
          />
          <TableNote>
            Delivery is added at checkout, from £4.99 for Standard (10 to 14 working days). Every
            print is made to order by Prodigi, Ancestorii&apos;s print partner; each order is one
            copy, and Premium families get 10% off. More on{' '}
            <Link href="/memory-books" className={site.textLink}>
              Memory Books
            </Link>
            ,{' '}
            <Link href="/canvas-prints" className={site.textLink}>
              canvas prints
            </Link>{' '}
            and{' '}
            <Link href="/acrylic-prints" className={site.textLink}>
              acrylic prints
            </Link>
            .
          </TableNote>
        </ArticleSection>

        {/* Free and Premium */}
        <ArticleSection
          id="plans"
          kicker="Plans"
          dot="var(--c0)"
          title={
            <>
              What do Free and Premium <Accent tone="blue">include?</Accent>
            </>
          }
        >
          <CompareTable
            head={['What you get', 'Free', 'Premium']}
            rows={PLANS}
            highlight={2}
            size="fit"
            labelledBy="plans-title"
          />
          <TableNote>
            If you cancel Premium, nothing is deleted: everything stays viewable, and only new
            uploads above the Free limits stop.{' '}
            <Link href="/pricing" className={site.textLink}>
              See plans and pricing.
            </Link>
          </TableNote>
        </ArticleSection>

        {/* Privacy */}
        <ArticleSection
          id="privacy"
          kicker="Privacy"
          dot="var(--c1)"
          title={
            <>
              How private <Accent tone="pink">is Ancestorii?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              My Family is invite-only. Everyone inside a family space sees everything in it, and
              nobody outside it can, including other Ancestorii users. Private content is never shown
              in search results or recommendations.
            </p>
            <p>
              That rule lives in the database, not just the app. Ancestorii runs on PostgreSQL
              through Supabase, with row-level security switched on for every table. The PostgreSQL
              documentation describes these policies as rules that “restrict, on a per-user basis,
              which rows can be returned by normal queries”, and if a table has no policy, the
              default is that no rows are visible at all. For family content, the policies only
              return rows to members of that family.
            </p>
            <p>
              Photos, videos and voice notes sit in private storage. Supabase&apos;s documentation
              explains that files in a non-public bucket “are not accessible via a public URL”, so
              each one opens through a signed link that expires. The exception is Our Stories: photos
              in a published story are public, because the story is.
            </p>
            <p>
              Ancestorii shows no ads and does not sell, rent or trade personal data. Ancestorii LTD
              is registered with the UK Information Commissioner&apos;s Office as a data controller,
              registration ZC149600.
            </p>
          </Reading>
        </ArticleSection>

        {/* Honest limits */}
        <ArticleSection
          id="limits"
          layout="wide"
          kicker="Limits"
          dot="var(--c2)"
          title={
            <>
              What does Ancestorii <Accent tone="blue">not do?</Accent>
            </>
          }
        >
          <ReasonCards items={LIMITS} />
        </ArticleSection>

        <ArticleSection
          id="questions"
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
              One private library
              <br />
              for your family.
            </>
          }
          lead="Free to start. No credit card. No limit on family members."
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
