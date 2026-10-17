import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  Baby,
  BookOpen,
  CalendarHeart,
  ChefHat,
  Frame,
  Heart,
  Hourglass,
  Images,
  Mail,
  Mic,
  Music,
  ScrollText,
  Smartphone,
  Video,
} from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { GuideFigure, Point, Points, QuestionSet, QuestionSets, Tip, Tips } from '../_components/GuideBlocks';

const PATH = '/guides/gifts-for-grandparents';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Gifts for Grandparents That Mean Something';
const HEADLINE = 'Gifts for grandparents that mean something';
const DESCRIPTION =
  'Meaningful gifts for grandparents: photo books, framed prints, recorded voices and time together, plus when Grandparents’ Day falls in the UK and US.';
const PUBLISHED = '2026-10-17';
const CRUMB = 'Gifts for Grandparents';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Gifts for grandparents' }],
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
const FAQ_PLAIN = [
  {
    q: 'What do you buy grandparents who have everything?',
    a: 'Something about the family rather than another object: a photo book with names and dates in the captions, a framed print of the grandchildren, a recording of their voices, or a day out together with a date already in the diary.',
  },
  {
    q: 'When is Grandparents’ Day in the UK?',
    a: 'The first Sunday of October, as it has been since October\u00a02008, so the next one is Sunday 3\u00a0October\u00a02027. In the US, National Grandparents Day is the first Sunday after Labor Day, and the next one is Sunday 12\u00a0September\u00a02027.',
  },
  {
    q: 'What is a good gift for grandparents from the grandchildren?',
    a: 'Something the children made or recorded: a framed drawing, a voice note of them reading a story or singing, a letter, or a pair of photos showing the grandparent and the grandchild at the same age, an idea adapted from Age UK Norfolk’s Grandparents’ Day pack.',
  },
  {
    q: 'What is a thoughtful gift for a grandparent in a care home?',
    a: 'Dementia UK suggests reminiscence gifts such as photobooks with large prints and captions, memory boxes with simple items that link to pleasant memories, a personalised music playlist, or a digital photo frame the family can send photos to. A life story book also helps carers get to know the person.',
  },
  {
    q: 'How far ahead should I order a photo book gift?',
    a: 'Allow three to four weeks: time to choose the photos and design it, plus delivery. Ancestorii’s Memory Books are printed to order, and standard delivery takes 10 to 14\u00a0working\u00a0days, which is an estimate rather than a guarantee.',
  },
];

const KEY_FACTS = [
  <>
    UK Grandparents’ Day has been the <strong>first Sunday of October</strong> since 2008. The next one is{' '}
    <strong>Sunday 3&nbsp;October&nbsp;2027</strong>.
  </>,
  <>
    US National Grandparents Day is the <strong>first Sunday after Labor Day</strong>, proclaimed by
    President Carter in 1978. The next one is <strong>Sunday 12&nbsp;September&nbsp;2027</strong>.
  </>,
  <>
    For grandparents living with dementia, Dementia UK suggests <strong>photobooks with large prints and
    captions</strong>, and says the best gift is quality time together.
  </>,
  <>
    <strong>74% of UK online adults</strong> used WhatsApp every day in May&nbsp;2025, up from 64% a year
    earlier (Ofcom).
  </>,
  <>
    Printed gifts take time: Ancestorii’s standard delivery is <strong>10 to 14&nbsp;working&nbsp;days</strong>, so
    order at least three weeks before the day.
  </>,
];

const NEXT_DATES = [
  'UK Grandparents’ Day: Sunday 3\u00a0October\u00a02027',
  'US National Grandparents Day: Sunday 12\u00a0September\u00a02027',
  'France, Grandmothers’ Day: the first Sunday in March',
  'Germany, Grandmothers’ Day: the second Sunday in October',
];

const SOURCES: Source[] = [
  {
    publisher: 'Age UK Norfolk',
    title: 'Grandparent’s Day Pack 2025',
    href: 'https://ageuk.org.uk/bp-assets/globalassets/norfolk/original-blocks/get-involved/grandparents-day-pack-2025.pdf',
    date: '2025',
  },
  {
    publisher: 'US Census Bureau',
    title: 'National Grandparents Day 2016: Sept. 11 (Facts for Features)',
    href: 'https://www.census.gov/newsroom/facts-for-features/2016/cb16-ff17.html',
    date: '2016',
  },
  {
    publisher: 'Dementia UK',
    title: 'Christmas gifts for people with dementia',
    href: 'https://www.dementiauk.org/news/our-list-of-gifts-for-a-happy-and-inclusive-christmas-for-people-with-dementia/',
    date: '2\u00a0December\u00a02025',
  },
  {
    publisher: 'Dementia UK',
    title: 'Creating a life story for a person with dementia',
    href: 'https://www.dementiauk.org/information-and-support/living-with-dementia/creating-a-life-story/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Ofcom',
    title: 'Online Nation 2025',
    href: 'https://www.ofcom.org.uk/siteassets/resources/documents/research-and-data/online-research/online-nation/2025/online-nations-report-2025.pdf',
    date: '10\u00a0December\u00a02025',
  },
  {
    publisher: 'Office for National Statistics',
    title: 'Estimates of the very old, including centenarians, UK: 2002 to 2024',
    href: 'https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/ageing/bulletins/estimatesoftheveryoldincludingcentenarians/latest',
    date: '21\u00a0October\u00a02025',
  },
];

// Room above the key facts and the author box, and above the sources (a section's step).
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function GiftsForGrandparentsPage() {
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
            { name: 'Guides', path: '/guides' },
            { name: CRUMB, path: PATH },
          ]),
          faqSchema(FAQ_PLAIN),
        ]}
      />

      <SiteShell>
        <GuideArticle
          guideLink
          crumb={CRUMB}
          title={
            <>
              Gifts for grandparents{' '}
              <br />
              <Accent>that mean something.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              The best gifts for grandparents are usually personal ones about their family: a printed book of family photos and stories, a framed print of the grandchildren, a recording of voices they love, or an afternoon spent asking about their life. In the UK, Grandparents’ Day is the first Sunday of October; in the US, it is the first Sunday after Labor Day.
            </Lead>
            <p>
              The ideas below draw on advice from Dementia UK and Age UK Norfolk, and the dates are checked against Age UK Norfolk and the US Census Bureau. Most of these gifts cost little. The printed ones take a few weeks, so start early.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <GuideSection
            title={
              <>
                What makes a good gift <Accent tone="pink">for a grandparent?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                By the time someone is a grandparent, they often own most of what they need. What they rarely have is the family’s photos somewhere they can see them, or enough time with the people in them. Four questions help you choose:
              </p>
            </Prose>
            <Tips>
              <Tip icon={Heart}>Is it about them, or about the family they made?</Tip>
              <Tip icon={Smartphone}>Can they enjoy it without passwords, apps or setting anything up?</Tip>
              <Tip icon={Hourglass}>Will it still mean something in twenty years?</Tip>
              <Tip icon={Baby}>Did the grandchildren have a hand in it?</Tip>
            </Tips>
          </GuideSection>

          <GuideSection
            title={
              <>
                Which photo and story <Accent tone="pink">gifts work best?</Accent>
              </>
            }
          >
            <Points>
              <Point icon={BookOpen} title="A printed photo book.">
                Twenty to forty family photos, each captioned with names, a place and a year. Dementia UK suggests “photobooks with large prints and captions” for people living with dementia, and large, clear captions are worth doing for anyone.
              </Point>
              <Point icon={Frame} title="A framed print of the grandchildren.">
                One recent photo with everyone in it, printed large enough to see from the armchair.
              </Point>
              <Point icon={Images} title="Then and now.">
                Age UK Norfolk’s Grandparents’ Day pack suggests children bring in photos of their grandparents at the same age as themselves and spot the similarities and differences. Frame the pair side by side: Grandad at seven, his grandson at seven.
              </Point>
              <Point icon={ChefHat} title="Their recipes, written up.">
                A booklet of the dishes they cook, each with a photo of the handwritten card. Our guide to{' '}
                <Link href="/guides/how-to-preserve-family-recipes">preserving family recipes</Link> covers scanning and old measures.
              </Point>
              <Point icon={ScrollText} title="A life story book.">
                Dementia UK describes a life story as a record of a person’s life that can trigger happy memories and help carers get to know them. Make it with them, a chapter at a time.
              </Point>
            </Points>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you give <Accent tone="pink">a gift of voices?</Accent>
              </>
            }
          >
            <Tips>
              <Tip icon={Mic}>
                <strong>Record the grandchildren.</strong> A child reading a bedtime story, singing a song from school or telling a joke, saved somewhere the grandparent can play it again.
              </Tip>
              <Tip icon={Music}>
                <strong>Make a playlist.</strong> Dementia UK suggests a personalised music playlist. Fill it with the songs from their wedding, their teens and their first dance.
              </Tip>
              <Tip icon={Heart}>
                <strong>Record them.</strong> The voice gift that lasts longest goes the other way: ask a grandparent to tell one story and record it. Our{' '}
                <Link href="/guides/questions-to-ask-your-grandparents">questions to ask your grandparents</Link> are grouped by decade.
              </Tip>
            </Tips>
          </GuideSection>

          <GuideSection
            title={
              <>
                What about <Accent tone="pink">gifts of time?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Dementia UK says that whatever the stage of dementia, “the best gift you can give is quality time together”, and suggests a trip to a special place, such as a park they love, a zoo, the cinema or the theatre (some run screenings for people with dementia and other disabilities). Age UK Norfolk’s pack suggests sharing a favourite activity: cooking, gardening, a card game or a favourite film.
              </p>
              <p>
                Turn either into a gift by putting a date on it: a homemade voucher for Sunday lunch, a day out, or an afternoon going through old photos together with a recorder running.
              </p>
            </Prose>
          </GuideSection>

          <PullQuote>
            A book on the side table gets opened.{' '}
            <Accent tone="blue">A folder on a phone rarely does.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                Gifts for grandparents <Accent tone="pink">who live far away.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Ofcom found that 74% of UK online adults used WhatsApp every day in May&nbsp;2025, up from 64% a year earlier. If your grandparents are among them, small, regular things travel well:
              </p>
            </Prose>
            <Tips>
              <Tip icon={Mic}>A weekly voice note from the grandchildren, with one piece of news each.</Tip>
              <Tip icon={Frame}>
                A digital photo frame. Dementia UK describes it as a framed screen that shows photos as a slideshow, and family and friends can send new photos to it.
              </Tip>
              <Tip icon={Video}>A video call at the same time every week, so it becomes part of the routine.</Tip>
              <Tip icon={Mail}>For grandparents without a smartphone, printed photos and letters by post.</Tip>
            </Tips>
          </GuideSection>

          <GuideSection
            title={
              <>
                Gifts for a grandparent <Accent tone="pink">in a care home.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                The oldest generation is growing: the ONS estimates that 625,000 people in the UK were aged 90 or over in 2024, up 53.7% since 2004. If a grandparent or great-grandparent has moved into a care home, Dementia UK suggests reminiscence gifts such as photobooks with large prints and captions, or memory boxes with simple items that link to pleasant memories. Ask the home how much space there is before buying anything large.
              </p>
              <p>
                A life story is worth making here too. Dementia UK calls it a “fact file” about the person, to share with family, friends and carers, and says it is particularly helpful when someone has a new carer, is moving into a care home or is in hospital.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                When is <Accent tone="pink">Grandparents’ Day?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                In the UK, Grandparents’ Day falls on the first Sunday of October, and has since October&nbsp;2008. Age UK Norfolk explains that Age Concern introduced the day in the UK in 1990, borrowing it from America, where Marian McQuade wanted a day for grandparents after finding that many nursing home residents had no visitors.
              </p>
              <p>
                The US Census Bureau records that McQuade began her campaign in 1970, and that in 1978 President Carter signed a proclamation making the first Sunday after Labor Day National Grandparents Day. Age UK Norfolk adds that West Virginia had recognised the day first, in 1973.
              </p>
            </Prose>
            <QuestionSets>
              <QuestionSet icon={CalendarHeart} title="The next dates" questions={NEXT_DATES} tone="orange" />
            </QuestionSets>
          </GuideSection>

          <GuideSection
            title={
              <>
                How Ancestorii <Accent tone="pink">can help.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                If the gift is a printed one, Ancestorii turns the family’s photos into a{' '}
                <Link href="/memory-books">Memory Book</Link>: an A4 landscape hardcover with 24, 36 or 48 printed pages, from £44.99 plus delivery. For the wall there is a{' '}
                <Link href="/canvas-prints">Memory Canvas</Link> or an{' '}
                <Link href="/acrylic-prints">Acrylic Print</Link>, both from £99.99 plus delivery (the six-foot Heritage canvas ships to UK addresses only). Prints ship to 20 countries, standard delivery takes 10 to 14&nbsp;working&nbsp;days, and Premium families, at £3.99 a month, get 10% off.
              </p>
            </Prose>
            {/* Alison's photo is only 651px wide, so its frame is never wider than that
                (it would turn soft); centred in the reading column. */}
            <div style={{ maxWidth: 651, marginInline: 'auto' }}>
              <GuideFigure
                src="/Testimonial2.png"
                alt="Alison and her dad holding his printed Ancestorii Memory Book"
                label="Alison · Nevada, US"
                color="var(--c1)"
                position="50% 30%"
              />
            </div>
            <Prose>
              <p>
                Alison made a Memory Book for her dad from years of family photos. “I walked past my dad’s room and caught him looking through his memory book again,” she says. “That’s the third time this week.”
              </p>
              <p>
                The gift that keeps going costs nothing. Invite your grandparents into a private family space, then send them questions about their own life from the app, one at a time: any of 46 ready-made questions, or one you write. They answer in the free iPhone or Android app, and each answer becomes a memory the whole family can see. Here is{' '}
                <Link href="/features/family-questions">how family questions work</Link>.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">grandparent gifts.</Accent>
              </>
            }
          >
            <FaqList items={FAQ_PLAIN} variant="open" />
          </GuideSection>

          <div style={SECTION_GAP}>
            <Sources items={SOURCES} />
          </div>
          <div style={STACK_GAP}>
            <AuthorBox updated="17 October 2026" />
          </div>
        </GuideArticle>

        <GuideCta
          title={
            <>
              The family’s story,
              <br />
              <Accent tone="pink">in one place.</Accent>
            </>
          }
        >
          Gather the photos, the voices and the answers somewhere private the whole family can add to.
        </GuideCta>
      </SiteShell>
    </>
  );
}
