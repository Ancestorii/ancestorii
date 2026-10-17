import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  Archive,
  Camera,
  Disc3,
  Film,
  Hand,
  HardDrive,
  Magnet,
  MonitorPlay,
  PenLine,
  Ruler,
  Scissors,
  Thermometer,
  Users,
  Video,
} from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { Point, Points, Step, Steps, Tip, Tips } from '../_components/GuideBlocks';

const PATH = '/guides/how-to-digitize-home-videos';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Digitise Home Videos: VHS, Cine, Camcorder';
const HEADLINE = 'How to digitise old home videos';
const DESCRIPTION =
  'Tape has a limited life and the last VCR maker stopped in 2016. How to digitise VHS, camcorder tapes and cine film, and which files to keep for good.';
const PUBLISHED = '2026-10-17';
const CRUMB = 'How to Digitise Home Videos';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to digitise old home videos' }],
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
    q: 'How long do VHS tapes last?',
    a: 'A 1995 guide now published by the Council on Library and Information Resources gave magnetic tape a life expectancy of ten to thirty years, with thirty as the upper limit, and the Library of Congress warns that analogue videotape could become unplayable after a few years. How a tape has been stored makes a big difference, but anything recorded before about 1996 is already past thirty years, so digitise the tapes that matter first.',
  },
  {
    q: 'Can I still buy a VCR to digitise my tapes?',
    a: 'Usually only second-hand, because Funai Electric, reported to be the last company still making VCRs, stopped production in 2016. Test a used machine with a tape you don’t mind losing before you trust it with a precious one: the New York State Archives advises against playing valuable tapes on unfamiliar or suspect equipment.',
  },
  {
    q: 'What format should I save digitised home videos in?',
    a: 'Keep two versions. A preservation master at high resolution and bitrate, uncompressed or lossless if you can (the Library of Congress lists formats such as FFV1 in an .mkv file and ProRes in a .mov file), and an MP4 copy for watching and sharing. The Library of Congress names MP4 only as a viewing copy, so don’t make it your only file if a better master is on offer.',
  },
  {
    q: 'Should I keep the tapes after digitising them?',
    a: 'Yes. The US National Archives says to keep original materials after copying them, and the New York State Archives says to keep your original tapes as well as your digital copies. Store them upright in hard cases, somewhere cool and dry, away from magnets and sunlight.',
  },
  {
    q: 'Can I digitise cine film myself?',
    a: 'It is safer not to run old film through a projector. The US National Archives says damage is possible each time an original film is projected, and that some old films look fine but are too warped or brittle to run. It suggests a reputable vendor, and says even home movies copied for personal use are best scanned in high definition.',
  },
];

const KEY_FACTS = [
  <>
    Kodak brought out <strong>8&nbsp;mm</strong> cine film in <strong>1932</strong> and <strong>Super&nbsp;8</strong> in{' '}
    <strong>1965</strong>. JVC announced the first <strong>VHS</strong> recorder on{' '}
    <strong>9&nbsp;September&nbsp;1976</strong>.
  </>,
  <>
    <strong>Thirty years</strong> appears to be the upper limit for magnetic tape, including videotape,
    according to a 1995 guide now published by the Council on Library and Information Resources.
  </>,
  <>
    Funai Electric, reported to be the last VCR maker, <strong>stopped production in 2016</strong>. It made
    750,000 VHS machines in 2015, down from 15&nbsp;million in 2000.
  </>,
  <>
    Keep <strong>two files</strong>: a high-quality master and an <strong>MP4</strong> to watch. The Library of
    Congress lists MP4 only as a viewing copy, not a preservation format.
  </>,
  <>
    Make <strong>at least two copies</strong>, store them far apart, check them every year and copy them to new
    media <strong>every five years</strong> (Library of Congress).
  </>,
  <>
    <strong>Keep the tapes and reels</strong> after digitising: the US National Archives and the New York State
    Archives both say so.
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'Kodak',
    title: 'History of the Super\u00a08 Camera',
    href: 'https://www.kodak.com/en/motion/page/super-8-history',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'IEEE History Center (ETHW)',
    title: 'Milestones: Development of VHS, a World Standard for Home Video Recording, 1976',
    href: 'https://ethw.org/Milestones:Development_of_VHS,_a_World_Standard_for_Home_Video_Recording,_1976',
    date: 'dedicated 2006',
  },
  {
    publisher: '6abc Philadelphia (WPVI-TV)',
    title: 'World’s last VCR to be manufactured this month',
    href: 'https://6abc.com/post/worlds-last-vcr-to-be-manufactured-this-month/1441648/',
    date: '25\u00a0July\u00a02016',
  },
  {
    publisher: 'Council on Library and Information Resources',
    title: 'Magnetic Tape Storage and Handling: How Long Will Magnetic Media Last? (John Van Bogart)',
    href: 'https://www.clir.org/pubs/reports/pub54/4life_expectancy/',
    date: '1995',
  },
  {
    publisher: 'Council on Library and Information Resources',
    title: 'Magnetic Tape Storage and Handling: How Can You Prevent Magnetic Tape from Degrading Prematurely?',
    href: 'https://www.clir.org/pubs/reports/pub54/5premature_degrade/',
    date: '1995',
  },
  {
    publisher: 'Council on Library and Information Resources',
    title: 'Magnetic Tape Storage and Handling: What Can Go Wrong with Magnetic Media?',
    href: 'https://www.clir.org/pubs/reports/pub54/2what_wrong/',
    date: '1995',
  },
  {
    publisher: 'Library of Congress',
    title: 'Transferring Video from Tape, DVD or Camera to Your Computer (Personal Digital Archiving Series)',
    href: 'https://digitalpreservation.gov/personalarchiving/documents/video-transfer.pdf',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Personal Archiving: Video',
    href: 'https://digitalpreservation.gov/personalarchiving/video.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Recommended Formats Statement: Moving Image Works',
    href: 'https://www.loc.gov/preservation/resources/rfs/moving.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'US National Archives',
    title: 'Motion Picture Film Guidance: Playback and Digitization of Materials',
    href: 'https://www.archives.gov/preservation/formats/motion-picture-film-playback-digitize.html',
    date: 'last reviewed December\u00a02025',
  },
  {
    publisher: 'US National Archives',
    title: 'Film-Based Negatives and Positives',
    href: 'https://www.archives.gov/preservation/holdings-maintenance/film-based',
    date: 'last reviewed May\u00a02023',
  },
  {
    publisher: 'US National Archives',
    title: 'Cold Storage',
    href: 'https://www.archives.gov/preservation/holdings-maintenance/cold-storage',
    date: 'last reviewed July\u00a02025',
  },
  {
    publisher: 'New York State Archives',
    title: 'Audio and Video Recordings (Family History preservation)',
    href: 'https://www.archives.nysed.gov/preservation/family-records-audio-and-video-recordings',
    date: 'accessed October\u00a02026',
  },
];

// Room above the key facts and the author box, and above the sources (a section's step).
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function HowToDigitiseHomeVideosPage() {
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
              <Accent>old home videos.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              To digitise home videos, play each tape on a working VCR or camcorder connected to a computer through a video converter, which records it in real time, and send cine film to a specialist who can scan it safely. Keep a high-quality master file and an MP4 copy for watching, store both in at least two places, and keep the original tapes and reels.
            </Lead>
            <p>
              Do it soon. A 1995 guide now published by the Council on Library and Information Resources put thirty years as the upper limit for magnetic tape, including video, and Funai Electric, reported to be the last company still making VCRs, stopped in 2016. Every year the tapes get older and working machines get harder to find.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <GuideSection
            title={
              <>
                What format are <Accent tone="pink">your home videos?</Accent>
              </>
            }
          >
            <Prose>
              <p>The format decides how you digitise it, so sort the box first. Most family collections are a mix of these.</p>
            </Prose>
            <Points>
              <Point icon={Film} title={'Cine film: 8\u00a0mm, Super\u00a08 and 16\u00a0mm.'}>
                Small open reels of film. Kodak’s 16&nbsp;mm Cine Kodak camera dates from 1923, the Cine Kodak Eight (8&nbsp;mm) from 1932, and the cartridge-loaded Super&nbsp;8 from 1965, which gained a magnetic stripe for sound in 1973. Film needs specialist equipment to digitise.
              </Point>
              <Point icon={Video} title="VHS.">
                Full-size cassettes from a home video recorder. JVC announced the first VHS recorder, the HR-3300, on 9&nbsp;September&nbsp;1976, and VHS became the world standard for home video. You need a working VCR to play them.
              </Point>
              <Point icon={Camera} title="Camcorder tapes.">
                Smaller cassettes such as VHS-C, Video8, Hi8 and MiniDV. Read the label before you buy anything, because each format needs a machine that can play it.
              </Point>
              <Point icon={Disc3} title="DVDs.">
                If the videos were copied to DVD years ago, start there. The Library of Congress explains how to copy the video files, which end in .VOB, from a disc that isn’t copy-protected into a folder on your computer.
              </Point>
            </Points>
          </GuideSection>

          <GuideSection
            title={
              <>
                Why digitise <Accent tone="pink">them now?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Because the tape and the machines are both running out. John Van Bogart’s 1995 guide, now published by the Council on Library and Information Resources (CLIR), says that, going by manufacturers’ data sheets, thirty years appears to be the upper limit for magnetic tape, including video and audio tapes. It compares those figures to miles-per-gallon ratings, since real results depend on how a tape has been kept, and it notes that a recording technology is lucky to stay current for more than twenty years. Anything taped before about 1996 is now past thirty.
              </p>
              <p>
                The machines are the other half. The New York State Archives warns that videotapes do not last forever and that the equipment needed to play them is becoming increasingly scarce. Funai, which made 15&nbsp;million VCRs in 2000 and 750,000 in 2015, stopped production in 2016 because the makers of key components were pulling out.
              </p>
              <p>
                Playing a tape wears it, too. The Library of Congress says analogue videotape is fragile, that the more you play a tape the more you wear it down, and that each copy of a copy loses picture and sound quality, which it calls generational decay. So aim to play each tape once, straight into a digital file, rather than copying tape to tape.
              </p>
              <p>
                Cine film has a risk of its own. The US National Archives says acetate film can suffer acidic decay, known as vinegar syndrome, and that the most typical sign is a strong smell of vinegar. Put any reel that smells of vinegar at the front of the queue.
              </p>
            </Prose>
          </GuideSection>

          <PullQuote>
            The tape is getting older.{' '}
            <Accent tone="blue">So is every machine that can play it.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                Should you do it yourself or <Accent tone="pink">use a transfer service?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                For VHS and camcorder tapes in good condition, doing it yourself is realistic if you have a working machine. For cine film, damaged tapes and formats you can’t play, use a specialist: the New York State Archives says tapes in poor condition or obsolete formats should be digitally reformatted by experts equipped to copy them. If you are doing it at home, this is the usual route for VHS.
              </p>
            </Prose>
            <Steps>
              <Step number="01" title="Check the tape and the machine.">
                <p>Set aside any tape with mould, creased or snapped tape, or loose parts rattling inside, for a specialist. Test the VCR with a tape you don’t care about first: CLIR warns that dirty recorders can ruin tape by spreading debris across it and scratching it.</p>
              </Step>
              <Step number="02" title="Connect it through a video converter.">
                <p>Run the VCR’s video output (the yellow plug, or S-Video if it has one) and its audio outputs (white and red) into a USB video converter, and plug the converter into your computer. The Library of Congress describes converters like this, which digitise the video in real time as the tape plays.</p>
              </Step>
              <Step number="03" title="Record the whole tape in one go.">
                <p>Capture runs in real time, so a two-hour tape takes two hours. Choose the converter’s highest quality setting and let the tape play through without stopping. You can cut clips later.</p>
              </Step>
              <Step number="04" title="Never edit the master.">
                <p>Save the capture, then make a copy for trimming and sharing. The Library of Congress puts it simply: never modify the original video file; make a copy and modify only the copy.</p>
              </Step>
            </Steps>
            <Prose>
              <p>
                A digital camcorder with video inputs can do the same job. The Library of Congress notes that many can act as a pass-through device between the VCR and the computer, though the picture may not be as good as with a standalone converter.
              </p>
              <p>
                Cine film is different. The US National Archives says damage is possible each time an original film is projected, and that some old films look fine but are too warped or brittle to run. It suggests having films digitised by a reputable vendor, notes that most professional post-production houses can scan film while handling it safely, and says even home movies copied for personal use are best scanned in high definition (HD).
              </p>
              <h3>What to ask a transfer service</h3>
              <ul>
                <li>Two versions of each film or tape: a preservation copy for keeping and an access copy for easy viewing, which is what the US National Archives suggests asking a film vendor for.</li>
                <li>Files named and organised the way you want, with the title, date and place of each reel or tape noted alongside.</li>
                <li>Delivery on a hard drive, not only as a download link. The National Archives prefers physical media to cloud-only delivery, and says to keep a backup copy.</li>
                <li>Your originals back, and how the service handles fragile film and tape.</li>
              </ul>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What file format <Accent tone="pink">should you save?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Two files, not one. The US National Archives recommends a preservation copy at high resolution and bitrate, uncompressed or lossless and in an open, non-proprietary format, plus an access copy that can be smaller and more compressed for easy viewing. The Library of Congress’s Recommended Formats Statement makes the same split: for preservation it lists formats such as FFV1 in a Matroska (.mkv) file and Apple ProRes in a QuickTime (.mov) file, and it mentions MP4 only as a viewing proxy.
              </p>
            </Prose>
            <Tips>
              <Tip icon={HardDrive}>
                <strong>A master to keep.</strong> If a service is doing the work, ask whether it can supply a lossless or high-bitrate master as well as MP4s. If your home converter only saves MP4, use its highest quality setting and treat that file as the master.
              </Tip>
              <Tip icon={MonitorPlay}>
                <strong>An MP4 to watch and share.</strong> Make it from the master. This is the copy for phones, televisions and the family group chat.
              </Tip>
              <Tip icon={Ruler}>
                <strong>The original size and speed.</strong> The Library of Congress asks for video at its original production resolution and frame rate, so there is no need to stretch an old tape to fill a wide screen.
              </Tip>
            </Tips>
            <Prose>
              <p>
                Then look after the files. The Library of Congress recommends at least two copies, stored as far apart as practical, checked at least once a year and copied to new media every five years or when necessary. Our guide to{' '}
                <Link href="/guides/how-to-back-up-family-photos">backing up family photos</Link> explains the 3-2-1 rule, which works the same way for video, and{' '}
                <Link href="/guides/how-long-do-photos-last">how long photos last</Link> compares discs, drives and tape.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How should you store <Accent tone="pink">the tapes and reels?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Keep them. The US National Archives says to retain original materials after duplication, because the originals may outlast the copy, and the New York State Archives says to keep your original tapes as well as your digital copies.
              </p>
            </Prose>
            <Tips>
              <Tip icon={Thermometer}>
                <strong>Cool, dry and steady.</strong> For tapes in use, CLIR suggests 15 to 23°C and 25 to 55% relative humidity, without big swings, and says storage above 23°C or 70% humidity speeds up damage. The Library of Congress suggests about 18°C (65°F) and 45% humidity for videotapes you keep.
              </Tip>
              <Tip icon={Archive}>
                <strong>Upright, like books.</strong> The New York State Archives says to store reels and cassettes on end, in labelled hard-plastic cases, away from dust and direct sunlight.
              </Tip>
              <Tip icon={Magnet}>
                <strong>Away from magnets.</strong> Keep tapes away from electrical wiring, fluorescent lights, electric motors and magnets, which the same archives name as sources of magnetic fields.
              </Tip>
              <Tip icon={Hand}>
                <strong>Hands off the tape.</strong> Handle only the cassette, never the tape surface, and handle cine film as little as possible.
              </Tip>
            </Tips>
            <Prose>
              <p>
                Film lasts longest cold. The US National Archives says cold storage, at 35°F (about 2°C) or lower, is very important for preserving acetate film, but it also warns that cold storage needs special packaging and steps. So don’t just put reels in the fridge: for most families, a cool, steady cupboard and a good scan is the realistic plan. Slides and negatives have their own guide to{' '}
                <Link href="/guides/how-to-digitize-slides-and-negatives">digitising slides and negatives</Link>.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What should you do with <Accent tone="pink">hours of footage?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Once the tapes are safe, the work that matters is finding out what is on them. A box of tapes can hold many hours, and nobody will watch them all from start to finish.
              </p>
            </Prose>
            <Points>
              <Point icon={Users} title="Watch with the people who were there.">
                Grandparents, aunts and uncles can name the faces, places and years that nobody wrote on the box.
              </Point>
              <Point icon={PenLine} title="Make notes as you go.">
                Write down the tape number, the time in the file, who is on screen and what is happening. The Library of Congress advises saving videos with good descriptive information about them.
              </Point>
              <Point icon={Scissors} title="Clip the moments that matter.">
                From a copy of the master, cut short clips: the first steps, the wedding speech, the grandparent who is on screen for a minute but is the reason you kept the tape.
              </Point>
              <Point icon={HardDrive} title="Share the clips, keep the masters.">
                Send the clips to the family and keep the full files on your own drives, in two places.
              </Point>
            </Points>
            <Prose>
              <p>
                Old cassettes of voices need the same rescue, with different settings: see our guide to{' '}
                <Link href="/guides/how-to-digitize-cassette-tapes">digitising cassette tapes</Link>.
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
                A full transfer runs to hours. Ancestorii is for the moments in it that your family will want to watch again, with the story attached. Upload a short clip to a private{' '}
                <Link href="/features/family-photo-albums">family album</Link> and the relatives you invite can give it a name, a date in plain words such as “Summer&nbsp;1994”, their written memories and voice notes. Or add it to a moment on your{' '}
                <Link href="/features/family-timeline">family timeline</Link>, where they can comment and record what they remember. Only the family members you invite can see it.
              </p>
              <p>
                The Free plan needs no card. Its allowances are videos up to 5&nbsp;minutes and files up to 20&nbsp;MB each, with 1&nbsp;GB of storage shared by the family, which suits short clips. Premium is £3.99 a month per family, with videos up to 15&nbsp;minutes, files up to 10&nbsp;GB and 100&nbsp;GB of storage; see{' '}
                <Link href="/pricing">pricing</Link>. Either way, it is a home for the clips worth explaining, not a replacement for your backups, so keep the full masters on your own drives.
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
              Rescue the tapes.
              <br />
              <Accent tone="pink">Keep the laughs.</Accent>
            </>
          }
        >
          Clip the scenes that matter and let the family tell you what was happening.
        </GuideCta>
      </SiteShell>
    </>
  );
}
