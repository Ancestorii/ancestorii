import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Archive, Ban, BookOpen, Clock, Droplets, Hand, Layers, Mail, Paperclip, StickyNote, Thermometer } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { Compare, CompareRow, Point, Points, Tip, Tips } from '../_components/GuideBlocks';

const PATH = '/guides/how-to-store-old-photos';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Store Old Photos: Humidity, Boxes, Albums';
const HEADLINE = 'How to store old photos so they last';
const DESCRIPTION =
  'Keep old photos at 21°C or below and 30 to 50% humidity, in PAT-tested boxes, out of lofts and cellars. What the Library of Congress and archives advise.';
const PUBLISHED = '2026-10-17';
const CRUMB = 'How to Store Old Photos';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to store old photos so they last' }],
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
    q: 'Is it safe to keep old photos in the loft or garage?',
    a: 'No. The National Archives (UK) and the Library of Congress advise against lofts, cellars and outside walls, and the US National Archives adds garages. Temperatures swing there and condensation can form, which speeds up decay and invites mould. A cupboard in a room you heat and live in is far better.',
  },
  {
    q: 'Are plastic photo sleeves safe for old photos?',
    a: 'Yes, if they are uncoated polyester, polyethylene or polypropylene, as the Library of Congress recommends; the US National Archives says to avoid PVC and unknown plastics. Use them only in a dry room, because photos can stick to plastic above about 70% relative humidity, and never for old acetate or nitrate negatives.',
  },
  {
    q: 'Should I take photos out of magnetic albums?',
    a: 'If a print lifts away easily, yes. Move it to a sleeve or album that has passed the Photographic Activity Test, because self-adhesive pages damage photos over time. If it is stuck, don’t force it: scan or photograph the page as it is and ask a conservator about anything precious.',
  },
  {
    q: 'What is the Photographic Activity Test (PAT)?',
    a: 'It is an international standard, ISO\u00a018916, for photo storage materials. It checks whether a box, sleeve, paper or adhesive reacts with photographs over long contact, causing fading, silver mirroring, spots or yellowing. Look for “passes the PAT” or ISO\u00a018902 on the product.',
  },
  {
    q: 'Do colour photos fade even in a dark box?',
    a: 'Yes. The Canadian Conservation Institute says the dyes in colour photographs fade appreciably even in the dark, and that faded colour photographs are thought to be impossible to restore chemically. Cool, steady storage slows it, and a scan keeps today’s colours.',
  },
];

const KEY_FACTS = [
  <>
    <strong>21°C (70°F) or below</strong> and <strong>30 to 50% relative humidity</strong>, kept steady,
    is what the Library of Congress recommends for photographs.
  </>,
  <>
    <strong>Lofts, garages, cellars and outside walls</strong> are places to avoid: temperatures swing
    there and condensation can form.
  </>,
  <>
    Use boxes and sleeves that have passed the <strong>Photographic Activity Test (PAT)</strong>. Safe
    plastics are <strong>uncoated polyester, polyethylene and polypropylene</strong>; avoid PVC.
  </>,
  <>
    Take off <strong>paper clips, rubber bands and sticky notes</strong>, and avoid albums with{' '}
    <strong>magnetic, self-adhesive pages</strong>.
  </>,
  <>
    <strong>Colour photos and negatives</strong> last longest cold: the Library of Congress recommends{' '}
    <strong>4°C (40°F) or below</strong> for them.
  </>,
  <>
    Scan the photos that matter and keep <strong>at least two copies in different places</strong>.
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'Library of Congress',
    title: 'Care, Handling, and Storage of Photographs',
    href: 'https://www.loc.gov/preservation/care/photo.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'US National Archives',
    title: 'How to Preserve Family Archives: Storing Family Papers and Photographs',
    href: 'https://www.archives.gov/preservation/family-archives/storing',
    date: 'last reviewed September\u00a02025',
  },
  {
    publisher: 'The National Archives (UK)',
    title: 'Caring for your photographs',
    href: 'https://www.nationalarchives.gov.uk/documents/archivesconservation_photo.pdf',
    date: 'accessed October\u00a02026',
  },
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
    publisher: 'Image Permanence Institute',
    title: 'Photographic Activity Test',
    href: 'https://www.rit.edu/ipi/photographic-activity-test',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Library of Virginia',
    title: 'Oh Snap: Preserving Your Photographs (Virginia Archives Month zine)',
    href: 'https://www.lva.virginia.gov/sites/default/files/chunked_uploads/Archives%20Month%20Poster%2025%20%281%29.pdf',
    date: '2025',
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

export default function HowToStoreOldPhotosPage() {
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
              How to store old photos{' '}
              <br />
              <Accent>so they last.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              Store old photos somewhere cool, dry, dark and steady, ideally at 21°C (70°F) or below with 30 to 50% relative humidity, in boxes and sleeves that have passed the Photographic Activity Test. Keep them out of lofts, garages and damp cellars, and away from outside walls, radiators and sunlight.
            </Lead>
            <p>
              That advice comes from the Library of Congress and the national archives of the US and the UK, and most of it costs little. The damage it prevents is slow: fading, yellowing, curling, mould and prints stuck to album pages. Once it shows, there is little a family can do to undo it.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <GuideSection
            title={
              <>
                What temperature and humidity are <Accent tone="pink">best for old photos?</Accent>
              </>
            }
          >
            <Tips>
              <Tip icon={Thermometer}>
                <strong>Temperature.</strong> 21°C (70°F) or below is the Library of Congress target. The Canadian Conservation Institute (CCI) says black-and-white prints are fine between 15°C and 25°C, but never above 30°C.
              </Tip>
              <Tip icon={Droplets}>
                <strong>Humidity.</strong> 30 to 50% relative humidity. CCI puts the optimum at 30 to 35% and the ceiling at 60%, and the US National Archives warns that below 15% can make photos brittle.
              </Tip>
              <Tip icon={Clock}>
                <strong>Steadiness.</strong> Humidity should move by less than 5% in any 24&nbsp;hours, says the Library of Congress, and CCI advises against temperature swings of more than 4°C in a day.
              </Tip>
            </Tips>
            <Prose>
              <p>
                The Library of Congress calls relative humidity “the single most important factor in preserving most photographic prints”. Damp air speeds up decay and feeds mould, The National Archives in the UK explains, and CCI notes that very dry air makes prints curl up tightly. A small digital hygrometer will show whether a cupboard stays in range all year.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Where in the house should <Accent tone="pink">you keep them?</Accent>
              </>
            }
          >
            <Compare labels={['Where photos often end up', 'Where they last longer']}>
              <CompareRow left="A hot loft" right="A cupboard or wardrobe in a room you heat and live in" />
              <CompareRow left="A damp cellar or the garage" right="A shelf off the floor, away from pipes, windows and roof leaks" />
              <CompareRow left="Against an outside wall" right="Against an inside wall, away from condensation" />
              <CompareRow left="Beside a radiator, fire or air vent" right="Away from heat sources and out of direct sunlight" />
              <CompareRow left="A shoebox in the kitchen" right="A photo-safe box, away from food and water that attract insects and rodents" />
            </Compare>
            <Prose>
              <p>
                The National Archives (UK) gives the reason: in a loft, a cellar or along the outside walls of a building, conditions are prone to extremes and fluctuations, and condensation can form. The US National Archives adds garages to the list and suggests keeping boxes on a shelf, so a leak or a flood doesn’t reach them. CCI warns against direct sunlight, and the Library of Congress against radiators, fireplaces and vents.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Which boxes, sleeves and <Accent tone="pink">albums are safe?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Look for the Photographic Activity Test (PAT), an international standard, ISO&nbsp;18916. The Image Permanence Institute explains that it checks whether a material reacts with photographs over long contact, causing fading, silver mirroring, spots or yellowing. The Library of Congress says photo-safe storage must meet ISO&nbsp;18902, which includes the PAT.
              </p>
            </Prose>
            <Points>
              <Point icon={Archive} title="Boxes and folders.">
                Lignin-free board that is acid-free or buffered and has passed the PAT, big enough for prints to lie flat or stand upright without bending (US National Archives). The Library of Virginia lists the ordinary shoebox among storage to avoid.
              </Point>
              <Point icon={Layers} title="Plastic sleeves.">
                Uncoated polyester, polyethylene or polypropylene (Library of Congress). Avoid PVC and any plastic you can’t identify (US National Archives). Skip plastic in a room that ever goes above 70% humidity, where photos can stick to it, and never use it for old acetate or nitrate negatives.
              </Point>
              <Point icon={Mail} title="Paper envelopes.">
                Photo-safe paper keeps light out and is easy to label in pencil, though you have to take the print out to see it (Library of Congress).
              </Point>
              <Point icon={BookOpen} title="Albums.">
                Many modern albums use photo-safe materials. Avoid coloured, “magnetic” or sticky self-adhesive pages (Library of Congress), and don’t overstuff them (US National Archives).
              </Point>
            </Points>
            <Prose>
              <p>
                Two more habits help. Keep prints of the same size together and give fragile ones their own envelope or sleeve, as the Library of Virginia suggests. And store negatives apart from prints: The National Archives (UK) says film negatives can give off acidic gases as they age.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Should you take photos out of <Accent tone="pink">magnetic albums?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Usually, yes. Magnetic albums, with a sticky page under a clear plastic film, are on the US National Archives’ list of materials to avoid, and The National Archives (UK) says magnetic and self-adhesive albums cause deterioration.
              </p>
              <p>
                If a print lifts away without resistance, move it to a PAT-tested sleeve or album. If it is stuck fast, don’t pull, peel or prise it off. The National Archives says photographs stuck to enclosures need specialist treatment because they are hard to separate without damage. Scan or photograph the whole page as it is, and ask a conservator about anything precious.
              </p>
              <p>
                Older albums with paper pages and photo corners are a different case. The National Archives advises keeping old albums intact and storing them flat, preferably in an acid-free box, because the album itself can be a source of family history.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What should you remove, and <Accent tone="pink">what should you leave?</Accent>
              </>
            }
          >
            <Tips>
              <Tip icon={Paperclip}>
                <strong>Take off paper clips, staples and rubber bands.</strong> The Library of Congress says not to use paper clips, rubber bands or other mechanical fasteners on prints, and the US National Archives pictures an old rubber band discoloured and stuck to a photograph.
              </Tip>
              <Tip icon={StickyNote}>
                <strong>Remove sticky notes, but leave old tape to an expert.</strong> The National Archives (UK) says sticky tape causes permanent damage to photographs, so ask a conservator before you try to lift it.
              </Tip>
              <Tip icon={Hand}>
                <strong>Handle prints by the edges with clean hands.</strong> The Library of Congress says to avoid touching the image area, and suggests clean nitrile gloves for negatives and for photos on metal or glass.
              </Tip>
              <Tip icon={Ban}>
                <strong>Don’t clean them yourself.</strong> The National Archives warns that home cleaning can cause serious and often irreversible damage, and advises against erasers, water and solvent-based cleaners.
              </Tip>
            </Tips>
          </GuideSection>

          <GuideSection
            title={
              <>
                Do colour photos and negatives <Accent tone="pink">need colder storage?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                They benefit most from it. CCI says the dyes in colour photographs appear to be the only visual art materials that fade appreciably in the dark, and that faded colour photographs are thought to be impossible to restore chemically. The US National Archives says acetate negatives and colour negatives, slides and prints are vulnerable to fading and deterioration within decades at room temperature.
              </p>
              <p>
                For colour photographs and film negatives, the Library of Congress says temperature is the controlling factor and recommends 4°C (40°F) or below. That is fridge territory, and the US National Archives says cold storage needs special packaging and steps, so don’t just put an album in the fridge. The realistic plan for most families is the coolest, steadiest room in the house and a good scan of the colour photos that matter. Our guide to <Link href="/guides/how-long-do-photos-last">how long photos last</Link> compares each format.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Why is a digital copy part of <Accent tone="pink">good storage?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Because no box protects against everything. The National Archives (UK) suggests having vulnerable or one-of-a-kind photos professionally photographed or digitised and displaying the copy, so the original can stay in the dark. Our guide to <Link href="/guides/how-to-digitize-old-photos">digitising old photos</Link> covers scanning at home.
              </p>
              <p>
                Then look after the files. The Library of Congress recommends at least two copies in different places, checking them at least once a year, and making new copies every five years. While the photos are out, write down who is in them: our guide to <Link href="/guides/how-to-label-old-photos">labelling old photos</Link> shows how, without harming the print.
              </p>
            </Prose>
          </GuideSection>

          <PullQuote>
            Good storage protects the print.{' '}
            <Accent tone="blue">Only people can keep the story.</Accent>
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
                A good box looks after the print, but the story behind it usually lives in one person’s memory. Once a photo is scanned, you can upload it to your family’s private <Link href="/features/family-library">Library</Link> on Ancestorii, add it to an album and invite relatives to give it a name, a date in plain words such as “Summer&nbsp;1994”, what they remember and a voice note. Only the family members you invite can see it.
              </p>
              <p>
                The Free plan needs no card and gives the family 1&nbsp;GB of shared storage, with files up to 20&nbsp;MB each; Premium is £3.99 a month per family for 100&nbsp;GB. It is a place for the photos worth explaining, not a replacement for your backups, so keep your original scans too. Nothing is deleted if you move from Premium back to Free. To turn a box of prints into stories, see <Link href="/guides/what-to-do-with-old-family-photos">what to do with old family photos</Link>.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">storing old photos.</Accent>
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
              Protect the print.
              <br />
              <Accent tone="pink">Keep the story.</Accent>
            </>
          }
        >
          Scan the ones that matter and let the family add who, where and when.
        </GuideCta>
      </SiteShell>
    </>
  );
}
