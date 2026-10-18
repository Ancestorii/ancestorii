import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { LayoutGrid, Library, PackageCheck, Ruler } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent } from '@/components/site/SiteBits';
import site from '@/components/site/site.module.css';
import {
  ArticleCta,
  ArticleHero,
  ArticleSection,
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
import { articleSchema, breadcrumbSchema, faqSchema, SITE_URL } from '@/lib/seo/schema';

const PATH = '/canvas-prints';
const PAGE_URL = `${SITE_URL}${PATH}`;
const HEADLINE = 'Family photo canvas prints, from one photo to ten';
const DESCRIPTION =
  'Design a large family photo canvas from 1 to 10 photos: 16×36, 20×32 or 24×72 inches, from £99.99 plus delivery. 400gsm canvas on a 38mm stretcher bar.';
const SHARE_DESCRIPTION =
  'A large stretched canvas you design from 1 to 10 family photos, in three sizes from £99.99 plus delivery.';

export const metadata: Metadata = {
  title: 'Family Photo Canvas Prints, from One Photo to Ten',
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Family Photo Canvas Prints | Ancestorii',
    description: SHARE_DESCRIPTION,
    url: PAGE_URL,
    siteName: 'Ancestorii',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Ancestorii Memory Canvas' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Family Photo Canvas Prints | Ancestorii',
    description: SHARE_DESCRIPTION,
    images: ['/og-default.jpg'],
  },
};

// Tiers, sizes and prices as the editor and the canvas checkout set them. The pound price comes
// straight after the name, so it stays in view while the table scrolls on phones.
const SIZES = [
  ['The Moment', '£99.99', '16 × 36 in', '41 × 91 cm', '$139.99', '€119.99'],
  ['The Heirloom', '£129.99', '20 × 32 in', '51 × 81 cm', '$179.99', '€154.99'],
  ['The Heritage', '£169.99', '24 × 72 in', '61 × 183 cm', '$229.99', '€199.99'],
];

// Every layout the canvas editor offers, by tier and orientation; the number is the photos it holds.
// The sizes are in the table above, so the row names stay short enough for the pinned column.
const LAYOUTS = [
  [
    'The Moment',
    'Solo (1 photo), Triptych (3), Highlight (3), Storyboard (3), Filmstrip (5)',
    'Solo (1), Journal (1, with words), Stack (3), Hero (3), Cascade (4)',
  ],
  [
    'The Heirloom',
    'Solo (1), Duo (2), Feature (4), Mosaic (5), Grid (6)',
    'Solo (1), Journal (1, with words), Stack (3), Hero (3), Grid (6)',
  ],
  [
    'The Heritage',
    'Timeline (6), Gallery (7), Centrepiece (7), Mosaic (10)',
    'Generations (3, with names), Tower (5), Cascade (6)',
  ],
];

// Two of the four cards are about the canvas itself, so this page doesn't repeat the acrylic one.
const HELPS = [
  {
    title: 'Your photos are already together.',
    text: "The editor draws on your family's shared Library, so photos a parent, sister or cousin has uploaded are ready to use.",
    Icon: Library,
  },
  {
    title: 'Room for ten photos.',
    text: "For a photo collage, The Heritage's Mosaic layout holds 10 photos, and its Gallery and Centrepiece hold 7 each.",
    Icon: LayoutGrid,
  },
  {
    title: 'Six feet of wall.',
    text: 'The Heritage is 24 × 72 inches (about 61 × 183 cm), with a landscape Timeline layout for six photos. It ships to UK addresses only.',
    Icon: Ruler,
  },
  {
    title: 'You can follow it to the door.',
    text: 'Prodigi prints and posts every order, with a tracking link when it ships and an Orders page that shows where it is.',
    Icon: PackageCheck,
  },
];

// Shown on the page and used, word for word, in the FAQPage structured data.
const FAQ_PLAIN = [
  {
    q: 'How much does a family photo canvas cost?',
    a: 'A Memory Canvas costs £99.99 for The Moment (16 × 36 in), £129.99 for The Heirloom (20 × 32 in) or £169.99 for The Heritage (24 × 72 in), plus delivery of £4.99 Standard or £8.99 Express. In US dollars the three sizes cost $139.99, $179.99 and $229.99, and in euros €119.99, €154.99 and €199.99.',
  },
  {
    q: 'Can I put several photos on one canvas?',
    a: 'Yes. Depending on the size and orientation, a layout holds 1 to 10 photos: up to 5 on The Moment, up to 6 on The Heirloom and up to 10 on The Heritage. Each photo fills its space and is trimmed to fit its shape.',
  },
  {
    q: 'Do you deliver canvas prints outside the UK?',
    a: 'Yes, for two of the three sizes. The Moment and The Heirloom ship to 20 countries: the UK, Ireland, the United States, Canada, Australia, New Zealand, Germany, France, Spain, Italy, the Netherlands, Belgium, Austria, Switzerland, Sweden, Denmark, Norway, Finland, Portugal and Poland. The Heritage, the 24 × 72 inch canvas, ships to UK addresses only.',
  },
  {
    q: 'How long does a canvas take to arrive?',
    a: 'Standard delivery takes 10 to 14 working days and Express 5 to 7 working days. Both are estimates, not guarantees, and you get an email with a tracking link when the canvas ships.',
  },
  {
    q: 'Can I change the size or orientation after I start?',
    a: 'No. The size and orientation are fixed when you create a canvas, though you can change the layout and photos as often as you like before ordering. For a different size, start a new canvas: you only pay when you order.',
  },
  {
    q: 'Do Premium members get a discount?',
    a: 'Yes. Premium costs £3.99 a month for the whole family, not per person, and takes 10% off every canvas at checkout. Discounts do not stack: a reward code earned in the app replaces the Premium discount.',
  },
];

const SOURCES: Source[] = [
  {
    publisher: 'Prodigi',
    title: 'Stretched canvas (product specification and care instructions)',
    href: 'https://www.prodigi.com/products/wall-art/canvas/stretched-canvas/stretched-canvas/',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Prodigi',
    title: 'FAQ: Images (What is the best resolution for image files?)',
    href: 'https://www.prodigi.com/faq/images/',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Limiting Light Damage (Collections Care)',
    href: 'https://www.loc.gov/preservation/care/light.html',
    date: 'accessed October 2026',
  },
  {
    publisher: 'National Institute of Standards and Technology (NIST)',
    title: 'SI Units: Length',
    href: 'https://www.nist.gov/pml/owm/si-units-length',
    date: 'updated 2025',
  },
  {
    publisher: 'Ancestorii',
    title: 'Terms of Service, section 23: Physical Products & My Heirlooms',
    href: 'https://www.ancestorii.com/terms',
    date: 'updated 17 October 2026',
  },
];

// Space above a block that follows long text (the same step the article kit uses after a check list).
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };

export default function CanvasPrintsPage() {
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
            { name: 'Canvas prints', path: PATH },
          ]),
          faqSchema(FAQ_PLAIN),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[{ href: '/', label: 'Home' }, { label: 'Canvas prints' }]}
          size="md"
          title={
            <>
              Family photo canvas prints, <Accent>from one photo to ten.</Accent>
            </>
          }
          intro={[
            'A Memory Canvas is a large stretched canvas you design from your own family photos, with room for anything from 1 to 10 pictures. It comes in three sizes: The Moment (16 × 36 in, £99.99), The Heirloom (20 × 32 in, £129.99) and The Heritage (24 × 72 in, £169.99, UK delivery only), each plus delivery.',
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        {/* The short answer: key facts beside how a canvas is made */}
        <ArticleSection
          aside={
            <div style={{ maxWidth: 760 }}>
              <KeyFacts
                items={[
                  <>
                    <strong>Three sizes:</strong> The Moment, 16&nbsp;×&nbsp;36&nbsp;in (£99.99); The
                    Heirloom, 20&nbsp;×&nbsp;32&nbsp;in (£129.99); The Heritage, 24&nbsp;×&nbsp;72&nbsp;in
                    (£169.99). All plus delivery.
                  </>,
                  <>
                    <strong>Made from</strong> 400gsm gallery-grade canvas on a 38mm stretcher bar, with the
                    picture wrapped around the sides.
                  </>,
                  <>
                    <strong>1 to 10 photos</strong> in 18 layouts, depending on the size and orientation you
                    choose.
                  </>,
                  <>
                    <strong>Delivery is extra:</strong> Standard £4.99 (10 to 14 working days) or Express £8.99
                    (5 to 7 working days).
                  </>,
                  <>
                    <strong>Ships to 20 countries</strong>, except The Heritage, which ships to UK addresses
                    only.
                  </>,
                ]}
              />
            </div>
          }
        >
          <Reading>
            <p>
              You design a Memory Canvas in your browser. Choose a size (the editor recommends The
              Heirloom) and an orientation, landscape or portrait, then pick a layout and fill each space
              with photos from your family&apos;s shared{' '}
              <Link href="/features/family-library">Library</Link>, or upload new ones as you go, which
              adds them to the Library for the whole family.
            </p>
            <p>
              Preview shows the finished canvas in its true proportions, drawn from the same layout that
              becomes the print file. Designing is free on any plan, and you pay only when you order.
              The editor needs a screen at least 1,024&nbsp;pixels wide, so use a laptop or desktop
              rather than a phone.
            </p>
            <p>
              When you order, Ancestorii renders your design at 300&nbsp;DPI (dots per inch) and sends the
              file to Prodigi, the print company it works with, which prints the canvas, stretches it over
              its frame and posts it. Production starts as soon as payment goes through, so an order
              cannot be cancelled after checkout.
            </p>
          </Reading>
        </ArticleSection>

        {/* Sizes and prices */}
        <ArticleSection
          id="sizes"
          layout="wide"
          kicker="Sizes and prices"
          dot="var(--c2)"
          title={
            <>
              What sizes and prices <Accent tone="pink">are there?</Accent>
            </>
          }
        >
          <CompareTable
            head={['Canvas', 'GBP', 'Size (inches)', 'Size (cm, approx.)', 'USD', 'EUR']}
            rows={SIZES}
            highlight={1}
            size="wide"
            labelledBy="sizes-title"
          />
          <TableNote>
            Each price is for one canvas, plus delivery: Standard £4.99 / $5.99 / €5.99 or Express £8.99
            / $10.99 / €9.99. Checkout picks the currency from your browser: American time zones or US
            English pay in dollars, European time zones outside the UK pay in euros, and everyone else
            pays in pounds, including Australia and New Zealand.
          </TableNote>
        </ArticleSection>

        <QuoteBlock>
          Choose the size first.{' '}
          <Accent tone="blue">It cannot be changed once the canvas is created.</Accent>
        </QuoteBlock>

        {/* Materials */}
        <ArticleSection
          id="materials"
          kicker="Materials"
          dot="var(--c1)"
          title={
            <>
              What is the canvas <Accent tone="blue">made of?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Every Memory Canvas is 400gsm gallery-grade canvas (gsm means grams per square metre),
              stretched over a 38mm stretcher bar, with an image wrap finish.
            </p>
            <p>
              Prodigi, which makes the canvases, describes its stretched canvas as heavyweight,
              artist-grade cotton with a fine texture, tensioned over a frame of European kiln-dried
              knotless pine and printed with latex or UVgel inks. It gives 300&nbsp;dpi as the optimal
              resolution, which is what Ancestorii uses for every print file.
            </p>
            <p>
              Image wrap means the picture carries on around the sides of the frame (Prodigi notes it is
              also called a gallery wrap), so a strip around the outer edge of your design ends up on the
              sides. Keep faces, names and dates away from the very edges. Every Memory Canvas is made
              this way; there is no white, black or mirrored edge option.
            </p>
          </Reading>
        </ArticleSection>

        {/* Layouts */}
        <ArticleSection
          id="layouts"
          layout="wide"
          kicker="Layouts"
          dot="var(--c3)"
          title={
            <>
              Which layouts <Accent tone="pink">can you choose?</Accent>
            </>
          }
        >
          <CompareTable
            head={['Canvas', 'Landscape layouts', 'Portrait layouts']}
            rows={LAYOUTS}
            highlight={-1}
            size="mid"
            labelledBy="layouts-title"
          />
          <TableNote>
            The number in brackets is how many photos each layout holds. For a photo collage, the
            Heritage&apos;s Mosaic holds 10, its Gallery and Centrepiece 7 each, and the Heirloom&apos;s
            Grid 6. Journal adds a title of up to 40 characters and up to 200 characters of your own words
            to one photo, and Generations puts a caption of up to 30 characters, such as a name, under
            each of its three photos. The Heritage has no single-photo layout.
          </TableNote>
        </ArticleSection>

        {/* Resolution and shape */}
        <ArticleSection
          id="photo-quality"
          kicker="Photo quality"
          dot="var(--c0)"
          title={
            <>
              Will my photos be sharp <Accent tone="blue">at this size?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Ancestorii renders every canvas at 300&nbsp;DPI, so the print file for The Moment is
              10,800&nbsp;×&nbsp;4,800&nbsp;pixels, The Heirloom 9,600&nbsp;×&nbsp;6,000 and The Heritage
              21,600&nbsp;×&nbsp;7,200. Prodigi says images at 300&nbsp;dpi are ideal, and that canvas
              prints may need a lower resolution than its fine art prints.
            </p>
            <p>
              To see how a photo will do, compare its size in pixels with the print file. A{' '}
              <span style={{ whiteSpace: 'nowrap' }}>12-megapixel</span> photo is about
              4,000&nbsp;×&nbsp;3,000&nbsp;pixels. To fill the{' '}
              <span style={{ whiteSpace: 'nowrap' }}>9,600-pixel</span> width of The Heirloom in Solo,
              it has to be enlarged about 2.4 times, which works out at roughly 125&nbsp;pixels per inch.
              In one of the six spaces of the Heirloom&apos;s landscape Grid, each
              3,200&nbsp;×&nbsp;3,000&nbsp;pixels in the file, the same photo needs no enlarging at all. The
              editor does not check resolution for you, so it is worth doing this sum before you order.
            </p>
            <p>
              Shape matters too. In most layouts the photos sit edge to edge with no border; Cascade and
              Timeline stagger them, and Generations leaves room for its captions. Each photo is scaled
              to fill its space and trimmed evenly from the edges, keeping the middle. The Moment is 2.25
              times as wide as it is tall, The Heirloom 1.6 times and The Heritage 3 times, so a
              landscape 4:3 photo in Solo loses about a sixth of its height on The Heirloom but about two
              fifths on The Moment.
            </p>
          </Reading>
          <div style={STACK_GAP}>
            <CheckList
              items={[
                <>
                  <strong>Use the original file.</strong> A screenshot keeps only the pixels that were
                  on your screen, and copies saved from social media or messaging apps are often smaller
                  than the original.
                </>,
                <>
                  <strong>Scan old prints at a high setting.</strong> A 6&nbsp;×&nbsp;4&nbsp;inch print
                  scanned at 600&nbsp;dpi becomes a 3,600&nbsp;×&nbsp;2,400&nbsp;pixel file, which prints at
                  about 240&nbsp;pixels per inch in one of the Heirloom&apos;s landscape Grid spaces.
                </>,
                <>
                  <strong>Give smaller photos smaller spaces.</strong> Layouts with more photos print
                  each one smaller, so they ask less of every picture. You can switch layouts and swap
                  photos as often as you like before you order; only the size and orientation are fixed.
                </>,
              ]}
            />
          </div>
        </ArticleSection>

        {/* Delivery */}
        <ArticleSection
          id="delivery"
          kicker="Delivery"
          dot="var(--c2)"
          title={
            <>
              Where do canvases ship, <Accent tone="pink">and how fast?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              The Moment and The Heirloom ship to 20 countries: the UK and Ireland, 14 more in Europe, the
              United States, Canada, Australia and New Zealand (the full list is in the questions below).
              The Heritage ships to UK addresses only, and checkout will not accept an address anywhere
              else.
            </p>
            <p>You choose the speed at checkout, and delivery is charged on every order:</p>
            <ul>
              <li>
                <strong>Standard:</strong> £4.99, $5.99 or €5.99, taking 10 to 14 working days.
              </li>
              <li>
                <strong>Express:</strong> £8.99, $10.99 or €9.99, taking 5 to 7 working days.
              </li>
            </ul>
            <p>
              Both are estimates rather than guarantees. You get an email when the order is confirmed and
              a tracking link when it ships, and the Orders page shows whether it is printing, shipped or
              delivered.
            </p>
            <p>
              Each checkout is for one canvas, so to send the same design to two homes, order twice and
              pay delivery on each. Because every canvas is printed to order, it cannot be refunded unless
              it arrives damaged, defective or materially different from what you ordered. If that
              happens, email <a href="mailto:support@ancestorii.com">support@ancestorii.com</a> within
              14&nbsp;days of delivery with photos, and Ancestorii will arrange a replacement or refund
              at its discretion.
            </p>
          </Reading>
        </ArticleSection>

        {/* Hanging and care */}
        <ArticleSection
          id="care"
          kicker="Care"
          dot="var(--c3)"
          title={
            <>
              How should you hang and <Accent tone="blue">look after a canvas?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Measure first. The long side of The Moment is about 91&nbsp;cm, The Heirloom about
              81&nbsp;cm and The Heritage about 183&nbsp;cm, so check the wall with the orientation you
              have in mind. Centimetres on this page are converted at exactly 25.4&nbsp;mm to the inch,
              as given by NIST, and rounded.
            </p>
            <p>
              Then pick the spot with care. Prodigi&apos;s care advice for its canvas is to keep the print
              out of direct sunlight and away from light reflected off mirrors, glass and other shiny
              surfaces, to display it at room temperature somewhere stable and moisture-free, and to keep
              it a safe distance from fireplaces and radiators. A steamy bathroom or the wall above a
              radiator is a poor choice.
            </p>
            <p>
              Light is the slow risk. Writing about the care of its collections, the Library of Congress
              explains that light damage is cumulative: dim light over a long period of time is just as
              damaging as bright light over a short period. It also notes that sunlight is generally
              avoided for displaying light-sensitive items because it is too intense, contains high
              levels of UV and is difficult to control.
            </p>
            <p>
              Cleaning is simple. Prodigi says not to use any liquid or chemical product on a canvas,
              even a coated one, and that a soft brush can be used now and then to remove settled dust.
            </p>
          </Reading>
        </ArticleSection>

        {/* Where Ancestorii fits, honestly */}
        <ArticleSection
          id="how-ancestorii-helps"
          layout="wide"
          kicker="Where Ancestorii fits"
          dot="var(--c1)"
          title={
            <>
              How it <Accent tone="pink">helps.</Accent>
            </>
          }
        >
          <ReasonCards items={HELPS} />
          <TableNote>
            What it does not do: the three sizes are fixed, every canvas has an image wrap, each checkout
            prints one copy, and canvases are designed and ordered on the website, not in the app. For a
            story across pages, a{' '}
            <Link href="/memory-books" className={site.textLink}>
              Memory Book
            </Link>{' '}
            holds 24 to 48 printed pages; for one, two or four photos behind glossy acrylic, see{' '}
            <Link href="/acrylic-prints" className={site.textLink}>
              acrylic prints
            </Link>
            .
          </TableNote>
          <TableNote>
            Choosing a present? Our guide to{' '}
            <Link href="/guides/gifts-for-grandparents" className={site.textLink}>
              gifts for grandparents
            </Link>{' '}
            has more ideas, and the Premium discount is explained on the{' '}
            <Link href="/pricing" className={site.textLink}>
              pricing page
            </Link>
            .
          </TableNote>
        </ArticleSection>

        {/* FAQ */}
        <ArticleSection
          id="questions"
          kicker="Questions"
          dot="var(--c3)"
          title={
            <>
              Canvas print <Accent tone="blue">questions.</Accent>
            </>
          }
        >
          <FaqBlock items={FAQ_PLAIN} variant="open" />
        </ArticleSection>

        {/* Sources, then who wrote it */}
        <ArticleSection>
          <Sources items={SOURCES} />
          <div className={site.sectionBody}>
            <AuthorBox updated="17 October 2026" />
          </div>
        </ArticleSection>

        <ArticleCta
          title={
            <>
              Put the family
              <br />
              on the wall.
            </>
          }
          lead="Free to start. Design your canvas from your family's photos and pay only when you order."
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
