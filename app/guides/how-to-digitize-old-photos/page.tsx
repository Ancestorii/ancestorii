import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  Building2,
  Contrast,
  Crop,
  FileImage,
  Film,
  Layers,
  Maximize2,
  Palette,
  ScanLine,
  Share2,
  Smartphone,
  ZoomIn,
} from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { Compare, CompareRow, GuideFigure, Point, Points, Step, Steps, Tip, Tips } from '../_components/GuideBlocks';

const PATH = '/guides/how-to-digitize-old-photos';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Digitise Old Photos: Best Scan Settings';
const HEADLINE = 'How to digitise old photos';
const DESCRIPTION =
  'Scan old prints at 300 dpi, or 400 to 600 dpi to enlarge, keep a TIFF master and two copies. Library of Congress settings, file names and storage tips.';
const PUBLISHED = '2026-10-17';
const CRUMB = 'How to Digitise Old Photos';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to digitise old photos' }],
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
    q: 'What dpi should I scan old photos at?',
    a: '300\u00a0dpi for standard 6\u00a0×\u00a04 and 7\u00a0×\u00a05\u00a0inch prints, which is the Library of Congress’s general guidance, and 400 or 600\u00a0dpi for any photo you might enlarge to 10\u00a0×\u00a08\u00a0inches or more. Very small prints and slides need far more.',
  },
  {
    q: 'Is TIFF or JPEG better for scanning old photos?',
    a: 'TIFF for the master, JPEG for sharing. TIFF keeps everything the scanner captured and can be compressed without losing any data, while JPEG discards some data to make smaller files. Keep the TIFF safe and make fresh JPEG copies from it whenever you need them.',
  },
  {
    q: 'Should I scan black-and-white photos in colour or greyscale?',
    a: 'Greyscale suits true black-and-white prints and makes files a third of the size of colour ones. Scan sepia, warm-toned or hand-coloured prints in colour so the tone survives.',
  },
  {
    q: 'Should I keep the original prints after scanning?',
    a: 'Yes. A scan is a copy, and files only last if someone keeps copying and checking them. Store the prints somewhere cool, dry and dark; the Library of Congress advises against lofts, cellars and spots near radiators or along outside walls.',
  },
  {
    q: 'How many copies of my scans should I keep?',
    a: 'At least two, stored as far apart as practical, says the Library of Congress, and more is better. Check once a year that the files still open, and copy them to fresh storage about every five years.',
  },
];

const KEY_FACTS = [
  <>
    <strong>300&nbsp;dpi</strong> for standard 6&nbsp;×&nbsp;4 and 7&nbsp;×&nbsp;5&nbsp;inch prints, and <strong>400 or 600&nbsp;dpi</strong>{' '}
    if you might enlarge them to 10&nbsp;×&nbsp;8&nbsp;inches or more (Library of Congress).
  </>,
  <>
    Save a <strong>TIFF master</strong>, the preferred format for preservation, and make{' '}
    <strong>JPEG copies</strong> to share.
  </>,
  <>
    <strong>Greyscale</strong>, up to 256 grey tones, suits black-and-white prints. Scan sepia and
    hand-coloured prints in colour.
  </>,
  <>
    Start every file name with the date as <strong>yyyymmdd</strong>, for example{' '}
    <span style={{ whiteSpace: 'nowrap' }}>19870614-beach-001.tif</span>.
  </>,
  <>
    Keep <strong>at least two copies</strong> as far apart as practical, check them once a year and move
    them to fresh storage about every five years.
  </>,
  <>
    <strong>35mm slides</strong> are far smaller than prints, so they need <strong>around 1,900&nbsp;dpi</strong>.
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
    title: 'Scanning Your Personal Collections (earlier handout)',
    href: 'https://www.digitalpreservation.gov/personalarchiving/documents/scanning_collections.pdf',
    date: '2011',
  },
  {
    publisher: 'Library of Congress, The Signal',
    title: 'Personal Digital Archiving: The Basics of Scanning',
    href: 'https://blogs.loc.gov/thesignal/2014/03/personal-digital-archiving-the-basics-of-scanning/',
    date: '2014',
  },
  {
    publisher: 'Library of Congress',
    title: 'Personal Archiving: Digital Photos',
    href: 'https://digitalpreservation.gov/personalarchiving/photos.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Care, Handling, and Storage of Photographs',
    href: 'https://www.loc.gov/preservation/care/photo.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Preservation Guidelines for Digitizing Library Materials',
    href: 'https://www.loc.gov/preservation/care/scan.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Federal Agencies Digital Guidelines Initiative (FADGI)',
    title: 'Technical Guidelines for Digitizing Cultural Heritage Materials, Third Edition',
    href: 'https://www.digitizationguidelines.gov/guidelines/digitize-technical.html',
    date: '2023',
  },
  {
    publisher: 'Smithsonian Institution Archives',
    title: 'You Asked, We Answered: Taking Care of Your Own Archives',
    href: 'https://siarchives.si.edu/blog/you-asked-we-answered-taking-care-your-own-archives',
    date: '2010',
  },
  {
    publisher: 'US National Park Service',
    title: 'Conserve O Gram 14/6: Caring for Color Photographs',
    href: 'https://www.nps.gov/subjects/museums/upload/14-06_508.pdf',
    date: '1998',
  },
];

// Space above the key facts card and the author box, and above the sources (one section step),
// in the reading column.
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function DigitiseOldPhotosPage() {
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
              How to digitise{' '}
              <br />
              <Accent>old photos.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              To digitise old photos, clean the scanner glass, scan standard prints at 300&nbsp;dpi (400 to 600&nbsp;dpi if you might enlarge them), save a lossless TIFF master and a JPEG copy to share, start
              each file name with the date, and keep at least two copies in different places. Those
              settings come from the Library of Congress’s guidance on personal collections, and most home
              flatbed scanners can manage them.
            </Lead>
            <p>
              This guide covers each setting, handling the prints, naming the files and what to do
              afterwards. No scanner? See our guide to{' '}
              <Link href="/guides/how-to-scan-photos-with-your-phone">scanning photos with your phone</Link>.{' '}
              <Link href="/guides/how-to-digitize-slides-and-negatives">Slides and negatives</Link> need much
              higher settings and have a guide of their own.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <GuideSection
            title={
              <>
                What resolution should you <Accent tone="pink">scan old photos at?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                The Library of Congress’s advice for personal collections: scan documents and 6&nbsp;×&nbsp;4 or 7&nbsp;×&nbsp;5&nbsp;inch prints at 300&nbsp;dpi, and use 400 or 600&nbsp;dpi for any print you might enlarge to 10&nbsp;×&nbsp;8&nbsp;inches or more. An earlier version of the handout adds that anything above 600&nbsp;dpi may be
                unnecessary for prints, since more dots also mean bigger files.
              </p>
              <p>
                Dpi (dots per inch, often used interchangeably with ppi) counts the pixels captured for each
                inch of the original. At 300&nbsp;dpi a 6&nbsp;×&nbsp;4&nbsp;inch print becomes 1,800&nbsp;×&nbsp;1,200&nbsp;pixels, enough to
                reprint it at the same size. At 600&nbsp;dpi it becomes 3,600&nbsp;×&nbsp;2,400&nbsp;pixels, enough for a 12&nbsp;×&nbsp;8&nbsp;inch print at 300&nbsp;pixels per inch.
              </p>
              <p>
                Archives aim a little higher. The Federal Agencies Digital Guidelines Initiative (FADGI),
                written by US federal agencies including the Library of Congress and the National
                Archives, asks for 400&nbsp;ppi for photographic prints at its three-star level, “a very good
                professional image”, and 600&nbsp;ppi at its top level. If you are unsure, scan at 600&nbsp;dpi: it
                sits at the top of both ranges, and you only have to handle a fragile print once.
              </p>
            </Prose>

            <Tips>
              <Tip icon={ScanLine}>
                <strong>Standard prints</strong>, 6&nbsp;×&nbsp;4 and 7&nbsp;×&nbsp;5&nbsp;inch (about 15&nbsp;×&nbsp;10 and 18&nbsp;×&nbsp;13&nbsp;cm): 300&nbsp;dpi.
              </Tip>
              <Tip icon={Maximize2}>
                <strong>Prints you might enlarge</strong> to 10&nbsp;×&nbsp;8&nbsp;inches or more: 400 or 600&nbsp;dpi.
              </Tip>
              <Tip icon={ZoomIn}>
                <strong>Very small prints</strong>, an inch or two across: around 1,400 to 1,500&nbsp;dpi, the
                Library of Congress’s blog suggests.
              </Tip>
              <Tip icon={Film}>
                <strong>35mm slides</strong>: around 1,900&nbsp;dpi. Negatives: at least 1,500 to 2,000&nbsp;dpi.
              </Tip>
            </Tips>
          </GuideSection>

          <GuideSection
            title={
              <>
                Should you save scans as <Accent tone="pink">TIFF or JPEG?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Both, for different jobs. The Library of Congress’s digital preservation blog calls TIFF “the
                preferred format for digital photo preservation” because it keeps the most of what the
                scanner captured, and LZW compression can shrink a TIFF without losing any data. JPEG’s
                compression is “lossy”: it makes small files by discarding some of the data.
              </p>
            </Prose>
            <Tips>
              <Tip icon={FileImage}>
                <strong>Keep a TIFF as the master.</strong> Leave it as it came off the scanner. You can’t get
                lost detail back out of a JPEG.
              </Tip>
              <Tip icon={Share2}>
                <strong>Make JPEG copies to share.</strong> For email, phones and websites, made fresh from the
                master whenever you need one. If your software only saves JPEG, use its highest quality for
                anything you might reprint.
              </Tip>
              <Tip icon={Crop}>
                <strong>Edit a copy, never the master.</strong> FADGI doesn’t allow colour correction or
                restoration on master images, only on access copies, so crop, brighten and repair a copy.
              </Tip>
            </Tips>
          </GuideSection>

          <GuideSection
            title={
              <>
                <span style={{ whiteSpace: 'nowrap' }}>Black-and-white</span> prints:{' '}
                <Accent tone="pink">greyscale or colour?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                The Library of Congress names greyscale, a palette of up to 256 grey tones, as best for
                black-and-white photographs. With the usual settings of 8-bit greyscale and 24-bit colour, a
                greyscale scan is a third of the size.
              </p>
            </Prose>
            <Points>
              <Point
                icon={Contrast}
                title={
                  <>
                    True <span style={{ whiteSpace: 'nowrap' }}>black-and-white</span> prints.
                  </>
                }
              >
                Greyscale, at a third of the file size.
              </Point>
              <Point icon={Palette} title="Sepia, warm-toned or hand-tinted prints.">
                Colour, so the tone survives. Plenty of old “black-and-white” prints are really one of these,
                and greyscale strips that out.
              </Point>
            </Points>
            <Prose>
              <p>
                When in doubt, scan in colour; a greyscale copy takes seconds to make later. FADGI images every
                photograph in colour at its three-star level and above, black-and-white originals included.
              </p>
            </Prose>
          </GuideSection>

          <PullQuote>
            Scan it once, properly.{' '}
            <Accent tone="blue">Then make every copy from the master.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                How should you prepare <Accent tone="pink">and handle old prints?</Accent>
              </>
            }
          >
            <Steps>
              <Step number="01" title="Clean the glass, gently.">
                <p>
                  Dust and hair on the glass scan straight into the picture. The Library of Congress suggests
                  a plain, lint-free cloth dampened with water, never spraying water onto the scanner.
                </p>
              </Step>
              <Step number="02" title="Handle prints by the edges.">
                <p>
                  Use clean, dry hands or nitrile gloves and keep your fingers off the image. Lift each print
                  off the glass by sliding a sheet of paper underneath.
                </p>
              </Step>
              <Step number="03" title="Take off clips, staples and tape.">
                <p>
                  Remove anything attached, and only brush off dirt if you can do it without damage. Never
                  add tape, sticky notes or glue to a photograph.
                </p>
              </Step>
              <Step number="04" title="Leave space between prints.">
                <p>Leave about half an inch between prints so the software can recognise them as separate photos.</p>
              </Step>
              <Step number="05" title="Never force a curled or stuck print.">
                <p>
                  FADGI says tightly curled photographs must not be forced flat, and the Library of Congress
                  may exclude curled, cracked or stuck photographs from digitising. Photograph an album page
                  as it is instead.
                </p>
              </Step>
            </Steps>

            <Prose>
              <p>
                If there is writing on the back of a print, scan that side too and add “-back” to the file
                name. Our guide to <Link href="/guides/how-to-label-old-photos">labelling old photos</Link>{' '}
                covers what to write, and how.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Flatbed scanner, phone <Accent tone="pink">or scanning service?</Accent>
              </>
            }
          >
            <Points>
              <Point icon={ScanLine} title="A flatbed scanner.">
                Even, glare-free light and full control of dpi and format. FADGI lists flatbeds among its
                recommended tools for prints, alongside digital cameras.
              </Point>
              <Point icon={Smartphone} title="Your phone.">
                Quick, and kind to prints that shouldn’t be moved: the Smithsonian Institution Archives notes
                that photographing is one way to digitise very fragile items. Glare needs more care.
              </Point>
              <Point icon={Layers} title="A sheet-fed photo scanner.">
                Fast for piles of sturdy prints, which it pulls through rollers. The Library of Congress
                doesn’t accept form-feed equipment for photographs in its own collections, so keep fragile
                and precious prints off it.
              </Point>
              <Point icon={Building2} title="A scanning service.">
                Worth it for thousands of prints. The Smithsonian suggests looking for experience, good
                equipment, quality checks, customer recommendations and industry standards. Ask what dpi and
                format you will get back.
              </Point>
            </Points>
          </GuideSection>

          <GuideSection
            title={
              <>
                How should you name <Accent tone="pink">and file the scans?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Start every file name with the date. The Library of Congress recommends a yyyymmdd structure
                at the beginning of the name, such as{' '}
                <span style={{ whiteSpace: 'nowrap' }}>20100915-wedding.jpg</span>, folders within folders, and a
                naming system you keep consistent. With the date first, files sort themselves into order.
              </p>
              <ul>
                <li>
                  <strong>Folders by person, place or event</strong>, such as Family Photos / 1987 Spain.
                </li>
                <li>
                  <strong>File names by date, subject and number</strong>, such as{' '}
                  <span style={{ whiteSpace: 'nowrap' }}>19870614-beach-001.tif</span>.
                </li>
                <li>
                  <strong>Unknown dates</strong>: fill the parts you don’t know with zeros, such as{' '}
                  <span style={{ whiteSpace: 'nowrap' }}>19620000-wedding-001.tif</span>, so the file still sorts
                  by year.
                </li>
              </ul>
              <p>
                The Library also suggests keeping a printed summary of what is where alongside your storage.
                Who is in a photo, and why it matters, belongs in a caption rather than a file name; our guide
                to <Link href="/guides/what-to-do-with-old-family-photos">what to do with old family photos</Link>{' '}
                covers that part.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What should you do <Accent tone="pink">once everything is scanned?</Accent>
              </>
            }
          >
            <Compare labels={['Where scans often end up', 'What keeps them safe']}>
              <CompareRow left="One folder on one laptop" right="At least two copies, stored as far apart as practical" />
              <CompareRow
                left="Files called IMG_0042.jpg"
                right={
                  <>
                    Names that start with the date, such as{' '}
                    <span style={{ whiteSpace: 'nowrap' }}>19870614-beach-001.tif</span>
                  </>
                }
              />
              <CompareRow left="Edits saved over the scan" right="The master left as scanned, with edits made on a copy" />
              <CompareRow left="Copies left on old drives for years" right="Files checked once a year and moved to fresh storage every five years or so" />
              <CompareRow left="Prints thrown away after scanning" right="Originals kept somewhere cool, dry and dark" />
            </Compare>

            <Prose>
              <p>
                The Library of Congress suggests one copy on your computer and others on separate media, such
                as portable drives or online storage, kept in different places. Our guide to{' '}
                <Link href="/guides/how-to-back-up-family-photos">backing up family photos</Link> explains the
                3-2-1 rule. And keep the prints: the US National Park Service’s guidance on colour
                photographs is to use digital copies for access, not preservation.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Where does <Accent tone="pink">Ancestorii fit in?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Scanning gives you files. Ancestorii is where your family looks at them and adds what they
                know. On the website, upload JPEG copies to your{' '}
                <Link href="/features/family-library">family Library</Link>, up to 20 at a time, into folders
                you can give a name, a description and a date. iPhone HEIC photos are converted to JPEG
                automatically.
              </p>
              <p>
                Then put the best into albums, where each photo can carry a name, a date as loose as “Summer&nbsp;1994”, a thread called The Story that relatives add to, and voice notes. Only the people you
                invite can see them.
              </p>
            </Prose>
            {/* Alison's photo is only 651px wide, so its frame is never wider than that
                (it would turn soft); centred in the reading column. */}
            <div style={{ maxWidth: 651, marginInline: 'auto' }}>
              <GuideFigure
                src="/Testimonial2.png"
                alt="Alison and her dad holding his printed Ancestorii Memory Book"
                label="Alison · Nevada, US"
                color="var(--c2)"
                position="50% 30%"
              />
            </div>
            <Prose>
              <p>
                The Free plan gives the whole family 1&nbsp;GB, with files up to 20&nbsp;MB. Premium, at £3.99 a month
                per family, gives 100&nbsp;GB and files up to 10&nbsp;GB. A 600&nbsp;dpi colour TIFF of a 6&nbsp;×&nbsp;4&nbsp;inch print is
                about 26&nbsp;MB before compression, so upload JPEGs and keep the TIFF masters in your own
                backups. Ancestorii is for sharing and explaining photos, not a replacement for those copies.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">digitising old photos.</Accent>
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
              Photos scanned.
              <br />
              <Accent tone="pink">
                Now <span style={{ whiteSpace: 'nowrap' }}>the stories.</span>
              </Accent>
            </>
          }
        >
          Upload them, invite the family, and let everyone add what they remember.
        </GuideCta>
      </SiteShell>
    </>
  );
}
