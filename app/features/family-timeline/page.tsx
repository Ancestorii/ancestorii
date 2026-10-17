import Link from 'next/link';
import type { Metadata } from 'next';
import { BookOpen, FileText, Landmark, ScrollText } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent } from '@/components/site/SiteBits';
import site from '@/components/site/site.module.css';
import {
  ArticleCta,
  ArticleHero,
  ArticleSection,
  CaptionedPhoto,
  FaqBlock,
  NumberedPanels,
  QuoteBlock,
  Reading,
  TableNote,
} from '@/components/site/seo-articles/ArticleBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';

const PATH = '/features/family-timeline';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Family Timeline Maker: Lay Out a Life in Order';
const HEADLINE = 'Build a timeline of a loved one’s life';
const DESCRIPTION =
  'Build a timeline of a loved one’s life with dated events, photos, video, family comments and voice notes. Unlimited timelines, and a PDF you can download.';
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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Ancestorii family timelines' }],
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
    q: 'Can I make a timeline for someone who has died?',
    a: 'Yes. Add the events you know, then invite relatives to add photos, comments and voice notes of their own. A Loved Ones profile can hold the person’s birth and death dates and their life story, and tagging them on the timeline links the two.',
  },
  {
    q: 'How many timelines can I create?',
    a: 'As many as you like. Timelines are unlimited on both the Free and Premium plans. What the plans limit is storage for photos and videos: 1 GB shared by the family on Free, or 100 GB on Premium for £3.99 a month per family.',
  },
  {
    q: 'Can I download a timeline as a PDF?',
    a: 'Yes. Preserve My Legacy previews the timeline as a PDF and lets you download it, with your layout and colours, one image per event and an Ancestorii watermark.',
  },
  {
    q: 'Can I build a timeline on my phone?',
    a: 'Not on the website: the web timeline builder needs a screen at least 1024 pixels wide, and phones see a “Bigger screen needed” message. The free iPhone and Android app lets you and your family capture and view timelines.',
  },
  {
    q: 'Where can I find dates for my grandparents’ lives?',
    a: 'Start with family papers and relatives’ memories. In England and Wales, the censuses from 1841 to 1921 are online, the 1939 Register covers around 40 million people, and the General Register Office holds birth, marriage and death records from July 1837. Scotland and Northern Ireland keep their own records.',
  },
];

const KEY_FACTS = [
  <>
    <strong>Unlimited timelines</strong> on the Free and Premium plans. Each has a title, a description
    and a cover photo.
  </>,
  <>
    Every event needs a <strong>title and a date</strong>, and can hold photos and videos (including from
    your family Library), comments and voice notes.
  </>,
  <>
    Events sit on a <strong>horizontal timeline</strong> you can zoom and pan, and you can tag the loved
    ones a timeline is about.
  </>,
  <>
    <strong>Preserve My Legacy</strong> previews and downloads a PDF with your layout and colours, one
    image per event and an Ancestorii watermark.
  </>,
  <>
    On the website the builder needs a screen <strong>at least 1024&nbsp;pixels wide</strong>. The free phone
    app lets your family capture and view timelines.
  </>,
  <>
    In England and Wales a census has been taken <strong>every ten years since 1801, except 1941</strong>,
    and the 1841 to 1921 returns are online (The National Archives).
  </>,
];

const RECORDS = [
  {
    number: '01',
    title: 'Family papers first.',
    body: 'Certificates, school reports, payslips, letters with postmarks and the backs of photos often carry exact dates. Look at home before you look anywhere else.',
    Icon: FileText,
  },
  {
    number: '02',
    title: 'Census returns.',
    body: 'Taken every ten years since 1801, except 1941, and kept closed for 100 years. The 1841 to 1921 returns are online through sites such as Ancestry and Findmypast, and from 1851 they give ages, occupations, birthplaces and each person’s relationship to the head of the household.',
    Icon: ScrollText,
  },
  {
    number: '03',
    title: 'The 1939 Register.',
    body: 'Taken on 29 September 1939, it lists around 40 million people with their addresses, dates of birth, marital status and occupations. With the 1931 census destroyed by fire in 1942 and none taken in 1941, it fills a long gap. An entry stays closed for 100 years from birth unless there is proof of death.',
    Icon: BookOpen,
  },
  {
    number: '04',
    title: 'Births, marriages and deaths.',
    body: 'The General Register Office holds every birth, marriage and death registered in England and Wales since July 1837. Its online index covers historic births from 1837 to 1934 and deaths from 1837 to 1957.',
    Icon: Landmark,
  },
];

const SOURCES: Source[] = [
  {
    publisher: 'The National Archives',
    title: 'Census records',
    href: 'https://www.nationalarchives.gov.uk/help-with-your-research/research-guides/census-records/',
    date: 'accessed October 2026',
  },
  {
    publisher: 'The National Archives',
    title: '1939 Register',
    href: 'https://www.nationalarchives.gov.uk/help-with-your-research/research-guides/1939-register/',
    date: 'accessed October 2026',
  },
  {
    publisher: 'GOV.UK',
    title: 'Research your family history using the General Register Office',
    href: 'https://www.gov.uk/research-family-history',
    date: 'accessed October 2026',
  },
];

export default function FamilyTimelinePage() {
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
            { name: 'Features', path: '/features' },
            { name: 'Family timeline', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[
            { href: '/', label: 'Home' },
            { href: '/features', label: 'Features' },
            { label: 'Family timeline' },
          ]}
          size="md"
          title={
            <>
              Build a timeline <Accent>of a loved one’s life.</Accent>
            </>
          }
          intro={[
            'An Ancestorii timeline lays a life out in order: each event has a title and a date, then holds photos, video, family comments and voice notes. Timelines are unlimited on every plan, your whole family can add to them, and you can download the finished timeline as a PDF.',
            'Make one for a parent, a grandparent, a couple or a whole branch of the family, and invite the people who were there to add what they remember.',
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        {/* Key facts beside one of the founder's own dated family photos */}
        <ArticleSection
          aside={
            <CaptionedPhoto
              src="/family.jpg"
              alt="Dante and his mum sitting on the floor"
              label="Dante and his mum · May 2011"
              color="var(--c2)"
              caption={'“Me and my mum. The woman behind everything.” May 2011, from the founder’s own family photos.'}
              position="78% 50%"
              priority
            />
          }
        >
          <KeyFacts items={KEY_FACTS} />
        </ArticleSection>

        <ArticleSection
          id="what-goes-in"
          kicker="The basics"
          dot="var(--c1)"
          title={
            <>
              What goes into <Accent tone="blue">a family timeline?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              A timeline starts with a title, a short description and a cover photo. Then you add events.
              Each one needs a title and a date and can start with a photo or a video. Open an event later
              and you can add more photos and videos, from your device or your family Library, along with
              comments and voice notes.
            </p>
            <p>Begin with the events that are on paper, because they give the timeline its shape:</p>
            <ul>
              <li>births, christenings and naming days</li>
              <li>schools, first jobs and changes of career</li>
              <li>moves, with the addresses if you have them</li>
              <li>engagements, weddings and anniversaries</li>
              <li>children and grandchildren</li>
              <li>retirement and later life</li>
            </ul>
            <p>
              Then add the moments only the family knows: the holiday everyone still talks about, the day
              the dog arrived, the job that nearly happened. Events appear in date order along a horizontal
              timeline you can zoom and pan, with month markers once you zoom in far enough.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="dates"
          kicker="Dates"
          dot="var(--c2)"
          title={
            <>
              How do you date events <Accent tone="pink">nobody remembers exactly?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Every event needs a full date, because that is how the timeline puts things in order. When
              you only know the year, pick a stand-in day such as 1&nbsp;January and say so in the title, for
              example “Moved to Bristol (about 1962)”. The PDF prints each event’s full date, so flagging
              a guess stops it turning into a fact.
            </p>
            <p>To narrow a date down:</p>
            <ul>
              <li>
                <strong>Work from fixed points.</strong> “The winter after the wedding” or “just before
                your brother was born” can be pinned to dates you already have.
              </li>
              <li>
                <strong>Ask more than one relative.</strong> People remember different details, and where
                their memories overlap you are on firmer ground. The questions in our guide to{' '}
                <Link href="/guides/questions-to-ask-your-parents-about-their-life">
                  asking your parents about their life
                </Link>{' '}
                are a good way in.
              </li>
              <li>
                <strong>Check the paperwork and the records.</strong> Certificates, letters and public
                records can settle a date for good. The next section covers where to look.
              </li>
            </ul>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="records"
          layout="wide"
          kicker="Records"
          dot="var(--c3)"
          title={
            <>
              Which public records <Accent tone="blue">can fill the gaps?</Accent>
            </>
          }
        >
          <NumberedPanels items={RECORDS} />
          <TableNote>
            The census and 1939 Register details come from The National Archives, and the register office
            details from GOV.UK. These records cover England and Wales; Scotland and Northern Ireland keep
            their own. Ancestorii doesn’t search records, but whatever you find can go straight onto your
            timeline. For a fuller start, see our guide to{' '}
            <Link href="/guides/how-to-start-researching-your-family-history" className={site.textLink}>
              researching your family history
            </Link>
            .
          </TableNote>
        </ArticleSection>

        <ArticleSection
          id="together"
          kicker="Together"
          title={
            <>
              Can the family add comments <Accent tone="pink">and voices to an event?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Yes. Everyone you invite to your family space can add events to a timeline, add photos and
              videos to an event, leave comments and record voice notes. This is where the gaps get
              filled: you add the date of the wedding, your aunt remembers the band, and your grandmother
              records two minutes on how they met.
            </p>
            <p>
              Voice notes can be recorded in the browser or uploaded as audio files, and new recordings are
              converted to M4A automatically so they play on any phone. Only the person who created a
              timeline can delete it or remove anything from it.
            </p>
            <p>
              You can also tag the people a timeline is about from their{' '}
              <Link href="/features/loved-ones">Loved Ones profiles</Link>, so it shows on each person’s
              profile alongside their dates and life story. The Free plan includes one Loved Ones profile;
              Premium has no limit.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="pdf-and-print"
          kicker="PDF and print"
          dot="var(--c1)"
          title={
            <>
              Can you download <Accent tone="blue">or print a timeline?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Yes. Choose Preserve My Legacy to preview the timeline as a PDF, then download it. The PDF
              keeps your layout and colours, shows one image per event and carries an Ancestorii
              watermark. It is an easy way to share a parent’s timeline with relatives who aren’t in your
              family space, or to print a copy at home.
            </p>
            <p>
              For something to hang on the wall or keep on a shelf, the canvas and Memory Book editors take
              their photos from your <Link href="/features/family-library">family Library</Link>. The
              Heritage canvas, 24&nbsp;by&nbsp;72&nbsp;inches, has a landscape Timeline layout for six
              photos and costs £169.99 plus delivery, with UK delivery only. A{' '}
              <Link href="/memory-books">Memory Book</Link> starts at £44.99 plus delivery for 24 printed
              pages.
            </p>
          </Reading>
        </ArticleSection>

        <QuoteBlock>
          A date tells you when. <Accent tone="blue">The family remembers why.</Accent>
        </QuoteBlock>

        <ArticleSection
          id="screens"
          kicker="Screens"
          dot="var(--c2)"
          title={
            <>
              What do you need to build one <Accent tone="pink">on the website?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              A screen at least 1024&nbsp;pixels wide, such as a laptop, a desktop computer or a large tablet
              turned sideways. On anything narrower, including phones and most tablets held upright, the
              website shows a “Bigger screen needed” message instead of the builder, because a horizontal
              timeline needs the room.
            </p>
            <p>
              On a phone, use the free Ancestorii app for iPhone and Android, which lets your family capture
              and view timelines along with memories, albums, voice notes and family profiles. Upgrades and
              print orders happen on the website, with the same email and password.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="how-ancestorii-helps"
          kicker="Where we fit"
          dot="var(--c3)"
          title={
            <>
              How it <Accent tone="blue">helps.</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Ancestorii is a private place for a family’s memories, and a timeline is one way of seeing
              them in order. It sits alongside albums, the family Library, time capsules and Loved Ones
              profiles, in a family space that only the people you invite can see.
            </p>
            <p>
              It isn’t a genealogy service. It doesn’t search records or build family trees, and its terms
              describe it as a memory-keeping and storytelling service rather than a research one. It
              helps with what comes after the research: putting the dates beside the photos, the stories
              and the voices of the people who were there.
            </p>
            <p>
              If you’re stuck, Story Assistance, the optional writing help, can suggest questions to help
              you remember what happened and prompts for describing an event. You decide what to keep.
              Timelines are unlimited on the Free plan, and <Link href="/pricing">Premium</Link> adds more
              storage for £3.99 a month per family.
            </p>
          </Reading>
        </ArticleSection>

        <ArticleSection
          id="questions"
          kicker="Questions"
          title={
            <>
              Questions about <Accent tone="blue">family timelines.</Accent>
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
              Start with a date.
              <br />
              Let the family in.
            </>
          }
          lead="Unlimited timelines on every plan, free to start, no credit card."
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
