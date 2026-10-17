import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { BookOpen, Dna, FileText, Globe, Network, Search, TreeDeciduous, Users } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { GuideFigure, Point, Points, QuestionSet, QuestionSets, Step, Steps } from '../_components/GuideBlocks';

const PATH = '/guides/family-history-vs-family-tree';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Family History vs Family Tree: The Difference';
const HEADLINE = 'Family history vs family tree: what’s the difference?';
const DESCRIPTION =
  'A family tree records who connects to whom; family history tells who they were. How genealogy, trees and family stories fit together, and where to start.';
const PUBLISHED = '2026-10-17';
const CRUMB = 'Family History vs Family Tree';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Family history vs family tree' }],
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
    q: 'Is family history the same as genealogy?',
    a: 'Nearly. The National Genealogical Society says genealogy is often used for a line of descent traced from an ancestor, while some feel family history has more of a sense of a biographical study of a family, and that today the two terms are used interchangeably most of the time.',
  },
  {
    q: 'What is a GEDCOM file?',
    a: 'A GEDCOM file, ending in .ged, is the standard format for moving family tree data between genealogy programs and websites. The name stands for GEnealogical Data COMmunication. It was developed by the Family History Department of The Church of Jesus Christ of Latter-day Saints, and its first public draft was released in 1984.',
  },
  {
    q: 'Do I need a DNA test to build a family tree?',
    a: 'No. Trees are built from records and from what relatives remember. The National Genealogical Society’s committee on genetic genealogy says a DNA test can validate research, reveal hidden errors or connect you with genetic cousins, so it supports a tree rather than replacing one.',
  },
  {
    q: 'Should I build a tree first or collect stories first?',
    a: 'Collect stories from the oldest relatives first, because nobody else can tell them. The National Genealogical Society advises talking to relatives, oldest first, and taking notes or recording the conversations. Their answers give you names and dates for the tree as well.',
  },
  {
    q: 'Can Ancestorii build a family tree?',
    a: 'No. Ancestorii has no family tree, record search or DNA testing. It keeps the family history side: profiles with life stories, timelines, photos with the stories behind them and voice notes, private to the family members you invite. Use a tree tool such as FamilySearch or Ancestry alongside it.',
  },
];

const KEY_FACTS = [
  <>
    A <strong>family tree</strong> records names, dates and relationships: who was born, married and died,
    when and where, and how each person connects.
  </>,
  <>
    <strong>Family history</strong> adds the lives behind the names: homes, work, moves, stories, photos and
    voices.
  </>,
  <>
    The National Genealogical Society says genealogy and family history are used interchangeably{' '}
    <strong>“most of the time”</strong>.
  </>,
  <>
    <strong>GEDCOM</strong> files (.ged) move a tree between programs. The format’s first public draft came
    out in 1984.
  </>,
  <>
    <strong>FamilySearch</strong> is free to everyone. It began in 1894 as the Genealogical Society of Utah.
  </>,
  <>
    In England and Wales, census returns are open from <strong>1841 to 1921</strong> (The National
    Archives).
  </>,
];

const TREE_RECORDS = [
  'Full names, including maiden names',
  'Dates and places of birth, marriage and death',
  'Parents, partners and children',
  'The record each fact came from',
];

const HISTORY_ADDS = [
  'Where they lived and worked, and why they moved',
  'Photos and documents, with the story behind them',
  'Their voice, their sayings and their recipes',
  'What the people who knew them remember',
];

const SOURCES: Source[] = [
  {
    publisher: 'National Genealogical Society',
    title: 'Interested in Family History?',
    href: 'https://www.ngsgenealogy.org/family-history/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'National Genealogical Society',
    title: 'Nine Tips to Start Your Family History',
    href: 'https://www.ngsgenealogy.org/free-resources/tips-family-history/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'National Genealogical Society',
    title: 'NGS Committee on Genetic Genealogy',
    href: 'https://www.ngsgenealogy.org/committee-genetic-genealogy/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'State Library of Queensland',
    title: 'Recording your family history',
    href: 'https://www.slq.qld.gov.au/blog/recording-your-family-history',
    date: '2\u00a0August\u00a02024',
  },
  {
    publisher: 'The National Archives',
    title: 'Census records research guide',
    href: 'https://www.nationalarchives.gov.uk/help-with-your-research/research-guides/census-records/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'FamilySearch (gedcom.io)',
    title: 'The FamilySearch GEDCOM Specification, version 7.0.18',
    href: 'https://gedcom.io/specifications/FamilySearchGEDCOMv7.html',
    date: '17\u00a0February\u00a02026',
  },
  {
    publisher: 'FamilySearch',
    title: 'About FamilySearch',
    href: 'https://www.familysearch.org/en/about',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Ancestry',
    title: 'Company facts',
    href: 'https://www.ancestry.com/corporate/about-ancestry/company-facts',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Oral History Society',
    title: 'For family historians',
    href: 'https://ohs.org.uk/for-family-historians/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Phys.org',
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
];

// Room above the key facts and the author box, and above the sources (a section's step).
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function FamilyHistoryVsFamilyTreePage() {
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
              Family history vs family tree:{' '}
              <br />
              <Accent>what’s the difference?</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              A family tree records the names, dates and relationships that connect generations; family history goes further and tells the stories of who those people were, how they lived and what happened to them. The tree is the skeleton and the history is the story, although the National Genealogical Society notes that genealogy and family history are now used interchangeably “most of the time”.
            </Lead>
            <p>
              You don’t have to choose. You can keep both: a tree built from records, and the stories, photos and voices that no record holds. This guide explains how the two differ, which tools do which job, and where to start.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <GuideSection
            title={
              <>
                What is a <Accent tone="pink">family tree?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                A family tree is a chart of descent. Each person has a box with their name and the dates and places of their birth, marriage and death, and lines join them to their parents, partners and children. The State Library of Queensland describes two charts that researchers use:
              </p>
            </Prose>
            <Points>
              <Point icon={Network} title="A pedigree chart.">
                Your direct-line ancestors for at least three generations: you, your parents, your grandparents and back, with names and the dates and places of births, marriages and deaths. It is the framework the rest of the tree is built on.
              </Point>
              <Point icon={Users} title="A family group sheet.">
                One complete family unit on one page: mother, father and all their children. A remarriage with more children needs a new sheet.
              </Point>
            </Points>
            <Prose>
              <p>
                Each fact on a tree should come from a record, such as a birth certificate, a census return or a parish register. In England and Wales, census returns are open from 1841 to 1921, and The National Archives notes that 1841 was the first census to list the names of every individual. The State Library suggests keeping a research log of which sources you searched, when and where, with a citation for each one.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What is family history, and <Accent tone="pink">is it the same as genealogy?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                The National Genealogical Society puts it this way: genealogy “is often used to describe a line of descent, traced continuously from an ancestor”, while some feel family history “has a bit more connotation of a biographical study of a family”. Its conclusion is that “both words mean the study of families, finding their stories, and tracing their lineage and history”.
              </p>
              <p>
                In practice, family history asks what a tree can’t answer. What work did they do, and why did they move? What did Sunday lunch look like? What did they sound like when they laughed? Some of that comes from records. Much more comes from photos, letters, recipes and the people who remember them.
              </p>
            </Prose>
            <QuestionSets>
              <QuestionSet icon={TreeDeciduous} title="A family tree records" questions={TREE_RECORDS} />
              <QuestionSet icon={BookOpen} title="Family history adds" questions={HISTORY_ADDS} />
            </QuestionSets>
          </GuideSection>

          <GuideSection
            title={
              <>
                Do you need a family tree <Accent tone="pink">to do family history?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                No. You can write down your grandmother’s stories without knowing her grandparents’ names, and many family histories begin exactly that way. A tree helps in two ways, though: it stops you mixing up two people with the same name, and it shows you whose stories you haven’t collected yet.
              </p>
              <p>
                There is good reason to start with the stories. Emory University psychologists Marshall Duke and Robyn Fivush, with Jennifer Bohanek, built a “Do You Know” scale of 20 yes or no questions, such as whether a child knows how their parents met. In a study of 66 teenagers aged 14 to 16, those who knew more about their extended family showed higher levels of emotional well-being, even after allowing for how well the family functioned overall. The authors cautioned that it was the only study to have used the scale, so more research was needed.
              </p>
              <p>
                Another Emory study found that children whose families talked about difficult times in “more coherent and emotionally open ways” coped better over two years, with better self-esteem and less anxiety.
              </p>
            </Prose>
          </GuideSection>

          <PullQuote>
            The tree tells you who they were related to.{' '}
            <Accent tone="blue">Family history tells you who they were.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                Which tools <Accent tone="pink">exist for each?</Accent>
              </>
            }
          >
            <Prose>
              <p>Tree tools are built around records and relationships:</p>
            </Prose>
            <Points>
              <Point icon={Search} title="Ancestry.">
                A subscription genealogy service. Ancestry says it has 71&nbsp;billion records online, over 150&nbsp;million family trees and over 30&nbsp;million people in its DNA network. We compare the two services in{' '}
                <Link href="/compare/ancestorii-vs-ancestry">Ancestorii vs Ancestry</Link>.
              </Point>
              <Point icon={Globe} title="FamilySearch.">
                Free to everyone, provided by The Church of Jesus Christ of Latter-day Saints, which began it in 1894 as the Genealogical Society of Utah.
              </Point>
              <Point icon={FileText} title="GEDCOM.">
                The standard file for moving a tree between programs. It stands for GEnealogical Data COMmunication, its first public draft came out in 1984, files end in .ged, and the current version, 7.0.18, is dated 17&nbsp;February&nbsp;2026.
              </Point>
              <Point icon={Dna} title="DNA tests.">
                The National Genealogical Society’s committee on genetic genealogy says a test can “validate decades of research” or reveal hidden errors, and can help break through a brick wall by connecting you with genetic cousins. It supports a tree built from records rather than replacing one.
              </Point>
            </Points>
            <Prose>
              <p>
                Family history tools are older and simpler: a voice recorder, a scanner, a notebook and somewhere to keep it all together. The Oral History Society’s advice to family historians is to ask open questions, ones which need more than a yes or no answer, and to brainstorm questions by asking yourself what you would ask a relative about the family if they were still alive.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Which should <Accent tone="pink">you start with?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Start with the people who are still here. Among the National Genealogical Society’s nine tips for beginners: talk to your relatives, oldest first, taking notes or recording; ask whether certificates, Bible records and old photos survive; and document where every finding came from. That gives you both at once: names and dates for the tree, and the stories for the history.
              </p>
            </Prose>
            <Steps>
              <Step number="01" title="Write down what you already know.">
                <p>Names, dates and places for yourself, your parents and your grandparents. Gaps are fine; they become your questions.</p>
              </Step>
              <Step number="02" title="Talk to the oldest relatives first.">
                <p>
                  Record the conversation if they agree. Our{' '}
                  <Link href="/guides/questions-to-ask-your-grandparents">questions to ask your grandparents</Link> are a good place to begin.
                </p>
              </Step>
              <Step number="03" title="Gather the papers at home.">
                <p>Certificates, letters, a family Bible and photos with writing on the back.</p>
              </Step>
              <Step number="04" title="Then search the records.">
                <p>
                  Our guide to{' '}
                  <Link href="/guides/how-to-start-researching-your-family-history">researching your family history</Link> covers certificates, census returns and the 1939 Register.
                </p>
              </Step>
              <Step number="05" title="Write the stories up.">
                <p>
                  A tree of names becomes a family history when someone writes the lives down. Here is{' '}
                  <Link href="/guides/how-to-write-a-life-story">how to write a life story</Link>.
                </p>
              </Step>
            </Steps>
          </GuideSection>

          <GuideSection
            title={
              <>
                Where Ancestorii fits, <Accent tone="pink">and where it doesn’t.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Ancestorii isn’t a family tree builder or a genealogy research service. It has no tree view, no record search and no DNA testing, so for the tree, use a tree tool.
              </p>
              <p>
                It is built for the family history side. Each person can have a{' '}
                <Link href="/features/loved-ones">Loved One</Link> profile with their relationship, birth and death dates and a life story in four chapters: Early years, Important moments, Special memories and Who they are. Around them go timelines of dated events, photo albums with the story and voice notes behind each picture, and a shared Library, all private to the family members you invite. The Free plan covers one loved one; Premium, at £3.99 a month for the whole family, covers as many as you like.
              </p>
            </Prose>
            <GuideFigure
              src="/family.jpg"
              alt="Dante, the founder of Ancestorii, sitting on the floor with his mum in May 2011"
              label={'Me and my mum · The woman behind everything · May\u00a02011'}
              color="var(--c2)"
              position="62% 45%"
            />
            <Prose>
              <p>On a family tree, the mum of Ancestorii’s founder would be a name and a date of birth. His caption on this photo says who she is.</p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about family history <Accent tone="pink">and family trees.</Accent>
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
              Keep the stories
              <br />
              <Accent tone="pink">behind the names.</Accent>
            </>
          }
        >
          A private place for your family’s photos, voices and life stories, alongside whatever tree you keep.
        </GuideCta>
      </SiteShell>
    </>
  );
}
