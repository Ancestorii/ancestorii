import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  Box,
  Bug,
  ClipboardList,
  Eye,
  FileText,
  Mail,
  NotebookPen,
  PenLine,
  Ruler,
  ScanLine,
  Sun,
  Tag,
  Users,
} from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { Compare, CompareRow, Point, Points, Tip, Tips } from '../_components/GuideBlocks';

const PATH = '/guides/how-to-preserve-old-letters-and-documents';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Preserve Old Letters and Family Documents';
const HEADLINE = 'How to preserve old letters and documents';
const DESCRIPTION =
  'Store old letters flat in acid- and lignin-free folders, somewhere cool, dark and steady. Never laminate or tape them, and scan each page at 300 dpi.';
const PUBLISHED = '2026-10-17';
const CRUMB = 'How to Preserve Old Letters and Documents';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to preserve old letters and documents' }],
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
    q: 'Should I laminate old letters?',
    a: 'No. The New York State Archives says laminating special papers can be harmful and cannot be easily undone. For a brittle, torn or much-handled letter, use a clear polyester sleeve, as the US National Archives suggests; you can always take it out again.',
  },
  {
    q: 'How should I store old letters?',
    a: 'Unfolded and flat, in acid- and lignin-free folders inside an acid-free box, somewhere cool, dark and steady: below 75°F (about 24°C) and 65% relative humidity, says the US National Archives. Avoid lofts, cellars and garages, and take off clips, staples and rubber bands.',
  },
  {
    q: 'Are plastic wallets safe for old documents?',
    a: 'Use sleeves you know are polyester, which Icon, the Library of Congress and the US National Archives all mention, and avoid PVC and any plastic you can’t identify. Keep pencil and charcoal in paper folders, because polyester builds up static.',
  },
  {
    q: 'How do I preserve old newspaper cuttings?',
    a: 'Keep them away from other papers. The New York State Archives says clippings often become yellow and brittle quickly, and Icon says acidic papers discolour any papers they touch. Scan them, or photocopy them onto acid-free paper, and keep the copies with the family papers.',
  },
  {
    q: 'What dpi should I scan old letters at?',
    a: '300\u00a0dpi, the Library of Congress’s general setting for documents. Scan in colour to capture the paper and ink as they look, or in greyscale, which can show handwriting better than black-and-white scans. Scan the envelope too.',
  },
  {
    q: 'Should I wear gloves to handle old letters?',
    a: 'Clean, dry hands are usually better. Icon says old documents are best handled with clean, dry hands; gloves keep off dirt and grease but reduce your sense of touch, so take care with thin or damaged paper. The Library of Congress also asks for clean hands and a clean work area.',
  },
];

const KEY_FACTS = [
  <>
    Store letters <strong>unfolded and flat</strong> in <strong>acid- and lignin-free</strong> folders and boxes
    (Library of Congress; New York State Archives).
  </>,
  <>
    Keep them cool, dark and steady, below <strong>65% relative humidity</strong> to prevent mould (US National
    Archives). Not in the loft, cellar or garage.
  </>,
  <>
    <strong>Never laminate</strong>: it “can be harmful and cannot be easily undone” (New York State Archives).
  </>,
  <>
    No <strong>staples, paper clips, rubber bands, tape or glue</strong>. Old sticky tape is a job for a{' '}
    <strong>conservator</strong> (Icon, the Institute of Conservation).
  </>,
  <>
    Keep <strong>newspaper cuttings</strong> apart: acidic paper yellows and discolours the papers it touches
    (Icon).
  </>,
  <>
    Scan documents at <strong>300&nbsp;dpi</strong>. Greyscale can show handwriting better than black and white
    (Library of Congress).
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'New York State Archives',
    title: 'Paper (Family History preservation)',
    href: 'https://www.archives.nysed.gov/preservation/family-records-paper',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Icon, the Institute of Conservation',
    title: 'Documents and archives',
    href: 'https://www.icon.org.uk/conservation-hub/caring-for-your-collections/documents-and-archives.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Care, Handling and Storage of Works on Paper',
    href: 'https://www.loc.gov/preservation/care/paper.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'US National Archives',
    title: 'How to Preserve Family Archives (papers and photographs)',
    href: 'https://www.archives.gov/preservation/family-archives/storing',
    date: 'last reviewed September\u00a02025',
  },
  {
    publisher: 'Berkshire Record Office',
    title: 'Sellotape! (Emily Forster)',
    href: 'https://www.berkshirerecordoffice.org.uk/blog/sellotape',
    date: '1\u00a0March\u00a02026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Scanning Your Personal Collections (Personal Digital Archiving Series)',
    href: 'https://www.digitalpreservation.gov/personalarchiving/documents/scanning_collections.pdf',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Apple Support',
    title: 'Scan text and documents in Notes using the iPhone camera',
    href: 'https://support.apple.com/en-gb/guide/iphone/iph653f28965/ios',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Google Drive Help',
    title: 'Scan documents with Google Drive (Android phone and tablet)',
    href: 'https://support.google.com/drive/answer/3145835?hl=en-GB&co=GENIE.Platform%3DAndroid',
    date: 'accessed October\u00a02026',
  },
];

// Room above the key facts and the author box, and above the sources (a section's step).
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function HowToPreserveOldLettersPage() {
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
              How to preserve{' '}
              <br />
              <Accent>old letters and documents.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              To preserve old letters and documents, store them flat and unfolded in acid- and lignin-free folders and boxes somewhere cool, dark and steady, take off clips, staples and rubber bands, and never laminate or tape them. Then scan each page at 300&nbsp;dpi, so the originals can stay boxed while the family reads the copies.
            </Lead>
            <p>
              Paper rarely fails all at once. The New York State Archives names acidity, light and widely fluctuating temperature and humidity as the greatest threats to family papers.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <GuideSection
            title={
              <>
                Where should you store <Accent tone="pink">old letters?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Somewhere cool, dark and steady, in a room you live in. The Library of Congress recommends a cool, relatively dry (about 35% relative humidity), clean and stable place for works on paper. Icon, the UK’s Institute of Conservation, suggests 45 to 60%, and the US National Archives says to keep family papers below 75°F (about 24°C) and below 65% relative humidity to prevent mould, but not below 15%, which can make them brittle.
              </p>
              <p>
                The figures differ; the advice doesn’t. Avoid damp, heat and big swings, which rules out the loft, the cellar and the garage, and spots beside radiators or damp outside walls (Icon). Photos tucked inside letters need slightly different care: see our guide to{' '}
                <Link href="/guides/how-to-store-old-photos">storing old photos</Link>.
              </p>
            </Prose>
            <Tips>
              <Tip icon={Box}>
                <strong>Acid- and lignin-free folders and boxes.</strong> The Library of Congress and the US National Archives both recommend them, and the New York State Archives warns that “archival” does not mean the same thing as acid-free. Icon says ordinary brown envelopes and polythene bags are not suitable.
              </Tip>
              <Tip icon={Ruler}>
                <strong>The right size.</strong> Boxes should be big enough for papers to lie flat without folding or bending, and not overstuffed (US National Archives).
              </Tip>
              <Tip icon={Sun}>
                <strong>Darkness.</strong> Store papers in darkness and ration their time in the light (New York State Archives).
              </Tip>
              <Tip icon={Bug}>
                <strong>A yearly look.</strong> Icon suggests checking stored boxes regularly, for example once a year, for mould or pests.
              </Tip>
            </Tips>
          </GuideSection>

          <GuideSection
            title={
              <>
                Should you unfold <Accent tone="pink">old letters?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Yes, once, if the paper allows it. The New York State Archives says to avoid folding and unfolding papers, because it weakens them, and to store loose papers unfolded. Icon says folded items suffer from repeated folding and should be kept flat if possible. So open each letter gently, one time, and let it stay flat in its folder from then on.
              </p>
              <p>
                If the paper is brittle, cracks along a fold or resists, stop. Keep it as it is, in a folder of its own, and ask a conservator. Keep each envelope with its letter: the postmark and address are part of the story.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What about clips, staples <Accent tone="pink">and old tape?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                The Library of Congress says not to use paper clips, other fasteners, rubber bands, self-adhesive tape or glue on paper, and the New York State Archives says never to use staples, rubber bands, tape or glue on important papers. Icon says to carefully remove metal fastenings such as staples and paper clips if they are corroding and staining the document. If one won’t come out without tearing the paper, leave it for a conservator.
              </p>
              <p>
                Old sticky tape is a job for a professional. Icon says self-adhesive tapes leave yellow staining and sticky residue and are extremely difficult to remove, and that documents should only be cleaned or repaired by trained conservators. The Berkshire Record Office describes how a conservator does it: gentle heat to reactivate the adhesive, the tape lifted away, then a special crepe eraser for what is left behind.
              </p>
            </Prose>
            <Compare labels={['Avoid', 'Use instead']}>
              <CompareRow left="Folding letters back into their envelopes" right="Each letter flat in its own acid-free folder" />
              <CompareRow left="Staples, paper clips and rubber bands" right="A folder to keep a letter’s pages together" />
              <CompareRow left="Sticky tape on a tear" right="A polyester sleeve, and a conservator for the repair" />
              <CompareRow left="Brown envelopes, polythene bags and wooden boxes" right="Acid- and lignin-free folders and boxes" />
            </Compare>
          </GuideSection>

          <PullQuote>
            Store it flat, keep it dark,{' '}
            <Accent tone="blue">and let the scan do the travelling.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                Should you laminate <Accent tone="pink">old documents?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                No. The New York State Archives says not to laminate special papers, because the process can be harmful and cannot be easily undone. It gives the same caution about commercial deacidification products: consult a conservator before using them.
              </p>
              <p>
                For protection you can see through, use a clear polyester sleeve, which you can always take the letter out of. Icon says single sheets can be stored and handled in archival polyester sleeves, and the US National Archives lists unknown plastics and PVC among materials to avoid. Polyester has a catch: the Library of Congress notes it builds up static that can lift powdery media, so keep pencil and charcoal in a paper folder instead.
              </p>
              <p>
                Want it on the wall? Icon suggests displaying old documents only for limited periods, away from sunlight, in low light (preferably 50&nbsp;lux at most), and considering a photographic copy instead. A print of your scan lets the original stay in its box.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you keep <Accent tone="pink">newspaper cuttings?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Apart from everything else. The New York State Archives says highly acidic materials like newspaper clippings often become yellow and brittle quickly, Icon adds that they discolour any papers they touch, and the Library of Congress recommends storing acidic papers separately so the acid can’t migrate. Scan the cuttings, or photocopy them onto acid-free paper as the New York State Archives suggests, and file the copy with the letters it belongs to.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you scan <Accent tone="pink">old letters?</Accent>
              </>
            }
          >
            <Prose>
              <p>At 300&nbsp;dpi, which the Library of Congress gives as the general setting for documents in its handout on scanning personal collections.</p>
            </Prose>
            <Tips>
              <Tip icon={ScanLine}>
                <strong>300&nbsp;dpi, 600 at most.</strong> The handout suggests 400 or 600&nbsp;dpi for photos you plan to enlarge and says anything above 600 may be unnecessary.
              </Tip>
              <Tip icon={Eye}>
                <strong>Colour or greyscale.</strong> Colour captures the natural look of paper and ink. Greyscale may show handwriting better than black-and-white (bitonal) scans, the Library of Congress says.
              </Tip>
              <Tip icon={FileText}>
                <strong>PDF for long letters.</strong> A PDF can combine several pages in one file, and may let you create searchable text.
              </Tip>
              <Tip icon={Mail}>
                <strong>Every side, and the envelope.</strong> Backs of pages, notes in the margins and postmarks all carry information.
              </Tip>
              <Tip icon={Tag}>
                <strong>Date-first file names.</strong> The handout suggests starting each file name with the date as yyyymmdd, such as 19440612-<span style={{ whiteSpace: 'nowrap' }}>letter-from-dad.jpg</span>.
              </Tip>
            </Tips>
            <Prose>
              <p>
                No scanner? In the iPhone Notes app, Scan Documents captures a page automatically when it detects the edges and saves the result as a PDF, and the Google Drive app on Android can save a scan as a PDF or a JPG. Our guide to{' '}
                <Link href="/guides/how-to-scan-photos-with-your-phone">scanning with your phone</Link> covers glare and settings. Then keep at least two copies in different places, as the Library of Congress advises, and put the originals back in their box.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you keep <Accent tone="pink">the story behind it?</Accent>
              </>
            }
          >
            <Prose>
              <p>A scan saves the page. It won’t tell anyone who “Bill” was, why the letter was kept or what happened next.</p>
            </Prose>
            <Points>
              <Point icon={PenLine} title="Write down what you know.">
                Who wrote it, to whom, when and where from, and how it reached the family.
              </Point>
              <Point icon={ClipboardList} title="Keep a simple list.">
                The Library of Congress suggests printing a brief summary of what you have and keeping it with your copies as a quick-reference inventory.
              </Point>
              <Point icon={NotebookPen} title="Transcribe the hard ones.">
                Old handwriting defeats many readers. A typed transcription means anyone can read it, and you can search it later.
              </Point>
              <Point icon={Users} title="Ask while you can.">
                Show the letters to the oldest relatives and record what they say about the writer and the people named.
              </Point>
            </Points>
            <Prose>
              <p>
                Our guide to{' '}
                <Link href="/guides/how-to-create-a-family-archive">creating a family archive</Link> shows how letters fit with photos, recordings and certificates. And if reading old letters makes you want to leave one, see{' '}
                <Link href="/guides/how-to-write-a-legacy-letter">how to write a legacy letter</Link>.
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
                Ancestorii keeps the copies and the context together, privately. Upload a photo or scan of each page to a private{' '}
                <Link href="/features/family-photo-albums">family album</Link>, give it a name and a date in plain words such as “Spring&nbsp;1944”, and the relatives you invite can add their written memories and voice notes. A recording of someone reading the letter aloud, or explaining who wrote it, sits right beside the page. You can also add it to a moment on your{' '}
                <Link href="/features/family-timeline">family timeline</Link>. Only the family members you invite can see it.
              </p>
              <p>
                Ancestorii takes images rather than PDFs, so upload each page as a JPEG or phone photo. Story Assistance, the optional writing help that is on by default and can be switched off, can suggest a caption for you to edit. The Free plan needs no card and includes 1&nbsp;GB of storage shared by the family; Premium is £3.99 a month per family, with 100&nbsp;GB. Keep the originals boxed and your own backups too.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions people <Accent tone="pink">ask.</Accent>
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
              Save the letter.
              <br />
              <Accent tone="pink">Keep its story.</Accent>
            </>
          }
        >
          Scan the pages, box the originals, and let the family add what they know.
        </GuideCta>
      </SiteShell>
    </>
  );
}
