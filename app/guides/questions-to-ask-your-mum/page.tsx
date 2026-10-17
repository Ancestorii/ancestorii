import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Baby, Briefcase, Car, ChefHat, Heart, House, Images, Phone, Smile } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { GuideFigure, Point, Points, QuestionSet, QuestionSets } from '../_components/GuideBlocks';

const PATH = '/guides/questions-to-ask-your-mum';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Questions to Ask Your Mum About Her Life';
const HEADLINE = 'Questions to ask your mum about her life, her mum and you';
const DESCRIPTION =
  'Questions to ask your mum about her childhood, her own mother, work, becoming a parent and the years before you, with Mothering Sunday ideas for asking.';
const PUBLISHED = '2026-10-17';
const CRUMB = 'Questions to Ask Your Mum';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Questions to ask your mum' }],
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
    q: 'What should I ask my mum about her life?',
    a: 'Start with the parts you weren’t there for: the house she grew up in, her own mother and gran, her first job, falling in love and the day you were born. Specific, open questions work best. ‘What did your mum cook on a Sunday?’ usually gets a story, where ‘Tell me about your childhood’ gets a shrug.',
  },
  {
    q: 'What are good questions to ask your mum on Mothering Sunday?',
    a: 'Questions about mothering itself: what her own mum was like, what she was told to expect, what the day you were born was really like and why she chose your name. In the UK, Mothering Sunday is the fourth Sunday of Lent, which is 7\u00a0March in 2027. In the US, Mother’s Day is the second Sunday in May.',
  },
  {
    q: 'How do I ask my mum about difficult memories?',
    a: 'Gently, and on her terms. Tell her she can skip any question, start with everyday things before harder ones, and let her decide how much to say. If she goes quiet, wait rather than rushing to fill the silence, and leave it for another day if it’s too much.',
  },
  {
    q: 'How do I record my mum’s answers?',
    a: 'Ask first and explain what the recording is for, then record somewhere quiet. The Oral History Society suggests talking through the purpose before you start, and afterwards writing a short summary of the main topics and people mentioned. Copy the file somewhere safe the same day.',
  },
  {
    q: 'What if my mum lives far away?',
    a: 'Ask on a video call, or send one question at a time so she can answer when it suits her. In the Ancestorii app you can send her a question as a link: she answers in the free app on her phone, and you get an email when she has.',
  },
];

const KEY_FACTS = [
  <>
    Mothering Sunday falls on the <strong>fourth Sunday of Lent</strong> (Church of England), so it moves
    with Easter: in 2027 it is <strong>7&nbsp;March</strong>.
  </>,
  <>
    In the US, Mother’s Day is the <strong>second Sunday in May</strong>, set by a Joint Resolution
    approved on <strong>8&nbsp;May&nbsp;1914</strong>. In 2027 that is 9&nbsp;May.
  </>,
  <>
    The average age of mothers in England and Wales was <strong>31.1</strong> in 2025, and it has been
    rising since <strong>1976</strong> (ONS).
  </>,
  <>
    The <strong>Equal Pay Act 1970</strong> came into force on <strong>29&nbsp;December&nbsp;1975</strong>, the same
    day as the Sex Discrimination Act.
  </>,
  <>
    Most of the <strong>Statutory Maternity Pay</strong> regulations came into operation on{' '}
    <strong>6&nbsp;April&nbsp;1987</strong> (legislation.gov.uk).
  </>,
];

// Six questions in each set, written for mums (none repeat the parents guide).
const SETS = {
  childhood: [
    'What did your bedroom look like, and who did you share it with?',
    'Who were you closest to growing up: a sister, a cousin, a friend down the road?',
    'What did you get told off for most?',
    'What did you want to be when you grew up, and did anyone tell you that you couldn’t?',
    'What was the best present you had as a child, and who gave it to you?',
    'What did you do on a Saturday when you were twelve?',
  ],
  herMum: [
    'What was your mum like when you were small, and how did she change?',
    'What did she cook that you’ve never quite managed to make the same way?',
    'Which of her sayings do you still catch yourself using?',
    'Did your mum go out to work? What did she think about women working?',
    'What do you remember about your gran: her house, her hands, her voice?',
    'Is there anything you wish you’d asked your mum while you could?',
  ],
  work: [
    'What was your first job, and how did you get it?',
    'What did you do with your first wage? Did you hand some over at home?',
    'Did you ever find out a man was paid more than you for the same work?',
    'Did you go back to work after having me? Who decided?',
    'What help, if any, did you get when you took time off to have me?',
    'What has changed most for women since you were my age?',
  ],
  becoming: [
    'How old were you when you had me, and how did that compare with your friends?',
    'Who told you what to expect, and who turned out to be right?',
    'What was the hardest week of those first few months?',
    'What did you catch yourself doing that your own mum used to do?',
    'Who helped you most when we were small?',
    'What did you promise yourself you’d never do as a mum, and did you manage it?',
  ],
  you: [
    'What was the day I was born really like, from start to finish?',
    'Why did you choose my name, and what nearly was my name?',
    'What was I like as a baby, and what was my first word?',
    'What did I do as a child that still makes you laugh?',
    'When did you worry about me most?',
    'What do you see of yourself in me?',
  ],
};

const SOURCES: Source[] = [
  {
    publisher: 'The Church of England',
    title: 'Mothering Sunday, what are its origins in the Church?',
    href: 'https://www.churchofengland.org/node/25442/printable/print',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Office Holidays',
    title: 'Mothering Sunday in United Kingdom in 2027',
    href: 'https://www.officeholidays.com/holidays/united-kingdom/mothering-sunday',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'The American Presidency Project, UC Santa Barbara',
    title: 'Proclamation 1268: Mother’s Day, 1914',
    href: 'https://www.presidency.ucsb.edu/documents/proclamation-1268-mothers-day-1914',
    date: '9\u00a0May\u00a01914',
  },
  {
    publisher: 'Office for National Statistics',
    title: 'Births in England and Wales: 2025 (final rates)',
    href: 'https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/livebirths/bulletins/birthsummarytablesenglandandwales/2025finalrates',
    date: '8\u00a0September\u00a02026',
  },
  {
    publisher: 'University of Edinburgh, Gender Equalities at Work',
    title: '1975 Equal Pay and Equal Value',
    href: 'https://www.genderequalitiesat50.ed.ac.uk/?p=605',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'legislation.gov.uk',
    title: 'The Statutory Maternity Pay (General) Regulations 1986',
    href: 'https://www.legislation.gov.uk/uksi/1986/1960/made',
    date: '1986',
  },
  {
    publisher: 'Phys.org (from Emory University)',
    title: 'Children benefit if they know about their relatives, study finds',
    href: 'https://phys.org/news/2010-03-children-benefit-relatives.html',
    date: '4\u00a0March\u00a02010',
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

export default function QuestionsToAskYourMumPage() {
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
              Questions to ask <Accent>your mum.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              Ask your mum about the parts of her life you weren’t there for: her childhood, her own mother, the work she did before and after children, and what the day you were born was really like. Ask one open question at a time, and record or write down her answers in her own words.
            </Lead>
            <p>
              The questions below are written for mums. For a list that suits both parents, see{' '}
              <Link href="/guides/questions-to-ask-your-parents-about-their-life">questions to ask your parents about their life</Link>; this page goes further into her mother, her working life and you. Dates and figures come from sources such as the Church of England, the Office for National Statistics and legislation.gov.uk, listed at the end.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <GuideSection
            title={
              <>
                Why ask your <Accent tone="pink">mum these questions?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Partly for you, and partly for whoever comes next. In a study reported in 2010, Emory University psychologists Robyn Fivush and Marshall Duke, with Jennifer Bohanek, asked 66 teenagers aged 14 to 16 twenty yes-or-no questions about their family, their ‘Do You Know’ scale, covering things like how their parents met and where they grew up. Teenagers who knew more showed higher emotional well-being and a stronger sense of identity, even after taking overall family functioning into account. The researchers cautioned that theirs was the only study to use the scale, so more research was needed.
              </p>
              <p>
                There is a practical reason too: much of what your mum knows is written down nowhere. What her mother was like at your age, the hospital where you were born, the recipe she makes without measuring. Ask while you can still hear her tell it.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">her childhood.</Accent>
              </>
            }
          >
            <Prose>
              <p>Start with places and people she can picture. Small, concrete questions get longer answers than big ones.</p>
            </Prose>
            <QuestionSets>
              <QuestionSet icon={House} title="Growing up" questions={SETS.childhood} />
            </QuestionSets>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">her own mum and gran.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Your mum may be the only person left who remembers her mother as a young woman, and her gran as more than a name. Ask with something in front of you: a recipe card, a photo, a ring.
              </p>
            </Prose>
            <QuestionSets>
              <QuestionSet icon={Heart} title="Her mum and gran" questions={SETS.herMum} tone="blue" />
            </QuestionSets>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about work, money and <Accent tone="pink">a changing world.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                If your mum was working in the 1970s or 80s, she saw some of the biggest changes in women’s pay and rights from the inside. The Equal Pay Act 1970 gave employers five years to bring women’s pay into line with men doing ‘like work’, and it came into force on 29&nbsp;December&nbsp;1975, the same day as the Sex Discrimination Act, according to the University of Edinburgh’s Gender Equalities at Work project. Statutory Maternity Pay as it is paid today followed: most of its regulations came into operation on 6&nbsp;April&nbsp;1987.
              </p>
            </Prose>
            <QuestionSets>
              <QuestionSet icon={Briefcase} title="Work and money" questions={SETS.work} tone="orange" />
            </QuestionSets>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">becoming a mum.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Mothers in England and Wales are older than they used to be. The Office for National Statistics puts the average age of mothers at 31.1 in 2025, and says it has been rising since 1976. Asking how old she was, and how that felt among her friends, is an easy way in.
              </p>
            </Prose>
            <QuestionSets>
              <QuestionSet icon={Baby} title="Becoming a mum" questions={SETS.becoming} tone="aqua" />
            </QuestionSets>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions only she can <Accent tone="pink">answer about you.</Accent>
              </>
            }
          >
            <Prose>
              <p>These are the stories nobody else can tell you.</p>
            </Prose>
            <QuestionSets>
              <QuestionSet icon={Smile} title="About you" questions={SETS.you} />
            </QuestionSets>
          </GuideSection>

          <PullQuote>
            You have only ever known her as Mum.{' '}
            <Accent tone="blue">Ask about the years before.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                When to ask: <Accent tone="pink">Mothering Sunday and other moments.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Mothering Sunday falls on the fourth Sunday of Lent, so its date moves with Easter: in 2027 it is 7&nbsp;March. The Church of England notes that in the 16th century the day was ‘less about mothers and more about church’, when people made a yearly journey to their ‘mother’ church, and that later, people working on farms and estates were given the day off to visit their mothers.
              </p>
              <p>
                In the US, Mother’s Day is the second Sunday in May, 9&nbsp;May in 2027: a Joint Resolution approved on 8&nbsp;May&nbsp;1914 set the date, and President Woodrow Wilson proclaimed it the next day.
              </p>
              <p>A special day is a good excuse, but any quiet hour will do. These moments tend to help:</p>
            </Prose>
            <Points>
              <Point icon={ChefHat} title="Cooking together.">
                Ask about a family recipe while you make it. Her hands remember the steps, and the stories come with them.
              </Point>
              <Point icon={Images} title="Sorting photos.">
                Hand her one picture and ask what was happening just before it was taken.
              </Point>
              <Point icon={Car} title="On a long drive.">
                Side by side, with the road to look at, a conversation can feel less like an interview.
              </Point>
              <Point icon={Phone} title="On the phone.">
                If she lives far away, keep one question going each week, and ask the follow-up next time.
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
                The Ancestorii app has 46 ready-made questions in 10 chapters, from Growing Up to Music &amp; Hobbies, including ‘If you could sit down with yourself at twenty, what would you say?’. You can also write your own, so any question on this page will do.
              </p>
              <p>
                Send one from the app as a time-limited link. Your mum answers in the free iPhone or Android app whenever it suits her, and you get an email when she does. Her answer is saved as a memory in your family’s private My Family feed, marked ‘In response to’ your question, and your brothers and sisters can add their own memory of the same moment beside it. See{' '}
                <Link href="/features/family-questions">how family questions work</Link>. If she doesn’t use a smartphone, ask in person and add the answer yourself, with a voice note of her telling it.
              </p>
              <p>The photo below is from our founder’s own family album.</p>
            </Prose>
            <GuideFigure
              src="/family.jpg"
              alt="Dante, the founder of Ancestorii, sitting on the floor with his mum in May 2011"
              label={'Me and my mum · The woman behind everything · May\u00a02011'}
              color="var(--c2)"
              position="62% 45%"
            />
            <Prose>
              <p>
                If you’d like something to give her on Mothering Sunday, her answers and your family photos can go into a printed{' '}
                <Link href="/memory-books">Memory Book</Link>: an A4 landscape hardcover of 24, 36 or 48&nbsp;pages, from £44.99 plus delivery. It holds photos and written words. Standard delivery is quoted at 10 to 14&nbsp;working&nbsp;days, so order at least three weeks ahead. For her parents’ generation, try our{' '}
                <Link href="/guides/questions-to-ask-your-grandparents">questions to ask your grandparents</Link>, and for the other side of the family,{' '}
                <Link href="/guides/questions-to-ask-your-dad">questions to ask your dad</Link>.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">asking your mum.</Accent>
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
              Ask her a question
              <br />
              <Accent tone="pink">this week.</Accent>
            </>
          }
        >
          Keep every answer in one private place your family can add to.
        </GuideCta>
      </SiteShell>
    </>
  );
}
