import Link from 'next/link';
import type { Metadata } from 'next';
import { Eye, Library, PackageCheck, Percent } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent } from '@/components/site/SiteBits';
import site from '@/components/site/site.module.css';
import {
  ArticleCta,
  ArticleHero,
  ArticleSection,
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

const PATH = '/acrylic-prints';
const PAGE_URL = `${SITE_URL}${PATH}`;
const HEADLINE = 'Acrylic photo prints, made from your family photos';
const DESCRIPTION =
  'Turn family photos into an acrylic print with float-mount hanging included: 16×24, 24×24 or 24×36 inches, from £99.99 plus delivery, with 1, 2 or 4 photos.';
const SHARE_DESCRIPTION =
  'Your family photo behind crystal-clear acrylic, with float-mount hanging included. Three sizes from £99.99 plus delivery.';

export const metadata: Metadata = {
  title: 'Acrylic Photo Prints of Your Family Photos',
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Acrylic Photo Prints | Ancestorii',
    description: SHARE_DESCRIPTION,
    url: PAGE_URL,
    siteName: 'Ancestorii',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Ancestorii Acrylic Prints' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acrylic Photo Prints | Ancestorii',
    description: SHARE_DESCRIPTION,
    images: ['/og-default.jpg'],
  },
};

// Tiers, sizes and prices as the editor and the acrylic checkout set them. The pound price comes
// straight after the name, so it stays in view while the table scrolls on phones.
const SIZES = [
  ['The Portrait', '£99.99', '16 × 24 in', 'Landscape or portrait', '41 × 61 cm', '$139.99', '€119.99'],
  ['The Centrepiece', '£149.99', '24 × 24 in', 'Square', '61 × 61 cm', '$199.99', '€179.99'],
  ['The Masterpiece', '£199.99', '24 × 36 in', 'Landscape or portrait', '61 × 91 cm', '$269.99', '€239.99'],
];

// The three layouts (Solo, Duo side by side, Grid 2 × 2, no gaps), worked out for each print.
// The photo count sits in the row name, so the three prints get the room on phones.
const LAYOUTS = [
  [
    'Solo (1 photo)',
    'One 24 × 16 in space',
    'One 24 × 24 in space',
    'One 36 × 24 in space',
  ],
  [
    'Duo (2 photos)',
    'Two 12 × 16 in spaces, side by side',
    'Two 12 × 24 in spaces, side by side',
    'Two 18 × 24 in spaces, side by side',
  ],
  [
    'Grid (4 photos)',
    'Four 12 × 8 in spaces',
    'Four 12 × 12 in spaces',
    'Four 18 × 12 in spaces',
  ],
];

const CHOICE = [
  ['Surface', 'High-gloss acrylic', 'Finely textured cotton canvas'],
  [
    'Sizes',
    '16 × 24, 24 × 24 or 24 × 36 in',
    '16 × 36, 20 × 32 or 24 × 72 in',
  ],
  ['Shape', 'A 3:2 rectangle or a square', 'Long shapes, 1.6 to 3 times as wide as tall'],
  ['Photos', '1, 2 or 4', '1 to 10'],
  ['Layouts', '3, the same on every size', '18, depending on size and orientation'],
  ['Price', '£99.99 to £199.99, plus delivery', '£99.99 to £169.99, plus delivery'],
  [
    'Delivery',
    'Every size to 20 countries',
    'Two sizes to 20 countries; 24 × 72 in to the UK only',
  ],
];

const HELPS = [
  {
    title: 'Your photos are already together.',
    text: "The editor draws on your family's shared Library, so photos a parent, sister or cousin has uploaded are ready to use.",
    Icon: Library,
  },
  {
    title: 'You see it before you pay.',
    text: 'Preview shows the print in its real proportions, and you pay only when you order.',
    Icon: Eye,
  },
  {
    title: 'Premium families save 10%.',
    text: 'Premium is £3.99 a month for the whole family and takes 10% off every acrylic print. Reward codes replace that discount rather than add to it.',
    Icon: Percent,
  },
  {
    title: 'The hanging hardware is included.',
    text: 'Every print comes with float-mount hardware, and the Orders page follows it from printing to your door, with a tracking link once it ships.',
    Icon: PackageCheck,
  },
];

// Shown on the page and used, word for word, in the FAQPage structured data.
const FAQ_PLAIN = [
  {
    q: 'How much is an acrylic photo print?',
    a: 'An Ancestorii Acrylic Print costs £99.99 for The Portrait (16 × 24 in), £149.99 for The Centrepiece (24 × 24 in) or £199.99 for The Masterpiece (24 × 36 in), plus delivery of £4.99 Standard or £8.99 Express. In US dollars the three sizes cost $139.99, $199.99 and $269.99, and in euros €119.99, €179.99 and €239.99.',
  },
  {
    q: 'Does an acrylic print come ready to hang?',
    a: 'Float-mount hanging hardware is included with every Ancestorii acrylic print. Prodigi, which makes the prints, describes the mount as an invisible floating subframe with a built-in mounting system on sizes over 8 inches, which covers all three sizes.',
  },
  {
    q: 'Can I put more than one photo on an acrylic print?',
    a: 'Yes. Every size offers three layouts: Solo with one photo, Duo with two side by side, and Grid with four in a 2 × 2 grid. The photos sit edge to edge. For more than four photos, a Memory Canvas holds up to ten.',
  },
  {
    q: 'Which countries do you deliver acrylic prints to?',
    a: 'All three sizes ship to 20 countries: the UK, Ireland, the United States, Canada, Australia, New Zealand, Germany, France, Spain, Italy, the Netherlands, Belgium, Austria, Switzerland, Sweden, Denmark, Norway, Finland, Portugal and Poland. Standard delivery takes 10 to 14 working days and Express 5 to 7.',
  },
  {
    q: 'How do I clean an acrylic print without scratching it?',
    a: 'Wipe it with a soft, lint-free cloth or sponge moistened with water, with a little washing-up liquid if needed, and do not rub it completely dry. POLYVANTIS, the company behind PLEXIGLAS acrylic glass, says rubbing it dry builds up static that attracts dust and can scratch the surface, and that window cleaners, cleaners containing alcohol and furniture polish should not be used.',
  },
];

const SOURCES: Source[] = [
  {
    publisher: 'POLYVANTIS (PLEXIGLAS®)',
    title: 'What is PLEXIGLAS®?',
    href: 'https://www.plexiglas.de/en/service/product-info/what-is-plexiglas',
    date: 'accessed October 2026',
  },
  {
    publisher: 'POLYVANTIS (PLEXIGLAS®)',
    title: 'How to properly clean, disinfect and maintain PLEXIGLAS®',
    href: 'https://www.plexiglas.de/en/service/processing/cleaning-plexiglas',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Prodigi',
    title: 'Acrylic panels (product specification)',
    href: 'https://www.prodigi.com/products/wall-art/acrylic-prints/acrylic-panels/',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Prodigi',
    title: 'Stretched canvas (product specification)',
    href: 'https://www.prodigi.com/products/wall-art/canvas/stretched-canvas/stretched-canvas/',
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
    title: 'SI Units – Length',
    href: 'https://www.nist.gov/pml/owm/si-units-length',
    date: 'updated 2025',
  },
  {
    publisher: 'Ancestorii',
    title: 'Terms of Service, section 23: Physical Products & My Heirlooms',
    href: 'https://www.ancestorii.com/terms',
    date: 'updated 16 October 2026',
  },
];

export default function AcrylicPrintsPage() {
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
            { name: 'Acrylic prints', path: PATH },
          ]),
          faqSchema(FAQ_PLAIN),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[{ href: '/', label: 'Home' }, { label: 'Acrylic prints' }]}
          size="md"
          title={
            <>
              Acrylic photo prints, <Accent>made from your family photos.</Accent>
            </>
          }
          intro={[
            'An Ancestorii Acrylic Print is your family photo printed behind polished, crystal-clear acrylic, with float-mount hanging hardware included. It comes in three sizes: The Portrait (16 × 24 in, £99.99), The Centrepiece (24 × 24 in, £149.99) and The Masterpiece (24 × 36 in, £199.99), each plus delivery.',
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        {/* The short answer: key facts beside how a print is made */}
        <ArticleSection
          aside={
            <div style={{ maxWidth: 760 }}>
              <KeyFacts
                items={[
                  <>
                    <strong>Three sizes:</strong> The Portrait, 16&nbsp;×&nbsp;24&nbsp;in (£99.99); The
                    Centrepiece, 24&nbsp;×&nbsp;24&nbsp;in (£149.99); The Masterpiece,
                    24&nbsp;×&nbsp;36&nbsp;in (£199.99). All plus delivery.
                  </>,
                  <>
                    <strong>A crystal-clear acrylic panel</strong>, with float-mount hanging hardware included.
                  </>,
                  <>
                    <strong>Three layouts on every size:</strong> Solo (1 photo), Duo (2 side by side) and Grid
                    (4 in a 2&nbsp;×&nbsp;2 grid).
                  </>,
                  <>
                    <strong>Delivery to 20 countries:</strong> Standard £4.99 (10 to 14 working days) or
                    Express £8.99 (5 to 7 working days).
                  </>,
                  <>
                    <strong>Made to order:</strong> refunds only if a print arrives damaged, defective or
                    materially different. Premium families get 10% off.
                  </>,
                ]}
              />
            </div>
          }
        >
          <Reading>
            <p>
              You design an Acrylic Print in your browser. Choose a size first: The Portrait and The
              Masterpiece can be landscape or portrait, and The Centrepiece, the size the editor
              recommends, is always square. Then pick a layout and fill it with photos from your
              family&apos;s shared <Link href="/features/family-library">Library</Link>, or upload new
              ones as you go, which adds them to the Library for the whole family.
            </p>
            <p>
              The Portrait and The Masterpiece share a 3:2 shape (24&nbsp;÷&nbsp;16 and
              36&nbsp;÷&nbsp;24 both make 1.5), so a 3:2 photo fills either one in Solo without
              trimming, while a landscape 4:3 photo loses about a ninth of its height. On a landscape
              print, Duo&apos;s two spaces are taller than they are wide, so two upright photos suit it
              best, while Grid&apos;s four spaces are landscape-shaped.
            </p>
            <p>
              Preview shows the print in its true proportions before you pay, and designing is free on
              any plan. The editor needs a screen at least 1,024&nbsp;pixels wide, so use a laptop or
              desktop rather than a phone.
            </p>
            <p>
              When you order, Ancestorii renders a print file at 300&nbsp;DPI (dots per inch):
              7,200&nbsp;×&nbsp;4,800&nbsp;pixels for The Portrait, 7,200&nbsp;×&nbsp;7,200 for The
              Centrepiece and 10,800&nbsp;×&nbsp;7,200 for The Masterpiece. It goes to Prodigi, the
              print company Ancestorii works with, which makes the print and posts it. Production starts
              as soon as payment goes through, so an order cannot be cancelled after checkout.
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
            head={['Acrylic', 'GBP', 'Size (inches)', 'Shape', 'Size (cm, approx.)', 'USD', 'EUR']}
            rows={SIZES}
            highlight={1}
            size="wide"
            labelledBy="sizes-title"
          />
          <TableNote>
            Each price is for one print, plus delivery: Standard £4.99 / $5.99 / €5.99 or Express £8.99
            / $10.99 / €9.99. Checkout picks the currency from your browser: American time zones or US
            English pay in dollars, European time zones outside the UK pay in euros, and everyone else
            pays in pounds, including Australia and New Zealand.
          </TableNote>
          <TableNote>
            Centimetres are converted at exactly 25.4&nbsp;mm to the inch, as given by NIST, and
            rounded.
          </TableNote>
        </ArticleSection>

        <QuoteBlock>
          Pick the size with care.{' '}
          <Accent tone="blue">It cannot be changed once the print is created.</Accent>
        </QuoteBlock>

        {/* What it is */}
        <ArticleSection
          id="what-is-an-acrylic-print"
          kicker="The material"
          dot="var(--c1)"
          title={
            <>
              What is an <Accent tone="blue">acrylic print?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              An acrylic print is a photograph shown behind a clear sheet of acrylic instead of under
              glass in a frame. Ancestorii describes its panel as crystal-clear acrylic with vibrant colour
              depth, and its Terms describe the photo as printed behind polished acrylic glass. Prodigi,
              which makes the prints, describes the acrylic as high-gloss.
            </p>
            <p>
              Acrylic glass is a plastic called polymethyl methacrylate, or PMMA. POLYVANTIS, the company
              behind PLEXIGLAS acrylic glass, gives colourless PLEXIGLAS a light transmission of 92% and
              describes it as “as transparent as glass, half as heavy, and free of optical distortion”.
              It also calls the material impact-resistant and resistant to UV and weathering. Those are
              figures for PLEXIGLAS in general, not a specification of the panel on your print.
            </p>
            <p>
              The float mount is what lets the panel hang without a visible frame. Prodigi describes it as
              an invisible floating subframe with a built-in mounting system on every size over 8&nbsp;inches,
              which covers all three Ancestorii sizes, and the float-mount hardware is included with every
              print.
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
            head={['Layout', 'The Portrait, landscape', 'The Centrepiece', 'The Masterpiece, landscape']}
            rows={LAYOUTS}
            highlight={-1}
            size="mid"
            labelledBy="layouts-title"
          />
          <TableNote>
            Sizes are width × height. Turn The Portrait or The Masterpiece to portrait orientation and
            the Solo and Grid spaces swap their width and height, but Duo&apos;s two spaces stay side by
            side: 8&nbsp;×&nbsp;24&nbsp;in each on The Portrait and 12&nbsp;×&nbsp;36&nbsp;in each on
            The Masterpiece. The photos sit edge to edge with no border, and each one is scaled to fill
            its space and trimmed evenly from the edges, keeping the middle.
          </TableNote>
        </ArticleSection>

        {/* Acrylic or canvas */}
        <ArticleSection
          id="acrylic-or-canvas"
          layout="wide"
          kicker="Acrylic or canvas"
          dot="var(--c0)"
          title={
            <>
              Acrylic or canvas: <Accent tone="blue">which suits your photo?</Accent>
            </>
          }
        >
          <CompareTable
            head={['Compared', 'Acrylic Print', 'Memory Canvas']}
            rows={CHOICE}
            highlight={1}
            size="fit"
            labelledBy="acrylic-or-canvas-title"
          />
          <TableNote>
            As a rough guide, acrylic suits one, two or four photos and a glossy, modern finish, while
            a{' '}
            <Link href="/canvas-prints" className={site.textLink}>
              Memory Canvas
            </Link>{' '}
            suits a long wall, a panorama or a story told in up to ten photos. A glossy surface also
            reflects a window or lamp facing it more than a textured canvas does, so think about where the
            light comes from in the room. Surfaces are as Prodigi describes its acrylic panels and its
            stretched canvas.
          </TableNote>
        </ArticleSection>

        {/* Delivery */}
        <ArticleSection
          id="delivery"
          kicker="Delivery"
          dot="var(--c2)"
          title={
            <>
              Where do acrylic prints ship, <Accent tone="pink">and how fast?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              All three sizes ship to 20 countries: the UK and Ireland, 14 more in Europe, the United
              States, Canada, Australia and New Zealand (the full list is in the questions below).
              Checkout does not accept addresses outside those 20.
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
              Each checkout is for one print, so to give the same photo to two households, order twice and
              pay delivery on each. Because every print is made to order, it cannot be refunded unless it
              arrives damaged, defective or materially different from what you ordered. If that happens,
              email <a href="mailto:support@ancestorii.com">support@ancestorii.com</a> within
              14&nbsp;days of delivery with photos, and Ancestorii will arrange a replacement or refund at
              its discretion.
            </p>
          </Reading>
        </ArticleSection>

        {/* Cleaning and care */}
        <ArticleSection
          id="care"
          kicker="Care"
          dot="var(--c3)"
          title={
            <>
              How do you clean <Accent tone="blue">and care for acrylic?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Dust is the main job. POLYVANTIS, writing about PLEXIGLAS, says that in most cases a soft,
              lint-free cloth or a sponge is all it takes, moistened with water and a small amount of
              washing-up liquid if needed.
            </p>
            <p>
              There are two things to avoid. First, never rub acrylic completely dry: POLYVANTIS says this
              charges it with static, which attracts dust, and can scratch the surface. Second, leave the
              household sprays in the cupboard, because it warns that window cleaners and other cleaners
              containing alcohol damage the material, and that furniture polish can leave streaks.
            </p>
            <p>
              Then think about light, because the photo behind the acrylic is still a print. Writing about
              the care of its collections, the Library of Congress explains that light damage is
              cumulative: dim light over a long period of time is just as damaging as bright light over a
              short period. It also notes that sunlight is generally avoided for displaying
              light-sensitive items because it is too intense, contains high levels of UV and is
              difficult to control.
            </p>
            <p>
              With the hardware included, the main decision is the wall itself: somewhere direct sun does
              not reach, and not straight opposite a window if you want to avoid reflections.
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
            What it does not do: there are three sizes and three layouts, each checkout prints one copy,
            and acrylic prints are designed and ordered on the website, not in the app. For a whole story,
            a{' '}
            <Link href="/memory-books" className={site.textLink}>
              Memory Book
            </Link>{' '}
            holds 24 to 48 printed pages.
          </TableNote>
          <TableNote>
            Buying for a wedding anniversary? Our list of{' '}
            <Link href="/guides/anniversary-gift-ideas-by-year" className={site.textLink}>
              anniversary gift ideas by year
            </Link>{' '}
            may help, and the Premium discount is explained on the{' '}
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
              Acrylic print <Accent tone="blue">questions.</Accent>
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
              Your photo,
              <br />
              behind acrylic.
            </>
          }
          lead="Free to start. Design your print from your family's photos and pay only when you order."
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
