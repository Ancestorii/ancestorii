import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { BookOpen, Camera, Flame, PenLine, Scale } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import {
  Compare,
  CompareRow,
  Point,
  Points,
  Prompt,
  Prompts,
  QuestionSet,
  QuestionSets,
  Step,
  Steps,
} from '../_components/GuideBlocks';

const PATH = '/guides/how-to-preserve-family-recipes';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Preserve Family Recipes and Their Stories';
const HEADLINE = 'How to preserve family recipes, and the stories behind them';
const DESCRIPTION =
  'Scan the handwritten cards, convert ounces, pints and gas marks, and cook each dish with the person who made it to catch what the card leaves out.';
const PUBLISHED = '2026-10-17';
const CRUMB = 'How to Preserve Family Recipes';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to preserve family recipes' }],
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
    q: 'How do I preserve my grandmother’s handwritten recipes?',
    a: 'Scan both sides of each card (the Library of Congress suggests 300\u00a0dpi for documents) and keep the originals flat in acid-free folders, away from light and steam. Don’t laminate, tape or clip them. Cook from a typed copy, and record her explaining what the card leaves out.',
  },
  {
    q: 'How do I convert old recipes to metric?',
    a: '1\u00a0oz is about 28\u00a0g and 1\u00a0lb about 454\u00a0g (NIST). A British pint is 568\u00a0ml and an American cup about 240\u00a0ml. Write the metric figure beside the original rather than replacing it, then cook it once and correct anything that comes out wrong.',
  },
  {
    q: 'What is gas mark 4 in Celsius?',
    a: 'Gas\u00a0mark\u00a04 is 180°C, or 160°C in a fan oven, which is 350°F, according to Which?’s oven temperature conversion table.',
  },
  {
    q: 'Can I publish my family’s recipes?',
    a: 'Ask the family first, because some recipes are secrets. The US Copyright Office says a mere listing of ingredients is not protected under US law, but written directions and cookbooks may be. Rules differ between countries, so credit recipes from books or magazines and don’t copy their wording.',
  },
  {
    q: 'How do I make a family recipe book?',
    a: 'Choose the dishes the family asks for and scan the original cards. Pair each recipe with a picture of the card, the dish or the cook, add who made it and when, and have someone test the typed measures before you print it.',
  },
];

const KEY_FACTS = [
  <>
    The Library of Congress suggests scanning documents at <strong>300&nbsp;dpi</strong>, and says greyscale
    can show handwriting better than two-tone black-and-white scans.
  </>,
  <>
    <strong>Don’t laminate the original.</strong> The New York State Archives says lamination can be
    harmful and cannot be easily undone.
  </>,
  <>
    A British pint is <strong>568&nbsp;ml</strong> under the Weights and Measures Act 1985, about a fifth more
    than an American pint.
  </>,
  <>
    <strong>1&nbsp;oz is about 28&nbsp;g</strong>, 1&nbsp;lb about 454&nbsp;g, an American cup about 240&nbsp;ml and a
    tablespoon 15&nbsp;ml (NIST).
  </>,
  <>
    <strong>Gas&nbsp;mark&nbsp;4</strong> is 180°C, 160°C in a fan oven, or 350°F (Which?).
  </>,
  <>
    Under US law a <strong>mere list of ingredients</strong> isn’t protected by copyright, but written
    directions and cookbooks may be (US Copyright Office).
  </>,
];

// Kitchen conversions. Weights, spoons and cups from NIST; pints, gills and fluid ounces from the
// Weights and Measures Act 1985 (pint 0.56826125 litre, gill 1/4 pint, fluid ounce 1/20 pint).
const WEIGHTS = [
  '1\u00a0ounce (oz) is about 28\u00a0g, and 1\u00a0pound (lb) about 454\u00a0g',
  '1 British pint is 568\u00a0ml, as set in UK law',
  '1\u00a0gill is a quarter of a British pint, about 142\u00a0ml',
  '1 British fluid ounce is a twentieth of a pint, about 28\u00a0ml',
  '1 American cup is about 240\u00a0ml, and an American pint (2\u00a0cups) about 480\u00a0ml',
  '1\u00a0tablespoon is 15\u00a0ml, and 1\u00a0teaspoon 5\u00a0ml',
];

// Which?'s oven temperature conversion table (1 October 2026).
const GAS_MARKS = [
  'Gas\u00a0mark\u00a01: 140°C, 120°C fan, 275°F',
  'Gas\u00a0mark\u00a02: 150°C, 130°C fan, 300°F',
  'Gas\u00a0mark\u00a03: 160°C, 140°C fan, 325°F',
  'Gas\u00a0mark\u00a04: 180°C, 160°C fan, 350°F',
  'Gas\u00a0mark\u00a05: 190°C, 170°C fan, 375°F',
  'Gas\u00a0mark\u00a06: 200°C, 180°C fan, 400°F',
  'Gas\u00a0mark\u00a07: 220°C, 200°C fan, 425°F',
  'Gas\u00a0mark\u00a08: 230°C, 210°C fan, 450°F',
  'Gas\u00a0mark\u00a09: 240°C, 220°C fan, 475°F',
];

const SOURCES: Source[] = [
  {
    publisher: 'Library of Congress',
    title: 'Scanning Your Personal Collections (Personal Digital Archiving Series)',
    href: 'https://www.digitalpreservation.gov/personalarchiving/documents/scanning_collections.pdf',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Care, Handling and Storage of Works on Paper',
    href: 'https://www.loc.gov/preservation/care/paper.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'New York State Archives',
    title: 'Caring for Your Treasures: Paper',
    href: 'https://www.archives.nysed.gov/preservation/family-records-paper',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Apple Support',
    title: 'Scan text and documents in Notes using the iPhone camera',
    href: 'https://support.apple.com/en-gb/guide/iphone/iph653f28965/ios',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'NIST',
    title: 'Metric Kitchen: Cooking Measurement Equivalencies',
    href: 'https://www.nist.gov/pml/owm/metric-si/metric-kitchen/metric-kitchen-cooking-measurement-equivalencies',
    date: 'updated 29\u00a0April\u00a02026',
  },
  {
    publisher: 'legislation.gov.uk',
    title: 'Weights and Measures Act 1985, Schedule 1',
    href: 'https://www.legislation.gov.uk/ukpga/1985/72/schedule/1',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Which?',
    title: 'Oven temperature conversion table',
    href: 'https://www.which.co.uk/reviews/built-in-ovens/article/oven-temperature-conversion-table-aA5Ol9b157On',
    date: '1\u00a0October\u00a02026',
  },
  {
    publisher: 'US Copyright Office',
    title: 'What Does Copyright Protect? (FAQ)',
    href: 'https://www.copyright.gov/help/faq/faq-protect.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Emory University',
    title: 'How family stories help children weather hard times',
    href: 'https://news.emory.edu/stories/2020/04/how-family-stories-help-children-weather-hard-times',
    date: '29\u00a0April\u00a02020',
  },
];

// Room above the key facts and the author box, and above the sources (a section's step).
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function PreserveFamilyRecipesPage() {
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
              <Accent>family recipes.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              To preserve a family recipe, scan or photograph the original card (the Library of Congress suggests 300&nbsp;dpi for documents), keep the card flat in an acid-free folder, and type a working copy with modern measurements beside the old ones. Then cook it with the person who made it, and write down or record everything that never made it onto the card.
            </Lead>
            <p>
              The card is rarely the whole recipe. In his letter on{' '}
              <Link href="/why-this-exists">why Ancestorii exists</Link>, our founder remembers his grandmother’s recipe, the one she “never once measured but always got right”, and the wave of her hand whenever anyone asked how much to add. This guide covers both halves: keeping the paper safe, and catching the method before it goes.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <GuideSection
            title={
              <>
                Why keep the <Accent tone="pink">original card?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Because it holds things a typed copy can’t: the handwriting, the crossings-out, the note in the margin, the splash of butter that shows which recipe got used most. Once it is scanned, you can cook from a copy and let the original rest.
              </p>
              <p>
                The New York State Archives names acidity, light, and widely fluctuating temperature and humidity as the greatest threats to family papers. A kitchen supplies plenty of the last two. Recipes cut from newspapers are the most fragile: the same archive warns that highly acidic clippings often become yellow and brittle quickly, and suggests separating them from other papers and copying them onto acid-free paper.
              </p>
            </Prose>
            <Compare labels={['What often happens', 'What archivists recommend']}>
              <CompareRow
                left="Laminate the card to keep splashes off"
                right="Laminate a copy instead: lamination can harm the original and can’t easily be undone"
              />
              <CompareRow
                left="Clip cards together or tape a cutting into a notebook"
                right="No staples, rubber bands, tape or glue on anything that matters"
              />
              <CompareRow
                left="Keep the recipe tin by the cooker or on a sunny shelf"
                right="Store originals somewhere dark, cool, dry and steady"
              />
              <CompareRow
                left="Fold big sheets to fit the tin"
                right="Store loose papers unfolded, in acid-free folders"
              />
            </Compare>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you scan and <Accent tone="pink">store old recipe cards?</Accent>
              </>
            }
          >
            <Steps>
              <Step number="01" title="Scan both sides.">
                <p>
                  Notes on the back often matter most: who it came from, or “double it for Christmas”. The Library of Congress suggests scanning documents at 300&nbsp;dpi, and says greyscale can show handwriting better than two-tone black-and-white scans. Choose colour if the stains or ink colours tell part of the story.
                </p>
              </Step>
              <Step number="02" title="Or use your phone.">
                <p>
                  On an iPhone, the Notes app’s Scan Documents tool captures the page automatically when it detects the edges, and saves it as a PDF in the note. Lay the card flat in daylight with no shadow across it. Our guide to{' '}
                  <Link href="/guides/how-to-scan-photos-with-your-phone">scanning with your phone</Link> covers glare and settings.
                </p>
              </Step>
              <Step number="03" title="Name every file.">
                <p>
                  A name like <span style={{ whiteSpace: 'nowrap' }}>nan-joan-shortbread.jpg</span> can be found in ten years; IMG_4821.jpg can’t. The Library of Congress suggests starting file names with the date as yyyymmdd when you know it, and saving pages that belong together as one PDF.
                </p>
              </Step>
              <Step number="04" title="Store the originals flat.">
                <p>
                  Keep cards unfolded in acid-free, lignin-free folders or sleeves, inside a box. The Library of Congress recommends a cool, relatively dry place (about 35% relative humidity) with as little light as possible, and no paper clips, rubber bands, self-adhesive tape or glue. The New York State Archives adds that “archival” does not mean the same thing as acid-free, so check the label.
                </p>
              </Step>
              <Step number="05" title="Keep two copies of the scans.">
                <p>
                  The Library of Congress suggests at least two copies, stored in different places, so one lost phone or house fire can’t take everything.
                </p>
              </Step>
            </Steps>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you convert old <Accent tone="pink">measurements and gas marks?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Write the modern measure beside the original rather than replacing it, so “8&nbsp;oz plain flour” becomes “8&nbsp;oz (about 225&nbsp;g) plain flour”. The old figure is part of the record and lets someone check your sums. Then cook it once and correct anything that came out wrong.
              </p>
            </Prose>
            <QuestionSets>
              <QuestionSet icon={Scale} title="Weights and volumes" questions={WEIGHTS} />
              <QuestionSet icon={Flame} title="Gas marks in °C and °F" questions={GAS_MARKS} />
            </QuestionSets>
            <Prose>
              <p>
                The pint is the trap. A British pint is about a fifth bigger than an American one, so a pint of milk in a British recipe is more than two American cups. Which? notes that fan ovens typically cook about 20°C lower than conventional ovens, which is why each gas mark has two Celsius figures. When a card only says “a moderate oven” or “a knob of butter”, ask the cook, or start in the middle of the range and watch it closely the first time.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you capture what <Accent tone="pink">isn’t written down?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Cook it together, with a recorder running. Emory University psychologist Robyn Fivush, who studies family stories, says cooking together is “a perfect time” to tell them, with lines as small as “When I was a little girl, my mother taught me how to cook this dish.” These questions work at the stove:
              </p>
            </Prose>
            <Prompts>
              <Prompt
                question="Who taught you to make this?"
                context="Where it came from: a mother, a neighbour, a newspaper or the back of a packet."
              />
              <Prompt
                question="How do you know when it’s ready?"
                context="Old cards rarely say. The answer is usually a smell, a colour or a sound."
              />
              <Prompt
                question="How much is a handful?"
                context="Watch, then weigh what they actually use and write it down."
              />
              <Prompt
                question="When did you make it, and for whom?"
                context="Sundays, birthdays, the winter someone was ill. This is the part the family keeps."
              />
              <Prompt
                question="What have you changed over the years?"
                context="Recipes drift. Write down both versions, and who prefers which."
              />
              <Prompt
                question="What goes wrong if you rush it?"
                context="The mistakes are part of the method, and they are never on the card."
              />
            </Prompts>
            <Prose>
              <p>
                Photograph the dish and the cook’s hands at work, and record them explaining one step in their own words.
              </p>
            </Prose>
          </GuideSection>

          <PullQuote>
            The card keeps the ingredients.{' '}
            <Accent tone="blue">The cook keeps the method.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                Can you share or <Accent tone="pink">publish family recipes?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Ask the family first: some recipes are secrets. If a recipe came from a cookbook or a magazine, credit it and don’t copy its wording.
              </p>
              <p>
                On the law, the US Copyright Office says “a mere listing of ingredients is not protected under copyright law”, but a recipe with substantial explanation or directions, or a collection of recipes as in a cookbook, may be. That is US law. Rules differ between countries, so check before you publish anything you didn’t write yourself.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you make a <Accent tone="pink">family recipe book?</Accent>
              </>
            }
          >
            <Points>
              <Point icon={BookOpen} title="Choose the recipes.">
                Start with the dishes the family actually asks for, not every card in the tin.
              </Point>
              <Point icon={Camera} title="Pair each recipe with a picture.">
                The scan of the original card, the finished dish, or the cook at the stove.
              </Point>
              <Point icon={PenLine} title="Add a few lines of story.">
                Who made it, when it appeared on the table, and one memory of eating it.
              </Point>
              <Point icon={Scale} title="Test the typed measures.">
                Ask someone who didn’t type it up to cook from your version and mark anything unclear.
              </Point>
            </Points>
            <Prose>
              <p>
                Our guide to{' '}
                <Link href="/guides/what-to-write-in-a-memory-book">what to write in a memory book</Link> has more on short, specific captions.
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
                Make an album, say “Nan’s recipes”, and upload a photo of each card. Each photo can have a name, a date such as “Christmas&nbsp;1978”, a story thread where the family add what they remember, and voice notes, recorded or uploaded, so the card and the cook’s voice stay together. Albums are unlimited on every plan, including Free: see{' '}
                <Link href="/features/family-photo-albums">how albums work</Link>.
              </p>
              <p>
                In the free iPhone and Android app, a recipe can also be a memory in your private family feed, with up to 10 photos and a voice note. When an aunt remembers it differently (“she always added an extra egg”), she can add her version to the same memory, and the two sit side by side.
              </p>
              <p>
                To share a recipe with everyone, Our Stories, Ancestorii’s free public feed on the website, has a{' '}
                <Link href="/stories/topics/food-and-recipes">Food &amp; Recipes topic</Link>, and a story can carry up to 10 photos, a video and a voice note. When the collection is ready, a printed{' '}
                <Link href="/memory-books">Memory Book</Link> makes it an A4 landscape hardcover, from £44.99 plus delivery. The book holds photos and short captions, not audio, so put each recipe in as a photo of the card or your typed copy, with its story in the caption.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">family recipes.</Accent>
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
              Keep the recipe
              <br />
              <Accent tone="pink">and the voice too.</Accent>
            </>
          }
        >
          Start a private family space and add the first card today.
        </GuideCta>
      </SiteShell>
    </>
  );
}
