import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  BookMarked,
  ClipboardList,
  FileText,
  Flag,
  Globe,
  Landmark,
  Library,
  MapPin,
  Mic,
  PenLine,
  Search,
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

const PATH = '/guides/how-to-start-researching-your-family-history';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Start Researching Your Family History (UK)';
const HEADLINE = 'How to start researching your family history';
const DESCRIPTION =
  'Start with living relatives, then certificates from 1837, census returns to 1921 and the 1939 Register: a beginner’s route through UK family records.';
const PUBLISHED = '2026-10-17';
const CRUMB = 'Researching Your Family History';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to start researching your family history' }],
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
    q: 'Where do I start with family history research?',
    a: 'With yourself and your oldest living relatives. Write down the names, dates and places you already know, record what relatives remember, and gather the certificates and photos at home. Then work back a generation at a time with birth, marriage and death records and census returns.',
  },
  {
    q: 'Is the 1921 census free to search?',
    a: 'It is free to view at The National Archives in Kew, and free through Findmypast at Manchester Central Library and the National Library of Wales. Online, Ancestry and Findmypast let you search for free but charge to view full results and images.',
  },
  {
    q: 'How much does a birth certificate cost from the GRO?',
    a: 'A certificate for England and Wales costs £12.50 and is sent 4\u00a0days after you apply. Without the GRO index reference, each search costs £3.50 extra and the certificate takes 15\u00a0working\u00a0days. The priority service costs £38.50 and is sent the next working day if you order by 4pm.',
  },
  {
    q: 'What happened to the 1931 census?',
    a: 'The 1931 census for England and Wales was destroyed by fire in 1942, and no census was taken in 1941 because of the Second World War. The 1939 Register, taken on 29\u00a0September\u00a01939, fills part of the gap.',
  },
  {
    q: 'Can I trace my family history for free?',
    a: 'A long way, yes. FreeBMD’s birth, marriage and death index is free, the GRO’s historic birth and death indexes are free to search, FamilySearch is free to everyone, and The National Archives offers the 1841 to 1921 censuses and the 1939 Register free in its Kew reading rooms. Certificates cost £12.50 each, and the big subscription sites charge to view full records.',
  },
];

const KEY_FACTS = [
  <>
    <strong>Start with living relatives</strong>, oldest first, as the National Genealogical Society
    advises, and with the papers in your own home.
  </>,
  <>
    Birth, marriage and death certificates for England and Wales go back to <strong>1&nbsp;July&nbsp;1837</strong> and
    cost <strong>£12.50</strong> each from the General Register Office.
  </>,
  <>
    Census returns are open from <strong>1841 to 1921</strong>. The 1931 census was destroyed by fire in
    1942, and no census was taken in 1941.
  </>,
  <>
    The <strong>1939 Register</strong>, taken on 29&nbsp;September&nbsp;1939, lists around 40&nbsp;million people in
    England and Wales.
  </>,
  <>
    FreeBMD’s free index held <strong>300,248,602</strong> distinct records at its update on 25&nbsp;September&nbsp;2026.
  </>,
];

const FREE = [
  'FreeBMD: the birth, marriage and death index for 1837 to 1999, still being transcribed',
  'The GRO online index: births from 1837 to 1934 and deaths from 1837 to 1957',
  'FamilySearch: free to everyone, with census indexes up to 1911',
  'The National Archives at Kew: the 1841 to 1921 censuses and the 1939 Register, in the reading rooms',
];

const PAID = [
  'GRO certificates: £12.50 each, or £38.50 for the priority service',
  'Ancestry and Findmypast: free to search, with a charge to view full results and images',
  'The 1939 Register online: on Findmypast and Ancestry',
];

const SOURCES: Source[] = [
  {
    publisher: 'The National Archives',
    title: 'Births, marriages and deaths in England and Wales research guide',
    href: 'https://www.nationalarchives.gov.uk/help-with-your-research/research-guides/birth-marriage-death-england-and-wales',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'GOV.UK',
    title: 'Order a birth, death, marriage or civil partnership certificate',
    href: 'https://www.gov.uk/order-copy-birth-death-marriage-certificate',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'GOV.UK',
    title: 'Research your family history using the General Register Office',
    href: 'https://www.gov.uk/research-family-history',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'GOV.UK (General Register Office)',
    title: 'Discover your family history',
    href: 'https://www.gov.uk/government/publications/discover-your-family-history/discover-your-family-history-accessible-version',
    date: 'updated 13\u00a0September\u00a02025',
  },
  {
    publisher: 'FreeBMD',
    title: 'FreeBMD home page (database last updated 25\u00a0September\u00a02026)',
    href: 'https://www.freebmd.org.uk/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Surrey History Centre',
    title: 'Early parish registers',
    href: 'https://surreycc.gov.uk/culture-and-leisure/history-centre/marvels/early-parish-registers',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'The National Archives',
    title: 'Census records research guide',
    href: 'https://www.nationalarchives.gov.uk/help-with-your-research/research-guides/census-records/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'The National Archives',
    title: '1939 Register research guide',
    href: 'https://www.nationalarchives.gov.uk/help-with-your-research/research-guides/1939-register',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'National Genealogical Society',
    title: 'Nine Tips to Start Your Family History',
    href: 'https://www.ngsgenealogy.org/free-resources/tips-family-history/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Oral History Society',
    title: 'For family historians',
    href: 'https://ohs.org.uk/for-family-historians/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'FamilySearch',
    title: 'About FamilySearch',
    href: 'https://www.familysearch.org/en/about',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'National Records of Scotland',
    title: 'Statutory registers of births, deaths and marriages',
    href: 'https://www.nrscotland.gov.uk/learning-and-events/research-guides/statutory-registers-of-births-deaths-and-marriages',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'nidirect',
    title: 'Search GRONI’s online records',
    href: 'https://www.nidirect.gov.uk/articles/search-gronis-online-records',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Government of Ireland, Department of Culture, Communications and Sport',
    title: 'Irish Genealogy (irishgenealogy.ie)',
    href: 'https://www.irishgenealogy.ie/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'US National Archives',
    title: '1950 Census Records',
    href: 'https://www.archives.gov/research/census/1950',
    date: 'accessed October\u00a02026',
  },
];

// Room above the key facts and the author box, and above the sources (a section's step).
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function StartResearchingFamilyHistoryPage() {
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
              How to start researching{' '}
              <br />
              <Accent>your family history.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              Start your family history with what living relatives remember and the documents in your own home, then work back one generation at a time using birth, marriage and death records (from 1&nbsp;July&nbsp;1837 in England and Wales), census returns from 1841 to 1921 and the 1939 Register, checking each fact against a second source.
            </Lead>
            <p>
              This guide follows that route through the records of England and Wales, using The National Archives’ research guides and GOV.UK. Scotland, Northern Ireland and Ireland keep their own records, covered further down, and a surprising amount of it is free. If you are still deciding between building a tree and writing the stories, start with{' '}
              <Link href="/guides/family-history-vs-family-tree">family history vs family tree</Link>.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <GuideSection
            title={
              <>
                Where should <Accent tone="pink">you start?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                With yourself, and with the people who remember. GOV.UK’s family history guide gives the same first step: “gather together family memories, photos and documents” before you turn to certificates. Write down what you already know about your parents and grandparents: full names, including maiden names, and the dates and places of births, marriages and deaths. Then follow the National Genealogical Society’s advice for beginners:
              </p>
            </Prose>
            <Tips>
              <Tip icon={Mic}>
                <strong>Talk to your relatives, oldest first.</strong> Take notes or record the conversation. The Oral History Society suggests open questions, ones which need more than a yes or no answer.
              </Tip>
              <Tip icon={FileText}>
                <strong>Ask what papers survive.</strong> Certificates, family histories, Bible records and old photographs. Ask permission to see them.
              </Tip>
              <Tip icon={PenLine}>
                <strong>Track every spelling of each surname.</strong> Records often spell the same family name in different ways.
              </Tip>
              <Tip icon={BookMarked}>
                <strong>Note where each fact came from.</strong> “Document your findings so you will know the exact sources later.”
              </Tip>
            </Tips>
            <Prose>
              <p>
                Our guides on{' '}
                <Link href="/guides/how-to-interview-your-grandparents">how to interview your grandparents</Link> and the{' '}
                <Link href="/guides/questions-to-ask-your-grandparents">questions to ask them</Link> help with the conversations.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you use birth, marriage <Accent tone="pink">and death records?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Civil registration in England and Wales began on 1&nbsp;July&nbsp;1837. Certificates for events since then come from the General Register Office (GRO), not The National Archives. For anything earlier, look for parish registers in local archives: as Surrey History Centre explains, Thomas Cromwell ordered every parish to keep a register of baptisms, marriages and burials on 5&nbsp;September&nbsp;1538.
              </p>
            </Prose>
            <Steps>
              <Step number="01" title="Find the index entry.">
                <p>FreeBMD’s volunteers are transcribing the GRO index for 1837 to 1999, free to search, and the GRO’s own online index of historic births (1837 to 1934) and deaths (1837 to 1957) is free too. The index gives you the reference to order with.</p>
              </Step>
              <Step number="02" title="Order the certificate.">
                <p>A GRO certificate costs £12.50 and is sent 4&nbsp;days after you apply. Without an index reference, each search costs £3.50 extra and the certificate takes 15&nbsp;working&nbsp;days. The priority service costs £38.50 and is sent the next working day if you order by 4pm.</p>
              </Step>
              <Step number="03" title="Read it for the next clue.">
                <p>GOV.UK’s guide explains that a birth certificate gives the mother’s name, sometimes her maiden name, and the father’s name and occupation, which help you find the parents’ marriage. Marriage certificates from before 4&nbsp;May&nbsp;2021 name both fathers and their occupations, taking you back another generation.</p>
              </Step>
              <Step number="04" title="Treat ages with care.">
                <p>The same guide warns that the age a bride and groom gave at their marriage is “only as accurate as they believe it to be”, so check it against a census return.</p>
              </Step>
            </Steps>
          </GuideSection>

          <GuideSection
            title={
              <>
                Which census records <Accent tone="pink">can you search?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                A census has been taken every ten years since 1801, except in 1941, but names from 1801 to 1831 were not collected centrally. The National Archives explains that 1841 was the first census to list the names of every individual, so most searches begin there, although it recorded less than later years. Returns are open from 1841 to 1921, and later ones stay closed for 100&nbsp;years. The 1921 census was taken on 19&nbsp;June&nbsp;1921, postponed from 24&nbsp;April because of industrial unrest. The 1931 census was destroyed by fire in 1942.
              </p>
            </Prose>
            <Points>
              <Point icon={Landmark} title="Free at Kew.">
                The National Archives shows every census from 1841 to 1921 free in its reading rooms.
              </Point>
              <Point icon={Library} title="Free locally.">
                Many libraries, record offices and FamilySearch Centres offer 1841 to 1911 free, and the 1921 census is free through Findmypast at Manchester Central Library and the National Library of Wales in Aberystwyth.
              </Point>
              <Point icon={Search} title="Online.">
                Ancestry and Findmypast have images and indexes for 1841 to 1921, and FamilySearch has free indexes up to 1911. In The National Archives’ words, “It is free to search on these sites, but there is a charge to view full search results and digitised images.”
              </Point>
            </Points>
            <Prose>
              <p>
                Then follow one household back ten years at a time. From 1851, returns give each person’s relationship to the head of the household, their age, their occupation and where they were born, and the birthplace tells you where to look next.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What is <Accent tone="pink">the 1939 Register?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                With the 1931 census lost and none taken in 1941, the 1939 Register is the record to search for those years. Taken on 29&nbsp;September&nbsp;1939, it holds details of around 40&nbsp;million people in more than 65,000 volumes, and was used to produce identity cards and, from January&nbsp;1940, ration books. It covers England and Wales only.
              </p>
              <p>
                Records of anyone born less than 100&nbsp;years ago stay closed unless they are known to have died. You can search the Register on Findmypast and Ancestry, both paid, or free in the reading rooms at The National Archives in Kew.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Which websites are free, <Accent tone="pink">and which cost money?</Accent>
              </>
            }
          >
            <QuestionSets>
              <QuestionSet icon={Library} title="Free" questions={FREE} />
              <QuestionSet icon={ClipboardList} title="Costs money" questions={PAID} />
            </QuestionSets>
            <Prose>
              <p>GOV.UK also lists places where you can search for free in person, such as the Library of Birmingham and Bridgend Local and Family History Centre.</p>
            </Prose>
          </GuideSection>

          <PullQuote>
            Records tell you when they lived.{' '}
            <Accent tone="blue">Relatives tell you how.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                What about ancestors from <Accent tone="pink">outside England and Wales?</Accent>
              </>
            }
          >
            <Points>
              <Point icon={Flag} title="Scotland.">
                The statutory registers date from 1855, when civil registration became compulsory, and the National Records of Scotland puts them online as digital images on ScotlandsPeople.
              </Point>
              <Point icon={MapPin} title="Northern Ireland.">
                GRONI’s online service, reached through nidirect, has a free name search that shows how many records match; full details need an account and paid credits.
              </Point>
              <Point icon={BookMarked} title="Ireland.">
                The Irish government’s irishgenealogy.ie lists historic birth registers from 1864 to 1925, marriages from 1845 to 1950 and deaths from 1871 to 1975.
              </Point>
              <Point icon={Globe} title="The United States.">
                The 1950 US census was released on 1&nbsp;April&nbsp;2022, after a 72-year restriction, and is free to search at 1950census.archives.gov.
              </Point>
            </Points>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you keep the stories, <Accent tone="pink">not just the names?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Records give you names, dates, addresses and occupations. They rarely tell you what someone was like, which is why your oldest relatives are your best source, and the one with the least time. Keep what they tell you with the records it explains: scan certificates and photos together, label them, and store copies in more than one place. Our guide to{' '}
                <Link href="/guides/how-to-create-a-family-archive">creating a family archive</Link> sets out a system.
              </p>
              <p>
                Ancestorii isn’t a records database or a genealogy research service. It is where you keep what you find alongside the stories: a <Link href="/features/loved-ones">Loved One</Link> profile for each ancestor, with their dates, relationship and a life story in four chapters; timelines of dated events; scanned certificates and photos in a shared family Library; and questions sent from the app to older relatives, who answer in the app. The Free plan covers one loved one, and Premium, at £3.99 a month for the whole family, covers as many as you like. Everything stays private to the family members you invite.
              </p>
              <p>No record holds a moment like this one, from our founder’s family album.</p>
            </Prose>
            {/* sister.jpg is 720 by 482: at 600px wide the 5:4 frame never enlarges it, so it stays sharp. */}
            <div style={{ maxWidth: 600, marginInline: 'auto' }}>
              <GuideFigure
                src="/sister.jpg"
                alt="A childhood memory"
                label="A childhood memory · the kind of moment that disappears if nobody writes it down"
                color="var(--c0)"
                position="45% 50%"
              />
            </div>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about starting <Accent tone="pink">your family history.</Accent>
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
              Find the names.
              <br />
              <Accent tone="pink">Keep the stories.</Accent>
            </>
          }
        >
          A private family space for what you discover: the dates, the documents, the photos and the voices.
        </GuideCta>
      </SiteShell>
    </>
  );
}
