import Link from 'next/link';
import type { Metadata } from 'next';
import { Link2, Mail, MessageCircleQuestionMark, UserPlus } from 'lucide-react';
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
} from '@/components/site/seo-articles/ArticleBits';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';

const PATH = '/features/invite-family';
const TITLE = 'Invite Family: Share Links, Email Invites, Roles';
const DESCRIPTION =
  'Invite family to your private Ancestorii space with a reusable share link or an email invite. No limit on members, and one Premium plan covers everyone.';
const HEADLINE = 'Bring the whole family in, privately';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    title: `${TITLE} | Ancestorii`,
    description:
      'Bring relatives into your private family space with one reusable link or an email invite. No limit on members.',
    url: `${SITE_URL}${PATH}`,
    siteName: 'Ancestorii',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Inviting family to Ancestorii' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | Ancestorii`,
    description: 'One reusable link or an email invite, no member limit, and one plan for the whole family.',
    images: ['/og-default.jpg'],
  },
};

const FAQ = [
  {
    q: 'Is there a limit on how many family members can join?',
    a: 'No. There is no limit on family members on the Free plan or on Premium. Storage is shared by the whole family: 1 GB on Free and 100 GB on Premium.',
  },
  {
    q: 'Do invited relatives have to pay?',
    a: 'No. Joining is free. If your family upgrades, one Premium plan at £3.99 a month covers everyone in the family space, so nobody pays separately.',
  },
  {
    q: 'Can I cancel an invite I have sent?',
    a: 'Yes. Owners and Admins can see pending email invites on the My Family page and cancel any that have not been accepted. To stop the share link working, make a new link, and the old one switches off straight away.',
  },
  {
    q: 'Can I choose what each person sees?',
    a: "No. Everyone in a family space sees everything in it, and members can see each other's name, email address and role. There are no per-item sharing settings, so only invite people you are happy to share the whole library with.",
  },
  {
    q: 'Can I belong to two family spaces at once?',
    a: 'No. Each account belongs to one family space. An invite or share link will not add someone who already belongs to another family space with other members in it.',
  },
];

const WAYS_IN = [
  {
    number: '01',
    title: 'Share the family link',
    body: "Each family has one reusable link. Send it through your phone's share sheet to WhatsApp, text or Messenger, or copy it. Anyone with the link can join, so send it to family only.",
    Icon: Link2,
  },
  {
    number: '02',
    title: 'Send an email invite',
    body: 'Type an email address and Ancestorii sends a personal invitation from support@ancestorii.com. It works only for that address, and it expires after 7 days.',
    Icon: Mail,
  },
  {
    number: '03',
    title: 'Send a question in the app',
    body: 'Sending a relative a question from the Ancestorii app can invite them into your family at the same time. They answer in the app, and their answer joins your feed.',
    Icon: MessageCircleQuestionMark,
  },
  {
    number: '04',
    title: 'They join your space',
    body: "They create an account or sign in, and land straight in your family's library. Everyone already there gets an email saying they have joined.",
    Icon: UserPlus,
  },
];

const MEMBERS_CAN = [
  'See everything in the family space, including what was added before they joined.',
  'Add memories, photos, albums, timelines and capsules, and order printed books.',
  'Heart and reply to memories, and add their own version of a moment.',
  "See each other's name, photo, email address, bio, role and contribution counts.",
  "Delete only what they created. Nobody can delete someone else's work.",
];

const SOURCES: Source[] = [
  {
    publisher: 'Ofcom',
    title: 'From apps to AI search: how the UK goes online in 2025 (Online Nation 2025)',
    href: 'https://www.ofcom.org.uk/media-use-and-attitudes/online-habits/from-apps-to-ai-search-how-the-uk-goes-online-in-2025',
    date: '10 December 2025',
  },
  {
    publisher: 'Ancestorii',
    title: 'Terms of Service, section 2: Eligibility',
    href: 'https://www.ancestorii.com/terms',
    date: '2026',
  },
  {
    publisher: 'Ancestorii',
    title: 'Privacy Policy, section 4: My Family private library data',
    href: 'https://www.ancestorii.com/privacy-policy',
    date: '2026',
  },
];

export default function InviteFamilyPage() {
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
            { name: 'Invite family', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[
            { href: '/', label: 'Home' },
            { href: '/features', label: 'Features' },
            { label: 'Invite family' },
          ]}
          size="md"
          title={
            <>
              Bring the whole family in, <Accent>privately.</Accent>
            </>
          }
          intro={[
            'Owners and Admins can bring relatives into an Ancestorii family space with one reusable share link, handy for WhatsApp or text, or a personal email invite that expires after 7 days. There is no limit on members on any plan, and everyone inside sees everything in the space.',
            'Here is how each way in works, who can invite, what new members can see and do, and what happens when someone joins.',
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        {/* The short answer, beside a photo from the founder's family */}
        <ArticleSection
          aside={
            <CaptionedPhoto
              src="/garden.jpg"
              alt="Dante's little sister on a toy tractor in the garden, with Dante behind her, in May 2013"
              label="Dante and his sister · May 2013"
              color="var(--c3)"
              position="50% 70%"
              caption="Mum's favourite photo of the two of them, from the founder's own family. The people who were there are the ones who know the story behind it."
              priority
            />
          }
        >
          <KeyFacts
            items={[
              <>
                <strong>One share link per family</strong>, sent by WhatsApp, text or Messenger, or
                copied. It can be reused, and making a new link switches the old one off.
              </>,
              <>
                <strong>Email invites</strong> come from support@ancestorii.com, work only for the
                address they were sent to and expire after 7&nbsp;days.
              </>,
              <>
                <strong>Only Owners and Admins</strong> can send email invites or the family link,
                and they can see and cancel pending email invites.
              </>,
              <>
                <strong>No limit on members</strong> on Free or Premium, and one Premium plan at
                £3.99 a month covers everyone in the space.
              </>,
              <>
                <strong>Everyone inside sees everything</strong>, including each other&apos;s name,
                email address and role.
              </>,
            ]}
          />
        </ArticleSection>

        <ArticleSection
          id="ways-in"
          layout="wide"
          kicker="Ways in"
          dot="var(--c0)"
          title={
            <>
              How do you invite <Accent tone="pink">family members?</Accent>
            </>
          }
        >
          <NumberedPanels items={WAYS_IN} />
        </ArticleSection>

        <ArticleSection
          id="roles"
          kicker="Roles"
          dot="var(--c1)"
          title={
            <>
              Who can <Accent tone="blue">send invites?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Every family space has three roles: Owner, Admin and Member. When you sign up,
              Ancestorii creates a family space with you as its Owner.
            </p>
            <p>
              Only Owners and Admins can send email invites or share the family link, from the My
              Family page on the website. They also see pending email invites and can cancel any
              that have not been accepted. Members can add to everything but cannot send email
              invites or the family link, and people who join with the share link come in as Members.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="members-and-cost"
          kicker="Members and cost"
          dot="var(--c2)"
          title={
            <>
              How many people can join, <Accent tone="pink">and do they pay?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              There is no limit on family members on either plan, so you can invite grandparents,
              cousins and in-laws without counting heads. Invited relatives pay nothing to join.
            </p>
            <p>
              Plans belong to the family, not the person. On the Free plan the whole family shares
              1&nbsp;GB of storage. Premium costs £3.99, €4.99 or $5.99 a month, and one subscription
              covers everyone in the space, with 100&nbsp;GB of shared storage,{' '}
              <span style={{ whiteSpace: 'nowrap' }}>15-minute</span> videos and unlimited Loved Ones
              profiles. See <Link href="/pricing">plans and pricing</Link>.
            </p>
            <p>
              Under Ancestorii&apos;s Terms, everyone with an account must be 16 or over, and anyone
              under 18 needs a parent&apos;s or guardian&apos;s consent. Younger children cannot
              have their own account, but they can still be part of the family&apos;s photos and
              stories.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="inside-the-space"
          kicker="Inside the space"
          dot="var(--c3)"
          title={
            <>
              What can members <Accent tone="blue">see and do?</Accent>
            </>
          }
        >
          <CheckList items={MEMBERS_CAN} />
          <Reading>
            <p>
              There are no per-item sharing settings, so you cannot hide one album from one relative.
              If something should not be seen by everyone in the space, keep it out of the space.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="joining"
          kicker="Joining"
          dot="var(--c0)"
          title={
            <>
              What happens <Accent tone="pink">when they join?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              The new member gets a welcome email for your family&apos;s space, and everyone already
              in it gets an email with their name, saying they have just joined. An in-app
              notification goes out too, which the phone app shows as a push notification.
            </p>
            <p>
              From then on they see the whole library, including everything added before they
              arrived, and anything they add is visible to the rest of the family straight away.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="one-family"
          kicker="One family each"
          dot="var(--c1)"
          title={
            <>
              Can someone belong <Accent tone="blue">to two family spaces?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              No. Each account belongs to one family space at a time. If you invite someone who
              already belongs to another family space with other members in it, the invite is
              refused, and the share link will not let them in either.
            </p>
            <p>
              If your family has two sides that both want to take part, such as in-laws, invite
              everyone into one shared space. With no member limit, there is room for both.
            </p>
          </Reading>
        </ArticleSection>

        <QuoteBlock>
          No member limit. <Accent tone="blue">One plan for the whole family.</Accent>
        </QuoteBlock>

        <ArticleSection
          id="getting-started"
          kicker="Getting started"
          dot="var(--c2)"
          title={
            <>
              How do you get relatives <Accent tone="pink">to actually join?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Send the link where your family already talks. Ofcom&apos;s Online Nation 2025 report
              found that WhatsApp is used by 90% of adults in the UK, so the family group chat is
              often the quickest route, and the share link is made for it. If you are weighing the
              two up, see <Link href="/compare/ancestorii-vs-whatsapp">Ancestorii vs a WhatsApp group</Link>.
            </p>
            <p>
              Give people something to see when they arrive. Post one memory first, with a photo and
              a few lines, so a new member opens a real moment rather than an empty page. Then send
              one person a <Link href="/features/family-questions">question</Link> from the app: a
              specific question is easier to answer than “add your memories”.
            </p>
            <p>
              Some relatives will need a hand. The app is free on iPhone and Android and uses the
              same email and password as the website, so someone can set it up with them once. Our
              guide to{' '}
              <Link href="/guides/how-to-get-family-to-share-memories">
                getting family to share memories
              </Link>{' '}
              has more ideas, and <Link href="/features/private-family-feed">the My Family feed</Link>{' '}
              shows what they will be joining.
            </p>
          </Reading>
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
              Start your space.
              <br />
              Then send the link.
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
