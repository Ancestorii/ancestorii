import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Briefcase, Heart, House, Lightbulb, Luggage, Search } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { GuideFigure, QuestionSet, QuestionSets, Step, Steps, Tip, Tips } from '../_components/GuideBlocks';

const PATH = '/guides/questions-to-ask-your-grandparents';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Questions to Ask Your Grandparents, by Decade';
const HEADLINE = 'Questions to ask your grandparents, decade by decade';
const DESCRIPTION =
  'Rationing, National Service, the 1953 Coronation, Decimal Day: questions to ask your grandparents, tied to moments they lived through, and how to ask.';
const PUBLISHED = '2026-10-17';
const CRUMB = 'Questions to Ask Your Grandparents';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Questions to ask your grandparents' }],
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
    q: 'What should I ask my grandparents about their childhood?',
    a: 'Questions they can picture: the house they grew up in, room by room, what was on the table on a Sunday, their school and favourite teacher, what they did on a Saturday and who lived next door. If they grew up in Britain in the 1940s or early 1950s, ask about the ration book: food rationing ran from January\u00a01940 until 1954.',
  },
  {
    q: 'Is it OK to ask grandparents about the war?',
    a: 'Yes, if you ask gently and let them decide how much to say. Start with everyday life, such as rationing or school, before anything harder, and tell them they can skip any question. Some people want to talk about it at last; others don’t, and that is their choice.',
  },
  {
    q: 'How many questions should I ask at once?',
    a: 'One at a time, with time to answer. In a sit-down conversation, one theme is plenty for an afternoon. If you send questions by message or app, send one, reply to the answer, then send the next.',
  },
  {
    q: 'How do I record my grandparents’ answers?',
    a: 'Ask first, then record in a quiet room. The Oral History Society recommends a recorder with a tie-clip microphone saving uncompressed WAV files, and doesn’t recommend phones. A voice note on your phone is still far better than no recording at all.',
  },
  {
    q: 'What if my grandparents don’t like talking about the past?',
    a: 'Start small and concrete: a photo, a recipe, a song. Ask about other people, such as ‘What was your mum like?’, before asking about them. Don’t push, because some memories are painful. Answering one question in their own time can feel easier than being interviewed.',
  },
];

const KEY_FACTS = [
  <>
    Food rationing began in <strong>January&nbsp;1940</strong> and ended completely in <strong>1954</strong>;
    meat came off ration last (Imperial War Museums).
  </>,
  <>
    <strong>National Service</strong> applied to able-bodied men aged 17 to 21 from <strong>1949</strong>.
    The last National Serviceman was discharged on <strong>14&nbsp;June&nbsp;1963</strong>.
  </>,
  <>
    The Coronation on <strong>2&nbsp;June&nbsp;1953</strong> was the first coronation service to be televised,
    watched by <strong>27&nbsp;million</strong> people in the UK.
  </>,
  <>
    The <strong>Empire Windrush</strong> docked at Tilbury on <strong>21&nbsp;June&nbsp;1948</strong>, and its
    passengers came ashore the next day.
  </>,
  <>
    <strong>Decimal Day</strong> was <strong>15&nbsp;February&nbsp;1971</strong>, when the pound went from 240&nbsp;pennies to 100 (Royal Mint).
  </>,
  <>
    The <strong>1939 Register</strong> recorded around 40&nbsp;million people in England and Wales and was
    used to issue identity cards and ration books.
  </>,
];

// Six questions in each set, written for this guide (none repeat the parents guide).
const SETS = {
  childhood: [
    'Can you walk me round the house you grew up in, room by room?',
    'What came on the ration, and what did you miss most?',
    'Did your family grow vegetables or keep hens?',
    'Who was your favourite teacher, and why?',
    'What did you do on a Saturday with a few pennies?',
    'Who lived next door, and what were they like?',
  ],
  work: [
    'Did you or your brothers do National Service? Where were you sent?',
    'How did you get your first job, and what did you spend your first wages on?',
    'Where did you watch the Coronation, and whose television was it?',
    'Was there a street party where you lived? What was on the tables?',
    'Where did you go dancing, and what music was playing?',
    'What did your parents make of the way young people dressed?',
  ],
  arriving: [
    'What do you remember about the day you left?',
    'What did you pack, and what do you wish you had brought?',
    'Who met you when you arrived, and where did you sleep the first night?',
    'What surprised you most about Britain?',
    'What did you keep from home: food, songs, a language, a saying?',
    'Who did you write to back home, and what did you tell them?',
  ],
  family: [
    'Where did you go on your first date, and who paid?',
    'When did you know you would marry them?',
    'What was your first home together like, and what did it cost?',
    'What do you remember about bringing your first baby home?',
    'How did you get on when the money changed in 1971?',
    'What did a loaf, a pint of milk or the bus cost before decimal money?',
  ],
  lessons: [
    'What did your generation get right that mine has forgotten?',
    'Who do you still miss, and what would you tell them?',
    'What did you do for the family that nobody ever thanked you for?',
    'What should every grandchild know how to do?',
    'Which family story do you hope we keep telling?',
    'What is the best decision you ever made?',
  ],
};

const SOURCES: Source[] = [
  {
    publisher: 'Imperial War Museums',
    title: 'What You Need To Know About Rationing In The Second World War',
    href: 'https://www.iwm.org.uk/history/what-you-need-to-know-about-rationing-in-the-second-world-war',
    date: 'updated 2026',
  },
  {
    publisher: 'The National Archives',
    title: '1939 Register research guide',
    href: 'https://nationalarchives.gov.uk/help-with-your-research/research-guides/1939-register',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'National Army Museum',
    title: 'What was National Service?',
    href: 'https://nam.ac.uk/explore/what-was-national-service',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'The Royal Family',
    title: '50 facts about Queen Elizabeth II’s Coronation',
    href: 'https://www.royal.uk/50-facts-about-queen-elizabeth-iis-coronation',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'GOV.UK',
    title: 'Nation pays tribute to the Windrush Generation',
    href: 'https://www.gov.uk/government/news/nation-pays-tribute-to-the-windrush-generation',
    date: '22\u00a0June\u00a02021',
  },
  {
    publisher: 'The Royal Mint',
    title: 'Our story: 1900-2000',
    href: 'https://royalmint.com/brand/our-story/1900-2000',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Phys.org (from Emory University)',
    title: 'Children benefit if they know about their relatives, study finds',
    href: 'https://phys.org/news/2010-03-children-benefit-relatives.html',
    date: '4\u00a0March\u00a02010',
  },
  {
    publisher: 'Emory University',
    title: 'How family stories help children weather hard times',
    href: 'https://news.emory.edu/stories/2020/04/how-family-stories-help-children-weather-hard-times',
    date: '29\u00a0April\u00a02020',
  },
  {
    publisher: 'Oral History Society',
    title: 'Interviewing',
    href: 'https://ohs.org.uk/for-beginners/interviewing/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Oral History Society',
    title: 'Choosing the right equipment',
    href: 'https://ohs.org.uk/for-beginners/equipment/',
    date: 'accessed October\u00a02026',
  },
];

// Room above the key facts and the author box, and above the sources (a section's step).
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function QuestionsToAskGrandparentsPage() {
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
              Questions to ask your grandparents,{' '}
              <br />
              <Accent>decade by decade.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              The best questions to ask your grandparents are specific and open: about the house they grew up in, rationing and school, their first job, how they met, and the days the whole country shared, like the Coronation in 1953 or Decimal Day in 1971. Ask one at a time, and record the answers.
            </Lead>
            <p>
              The sets below follow the decades many British grandparents grew up in, with each date checked against sources including the Imperial War Museums, the National Army Museum, the Royal Mint and The National Archives. If your family came to Britain from somewhere else, there is a set for that too.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <GuideSection
            title={
              <>
                Why ask your <Accent tone="pink">grandparents now?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Because what they know often exists nowhere else, and it matters to the people who come after. Emory University psychologists Robyn Fivush and Marshall Duke asked 66 teenagers aged 14 to 16 twenty yes-or-no questions, their ‘Do You Know’ scale, about things like how their parents met and where they grew up. Those who knew more about their extended family showed higher emotional well-being, though the researchers cautioned that more research was needed before drawing firm conclusions.
              </p>
              <p>
                In another Emory study, which began just before 9/11 and ran for two years, children aged 10 to 12 coped better when their families talked about difficult events in more coherent, emotionally open ways. They had better self-esteem, higher social competence and less anxiety.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Growing up in the <Accent tone="pink">1940s and 50s.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                If your grandparents were children in the 1940s or early 1950s, rationing shaped every meal. The Imperial War Museums explains that food rationing began in January&nbsp;1940 and that every man, woman and child had a ration book. Sugar, meat, fats, bacon and cheese came by coupon, tinned goods, dried fruit, cereals and biscuits on points, and the push to grow your own became known as ‘Dig for Victory’. Meat was the last item to come off ration, and food rationing ended completely in 1954.
              </p>
              <p>
                Behind the ration books sat the 1939 Register, taken on 29&nbsp;September&nbsp;1939. The National Archives says it recorded around 40&nbsp;million people in England and Wales and was used to produce identity cards and, from January&nbsp;1940, ration books.
              </p>
            </Prose>
            <QuestionSets>
              <QuestionSet icon={House} title="Home, school and rationing" questions={SETS.childhood} />
            </QuestionSets>
            <Tips>
              <Tip icon={Search}>
                The 1939 Register is free to search on Findmypast and Ancestry, with a charge to view full entries. Anyone born less than 100&nbsp;years ago stays closed unless they are known to have died, but your grandparents’ parents, with their address and jobs, are worth bringing to the conversation.
              </Tip>
            </Tips>
          </GuideSection>

          <GuideSection
            title={
              <>
                Leaving school in the <Accent tone="pink">1950s and 60s.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                From 1949, the National Army Museum explains, National Service applied to all able-bodied men aged 17 to 21. It began at 18&nbsp;months, rose to two years in 1950 during the Korean War, and took more than 2&nbsp;million men into the Army, the Royal Navy or the Royal Air Force.
              </p>
              <p>
                Some saw action in Korea and Malaya, others served in Kenya or Cyprus, and large numbers in reserved occupations, from agricultural workers to clergymen, were excused. The last National Serviceman was discharged on 14&nbsp;June&nbsp;1963.
              </p>
              <p>
                Then there was the day almost everyone remembers. The royal family’s website says the Coronation on 2&nbsp;June&nbsp;1953 was the first coronation service to be televised: 27&nbsp;million people in the UK watched on television, 11&nbsp;million listened on the radio, and thousands more celebrated with street parties.
              </p>
            </Prose>
            <QuestionSets>
              <QuestionSet icon={Briefcase} title="Work, National Service and the Coronation" questions={SETS.work} tone="blue" />
            </QuestionSets>
          </GuideSection>

          <GuideSection
            title={
              <>
                Arriving and <Accent tone="pink">settling in Britain.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Many grandparents grew up somewhere else entirely. GOV.UK records that the Empire Windrush docked at Tilbury on 21&nbsp;June&nbsp;1948 and its passengers came ashore a day later, on 22&nbsp;June, which is why that date became Windrush Day, first marked nationally in 2019. These questions work for anyone who came to Britain, whether from the Caribbean, Ireland, South Asia, Hong Kong, Poland or anywhere else.
              </p>
            </Prose>
            <QuestionSets>
              <QuestionSet icon={Luggage} title="Arriving and settling" questions={SETS.arriving} tone="orange" />
            </QuestionSets>
          </GuideSection>

          <GuideSection
            title={
              <>
                Love, children and <Accent tone="pink">Decimal Day.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Then came weddings, first homes and children, and a day that changed every price in the shops. The Royal Mint dates Decimal Day to 15&nbsp;February&nbsp;1971, when the pound changed from 240&nbsp;pennies to 100. The Mint had moved from Tower Hill in London to a new site at Llantrisant in South Wales, and its first big job there was making the billions of coins decimalisation needed.
              </p>
            </Prose>
            <QuestionSets>
              <QuestionSet icon={Heart} title="Love, family and money" questions={SETS.family} tone="aqua" />
            </QuestionSets>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">what they’ve learned.</Accent>
              </>
            }
          >
            <Prose>
              <p>Save these for later, once the stories are flowing.</p>
            </Prose>
            <QuestionSets>
              <QuestionSet icon={Lightbulb} title="Looking back" questions={SETS.lessons} />
            </QuestionSets>
          </GuideSection>

          <PullQuote>
            One good question{' '}
            <Accent tone="blue">can fill a whole afternoon.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                How do you ask, <Accent tone="pink">and keep the answers?</Accent>
              </>
            }
          >
            <Steps>
              <Step number="01" title="Ask one question at a time.">
                <p>‘Tell me about your childhood’ is too big to answer on the spot. ‘What was on the table on a Sunday?’ can be answered in a minute, and it usually leads somewhere.</p>
              </Step>
              <Step number="02" title="Bring something to hold.">
                <p>A ration book, an old shilling, a wedding photo or their family’s entry in the 1939 Register gives them something to react to.</p>
              </Step>
              <Step number="03" title="Follow up with why.">
                <p>The Oral History Society suggests exploring motives and feelings with ‘Why?’ and ‘How did you feel?’. Then wait: the pause is often where the detail comes.</p>
              </Step>
              <Step number="04" title="Record it, with permission.">
                <p>For a proper sit-down interview, the Oral History Society recommends a recorder with a tie-clip microphone saving uncompressed WAV files rather than a phone.</p>
              </Step>
            </Steps>
            <Prose>
              <p>
                Our guide to{' '}
                <Link href="/guides/how-to-interview-your-grandparents">interviewing your grandparents</Link> covers equipment and consent, and{' '}
                <Link href="/guides/questions-to-ask-your-parents-about-their-life">questions to ask your parents</Link> has thirty more for the generation in between.
              </p>
            </Prose>
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
                The Ancestorii app has 46 ready-made questions in 10 chapters, from Growing Up to Music &amp; Hobbies, including ‘Picture Sunday dinner when you were growing up. What was it like?’ and ‘Every family came from somewhere before here. Do you know where ours started?’. You can also write your own, so any question on this page will do.
              </p>
              <p>
                Send one from the app as a time-limited link. Your grandparent answers in the free iPhone or Android app, you get an email when they do, and the answer becomes a memory in your family’s private feed, where cousins can add their own version of the same moment. Sending a question can also invite them into your family space: see{' '}
                <Link href="/features/family-questions">how family questions work</Link>. If they don’t use a smartphone, ask in person and add the answer yourself, with a voice note of them telling it.
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
                Written answers and photos can also go into a printed{' '}
                <Link href="/memory-books">Memory Book</Link>, from £44.99 plus delivery. Alison made one for her dad from years of family photos.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">asking grandparents.</Accent>
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
              Ask one question
              <br />
              <Accent tone="pink">while they can.</Accent>
            </>
          }
        >
          Keep every answer in one private place the whole family can add to.
        </GuideCta>
      </SiteShell>
    </>
  );
}
