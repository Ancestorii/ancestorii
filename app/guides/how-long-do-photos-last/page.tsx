import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { CassetteTape, Disc3, Droplets, HardDrive, Layers, Snowflake, Sun, Thermometer, Usb } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import site from '@/components/site/site.module.css';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { GuideFigure, Point, Points, Step, Steps, Tip, Tips } from '../_components/GuideBlocks';

const PATH = '/guides/how-long-do-photos-last';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How Long Do Photos Last? Prints, Discs, Drives';
const HEADLINE = 'How long do photos last?';
const DESCRIPTION =
  'Well-processed fibre-based black-and-white prints are light-stable, colour fades even in the dark and badly stored discs can fail in 2 to 10 years.';
const PUBLISHED = '2026-10-17';
const CRUMB = 'How Long Do Photos Last?';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How long do photos last?' }],
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
    q: 'Do old photos fade if they’re kept in the dark?',
    a: 'Colour photos do. The Canadian Conservation Institute says the dyes in colour photographs appear to be the only visual art materials that fade appreciably in the dark, and they can turn yellow too. Well-processed black-and-white prints are more stable. Cool, dry, steady storage slows colour fading.',
  },
  {
    q: 'How long do printed photos last?',
    a: 'It depends on the print. Well-processed black-and-white prints on fibre-based paper are essentially stable to light, while colour prints can fade within decades at room temperature. The New York State Archives says home inkjet prints will probably fade or change colour, and only black-and-white laser printouts will likely last for decades.',
  },
  {
    q: 'How long do CDs and DVDs last?',
    a: 'From a couple of years to more than 200, according to the Canadian Conservation Institute. Gold CD-Rs with phthalocyanine dye were rated at over 100\u00a0years, while badly stored discs can fail in 2 to 10. Keep discs upright in their cases, cool and dry, and copy anything important onto newer storage.',
  },
  {
    q: 'How long does an external hard drive last?',
    a: 'Nobody can say for a single drive: the New York State Archives notes there is no certain way to predict the lifespan of an individual drive. Across 344,196 drives in its data centres, Backblaze recorded an annualised failure rate of 1.36% in 2025. Treat any one drive as something that could fail tomorrow, and keep a second copy elsewhere.',
  },
  {
    q: 'Can faded colour photos be restored?',
    a: 'Not chemically. The Canadian Conservation Institute says faded colour photographs are thought to be impossible to restore chemically, because the loss of dye is irreversible. You can scan the print and correct the colours on the digital copy, but the original stays as it is, so keep it cool and dark to slow further fading.',
  },
];

const KEY_FACTS = [
  <>
    Well-processed <strong>black-and-white prints on fibre-based paper</strong> are essentially stable to
    light, says the Canadian Conservation Institute.
  </>,
  <>
    <strong>Colour dyes fade even in the dark</strong>, and faded colour photos are thought to be
    impossible to restore chemically.
  </>,
  <>
    Fresh <strong>acetate film</strong> at 21°C and 50% humidity reaches the onset of vinegar syndrome in
    about <strong>40&nbsp;years</strong>; at 80% humidity, about 17.
  </>,
  <>
    <strong>Recordable CDs and DVDs</strong> last from a couple of years to over 200, and can fail in{' '}
    <strong>2 to 10&nbsp;years</strong> if stored badly.
  </>,
  <>
    Backblaze’s 2025 annualised failure rate for <strong>hard drives</strong> was{' '}
    <strong>1.36%</strong>, across 344,196 drives in its data centres.
  </>,
  <>
    A <strong>digital photo</strong> lasts as long as its copies: check them yearly and copy them to new
    storage every five years.
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'Canadian Conservation Institute',
    title: 'Care of Black-and-White Photographic Prints (CCI Notes 16/4)',
    href: 'https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/care-black-white-photographic-prints.html',
    date: 'revised 2007',
  },
  {
    publisher: 'Canadian Conservation Institute',
    title: 'Care of Colour Photographic Materials (CCI Notes 16/5)',
    href: 'https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/care-colour-photographic-materials.html',
    date: 'revised 2007',
  },
  {
    publisher: 'US National Archives',
    title: 'How to Preserve Family Archives: Storing Family Papers and Photographs',
    href: 'https://www.archives.gov/preservation/family-archives/storing',
    date: 'last reviewed September\u00a02025',
  },
  {
    publisher: 'Library of Congress',
    title: 'Care, Handling, and Storage of Photographs',
    href: 'https://www.loc.gov/preservation/care/photo.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Library of Virginia',
    title: 'Oh Snap: Preserving Your Photographs (Virginia Archives Month zine)',
    href: 'https://www.lva.virginia.gov/sites/default/files/chunked_uploads/Archives%20Month%20Poster%2025%20%281%29.pdf',
    date: '2025',
  },
  {
    publisher: 'Image Permanence Institute',
    title: 'IPI Storage Guide for Acetate Film, by James M. Reilly',
    href: 'https://www.filmcare.org/pdf/acetate_guide.pdf',
    date: '1993',
  },
  {
    publisher: 'The National Archives (UK)',
    title: 'Caring for your photographs',
    href: 'https://www.nationalarchives.gov.uk/documents/archivesconservation_photo.pdf',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'New York State Archives',
    title: 'Family History: Digital Media',
    href: 'https://www.archives.nysed.gov/preservation/family-records-digital-media',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Canadian Conservation Institute',
    title: 'Longevity of Recordable CDs, DVDs and Blu-rays (CCI Notes 19/1)',
    href: 'https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/longevity-recordable-cds-dvds.html',
    date: 'revised 2019',
  },
  {
    publisher: 'Backblaze',
    title: 'Backblaze Publishes 2025 Drive Stats Report',
    href: 'https://ir.backblaze.com/news/news-details/2026/Backblaze-Publishes-2025-Drive-Stats-Report-13-Years-of-Data-Show-a-Growing-Healthier-Drive-Fleet/default.aspx',
    date: '12\u00a0February\u00a02026',
  },
  {
    publisher: 'Council on Library and Information Resources',
    title: 'Magnetic Tape Storage and Handling: How Long Will Magnetic Media Last? by John Van Bogart',
    href: 'https://www.clir.org/pubs/reports/pub54/4life_expectancy/',
    date: '1995',
  },
  {
    publisher: 'Library of Congress',
    title: 'Personal Archiving: Digital Photos',
    href: 'https://digitalpreservation.gov/personalarchiving/photos.html',
    date: 'accessed October\u00a02026',
  },
];

// Room above the key facts and the author box, and above the sources (a section's step).
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function HowLongDoPhotosLastPage() {
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
              How long do{' '}
              <br />
              <Accent>photos last?</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              It depends on what the photo is made of. A well-processed black-and-white print on fibre-based paper is essentially stable to light; colour prints, slides and negatives fade even in the dark; badly stored CDs and DVDs can fail in as little as 2 to 10&nbsp;years; and a digital photo lasts only as long as someone keeps copying it to new storage.
            </Lead>
            <p>
              None of these is a sell-by date. The figures below come from archives, conservation scientists and published drive data, and most of them shift a long way with heat, damp and care. Use them to decide what to protect, copy or scan first.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <GuideSection
            title={
              <>
                How long do black-and-white <Accent tone="pink">prints last?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                A very long time, if they were processed well and are kept cool and dry. The Canadian Conservation Institute (CCI) says well-processed silver gelatin prints on fibre-based paper are essentially stable to light, and that there is no published evidence that light alone makes black-and-white images fade or discolour.
              </p>
              <p>
                What harms them is chemistry. CCI says leftover processing chemicals contribute to the decay of silver images, and that pollutants such as hydrogen sulphide, peroxides, ozone and sulphur dioxide discolour the image when combined with high humidity or heat.
              </p>
              <p>There are two exceptions to watch for.</p>
            </Prose>
            <Points>
              <Point icon={Layers} title="Resin-coated (RC) paper.">
                Introduced in the late 1960s, it is considered less suitable for keeping images over very long periods, meaning hundreds of years, and is more sensitive to light on display.
              </Point>
              <Point icon={Sun} title="Victorian albumen prints.">
                Much more sensitive to light too, CCI says. The Library of Virginia describes them as thin paper prints, usually mounted on card, made from about the 1850s to the 1890s.
              </Point>
            </Points>
          </GuideSection>

          <GuideSection
            title={
              <>
                Why do colour photos fade, <Accent tone="pink">even in a drawer?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Because the picture is made of dyes, and once a dye breaks down the loss is permanent. CCI says the dyes in colour photographs appear to be the only visual art materials that fade appreciably in the dark, and that colour photos can build up stains in the dark too, such as white areas turning yellow. Colour materials are also more sensitive to humidity and heat than black-and-white ones.
              </p>
              <p>
                The US National Archives says colour negatives, slides and prints are vulnerable to fading and deterioration within decades at room temperature. The Library of Virginia notes that chromogenic colour prints, made from about the 1940s to the present, may have a yellowish or reddish cast once faded.
              </p>
              <p>
                Cold slows it down. The Library of Congress recommends 4°C (40°F) or below for colour photographs and film negatives, and CCI calls cold storage the most effective preservation measure for large collections of colour photographs. At home, the practical version is the coolest steady room you have; see <Link href="/guides/how-to-store-old-photos">how to store old photos</Link>.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How long do negatives <Accent tone="pink">and slides last?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Film has two clocks. In colour film the dyes fade, and in most film the base itself slowly decays. A great many films made since the 1920s are cellulose acetate, and the Image Permanence Institute (IPI) says amateur roll films marked “Safety” are likely to be acetate, apart from a few recent ones. Acetate breaks down in a reaction called vinegar syndrome: a vinegar smell first, then buckling, shrinking and brittleness. IPI’s predictions for fresh acetate film show how much the room matters:
              </p>
            </Prose>
            <Tips>
              <Tip icon={Droplets}>
                <strong>21°C (70°F) at 80% humidity:</strong> about 17&nbsp;years to the onset of vinegar syndrome.
              </Tip>
              <Tip icon={Thermometer}>
                <strong>21°C (70°F) at 50% humidity:</strong> about 40&nbsp;years.
              </Tip>
              <Tip icon={Snowflake}>
                <strong>13°C (55°F) at 40% humidity:</strong> about 150&nbsp;years.
              </Tip>
            </Tips>
            <Prose>
              <p>
                Those figures mark the start of the problem, not the end of the film. IPI says that at the onset the film smells of vinegar but is still usable, and that decay then speeds up. The National Archives (UK) says film negatives can give off acidic gases as they age, so keep them away from prints, and CCI advises duplicating valuable slides and projecting the copies. Our guide to <Link href="/guides/how-to-digitize-slides-and-negatives">digitising slides and negatives</Link> explains how to rescue them.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How long do home <Accent tone="pink">inkjet prints last?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Not as long as you might hope. The New York State Archives says prints made at home are not permanent, even on a laser printer with “photo quality” paper. Inkjet inks are more stable than they used to be, it says, but inkjet printouts will probably fade or change colour over time, and only black-and-white laser printouts will likely last for decades.
              </p>
              <p>
                It also warns that some photo lab prints won’t stand the test of time. For prints meant to last decades, it suggests a lab that prints on an archival medium, PVC-free enclosures and a dark, cool place, with home prints kept for frames and display.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How long do CDs, DVDs, <Accent tone="pink">drives and tapes last?</Accent>
              </>
            }
          >
            <Points>
              <Point icon={Disc3} title="CDs, DVDs and Blu-rays.">
                From a couple of years to more than 200, the Canadian Conservation Institute found, depending on the disc and how it is kept. CD-Rs with phthalocyanine dye and a gold layer were rated at over 100&nbsp;years; several formats, including BD-R and DVD-RW, at 5 to 10. Badly stored discs can fail in as little as 2 to 10&nbsp;years.
              </Point>
              <Point icon={HardDrive} title="Hard drives.">
                Backblaze, which publishes figures for the drives in its data centres, recorded an annualised failure rate of 1.36% across 344,196 drives in 2025, roughly 14 drives in every 1,000 over a year. For a single drive in a drawer, the New York State Archives says there is no certain way to know how long it will last.
              </Point>
              <Point icon={Usb} title="USB sticks and memory cards.">
                Handy for moving files, but the New York State Archives advises against using flash drives, memory cards or rewritable CD-RW and DVD-RW discs as your main backup.
              </Point>
              <Point icon={CassetteTape} title="Video and audio tape.">
                A 1995 guide, now published by the Council on Library and Information Resources, put thirty years as the upper limit for magnetic tape, including video and audio tapes. Anything recorded before about 1996 is now older than that; see{' '}
                <Link href="/guides/how-to-digitize-home-videos" className={site.textLink}>
                  digitising home videos
                </Link>
                .
              </Point>
            </Points>
          </GuideSection>

          <GuideSection
            title={
              <>
                So how long does a <Accent tone="pink">digital photo last?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                As long as someone keeps copying it. A file doesn’t fade like a print, but the drive, disc or online account it lives on can fail, wear out or close, and the New York State Archives says there is no certain way to predict how long any one drive, disc or tape will last.
              </p>
            </Prose>
            <Steps>
              <Step number="01" title="Keep at least two copies, in different places.">
                <p>The Library of Congress says more copies are better, kept as far apart as practical. CCI suggests three copies on at least two types of storage, one of them off-site.</p>
              </Step>
              <Step number="02" title="Check them once a year.">
                <p>Open them at least once a year to make sure they can still be read, as the Library of Congress advises.</p>
              </Step>
              <Step number="03" title="Copy them to new storage every few years.">
                <p>Every five years, says the Library of Congress; every three to five, says the New York State Archives, because the risk of failure rises each year.</p>
              </Step>
              <Step number="04" title="Keep the best version.">
                <p>Save the highest quality copy of each photo (Library of Congress). For scans, the New York State Archives suggests a TIFF master and JPEG copies for sharing.</p>
              </Step>
            </Steps>
            <Prose>
              <p>
                Our guide to <Link href="/guides/how-to-back-up-family-photos">backing up family photos</Link> turns this into a routine.
              </p>
            </Prose>
          </GuideSection>

          <PullQuote>
            Every format wears out.{' '}
            <Accent tone="blue">Copies are what last.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                How it <Accent tone="pink">helps.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Ancestorii isn’t a backup service, so keep your own copies as above. What it adds is a home the whole family uses. Scanned photos go into your family’s private <Link href="/features/family-library">Library</Link> and albums alongside the names, dates, stories and voice notes that explain them. Everyone you invite can see them on the website, and albums open in the free iPhone and Android app too. The knowledge stops depending on one shoebox, one drive or one person’s memory.
              </p>
              <p>
                When you want something on paper, a <Link href="/memory-books">Memory Book</Link> is an A4 landscape hardcover, from £44.99 plus delivery, made from your photos and written words. Books ship to 20 countries.
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
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">how long photos last.</Accent>
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
              Formats wear out.
              <br />
              <Accent tone="pink">The story can stay.</Accent>
            </>
          }
        >
          Start with the photos that matter most and the people who remember them.
        </GuideCta>
      </SiteShell>
    </>
  );
}
