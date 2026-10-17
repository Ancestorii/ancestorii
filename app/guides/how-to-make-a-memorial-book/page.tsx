import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import {
  BookOpen,
  CalendarDays,
  FileText,
  Hand,
  HardDrive,
  Heart,
  Image as ImageIcon,
  Images,
  PenLine,
  Quote,
  ScanLine,
  Sparkles,
  Tag,
  Users,
} from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { GuideFigure, Point, Points, Step, Steps, Tip, Tips } from '../_components/GuideBlocks';

const PATH = '/guides/how-to-make-a-memorial-book';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Make a Memorial Book for a Loved One';
const HEADLINE = 'How to make a memorial book for a loved one';
const DESCRIPTION =
  'Gather photos and memories from the family, scan old prints at 300 or 600 dpi, add captions and a dedication, and leave time to print. Step by step.';
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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to make a memorial book' }],
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
// Book sizes, prices, layouts and delivery are the live Memory Book figures (October 2026).
const FAQ_PLAIN = [
  {
    q: 'What should I put in a memorial book?',
    a: 'Photos from every part of their life, a few things in their own handwriting, short memories from family and friends, the dates that shaped them, the words read at the funeral and a dedication. Give each photo a caption saying who, where and roughly when.',
  },
  {
    q: 'How many photos do I need for a memorial book?',
    a: 'It depends on the size of the book and how many photos go on each page. An Ancestorii Memory Book page holds one to four photos, so A Chapter’s 22 memory pages take 22 to 88 photos, A Story’s 34 take 34 to 136 and A Legacy’s 46 take 46 to 184.',
  },
  {
    q: 'How long does it take to make a memorial book?',
    a: 'Allow a week or two for the family to send photos and memories, a weekend to scan and choose, and an evening or two to design the pages. Standard delivery for an Ancestorii Memory Book then takes 10 to 14\u00a0working\u00a0days.',
  },
  {
    q: 'Can I order copies for the whole family?',
    a: 'Yes. Each Ancestorii order prints one copy of the book, so you order again for each extra copy, and delivery is charged on each order. Books ship to 20 countries, including the UK, Ireland, the United States, Canada, Australia and New Zealand.',
  },
  {
    q: 'What resolution do photos need to be for printing?',
    a: 'The Library of Congress suggests scanning ordinary prints at 300\u00a0dpi, and at 400 or 600\u00a0dpi if they will be enlarged to 10\u00a0×\u00a08\u00a0inches or more. Ancestorii prints its books at 300\u00a0dpi, and a full A4 page at that resolution is about 3,508\u00a0×\u00a02,480\u00a0pixels.',
  },
];

const KEY_FACTS = [
  <>
    <strong>Scan prints at 300&nbsp;dpi.</strong> The Library of Congress suggests 300&nbsp;dpi for ordinary
    6&nbsp;×&nbsp;4 and 7&nbsp;×&nbsp;5&nbsp;inch photos.
  </>,
  <>
    <strong>Enlarging? Use 400 or 600&nbsp;dpi.</strong> That is the Library of Congress’s advice for prints
    you will enlarge to 10&nbsp;×&nbsp;8&nbsp;inches or more, and a full A4 page (297&nbsp;×&nbsp;210&nbsp;mm, about 11.7&nbsp;×&nbsp;8.3&nbsp;inches) counts.
  </>,
  <>
    <strong>Handle with care.</strong> Wear gloves with old photographs and never press them flat under
    glass (Library of Congress).
  </>,
  <>
    <strong>Keeping a bond is healthy.</strong> In <em>Continuing Bonds</em> (1996), grief researchers
    Dennis Klass, Phyllis Silverman and Steven Nickman argued that grieving well can include an ongoing
    bond with the person who died.
  </>,
  <>
    <strong>Allow time to print.</strong> An Ancestorii Memory Book has 24, 36 or 48 printed pages,
    from £44.99 plus delivery, and standard delivery takes 10 to 14&nbsp;working&nbsp;days.
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'Library of Congress',
    title: 'Scanning Your Personal Collections (Personal Digital Archiving series)',
    href: 'https://www.digitalpreservation.gov/personalarchiving/documents/PA_scanning.pdf',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Preservation Guidelines for Digitizing Library Materials',
    href: 'https://www.loc.gov/preservation/care/scan.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Routledge',
    title: 'Continuing Bonds: New Understandings of Grief, edited by Dennis Klass, Phyllis R. Silverman and Steven Nickman',
    href: 'https://www.routledge.com/Continuing-Bonds-New-Understandings-of-Grief/Klass-Nickman-Silverman/p/book/9781560323396',
    date: '1996',
  },
  {
    publisher: 'Cruse Bereavement Support',
    title: 'Helpline',
    href: 'https://www.cruse.org.uk/get-support/helpline/',
    date: 'accessed October\u00a02026',
  },
];

// Space above a block that follows running text, and above the sources after the last section.
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function MemorialBookPage() {
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
            { name: 'How to Make a Memorial Book', path: PATH },
          ]),
          faqSchema(FAQ_PLAIN),
        ]}
      />

      <SiteShell>
        <GuideArticle
          crumb="How to Make a Memorial Book"
          title={
            <>
              How to make{' '}
              <br />
              <Accent>a memorial book.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              To make a memorial book, gather photos and short written memories from the people who knew
              them, scan old prints at 300&nbsp;dpi (or 600&nbsp;dpi if a small print will fill a page), arrange the
              pages in the order of their life, and add captions and a dedication. Then leave enough time
              for printing and delivery before the day you need it.
            </Lead>
            <p>
              It does not have to tell their whole life. A few dozen well-chosen photos, each with a line
              about who, where and why, will say more to the family than hundreds with no words at all.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <PullQuote>
            A photo tells you what someone looked like.{' '}
            <Accent tone="blue">It does not tell you who they were.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                What goes in <Accent tone="pink">a memorial book?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                A memorial book is a way of keeping someone close, and grief researchers see that as healthy.
                In <em>Continuing Bonds</em> (1996), Dennis Klass, Phyllis Silverman and Steven Nickman argued
                that grieving well can include an ongoing bond with the person who died, rather than cutting
                ties. Most memorial books draw on six kinds of material:
              </p>
            </Prose>
            <Points>
              <Point icon={Images} title="Photos from every part of their life.">
                Childhood, school, work, the wedding, the children, holidays, the last birthday. Look for every
                decade, not only the recent photos on someone’s phone.
              </Point>
              <Point icon={PenLine} title="Their own handwriting.">
                A recipe card, a birthday card, a note on the back of a photo. Scan it like a photo; their
                handwriting is as personal as their face.
              </Point>
              <Point icon={Users} title="Memories from family and friends.">
                A few lines from each person: how they met, something they always said, a day nobody will
                forget.
              </Point>
              <Point icon={CalendarDays} title="The dates that shaped them.">
                Born, married, moved, became a grandparent. A short timeline near the front helps younger
                readers follow the story.
              </Point>
              <Point icon={BookOpen} title="The words from the funeral.">
                The eulogy, a reading or a poem that was read on the day. It can open the book or close it.
              </Point>
              <Point icon={Heart} title="A dedication.">
                One or two lines at the front or on the back cover saying who the book is for, and from whom.
              </Point>
            </Points>
            <Prose>
              <p>
                If you are writing the eulogy as well, our guide on{' '}
                <Link href="/guides/how-to-write-a-eulogy">how to write a eulogy</Link> can help, and the
                finished words make a natural last page.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you gather photos <Accent tone="pink">from everyone?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                The hard part is usually collecting, not designing. Most relatives have a few photos nobody
                else has seen, scattered across lofts, albums and phones.
              </p>
            </Prose>
            <Steps>
              <Step number="01" title="Ask early, and give a date.">
                <p>Send the family one simple request with a deadline. “Your favourite photos of Dad by the 20th” is easier to act on than “anything you have”.</p>
              </Step>
              <Step number="02" title="Ask for favourites, not everything.">
                <p>Five to ten photos each is plenty. You want the ones that mean something, and a smaller pile is easier to choose from.</p>
              </Step>
              <Step number="03" title="Ask everyone for one memory in writing.">
                <p>Give them a prompt: the first time you met, something they always said, a day you will never forget. Two or three sentences is enough.</p>
              </Step>
              <Step number="04" title="Put it all in one place.">
                <p>Use one shared folder or family space rather than a dozen chat threads, and ask for the original photo files, not screenshots.</p>
              </Step>
              <Step number="05" title="Sit with the oldest relatives.">
                <p>
                  They can name the people in the old prints. Write the names down as you go; our guide to{' '}
                  <Link href="/guides/how-to-label-old-photos">labelling old photos</Link> shows how to do it
                  without damaging them.
                </p>
              </Step>
            </Steps>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you scan old photos <Accent tone="pink">for printing?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                The Library of Congress publishes simple guidance for families scanning their own photos. In
                short:
              </p>
            </Prose>
            <Tips>
              <Tip icon={Sparkles}>Clean the scanner glass, and take paper clips, staples and tape off the prints first.</Tip>
              <Tip icon={Hand}>Wear gloves to handle old photos, and never press one flat under a sheet of glass.</Tip>
              <Tip icon={ScanLine}>Scan ordinary 6&nbsp;×&nbsp;4 and 7&nbsp;×&nbsp;5&nbsp;inch prints at 300&nbsp;dpi.</Tip>
              <Tip icon={ImageIcon}>Use 400 or 600&nbsp;dpi for any print you will enlarge to 10&nbsp;×&nbsp;8&nbsp;inches or more.</Tip>
              <Tip icon={FileText}>If you save as JPEG, choose the high-quality setting for photos you plan to reprint.</Tip>
              <Tip icon={HardDrive}>Keep at least two copies of the scans, stored in different places.</Tip>
            </Tips>
            <Prose>
              <p>
                The enlargement rule matters for a book. A full A4 landscape page is 297&nbsp;×&nbsp;210&nbsp;mm, about
                11.7&nbsp;×&nbsp;8.3&nbsp;inches, so a small print used as a whole page needs 400 or 600&nbsp;dpi, and 600 leaves
                room to crop. Our guide to{' '}
                <Link href="/guides/how-to-digitize-old-photos">digitising old photos</Link> covers scanners,
                settings and file names in more detail.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How should you <Accent tone="pink">order the pages?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Most memorial books follow the life in order, from childhood to the last years, because that
                is how the family will read it. A few work better by theme, such as a book for a keen gardener
                that moves through the seasons. Here is one way to plan a book of about 34&nbsp;pages:
              </p>
            </Prose>
            <Steps>
              <Step number="01" title={'Opening: 2\u00a0pages.'}>
                <p>A favourite portrait, their name and dates, and the dedication or a short introduction.</p>
              </Step>
              <Step number="02" title={'Early years: 7\u00a0pages.'}>
                <p>Childhood, school, their parents and the places they grew up.</p>
              </Step>
              <Step number="03" title={'Love and family: 9\u00a0pages.'}>
                <p>Courtship, the wedding, children and grandchildren.</p>
              </Step>
              <Step number="04" title={'Work, places and passions: 7\u00a0pages.'}>
                <p>Jobs, homes, holidays, and the hobbies everyone associates with them.</p>
              </Step>
              <Step number="05" title={'Later years: 5\u00a0pages.'}>
                <p>Recent birthdays, family gatherings and ordinary days.</p>
              </Step>
              <Step number="06" title={'Memories and goodbye: 4\u00a0pages.'}>
                <p>Words from family and friends, the eulogy, and one last photo.</p>
              </Step>
            </Steps>
            <Prose>
              <p>
                Give the most important photos a page of their own and group everyday snaps four to a page.
                Leave space for words: a page with one photo and three lines about it gives the reader a
                reason to stop.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What should you <Accent tone="pink">write in it?</Accent>
              </>
            }
          >
            <Prose>
              <p>Words are what turn a photo album into a memorial book. You need three kinds:</p>
            </Prose>
            <Points>
              <Point icon={PenLine} title="A dedication.">
                One or two lines on who it is for and who made it, for example “For Mum, from all of us who
                miss her laugh.”
              </Point>
              <Point icon={Tag} title="Captions.">
                Who is in the photo, where it was taken, roughly when, and one line about why it matters.
              </Point>
              <Point icon={Quote} title="Their words and yours.">
                A saying they always repeated, a line from one of their letters, and the memories the family
                sent in.
              </Point>
            </Points>
            <Prose>
              <p>
                For page-by-page ideas, see{' '}
                <Link href="/guides/what-to-write-in-a-memory-book">what to write in a memory book</Link>.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How long does it take <Accent tone="pink">to make and print?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Most of the time goes on gathering. Give the family a week or two to send photos and
                memories, then a weekend to scan and choose. Designing takes an evening or two once you know
                which photos you are using. Then add printing and delivery: for an Ancestorii Memory Book,
                standard delivery is £4.99 and takes 10 to 14&nbsp;working&nbsp;days.
              </p>
              <p>
                If the funeral is sooner than that, there is no need to rush. Show the photos at the service
                and make the book for a later day, such as their birthday or the first anniversary, when
                everyone has had time to look through their own albums.
              </p>
              <p>
                And if making it feels like too much right now, it can wait. Cruse Bereavement Support runs a
                free helpline on <a href="tel:08088081677">0808&nbsp;808&nbsp;1677</a>.
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
                Ancestorii is a private family space, so the gathering and the making can happen in one place.
                Invite the family and everyone can add their photos to the shared Library, with iPhone HEIC
                photos converted to JPEG automatically. Then design a Memory Book on the website, page by
                page, from those photos.
              </p>
              <p>
                Every book is an A4 landscape hardcover, 297&nbsp;×&nbsp;210&nbsp;mm, with 200gsm gloss pages and a matte
                cover. There are three sizes: A Chapter (24 printed pages, £44.99), A Story (36&nbsp;pages,
                £54.99) and A Legacy (48&nbsp;pages, £64.99), all plus delivery. Pick the size first, because it
                cannot be changed once the book is created. Pages come in five layouts holding one to four
                photos, every photo can carry a heading and a comment, and there is a Dedication back cover
                and custom spine text.
              </p>
              <p>
                You can preview the book spread by spread and download a free PDF before you order. Each
                order prints one copy, so to give one to each branch of the family you order again, and
                delivery is charged each time. Books ship to 20 countries. Story Assistance, Ancestorii’s
                optional writing help, can suggest page headings, page descriptions and an introduction for
                you to edit.
              </p>
              <p>
                Andrea, from Dudley, made one about her dad: “I recently lost my dad, so this book became
                incredibly special. It captured the essence of him and the life he lived. Our family will
                treasure it for years to come.” See how <Link href="/memory-books">Memory Books</Link> work.
              </p>
            </Prose>
            {/* testimonial4.png is 639 by 655, so its frame is never wider than that (it would turn
                soft); the top-weighted crop keeps both faces and the book in the 5:4 frame. */}
            <div style={{ maxWidth: 639, marginInline: 'auto' }}>
              <GuideFigure
                src="/testimonial4.png"
                alt="Andrea holding her printed Ancestorii Memory Book about her dad"
                label="Andrea · Dudley, UK"
                color="var(--c0)"
                position="50% 20%"
              />
            </div>
          </GuideSection>

          <GuideSection
            title={
              <>
                Frequently asked <Accent tone="pink">questions.</Accent>
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
              Their life in photos.
              <br />
              <Accent tone="pink">Kept in one book.</Accent>
            </>
          }
        >
          Gather the family’s photos in one private place, then design and print a hardcover Memory Book.
        </GuideCta>
      </SiteShell>
    </>
  );
}
