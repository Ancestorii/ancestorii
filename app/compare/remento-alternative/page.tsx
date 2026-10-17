import Link from 'next/link';
import type { Metadata } from 'next';
import { FileText, Mic, QrCode, Smartphone } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent } from '@/components/site/SiteBits';
import site from '@/components/site/site.module.css';
import {
  ArticleCta,
  ArticleHero,
  ArticleSection,
  CaptionedPhoto,
  CheckList,
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

const PATH = '/compare/remento-alternative';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Remento Alternative for the Whole Family (2026)';
const HEADLINE = 'A Remento alternative built for the whole family';
const DESCRIPTION =
  "Remento turns one storyteller's recordings into a book for $99 in year one. Ancestorii is a private library the whole family adds to. As of October 2026.";

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Ancestorii, a Remento alternative for the whole family' }],
    locale: 'en_GB',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | Ancestorii`,
    description: DESCRIPTION,
    images: ['/og-default.jpg'],
  },
};

// Remento's prices and features were checked on remento.co, its FAQ and its help centre on
// 17 October 2026 (see SOURCES). Ancestorii's come from the live plans, checkout and editors.

// Shown on the page and written into the FAQPage structured data, word for word.
const FAQ = [
  {
    q: 'What is the best alternative to Remento?',
    a: 'It depends on what you want to keep. For a private space where the whole family adds memories, photos and voice notes, with books you lay out yourself, Ancestorii is built for that. For weekly questions and a book after a year, StoryWorth works that way. If typed-up recordings and QR codes in the book matter most, Remento does that better than either.',
  },
  {
    q: 'Is Remento available in the UK?',
    a: "Yes. As of October\u00a02026, Remento ships books to the UK for $15 for the first book and $10 for each extra book. Books typically arrive within 3\u00a0weeks, with no customs or duty charges to pay on delivery. Remento lists its prices in US dollars, so a UK family's first year with one book comes to $114.",
  },
  {
    q: 'Does Ancestorii turn recordings into text like Remento?',
    a: "No. Ancestorii keeps voice notes as recordings and does not transcribe them. Its optional writing help, Story Assistance, can suggest openings, captions and questions while you write, and you choose what to keep, but it does not turn audio into text. If a typed-up version of every recording matters most, Remento's Speech-to-Story does that.",
  },
  {
    q: 'Can Ancestorii print QR codes that play voices?',
    a: "No. Ancestorii's printed Memory Books hold photos and written words only, with no audio and no QR codes. Voice notes stay in your family's private library, where everyone in your family space can play them. Remento's books have a QR code on every chapter that plays the original recording.",
  },
  {
    q: 'Is Ancestorii cheaper than Remento?',
    a: "It depends on what you buy. Ancestorii's Free plan costs nothing, Premium is £3.99 a month for the whole family, and a Memory Book is a separate purchase from £44.99 plus delivery. Remento is $99 for the first year, including one book of up to 200 pages, plus $15 shipping to the UK, then $99 a year or $12 a month. Remento's price includes transcription and QR codes, and its book can be far longer than Ancestorii's 48 pages.",
  },
];

const KEY_FACTS = [
  <>
    As of October&nbsp;2026, <strong>Remento costs $99 for the first year</strong>, including one
    hardcover book credit of up to 200 pages, then $99 a year or $12 a month.
  </>,
  <>
    Remento ships to the UK for <strong>$15 for the first book</strong> and $10 for each extra one,
    typically within 3&nbsp;weeks, with no customs or duty to pay.
  </>,
  <>
    Storytellers get a prompt by email or text, <strong>weekly by default</strong>, and record by
    clicking a link, with no app or password.
  </>,
  <>
    The Remento book is an <strong>8&nbsp;×&nbsp;10&nbsp;inch hardcover</strong> of up to 380 pages, with a QR code
    on every chapter that plays the recording.
  </>,
  <>
    Ancestorii keeps <strong>voice notes in your family&apos;s digital library</strong>. Its printed
    books hold photos and words only, and questions are answered in its free app.
  </>,
  <>
    Ancestorii is <strong>free to start</strong>. Premium is £3.99 a month for the whole family,
    and Memory Books start at £44.99 plus delivery.
  </>,
];

const REMENTO_STRENGTHS = [
  {
    title: 'No app, no login.',
    text: 'The storyteller gets a prompt by email or text, weekly by default or anywhere from daily to monthly, then clicks a link and records. Remento says it works on any phone.',
    Icon: Smartphone,
  },
  {
    title: 'Room to talk.',
    text: 'Each story can run to 30\u00a0minutes, and every account includes unlimited collaborators.',
    Icon: Mic,
  },
  {
    title: 'Recordings become text.',
    text: 'Speech-to-Story turns each recording into a word-for-word transcript without the filler words, or a narrative in the first or third person. Both stay editable, and Remento says content is not used to train AI models.',
    Icon: FileText,
  },
  {
    title: 'The voice stays in the book.',
    text: 'The book is an 8\u00a0×\u00a010\u00a0inch full-colour hardcover, and every chapter has a QR code that plays the original recording. There is a 30-day money-back guarantee.',
    Icon: QrCode,
  },
];

const REMENTO_COSTS = [
  ['First year', '$99', 'A year of access and one hardcover book credit (up to 200 pages)'],
  ['Renewal', '$99 a year or $12 a month', 'Keep recording new stories'],
  ['Extra copy', '$69', 'Another hardcover, up to 200 pages'],
  ['Longer book', '$30 more', 'Up to 380 pages'],
  ['Extra storyteller', '$99 once', 'A year of access and a book credit for a second person'],
  ['E-book', '$49.99', 'A digital copy of the book'],
  ['UK shipping', '$15, then $10 per extra book', 'Typically within 3\u00a0weeks, with no customs or duty'],
];

const DIFFERENCES = [
  <>
    <strong>Everyone adds, not one storyteller.</strong> Invite family by email, a shareable link
    or a join code, with no cap on numbers. When two relatives remember the same moment
    differently, both versions sit on one memory as tabs.
  </>,
  <>
    <strong>Voices stay with the photo.</strong> Record or upload{' '}
    <Link href="/features/voice-notes" className={site.textLink}>
      voice notes
    </Link>{' '}
    on album photos, timeline moments, capsules and private memories. Each one is stored as M4A so
    it plays on any phone.
  </>,
  <>
    <strong>More than stories.</strong> Albums, dated timelines, capsules sealed until a date you
    choose and Loved Ones profiles sit alongside the memories.
  </>,
  <>
    <strong>Questions when you want them.</strong> There is no weekly schedule. From the app you
    can{' '}
    <Link href="/features/family-questions" className={site.textLink}>
      send a relative one of 46 ready-made questions
    </Link>
    , such as &ldquo;Picture Sunday dinner when you were growing up. What was it like?&rdquo; You
    get an email when they answer.
  </>,
  <>
    <strong>A book you lay out yourself.</strong> Memory Books are A4 landscape hardcovers. Pick from
    five page layouts and three cover layouts, add a subheading and a comment to any photo, and
    download a free PDF before you order.
  </>,
];

const SIDE_BY_SIDE = [
  ['What it is', 'A private family library, with books and prints you design', "One storyteller's recorded stories, turned into a book"],
  ['Who adds stories', 'Everyone you invite to your family space', 'One storyteller per book, plus unlimited collaborators'],
  ['Prompts', '46 questions in 10 chapters, sent from the app when you choose', 'By email or text, weekly by default'],
  ['What the storyteller needs', 'The free app on iPhone or Android', 'Any phone: a link, no app or login'],
  ['Recordings to text', 'Not offered', 'Speech-to-Story transcript or narrative, editable'],
  ['Printed book', 'A4 landscape hardcover of 24, 36 or 48 pages, from £44.99 plus delivery', '8\u00a0×\u00a010\u00a0inch hardcover, up to 200 pages included (380 for $30 more)'],
  ['Voices in print', 'No: photos and words only', 'Yes: a QR code on every chapter'],
  ['Plans', 'Free, or Premium at £3.99 a month per family', '$99 first year with one book, then $99 a year or $12 a month'],
  ['UK delivery', '£4.99 Standard, 10 to 14 working days', '$15 for the first book, typically within 3\u00a0weeks'],
  ['If you stop paying', 'Everything stays viewable; new uploads above the Free limits pause', 'Recordings stay viewable and downloadable; no new ones'],
];

const SOURCES: Source[] = [
  {
    publisher: 'Remento',
    title: 'Remento’s Pricing Guide',
    href: 'https://help.remento.co/en/articles/8365892-remento-s-pricing-guide',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Remento',
    title: 'Where does Remento ship books (internationally)?',
    href: 'https://help.remento.co/en/articles/8365901-where-does-remento-ship-books-internationally',
    date: '30 June 2026',
  },
  {
    publisher: 'Remento',
    title: 'Frequently asked questions',
    href: 'https://www.remento.co/faq',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Remento',
    title: 'Remento homepage: book format, QR codes and guarantee',
    href: 'https://www.remento.co/',
    date: 'accessed October 2026',
  },
  {
    publisher: 'StoryWorth',
    title: 'StoryWorth UK homepage: weekly questions and how stories are told',
    href: 'https://welcome.storyworth.com/gb',
    date: 'accessed October 2026',
  },
];

export default function RementoAlternativePage() {
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
            { name: 'Remento alternative', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[
            { href: '/', label: 'Home' },
            { href: '/compare', label: 'Compare' },
            { label: 'Remento alternative' },
          ]}
          size="md"
          title={
            <>
              A Remento alternative <Accent>built for the whole family.</Accent>
            </>
          }
          intro={[
            "If you want one parent's recorded stories turned into a single book with QR codes that play their voice, Remento does that well, for $99 in the first year as of October\u00a02026. If you want a private library the whole family adds to, with voice notes on photos, albums, timelines and books you lay out yourself, Ancestorii is the alternative.",
            'Below: what Remento costs in the UK, what it does better than Ancestorii, where the two differ and how to use them together. We checked every Remento detail on its own website and help centre on 17\u00a0October\u00a02026.',
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        {/* Key facts beside a real customer's Memory Book about her dad, in her own words */}
        <ArticleSection
          aside={
            <CaptionedPhoto
              src="/testimonial4.png"
              alt="Andrea holding her printed Ancestorii Memory Book about her dad"
              label="Andrea · Dudley, UK"
              color="var(--c2)"
              position="58% 50%"
              caption="“I recently lost my dad, so this book became incredibly special.” Andrea, on her printed Memory Book about him."
              priority
            />
          }
        >
          <KeyFacts items={KEY_FACTS} />
        </ArticleSection>

        {/* What Remento does well */}
        <ArticleSection
          id="what-remento-does-well"
          layout="wide"
          kicker="What Remento does well"
          dot="var(--c2)"
          title={
            <>
              What does Remento <Accent tone="blue">do well?</Accent>
            </>
          }
        >
          <ReasonCards items={REMENTO_STRENGTHS} />
        </ArticleSection>

        {/* UK prices */}
        <ArticleSection
          id="remento-uk-prices"
          kicker="UK prices"
          dot="var(--c3)"
          title={
            <>
              What does Remento <Accent tone="pink">cost in the UK?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Remento lists its prices in US dollars, including UK shipping, so a UK family&apos;s first
              year with one book comes to <strong>$114</strong>: the $99 plan plus $15 shipping. If you
              stop renewing, Remento says you can still view and download every recording, but you
              cannot record new ones.
            </p>
          </Reading>
          <div className={site.sectionBody}>
            <CompareTable
              head={['Item', 'Price', 'What it covers']}
              rows={REMENTO_COSTS}
              highlight={1}
              size="mid"
              labelledBy="remento-uk-prices-title"
            />
            <TableNote>
              Prices from Remento&apos;s pricing guide and international shipping article, in US
              dollars, checked 17&nbsp;October&nbsp;2026.
            </TableNote>
          </div>
        </ArticleSection>

        {/* How Ancestorii differs */}
        <ArticleSection
          id="how-ancestorii-differs"
          kicker="How Ancestorii differs"
          dot="var(--c0)"
          title={
            <>
              How is Ancestorii <Accent tone="blue">different?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Ancestorii starts from a different place: a private space that everyone you invite adds
              to, which keeps growing after anything is printed.
            </p>
          </Reading>
          <div className={site.sectionBody}>
            <CheckList items={DIFFERENCES} />
          </div>
          <div className={site.sectionBody}>
            <Reading>
              <p>
                Remento does some things Ancestorii does not. Ancestorii does not transcribe
                recordings into text, its printed books carry no audio or QR codes, and its longest
                book is 48 pages. The person answering a question also needs the free Ancestorii app
                on their iPhone or Android phone, where Remento needs only a link.
              </p>
            </Reading>
          </div>
        </ArticleSection>

        {/* Side by side */}
        <ArticleSection
          id="side-by-side"
          layout="wide"
          kicker="Side by side"
          dot="var(--c1)"
          title={
            <>
              Ancestorii vs Remento: <Accent tone="pink">side by side.</Accent>
            </>
          }
        >
          <CompareTable
            head={['Feature', 'Ancestorii', 'Remento']}
            rows={SIDE_BY_SIDE}
            highlight={1}
            size="mid"
            labelledBy="side-by-side-title"
          />
          <TableNote>
            Remento details checked on remento.co, its FAQ and its help centre on 17&nbsp;October&nbsp;2026.
            Weighing up more than two?{' '}
            <Link href="/compare/best-family-memory-apps" className={site.textLink}>
              See the best family memory apps, compared honestly.
            </Link>
          </TableNote>
        </ArticleSection>

        {/* Choosing */}
        <ArticleSection
          id="which-to-choose"
          kicker="Choosing"
          dot="var(--c2)"
          title={
            <>
              Which should <Accent tone="blue">you choose?</Accent>
            </>
          }
        >
          <Reading>
            <h3>Remento is the better fit if:</h3>
            <ul>
              <li>the storyteller will happily talk but never write, and you want their words typed up;</li>
              <li>you want the printed book to play their voice through QR codes;</li>
              <li>they would rather not install anything, and a link by email or text suits them;</li>
              <li>you want a long book: 200 pages are included, and up to 380 are possible.</li>
            </ul>
            <h3>Ancestorii is the better fit if:</h3>
            <ul>
              <li>you want brothers, sisters, cousins and grandparents all adding, not one storyteller;</li>
              <li>you want voices kept on the photos they describe, alongside albums and timelines;</li>
              <li>you would rather start free and pay only for what you print, or £3.99 a month for the family;</li>
              <li>you want to lay out the book yourself, or add a canvas or acrylic print later.</li>
            </ul>
            <p>
              If you are also weighing up StoryWorth, which sends weekly questions by text or email and
              prints a book after a year, our{' '}
              <Link href="/compare/storyworth-alternative">StoryWorth alternative</Link> page covers
              it.
            </p>
          </Reading>
        </ArticleSection>

        <QuoteBlock>
          Remento records one storyteller beautifully.{' '}
          <Accent tone="blue">Ancestorii keeps the stories that belong to the whole family.</Accent>
        </QuoteBlock>

        {/* Using both */}
        <ArticleSection
          id="using-both"
          kicker="Using both"
          dot="var(--c3)"
          title={
            <>
              Can you use <Accent tone="pink">both?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Yes, and they fit together well. Remento says every recording can be downloaded at any
              time, even after you stop renewing. You can upload a downloaded file to Ancestorii as a
              voice note on the photo or memory it belongs to, where the rest of the family can hear
              it and add their own. Anything not already in M4A is converted automatically. Check the
              file size first: the Free plan takes files up to 20&nbsp;MB, and Premium up to 10&nbsp;GB.
            </p>
            <p>
              One way to split the work: let Remento capture one parent&apos;s long stories for their
              book, and use Ancestorii for everything around it, from the photo albums and a timeline
              of their life to the memories and voices the rest of the family adds.
            </p>
          </Reading>
        </ArticleSection>

        {/* Where Ancestorii helps */}
        <ArticleSection
          id="where-ancestorii-helps"
          kicker="Where Ancestorii helps"
          dot="var(--c0)"
          title={
            <>
              Where does Ancestorii <Accent tone="blue">help most?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Ancestorii helps most when the stories belong to more than one person: a
              grandmother&apos;s memories, her children&apos;s versions of the same holidays and the
              voices of everyone who was there. It keeps them in one private space that only your
              family can see, and nothing goes public unless you publish it on Our Stories, the free
              public story feed.
            </p>
            <p>
              The Free plan needs no card and includes 1&nbsp;GB of storage for the family and one Loved
              Ones profile. Premium is £3.99 a month for the whole family, not per person, with
              100&nbsp;GB, unlimited Loved Ones profiles and 10% off prints. It is monthly only, and you can
              cancel at any time.
            </p>
            <p>
              When you want something to hold, a <Link href="/memory-books">Memory Book</Link> costs
              £44.99 for 24 pages, £54.99 for 36 or £64.99 for 48, each plus delivery. Standard UK
              delivery is £4.99 and takes 10 to 14 working days, and books ship to 20 countries.
            </p>
          </Reading>
        </ArticleSection>

        {/* Questions */}
        <ArticleSection
          id="questions"
          kicker="Questions"
          dot="var(--c1)"
          title={
            <>
              Things people <Accent tone="pink">ask us.</Accent>
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
          size="md"
          title={
            <>
              Every voice.
              <br />
              One family library.
            </>
          }
          lead="Free to start. No card needed. Invite the whole family."
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
