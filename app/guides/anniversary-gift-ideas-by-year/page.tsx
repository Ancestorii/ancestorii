import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  Cake,
  Camera,
  Crown,
  FileText,
  Flower2,
  Gem,
  Heart,
  Leaf,
  Mic,
  Package,
  Shirt,
  Sparkles,
  TreeDeciduous,
} from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import {
  GuideFigure,
  Point,
  Points,
  QuestionSet,
  QuestionSets,
  Step,
  Steps,
  Tip,
  Tips,
} from '../_components/GuideBlocks';

const PATH = '/guides/anniversary-gift-ideas-by-year';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Anniversary Gifts by Year: The Traditional List';
const HEADLINE = 'Wedding anniversary gifts by year: the traditional British list';
const DESCRIPTION =
  'Paper, cotton, leather through to ruby, gold, diamond and platinum: the traditional British anniversary list by year, where it came from, and gift ideas.';
const PUBLISHED = '2026-10-17';
const CRUMB = 'Anniversary Gifts by Year';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Wedding anniversary gifts by year' }],
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
    q: 'What is the traditional gift for a 1st wedding anniversary?',
    a: 'Paper, on both the British list published by Debrett’s and the Emily Post Institute’s American list. Letters, framed tickets from your first date or a printed book of your first year together all count. Emily Post’s modern list suggests clocks instead.',
  },
  {
    q: 'What anniversary is ruby?',
    a: 'Ruby is the 40th wedding anniversary. On Debrett’s list it comes after coral for the 35th and before sapphire for the 45th.',
  },
  {
    q: 'What is the 25th wedding anniversary called?',
    a: 'The silver wedding. Debrett’s says the 25th and 50th were celebrated with silver and gold wreaths as far back as the Middle Ages, when they were comparatively rare because life expectancy was short.',
  },
  {
    q: 'How do you get a card from the King for a 60th wedding anniversary?',
    a: 'Apply to the Anniversaries Office at Buckingham Palace: online up to 5\u00a0weeks before the date, or by post no sooner than 3\u00a0weeks before, with a copy of the marriage certificate. Cards go to current citizens of His Majesty’s Realms and UK Overseas Territories; couples in Australia, Canada and New Zealand apply through their Governor-General.',
  },
  {
    q: 'What is the gift for a 70th wedding anniversary?',
    a: 'Platinum, the last anniversary on Debrett’s list. The King sends a card for the 70th, the platinum wedding, and for every anniversary after it, if someone applies.',
  },
];

const KEY_FACTS = [
  <>
    <strong>1st paper, 2nd cotton, 3rd leather, 4th flowers and fruit, 5th wood, 10th tin</strong>{' '}
    (Debrett’s).
  </>,
  <>
    <strong>25th silver, 30th pearl, 40th ruby, 50th gold, 60th diamond, 70th platinum</strong>{' '}
    (Debrett’s).
  </>,
  <>
    Diamonds became linked to the 60th through <strong>Queen Victoria’s diamond jubilee</strong>, which
    marked 60&nbsp;years on the throne (Debrett’s).
  </>,
  <>
    American lists differ: the Emily Post Institute gives <strong>iron for the 6th</strong>, where
    Debrett’s gives sugar, and adds a modern gift such as clocks for the 1st.
  </>,
  <>
    The King sends cards for the <strong>60th, 65th and 70th</strong> wedding anniversaries and every
    year after. Apply online up to <strong>5&nbsp;weeks</strong> before.
  </>,
  <>
    In the US, couples marking <strong>50&nbsp;years or more</strong> can request a White House greeting at
    least <strong>6&nbsp;weeks</strong> ahead, for US citizens only.
  </>,
];

// Debrett's British list, year by year.
const EARLY_YEARS = ['1st: Paper', '2nd: Cotton', '3rd: Leather', '4th: Flowers and fruit', '5th: Wood'];
const SIX_TO_TEN = [
  '6th: Sugar',
  '7th: Wool and copper',
  '8th: Bronze and pottery',
  '9th: Willow and pottery',
  '10th: Tin',
];
const ELEVEN_TO_FIFTEEN = ['11th: Steel', '12th: Silk and linen', '13th: Lace', '14th: Ivory', '15th: Crystal'];
const MILESTONES = [
  '20th: China',
  '25th: Silver',
  '30th: Pearl',
  '35th: Coral',
  '40th: Ruby',
  '45th: Sapphire',
  '50th: Gold',
  '55th: Emerald',
  '60th: Diamond',
  '70th: Platinum',
];

const SOURCES: Source[] = [
  {
    publisher: 'Debrett’s',
    title: 'Marital milestones: how to celebrate a wedding anniversary',
    href: 'https://debretts.com/marital-milestones-how-to-celebrate-a-wedding-anniversary/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'The Emily Post Institute',
    title: 'Classic Etiquette, Anniversary Gifts by Year',
    href: 'https://emilypost.com/advice/classic-etiquette-anniversary-gifts-by-year',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'The Royal Family',
    title: 'Anniversary messages',
    href: 'https://www.royal.uk/anniversary-messages',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'US House of Representatives (Office of Rep. Delia Ramirez)',
    title: 'Presidential Greetings',
    href: 'https://ramirez.house.gov/services/presidential-greetings',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'GOV.UK',
    title: 'Deal in items made of or containing ivory',
    href: 'https://www.gov.uk/guidance/dealing-in-items-containing-ivory-or-made-of-ivory',
    date: 'updated 24\u00a0July\u00a02026',
  },
];

// Room above the key facts and the author box, and above the sources (a section's step).
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function AnniversaryGiftsByYearPage() {
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
              Wedding anniversary{' '}
              <br />
              <Accent>gifts by year.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              The traditional British list, as published by Debrett’s, runs paper (1st), cotton (2nd), leather (3rd), flowers and fruit (4th), wood (5th), sugar (6th), wool and copper (7th), bronze and pottery (8th), willow and pottery (9th), tin (10th) and steel to crystal (11th to 15th), then china (20th), silver (25th), pearl (30th), coral (35th), ruby (40th), sapphire (45th), gold (50th), emerald (55th), diamond (60th) and platinum (70th).
            </Lead>
            <p>
              Debrett’s calls the list “merely a suggestion, not a prescriptive set of instructions”, so treat each material as a prompt rather than a rule. Below: the full list, where it came from, ideas for each year, and how to get a card from the King for a 60th.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <GuideSection
            title={
              <>
                What are the traditional <Accent tone="pink">anniversary gifts by year?</Accent>
              </>
            }
          >
            <QuestionSets>
              <QuestionSet icon={FileText} title="The first five years" questions={EARLY_YEARS} />
              <QuestionSet icon={Package} title="Years six to ten" questions={SIX_TO_TEN} />
              <QuestionSet icon={Sparkles} title="Years eleven to fifteen" questions={ELEVEN_TO_FIFTEEN} />
              <QuestionSet icon={Gem} title="The milestones" questions={MILESTONES} />
            </QuestionSets>
            <Prose>
              <p>
                Debrett’s list stops at the 70th and doesn’t name the 65th, although the King sends a card for it. Ivory, the 14th, is best taken as a colour: GOV.UK says that since 6&nbsp;June&nbsp;2022 you cannot buy, sell or hire out items containing elephant ivory in the UK unless they are registered or certified as exempt, and the ban now also covers hippo, killer whale, narwhal and sperm whale ivory.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Where does the <Accent tone="pink">anniversary list come from?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Debrett’s traces it to the Middle Ages, when 25th and 50th anniversaries, “comparatively rare events when life expectancy was short”, were celebrated with silver and gold wreaths that the husband gave his wife. More dates were added gradually. Queen Victoria’s diamond jubilee marked 60&nbsp;years on the throne, and diamonds became associated with the 60th; in the same era, wood came to stand for the 5th, and husbands often carved keepsakes by hand.
              </p>
              <p>
                In America, the full year-by-year list came later still. The Emily Post Institute says Emily Post’s 1922 etiquette book covered eight anniversaries, including paper for the 1st, silver for the 25th and gold for the 50th, and that in 1937 the American National Retail Jeweler Association filled out most of the rest. American lists still differ from British ones in places: Emily Post’s classic list gives iron for the 6th where Debrett’s gives sugar, and it adds a modern gift for each year on the list, such as clocks for the 1st and silverware for the 5th.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Gift ideas for the <Accent tone="pink">first ten years.</Accent>
              </>
            }
          >
            <Tips>
              <Tip icon={FileText}>
                <strong>1st, paper:</strong> a printed book of your first year together, framed tickets from your first date, or a letter written for the day.
              </Tip>
              <Tip icon={Shirt}>
                <strong>2nd, cotton:</strong> good cotton bedding, or a picnic blanket for the summer ahead.
              </Tip>
              <Tip icon={Heart}>
                <strong>3rd, leather:</strong> a leather-bound journal or photo album with room for the next ten years.
              </Tip>
              <Tip icon={Flower2}>
                <strong>4th, flowers and fruit:</strong> a fruit tree for the garden, or the flowers from your wedding bouquet, ordered again.
              </Tip>
              <Tip icon={TreeDeciduous}>
                <strong>5th, wood:</strong> a wooden frame for the wedding photo, or a keepsake box for letters and tickets.
              </Tip>
              <Tip icon={Cake}>
                <strong>6th, sugar:</strong> bake the cake you had at your wedding, or the dessert from your first date.
              </Tip>
              <Tip icon={Leaf}>
                <strong>7th to 9th, wool, copper, bronze, pottery and willow:</strong> a wool blanket, a copper planter, a handmade mug each, or a willow basket packed for a day out.
              </Tip>
              <Tip icon={Package}>
                <strong>10th, tin:</strong> a tin of ten notes, one for each year, or a time capsule to open on your 25th.
              </Tip>
            </Tips>
          </GuideSection>

          <GuideSection
            title={
              <>
                Gift ideas for <Accent tone="pink">milestone anniversaries.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                By the 25th, the best material is usually the family’s own photos. Ask children, grandchildren and old friends for one picture and one memory of the couple each, well before the day.
              </p>
            </Prose>
            <Points>
              <Point icon={Gem} title="25th, silver.">
                A book of the marriage so far, built from everyone’s photos, with a line from each person who sent one.
              </Point>
              <Point icon={Camera} title="40th, ruby.">
                Recreate the wedding photo in the same spot, then frame the two pictures side by side.
              </Point>
              <Point icon={Crown} title="50th, gold.">
                A party with the people who were there, and their wedding song playing. In the US, request a White House greeting at least six weeks ahead.
              </Point>
              <Point icon={Sparkles} title="60th, diamond.">
                The King’s card, applied for up to five weeks before, alongside a large print of the wedding photo.
              </Point>
              <Point icon={Mic} title="70th, platinum.">
                Their own story, recorded: how they met, the wedding day, the first home. Keep it in their voices.
              </Point>
            </Points>
            <Prose>
              <p>
                By the 50th, the couple are often grandparents too, and our guide to{' '}
                <Link href="/guides/gifts-for-grandparents">gifts for grandparents</Link> has more ideas that suit them.
              </p>
            </Prose>
          </GuideSection>

          <PullQuote>
            After fifty years, the best gift{' '}
            <Accent tone="blue">is usually the photos you already have.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                Can you get a card from the King <Accent tone="pink">for a wedding anniversary?</Accent>
              </>
            }
          >
            <Steps>
              <Step number="01" title="Check the anniversary.">
                <p>
                  The King sends cards for diamond (60th), 65th and platinum (70th) wedding anniversaries, and every year after that. Wedding cards are not automatic: the Anniversaries Office at Buckingham Palace must receive an application.
                </p>
              </Step>
              <Step number="02" title="Check who can receive one.">
                <p>
                  Only current citizens of His Majesty’s Realms or UK Overseas Territories. Couples in Australia, Canada and New Zealand apply through their Governor-General instead.
                </p>
              </Step>
              <Step number="03" title="Apply at the right time.">
                <p>
                  Apply online up to 5&nbsp;weeks before the date, or by post no sooner than 3&nbsp;weeks before (an extra two weeks can be allowed over Christmas and Easter). Include a copy of the marriage certificate; if you can’t, contact the General Register Office, which can confirm the marriage details with the Anniversaries Office.
                </p>
              </Step>
              <Step number="04" title="If you miss the date.">
                <p>
                  A belated message can be requested up to six months afterwards. The office closes from 24&nbsp;December to 2&nbsp;January, so plan around the holidays.
                </p>
              </Step>
            </Steps>
            <Prose>
              <p>
                In the US, couples celebrating their 50th anniversary or later can request a greeting from the White House. Congressional offices, such as Representative Delia Ramirez’s, ask for requests at least six weeks ahead, and greetings go to US citizens only.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How Ancestorii <Accent tone="pink">fits an anniversary.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Paper is the first-anniversary material, which makes a printed book a natural fit. A{' '}
                <Link href="/memory-books">Memory Book</Link> is an A4 landscape hardcover of your photos and words: 24 printed pages cost £44.99 plus delivery. Our guide to{' '}
                <Link href="/guides/what-to-write-in-a-memory-book">what to write in a memory book</Link> helps with the captions.
              </p>
              <p>
                For a 25th, 40th or 50th, invite the family into a private family space and ask everyone to add their photos of the couple to the shared{' '}
                <Link href="/features/family-library">family Library</Link>. Then build a book of the whole marriage: A Legacy has 48 printed pages for £64.99 plus delivery. To put the wedding photo on the wall, there is a{' '}
                <Link href="/canvas-prints">Memory Canvas</Link> or an{' '}
                <Link href="/acrylic-prints">Acrylic Print</Link>, both from £99.99 plus delivery. Premium families (£3.99 a month) get 10% off prints, and standard delivery takes 10 to 14&nbsp;working&nbsp;days, so order a few weeks before the date.
              </p>
            </Prose>
            <GuideFigure
              src="/testimonial1.png"
              alt="Looking through a printed Ancestorii Memory Book together"
              label="Nicole · Nampa, US"
              color="var(--c3)"
              position="50% 60%"
            />
            <Prose>
              <p>
                Nicole put a common problem plainly: “In my case, I have external hard drives full of photos I never get to see, but Ancestorii finally gave those memories a place where they can be easily enjoyed and shared.”
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">anniversary gifts.</Accent>
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
              Gather the photos
              <br />
              <Accent tone="pink">from every year.</Accent>
            </>
          }
        >
          Invite the family into one private space and let everyone add what they have.
        </GuideCta>
      </SiteShell>
    </>
  );
}
