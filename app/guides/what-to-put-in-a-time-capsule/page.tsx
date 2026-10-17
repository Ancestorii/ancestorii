import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { Baby, Ban, Box, Coins, Droplets, Heart, House, Images, Mail, Mic, Newspaper, Package, Receipt, Tag } from 'lucide-react';
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
  QuestionSet,
  QuestionSets,
  Step,
  Steps,
  Tip,
  Tips,
} from '../_components/GuideBlocks';

const PATH = '/guides/what-to-put-in-a-time-capsule';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'What to Put in a Time Capsule (and What to Avoid)';
const HEADLINE = 'What to put in a time capsule, and what to leave out';
const DESCRIPTION =
  'Letters, named photos, today’s front page, voices and everyday objects: what to put in a time capsule, what to leave out and which container to use.';
const PUBLISHED = '2026-10-17';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'What to put in a time capsule' }],
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
// Container, contents and storage advice is from the International Time Capsule Society (ITCS).
const FAQ_PLAIN = [
  {
    q: 'What do you put in a family time capsule?',
    a: 'A letter from each person, photos with names and dates written on the back, a photocopy of the day’s front page, a list of what things cost, a recording of your voices on a USB stick and a few small everyday objects such as coins or a ticket. Choose things that show how your family lives now.',
  },
  {
    q: 'What should you not put in a time capsule?',
    a: 'Food, plants, rubber, wool, hair, PVC and plastic food wrap such as cling film. The International Time Capsule Society warns that these break down or give off gases that can damage everything else inside. Leave out wood too, and do not rely on a CD or tape alone.',
  },
  {
    q: 'What is the best container for a time capsule?',
    a: 'The International Time Capsule Society recommends a stainless-steel container with no seams and a screw-on lid with an o-ring gasket, or an uncoated PET plastic jar with a screw-top lid of the same plastic. Avoid PVC pipe, and never weld the lid shut.',
  },
  {
    q: 'How long should a time capsule stay closed?',
    a: 'As long as you like. For a family capsule, a date 10 to 25\u00a0years away means the people who packed it can usually open it together. Tie it to an occasion, such as an 18th birthday or a 25th wedding anniversary, so it is harder to forget.',
  },
  {
    q: 'Can you make a digital time capsule?',
    a: 'Yes. Keep three copies of the files in different places, in common formats such as JPEG, MP3 and MP4, and copy them to new storage about every five years. An Ancestorii capsule holds photos, videos, a letter and voice notes, and opens for your family on the date you choose.',
  },
];

const KEY_FACTS = [
  <>
    <strong>Leave these out.</strong> Food, plants, rubber, hair, wool, PVC and plastic food wrap. The
    International Time Capsule Society (ITCS) warns that one item breaking down can damage the rest.
  </>,
  <>
    <strong>Pick a proper container.</strong> Stainless steel with no seams and a screw lid with an
    o-ring gasket, or an uncoated PET plastic jar (recycling code 1) with a lid of the same plastic
    (ITCS).
  </>,
  <>
    <strong>Keep it indoors.</strong> Cool, dry, dark and off the floor, out of attics and basements. The
    ITCS advises against burying it outdoors.
  </>,
  <>
    <strong>Tell three people.</strong> Three trusted people in different places should know the opening
    date, with a yearly reminder in their calendars (ITCS).
  </>,
  <>
    <strong>Copy the digital files.</strong> Keep three copies and move them to current storage about
    every five years (ITCS). The Library of Congress suggests checking them at least once a year.
  </>,
];

const SETS = [
  {
    icon: House,
    title: 'A family capsule',
    items: [
      'A letter from each person, signed and dated',
      'A photo of everyone outside your home',
      'Everyone’s height, measured and written down',
      'Your favourite songs, films and meals, as a list',
    ],
  },
  {
    icon: Baby,
    title: 'A baby’s first year',
    items: [
      'A photo from every month',
      'A letter from each grandparent',
      'A photocopy of the front page from the day they were born',
      'A handprint on acid-free paper',
    ],
  },
  {
    icon: Heart,
    title: 'A wedding or anniversary',
    items: [
      'The order of service',
      'The speeches, printed out',
      'A letter to each other',
      'A photo of the guests, with names on the back',
    ],
  },
];

const SOURCES: Source[] = [
  {
    publisher: 'International Time Capsule Society',
    title: 'The ITCSOC recommendation',
    href: 'https://www.itcsoc.org/_files/ugd/6271cd_4824cd5269b84eda90d1b80404de1658.pdf',
    date: '2022',
  },
  {
    publisher: 'International Time Capsule Society',
    title: 'Register a Time Capsule',
    href: 'https://www.itcsoc.org/register-a-time-capsule',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Great Ormond Street Hospital',
    title: '90s time capsule sealed by Diana, Princess of Wales, revealed',
    href: 'https://www.gosh.nhs.uk/news/90s-time-capsule-sealed-by-diana-princess-of-wales-revealed/',
    date: '27\u00a0August\u00a02025',
  },
  {
    publisher: 'The Seattle Times (The Associated Press)',
    title: 'New Millennium Prompts A Craze For Time Capsules',
    href: 'https://archive.seattletimes.com/archive/19990627/2968764/new-millennium-prompts-a-craze-for-time-capsules',
    date: '27\u00a0June\u00a01999',
  },
  {
    publisher: 'Oglethorpe University',
    title: 'Crypt of Civilization',
    href: 'https://oglethorpe.edu/about/history/crypt/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Digital Photos: Personal Archiving',
    href: 'https://digitalpreservation.gov/personalarchiving/photos.html',
    date: 'accessed October\u00a02026',
  },
];

// Space above a block that follows running text, and above the sources after the last section.
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function TimeCapsulePage() {
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
            { name: 'What to Put in a Time Capsule', path: PATH },
          ]),
          faqSchema(FAQ_PLAIN),
        ]}
      />

      <SiteShell>
        <GuideArticle
          crumb="What to Put in a Time Capsule"
          title={
            <>
              What to put in{' '}
              <br />
              <Accent>a time capsule.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              Put things in a time capsule that show who you are and how you live now: a letter to whoever
              opens it, printed photos with names on the back, a copy of today’s front page, a recording of
              your voices, a list of what things cost and a few small everyday objects. Leave out food,
              plants, rubber, hair, wool and anything made of PVC, which the International Time Capsule
              Society warns can damage everything else inside.
            </Lead>
            <p>
              Then pack it in a sealed, rust-proof container, keep it indoors somewhere cool and dry, and
              make sure at least three people know when it should be opened.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <PullQuote>
            They will know the history.{' '}
            <Accent tone="blue">They will not know what a normal day felt like.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                What should you put <Accent tone="pink">in a time capsule?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                The best capsules are ordinary. The ITCS suggests choosing a purpose first, such as your
                story, daily life or an occasion, and only including what serves it. Six things earn their
                place in almost any capsule:
              </p>
            </Prose>
            <Points>
              <Point icon={Mail} title="A letter to whoever opens it.">
                Describe a normal day, who lives in the house, what you worry about and what you hope for. Our
                guide to <Link href="/guides/how-to-write-a-legacy-letter">writing a legacy letter</Link> can
                help.
              </Point>
              <Point icon={Images} title="Photos with names on the back.">
                Write who, where and when in soft pencil. The ITCS notes that colour prints can fade even in
                the dark, and that black-and-white prints last better.
              </Point>
              <Point icon={Newspaper} title="Today’s front page.">
                Newsprint is acidic and deteriorates easily, so the ITCS suggests a photocopy on archival
                paper instead of the newspaper itself.
              </Point>
              <Point icon={Receipt} title="What things cost.">
                Write down the price of a pint of milk, a loaf of bread, a first-class stamp and a month’s
                rent.
              </Point>
              <Point icon={Mic} title="Your voices.">
                A recording of everyone saying hello and one thing about their life, saved to a USB stick,
                with copies kept outside the capsule too.
              </Point>
              <Point icon={Coins} title="Small everyday objects.">
                Coins, a ticket, a badge, a child’s drawing. Glass, stone, ceramic and metals that do not
                corrode are safe, and coins should be wrapped in anti-tarnish cloth.
              </Point>
            </Points>
            <Prose>
              <p>Some ideas for three common kinds of capsule:</p>
            </Prose>
            <QuestionSets>
              {SETS.map((set) => (
                <QuestionSet key={set.title} icon={set.icon} title={set.title} questions={set.items} />
              ))}
            </QuestionSets>
          </GuideSection>

          <GuideSection
            title={
              <>
                What should you <Accent tone="pink">leave out?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Everything in a capsule shares the same closed space for years, so one item breaking down
                can harm the rest. These are the ITCS’s main things to avoid, with safer swaps:
              </p>
            </Prose>
            <Compare labels={['Leave out', 'Put in instead']}>
              <CompareRow left="Food, sweets and plants" right="A photo of the garden, or a favourite recipe written out by hand" />
              <CompareRow left="PVC and plastic food wrap, such as cling film" right="Acid-free paper envelopes or uncoated PET zip bags" />
              <CompareRow left="Rubber bands, wool and hair, which give off sulphur" right="Acid-free tissue wrapped around each item" />
              <CompareRow left="Wooden objects, which give off acid vapour" right="Glass, stone or ceramic keepsakes" />
              <CompareRow left="The original newspaper" right="A photocopy of the front page on archival paper" />
              <CompareRow left="A CD or tape on its own" right="A printed transcript, with the recording on a USB stick and copies kept outside" />
            </Compare>
          </GuideSection>

          <GuideSection
            title={
              <>
                What container <Accent tone="pink">should you use?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                The ITCS recommends a container that will not rust, is strong and waterproof, and can be sealed
                tightly:
              </p>
            </Prose>
            <Tips>
              <Tip icon={Box}>A stainless-steel container with no seams and a screw-on lid with an o-ring gasket, which the ITCS rates for capsules meant to last at least 100&nbsp;years.</Tip>
              <Tip icon={Package}>Or an uncoated PET plastic jar (recycling code 1) with a screw-top lid of the same plastic.</Tip>
              <Tip icon={Ban}>Not PVC pipe, which breaks down and releases acid. Never weld a lid shut: the heat can damage what is inside.</Tip>
              <Tip icon={Droplets}>A sachet of silica gel, dried to a low humidity first, to soak up moisture.</Tip>
              <Tip icon={Tag}>The opening date and which way up it goes written on the outside, and opening instructions inside.</Tip>
            </Tips>
            <Prose>
              <p>
                Moisture is the usual enemy, even indoors. In March&nbsp;1991, Diana, Princess of Wales, sealed a
                time capsule inside the main entrance of Great Ormond Street Hospital. When the hospital opened
                it in 2025 to make way for its new Children’s Cancer Centre, the contents, chosen by children
                to show 1990s life, had been damaged by moisture. They included a pocket television, a
                solar-powered calculator, British coins, a European passport and a Kylie Minogue CD.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Should you bury <Accent tone="pink">a time capsule?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Usually not. The ITCS’s advice is to keep a capsule indoors: somewhere cool and dark, at around 35% relative humidity, off the floor, away from radiators and vents, and
                out of attics and basements, where leaks and swings in temperature are likely. A wardrobe
                shelf in an inside room is better than a hole in the garden.
              </p>
              <p>
                Buried capsules are also the ones that get lost. In 1999, Paul Hudson, a history professor who
                co-founded the ITCS, estimated that 10,000 time capsules had already been forgotten. If you do
                bury one, the ITCS suggests a burial vault or waterproof wrapping, and telling at least three
                people in different places exactly where it is.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you make sure <Accent tone="pink">it gets opened?</Accent>
              </>
            }
          >
            <Steps>
              <Step number="01" title="Choose a date that means something.">
                <p>An 18th birthday, a 25th wedding anniversary or the year the youngest leaves school is harder to forget than a random year.</p>
              </Step>
              <Step number="02" title="Tell three people.">
                <p>The ITCS suggests three people you trust, living in different places, plus a yearly reminder in their calendars and yours.</p>
              </Step>
              <Step number="03" title="Write the date on the outside.">
                <p>Mark the opening date on the container itself, where anyone who finds it will see it.</p>
              </Step>
              <Step number="04" title="Keep a copy of the list.">
                <p>Make two copies of the contents list, one inside and one kept outside, noting why you chose each thing.</p>
              </Step>
              <Step number="05" title="Register it.">
                <p>The ITCS invites families to register their time capsule with it, as one more record that it exists.</p>
              </Step>
            </Steps>
            <Prose>
              <p>
                How long to wait is up to you. Oglethorpe University’s Crypt of Civilization, sealed on 28&nbsp;May&nbsp;1940 with more than 640,000&nbsp;pages of microfilmed material, is not due to be opened until 28&nbsp;May&nbsp;8113. For a family capsule, a date 10 to 25&nbsp;years away means the people who packed it can
                usually be there to open it.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What about a <Accent tone="pink">digital time capsule?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Photos, videos and voices are often what a family most wants to keep, and they need different
                care. The ITCS recommends making a digital capsule alongside the physical one, with three
                copies: one on a USB stick in the capsule and two more on different kinds of storage, such as
                a hard drive and a cloud account, kept in different places. Copy each to current storage
                about every five years. The Library of Congress also suggests checking digital photos at least
                once a year to make sure they still open.
              </p>
              <p>
                Use common, open formats: the ITCS suggests TIFF, PNG or JPEG for photos, WAV or MP3 for audio
                and MPEG-4 (.mp4) for video. Our guides to{' '}
                <Link href="/guides/how-to-back-up-family-photos">backing up family photos</Link> and{' '}
                <Link href="/guides/how-long-do-photos-last">how long photos last</Link> go further.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How Ancestorii’s <Accent tone="pink">capsules work.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Ancestorii capsules are the digital half. Give a capsule a title, a short message, an opening
                date and a cover photo, then add photos and videos, a letter, voice notes and the loved ones
                it is about. When you press Seal Capsule, Ancestorii asks you to confirm, because once it is
                sealed you cannot open or edit it until the date. On that date it opens for your family
                automatically.
              </p>
              <p>
                Three things to know. No notification is sent when a capsule opens, so put the date in the
                family calendar, as the ITCS suggests. While a capsule is sealed, everyone in your family
                space can see its card, with the title, short message and cover photo, so keep the surprises
                inside. And capsules are made on the website, not in the phone app; they are unlimited on
                every plan, including Free.
              </p>
              <p>
                A digital capsule cannot hold a coin or a drawing, so pair it with a real box: the objects in
                one, the photos and voices in the other. See how{' '}
                <Link href="/features/digital-time-capsule">digital time capsules</Link> work, or make a
                yearly capsule one of your <Link href="/guides/family-traditions-ideas">family traditions</Link>.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Frequently asked <Accent tone="pink">questions.</Accent>
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
              Seal it today.
              <br />
              <Accent tone="pink">Open it together.</Accent>
            </>
          }
        >
          Make a digital capsule for your family that opens on the date you choose.
        </GuideCta>
      </SiteShell>
    </>
  );
}
