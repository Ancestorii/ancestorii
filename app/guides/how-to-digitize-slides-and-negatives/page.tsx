import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Building2, Camera, Film, Hand, Layers, Maximize2, Projector, ScanLine, Split } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { Point, Points, Step, Steps, Tip, Tips } from '../_components/GuideBlocks';

const PATH = '/guides/how-to-digitize-slides-and-negatives';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Digitise Slides and Negatives at Home';
const HEADLINE = 'How to digitise slides and negatives';
const DESCRIPTION =
  'Scan 35mm slides at around 1,900 dpi or more, handle film by its edges and spot vinegar syndrome early. Library of Congress and archive advice, explained.';
const PUBLISHED = '2026-10-17';
const CRUMB = 'How to Digitise Slides and Negatives';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to digitise slides and negatives' }],
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
    q: 'What dpi should I use to scan 35mm slides?',
    a: 'Around 1,900\u00a0dpi, the Library of Congress suggests, which turns a 35mm frame into roughly 2,700\u00a0×\u00a01,800\u00a0pixels, enough for a 9\u00a0×\u00a06\u00a0inch print. Use 3,000 or 4,000\u00a0dpi, the higher levels in the US federal FADGI guidelines, for slides you might print larger.',
  },
  {
    q: 'Can I scan negatives on an ordinary flatbed scanner?',
    a: 'Only if it has a light in the lid for film. A flatbed normally reads light reflected off a print, but film has to be lit from behind. Check that its optical resolution reaches at least 2,000\u00a0dpi, and set the software to the right film type so it turns the negative into a positive.',
  },
  {
    q: 'Why do my old negatives smell of vinegar?',
    a: 'It is the typical sign of vinegar syndrome: acetate film breaking down and giving off acetic acid. The US National Archives advises isolating affected film so it doesn’t start decay in the film around it, and copying it as a priority. Cool, dry storage slows the decay, but nothing reverses it.',
  },
  {
    q: 'Do Kodachrome slides fade?',
    a: 'Less than most. Henry Wilhelm’s research, as summarised by the US National Park Service, ranks Kodachrome among the most stable slide films, as long as it isn’t projected often. Ektachrome, Ansco and GAF slides are on its list of less stable films to copy first.',
  },
  {
    q: 'Should I keep slides and negatives after scanning them?',
    a: 'Yes. A scan is a copy made with today’s equipment, and well-kept film can be scanned again later at higher settings. Store it cool, dry and dark, in paper sleeves if it is acetate or nitrate, away from lofts, cellars and radiators. Nitrate film needs a specialist’s advice.',
  },
];

const KEY_FACTS = [
  <>
    <strong>Around 1,900&nbsp;dpi</strong> for slides (Library of Congress), and{' '}
    <strong>at least 1,500 to 2,000&nbsp;dpi</strong> for negatives.
  </>,
  <>
    The US federal FADGI guidelines set <strong>3,000&nbsp;ppi</strong> for a very good professional scan of
    35mm film, and 4,000&nbsp;ppi for their top level.
  </>,
  <>
    A strong <strong>vinegar smell</strong> means acetate film is decaying: keep it apart from other film
    and digitise it first (US National Archives).
  </>,
  <>
    Film edge-marked <strong>NITRATE</strong> can be a serious fire risk. Have it copied by a specialist,
    not scanned at home.
  </>,
  <>
    Fresh acetate film at 21°C and 50% humidity is predicted to reach the onset of vinegar syndrome in
    about <strong>40&nbsp;years</strong>; at 16°C and 40%, about <strong>100</strong> (Image Permanence
    Institute).
  </>,
  <>
    Colour dyes fade even in the dark, and faded colour photographs <strong>can’t be restored
    chemically</strong> (Canadian Conservation Institute).
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
    publisher: 'Library of Congress, The Signal',
    title: 'Personal Digital Archiving: The Basics of Scanning',
    href: 'https://blogs.loc.gov/thesignal/2014/03/personal-digital-archiving-the-basics-of-scanning/',
    date: '2014',
  },
  {
    publisher: 'Federal Agencies Digital Guidelines Initiative (FADGI)',
    title: 'Technical Guidelines for Digitizing Cultural Heritage Materials, Third Edition',
    href: 'https://www.digitizationguidelines.gov/guidelines/digitize-technical.html',
    date: '2023',
  },
  {
    publisher: 'US National Archives',
    title: 'Film-Based Negatives and Positives',
    href: 'https://www.archives.gov/preservation/holdings-maintenance/film-based',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Image Permanence Institute',
    title: 'IPI Storage Guide for Acetate Film (James M. Reilly)',
    href: 'https://www.filmcare.org/pdf/acetate_guide.pdf',
    date: '1993',
  },
  {
    publisher: 'Library of Congress',
    title: 'Care, Handling, and Storage of Photographs',
    href: 'https://www.loc.gov/preservation/care/photo.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Canadian Conservation Institute',
    title: 'Care of Colour Photographic Materials (CCI Notes 16/5)',
    href: 'https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/care-colour-photographic-materials.html',
    date: 'revised 2007',
  },
  {
    publisher: 'US National Park Service',
    title: 'Conserve O Gram 14/6: Caring for Color Photographs',
    href: 'https://www.nps.gov/subjects/museums/upload/14-06_508.pdf',
    date: '1998',
  },
  {
    publisher: 'Kodak',
    title: 'Photography',
    href: 'https://www.kodak.com/en/company/page/photography-history/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Kodak, via Imaging Resource',
    title: 'Kodak Retires KODACHROME Film; Celebrates Life of Oldest Film Icon in its Portfolio',
    href: 'https://www.imaging-resource.com/NEWS/1245710948.html',
    date: '2009',
  },
  {
    publisher: 'International Center of Photography',
    title: 'Kodachrome',
    href: 'https://www.icp.org/content/kodachrome',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Epson',
    title: 'Removing Dust and Scratch Marks from Film and Slides Using Digital ICE',
    href: 'https://files.support.epson.com/htmldocs/pr449p/pr449pug/projs_3.htm',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Smithsonian Institution Archives',
    title: 'You Asked, We Answered: Taking Care of Your Own Archives',
    href: 'https://siarchives.si.edu/blog/you-asked-we-answered-taking-care-your-own-archives',
    date: '2010',
  },
];

// Space above the key facts card and the author box, and above the sources (one section step),
// in the reading column.
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function DigitiseSlidesAndNegativesPage() {
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
              <Accent>slides and negatives.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              To digitise slides and negatives, blow off loose dust, scan them with a film scanner or a
              flatbed that has a light in its lid for film at roughly 1,500 to 2,000&nbsp;dpi or more (the
              Library of Congress suggests around 1,900&nbsp;dpi for slides), save TIFF masters, and scan
              any film that smells of vinegar first. Film is small, so it needs several times the resolution
              of a print to give a picture worth keeping.
            </Lead>
            <p>
              Prints need far less; our guide to{' '}
              <Link href="/guides/how-to-digitize-old-photos">digitising old photos</Link> covers them, and
              cine film has its own guide to{' '}
              <Link href="/guides/how-to-digitize-home-videos">digitising home videos</Link>.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <GuideSection
            title={
              <>
                Why does film need <Accent tone="pink">higher settings than prints?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Size. A 35mm frame measures 36&nbsp;×&nbsp;24&nbsp;mm, about 1.4&nbsp;×&nbsp;0.9&nbsp;inches. Scanned at the 300&nbsp;dpi that
                suits a print, it gives about 425&nbsp;×&nbsp;285&nbsp;pixels, barely a thumbnail. At the Library of
                Congress’s 1,900&nbsp;dpi it gives about 2,700&nbsp;×&nbsp;1,800&nbsp;pixels, enough for a 9&nbsp;×&nbsp;6&nbsp;inch print at
                300&nbsp;pixels per inch.
              </p>
              <p>
                Negatives add a second job. They are reversed, and colour negatives carry an orange mask,
                which FADGI describes as a dye mask designed for the colour paper they would be printed on.
                Scanner software has to invert and correct them, so set it to the right film type. FADGI also
                warns that no scan can reliably show how a negative would have printed in its day, and that
                colour negatives made before 1975 (the C-22 process) do not scan well. Treat the colours as
                a starting point, and adjust a copy rather than the master.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What resolution should you <Accent tone="pink">scan slides and negatives at?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                The Library of Congress’s scanning handout suggests around 1,900&nbsp;dpi for slides. Its digital
                preservation blog gives around 1,400 to 1,500&nbsp;dpi for slides and very small prints, and a
                minimum of 1,500 to 2,000&nbsp;dpi for negatives, with the master saved as a TIFF.
              </p>
              <p>
                Archives go further. For 35mm slides and negatives, FADGI sets 1,000&nbsp;ppi at one star, 2,000
                at two, 3,000 at three, which it calls “a very good professional image that is appropriate
                for most uses”, and 4,000 at four. For family film, 2,000 to 3,000&nbsp;dpi is a sensible middle,
                with 4,000 for the frames you love most. Higher settings mean bigger files:
              </p>
            </Prose>

            <Tips>
              <Tip icon={Film}>
                <strong>1,900&nbsp;dpi</strong>: about 2,700&nbsp;×&nbsp;1,800&nbsp;pixels, roughly 15&nbsp;MB as an uncompressed
                24-bit colour TIFF.
              </Tip>
              <Tip icon={ScanLine}>
                <strong>3,000&nbsp;dpi</strong>: about 4,250&nbsp;×&nbsp;2,830&nbsp;pixels, roughly 36&nbsp;MB.
              </Tip>
              <Tip icon={Maximize2}>
                <strong>4,000&nbsp;dpi</strong>: about 5,670&nbsp;×&nbsp;3,780&nbsp;pixels, roughly 64&nbsp;MB.
              </Tip>
              <Tip icon={Projector}>
                <strong>A full 80-slide Carousel tray</strong> at 3,000&nbsp;dpi: nearly 3&nbsp;GB of TIFF masters.
              </Tip>
            </Tips>
          </GuideSection>

          <GuideSection
            title={
              <>
                Film scanner, flatbed <Accent tone="pink">or camera?</Accent>
              </>
            }
          >
            <Points>
              <Point icon={ScanLine} title="A dedicated film scanner.">
                Built for 35mm strips and slides. Compare models by their optical resolution, not a figure
                enlarged by software.
              </Point>
              <Point icon={Layers} title="A flatbed with a film lid.">
                Slide trays are available for flatbed scanners, the Library of Congress notes. The lid has
                to light the film from behind.
              </Point>
              <Point icon={Camera} title="A camera copy set-up.">
                A camera over an even light source. FADGI lists digital cameras alongside film scanners and
                flatbeds for 35mm film, but says general-purpose lenses aren’t suitable for close-focus film
                copying and calls for flat-field lenses. A dim room cuts stray light.
              </Point>
              <Point icon={Building2} title="A scanning service.">
                The Smithsonian Institution Archives suggests looking for experience, good equipment, quality
                checks, customer recommendations and industry standards. Ask for TIFF files at the dpi you
                want, and how they handle damaged film.
              </Point>
            </Points>

            <Prose>
              <p>
                Some scanners include Digital ICE, which removes dust and scratch marks from colour film.
                Epson’s scanner guide says it doesn’t support Kodachrome, works on black-and-white negatives
                only if they are chromogenic film, and can make images look softer. For Kodachrome and
                ordinary black-and-white film, use the software’s standard dust removal, or retouch a copy.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Which film should you <Accent tone="pink">digitise first?</Accent>
              </>
            }
          >
            <Steps>
              <Step number="01" title="Anything that smells of vinegar.">
                <p>
                  A strong vinegar smell is the typical sign that acetate film is breaking down, along with
                  buckling, shrinking, bubbles or crystals. The US National Archives advises isolating it, so
                  it doesn’t start decay in nearby film, and copying it as a priority. Acetate is often
                  edge-marked “SAFETY”; it began replacing nitrate in the 1920s and was the main film base
                  until the 1970s.
                </p>
              </Step>
              <Step number="02" title="Anything marked NITRATE, but not at home.">
                <p>
                  Nitrate was the only film base from the 1890s to the 1920s and was made until the early
                  1950s; some is edge-marked “NITRATE”. Stored badly, it can be a serious fire risk, and the
                  US National Archives says it should be copied by a knowledgeable company or a person
                  trained to handle it.
                </p>
              </Step>
              <Step number="03" title="Colour film from less stable stock.">
                <p>
                  The US National Park Service, citing Henry Wilhelm’s research, lists Ektachrome, Ansco and
                  GAF slides, and Kodacolor-X, Kodacolor II, Ektacolor and Vericolor II negatives, among the
                  unstable colour films to copy first.
                </p>
              </Step>
            </Steps>
          </GuideSection>

          <PullQuote>
            If it smells of vinegar,{' '}
            <Accent tone="blue">it goes to the front of the queue.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                Do Kodachrome and <Accent tone="pink">other colour slides fade?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Kodak introduced Kodachrome in 1935 as the first commercially successful amateur colour
                film, and 35mm slides followed in 1936. Kodak’s Carousel projectors arrived in 1961 with a
                round tray that held 80 slides. Kodak announced the film’s retirement on 22&nbsp;June&nbsp;2009, after
                a 74-year run, and the last rolls were processed at Dwayne’s Photo in Parsons, Kansas, on 18&nbsp;January&nbsp;2011.
              </p>
              <p>
                All colour film changes in time. The Canadian Conservation Institute notes that dyes in
                colour photographs appear to be the only materials in a visual art medium to fade appreciably
                in the dark, and that faded colour photographs are thought to be impossible to restore
                chemically. Films differ, though: Henry Wilhelm’s research, as summarised by the US National
                Park Service, puts Kodachrome among the most stable slide films, as long as it isn’t
                projected often.
              </p>
              <p>
                Projection is the other risk. The National Park Service’s advice for museum collections is to
                use copies, never originals, for slide shows, and not to project an image for more than 30&nbsp;seconds. Scan the slides before anyone runs the projector again, and use the files for the
                next family slide show.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How should you store <Accent tone="pink">slides and negatives afterwards?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Cool, dry and stable. The Library of Congress recommends 30 to 50% relative humidity and 21°C
                (70°F) or below for photographs generally, and 4°C (40°F) or below for colour photographs and
                film negatives, where temperature controls how long they last. It also advises against
                lofts, cellars, radiators and outside walls.
              </p>
              <p>
                The Image Permanence Institute’s figures show why cool matters for acetate: fresh film kept at
                21°C and 50% relative humidity is predicted to reach the onset of vinegar syndrome in about 40&nbsp;years, and at 16°C and 40% in about 100. Once film has channelled or turned brittle, nothing
                reverses it.
              </p>
            </Prose>
            <Tips>
              <Tip icon={Layers}>
                <strong>Sleeves:</strong> paper for acetate and nitrate negatives (US National Archives).
                For slides, polypropylene or polyester pages are fine if humidity stays below 70%; avoid
                PVC (US National Park Service).
              </Tip>
              <Tip icon={Hand}>
                <strong>Handling:</strong> hold film by its edges and consider gloves, as the Library of
                Congress suggests for negatives. Don’t write on the film itself.
              </Tip>
              <Tip icon={Split}>
                <strong>Separation:</strong> keep negatives apart from prints, because some give off
                harmful gases as they age (Library of Congress).
              </Tip>
            </Tips>
            <Prose>
              <p>
                Our guides to <Link href="/guides/how-to-store-old-photos">storing old photos</Link> and{' '}
                <Link href="/guides/how-long-do-photos-last">how long photos last</Link> go into more
                detail.
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
                Once the slides are scanned, upload JPEG copies to your family Library on the Ancestorii
                website and give each carousel, box or holiday its own folder with a name, a description and
                a date. Then turn the best into{' '}
                <Link href="/features/family-photo-albums">family photo albums</Link>, where relatives add
                who is in each frame, the year, the story and a voice note.
              </p>
              <p>
                A slide show used to need a projector and everyone in one room. An album can be opened by
                everyone you invite, wherever they live. Albums are unlimited on every plan, and storage is
                shared by the whole family: 1&nbsp;GB on the Free plan, or 100&nbsp;GB on Premium at £3.99 a month per
                family. Keep the TIFF masters and the film itself in your own care.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">slides and negatives.</Accent>
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
              Off the carousel.
              <br />
              <Accent tone="pink">Into the album.</Accent>
            </>
          }
        >
          Scan the slides, then let everyone add who, where and when.
        </GuideCta>
      </SiteShell>
    </>
  );
}
