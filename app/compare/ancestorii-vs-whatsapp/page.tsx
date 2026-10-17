import Link from 'next/link';
import type { Metadata } from 'next';
import { Download, ImagePlus, Mic, Share2 } from 'lucide-react';
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
  NumberedPanels,
  QuoteBlock,
  Reading,
  TableNote,
} from '@/components/site/seo-articles/ArticleBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';

const PATH = '/compare/ancestorii-vs-whatsapp';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'WhatsApp Family Group Alternative for Memories';
const HEADLINE = 'Keep the family WhatsApp group. Give the memories their own home.';
const DESCRIPTION =
  'WhatsApp is where families chat, but photos get buried and Android backups can be deleted. Where to keep family memories alongside it, as of October 2026.';
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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Ancestorii alongside a family WhatsApp group' }],
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
    q: 'How do I save photos from a family WhatsApp group?',
    a: 'Save the ones you want to keep from the chat to your phone, then upload them to an album in Ancestorii, where each photo can have a date, the story and voice notes. Keep the originals in your phone’s backup as well, so there are at least two copies.',
  },
  {
    q: 'Do WhatsApp backups use my Google storage?',
    a: 'On Android, yes. Google says WhatsApp backups count towards your Google Account storage limit, and every Google Account includes up to 15\u00a0GB, shared across Gmail, Google Drive and Google Photos.',
  },
  {
    q: 'Can WhatsApp backups be deleted automatically?',
    a: 'Yes. Google says WhatsApp backups that haven’t been updated in five months may be deleted automatically, and that deleting a WhatsApp backup is permanent. A phone that hasn’t backed up for months may have no backup left to restore.',
  },
  {
    q: 'How many people can be in a WhatsApp group?',
    a: 'Up to 1,024, the limit WhatsApp announced in November\u00a02022. Ancestorii has no limit on family members on any plan, so everyone in the group can join your family space.',
  },
  {
    q: 'Should we stop using our family WhatsApp group?',
    a: 'No. Keep it for everyday chat, where it works well. Post your Ancestorii share link in the group and move the photos and stories worth keeping into a private family space, organised in albums, timelines and profiles instead of one long chat.',
  },
];

const KEY_FACTS = [
  <>
    Ofcom’s Online Nation 2025 report names WhatsApp, Facebook and Google Maps as the three most commonly
    used apps among adults, with <strong>WhatsApp at 90% of adults</strong>.
  </>,
  <>
    WhatsApp backups on Android <strong>count towards your Google Account storage</strong>, and every
    Google Account includes up to 15&nbsp;GB, shared with Gmail, Drive and Photos.
  </>,
  <>
    Google says WhatsApp backups that haven’t been updated in{' '}
    <strong>five months may be deleted automatically</strong>, and deleting a backup is permanent.
  </>,
  <>
    Ancestorii’s family share link can be sent through your phone’s share sheet,{' '}
    <strong>straight into the WhatsApp group</strong>, and no plan limits how many family members join.
  </>,
  <>
    In Ancestorii a memory holds <strong>up to 10 photos, a video and a voice note</strong>, and each album
    photo can carry a date, a story thread and voice notes, with unlimited albums on every plan.
  </>,
];

const MOVE_STEPS = [
  {
    number: '01',
    title: 'Save the keepers.',
    body: 'Don’t try to move everything. Pick one occasion, a birthday, a holiday or a new baby, and save the best photos from the chat to your phone.',
    Icon: Download,
  },
  {
    number: '02',
    title: 'Share the invite link.',
    body: 'Whoever set up your family space, or an admin, sends the Ancestorii share link into the WhatsApp group. The same link works for everyone.',
    Icon: Share2,
  },
  {
    number: '03',
    title: 'Add them to an album.',
    body: 'Upload the photos to an album or the family Library. iPhone HEIC photos are converted to JPEG automatically.',
    Icon: ImagePlus,
  },
  {
    number: '04',
    title: 'Add the story.',
    body: 'Give each photo a date and the story behind it, and ask whoever took it to record a voice note.',
    Icon: Mic,
  },
];

const SIDE_BY_SIDE = [
  ['Best at', 'Keeping memories, private and in order', 'Day-to-day chat, calls and plans'],
  ['Cost', 'Free plan, or Premium at £3.99 a month per family', 'Free, though data charges may apply'],
  ['Who can join', 'Everyone you invite, with no member limit', 'Up to 1,024 people per group'],
  ['Where photos live', 'In albums, timelines and Loved Ones profiles', 'In the chat, in the order they were sent'],
  ['The story behind a photo', 'A date, a story thread and voice notes on each photo', 'Replies in the chat, among everything else'],
  ['Storage', '1\u00a0GB free per family, 100\u00a0GB on Premium', 'Android backups use your Google storage and may be deleted after five months without an update'],
  ['Privacy', 'A private family space, no ads, data not sold', 'End-to-end encrypted by default, group chats included'],
];

const SOURCES: Source[] = [
  {
    publisher: 'Ofcom',
    title: 'From apps to AI search: how the UK goes online in 2025 (Online Nation 2025)',
    href: 'https://www.ofcom.org.uk/media-use-and-attitudes/online-habits/from-apps-to-ai-search-how-the-uk-goes-online-in-2025',
    date: 'published 10 December 2025',
  },
  {
    publisher: 'WhatsApp',
    title: 'Communities Now Available!',
    href: 'https://blog.whatsapp.com/communities-now-available',
    date: '3 November 2022',
  },
  {
    publisher: 'WhatsApp',
    title: 'End-to-end encryption',
    href: 'https://blog.whatsapp.com/end-to-end-encryption',
    date: '5 April 2016',
  },
  {
    publisher: 'WhatsApp',
    title: 'More Control and Privacy with Default Disappearing Messages and Multiple Durations',
    href: 'https://blog.whatsapp.com/more-control-and-privacy-with-default-disappearing-messages-and-multiple-durations',
    date: '6 December 2021',
  },
  {
    publisher: 'WhatsApp',
    title: 'WhatsApp home page',
    href: 'https://www.whatsapp.com/',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Google',
    title: 'Google One Help: Manage your storage in Drive, Gmail and Photos',
    href: 'https://support.google.com/googleone/answer/6374270?hl=en-GB',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Google',
    title: 'Google One Help: How your Google storage works',
    href: 'https://support.google.com/googleone/answer/9312312?hl=en-GB',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Personal Archiving: Digital Photos',
    href: 'https://digitalpreservation.gov/personalarchiving/photos.html',
    date: 'accessed October 2026',
  },
];

export default function AncestoriiVsWhatsappPage() {
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
            { name: 'Ancestorii vs WhatsApp', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[
            { href: '/', label: 'Home' },
            { href: '/compare', label: 'Compare' },
            { label: 'Ancestorii vs WhatsApp' },
          ]}
          size="md"
          title={
            <>
              Keep the family WhatsApp group. <Accent>Give the memories their own home.</Accent>
            </>
          }
          intro={[
            'WhatsApp is the right place for a family’s day-to-day chat, and Ofcom’s Online Nation 2025 report found 90% of adults use it. It is a poor archive, though, because photos sink in the scroll and Android backups count against your Google storage and may be deleted after five months without an update, so Ancestorii works best alongside it as the place family memories are kept.',
            'You don’t need to talk anyone into leaving the group. Keep chatting where everyone already is, and move the photos and stories worth keeping into a private family space, with dates, names and voices attached.',
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        {/* Key facts beside one of the founder's own captioned family photos */}
        <ArticleSection
          aside={
            <CaptionedPhoto
              src="/sister.jpg"
              alt="A toddler in a red top eating from a mug with a spoon"
              label="A childhood memory"
              color="var(--c0)"
              caption="“The kind of moment that disappears if nobody writes it down.” From the founder’s own family photos."
              position="45% 50%"
              priority
            />
          }
        >
          <KeyFacts items={KEY_FACTS} />
        </ArticleSection>

        <ArticleSection
          id="poor-archive"
          kicker="The problem"
          dot="var(--c1)"
          title={
            <>
              Why is WhatsApp <Accent tone="blue">a poor family&nbsp;archive?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Because it was built for conversation, and it is very good at that. WhatsApp is free, nearly
              everyone already has it, and WhatsApp says every message, photo, video and voice message is
              end-to-end encrypted by default, group chats included. Privacy isn’t the problem. Keeping
              things, and finding them again, is.
            </p>
            <p>
              A family group moves fast. The photo from Grandad’s 80th arrives between “who’s bringing
              pudding?” and a thumbs-up, and a week later it is hundreds of messages back. The names, dates
              and stories people add afterwards are just more messages, scrolling away with everything else.
            </p>
            <p>
              Chats don’t always stay, either. WhatsApp offers disappearing messages at 24&nbsp;hours, 7&nbsp;days or
              90&nbsp;days, and since December&nbsp;2021 you can make them the default for new one-to-one chats, or
              turn them on for groups you create.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="backups"
          kicker="Backups"
          dot="var(--c2)"
          title={
            <>
              What happens to <Accent tone="pink">WhatsApp&nbsp;backups?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              On Android, Google’s own help page is clear about three things. WhatsApp backups count
              towards your Google Account storage limit. Backups that haven’t been updated in five months
              may be deleted automatically. And when you delete a WhatsApp backup, it is permanent.
            </p>
            <p>
              That storage is shared. Every Google Account includes up to 15&nbsp;GB, split across Gmail, Google
              Drive and Google Photos, so a busy family group’s photos and videos compete with your email
              for space. And a phone left in a drawer for half a year may no longer have a backup to
              restore.
            </p>
            <p>
              None of this makes WhatsApp unsafe. It means a chat backup is there to restore your chats, not
              to keep a family’s history. The Library of Congress recommends keeping at least two copies of
              important photos, stored as far apart as practical, and checking them at least once a year.
            </p>
          </Reading>
        </ArticleSection>

        <QuoteBlock>
          The group chat is for today.{' '}
          <Accent tone="blue">The family archive is for twenty years from now.</Accent>
        </QuoteBlock>

        <ArticleSection
          id="group-size"
          kicker="Group size"
          dot="var(--c3)"
          title={
            <>
              How big can <Accent tone="blue">a WhatsApp group be?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Big enough for any family. WhatsApp groups can hold up to 1,024 people, a limit WhatsApp
              announced in November&nbsp;2022 alongside Communities, in-chat polls and video calls for up to 32
              people. The trouble is rarely size: the bigger and busier the group, the faster a good photo
              disappears up the screen.
            </p>
            <p>
              Ancestorii has no limit on family members on any plan, so everyone in the group can join the
              same private space.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="what-ancestorii-adds"
          kicker="What it adds"
          title={
            <>
              What does <Accent tone="pink">Ancestorii add?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              A place built for keeping rather than chatting. In the free iPhone and Android app, your
              family shares memories in a private feed that only invited members can see. A memory can have
              a title, your own words, up to 10 photos, a video and a voice note. Relatives can react,
              comment in writing or out loud, and add their own version of the same moment, which sits
              beside yours as a tab.
            </p>
            <p>
              Photos worth keeping go into albums, where each one can carry a date, a story thread and voice
              notes. Loved Ones profiles and timelines put everything in order around the people in it. Read
              more about the <Link href="/features/private-family-feed">private My Family feed</Link> and{' '}
              <Link href="/features/family-photo-albums">albums with stories and voices</Link>.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="side-by-side"
          layout="wide"
          kicker="Side by side"
          dot="var(--c1)"
          title={
            <>
              Ancestorii vs a WhatsApp family group, <Accent tone="pink">side by side.</Accent>
            </>
          }
        >
          <CompareTable
            head={['Feature', 'Ancestorii', 'WhatsApp family group']}
            rows={SIDE_BY_SIDE}
            highlight={1}
            size="mid"
            labelledBy="side-by-side-title"
          />
          <TableNote>
            WhatsApp and Google details are from their own pages, as of October&nbsp;2026. Family on Facebook
            instead? See{' '}
            <Link href="/compare/ancestorii-vs-facebook-groups" className={site.textLink}>
              Ancestorii vs Facebook groups
            </Link>
            .
          </TableNote>
        </ArticleSection>

        <ArticleSection
          id="move-photos"
          layout="wide"
          kicker="Step by step"
          dot="var(--c2)"
          title={
            <>
              How do you move <Accent tone="blue">the best photos across?</Accent>
            </>
          }
        >
          <NumberedPanels items={MOVE_STEPS} />
          <TableNote>
            On the Free plan, files can be up to 20&nbsp;MB and videos up to 5&nbsp;minutes, within 1&nbsp;GB for the
            whole family. Invites can also go by email or with a family join code; see{' '}
            <Link href="/features/invite-family" className={site.textLink}>
              inviting your family
            </Link>
            . Keep the originals in your phone’s backup too, and our guide to{' '}
            <Link href="/guides/how-to-back-up-family-photos" className={site.textLink}>
              backing up family photos
            </Link>{' '}
            covers the rest.
          </TableNote>
        </ArticleSection>

        <ArticleSection
          id="leave-the-group"
          kicker="The group"
          dot="var(--c3)"
          title={
            <>
              Should you leave <Accent tone="pink">the family WhatsApp group?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              No. The group is where your family already talks, and that is worth a lot. Asking everyone to
              move their chat to a new app is a big ask, and it isn’t necessary.
            </p>
            <p>
              Treat the two as different rooms. The group is for plans, news and jokes. Ancestorii is where
              the photos and stories you will want in twenty years are kept. Post the share link in the
              group once, and when a good photo lands in the chat, whoever sees it first adds it to the
              family album with a line about what was happening.
            </p>
            <p>
              It helps the relatives who rarely post, too. A grandparent who scrolls past most messages can
              open one album and find each photo with its story beside it.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="how-ancestorii-helps"
          kicker="Where we fit"
          title={
            <>
              How we <Accent tone="blue">help.</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Ancestorii isn’t a chat app, and it won’t replace your family group. It is a private archive,
              My Family, that only the people you invite can see, with free apps for iPhone and Android and
              the same login on the website.
            </p>
            <p>
              The Free plan needs no card and gives the family 1&nbsp;GB of shared storage with unlimited albums,
              timelines and capsules. That suits a chosen set of photos rather than every message ever sent,
              and it shouldn’t be your only copy of anything. Premium is £3.99 a month for the whole family
              and raises the shared storage to 100&nbsp;GB. Ancestorii shows no ads and doesn’t sell your data,
              and nothing becomes public unless someone chooses to publish it on Our Stories, the separate
              public feed.
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
              Chat in the group.
              <br />
              Save the keepers.
            </>
          }
          lead="Free to start, with no card. Send one link to the family group and start an album together."
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
