import Link from 'next/link';
import type { Metadata } from 'next';
import { BookHeart, Lock, Mic, Printer } from 'lucide-react';
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

const PATH = '/compare/ancestorii-vs-ancestry';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Ancestorii vs Ancestry: Stories or Family Tree?';
const HEADLINE = 'Ancestorii vs Ancestry: records and trees, or stories and voices?';
const DESCRIPTION =
  "Ancestry is for researching records and building a family tree. Ancestorii is for keeping your family's own photos, voices and stories. Use them together.";

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Ancestorii vs Ancestry' }],
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

// As Ancestry's UK help centre describes each membership, checked 17 October 2026.
const MEMBERSHIPS = [
  [
    'UK Essentials',
    'UK censuses from 1841 to 1911, civil registration records of births, marriages and deaths, a small number of parish records, all public trees, and hints on those records',
  ],
  ['UK Premium', 'All UK and Irish records on Ancestry, all public trees and hints; other international records are not included'],
  ['UK Worldwide', 'All records on Ancestry, all public trees and all hints'],
  ['All Access', 'All UK and international records, plus memberships to Forces War Records and Newspapers.com'],
  ['Pay-As-You-Go', '12 record views within 14\u00a0days, with no membership'],
];

const ROWS = [
  ['Main job', "Keeping your family's own photos, voices and stories", 'Searching historical records and building a family tree'],
  ['Historical records', 'None', '71 billion online, by its own count'],
  ['Family tree', 'No', 'Yes, free to start'],
  ['DNA testing', 'No', 'AncestryDNA, in more than 119 markets'],
  ['Pages for people', 'Loved Ones life stories: 1 on Free, unlimited on Premium', 'A profile for each person in your tree, with photos and stories'],
  ['Voice recordings', 'Voice notes on memories, photos, timeline moments and capsules', 'Audio recordings in its Memories tools'],
  ['Who can see it', 'Only people invited into your family space', 'Public tree: anyone with an Ancestry membership and people you invite. Private tree: you and people you invite'],
  ['Inviting family', 'Owner, Admin and Member roles, with no limit on members', 'Guest, Contributor and Editor roles'],
  ['Cost', 'Free plan; Premium £3.99 a month per family', 'Free tree; most records need a membership or Pay-As-You-Go credits'],
];

const HELPS = [
  {
    title: 'Voices, not just names.',
    text: 'Voice notes on memories, photos, timeline moments and capsules keep how someone spoke, converted to play on any phone.',
    Icon: Mic,
  },
  {
    title: 'A page for each person.',
    text: 'Loved Ones pages hold dates, a life story in four chapters and every album, timeline and capsule someone appears in.',
    Icon: BookHeart,
  },
  {
    title: 'Private to your family.',
    text: 'Only people you invite can see My Family. There are no ads, and Ancestorii does not sell, rent or trade personal data.',
    Icon: Lock,
  },
  {
    title: 'Printed when you are ready.',
    text: 'Memory Books from £44.99, and canvas and acrylic prints from £99.99, all plus delivery, from photos the family has added.',
    Icon: Printer,
  },
];

// Shown on the page and written into the FAQPage structured data, word for word.
const FAQ_PLAIN = [
  {
    q: 'Is Ancestorii an alternative to Ancestry?',
    a: "Not for research. Ancestry is for searching historical records and building a family tree, and Ancestorii has neither: its Terms describe it as a memory-preservation and storytelling service, not a genealogical research service. Ancestorii keeps your living family's photos, voices and stories, so many families use both.",
  },
  {
    q: 'Does Ancestorii have a family tree?',
    a: 'No. Ancestorii organises a family by person instead, with a Loved Ones page for each one: photo, relationship, dates and a life story in four chapters, plus the albums, timelines and capsules they are tagged in. The Free plan includes 1 Loved Ones page, and Premium includes as many as you like.',
  },
  {
    q: 'Can I build a family tree on Ancestry for free?',
    a: 'Yes. Ancestry invites you to start your family tree for free, and searching its records is free. Viewing most records needs a membership, such as UK Essentials, UK Premium, UK Worldwide or All Access, or Pay-As-You-Go credits, which give 12 record views within 14\u00a0days.',
  },
  {
    q: 'Which UK census records can I search?',
    a: 'For England and Wales, every census from 1841 to 1921 is online, on Ancestry and Findmypast, with free indexes up to 1911 on FamilySearch. The National Archives at Kew offers 1841 to 1921 free on site. The 1931 census was destroyed by fire in 1942, no census was taken in 1941, and later censuses stay closed for 100\u00a0years.',
  },
  {
    q: 'Can I use Ancestry and Ancestorii together?',
    a: 'Yes. Use Ancestry to find ancestors in records, then use Ancestorii for the people your family knew: Loved Ones pages, timelines with the dates you found, and voice notes from the relatives who remember them. Ancestorii is free to start, and Premium is £3.99 a month for the whole family.',
  },
];

const SOURCES: Source[] = [
  {
    publisher: 'Ancestry',
    title: 'Company Facts',
    href: 'https://www.ancestry.com/corporate/about-ancestry/company-facts',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Ancestry',
    title: 'Start your family tree for free',
    href: 'https://www.ancestry.co.uk/c/family-tree',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Ancestry UK help centre',
    title: 'Memberships',
    href: 'https://help.ancestry.co.uk/hc/en-gb/sections/51535963567123-Memberships',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Ancestry UK help centre',
    title: 'UK Essentials Membership',
    href: 'https://help.ancestry.co.uk/hc/en-gb/articles/53933318135955-UK-Essentials-Membership',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Ancestry UK help centre',
    title: 'UK Premium Membership',
    href: 'https://help.ancestry.co.uk/hc/en-gb/articles/53933336513043-UK-Premium-Membership',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Ancestry UK help centre',
    title: 'UK Worldwide Membership',
    href: 'https://help.ancestry.co.uk/hc/en-gb/articles/53933339246227-UK-Worldwide-Membership',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Ancestry UK help centre',
    title: 'All Access Membership',
    href: 'https://help.ancestry.co.uk/hc/en-gb/articles/53933280003987-All-Access-Membership',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Ancestry UK help centre',
    title: 'Pay-As-You-Go Access to Ancestry Records',
    href: 'https://help.ancestry.co.uk/hc/en-gb/articles/53933307275027-Pay-As-You-Go-Access-to-Ancestry-Records',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Ancestry UK help centre',
    title: 'Free Registered Guest Accounts',
    href: 'https://help.ancestry.co.uk/hc/en-gb/articles/53933331416467-Free-Registered-Guest-Accounts',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Ancestry UK help centre',
    title: 'Family Tree Privacy',
    href: 'https://help.ancestry.co.uk/hc/en-gb/articles/53933315101075-Family-Tree-Privacy',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Ancestry UK help centre',
    title: 'Sharing a Family Tree',
    href: 'https://help.ancestry.co.uk/hc/en-gb/articles/53954890064787-Sharing-a-Family-Tree',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Ancestry UK help centre',
    title: 'Creating and Preserving Memories on Ancestry',
    href: 'https://help.ancestry.co.uk/hc/en-gb/articles/53933306174355-Creating-and-Preserving-Memories-on-Ancestry',
    date: 'accessed October 2026',
  },
  {
    publisher: 'The National Archives',
    title: 'Census records (research guide)',
    href: 'https://www.nationalarchives.gov.uk/help-with-your-research/research-guides/census-records/',
    date: 'accessed October 2026',
  },
  {
    publisher: 'The National Archives',
    title: '1939 Register (research guide)',
    href: 'https://www.nationalarchives.gov.uk/help-with-your-research/research-guides/1939-register/',
    date: 'accessed October 2026',
  },
  {
    publisher: 'GOV.UK',
    title: 'Order a copy of a birth, death or marriage certificate',
    href: 'https://www.gov.uk/order-copy-birth-death-marriage-certificate',
    date: 'accessed October 2026',
  },
  {
    publisher: 'FreeBMD',
    title: 'FreeBMD: the civil registration index of births, marriages and deaths for England and Wales',
    href: 'https://www.freebmd.org.uk/',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Ancestorii',
    title: 'Terms of Service, section 1',
    href: 'https://www.ancestorii.com/terms',
    date: '2026',
  },
];

export default function AncestoriiVsAncestryPage() {
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
            { name: 'Ancestorii vs Ancestry', path: PATH },
          ]),
          faqSchema(FAQ_PLAIN),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[
            { href: '/', label: 'Home' },
            { href: '/compare', label: 'Compare' },
            { label: 'Ancestorii vs Ancestry' },
          ]}
          size="md"
          title={
            <>
              Ancestorii vs Ancestry: <Accent>records and trees, or stories and voices?</Accent>
            </>
          }
          intro={[
            "Ancestry is a genealogy service for searching historical records and building a family tree, with 71 billion records online by its own count. Ancestorii is a private space for your living family's own photos, voices and stories, with no record search and no family tree, so the two do different jobs and work well together.",
            'The Ancestry details on this page come from its own website and UK help centre, checked in October\u00a02026.',
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        {/* The short answer, beside something no record holds */}
        <ArticleSection
          aside={
            <CaptionedPhoto
              src="/family.jpg"
              alt="Dante, the founder of Ancestorii, as a boy sitting on the floor with his mum in May 2011"
              label="Dante and his mum · May 2011"
              color="var(--c2)"
              position="62% 50%"
              caption="The founder and his mum, “the woman behind everything”. Records can tell you where someone lived. They cannot tell you how they laughed."
              priority
            />
          }
        >
          <KeyFacts
            items={[
              <>
                <strong>Ancestry says</strong> it has 71 billion records online, over 150 million
                family trees and more than 3 million paying subscribers.
              </>,
              <>
                <strong>You can start a tree on Ancestry for free.</strong> Viewing most records needs a
                membership, such as UK Essentials, UK Premium or UK Worldwide, or Pay-As-You-Go credits.
              </>,
              <>
                <strong>UK Essentials</strong> includes the UK censuses from 1841 to 1911 and civil
                registration records of births, marriages and deaths. Most parish records need UK
                Premium or UK Worldwide.
              </>,
              <>
                <strong>The censuses for England and Wales</strong> from 1841 to 1921 are online. The
                1931 census was destroyed by fire in 1942, and none was taken in 1941.
              </>,
              <>
                <strong>Ancestorii has no family tree and no record search.</strong> Its Terms call it a
                memory-preservation and storytelling service, not a genealogical research service.
              </>,
              <>
                <strong>Ancestorii is free to start.</strong> Premium is £3.99 a month for the whole
                family.
              </>,
            ]}
          />
        </ArticleSection>

        <ArticleSection
          id="ancestry"
          kicker="Fair to Ancestry"
          dot="var(--c1)"
          title={
            <>
              What is Ancestry <Accent tone="blue">for?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Finding ancestors in records. Ancestry&apos;s company facts page lists 71 billion records
              from 80+ countries of origin, over 150 million family trees, more than 3 million paying
              subscribers and over 30 million people in its DNA network, with AncestryDNA available in
              more than 119 markets. Those are Ancestry&apos;s own figures, checked in October&nbsp;2026.
            </p>
            <p>
              You build a tree person by person, and Ancestry suggests records that may match as
              hints, shown as leaves. Each person in your tree has a profile where you can add photos
              and stories, and Ancestry&apos;s Memories tools let you make slideshow stories and albums
              and record or upload audio of relatives telling family stories. Ancestry says some of
              those tools are only in its app for now.
            </p>
            <p>
              A tree can be public, which Ancestry says makes it visible to anyone with an Ancestry
              membership and people you invite, or private, visible only to you and people you invite.
              Details about living people are kept private even in public trees. You can invite
              relatives as a guest, contributor or editor, and each needs an Ancestry account, which
              can be a free one.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="memberships"
          layout="wide"
          kicker="Memberships"
          dot="var(--c2)"
          title={
            <>
              What does an Ancestry UK <Accent tone="pink">membership include?</Accent>
            </>
          }
        >
          <CompareTable
            head={['Membership', 'What Ancestry says it includes']}
            rows={MEMBERSHIPS}
            highlight={-1}
            size="fit"
            labelledBy="memberships-title"
          />
          <TableNote>
            Each of the four memberships also lets you build and edit your own trees and contact other
            members. UK Essentials does not include records from the London Metropolitan Archives.
            Ancestry also lists other memberships, such as Pro Tools and AncestryDNA Plus. Its
            membership help pages do not give prices, so check the current offer on ancestry.co.uk
            before you buy.
          </TableNote>
        </ArticleSection>

        <ArticleSection
          id="uk-records"
          kicker="UK records"
          dot="var(--c3)"
          title={
            <>
              Which UK records can help, <Accent tone="blue">and where are they?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Ancestry is one door into records that also exist elsewhere, sometimes for free. For
              England and Wales, these are the main ones:
            </p>
            <ul>
              <li>
                <strong>Censuses, 1841 to 1921.</strong> The National Archives says all are online.
                Ancestry and Findmypast hold
                images and indexes for the full range, and searching is free but viewing needs payment.
                FamilySearch has free indexes up to 1911, and The National Archives at Kew offers 1841
                to 1921 free on site. The 1921 Census is also free to view at Manchester Central Library
                and the National Library of Wales. The 1931 census was destroyed by fire in 1942, no
                census was taken in 1941, and later censuses stay closed for 100&nbsp;years.
              </li>
              <li>
                <strong>The 1939 Register.</strong> Taken on 29&nbsp;September&nbsp;1939, it records the civilian
                population of England and Wales. The National Archives says it is on Findmypast and
                Ancestry as paid services and free to view at Kew, and the record of anyone born less than 100&nbsp;years ago stays closed
                unless they are known to have died.
              </li>
              <li>
                <strong>Births, marriages and deaths.</strong> Civil registration began in 1837.
                FreeBMD, a charity run by volunteers, transcribes the index for free, though not every
                year is done yet. On GOV.UK, a General Register Office certificate costs £12.50, plus
                £3.50 if you do not have its index reference.
              </li>
            </ul>
            <p>
              Scotland and Northern Ireland have separate services: the National Records of Scotland
              and nidirect. For a step-by-step start, see our guide to{' '}
              <Link href="/guides/how-to-start-researching-your-family-history">
                researching your family history
              </Link>
              .
            </p>
          </Reading>
        </ArticleSection>

        <QuoteBlock>
          Records tell you who your family were.{' '}
          <Accent tone="blue">Stories and voices tell you what they were like.</Accent>
        </QuoteBlock>

        <ArticleSection
          id="ancestorii"
          kicker="Ancestorii"
          dot="var(--c0)"
          title={
            <>
              What is Ancestorii <Accent tone="pink">for?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              The things records never hold: what your grandmother sounded like, why a photo mattered,
              the story behind a recipe. Ancestorii is a private library for the family you know, not a
              research tool, so there is no family tree and no record search.
            </p>
            <ul>
              <li>
                <strong>Loved Ones pages</strong> hold a person&apos;s photo, relationship, birth and
                death dates and life story in four chapters: Early years, Important moments, Special
                memories and Who they are. The Free plan includes 1; Premium includes as many as you
                like.
              </li>
              <li>
                <strong>Timelines</strong> put a life in date order, with photos, video, comments and
                voice notes on each moment.
              </li>
              <li>
                <strong>Voice notes</strong> can be recorded or uploaded on memories, album photos,
                timeline moments and capsules.
              </li>
              <li>
                <strong>Questions</strong>, 46 of them in 10 chapters, are sent from the app and help
                the older generation tell their own stories. Their answers land in the My Family feed.
              </li>
              <li>
                <strong>Memory Books</strong> turn your photos and words into an A4 hardcover of 24, 36
                or 48 printed pages, from £44.99 plus delivery.
              </li>
            </ul>
            <p>
              Only people invited into your family space can see it, and there is no limit on how many
              relatives can join.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="side-by-side"
          layout="wide"
          kicker="Side by side"
          title={
            <>
              Ancestorii vs Ancestry: <Accent tone="pink">side by side.</Accent>
            </>
          }
        >
          <CompareTable
            head={['Feature', 'Ancestorii', 'Ancestry']}
            rows={ROWS}
            highlight={1}
            size="mid"
            labelledBy="side-by-side-title"
          />
          <TableNote>
            Ancestry details as of October&nbsp;2026. Not sure which you need? Read{' '}
            <Link href="/guides/family-history-vs-family-tree" className={site.textLink}>
              family history vs family tree
            </Link>
            .
          </TableNote>
        </ArticleSection>

        <ArticleSection
          id="together"
          kicker="Together"
          dot="var(--c1)"
          title={
            <>
              How can you use <Accent tone="blue">them together?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              They fit together because one looks back through records and the other keeps what living
              memory still holds. A simple order to work in:
            </p>
            <ol>
              <li>
                Research the generations nobody alive remembers on Ancestry, or through the free routes
                above.
              </li>
              <li>
                For the people you knew, make a Loved Ones page and a{' '}
                <Link href="/features/family-timeline">family timeline</Link>, adding the dates you
                found and the photos the family already has.
              </li>
              <li>
                Ask the oldest relatives what records cannot say: how they met, what home was like,
                what they want remembered. Our{' '}
                <Link href="/guides/questions-to-ask-your-parents-about-their-life">
                  questions to ask your parents about their life
                </Link>{' '}
                are a good start.
              </li>
              <li>Record their answers as voice notes, so the family keeps the voice as well as the facts.</li>
            </ol>
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
            What it does not do: there is no family tree, no historical records and no DNA testing, and
            the Free plan includes 1 Loved Ones page. See{' '}
            <Link href="/features/loved-ones" className={site.textLink}>
              Loved Ones pages
            </Link>{' '}
            and{' '}
            <Link href="/memory-books" className={site.textLink}>
              Memory Books
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
              Find the records.
              <br />
              Keep the voices.
            </>
          }
          lead="Free to start. Private to your family. No family tree needed."
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
