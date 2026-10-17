import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Baby, Bike, Car, Coins, Images, MessageCircle, Smile, Users, Wrench } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { GuideFigure, Point, Points, QuestionSet, QuestionSets } from '../_components/GuideBlocks';

const PATH = '/guides/questions-to-ask-your-dad';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Questions to Ask Your Dad About His Life';
const HEADLINE = 'Questions to ask your dad about his life, his dad and you';
const DESCRIPTION =
  'Questions to ask your dad about growing up, his father, work, becoming a parent and the stories he never tells, with Father’s Day ideas for asking them.';
const PUBLISHED = '2026-10-17';
const CRUMB = 'Questions to Ask Your Dad';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Questions to ask your dad' }],
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
    q: 'What should I ask my dad about his life?',
    a: 'Ask about the things he rarely brings up: what he got up to as a boy, his own dad and grandad, his first job and wage, and what changed when you were born. Specific questions work better than big ones. ‘What was your first car?’ will get further than ‘Tell me about your life.’',
  },
  {
    q: 'What are good questions to ask your dad on Father’s Day?',
    a: 'Questions about fatherhood: what his own dad was like, what he did differently on purpose, what he remembers about the day you were born and what he hopes you’ll remember about him. Father’s Day is the third Sunday in June in the UK and the US, which is 20\u00a0June in 2027.',
  },
  {
    q: 'My dad doesn’t like talking about himself: how do I start?',
    a: 'Start with things rather than feelings: his first car, his dad’s job, an old payslip or photo. Ask while you’re doing something together, such as driving or fixing something, and don’t push. Some dads find it easier to answer one question in writing, in their own time.',
  },
  {
    q: 'How do I record my dad’s stories?',
    a: 'Ask first, and explain what the recording is for. The Oral History Society suggests discussing the purpose before you start and asking open questions, ones that need more than a yes or no answer. Record somewhere quiet, write a short summary of what he covered and keep a copy somewhere safe.',
  },
  {
    q: 'What should I ask my dad about his own father?',
    a: 'What his dad did for a living, what he taught him, what they argued about and what he would ask him now. If his father was a young man in the late 1940s or the 1950s, ask whether he did National Service, which from 1949 applied to able-bodied men aged 17 to 21.',
  },
];

const KEY_FACTS = [
  <>
    Father’s Day was first celebrated in <strong>Spokane, Washington, on 19&nbsp;June&nbsp;1910</strong>, the idea
    of Sonora Smart Dodd (HistoryLink).
  </>,
  <>
    President Nixon signed <strong>P.L. 92-278</strong> on <strong>24&nbsp;April&nbsp;1972</strong>, making the
    third Sunday in June Father’s Day in the US. The UK keeps the same Sunday: <strong>20&nbsp;June</strong> in
    2027.
  </>,
  <>
    The average age of fathers in England and Wales was <strong>34.0</strong> in 2025, and it has been
    rising since 1976 (ONS).
  </>,
  <>
    A statutory right to <strong>two weeks’ paid paternity leave</strong> only arrived in{' '}
    <strong>2003</strong>, under the Employment Act 2002.
  </>,
  <>
    From <strong>1949</strong>, National Service applied to able-bodied men aged 17 to 21. The last
    National Serviceman was discharged on <strong>14&nbsp;June&nbsp;1963</strong>.
  </>,
  <>
    <strong>Decimal Day</strong>, 15&nbsp;February&nbsp;1971, changed the pound from 240&nbsp;pennies to 100 (Royal
    Mint).
  </>,
];

// Six questions in each set, written for dads (none repeat the parents guide).
const SETS = {
  growingUp: [
    'What did you and your friends get up to that your parents never found out about?',
    'What was the first thing you saved up for?',
    'Which teacher did you get on with, and which one couldn’t stand you?',
    'What did you want to be, and when did you stop wanting it?',
    'What was your first bike or car, and where did you go on it?',
    'What were you scared of as a boy?',
  ],
  hisDad: [
    'What did your dad do for a living, and did you ever see him at work?',
    'What did he teach you to do with your hands?',
    'Did your dad or grandad do National Service or serve in a war? Did they talk about it?',
    'What were you never allowed to do or say in front of him?',
    'What do you do that’s exactly like him?',
    'What would you ask him now, if you could?',
  ],
  work: [
    'How did you get your first job, and what was the first week like?',
    'What was in your first wage packet, and what did you spend it on?',
    'What did things cost before decimal money? Do you remember the day it changed?',
    'Who was the best boss you ever had, and what did they get right?',
    'Was there a job you turned down, or one you wish you’d taken?',
    'What worried you most about money when we were small?',
  ],
  becoming: [
    'How old were you when I was born, and did you feel ready?',
    'How much time did you get off work when I arrived?',
    'What went through your head the first time you held me?',
    'What did you do differently from your own dad, on purpose?',
    'What was the hardest part of being a dad when we were small?',
    'What did you hope I’d grow up to be?',
  ],
  you: [
    'What do you remember about the day I was born?',
    'What was I like as a toddler, in one story?',
    'What did we do together that I’m too young to remember?',
    'When were you proudest of me, and did you ever tell me?',
    'What did I get from you, good and bad?',
    'What do you want me to remember about you?',
  ],
};

const SOURCES: Source[] = [
  {
    publisher: 'HistoryLink.org',
    title: 'Father’s Day is conceived by Spokane’s Sonora Smart Dodd and celebrated for the first time in Spokane on June\u00a019, 1910 (Essay 9458)',
    href: 'https://www.historylink.org/File/9458',
    date: '17\u00a0June\u00a02010',
  },
  {
    publisher: 'US House of Representatives: History, Art & Archives',
    title: 'Father’s Day Becomes A National Holiday',
    href: 'https://history.house.gov/Historical-Highlights/1951-2000/Father-s-Day-Becomes-a-National-Holiday/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Office Holidays',
    title: 'Father’s Day in United Kingdom in 2027',
    href: 'https://www.officeholidays.com/holidays/united-kingdom/fathers-day',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Office for National Statistics',
    title: 'Births in England and Wales: 2025 (final rates)',
    href: 'https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/livebirths/bulletins/birthsummarytablesenglandandwales/2025finalrates',
    date: '8\u00a0September\u00a02026',
  },
  {
    publisher: 'legislation.gov.uk',
    title: 'Employment Act 2002: Explanatory Notes, paternity leave and Statutory Paternity Pay',
    href: 'https://www.legislation.gov.uk/ukpga/2002/22/notes/division/3/1',
    date: '2002',
  },
  {
    publisher: 'National Army Museum',
    title: 'What was National Service?',
    href: 'https://nam.ac.uk/explore/what-was-national-service',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'The Royal Mint',
    title: 'Our story: 1900-2000',
    href: 'https://royalmint.com/brand/our-story/1900-2000',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Emory University',
    title: 'How family stories help children weather hard times',
    href: 'https://news.emory.edu/stories/2020/04/how-family-stories-help-children-weather-hard-times',
    date: '29\u00a0April\u00a02020',
  },
  {
    publisher: 'Oral History Society',
    title: 'For family historians',
    href: 'https://ohs.org.uk/for-family-historians/',
    date: 'accessed October\u00a02026',
  },
];

// Room above the key facts and the author box, and above the sources (a section's step).
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function QuestionsToAskYourDadPage() {
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
              Questions to ask <Accent>your dad.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              Ask your dad about the stories he rarely tells: his childhood, his own father, his first jobs and what changed when you were born. Use specific, open questions, ask them side by side rather than face to face, and keep his answers in his own words.
            </Lead>
            <p>
              The questions below are written for dads. For a general list that suits both parents, see{' '}
              <Link href="/guides/questions-to-ask-your-parents-about-their-life">questions to ask your parents about their life</Link>. Dates and figures come from sources such as the National Army Museum, the Royal Mint, the Office for National Statistics and legislation.gov.uk, listed at the end.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <GuideSection
            title={
              <>
                Why ask your <Accent tone="pink">dad these questions?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Because the stories children grow up with seem to matter. In an Emory University study that began just before 9/11 and ran for two years, children aged 10 to 12 whose families told more coherent, emotionally open stories about hard times coped better over those two years. They had better self-esteem, higher social competence, higher-quality friendships and less anxiety and stress.
              </p>
              <p>
                And because many families have a handful of stories Dad always tells: the car that broke down, the boss he stood up to. The questions below go underneath those, to the parts nobody has thought to ask him about.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">growing up.</Accent>
              </>
            }
          >
            <Prose>
              <p>Start with places, people and things he can picture.</p>
            </Prose>
            <QuestionSets>
              <QuestionSet icon={Bike} title="Growing up" questions={SETS.growingUp} />
            </QuestionSets>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">his own dad and grandad.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Your dad may be the last person who remembers his father and grandfather at work and at home. If his father was a young man in the late 1940s or the 1950s, National Service may be part of the story. The National Army Museum explains that from 1949 it applied to all able-bodied men aged 17 to 21. It began at 18&nbsp;months, rose to two years in 1950 during the Korean War, and took in more than 2&nbsp;million men before the last National Serviceman was discharged on 14&nbsp;June&nbsp;1963.
              </p>
            </Prose>
            <QuestionSets>
              <QuestionSet icon={Users} title="His dad and grandad" questions={SETS.hisDad} tone="blue" />
            </QuestionSets>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">work and money.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Work can be the easiest way in, because it is about what he did rather than how he felt. Money is a good thread too. Decimal Day, 15&nbsp;February&nbsp;1971, changed the pound from 240&nbsp;pennies to 100, the Royal Mint records, so if he was earning or shopping before then, he will have known prices in shillings and pence.
              </p>
            </Prose>
            <QuestionSets>
              <QuestionSet icon={Coins} title="Work and money" questions={SETS.work} tone="orange" />
            </QuestionSets>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">becoming a dad.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Fathers are older than they used to be: the Office for National Statistics puts the average age of fathers in England and Wales at 34.0 in 2025, and says it has been rising since 1976. Time off has changed too. The Employment Act 2002 brought in a right to two weeks’ paid paternity leave from 2003, so if you were born before then, ask how much time he had off, and who decided.
              </p>
            </Prose>
            <QuestionSets>
              <QuestionSet icon={Baby} title="Becoming a dad" questions={SETS.becoming} tone="aqua" />
            </QuestionSets>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions only he can <Accent tone="pink">answer about you.</Accent>
              </>
            }
          >
            <Prose>
              <p>These are the stories only he can tell you.</p>
            </Prose>
            <QuestionSets>
              <QuestionSet icon={Smile} title="About you" questions={SETS.you} />
            </QuestionSets>
          </GuideSection>

          <PullQuote>
            He has told the funny stories a hundred times.{' '}
            <Accent tone="blue">Ask for the ones he hasn’t.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                When to ask: <Accent tone="pink">Father’s Day and other moments.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Father’s Day began in Spokane, Washington. HistoryLink records that Sonora Smart Dodd, whose widowed father had raised her and her five younger brothers, had the idea in 1909, and that the first Father’s Day was celebrated there on 19&nbsp;June&nbsp;1910.
              </p>
              <p>
                In the US it became law when President Nixon signed P.L. 92-278 on 24&nbsp;April&nbsp;1972, designating the third Sunday in June, according to the US House of Representatives. The UK keeps the same Sunday, which is 20&nbsp;June in 2027.
              </p>
              <p>Father’s Day is a good excuse, but the best conversations often happen when you are doing something else together:</p>
            </Prose>
            <Points>
              <Point icon={Car} title="In the car.">
                Side by side, eyes on the road, a question can feel less like an interview.
              </Point>
              <Point icon={Wrench} title="Fixing something.">
                Ask how he learned to do it, and who taught him.
              </Point>
              <Point icon={Images} title="Over an old photo.">
                Ask what was happening just outside the frame.
              </Point>
              <Point icon={MessageCircle} title="One question by message.">
                Some dads answer best when they’ve had time to think it over.
              </Point>
            </Points>
          </GuideSection>

          <GuideSection
            title={
              <>
                How it <Accent tone="pink">helps.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                In the Ancestorii app you can send him one of 46 ready-made questions in 10 chapters, including Work &amp; Purpose and Music &amp; Hobbies, where one asks: ‘There’s always a song that brings someone straight to mind. Which one, and who?’ You can also write your own, so any question on this page will do.
              </p>
              <p>
                The question travels as a time-limited link. He answers in the free iPhone or Android app when he’s ready, and you get an email when he does; if he already uses the app and hasn’t answered after 24&nbsp;hours, he gets one reminder. His answer is saved as a memory in your family’s private My Family feed, where your brothers and sisters can add their own memory of the same moment. See{' '}
                <Link href="/features/family-questions">how family questions work</Link>.
              </p>
              <p>
                If he would rather talk than type, record him telling it and add it yourself, with the voice note attached. Our guide to{' '}
                <Link href="/guides/how-to-save-family-voices">capturing family voices</Link> explains why the sound of him is worth keeping.
              </p>
              <p>
                Alison, in Nevada, made a Memory Book for her dad from years of family photos. In her words: ‘I walked past my dad’s room and caught him looking through his memory book again. That’s the third time this week.’
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
                For Father’s Day, a printed <Link href="/memory-books">Memory Book</Link> is an A4 landscape hardcover of 24, 36 or 48&nbsp;pages, from £44.99 plus delivery, and a Memory Canvas starts at £99.99 plus delivery. Standard delivery is quoted at 10 to 14&nbsp;working&nbsp;days, so order at least three weeks ahead. For his parents’ generation, see{' '}
                <Link href="/guides/how-to-interview-your-grandparents">how to interview your grandparents</Link>, and for the other side of the family,{' '}
                <Link href="/guides/questions-to-ask-your-mum">questions to ask your mum</Link>.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">asking your dad.</Accent>
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
              Ask him a question
              <br />
              <Accent tone="pink">no one has asked.</Accent>
            </>
          }
        >
          Keep every answer in one private place your family can add to.
        </GuideCta>
      </SiteShell>
    </>
  );
}
