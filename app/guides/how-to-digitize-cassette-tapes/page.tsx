import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  Archive,
  AudioWaveform,
  CassetteTape,
  Gauge,
  Hand,
  HardDrive,
  Magnet,
  PenLine,
  Scissors,
  SlidersHorizontal,
  Thermometer,
  Usb,
  Users,
} from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { Point, Points, Step, Steps, Tip, Tips } from '../_components/GuideBlocks';

const PATH = '/guides/how-to-digitize-cassette-tapes';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Digitise Cassette Tapes: Save Old Voices';
const HEADLINE = 'How to digitise cassette tapes';
const DESCRIPTION =
  'Tape has a limited life and players are getting scarce. How to digitise cassettes to WAV at home, the settings archives use and how to keep the files safe.';
const PUBLISHED = '2026-10-17';
const CRUMB = 'How to Digitise Cassette Tapes';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to digitise cassette tapes' }],
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
    q: 'How long do cassette tapes last?',
    a: 'There is no fixed date. A 1995 guide for the Council on Library and Information Resources gave magnetic tape a life expectancy of ten to thirty years, depending on storage, with thirty as the upper limit. A cassette recorded before the mid-1990s is already past thirty, so digitise the ones that matter first.',
  },
  {
    q: 'What format should I save cassette recordings in?',
    a: 'An uncompressed WAV file as your master: the Library of Congress prefers 96\u00a0kHz, 24-bit and accepts CD quality, 44.1\u00a0kHz, 16-bit. Make MP3 copies from the master for sharing, because the Oral History Society warns that compressed files such as MP3 can audibly degrade when converted to another format.',
  },
  {
    q: 'Can I digitise cassettes without a tape deck?',
    a: 'You need something that plays the tape, but not necessarily a hi-fi deck: the Canadian Heritage Information Network says to use a player’s headphone socket if it has no line out. USB cassette players are another route, or a transfer service can do the whole job.',
  },
  {
    q: 'Should I use a professional transfer service?',
    a: 'Yes for tapes that squeal, look mouldy, are snapped or tangled, or are in a format you can’t play, such as microcassettes. The New York State Archives says tapes in poor condition or obsolete formats should be copied by experts. Ask for WAV masters, MP3 copies, the files on a hard drive and your tapes back.',
  },
  {
    q: 'Should I keep the cassettes after digitising them?',
    a: 'Yes. The New York State Archives says to keep your original tapes as well as your digital copies. Store them upright in their cases, somewhere cool, dry and steady, away from magnets and loudspeakers.',
  },
];

const KEY_FACTS = [
  <>
    Philips unveiled the <strong>Compact Cassette</strong> at the Berlin Radio Show on{' '}
    <strong>30&nbsp;August&nbsp;1963</strong>. It was first meant as a dictation machine.
  </>,
  <>
    <strong>Thirty years</strong> appears to be the upper limit for magnetic tape, including audio tape,
    according to a 1995 guide for the Council on Library and Information Resources.
  </>,
  <>
    Save an uncompressed <strong>WAV</strong> master, not an MP3. The Library of Congress prefers{' '}
    <strong>96&nbsp;kHz, 24-bit</strong> and accepts CD quality, <strong>44.1&nbsp;kHz, 16-bit</strong>.
  </>,
  <>
    Transfers run in <strong>real time</strong>: a 90-minute tape takes 90&nbsp;minutes and makes a CD-quality WAV
    of <strong>just under 1&nbsp;GB</strong>.
  </>,
  <>
    Set the level so the loudest sound <strong>never reaches 0&nbsp;dB</strong>. Audacity’s manual suggests peaks
    of around <strong>-6&nbsp;dB</strong>.
  </>,
  <>
    Keep <strong>at least two copies</strong> in different places, check them <strong>every year</strong>{' '}
    (Library of Congress), and keep the tapes too.
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'The Register',
    title: 'Are you for reel? How the Compact Cassette struck a chord for millions',
    href: 'https://www.theregister.com/2013/08/30/50_years_of_the_compact_cassette/',
    date: '30\u00a0August\u00a02013',
  },
  {
    publisher: 'Council on Library and Information Resources',
    title: 'Magnetic Tape Storage and Handling: How Long Will Magnetic Media Last? (John Van Bogart)',
    href: 'https://www.clir.org/pubs/reports/pub54/4life_expectancy/',
    date: '1995',
  },
  {
    publisher: 'Council on Library and Information Resources',
    title: 'Magnetic Tape Storage and Handling: What Can Go Wrong with Magnetic Media?',
    href: 'https://www.clir.org/pubs/reports/pub54/2what_wrong/',
    date: '1995',
  },
  {
    publisher: 'Council on Library and Information Resources',
    title: 'Magnetic Tape Storage and Handling: How Can You Prevent Magnetic Tape from Degrading Prematurely?',
    href: 'https://www.clir.org/pubs/reports/pub54/5premature_degrade/',
    date: '1995',
  },
  {
    publisher: 'New York State Archives',
    title: 'Audio and Video Recordings (Family History preservation)',
    href: 'https://www.archives.nysed.gov/preservation/family-records-audio-and-video-recordings',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'National Lottery Heritage Fund',
    title: 'British Library pledge to save the nation’s sounds secures £9.5m HLF boost',
    href: 'https://www.heritagefund.org.uk/news/british-library-pledge-save-nations-sounds-secures-ps95m-hlf-boost',
    date: 'May\u00a02015',
  },
  {
    publisher: 'Canadian Heritage Information Network',
    title: 'A Museum’s How-to Guide for Digitizing Audio',
    href: 'https://www.canada.ca/en/heritage-information-network/services/digitization/how-to-digitize-audio.html',
    date: '2024',
  },
  {
    publisher: 'Audacity',
    title: 'Audacity: Free, Open Source Audio Editor and Recorder',
    href: 'https://www.audacityteam.org/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Audacity Manual',
    title: 'Tips for recording from cassette tape',
    href: 'https://manual.audacityteam.org/man/tips_for_recording_from_cassette_tape.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Audacity Manual',
    title: 'Sample workflow for tape digitization',
    href: 'https://manual.audacityteam.org/man/sample_workflow_for_tape_digitization.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Oral History Society',
    title: 'Choosing the right equipment',
    href: 'https://ohs.org.uk/for-beginners/equipment/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Recommended Formats Statement: Audio Works',
    href: 'https://www.loc.gov/preservation/resources/rfs/audio.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Personal Archiving: Audio',
    href: 'https://digitalpreservation.gov/personalarchiving/audio.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Care, Handling, and Storage of Audio Visual Materials',
    href: 'https://www.loc.gov/preservation/care/record.html',
    date: 'accessed October\u00a02026',
  },
];

// Room above the key facts and the author box, and above the sources (a section's step).
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function HowToDigitiseCassetteTapesPage() {
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
              <Accent>cassette tapes.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              To digitise a cassette, play it on a clean, working tape deck connected to your computer’s line input or a USB audio interface, record each side in real time as an uncompressed WAV file, and keep that file as your master. Make MP3 copies for sharing, store the files in at least two places, and keep the tape.
            </Lead>
            <p>
              Start with the voices. If a tape holds the only recording of someone, it goes to the front of the queue.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <GuideSection
            title={
              <>
                Why digitise <Accent tone="pink">cassettes now?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Because the tapes and the machines that play them are both ageing. The Register recalls that Philips unveiled the Compact Cassette at the Berlin Radio Show on 30&nbsp;August&nbsp;1963, so the oldest family tapes are now more than sixty years old.
              </p>
              <p>
                John Van Bogart’s 1995 guide for the Council on Library and Information Resources (CLIR) gives magnetic tape a life expectancy of ten to thirty years, depending on how it has been kept, and says thirty years appears to be the upper limit for audio and video tapes. The New York State Archives adds that the equipment needed to play tapes is becoming increasingly scarce.
              </p>
              <p>
                Old tape can fail as you play it, too. CLIR describes sticky shed, where the binder that holds the magnetic particles on the tape breaks down, making audio tapes squeal and clogging the heads. So aim to play each tape only once.
              </p>
              <p>
                In May&nbsp;2015, when the Heritage Lottery Fund (now the National Lottery Heritage Fund) awarded the British Library £9.5&nbsp;million to digitise 500,000 rare and at-risk recordings, sound archivists estimated there were 15&nbsp;years left before the equipment needed to play some formats could no longer be used.
              </p>
            </Prose>
          </GuideSection>

          <PullQuote>
            Play it once,{' '}
            <Accent tone="blue">straight into a file.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                What equipment <Accent tone="pink">do you need?</Accent>
              </>
            }
          >
            <Prose>
              <p>Three things, and you may have some of them already.</p>
            </Prose>
            <Points>
              <Point icon={CassetteTape} title="A tape deck or player.">
                A hi-fi deck with line-out sockets is best, but the Canadian Heritage Information Network (CHIN) says a player’s headphone socket will do if it has no line out.
              </Point>
              <Point icon={Usb} title="A way into the computer.">
                A USB audio interface and the right lead, or a line input on the computer. CHIN notes that an external converter avoids interference from inside the computer.
              </Point>
              <Point icon={AudioWaveform} title="Recording software.">
                Audacity is free and open source, runs on Windows, macOS and Linux, and its manual includes a full workflow for digitising tape.
              </Point>
            </Points>
            <Prose>
              <p>
                USB cassette players that plug straight into a computer are simpler still. Check what they save: if one offers WAV, choose it over MP3.
              </p>
              <p>
                Test the deck with a tape you don’t mind losing. The New York State Archives advises against playing valuable tapes on unfamiliar or suspect equipment, and CLIR warns that dirty recorders can ruin tape by scratching it. Clean the heads with a cotton swab and isopropyl alcohol of 91% or stronger, as CHIN suggests, never rubbing alcohol, which Audacity’s manual says contains oil.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you digitise <Accent tone="pink">a cassette?</Accent>
              </>
            }
          >
            <Steps>
              <Step number="01" title="Check the tape first.">
                <p>Mould, creased or snapped tape, squealing, or a white deposit on the heads (glue from a faulty cassette, according to Audacity’s manual) all mean stop. Set those tapes aside for a specialist.</p>
              </Step>
              <Step number="02" title="Wind it through once.">
                <p>If a tape has sat unplayed for years, Audacity’s manual suggests fast-forwarding to the end and rewinding in one go, to even out the tension before you play it.</p>
              </Step>
              <Step number="03" title="Set the level.">
                <p>Play the loudest part and adjust the input. CHIN says the loudest sound should approach but never reach 0&nbsp;dB, or it is clipped and lost. Audacity’s manual suggests peaks of around -6&nbsp;dB.</p>
              </Step>
              <Step number="04" title="Record each side in one go.">
                <p>Transfers run in real time, so a 90-minute tape takes 90&nbsp;minutes. Let each side play to the end without stopping. You can split it into tracks later.</p>
              </Step>
              <Step number="05" title="Save the master and leave it alone.">
                <p>Export an uncompressed WAV file and never edit it: CHIN says a preservation file should not be modified in any way. Reduce hiss on a copy, because noise reduction always loses some of the signal.</p>
              </Step>
            </Steps>
          </GuideSection>

          <GuideSection
            title={
              <>
                What settings <Accent tone="pink">should you use?</Accent>
              </>
            }
          >
            <Prose>
              <p>WAV for the master, at the best quality your equipment allows.</p>
            </Prose>
            <Tips>
              <Tip icon={AudioWaveform}>
                <strong>WAV, not MP3.</strong> The Oral History Society warns that compressed files such as MP3 can audibly degrade when they are converted to another format. Make MP3s from the master, never the reverse.
              </Tip>
              <Tip icon={Gauge}>
                <strong>Archive quality: 96&nbsp;kHz, 24-bit.</strong> The Library of Congress’s Recommended Formats Statement prefers uncompressed WAV at 96&nbsp;kHz and 24-bit or higher. CHIN calls 96&nbsp;kHz ideal and 48&nbsp;kHz acceptable for interviews, at 24-bit.
              </Tip>
              <Tip icon={SlidersHorizontal}>
                <strong>Good enough: CD quality.</strong> The Library of Congress accepts 44.1&nbsp;kHz, 16-bit WAV, and the Oral History Society asks for 44.1 or 48&nbsp;kHz, 16-bit when recording interviews.
              </Tip>
              <Tip icon={HardDrive}>
                <strong>Room for the files.</strong> A minute of stereo WAV at CD quality is about 10.6&nbsp;MB, so a 90-minute tape makes just under 1&nbsp;GB. At 96&nbsp;kHz and 24-bit it is about 35&nbsp;MB a minute, or 3.1&nbsp;GB.
              </Tip>
            </Tips>
          </GuideSection>

          <GuideSection
            title={
              <>
                Which tapes should go <Accent tone="pink">to a professional?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                The New York State Archives says tapes in poor condition or obsolete formats should be copied by experts. Send these away:
              </p>
              <ul>
                <li>Tapes that squeal, stick or leave deposits, the signs of sticky shed.</li>
                <li>Mouldy, snapped, creased or tangled tape.</li>
                <li>Formats you can’t play at home, such as microcassettes or reel-to-reel tape.</li>
                <li>The only recording of someone’s voice, if you have any doubt about your deck.</li>
              </ul>
              <p>
                VHS and camcorder tapes need different kit: see our guide to{' '}
                <Link href="/guides/how-to-digitize-home-videos">digitising home videos</Link>.
              </p>
              <h3>What to ask a transfer service for</h3>
              <ul>
                <li>WAV masters, ideally 24-bit, plus MP3 copies for sharing.</li>
                <li>The files on a portable hard drive, which the New York State Archives suggests because drives are easier to move to new hardware later.</li>
                <li>A list matching each file to its tape and side.</li>
                <li>Your tapes back.</li>
              </ul>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How should you name <Accent tone="pink">and store everything?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Give every file a unique number, as the Oral History Society advises, and keep a short list of who is on each tape. A name like <span style={{ whiteSpace: 'nowrap' }}>tape-07-side-a.wav</span> is enough.
              </p>
              <p>
                Then make copies. The Library of Congress recommends at least two, stored as far apart as practical, checked once a year and copied to new media every five years or when necessary, and the Oral History Society says multiple external hard drives are now favoured over CD-Rs and DVD-Rs. Our guide to{' '}
                <Link href="/guides/how-to-back-up-family-photos">backing up family photos</Link> explains the 3-2-1 rule, which works for sound too.
              </p>
            </Prose>
            <Tips>
              <Tip icon={Archive}>
                <strong>Keep the tapes.</strong> The New York State Archives says to keep your original tapes as well as your digital copies.
              </Tip>
              <Tip icon={Thermometer}>
                <strong>Cool, dry and steady.</strong> For tapes in use, CLIR suggests 15 to 23°C and 25 to 55% relative humidity, without big swings.
              </Tip>
              <Tip icon={Magnet}>
                <strong>Upright, away from magnets.</strong> Store cassettes upright in their cases, away from motors, loudspeakers, magnets and sunlight (Library of Congress; New York State Archives).
              </Tip>
              <Tip icon={Hand}>
                <strong>By the shell.</strong> Handle only the shell, never the tape or spools, and store played tapes without rewinding: the Library of Congress says to rewind just before playing.
              </Tip>
            </Tips>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you find <Accent tone="pink">the voices worth keeping?</Accent>
              </>
            }
          >
            <Prose>
              <p>A box of tapes can hold many hours, so the next job is finding the moments.</p>
            </Prose>
            <Points>
              <Point icon={Users} title="Listen with the people who were there.">
                An aunt or grandparent can name a voice, a room or a year that nobody wrote on the label.
              </Point>
              <Point icon={PenLine} title="Keep a log.">
                Note the tape, side and minute, who is speaking and what about, so hours of sound become something you can search.
              </Point>
              <Point icon={Scissors} title="Clip the moments.">
                From a copy of the master, cut short clips: a laugh, a song at a party, a few sentences in a voice you miss.
              </Point>
            </Points>
            <Prose>
              <p>
                Old tapes often bring out new stories. Our guides to{' '}
                <Link href="/guides/how-to-interview-your-grandparents">interviewing your grandparents</Link> and{' '}
                <Link href="/guides/how-to-save-family-voices">saving family voices</Link> show how to record the next ones.
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
                Ancestorii is a home for the clips your family will want to hear again, with the story beside them. Upload a clip as a{' '}
                <Link href="/features/voice-notes">voice note</Link> on a photo in a private family album or on a moment in your family timeline, and the relatives you invite can add what they remember, in writing or in voice notes of their own. Only the family members you invite can see it.
              </p>
              <p>
                Every voice note is stored as M4A, converted where needed, so it plays on any phone. That copy is compact and mono, made for listening, so keep your WAV masters on your own drives. The Free plan needs no card and allows files up to 20&nbsp;MB each, with 1&nbsp;GB of storage shared by the family, which suits clips. Premium is £3.99 a month per family, with files up to 10&nbsp;GB and 100&nbsp;GB of storage; see{' '}
                <Link href="/pricing">pricing</Link>.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions people <Accent tone="pink">ask.</Accent>
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
              Rescue the tape.
              <br />
              <Accent tone="pink">Keep the voice.</Accent>
            </>
          }
        >
          Digitise the cassette, then give the clips that matter a home your family can hear.
        </GuideCta>
      </SiteShell>
    </>
  );
}
