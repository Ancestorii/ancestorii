import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { FileImage, FileText, Film, Images, Mail, Medal, Mic, ScanLine } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import {
  Compare,
  CompareRow,
  GuideFigure,
  Point,
  Points,
  Prompt,
  Prompts,
  Step,
  Steps,
  Tip,
  Tips,
} from '../_components/GuideBlocks';

const PATH = '/guides/how-to-create-a-family-archive';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Create a Family Archive: A Practical Plan';
const HEADLINE = 'How to create a family archive: a practical plan';
const DESCRIPTION =
  'Decide what to keep, store the originals safely, digitise the best, record the stories and keep copies in two places. A plan built on archivists’ advice.';
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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to create a family archive' }],
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
    q: 'What should go in a family archive?',
    a: 'Anything that records your family’s life and would be hard to replace: photographs, slides and negatives, letters and diaries, certificates and official papers, recordings, and objects with a story. Keep the items that capture something unique about a person or help tell an important family story.',
  },
  {
    q: 'How do I store a family archive at home?',
    a: 'Somewhere cool, dry and dark, on a shelf in a room you live in rather than the loft, cellar or garage. The US National Archives recommends keeping papers and photographs below 75°F (about 24°C) and below 65% relative humidity, in lignin-free, acid-free boxes, with photo storage that has passed the Photographic Activity Test.',
  },
  {
    q: 'Should I digitise everything?',
    a: 'No. Start with what is most at risk or most important, such as fading colour photographs and slides, acidic newspaper cuttings and anything only one relative holds. The Library of Congress suggests scanning documents and standard prints at 300\u00a0dpi. Keep the originals after scanning.',
  },
  {
    q: 'Who should look after the family archive?',
    a: 'Agree one keeper for the originals, write down who it is and where everything is kept, and store that note with the inventory. Share digital copies with the rest of the family and keep them under the 3-2-1 backup rule, so the archive never depends on one person.',
  },
  {
    q: 'Can I donate family papers to an archive?',
    a: 'Yes, if they have wider historical significance. The New York State Archives suggests considering a donation to a historical repository that will preserve the items and make them accessible to the public. Talk to the archive first, and keep scans of anything you give.',
  },
];

const KEY_FACTS = [
  <>
    <strong>Four steps.</strong> The Library of Congress’s method for digital photos works for a whole
    archive: identify what you have, decide what matters, organise it, then make copies kept in
    different places.
  </>,
  <>
    <strong>Cool and dry.</strong> Store originals below 75°F (about 24°C) and 65% relative humidity,
    away from damp basements, garages and hot attics (US National Archives).
  </>,
  <>
    <strong>The right boxes.</strong> Use boxes and folders that are lignin-free and acid-free, and for
    photographs, storage that has passed the Photographic Activity Test, or PAT (US National Archives).
  </>,
  <>
    <strong>“Archival” is not a standard.</strong> The New York State Archives notes that archival
    does not mean the same thing as acid-free.
  </>,
  <>
    <strong>Record the room.</strong> Before clearing a loved one’s home, video the room or photograph
    the things in it, whether or not you are keeping them (New York State Archives).
  </>,
  <>
    <strong>Paperwork for recordings.</strong> The Oral History Society recommends a Joint Statement
    of Intent, filled in by both people after an interview and kept with the recording.
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'Library of Congress',
    title: 'Digital Photos: Personal Archiving',
    href: 'https://digitalpreservation.gov/personalarchiving/photos.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Scanning Your Personal Collections (Personal Digital Archiving series)',
    href: 'https://www.digitalpreservation.gov/personalarchiving/documents/PA_scanning.pdf',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'US National Archives',
    title: 'How to Preserve Family Archives: Storing Family Papers and Photographs',
    href: 'https://www.archives.gov/preservation/family-archives/storing',
    date: '2025',
  },
  {
    publisher: 'Image Permanence Institute, RIT',
    title: 'Photographic Activity Test',
    href: 'https://www.rit.edu/ipi/photographic-activity-test',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'New York State Archives',
    title: 'What to Save',
    href: 'https://www.archives.nysed.gov/preservation/family-records-what-to-save',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'New York State Archives',
    title: 'Paper',
    href: 'https://www.archives.nysed.gov/preservation/family-records-paper',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'New York State Archives',
    title: 'Digital Media',
    href: 'https://www.archives.nysed.gov/preservation/family-records-digital-media',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Oral History Society',
    title: 'Oral history and family history',
    href: 'https://ohs.org.uk/for-family-historians/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Oral History Society',
    title: 'Advice about equipment',
    href: 'https://ohs.org.uk/for-beginners/equipment/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'US-CERT (now CISA)',
    title: 'Data Backup Options',
    href: 'https://www.cisa.gov/sites/default/files/publications/data_backup_options.pdf',
    date: '2012',
  },
];

// Space above a block that follows running text, and above the sources after the last section.
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function CreateFamilyArchivePage() {
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
            { name: 'How to Create a Family Archive', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <GuideArticle
          crumb="How to Create a Family Archive"
          title={
            <>
              How to create{' '}
              <br />
              <Accent>a family archive.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              To create a family archive, gather everything in one place, decide what is worth keeping, store
              the originals in acid-free boxes somewhere cool and dry, digitise the most important items,
              write down who, what, when and why for each one, keep at least two copies of the digital files,
              and agree who will look after it next.
            </Lead>
            <p>
              That order follows the advice archivists give families, from the Library of Congress’s four
              steps for keeping digital photos to the US National Archives’ guidance on storing papers and
              photographs at home. You can do it one box at a time.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <PullQuote>
            A box of papers is not an archive. <Accent tone="blue">A box someone can understand is.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                What belongs in <Accent tone="pink">a family archive?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Anything that records your family’s life and would be hard to replace. It helps to think in
                five groups:
              </p>
            </Prose>
            <Points>
              <Point icon={Images} title="Photographs, slides and negatives.">
                Prints in albums and envelopes, slides in boxes, negatives in sleeves, and the digital
                photos on everyone’s phones.
              </Point>
              <Point icon={Mail} title="Letters, cards and diaries.">
                The handwriting matters as much as the words, so keep the best originals after scanning.
              </Point>
              <Point icon={FileText} title="Certificates and papers.">
                Birth, marriage and death certificates, service records, wills, school reports and work
                papers.
              </Point>
              <Point icon={Mic} title="Recordings.">
                Cassettes, home videos, voicemails and voice notes, plus any interviews you record with
                relatives.
              </Point>
              <Point icon={Medal} title="Objects.">
                Medals, jewellery, a recipe tin, a uniform. You may not keep them all, but photograph each
                one and write down its story.
              </Point>
            </Points>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you decide <Accent tone="pink">what to keep?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                You will not keep everything, and you do not need to. The New York State Archives suggests
                asking a few questions of each item, especially when you are sorting the belongings of
                someone who has died:
              </p>
            </Prose>
            <Prompts>
              <Prompt
                question="Does it capture something unique about the person?"
                context="A letter in their handwriting usually does. A folder of gas bills usually does not."
              />
              <Prompt
                question="Does it help tell an important family story?"
                context="Ask it of groups as well as single items. A year of letters can tell a story no single letter tells."
              />
              <Prompt
                question="Are there several similar items?"
                context="If so, the archivists suggest you might keep just one or two. Twenty school photos can become the best three."
              />
              <Prompt
                question="Do you have the space, now and in a few years?"
                context="And is that space safe enough? An item you cannot store well may be better photographed and passed on."
              />
            </Prompts>
            <Prose>
              <p>
                The same archivists add two pieces of advice. Photograph or video a set of items, or a whole
                room, before you take it apart, whether or not you are keeping the items. And if something
                has wider historical significance, consider donating it to a historical repository that will
                preserve it and make it public.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How should you store <Accent tone="pink">the originals?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Cool, dry, dark and flat. The US National Archives recommends keeping family papers and
                photographs below 75°F (about 24°C), and says the lower the temperature, the longer they
                last. Keep relative humidity below 65% to prevent mould, but not below 15%, which can make
                them brittle. Keep them out of damp basements, garages and hot
                attics, away from pipes and windows, and on a shelf rather than the floor. In most British
                homes that rules out the loft, the cellar and the garage, and points to a cupboard in a room
                you live in.
              </p>
            </Prose>
            <Compare labels={['Avoid', 'Use instead']}>
              <CompareRow left="Rubber bands, paper clips, sticky tape and glue" right="Acid-free folders, and photo corners with no adhesive" />
              <CompareRow left="Self-stick “magnetic” albums and PVC sleeves" right="Sleeves made of polyester, polypropylene or polyethylene" />
              <CompareRow left="Folding papers to fit the box" right="Boxes big enough for everything to lie flat" />
              <CompareRow left="Laminating a fragile document" right="A polyester sleeve for anything brittle, torn or handled often" />
              <CompareRow left="Trusting the word “archival” on a label" right="Checking for acid-free, lignin-free and PAT-passed" />
            </Compare>
            <Prose>
              <p>
                Two more points. Newspaper cuttings are highly acidic and yellow quickly, so the New York
                State Archives suggests keeping them apart from other papers and copying them onto acid-free
                paper. And the US National Archives warns that colour negatives, slides and prints can fade
                within decades at room temperature, which makes them a priority for scanning. Our guide to{' '}
                <Link href="/guides/how-to-preserve-old-letters-and-documents">
                  preserving old letters and documents
                </Link>{' '}
                goes further.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What should you <Accent tone="pink">digitise first?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Scan what is most at risk and most important first: colour photographs and slides that are
                fading, cuttings that are yellowing, anything only one relative holds, and anything the
                family asks about most. A scan protects the content if the original is lost and makes it easy
                to share, but it does not replace the original. The Library of Congress gives these settings:
              </p>
            </Prose>
            <Tips>
              <Tip icon={ScanLine}>Documents and standard prints (6 by 4&nbsp;inches and 7 by 5&nbsp;inches): 300&nbsp;dpi.</Tip>
              <Tip icon={Images}>Prints you may want to enlarge to 10 by 8&nbsp;inches or more: 400 or 600&nbsp;dpi.</Tip>
              <Tip icon={Film}>Slides: around 1,900&nbsp;dpi, because they are so much smaller than prints.</Tip>
              <Tip icon={FileImage}>Colour photos you may reprint: high-quality JPEG. The New York State Archives prefers uncompressed TIFF master copies, with JPEG copies to share.</Tip>
            </Tips>
            <Prose>
              <p>
                Name and file the scans the same way as your digital photos. Our guide to{' '}
                <Link href="/guides/how-to-organize-family-photos">organising family photos</Link> sets out a
                system.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you record the stories <Accent tone="pink">behind each item?</Accent>
              </>
            }
          >
            <Steps>
              <Step number="01" title="Give every item a number.">
                <p>Write it on the folder or envelope that holds the item, and use it in the scan’s file name. The Oral History Society recommends unique numbers for recordings so they can be found later, and the idea works for everything.</p>
              </Step>
              <Step number="02" title="Write down who, what, when and why.">
                <p>Who is in it or who wrote it, what it is, roughly when and where, and why it was kept. A line of each is enough.</p>
              </Step>
              <Step number="03" title="Keep an inventory.">
                <p>A simple list or spreadsheet: number, description, date, people, where the original is and where the scan is. The Library of Congress suggests keeping a copy of your inventory with your important papers.</p>
              </Step>
              <Step number="04" title="Record the people who remember.">
                <p>Ask relatives about the items while you can, and record the answers. For family interviews, the Oral History Society recommends a Joint Statement of Intent covering the purpose, who owns the copyright, any access restrictions and where the recording will be kept, filled in by both of you afterwards and kept with the recording.</p>
              </Step>
            </Steps>
            <Prose>
              <p>
                Our guide to{' '}
                <Link href="/guides/how-to-record-family-stories">recording family stories</Link> will help
                with the conversations.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Who looks after <Accent tone="pink">the archive next?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Agree a keeper while everyone can still talk about it. One person should hold the original
                boxes, because papers split between three houses stop being a set. Write down who the keeper
                is, where the boxes are and where the digital copies live, and keep that note with the
                inventory.
              </p>
              <p>
                Digital copies are what let the whole family share the archive. Keep them under the 3-2-1
                rule that US-CERT recommends for any important file: three copies, on two types of storage,
                one of them off-site. Our guide to{' '}
                <Link href="/guides/how-to-back-up-family-photos">backing up family photos</Link> explains
                how, and it applies to scans and recordings too.
              </p>
              <p>
                For recordings kept in the family, the Oral History Society says you have a duty to store
                and back up the files, keep the signed statement with them and honour any access
                restrictions the speaker asked for. If the family cannot agree on what to keep, the New York
                State Archives suggests getting help to build agreement first.
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
                Boxes of originals need one keeper, but the digital side of an archive can belong to
                everyone. Ancestorii gives your family one private space for it. Scans go into a shared
                Library of folders, each with a name, description and date. Each person can have a Loved One
                profile with their dates and life story; the Free plan covers one loved one, and Premium, at
                £3.99 a month per family, covers as many as you need. Timelines put dated events in order,
                albums hold photos with their stories and voice notes, and capsules keep letters and photos
                sealed until a date you choose.
              </p>
              <p>
                Everyone you invite sees the same archive and can add to it, and only the person who added
                something can delete it, so the archive does not depend on one person’s laptop. It does not
                replace the boxes or your own backups; it is the part the family actually opens. Read more
                about what a <Link href="/living-library">living family library</Link> is.
              </p>
              <p>
                Some families also print the best of it. Below, Alison and her dad hold his printed Memory
                Book, open at an old family photograph and a 1949 draft card.{' '}
                <Link href="/memory-books">Memory Books</Link> start at £44.99 plus delivery.
              </p>
            </Prose>
            <div style={{ maxWidth: 651, marginInline: 'auto' }}>
              <GuideFigure
                src="/Testimonial2.png"
                alt="Alison and her dad holding his printed Ancestorii Memory Book"
                label="Alison · Nevada, US"
                color="var(--c3)"
                position="50% 45%"
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
            <FaqList items={FAQ} variant="open" />
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
              Protect the box.
              <br />
              <Accent tone="pink">Share the stories.</Accent>
            </>
          }
        >
          Give your family one private place for the scans, the stories and the voices.
        </GuideCta>
      </SiteShell>
    </>
  );
}
