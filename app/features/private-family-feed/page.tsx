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
  CaptionedPhoto,
  CheckList,
  FaqBlock,
  QuoteBlock,
  Reading,
} from '@/components/site/seo-articles/ArticleBits';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';

const PATH = '/features/private-family-feed';
const TITLE = 'Private Family Sharing App: The My Family Feed';
const DESCRIPTION =
  'My Family is a private, ad-free feed of family memories with photos, video and voice notes. Only people you invite can see it. Free on iPhone and Android.';
const HEADLINE = 'My Family: a private feed for the people you invite';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    title: `${TITLE} | Ancestorii`,
    description:
      'A private feed of family memories, with photos, video and voice notes, that only the people you invite can see.',
    url: `${SITE_URL}${PATH}`,
    siteName: 'Ancestorii',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'The My Family private feed on Ancestorii' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | Ancestorii`,
    description: 'A private, ad-free feed of family memories that only the people you invite can see.',
    images: ['/og-default.jpg'],
  },
};

const FAQ = [
  {
    q: 'Who can see what I post in My Family?',
    a: 'Only members of your family space. Everyone in the space sees everything in it, and nobody outside it can: not other Ancestorii users, not search engines and not readers of Our Stories.',
  },
  {
    q: 'Can I use the private feed on a computer?',
    a: 'The feed itself is in the free iPhone and Android app. On a computer you can open single memories from notifications and emails, and use the website for albums, timelines, capsules, the Library, upgrades and printed keepsakes.',
  },
  {
    q: 'Is there a limit on how many relatives can join?',
    a: 'No. There is no limit on family members on the Free plan or on Premium, and one Premium plan at £3.99 a month covers everyone in the family space.',
  },
  {
    q: 'What happens when two people remember the same moment differently?',
    a: 'Both versions are kept. A relative chooses “Add your memory of this moment”, writes their side and adds up to 10 photos, and it appears as a tab with their first name beside the original. The memory then shows how many perspectives it holds.',
  },
  {
    q: 'Could anything in My Family end up public?',
    a: 'Only if someone chooses to publish a story on Our Stories, the separate public feed. Nothing moves there on its own, and a published story can be taken down at any time.',
  },
];

// What one memory can hold, shown as a check list.
const MEMORY_PARTS = [
  'A title, and your writing, with bold, italics, underlining and lists',
  'Up to 10 photos, with iPhone HEIC photos converted automatically',
  'One video, up to 5 minutes on the Free plan or 15 minutes on Premium',
  'A voice note, recorded on the spot or uploaded',
];

// The features that feed into the private feed.
const FEEDS_INTO = [
  <>
    <Link href="/features/family-questions" className={site.textLink}>
      Questions
    </Link>
    : send a relative one of 46 ready-made questions from the app. Their answer lands in the feed,
    and you get an email.
  </>,
  <>
    <Link href="/features/voice-notes" className={site.textLink}>
      Voice notes
    </Link>
    : keep a voice on a memory or a reply, and on album photos, timeline moments and capsules.
  </>,
  <>
    <Link href="/features/our-stories" className={site.textLink}>
      Our Stories
    </Link>
    : the separate public feed, for any story you decide to share with everyone.
  </>,
];

// Space above a block that follows long text (the same step the article kit uses after a check list).
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };

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
    publisher: 'Ofcom',
    title: 'From apps to AI search: how the UK goes online in 2025 (Online Nation 2025)',
    href: 'https://www.ofcom.org.uk/media-use-and-attitudes/online-habits/from-apps-to-ai-search-how-the-uk-goes-online-in-2025',
    date: '10 December 2025',
  },
  {
    publisher: 'Apple App Store',
    title: 'Ancestorii, iPhone app listing',
    href: 'https://apps.apple.com/app/id6784750387',
    date: '2026',
  },
  {
    publisher: 'Ancestorii',
    title: 'Privacy Policy',
    href: 'https://www.ancestorii.com/privacy-policy',
    date: '2026',
  },
  {
    publisher: "Information Commissioner's Office",
    title: 'Data protection public register, entry ZC149600 (Ancestorii LTD)',
    href: 'https://ico.org.uk/ESDWebPages/Entry/ZC149600',
    date: '2026',
  },
];

export default function PrivateFamilyFeedPage() {
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
            { name: 'Private family feed', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[
            { href: '/', label: 'Home' },
            { href: '/features', label: 'Features' },
            { label: 'Private family feed' },
          ]}
          size="md"
          title={
            <>
              My Family: a private feed <Accent>for the people you invite.</Accent>
            </>
          }
          intro={[
            "My Family is Ancestorii's private feed, where each post is a memory in your own words with up to 10 photos, a video and a voice note. Only people invited into your family space can see it, and it lives in the free iPhone and Android app.",
            'Relatives can heart a memory, reply in writing or out loud, and add their own version of the same moment. Nothing in it becomes public unless someone in your family chooses to publish it.',
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        {/* The short answer, beside a moment two people remember differently */}
        <ArticleSection
          aside={
            <CaptionedPhoto
              src="/snow.jpg"
              alt="Dante, the founder of Ancestorii, and his little sister in the snow in March 2010"
              label="Dante and his sister · March 2010"
              color="var(--c1)"
              position="27% 50%"
              caption="Ancestorii's founder and his sister. She still says she won the snowball fight, and in My Family both versions can sit side by side."
              priority
            />
          }
        >
          <KeyFacts
            items={[
              <>
                <strong>Each memory</strong> holds a title, your writing, up to 10 photos, one video
                (up to 5&nbsp;minutes on Free, 15 on Premium) and a voice note.
              </>,
              <>
                <strong>The feed lives in the app</strong>, free on iPhone and Android. Single
                memories also open on the website from notifications and emails.
              </>,
              <>
                <strong>Only your family space can see it.</strong> Everyone inside sees everything,
                and only the person who posted something can delete it.
              </>,
              <>
                <strong>Row-level security</strong> is on for every table in Ancestorii&apos;s
                database, and photos and voice notes open through signed links that expire.
              </>,
              <>
                <strong>No ads</strong>, and Ancestorii does not sell, rent or trade personal data.
              </>,
              <>
                <strong>No limit</strong> on how many relatives can join, on Free or Premium.
              </>,
            ]}
          />
        </ArticleSection>

        <ArticleSection
          id="who-can-see"
          kicker="Who sees it"
          dot="var(--c0)"
          title={
            <>
              Who can see <Accent tone="pink">the My Family feed?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Only the people in your family space. When you sign up, Ancestorii creates a family
              space with you as its Owner. After that, the only way in is an invitation, such as the
              family share link or an email invite, and there is no limit on how many relatives you
              can <Link href="/features/invite-family">invite</Link>.
            </p>
            <p>
              Inside the space there are no separate circles. Everyone sees every memory, album and
              timeline, and members can see each other&apos;s name, photo, email address, bio, role
              and how much they have added. If there is someone you would not share all of that
              with, do not invite them yet.
            </p>
            <p>
              Outside the space, nobody sees anything: not other Ancestorii families, not search
              engines, not readers of the public Our Stories feed. Ancestorii itself does not
              monitor, review or moderate private family content unless a member of that family
              reports a breach of its Terms.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="what-goes-in"
          kicker="A memory"
          dot="var(--c1)"
          title={
            <>
              What can you put <Accent tone="blue">in a memory?</Accent>
            </>
          }
        >
          <Reading>
            <p>A memory is one moment, told properly. Each one can hold:</p>
          </Reading>
          <div style={STACK_GAP}>
            <CheckList items={MEMORY_PARTS} />
            <Reading>
              <p>
                When a relative answers one of your questions in the app, the answer arrives as a
                memory too, marked with the question it responds to. Every memory shows who wrote it
                and when, alongside its photos, video and voice notes.
              </p>
            </Reading>
          </div>
        </ArticleSection>

        <ArticleSection
          id="together"
          kicker="Together"
          dot="var(--c2)"
          title={
            <>
              How do relatives reply <Accent tone="pink">and add their version?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Each relative can give a memory one heart, and the person who posted it is notified.
              Replies are threaded, and each one can be typed or recorded as a voice note, which suits
              relatives who would rather talk than type. Anyone in the family can also add their own
              voice notes to a memory.
            </p>
            <p>
              Families rarely remember a moment the same way. Anyone who did not write the original
              can choose “Add your memory of this moment” and add their own words and up to 10
              photos. Each version becomes a tab labelled with that person&apos;s first name, the
              memory shows how many perspectives it holds, and the original author gets a
              notification.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="app-or-website"
          kicker="App and website"
          dot="var(--c3)"
          title={
            <>
              Is the feed in the app <Accent tone="blue">or on the website?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              The feed lives in the Ancestorii app, which is free on iPhone and Android. You write,
              read and reply there. The iPhone app needs iOS&nbsp;15.1 or&nbsp;later.
            </p>
            <p>
              On the website you can open any single memory from a notification or an email, such as
              the one telling you a relative has answered your question, and if you sign up on the
              website, you write your first memory there as part of getting started. The same email
              and password work in both places, and upgrading to Premium or ordering prints happens on
              the website.
            </p>
          </Reading>
        </ArticleSection>

        <QuoteBlock>
          One moment, many memories. <Accent tone="blue">All of them on the same page.</Accent>
        </QuoteBlock>

        <ArticleSection
          id="privacy"
          kicker="Privacy"
          dot="var(--c0)"
          title={
            <>
              How is My Family <Accent tone="pink">kept private?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              The rule that only your family sees your memories is enforced by the database, not just
              hidden in the app. Ancestorii runs on PostgreSQL through Supabase, with row-level
              security switched on for every table. PostgreSQL&apos;s documentation describes row
              security policies as rules that “restrict, on a per-user basis, which rows can be
              returned by normal queries”. On Ancestorii, the policies on family memories, albums,
              timelines and the Library only return rows to members of that family.
            </p>
            <p>
              Photos, videos and voice notes are kept in private storage. Supabase&apos;s
              documentation explains that files in a non-public bucket “are not accessible via a
              public URL”, so each one opens through a signed link that expires.
            </p>
            <p>
              Only the person who posted something can delete it. There are no ads, Ancestorii does
              not sell, rent or trade personal data, and Ancestorii LTD is registered with the UK
              Information Commissioner&apos;s Office (registration ZC149600).
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="group-chats"
          kicker="Group chats"
          dot="var(--c1)"
          title={
            <>
              How is it different <Accent tone="blue">from a WhatsApp group?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Most families already have a group chat. Ofcom&apos;s Online Nation 2025 report found
              that WhatsApp is used by 90% of adults in the UK, and it is brilliant for the everyday
              back-and-forth. My Family is not trying to replace it.
            </p>
            <p>
              The difference is what happens to a moment afterwards. In a chat, a birthday photo sits
              under every message sent since. In My Family it stays a page of its own, with the
              story, the voice notes, the replies and every relative&apos;s version kept together.
              You can use both: the chat for today, Ancestorii for what you want to keep.
            </p>
            <p>
              For a closer look, see{' '}
              <Link href="/compare/ancestorii-vs-whatsapp">Ancestorii vs a WhatsApp group</Link>.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="around-the-feed"
          kicker="Around the feed"
          dot="var(--c2)"
          title={
            <>
              Where does the feed <Accent tone="pink">fit in Ancestorii?</Accent>
            </>
          }
        >
          <Reading>
            <p>The feed is the everyday part of a bigger family library. A few features feed into it:</p>
          </Reading>
          <div style={STACK_GAP}>
            <CheckList items={FEEDS_INTO} />
            <Reading>
              <p>
                The feed is free to start. Premium, at £3.99 a month for the whole family, raises
                shared storage from 1&nbsp;GB to 100&nbsp;GB and the video limit from 5 to
                15&nbsp;minutes. See <Link href="/pricing">plans and pricing</Link>.
              </p>
            </Reading>
          </div>
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
              A feed only
              <br />
              your family sees.
            </>
          }
          lead="Free on iPhone and Android. No ads. No limit on family members."
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
