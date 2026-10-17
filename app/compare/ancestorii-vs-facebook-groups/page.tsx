import Link from 'next/link';
import type { Metadata } from 'next';
import { CalendarDays, Lock, Mic, ShieldCheck } from 'lucide-react';
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
  ReasonCards,
  TableNote,
} from '@/components/site/seo-articles/ArticleBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';

const PATH = '/compare/ancestorii-vs-facebook-groups';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Private Facebook Group Alternative for Families';
const HEADLINE = 'Ancestorii vs a private Facebook family group';
const DESCRIPTION =
  'A private Facebook group is free but funded by ads. Ancestorii is an ad-free private family library. Privacy, ads and memorial options as of October 2026.';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Ancestorii vs a private Facebook family group' }],
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

// Facebook details checked on Meta's newsroom and terms on 17 October 2026.
const ROWS = [
  ['Cost', 'Free plan; Premium £3.99 a month per family', 'Free with ads; UK no-ads subscription announced at £2.99 a month'],
  ['Ads', 'None on either plan', 'Ads pay for the free service'],
  ['Sells personal data', 'No: does not sell, rent or trade it', 'No: Meta says it does not sell it'],
  ['Who can see posts', 'Only people invited into your family space', 'Private group: only members'],
  ['Can it become public?', 'No. A member can choose to publish a story on Our Stories', 'Yes. Since November\u00a02025, admins can switch it to public'],
  ['Account needed', 'An Ancestorii account, 16 or over', 'A Facebook account, 13 or over'],
  ['How memories are organised', 'By person, album, timeline and capsule', 'One feed, with topics and search'],
  ['Talking and planning', 'Comments, hearts and voice replies; no chat or events', 'Comments, chats and events'],
  ['When someone dies', 'What they added stays with the family', 'Memorialised profile, legacy contact or deletion'],
];

const HELPS = [
  {
    title: 'No ads on any plan.',
    text: 'No ads, and no selling, renting or trading of personal data. Premium is £3.99 a month for the whole family.',
    Icon: ShieldCheck,
  },
  {
    title: 'Private to the people you invite.',
    text: 'Relatives join by email invitation, share link or family join code, with no limit on how many can join.',
    Icon: Lock,
  },
  {
    title: 'Organised by person and date.',
    text: 'Loved Ones pages, albums with memory dates and timelines keep memories with their people and years.',
    Icon: CalendarDays,
  },
  {
    title: 'Voices kept with the photos.',
    text: 'Voice notes on memories, album photos, timeline moments and capsules, converted to play on any phone.',
    Icon: Mic,
  },
];

// How Ancestorii sorts memories, shown as a check list in the "Organising" section.
const ORGANISED_BY = [
  <>
    <strong>By person.</strong> A Loved Ones page holds someone&apos;s photo, dates and life story,
    plus every album, timeline and capsule they are tagged in. The Free plan includes 1 Loved Ones
    page; Premium includes as many as you like.
  </>,
  <>
    <strong>By album.</strong> Each photo or video can carry a name, a memory date such as
    “Summer&nbsp;1994”, a thread where relatives add the story, and voice notes.
  </>,
  <>
    <strong>By date.</strong> A timeline lays out dated moments, each with photos, video, comments and
    voice notes.
  </>,
  <>
    <strong>By who remembers it.</strong> When two relatives remember the same moment differently, both
    versions sit on one memory, as tabs.
  </>,
];

// Shown on the page and written into the FAQPage structured data, word for word.
const FAQ_PLAIN = [
  {
    q: 'Are private Facebook groups really private?',
    a: 'Only members can see who is in a private Facebook group and what they have posted, according to Meta. Every member needs a Facebook account, though, and since November\u00a02025 admins can switch a private group to public.',
  },
  {
    q: 'How does Facebook pay for free groups?',
    a: "Through advertising. Meta's terms say businesses, organisations and other persons pay Meta to show you ads, and that Meta does not sell your personal data. In September\u00a02025 Meta announced a UK subscription for no ads, at £2.99 a month on the web or £3.99 on iOS and Android.",
  },
  {
    q: 'Can a private Facebook group be made public later?',
    a: 'Yes, since November\u00a02025. Any admin can cancel the switch within three days, every member is told when it happens, and posts from before the switch stay visible only to admins, moderators and people who were already members.',
  },
  {
    q: 'What happens to family photos on Facebook when someone dies?',
    a: 'Facebook can memorialise the account, keeping the profile with “Remembering” above the name. A legacy contact can pin a post, update the profile picture and cover photo and, if allowed, download an archive of photos and posts, but cannot log in or read private messages. People can instead ask for their account to be permanently deleted after death.',
  },
  {
    q: 'Is there an ad-free alternative to a Facebook family group?',
    a: 'Yes. Ancestorii is a private family library with no ads on either plan, and it does not sell, rent or trade personal data. It is free to start, and Premium is £3.99 a month for the whole family. It has no group chat or events, so many families keep both.',
  },
];

const SOURCES: Source[] = [
  {
    publisher: 'Meta',
    title: 'Making Groups Privacy Settings Easier to Understand',
    href: 'https://about.fb.com/news/2019/08/groups-privacy-settings/',
    date: '14 August 2019',
  },
  {
    publisher: 'Meta',
    title: 'New Facebook Update Gives Group Admins More Flexibility While Protecting Member Privacy',
    href: 'https://about.fb.com/news/2025/11/facebook-update-group-admins-flexibility-protecting-member-privacy/',
    date: '3 November 2025',
  },
  {
    publisher: 'Meta',
    title: 'Terms of Service',
    href: 'https://www.facebook.com/terms',
    date: 'effective 4 March 2026',
  },
  {
    publisher: 'Meta',
    title: 'Facebook and Instagram to Offer Subscription for No Ads in the UK',
    href: 'https://about.fb.com/news/2025/09/facebook-and-instagram-to-offer-subscription-for-no-ads-in-the-uk/',
    date: '26 September 2025',
  },
  {
    publisher: 'Meta',
    title: 'Adding a Legacy Contact',
    href: 'https://about.fb.com/news/2015/02/adding-a-legacy-contact/',
    date: '12 February 2015',
  },
  {
    publisher: 'Meta',
    title: 'Making It Easier to Honor a Loved One on Facebook After They Pass Away',
    href: 'https://about.fb.com/news/2019/04/updates-to-memorialization/',
    date: '9 April 2019',
  },
  {
    publisher: 'Meta',
    title: 'Supporting Online Communities When They’re Needed Most',
    href: 'https://about.fb.com/news/2020/10/supporting-online-communities/',
    date: '1 October 2020',
  },
  {
    publisher: 'Meta',
    title: 'Introducing Features to Quickly Find and Connect with Facebook Groups',
    href: 'https://about.fb.com/news/2022/06/features-to-find-and-connect-with-facebook-groups',
    date: '28 June 2022',
  },
  {
    publisher: 'Facebook Help Centre',
    title: 'Search for a post in a Facebook group',
    href: 'https://www.facebook.com/help/124679047612553',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Ofcom',
    title: 'From apps to AI search: how the UK goes online in 2025 (Online Nation 2025)',
    href: 'https://www.ofcom.org.uk/media-use-and-attitudes/online-habits/from-apps-to-ai-search-how-the-uk-goes-online-in-2025',
    date: '10 December 2025',
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

export default function AncestoriiVsFacebookGroupsPage() {
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
            { name: 'Ancestorii vs Facebook groups', path: PATH },
          ]),
          faqSchema(FAQ_PLAIN),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[
            { href: '/', label: 'Home' },
            { href: '/compare', label: 'Compare' },
            { label: 'Ancestorii vs Facebook groups' },
          ]}
          size="md"
          title={
            <>
              Ancestorii vs a private <Accent>Facebook family group.</Accent>
            </>
          }
          intro={[
            'A private Facebook group is free, familiar and good for quick family updates, but Facebook is paid for by advertising and a group is built around one feed of posts. Ancestorii is an ad-free private family library, organised by person, album and timeline, so it suits keeping memories rather than chatting.',
            "The Facebook details on this page come from Meta's own newsroom, help centre and terms, checked in October\u00a02026.",
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        {/* The short answer, beside a photo that deserves more than a place in a feed */}
        <ArticleSection
          aside={
            <CaptionedPhoto
              src="/garden.jpg"
              alt="Dante, the founder of Ancestorii, and his little sister in the garden in May 2013"
              label="Dante and his sister · May 2013"
              color="var(--c3)"
              position="50% 40%"
              caption="Mum's favourite photo of Ancestorii's founder and his sister: the kind of picture that deserves its date and its story."
              priority
            />
          }
        >
          <KeyFacts
            items={[
              <>
                <strong>In a private Facebook group</strong>, only members can see who else is in it and
                what they have posted.
              </>,
              <>
                <strong>Since November&nbsp;2025</strong>, admins can switch a private group to public.
                Earlier posts stay visible only to admins, moderators and existing members.
              </>,
              <>
                <strong>Facebook is funded by ads.</strong> Meta&apos;s terms say businesses pay it to
                show you ads, and that it does not sell your personal data.
              </>,
              <>
                <strong>A legacy contact</strong> can look after a memorialised Facebook profile, but
                cannot log in or read private messages.
              </>,
              <>
                <strong>Ancestorii has no ads</strong> and does not sell, rent or trade personal data.
                Only people invited into your family space can see My Family.
              </>,
              <>
                <strong>Ancestorii is free to start.</strong> Premium is £3.99 a month for the whole
                family, not per person.
              </>,
            ]}
          />
        </ArticleSection>

        <ArticleSection
          id="good-at"
          kicker="Fair to Facebook"
          dot="var(--c1)"
          title={
            <>
              What is a private Facebook group <Accent tone="blue">good at?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Reach, mostly. Ofcom&apos;s Online Nation 2025 report found that Facebook is one of the
              three most commonly used apps among UK adults, along with WhatsApp and Google Maps. In
              2020, Meta said more than 1.8 billion people used Groups every month. If your parents,
              aunts and cousins are already on Facebook, a group asks nobody to download anything new.
            </p>
            <p>
              Meta has also given groups chats for real-time conversation, events, and topics that sort
              posts by hashtag. For working out who is bringing what on Sunday, or sharing party photos
              the same evening, a group works well, and it is free to use.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="who-can-see"
          kicker="Privacy"
          dot="var(--c0)"
          title={
            <>
              Who can see posts in a <Accent tone="pink">private Facebook group?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Only members. Since Meta simplified its group settings in 2019, a private group is one
              where only members can see who else is in it and what they have posted. It can be
              visible, so people can find it in search, or hidden. Former “secret” groups became private
              and hidden, and “closed” groups became private and visible.
            </p>
            <p>
              Private is not permanent, though. Since November&nbsp;2025, admins can switch a private group
              to public. Meta says everything posted before the switch stays visible only to admins,
              moderators and people who were already members, and the member list is limited to
              admins and moderators. Any admin can cancel within three days, and every member is told
              when the change happens.
            </p>
            <p>
              Every member also needs a Facebook account, and Meta&apos;s terms say you cannot use
              Facebook under 13.
            </p>
            <p>
              On Ancestorii, My Family has no public setting. Only people invited into your family
              space can see it, through an email invitation, a share link or a family join code.
              Everyone inside sees everything, and only the person who added something can delete it.
              A story becomes public only if a member publishes it on Our Stories, the separate public
              feed.
            </p>
          </Reading>
        </ArticleSection>

        <QuoteBlock>
          A group is where the family talks.{' '}
          <Accent tone="blue">A family library is where it keeps things.</Accent>
        </QuoteBlock>

        <ArticleSection
          id="ads-and-data"
          kicker="Ads and data"
          dot="var(--c2)"
          title={
            <>
              How do ads and personal data <Accent tone="blue">work on each?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Facebook is free because of advertising. Meta&apos;s terms, effective from 4&nbsp;March&nbsp;2026,
              say businesses, organisations and other persons pay Meta to show you ads, and that Meta
              does not sell your personal data.
            </p>
            <p>
              In September&nbsp;2025 Meta announced a second option for people in the UK: a subscription
              for no ads at £2.99 a month on the web or £3.99 a month on iOS and Android. Meta says
              subscribers&apos; personal data will not be used to show them ads, and people on the free
              version keep seeing ads.
            </p>
            <p>
              Ancestorii has no ads on either plan, and it does not sell, rent or trade personal data.
              It is paid for by Premium, at £3.99, €4.99 or $5.99 a month for a whole family, and by
              the printed keepsakes families order. Both companies say you keep ownership of what you
              post.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="after-a-death"
          kicker="After a death"
          dot="var(--c3)"
          title={
            <>
              What happens to a Facebook account <Accent tone="pink">when someone dies?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Facebook can memorialise the account, adding “Remembering” above the person&apos;s name.
              When Meta introduced legacy contacts in 2015, it said the person you choose can write a
              post pinned to the top of your profile, update the profile picture and cover photo
              and, if you allowed it, download an archive of your
              photos, posts and profile information. They cannot log in as you or see your private
              messages. You can instead ask for your account to be permanently deleted after death.
            </p>
            <p>
              In 2019 Meta added a separate Tributes tab where friends and family can post, which the
              legacy contact can moderate, and let parents who lost a child under 18 ask to become
              their legacy contact. It is worth choosing a legacy contact now. Our guide to{' '}
              <Link href="/guides/what-happens-to-your-photos-when-you-die">
                what happens to your photos when you die
              </Link>{' '}
              covers other services too.
            </p>
            <p>
              On Ancestorii, what a relative added stays in the family space for everyone in it, and
              other members cannot delete it, because only the person who created something can. A{' '}
              <Link href="/features/loved-ones">Loved Ones page</Link> can hold someone&apos;s dates,
              including the date they died, and their life story in four chapters. If a family stops
              paying for Premium, it returns to the Free plan and nothing is deleted.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="organising"
          kicker="Organising"
          dot="var(--c1)"
          title={
            <>
              Can you organise memories <Accent tone="blue">by person and date?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              In a group, a memory is a post. Posts can be sorted by topic with hashtags and searched,
              but a photo from 1994 shared today sits among today&apos;s posts. Ancestorii sorts
              memories the way families remember them:
            </p>
          </Reading>
          <div className={site.sectionBody}>
            <CheckList items={ORGANISED_BY} />
          </div>
        </ArticleSection>

        <ArticleSection
          id="side-by-side"
          layout="wide"
          kicker="Side by side"
          title={
            <>
              Ancestorii vs Facebook groups: <Accent tone="pink">side by side.</Accent>
            </>
          }
        >
          <CompareTable
            head={['Feature', 'Ancestorii', 'Private Facebook group']}
            rows={ROWS}
            highlight={1}
            size="mid"
            labelledBy="side-by-side-title"
          />
          <TableNote>
            Facebook details as of October&nbsp;2026. Comparing a family chat instead? See{' '}
            <Link href="/compare/ancestorii-vs-whatsapp" className={site.textLink}>
              Ancestorii vs a WhatsApp group
            </Link>
            .
          </TableNote>
        </ArticleSection>

        <ArticleSection
          id="which-to-use"
          kicker="Choosing"
          dot="var(--c2)"
          title={
            <>
              Which should <Accent tone="pink">your family use?</Accent>
            </>
          }
        >
          <Reading>
            <p>Many families will use both, for different jobs.</p>
            <ul>
              <li>
                <strong>Keep the group</strong> if everyone is on Facebook and you mostly share news,
                plan get-togethers and post photos on the day.
              </li>
              <li>
                <strong>Add Ancestorii</strong> if some relatives are not on Facebook, if you would
                rather keep family memories away from an ad-funded platform, or if you want them
                findable by person and date years from now.
              </li>
            </ul>
            <p>
              A simple routine works: let the group carry the news, and when a photo or story is worth
              keeping, add it to Ancestorii with its date, the people in it and the story behind it. To
              fill the gaps, send a relative one of Ancestorii&apos;s 46 ready-made questions from the
              app. They answer in the app, and you get an email when they do.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="how-ancestorii-helps"
          layout="wide"
          kicker="Where Ancestorii fits"
          dot="var(--c0)"
          title={
            <>
              How it <Accent tone="blue">helps.</Accent>
            </>
          }
        >
          <ReasonCards items={HELPS} />
          <TableNote>
            What it does not do: there is no group chat or events, each account belongs to one family
            space, the private feed and questions live in the free iPhone and Android app, and the Free
            plan includes 1 Loved Ones page. See{' '}
            <Link href="/features/private-family-feed" className={site.textLink}>
              the private My Family feed
            </Link>{' '}
            and{' '}
            <Link href="/features/invite-family" className={site.textLink}>
              how to invite your family
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
              Keep the group.
              <br />
              Add the stories.
            </>
          }
          lead="Free to start. No ads. Only the people you invite can see it."
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
