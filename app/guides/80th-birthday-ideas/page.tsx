import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  BookOpen,
  CalendarHeart,
  Coffee,
  Ear,
  Images,
  Mail,
  MapPin,
  Mic,
  Music,
  Phone,
  Users,
} from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import {
  GuideFigure,
  Point,
  Points,
  QuestionSet,
  QuestionSets,
  Step,
  Steps,
  Tip,
  Tips,
} from '../_components/GuideBlocks';

const PATH = '/guides/80th-birthday-ideas';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = '80th Birthday Ideas That Celebrate a Whole Life';
const HEADLINE = '80th birthday ideas that celebrate a whole life';
const DESCRIPTION =
  '80th birthday ideas: a memory book of eight decades, letters from the family, a party built around their stories, and which official cards you can request.';
const PUBLISHED = '2026-10-17';
const CRUMB = '80th Birthday Ideas';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: '80th birthday ideas' }],
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
    q: 'What do you buy someone for their 80th birthday?',
    a: 'Something about their life rather than another object: a book of photos and stories from all eight decades, written memories from the family, a framed photo of every generation, a playlist of the songs from their teens, or a day back at a place that mattered to them.',
  },
  {
    q: 'How do I make an 80th birthday memory book?',
    a: 'Ask the whole family for photos about six weeks ahead and give each decade of their life its own section. Scan prints at 300\u00a0dpi, and at 400 or 600\u00a0dpi for enlargements, as the Library of Congress advises, caption each one with names, a place and a year, and order at least three weeks before the party.',
  },
  {
    q: 'Can you get a birthday card from the King for an 80th?',
    a: 'No. The King’s birthday cards are sent for 100th and 105th birthdays and every birthday after that, and for 60th, 65th and 70th wedding anniversaries and every anniversary after that. A 100th usually needs no application, because the Department for Work and Pensions lets the Anniversaries Office know.',
  },
  {
    q: 'How do I request a birthday card from the White House?',
    a: 'Use the Presidential Greetings form at whitehouse.gov/greetings, which lists birthdays among its occasions and asks for the date and the age. Congressional offices, such as Representative Delia Ramirez’s, ask for requests to arrive at least six weeks before the date.',
  },
  {
    q: 'What can I do for an 80th birthday that’s low-key?',
    a: 'Lunch at a favourite place with the few people they would choose, letters from the family to read on the day, a video call from relatives far away, or an afternoon going through old photos together with a recorder running, so their stories are kept.',
  },
];

const KEY_FACTS = [
  <>
    Someone turning 80 in 2026 was born in <strong>1946</strong>: six or seven at the Coronation on 2&nbsp;June&nbsp;1953, the first ever televised, which <strong>27&nbsp;million</strong> people in the UK watched.
  </>,
  <>
    The King’s birthday cards start at <strong>100</strong>, then go out at 105 and every year after. The UK
    had <strong>16,600</strong> people aged 100 or over in 2024 (ONS).
  </>,
  <>
    In the US, presidential greetings are requested through the White House’s online form, and congressional
    offices ask for <strong>six weeks’</strong> notice.
  </>,
  <>
    The Library of Congress advises scanning 4×6 and 5×7&nbsp;inch prints at <strong>300&nbsp;dpi</strong>, and at 400
    or 600&nbsp;dpi to enlarge them to 8×10 or more.
  </>,
  <>
    RNID says <strong>almost 80%</strong> of people over 70 will have hearing loss: plan speeches for a quiet
    room.
  </>,
];

const DECADES = [
  'Birth to 9 (1946 to 1956): baby photos, first school, the Coronation in 1953',
  '10 to 19 (1956 to 1966): school photos, first jobs, first records',
  '20 to 29 (1966 to 1976): leaving home, courting, weddings',
  '30 to 39 (1976 to 1986): first homes, young children, holidays',
  '40 to 49 (1986 to 1996): work, celebrations, family milestones',
  '50 to 59 (1996 to 2006): weddings, new arrivals, travel',
  '60 to 69 (2006 to 2016): retirement, hobbies, grandchildren',
  '70 to 79 (2016 to 2026): the family as it is today',
];

const SOURCES: Source[] = [
  {
    publisher: 'The Royal Family',
    title: 'Anniversary messages',
    href: 'https://www.royal.uk/anniversary-messages',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'The Royal Family',
    title: '50 facts about Queen Elizabeth II’s Coronation',
    href: 'https://www.royal.uk/50-facts-about-queen-elizabeth-iis-coronation',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Office for National Statistics',
    title: 'Estimates of the very old, including centenarians, UK: 2002 to 2024',
    href: 'https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/ageing/bulletins/estimatesoftheveryoldincludingcentenarians/latest',
    date: '21\u00a0October\u00a02025',
  },
  {
    publisher: 'The White House',
    title: 'Presidential Greetings',
    href: 'https://www.whitehouse.gov/greetings/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Office of Representative Delia Ramirez, US House of Representatives',
    title: 'Presidential Greetings',
    href: 'https://ramirez.house.gov/services/presidential-greetings',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Scanning Your Personal Collections (Personal Digital Archiving series)',
    href: 'https://www.digitalpreservation.gov/personalarchiving/documents/PA_scanning.pdf',
  },
  {
    publisher: 'Official Charts',
    title: 'The first ever Official Singles Chart revisited',
    href: 'https://www.officialcharts.com/chart-news/the-first-ever-official-singles-chart-revisited-__2544/',
    date: '14\u00a0November\u00a02012',
  },
  {
    publisher: 'RNID',
    title: 'Prevalence of deafness and hearing loss',
    href: 'https://rnid.org.uk/what-we-do/data-and-evidence/deafness-and-hearing-loss-prevalence/',
    date: 'updated 18\u00a0August\u00a02026',
  },
  {
    publisher: 'Oral History Society',
    title: 'For family historians',
    href: 'https://ohs.org.uk/for-family-historians/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Emory University',
    title: 'How family stories help children weather hard times',
    href: 'https://news.emory.edu/stories/2020/04/how-family-stories-help-children-weather-hard-times',
    date: '29\u00a0April\u00a02020',
  },
];

// Room above the key facts and the author box, and above the sources (a section's step).
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function EightiethBirthdayIdeasPage() {
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
              80th birthday ideas{' '}
              <br />
              <Accent>that celebrate a whole life.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              The best 80th birthday ideas celebrate the life as much as the day: a book of photos and stories from all eight decades, messages from the family, a party built around their favourite people, places and music, and time for them to tell their own stories. If you are hoping for an official card, the King’s birthday messages start at 100, not 80.
            </Lead>
            <p>
              Someone turning 80 in 2026 was born in 1946, so a book of their life runs from post-war baby photos to this year’s. The ideas below draw on advice from the Library of Congress, RNID and the Oral History Society. Most cost little but time; anything printed needs three or four weeks.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <GuideSection
            title={
              <>
                What do you give <Accent tone="pink">someone turning 80?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                By 80, most people own what they need. What they rarely have is their whole life in one place. The gifts that land are about the life, and the family can make most of them together:
              </p>
            </Prose>
            <Points>
              <Point icon={BookOpen} title="A book of their eight decades.">
                Photos from every decade of their life, with names, places and years in the captions, ending with the family as it is now. How to make one is below.
              </Point>
              <Point icon={Mail} title="Eighty memories.">
                Ask children, grandchildren, old friends and neighbours to write down one memory of them each, and collect the cards in a box or a book. Eighty is a good target, and nobody has to write much.
              </Point>
              <Point icon={Users} title="Every generation in one photo.">
                Ask a photographer, or a patient grandchild, for ten minutes at the party, and frame the result.
              </Point>
              <Point icon={MapPin} title="A day back.">
                Take them to the street, school, seaside town or dance hall where a big moment of their life happened, with a camera and a notebook.
              </Point>
              <Point icon={Music} title="The soundtrack of their youth.">
                The first UK singles chart was published in NME on 14&nbsp;November&nbsp;1952, when someone born in 1946 was five or six, and the Official Charts website lets you browse past charts by date. Make a playlist of the number ones from the weeks they turned 16 and 21.
              </Point>
            </Points>
            <Prose>
              <p>
                Most of our <Link href="/guides/gifts-for-grandparents">gifts for grandparents</Link> suit an 80th too.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you make a memory book <Accent tone="pink">of eight decades?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Give each decade of their life its own section and let the photos lead. For someone born in 1946, the decades fall like this, with a few things to look for in each:
              </p>
            </Prose>
            <QuestionSets>
              <QuestionSet icon={CalendarHeart} title="Their eight decades" questions={DECADES} tone="blue" />
            </QuestionSets>
            <Steps>
              <Step number="01" title="Ask everyone for photos six weeks ahead.">
                <p>The photos from the 1950s and 60s are usually in a sibling’s loft or a cousin’s album. Tell people which decades you are missing, and ask for the story behind each photo as well as the picture.</p>
              </Step>
              <Step number="02" title="Scan the prints properly.">
                <p>
                  The Library of Congress advises scanning 4×6 and 5×7&nbsp;inch prints at 300&nbsp;dpi, and at 400 or 600&nbsp;dpi to enlarge them to 8×10&nbsp;inches or more, which a full-page photo in a book may need. Our guide to{' '}
                  <Link href="/guides/how-to-digitize-old-photos">digitising old photos</Link> covers the rest.
                </p>
              </Step>
              <Step number="03" title="Caption every photo.">
                <p>
                  Names from left to right, the place and the year. Ask the birthday person quietly, before the day: they are the one who knows who the girl in the hat is. Our guide to{' '}
                  <Link href="/guides/what-to-write-in-a-memory-book">what to write in a memory book</Link> helps with the words.
                </p>
              </Step>
              <Step number="04" title="Add papers, not just photos.">
                <p>A ration book, a wedding invitation, an old payslip or a letter, scanned at the same settings, often says as much as a photo.</p>
              </Step>
              <Step number="05" title="Order three weeks ahead.">
                <p>Printed books are made to order and posted, so leave at least three weeks before the party.</p>
              </Step>
            </Steps>
            <Prose>
              <p>In the book Alison made for her dad, an old black-and-white family photo sits opposite a document from 1949.</p>
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
          </GuideSection>

          <GuideSection
            title={
              <>
                What makes a good <Accent tone="pink">80th birthday party?</Accent>
              </>
            }
          >
            <Prose>
              <p>Build it around their people and their stories rather than a theme.</p>
            </Prose>
            <Tips>
              <Tip icon={Users}>
                <strong>Invite someone from every decade.</strong> A school friend, an old colleague, a neighbour from the first house. Ask each guest to bring one photo and one memory written on a card.
              </Tip>
              <Tip icon={Images}>
                <strong>Set out the photos by decade.</strong> Eight piles of prints or eight frames, from 1946 to now, and watch who stops at which.
              </Tip>
              <Tip icon={Music}>
                <strong>Play their music.</strong> The chart playlist from above, kept low enough to talk over.
              </Tip>
              <Tip icon={Ear}>
                <strong>Plan for hearing.</strong> RNID says almost 80% of people over the age of 70 will have hearing loss. Choose a room without echo, turn the music off for speeches, use a microphone and seat the birthday person where they can see faces.
              </Tip>
              <Tip icon={Mic}>
                <strong>Keep the speeches short.</strong> Two or three speakers for a couple of minutes each, then offer the birthday person the microphone.
              </Tip>
            </Tips>
          </GuideSection>

          <PullQuote>
            Eighty years of stories.{' '}
            <Accent tone="blue">Make sure someone is writing them down.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                What if they <Accent tone="pink">don’t want a fuss?</Accent>
              </>
            }
          >
            <Prose>
              <p>Plenty of people would rather skip the party. A quiet day can still mark eight decades:</p>
            </Prose>
            <Tips>
              <Tip icon={Coffee}>Lunch at a favourite place, with the four or five people they would choose.</Tip>
              <Tip icon={Mail}>Letters from the family, read aloud at the table or left for them to read later.</Tip>
              <Tip icon={Phone}>A video call from relatives who can’t be there, timed for the cake.</Tip>
              <Tip icon={Mic}>
                An afternoon with the photo box and a recorder running. The Oral History Society suggests open questions, ones which need more than a yes or no answer. Our{' '}
                <Link href="/guides/questions-to-ask-your-grandparents">questions to ask your grandparents</Link> are grouped by decade.
              </Tip>
            </Tips>
            <Prose>
              <p>
                That last idea is worth doing for the youngest guests too. Emory University psychologists Robyn Fivush and Marshall Duke found that children whose families talked about difficult times in “more coherent and emotionally open ways” coped better over two years, with better self-esteem and less anxiety.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Can you get an official card <Accent tone="pink">for an 80th birthday?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Not from the King. The Royal Family’s Anniversaries Office sends cards for 100th and 105th birthdays and every birthday after, and for 60th, 65th and 70th wedding anniversaries and every anniversary after. A 100th usually needs no application, because the Department for Work and Pensions’ Centenarian Team tells the office who is approaching the birthday, but wedding anniversaries always need one.
              </p>
              <p>
                More people are reaching those milestones. The ONS estimates that 625,000 people in the UK were aged 90 or over in 2024, up 53.7% since 2004, and that the number of centenarians doubled over the same twenty years, from 8,300 to 16,600.
              </p>
              <p>
                In the US, presidential greetings are requested through the White House’s online form at whitehouse.gov/greetings. Congressional offices, such as Representative Delia Ramirez’s, describe birthday greetings as available from the 80th birthday (the 70th for veterans) and ask for requests to arrive six weeks before the date. The form itself, checked in October&nbsp;2026, accepts any adult’s birthday, so an 80th qualifies either way.
              </p>
            </Prose>
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
                If the gift is a book, Ancestorii lets the whole family build it together. Invite everyone into one private family space, by email, a shareable link or a join code, and ask them to add their photos to the shared Library. Then design a <Link href="/memory-books">Memory Book</Link> on the website: an A4 landscape hardcover. A Legacy has 46 memory pages (48 printed) for £64.99 plus delivery, which gives each decade five or six pages, and A Story has 36 printed pages for £54.99 plus delivery.
              </p>
              <p>
                You can preview the book spread by spread and download a free PDF before you order, and the optional writing help can suggest chapter introductions for you to edit. Each order prints one copy. Prints ship to 20 countries, and standard delivery takes 10 to 14&nbsp;working&nbsp;days, so order about three weeks ahead.
              </p>
              <p>
                Alison, whose book for her dad is pictured above, put it simply: “I walked past my dad’s room and caught him looking through his memory book again. That’s the third time this week.”
              </p>
              <p>
                After the party, keep the stories coming: send them questions from the Ancestorii app, any of 46 ready-made ones or your own. They answer in the free iPhone or Android app, and each answer becomes a memory the whole family can see. Here is{' '}
                <Link href="/features/family-questions">how family questions work</Link>.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">80th birthdays.</Accent>
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
              Their eighty years,
              <br />
              <Accent tone="pink">kept in one place.</Accent>
            </>
          }
        >
          Gather the photos, the memories and their voice somewhere private the whole family can add to.
        </GuideCta>
      </SiteShell>
    </>
  );
}
