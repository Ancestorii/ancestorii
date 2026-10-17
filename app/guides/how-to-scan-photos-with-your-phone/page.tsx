import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Camera, Crosshair, FileImage, Grid3x3, Sparkles, StickyNote } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { Compare, CompareRow, Point, Points, Step, Steps, Tip, Tips } from '../_components/GuideBlocks';

const PATH = '/guides/how-to-scan-photos-with-your-phone';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Scan Photos With Your Phone (Without Glare)';
const HEADLINE = 'How to scan photos with your phone';
const DESCRIPTION =
  'Scan old photos with your phone: a free glare-free app, soft side light, the right camera settings, and how phone scans compare with the 300 ppi standard.';
const PUBLISHED = '2026-10-17';
const CRUMB = 'How to Scan Photos With Your Phone';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to scan photos with your phone' }],
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
    q: 'Is a phone scan as good as a flatbed scanner?',
    a: 'For everyday prints it can come close. Any recent phone camera has far more pixels than the Library of Congress’s 300\u00a0ppi needs for a 6\u00a0×\u00a04\u00a0inch print. A flatbed still gives more even, glare-free light, so use one for photos you plan to enlarge or that matter most.',
  },
  {
    q: 'What is the best free app to scan old photos?',
    a: 'Google’s PhotoScan, free on iPhone and Android, removes glare by combining several shots of each print. Google last updated it in July\u00a02023 on Android and November\u00a02022 on iPhone, but as of October\u00a02026 it is still free on both. For matte prints, your camera app with the flash off works well too.',
  },
  {
    q: 'How do I get rid of glare when photographing prints?',
    a: 'Use soft daylight from one side rather than a ceiling light directly overhead, turn the flash off and hold the phone parallel to the print. Glare is light bouncing off the glossy surface straight into the lens, so moving the light usually cures it.',
  },
  {
    q: 'Should I take photos out of old albums to scan them?',
    a: 'Only if they come out easily. The Smithsonian Institution Archives suggests noting the names, dates and places on each album page, and photographing every page, before removing anything, because prising off a stuck print can tear it or split its layers.',
  },
  {
    q: 'Why are my iPhone scans HEIC files?',
    a: 'Since iOS 11, iPhones can save photos in HEIF, a format that uses less space than JPEG for the same visual quality; the files end in .heic. Not everything opens them. For JPEGs, open Settings, tap Camera, tap Formats and choose Most Compatible. Ancestorii’s website converts HEIC photos to JPEG when you upload them.',
  },
];

const KEY_FACTS = [
  <>
    Google’s free <strong>PhotoScan</strong> app for iPhone and Android takes several shots of each print
    and stitches them into one image <strong>without glare</strong>.
  </>,
  <>
    At the Library of Congress’s <strong>300&nbsp;ppi</strong>, a 6&nbsp;×&nbsp;4&nbsp;inch print needs{' '}
    <strong>1,800&nbsp;×&nbsp;1,200&nbsp;pixels</strong>. A 12-megapixel phone photo is about 4,000&nbsp;×&nbsp;3,000.
  </>,
  <>
    Glare is light reflecting straight into the lens. Use <strong>soft daylight from one side</strong> and
    turn the <strong>flash off</strong>.
  </>,
  <>
    On iPhone, choosing <strong>Most Compatible</strong> (Settings, Camera, Formats) saves JPEG instead of
    HEIF.
  </>,
  <>
    Photograph prints in sticky <strong>magnetic albums</strong> where they are, rather than prising them
    off.
  </>,
  <>
    Keep <strong>at least two copies</strong> of your scans in different places, and check them once a
    year (Library of Congress).
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'TechCrunch',
    title: 'Google’s new app PhotoScan turns prints into digital photos',
    href: 'https://techcrunch.com/2016/11/15/googles-new-app-photoscan-turns-prints-into-digital-photos/',
    date: '2016',
  },
  {
    publisher: 'Google Play',
    title: 'PhotoScan by Google Photos',
    href: 'https://play.google.com/store/apps/details?id=com.google.android.apps.photos.scanner',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Apple App Store',
    title: 'PhotoScan by Google Photos',
    href: 'https://apps.apple.com/gb/app/photoscan-by-google-photos/id1165525994',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Scanning Your Personal Collections (Personal Digital Archiving series)',
    href: 'https://www.digitalpreservation.gov/personalarchiving/documents/PA_scanning.pdf',
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
    publisher: 'Library of Congress',
    title: 'Personal Archiving: Digital Photos',
    href: 'https://digitalpreservation.gov/personalarchiving/photos.html',
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
    publisher: 'Apple Support',
    title: 'Using HEIF or HEVC media on Apple devices',
    href: 'https://support.apple.com/en-gb/116944',
    date: '2025',
  },
  {
    publisher: 'Apple Support',
    title: 'Use iPhone camera tools to set up your shot',
    href: 'https://support.apple.com/en-gb/guide/iphone/iph3dc593597/ios',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Apple Support',
    title: 'Change advanced camera settings on iPhone',
    href: 'https://support.apple.com/en-gb/guide/iphone/iphb362b394e/ios',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Apple Support',
    title: 'Scan text and documents in Notes using the iPhone camera',
    href: 'https://support.apple.com/en-gb/guide/iphone/iph653f28965/ios',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Icon, the Institute of Conservation',
    title: 'Find a conservator',
    href: 'https://icon.org.uk/conservation-hub/find-a-conservator.html',
    date: 'accessed October\u00a02026',
  },
];

// Space above the key facts card and the author box, and above the sources (one section step),
// in the reading column.
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function ScanPhotosWithPhonePage() {
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
              How to scan photos{' '}
              <br />
              <Accent>with your phone.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              To scan old photos with your phone, lay each print flat in soft, indirect daylight, hold the
              phone straight above it, and use a scanner app that removes glare, such as Google’s free
              PhotoScan, or your camera with the flash off. Any recent phone has more than enough pixels
              for the 300&nbsp;pixels per inch the Library of Congress suggests for prints; the light, the glare
              and how square you hold the phone decide the rest.
            </Lead>
            <p>
              It is the quickest way to start, and the kindest to prints too fragile to move. If you have a
              flatbed scanner, our guide to{' '}
              <Link href="/guides/how-to-digitize-old-photos">digitising old photos</Link> covers the scanner
              settings.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <GuideSection
            title={
              <>
                Can a phone scan <Accent tone="pink">old photos well enough?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                For most family prints, yes. The Library of Congress suggests 300&nbsp;dpi for 6&nbsp;×&nbsp;4 and 7&nbsp;×&nbsp;5&nbsp;inch prints, and 400 or 600&nbsp;dpi if you might enlarge them to 10&nbsp;×&nbsp;8&nbsp;inches or more. At 300&nbsp;dpi, a 6&nbsp;×&nbsp;4&nbsp;inch print needs 1,800&nbsp;×&nbsp;1,200&nbsp;pixels, about 2&nbsp;megapixels.
              </p>
              <p>
                A 12-megapixel phone photo is about 4,000&nbsp;×&nbsp;3,000&nbsp;pixels. If a 6&nbsp;×&nbsp;4&nbsp;inch print fills the
                frame from side to side, that works out at roughly 670&nbsp;pixels per inch; if it fills two-thirds
                of the width, still about 450. Apple says recent iPhones shoot 24&nbsp;megapixels by default on
                supported models, which leaves even more room.
              </p>
              <p>
                Pixels aren’t the whole story. A flatbed scanner lights every part of a print evenly and never
                tilts; a phone depends on your light, your focus and your hands. Archives use both: FADGI, the
                US federal digitising guidelines, lists digital cameras alongside flatbeds as recommended
                tools for photographs, and the Smithsonian Institution Archives notes that photographing an
                item is one way to digitise it, especially when it is very fragile. Use your phone for albums,
                fragile prints and visits to relatives, and a flatbed for prints you would like to enlarge.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Which app <Accent tone="pink">should you use?</Accent>
              </>
            }
          >
            <Points>
              <Point icon={Sparkles} title="Google PhotoScan.">
                Free on iPhone and Android since November&nbsp;2016. It shows four dots, you move the phone over
                each one, and it stitches the shots into one image without glare, then crops, straightens and
                rotates it. Google last updated it in July&nbsp;2023 on Android and November&nbsp;2022 on iPhone; as of
                October&nbsp;2026 it is still free on both.
              </Point>
              <Point icon={Camera} title="Your camera app.">
                Best for matte prints, which reflect less light. Turn the flash off, fill the frame, tap to
                focus on the print and crop afterwards.
              </Point>
              <Point icon={StickyNote} title="Notes on iPhone.">
                Its Scan Documents tool captures automatically when it finds the page edges and saves a PDF.
                That suits letters and certificates better than photographs.
              </Point>
            </Points>

            <Prose>
              <p>
                Other scanner apps exist, many of them paid. Whichever you try, scan one print first and check
                its pixel dimensions in the photo’s details before you do a hundred.
              </p>
            </Prose>
          </GuideSection>

          <PullQuote>
            The pixels are already there.{' '}
            <Accent tone="blue">The light decides the rest.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                How do you stop <Accent tone="pink">glare and reflections?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Glare is light bouncing off the glossy surface of a print straight into the lens. It depends
                on angles, so most of it can be fixed before you press the button.
              </p>
            </Prose>

            <Steps>
              <Step number="01" title="Use soft light from one side.">
                <p>
                  Daylight from a window, out of direct sun, is ideal. A ceiling light directly above the
                  print reflects straight up into a phone held over it, so switch it off.
                </p>
              </Step>
              <Step number="02" title="Turn the flash off.">
                <p>The flash sits right beside the lens, so on a glossy print its light bounces straight back into it.</p>
              </Step>
              <Step number="03" title="Hold the phone square to the print.">
                <p>
                  Turn on the grid and level (on iPhone, Settings, then Camera, then Grid and Level) and keep
                  the phone parallel to the photo, so the print stays rectangular and sharp to the corners.
                </p>
              </Step>
              <Step number="04" title="Take loose prints out of plastic.">
                <p>
                  Sleeves and frames add a second shiny surface. If a print slides out easily, photograph it
                  without one.
                </p>
              </Step>
              <Step number="05" title="Don’t press glass on top.">
                <p>
                  The Library of Congress advises against placing glass or Plexiglas on photographs, because
                  it can make the image crack or come away. FADGI allows glass only where it won’t harm the
                  original, and never to force a tightly curled print flat.
                </p>
              </Step>
            </Steps>
          </GuideSection>

          <GuideSection
            title={
              <>
                Which phone settings <Accent tone="pink">should you check first?</Accent>
              </>
            }
          >
            <Tips>
              <Tip icon={Crosshair}>
                <strong>Clean the lens</strong> before you start. One fingerprint softens every scan.
              </Tip>
              <Tip icon={FileImage}>
                <strong>JPEG or HEIF.</strong> iPhones can save photos as HEIF, which Apple says keeps the same
                visual quality in less space but is less widely compatible. For JPEGs, open Settings, tap
                Camera, tap Formats and choose Most Compatible.
              </Tip>
              <Tip icon={Camera}>
                <strong>Resolution.</strong> On supported iPhones, choose 12 or 24&nbsp;megapixels under Settings,
                Camera, Formats, Photo Mode. Either is plenty for prints.
              </Tip>
              <Tip icon={Grid3x3}>
                <strong>Android.</strong> Settings vary by phone maker. In the camera’s settings, choose the
                largest picture size and turn on the grid.
              </Tip>
            </Tips>
          </GuideSection>

          <GuideSection
            title={
              <>
                What about photos <Accent tone="pink">stuck in albums or frames?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Old albums hold many family photos, and some are hard on them. The Library of Congress advises
                avoiding albums with coloured, “magnetic” or sticky self-adhesive pages, and keeping tape and
                glue off photographs altogether.
              </p>
              <p>
                Don’t prise prints off. The Smithsonian Institution Archives suggests noting the names, dates
                and places written on each album page, and taking a picture of every page, before you remove
                anything, because a print stuck to the page can tear or split into layers. Photograph each
                page as it is first, since the layout and handwritten captions are part of the record. Then
                photograph each print where it sits, with the light from the side.
              </p>
              <p>
                Prints held by photo corners can usually be freed, the Smithsonian’s paper conservator says,
                by very carefully slitting the fold of each corner with a thin, flat tool. A framed print that
                won’t come out easily can be photographed through the glass, lit from the side. Prints stuck
                together are a job for a conservator, not water: in the UK, Icon, the Institute of
                Conservation, lists accredited conservators who specialise in photographs.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What should you do <Accent tone="pink">after scanning?</Accent>
              </>
            }
          >
            <Compare labels={['Where phone scans often end up', 'What keeps them safe']}>
              <CompareRow left="Scans left on one phone" right="At least two copies, kept in different places" />
              <CompareRow
                left="Files called IMG_4821.HEIC"
                right={
                  <>
                    Names that start with the date, such as <span style={{ whiteSpace: 'nowrap' }}>19870614-beach-001.jpg</span>
                  </>
                }
              />
              <CompareRow left="Nobody noted who is in them" right="Names, places and dates written down while someone remembers" />
              <CompareRow left="Copies never checked" right="Files checked once a year to make sure they still open" />
              <CompareRow left="Originals put back in the loft" right="Originals kept somewhere cool, dry and dark" />
            </Compare>

            <Prose>
              <p>
                Our guides to{' '}
                <Link href="/guides/how-to-organize-family-photos">organising family photos</Link>,{' '}
                <Link href="/guides/how-to-label-old-photos">labelling old photos</Link> and{' '}
                <Link href="/guides/how-to-store-old-photos">storing old photos</Link> go further. The
                Smithsonian Institution Archives’ advice on digital copies is short: “Multiple copies are
                wise. Don’t rely only on a photo-sharing service online.”
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How can Ancestorii <Accent tone="pink">help with phone scans?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                The free Ancestorii app for iPhone and Android is built for photos on your phone. Add up to 10
                scans from your photo library to a memory, with a few lines about what they show, and it
                appears in a private feed that only the family members you invite can see. Relatives can
                react, comment and add their own version of the moment.
              </p>
              <p>
                On the website, the family Library takes up to 20 uploads at a time and converts iPhone HEIC
                photos to JPEG automatically, and{' '}
                <Link href="/features/family-photo-albums">family photo albums</Link> let everyone add a date,
                the story and a voice note to each scan. The Free plan includes 1&nbsp;GB for the whole family,
                with files up to 20&nbsp;MB, which suits phone scans; Premium is £3.99 a month per family for 100&nbsp;GB. Keep your own backup too: Ancestorii is where the family sees the photos and adds what
                they know.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">scanning with a phone.</Accent>
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
              From your phone
              <br />
              <Accent tone="pink">to your family.</Accent>
            </>
          }
        >
          Add a scan, say who is in it, and let the family fill in the rest.
        </GuideCta>
      </SiteShell>
    </>
  );
}
