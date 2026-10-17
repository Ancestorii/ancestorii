import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { CircleHelp, Images, Magnet, Pencil, PencilLine, Stamp, Users } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import site from '@/components/site/site.module.css';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { Compare, CompareRow, GuideFigure, Point, Points, Step, Steps, Tip, Tips } from '../_components/GuideBlocks';

const PATH = '/guides/how-to-label-old-photos';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Label Old Photos Without Damaging Them';
const HEADLINE = 'How to label old photos, and what to write';
const DESCRIPTION =
  'Write lightly on the back edge in soft pencil, never ballpoint or sticky labels, and note who, where and when. Archive advice for prints and their scans.';
const PUBLISHED = '2026-10-17';
const CRUMB = 'How to Label Old Photos';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to label old photos' }],
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
    q: 'Can I use a pen to write on the back of photos?',
    a: 'It is best not to. The Canadian Conservation Institute warns that ink inscriptions can fade on display and will bleed and become illegible if they get wet, and the Library of Virginia advises avoiding standard pens, permanent markers and highlighters. Use a soft graphite pencil, or write on the sleeve instead.',
  },
  {
    q: 'What pencil is best for labelling photographs?',
    a: 'A soft graphite pencil. The Canadian Conservation Institute and The National Archives (UK) both name an HB, used lightly. For slick, glossy resin-coated prints, the Library of Virginia suggests a softer 4B or 6B. If the pencil won’t mark without pressing, write on the sleeve or envelope instead.',
  },
  {
    q: 'Are sticky labels safe on old photos?',
    a: 'No. The Library of Congress says to keep self-adhesive tape, sticky notes, glue and other adhesives off photographs, and The National Archives (UK) says sticky tape causes permanent damage. Write on the sleeve or envelope instead, or on a card kept in the same sleeve.',
  },
  {
    q: 'How do I label photos I’ve already scanned?',
    a: 'Give each file a descriptive name, tag it with the names of the people in it and add a short description, as the Library of Congress recommends. A name that starts with the date, such as 1962-07_Blackpool_Nan-and-Grandad.jpg, sorts itself in order. Keep the pencil label on the print as well, in case the files are lost.',
  },
  {
    q: 'What if nobody knows who is in a photo?',
    a: 'Write down what you do know: the place, a rough date with “circa”, the album or box it came from. Then show it to the oldest relatives, check the back for stamped details, and compare faces with photos you can date. Mark guesses with a question mark so nobody mistakes them for fact.',
  },
];

const KEY_FACTS = [
  <>
    Write on the <strong>back, near the edge</strong>, with a <strong>soft graphite pencil</strong> and
    light pressure (Library of Congress).
  </>,
  <>
    Better still, write on the <strong>sleeve or envelope</strong>: the Library of Congress prefers
    marking the housing to marking the photo.
  </>,
  <>
    <strong>No ballpoints, felt tips, markers or sticky labels.</strong> Ink can fade on display and
    bleeds if it gets wet.
  </>,
  <>
    Record <strong>who, where, when and who took it</strong>, with full names and relationships. Use{' '}
    <strong>“circa”</strong> for a rough date.
  </>,
  <>
    Slick, glossy <strong>resin-coated prints</strong> (late 1960s on) need a softer pencil: the Library
    of Virginia suggests <strong>4B or 6B</strong>.
  </>,
  <>
    Repeat the details in the scan’s <strong>file name and tags</strong> so they travel with the digital
    copy.
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
    publisher: 'Canadian Conservation Institute',
    title: 'Care of Black-and-White Photographic Prints (CCI Notes 16/4)',
    href: 'https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/care-black-white-photographic-prints.html',
    date: 'revised 2007',
  },
  {
    publisher: 'The National Archives (UK)',
    title: 'Caring for your photographs',
    href: 'https://www.nationalarchives.gov.uk/documents/archivesconservation_photo.pdf',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Library of Virginia and MARAC',
    title: 'Preserving Your Photographs (Virginia Archives Month poster)',
    href: 'https://www.lva.virginia.gov/sites/default/files/chunked_uploads/Archives%20Month%20Poster%2025%20%281%29.pdf',
    date: '2025',
  },
  {
    publisher: 'Library of Congress',
    title: 'Personal Archiving: Digital Photos',
    href: 'https://digitalpreservation.gov/personalarchiving/photos.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Apple Support',
    title: 'Find and name people and pets in Photos on iPhone',
    href: 'https://support.apple.com/en-gb/guide/iphone/iph9c7ee918c/ios',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Google Photos Help',
    title: 'Set up and manage your face groups',
    href: 'https://support.google.com/photos/answer/6128838?hl=en-GB',
    date: 'accessed October\u00a02026',
  },
];

// Room above the key facts and the author box, and above the sources (a section's step).
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function HowToLabelOldPhotosPage() {
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
              How to label old photos,{' '}
              <br />
              <Accent>and what to write.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              Label an old photo lightly on the back, close to the edge, with a soft graphite pencil, or write on its sleeve or envelope instead. Note who is in it, where and when it was taken and who took it, then put the same details on the scanned copy.
            </Lead>
            <p>
              A print can outlast everyone who could name the people in it. Here is what to write, what to write it with and where, based on guidance from the Library of Congress, the Canadian Conservation Institute and The National Archives in the UK.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <GuideSection
            title={
              <>
                What should you write <Accent tone="pink">on an old photo?</Accent>
              </>
            }
          >
            <Steps>
              <Step number="01" title="Who is in it.">
                <p>Full names, left to right, including maiden names, and how each person is related to you or to each other. The Library of Virginia suggests noting relationships to the photographer too.</p>
              </Step>
              <Step number="02" title="Where it was taken.">
                <p>The town, the street or the house, plus any landmark or named building in the picture, as the Library of Virginia suggests.</p>
              </Step>
              <Step number="03" title="When it was taken.">
                <p>An exact date if you know it. If not, the Library of Virginia suggests “circa” or “c.”, as in “c.&nbsp;1962”. A season helps too.</p>
              </Step>
              <Step number="04" title="Who took it, and who told you.">
                <p>Add the photographer if you know, and whose memory the label comes from, such as “Mum, 2026”, so a later reader knows how sure to be.</p>
              </Step>
            </Steps>
            <Prose>
              <p>
                If there is room, add one line about why the photo was kept. The founder’s caption on one of his own family photos does it all in a single line: who is in it, why it matters and when it was taken.
              </p>
            </Prose>
            <GuideFigure
              src="/family.jpg"
              alt="Dante and his mum sitting on the floor"
              label={'Me and my mum · The woman behind everything · May\u00a02011'}
              color="var(--c2)"
              position="50% 40%"
            />
          </GuideSection>

          <GuideSection
            title={
              <>
                What should you <Accent tone="pink">write with?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                A soft graphite pencil. That is the Library of Congress’s advice, and the Canadian Conservation Institute (CCI) and The National Archives (UK) both name an HB, used lightly. Ink is the problem: CCI warns that ink inscriptions are liable to fade on display and will bleed and become illegible if they get wet, and the Library of Virginia advises avoiding standard pens, permanent markers and highlighters.
              </p>
            </Prose>
            <Compare labels={['Avoid', 'Use instead']}>
              <CompareRow left="Ballpoint pens, felt tips and permanent markers" right="A soft graphite pencil, HB or softer" />
              <CompareRow left="Pressing hard on a soft surface" right="Light strokes on a clean, hard surface" />
              <CompareRow left="Sticky labels, sticky notes or tape" right="Writing on the sleeve, envelope or a card kept with it" />
              <CompareRow left="A note paper-clipped to the photo" right="The note kept in the same sleeve or envelope" />
            </Compare>
            <Prose>
              <p>
                The Library of Congress says to keep self-adhesive tape, sticky notes and glue off photographs, and CCI says not to attach other documents to photographs with paper clips or staples.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Where on the photo <Accent tone="pink">should you write?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                On the back, as close to the edge as you can, and only what you need. The Library of Congress says to avoid marking photographs where possible and, when you must, to write on the back near the edge; CCI gives the same advice.
              </p>
              <p>
                With a pencil, the risk is pressure, which can transfer through to the image side. The Library of Virginia suggests working on a clean, hard surface and writing lightly, or writing on folders, envelopes or sleeve cards if you are worried about pressure marks.
              </p>
              <p>
                Labelling the housing is better still. The Library of Congress says marking the housing is preferable to marking the photograph, and CCI suggests writing everything on the envelope before the print goes in, so you never press on the photo at all. Then keep the labelled prints somewhere safe: see <Link href="/guides/how-to-store-old-photos">how to store old photos</Link>.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What about glossy, <Accent tone="pink">resin-coated prints?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Resin-coated (RC) paper arrived in the late 1960s, according to CCI, and the Library of Virginia notes that colour prints can be on either fibre-based or resin-coated paper. You can tell by feel: fibre-based paper feels like ordinary paper, while resin-coated prints feel slick and glossy.
              </p>
              <p>The Library of Virginia suggests a different pencil for each:</p>
            </Prose>
            <Tips>
              <Tip icon={Pencil}>
                <strong>Fibre-based prints:</strong> a #2 pencil, the American equivalent of an HB.
              </Tip>
              <Tip icon={PencilLine}>
                <strong>Resin-coated prints:</strong> a softer 4B or 6B graphite pencil.
              </Tip>
            </Tips>
            <Prose>
              <p>If even that won’t mark the back without pressing, stop and write on the sleeve or envelope instead.</p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you label <Accent tone="pink">digital copies?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                With the same details, somewhere a computer can read them. The Library of Congress recommends giving each photo a descriptive file name, tagging it with the names of the people in it and descriptive subjects, and writing a brief description of your folders and photos. A name that starts with the date sorts itself:{' '}
                <span style={{ whiteSpace: 'nowrap' }}>1962-07_Blackpool_</span>
                <wbr />
                <span style={{ whiteSpace: 'nowrap' }}>Nan-and-Grandad.jpg</span> says far more than IMG_0412.jpg.
              </p>
              <p>
                Photo apps can help with faces. Apple says that when you name a person in Photos on an iPhone, they are added to the People &amp; Pets collection and named in your other photos and videos automatically. Google Photos groups similar faces and lets you add a name you can search by, but Google says face labels are visible only to you by default and aren’t shared when you share photos. A label only you can see helps you find pictures; it doesn’t tell the rest of the family who is who.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you identify people <Accent tone="pink">nobody remembers?</Accent>
              </>
            }
          >
            <Points>
              <Point icon={Users} title="Ask the oldest relatives first.">
                Put the print or a large scan in their hands and ask “what was happening here?” rather than “who is this?”. Our guide to{' '}
                <Link href="/guides/how-to-interview-your-grandparents" className={site.textLink}>
                  interviewing your grandparents
                </Link>{' '}
                has more questions that open up memories.
              </Point>
              <Point icon={Stamp} title="Turn it over.">
                The Library of Virginia notes that information about the process, date and materials is often stamped on the back of colour prints.
              </Point>
              <Point icon={Magnet} title="Work out what kind of photo it is.">
                A tintype is a thin sheet of iron, so a magnet will stick to it; tintypes were made from 1853 to the 1930s. Albumen prints, on thin paper usually mounted on card, date from about the 1850s to the 1890s (Library of Virginia).
              </Point>
              <Point icon={Images} title="Compare it with photos you can date.">
                The same faces at a wedding, a christening or in a school photo with a known date can tell you roughly who and when.
              </Point>
              <Point icon={CircleHelp} title="Write guesses as guesses.">
                “Probably Gran’s sister, c.&nbsp;1950?” is useful. A confident wrong name can mislead the family for generations.
              </Point>
            </Points>
          </GuideSection>

          <PullQuote>
            A name on the back is worth more{' '}
            <Accent tone="blue">than a perfect scan without one.</Accent>
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
                Pencil on the back helps whoever holds the print. In an Ancestorii <Link href="/features/family-photo-albums">family album</Link>, every photo can carry a name, a date written the way people remember it, such as “Summer&nbsp;1994”, a thread called The Story where relatives add what they know, and voice notes. Tag a loved one on the album and it appears on their profile.
              </p>
              <p>
                That turns “who’s this?” into a question the whole family can answer together, on the website or in the free iPhone and Android app, and only the family members you invite can see it. Albums are unlimited on both the Free and Premium plans. To sort the rest of the collection, see <Link href="/guides/how-to-organize-family-photos">how to organise family photos</Link>, and for why the story matters more than the scan, <Link href="/guides/what-to-do-with-old-family-photos">what to do with old family photos</Link>.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">labelling photos.</Accent>
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
              Ask who’s in it
              <br />
              <Accent tone="pink">while you can.</Accent>
            </>
          }
        >
          Put the photo where the whole family can add a name, a date and the story.
        </GuideCta>
      </SiteShell>
    </>
  );
}
