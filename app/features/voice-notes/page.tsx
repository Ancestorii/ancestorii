import Link from 'next/link';
import type { Metadata } from 'next';
import SiteShell from '@/components/site/SiteShell';
import { Accent } from '@/components/site/SiteBits';
import site from '@/components/site/site.module.css';
import {
  ArticleCta,
  ArticleHero,
  ArticleSection,
  CaptionedPhoto,
  CheckList,
  CompareTable,
  FaqBlock,
  QuoteBlock,
  Reading,
  TableNote,
} from '@/components/site/seo-articles/ArticleBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';

const PATH = '/features/voice-notes';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Voice Notes on Family Photos and Memories';
const HEADLINE = 'Keep the voices, not just the faces';
const DESCRIPTION =
  'Record or upload voice notes on family photos, timeline moments, capsules and memories. Every new recording is converted to M4A so it plays on any phone.';

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
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Ancestorii: your family’s greatest stories, told together',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | Ancestorii`,
    description: DESCRIPTION,
    images: ['/og-default.jpg'],
  },
};

// Shown on the page and written into the FAQPage structured data, word for word.
const FAQ = [
  {
    q: 'Can I upload an old voicemail or recording?',
    a: 'Yes. If it is saved as an audio file on your phone or computer, upload it as a voice note and Ancestorii converts it to M4A automatically if needed, so it plays on any phone. Getting a voicemail or a tape into a file is a separate first step, and our guides cover it.',
  },
  {
    q: 'Will a voice note play on both iPhone and Android?',
    a: 'Yes. Every new voice note is stored as M4A, which uses AAC audio: browser recordings and other formats are converted automatically, and recordings made in the Ancestorii app are already M4A. Apple lists AAC among the iPhone’s supported audio formats, Android supports AAC in .m4a files, and all major browsers play it.',
  },
  {
    q: 'Can more than one person add a voice note to the same memory?',
    a: 'Yes. Several relatives can each add their own voice note to a private memory. Each one shows who recorded it and when, and people can delete their own.',
  },
  {
    q: 'Are voice notes included in printed Memory Books?',
    a: 'No. Printed Memory Books hold photos and written words only, with no audio and no QR codes. Voice notes stay in your family’s digital library, where everyone in your family space can play them.',
  },
  {
    q: 'Can I record a voice note on my phone?',
    a: 'Yes. The free Ancestorii app for iPhone and Android records voice notes in M4A. On the website you can record in your browser or upload a file, and anything that is not already M4A is converted after upload.',
  },
  {
    q: 'Who can hear my voice notes?',
    a: 'Only the people in your family space, apart from a voice note on an Our Stories post, which is public like the rest of the story. Nothing in My Family becomes public unless you publish it.',
  },
];

const KEY_FACTS = [
  <>
    Voice notes go on{' '}
    <strong>album photos, timeline moments, capsules and private memories</strong>, as replies to
    memory comments and on Our Stories posts.
  </>,
  <>
    Record in the Ancestorii app or your browser, or <strong>upload an audio file</strong> you
    already have.
  </>,
  <>
    Every new recording is stored as <strong>M4A</strong>, converted where needed to AAC audio
    (mono, 64&nbsp;kbps, 44.1&nbsp;kHz), so it plays on any phone.
  </>,
  <>
    <strong>Several relatives can each add a voice note</strong> to the same memory, and each one
    shows who recorded it and when.
  </>,
  <>
    Printed Memory Books hold <strong>photos and written words only</strong>: no audio and no QR
    codes.
  </>,
  <>
    In a 2010 study of 61 girls aged 7 to 12, <strong>hearing their mother on the phone</strong>{' '}
    after a stressful task raised oxytocin about as much as seeing her in person.
  </>,
];

const WHERE = [
  ['Album photos and videos', 'Your family', 'Several per photo or video, next to its written story'],
  ['Timeline moments', 'Your family', 'On the photos and videos inside each event, beside the comments'],
  ['Capsules', 'Your family', 'Sealed with everything else until the capsule opens'],
  ['Private memories', 'Your family', 'Each relative can add their own, and reply to comments out loud'],
  ['Our Stories posts', 'Anyone', 'One per story, public like the rest of the story'],
];

const RECORD_FIRST = [
  <>
    <strong>How they say your name.</strong> Ten seconds you will be glad to have.
  </>,
  <>
    <strong>The story they always tell.</strong> Start to finish, with the same pause before the
    ending.
  </>,
  <>
    <strong>A recipe, talked through.</strong> Their quantities, their shortcuts and their asides.
  </>,
  <>
    <strong>A song or a saying.</strong> The one everybody connects with them.
  </>,
  <>
    <strong>Their answer to one good question.</strong> The app has 46 ready-made questions in 10
    chapters you can{' '}
    <Link href="/features/family-questions" className={site.textLink}>
      send to a relative
    </Link>
    .
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'Proceedings of the Royal Society B',
    title:
      'Seltzer, Ziegler and Pollak, Social vocalizations can release oxytocin in humans, 277(1694): 2661-2666',
    href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2982050',
    date: '2010',
  },
  {
    publisher: 'National Lottery Heritage Fund',
    title: 'British Library pledge to save the nation’s sounds secures £9.5m HLF boost',
    href: 'https://www.heritagefund.org.uk/news/british-library-pledge-save-nations-sounds-secures-ps95m-hlf-boost',
    date: 'May 2015',
  },
  {
    publisher: 'Apple',
    title: 'iPhone 17: Technical Specifications',
    href: 'https://www.apple.com/uk/iphone-17/specs/',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Android Developers',
    title: 'Supported media formats',
    href: 'https://developer.android.com/media/platform/supported-formats',
    date: 'accessed October 2026',
  },
  {
    publisher: 'MDN Web Docs',
    title: 'Web audio codec guide',
    href: 'https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Oral History Society',
    title: 'Choosing the right equipment',
    href: 'https://www.ohs.org.uk/for-beginners/equipment/',
    date: 'accessed October 2026',
  },
];

export default function VoiceNotesPage() {
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
            { name: 'Features', path: '/features' },
            { name: 'Voice notes', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[
            { href: '/', label: 'Home' },
            { href: '/features', label: 'Features' },
            { label: 'Voice notes' },
          ]}
          size="md"
          title={
            <>
              Keep the voices, <Accent>not just the faces.</Accent>
            </>
          }
          intro={[
            'Ancestorii lets your family record or upload voice notes on album photos, timeline moments, capsules, private memories and Our Stories posts. Every new recording is stored as M4A, converted automatically where needed, so it plays on iPhone, Android and any major browser.',
            'A photo keeps how someone looked. A recording keeps how they spoke: the accent, the laugh, the pause before the punchline. Here is where voice notes go, how they are stored, and the one place they cannot go.',
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        <ArticleSection
          id="at-a-glance"
          kicker="At a glance"
          dot="var(--c1)"
          title={
            <>
              Voice notes, <Accent tone="blue">in short.</Accent>
            </>
          }
        >
          <KeyFacts items={KEY_FACTS} />
        </ArticleSection>

        {/* Where they go */}
        <ArticleSection
          id="where-they-go"
          kicker="Where they go"
          dot="var(--c2)"
          title={
            <>
              Where can you add <Accent tone="blue">a voice note?</Accent>
            </>
          }
        >
          <CompareTable
            head={['Where', 'Who can hear it', 'Good to know']}
            rows={WHERE}
            highlight={1}
            size="fit"
            labelledBy="where-they-go-title"
          />
          <TableNote>
            In{' '}
            <Link href="/features/family-photo-albums" className={site.textLink}>
              family photo albums
            </Link>
            , each photo can carry its name, a date such as &ldquo;Summer 1994&rdquo;, a written story
            and voice notes, so the picture and the voice telling it stay together.
          </TableNote>
        </ArticleSection>

        {/* Why voices */}
        <ArticleSection
          id="why-voices"
          kicker="Why voices"
          dot="var(--c3)"
          title={
            <>
              Why does a recorded voice <Accent tone="pink">matter so much?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              There is some research behind the feeling. In a 2010 study published in{' '}
              <em>Proceedings of the Royal Society B</em>, Leslie Seltzer, Toni Ziegler and Seth
              Pollak gave 61 girls aged 7 to 12 a stressful task, speaking and doing mental arithmetic
              in front of an audience. Each girl then saw her mother, talked to her on the phone or
              watched a neutral film. The girls who only heard their mother&apos;s voice showed a rise
              in oxytocin, a hormone involved in forming attachments, similar to that of the girls who
              were reunited in person. The film group&apos;s oxytocin showed no overall change, and by
              the end the cortisol levels (a marker of stress) of the phone and in-person groups were
              statistically indistinguishable.
            </p>
            <p>
              It was a small study of girls and their mothers, and it used a live call rather than a
              recording, so it says nothing directly about saved voice notes. What it does show is how
              much a familiar voice carries on its own, with no face attached.
            </p>
          </Reading>
        </ArticleSection>

        {/* Where to start */}
        <ArticleSection
          id="where-to-start"
          kicker="Where to start"
          dot="var(--c0)"
          title={
            <>
              Which voices should you <Accent tone="blue">record first?</Accent>
            </>
          }
        >
          <CheckList items={RECORD_FIRST} />
          <Reading>
            <p>
              Small, everyday sounds are the easiest to miss. One of the things Dante, who built
              Ancestorii, was scared of losing was his grandmother humming while she cooked. Our
              guides to <Link href="/guides/how-to-save-family-voices">saving family voices</Link> and{' '}
              <Link href="/guides/how-to-record-family-stories">recording family stories</Link> cover
              how to get people talking without it feeling like an interview.
            </p>
          </Reading>
        </ArticleSection>

        {/* Format */}
        <ArticleSection
          id="format"
          kicker="The technical bit"
          dot="var(--c1)"
          title={
            <>
              What format are voice notes <Accent tone="pink">saved in?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Every new voice note ends up as an <strong>M4A file</strong>, which is AAC audio in an
              MPEG-4 container. Recordings that need converting are saved in mono at 64&nbsp;kbps and
              44.1&nbsp;kHz, which is just under half a megabyte per minute of speech.
            </p>
            <p>
              Ancestorii converts recordings because phones and browsers do not all record in the same
              format. A recording made in a web browser starts as a WebM file. After upload it is
              converted automatically by a service called CloudConvert, and the voice note plays from
              the converted copy. Files that are already M4A or AAC, including recordings made in the
              Ancestorii app, are left as they are.
            </p>
            <p>
              M4A is used because it plays almost everywhere. Apple lists AAC first among the
              iPhone&nbsp;17&apos;s supported audio formats, Android&apos;s developer documentation lists AAC in
              .m4a files among the formats the platform can record and play, and MDN Web Docs notes
              that AAC in an MP4 container is supported by all major browsers.
            </p>
            <p>
              One honest caveat: 64&nbsp;kbps mono is a listening copy, not an archive master. If you
              are recording a long interview you want to keep for decades, the Oral History Society
              recommends a recorder that can make uncompressed WAV files at 44.1&nbsp;kHz or
              48&nbsp;kHz, <span style={{ whiteSpace: 'nowrap' }}>16-bit</span>. Keep that file
              somewhere safe as your master and upload a copy for the family to play. Files can be up
              to 20&nbsp;MB on the Free plan and 10&nbsp;GB on Premium; an M4A copy is far smaller than
              a WAV, and it will not be converted again.
            </p>
          </Reading>
        </ArticleSection>

        {/* Old recordings */}
        <ArticleSection
          id="old-recordings"
          kicker="Old recordings"
          dot="var(--c2)"
          title={
            <>
              What about old cassettes, <Accent tone="blue">tapes and voicemails?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              If the recording already exists as an audio file on your phone or computer, upload it as
              a voice note and it is converted like any other. The real work is getting it into a file
              first, and it is worth doing soon.
            </p>
            <p>
              Archives are working against the same clock. In May&nbsp;2015, when the Heritage Lottery
              Fund (now the National Lottery Heritage Fund) awarded the British Library £9.5m to digitise
              and publish up to 500,000 rare and unique sounds, sound archivists estimated there were
              15&nbsp;years in which to digitise historic recordings before the equipment needed to play
              some formats could no longer be used.
            </p>
            <p>
              Home cassettes and answering-machine tapes have the same two weak points: the tape itself
              and the machine that plays it. If the voice you want to keep is on a phone instead, our
              guide to{' '}
              <Link href="/guides/how-to-save-voicemails-from-a-loved-one">
                saving voicemails from a loved one
              </Link>{' '}
              shows how to get it into a file you control.
            </p>
          </Reading>
        </ArticleSection>

        <QuoteBlock>
          A photo keeps how they looked. <Accent tone="blue">A voice keeps how they spoke.</Accent>
        </QuoteBlock>

        {/* Replying out loud */}
        <ArticleSection
          id="replying-out-loud"
          kicker="Talking back"
          dot="var(--c3)"
          title={
            <>
              Can relatives <Accent tone="pink">reply out loud?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Yes. On a private memory, any family member can add their own voice note, and comments
              can be recorded instead of typed, with replies threaded underneath. Each voice note shows
              who recorded it and when, people can delete their own, and the person who shared the
              memory is notified when someone comments.
            </p>
            <p>
              So one memory can collect several voices: a cousin remembers the holiday one way, a
              brother another, and an aunt records the part they both forgot.
            </p>
          </Reading>
        </ArticleSection>

        {/* In print */}
        <ArticleSection
          id="in-print"
          kicker="In print"
          dot="var(--c0)"
          title={
            <>
              Do voice notes <Accent tone="blue">go in print?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              No. Printed Memory Books hold photos and written words only. There is no audio and no QR
              code in print, so the voices stay in your family&apos;s digital library.
            </p>
            <p>
              You can carry the words across, though. Each photo in a{' '}
              <Link href="/memory-books">Memory Book</Link> can have a subheading and a written
              comment, so a line someone always said, typed exactly as they said it, can sit under
              their photo. Memory Books start at £44.99 plus delivery for 24 printed pages.
            </p>
          </Reading>
          {/* A real customer's printed Memory Book and her own words */}
          <div className={site.sectionBody}>
            <CaptionedPhoto
              src="/Testimonial2.png"
              alt="Alison and her dad holding his printed Ancestorii Memory Book"
              label="Alison · Nevada, US"
              color="var(--c0)"
              position="50% 30%"
              caption="“I walked past my dad’s room and caught him looking through his memory book again. That’s the third time this week. Ancestorii helped me turn years of photos into something he genuinely treasures.”"
            />
          </div>
        </ArticleSection>

        {/* Where Ancestorii fits */}
        <ArticleSection
          id="where-ancestorii-fits"
          kicker="Where Ancestorii fits"
          dot="var(--c1)"
          title={
            <>
              How does <Accent tone="pink">Ancestorii help?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Ancestorii keeps each voice note on the photo, moment or memory it belongs to, inside
              your family&apos;s private space, so nobody has to work out which file goes with which
              picture. The free app for iPhone and Android records voice notes too, so the person with
              the stories does not need a computer.
            </p>
            <p>
              Voice notes come with both plans and have no separate limit; they count towards your
              family&apos;s shared storage. The Free plan includes 1&nbsp;GB for the whole family and
              files up to 20&nbsp;MB. Premium is £3.99 a month for the whole family, with 100&nbsp;GB and
              files up to 10&nbsp;GB.
            </p>
          </Reading>
        </ArticleSection>

        {/* Questions */}
        <ArticleSection
          id="questions"
          kicker="Questions"
          dot="var(--c2)"
          title={
            <>
              Questions about <Accent tone="blue">voice notes.</Accent>
            </>
          }
        >
          <FaqBlock items={FAQ} variant="open" />
        </ArticleSection>

        <ArticleSection>
          <Sources items={SOURCES} />
          <div className={site.sectionBody}>
            <AuthorBox updated="17 October 2026" />
          </div>
        </ArticleSection>

        <ArticleCta
          title={
            <>
              Press record.
              <br />
              Keep their voice.
            </>
          }
          lead="Free to start. Voice notes on every plan."
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
