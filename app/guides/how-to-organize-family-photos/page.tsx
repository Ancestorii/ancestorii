import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import {
  CalendarDays,
  Cloud,
  FileImage,
  FolderOpen,
  FolderTree,
  HardDrive,
  Images,
  Laptop,
  Smartphone,
} from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { GuideFigure, Step, Steps, Tip, Tips } from '../_components/GuideBlocks';

const PATH = '/guides/how-to-organize-family-photos';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Organise Family Photos: A Simple System';
const HEADLINE = 'How to organise family photos: a simple system';
const DESCRIPTION =
  'Gather every photo, keep the best version, name files by date, tag the people and keep two copies. The Library of Congress method, step by step.';
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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to organise family photos' }],
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
const FAQ = [
  {
    q: 'Should I organise photos by date or by event?',
    a: 'Both. Make a folder for each year, put a folder for each event inside it, and start every file name with the date. Handle people with tags rather than folders, because a photo can only sit in one folder but can carry any number of names.',
  },
  {
    q: 'What is the best way to name photo files?',
    a: 'Start with the date written as yyyymmdd, then add the event and a number, for example 20100915-Ceremony-001.jpg, the pattern the Library of Congress uses in its scanning guide. Use only letters, numbers and hyphens, and keep the same pattern for every file.',
  },
  {
    q: 'How do I find duplicate photos on my iPhone?',
    a: 'Open the Photos app, tap Collections, tap Utilities, then tap Duplicates. Tap Merge to combine a set of duplicates. If the Duplicates collection does not appear, Photos has not found any duplicates in your library.',
  },
  {
    q: 'How do I organise photos from several family members?',
    a: 'Agree a folder structure and a naming pattern first, then ask each person for their best photos of each event rather than everything on their phone. Gather them in one shared place, remove the duplicates, and give each person a clear job, such as one decade or one box of prints.',
  },
  {
    q: 'Do I need to organise every single photo?',
    a: 'No. The Library of Congress suggests deciding which photos matter most, and says that can be a few or many. Sorting and naming the photos your family cares about is worth more than filing thousands nobody will open.',
  },
];

const KEY_FACTS = [
  <>
    <strong>Four steps.</strong> The Library of Congress method: identify where your photos are,
    decide which matter, organise the ones you chose, then make copies and keep them in different
    places.
  </>,
  <>
    <strong>Keep the best version.</strong> Where you have several copies of the same photo, the
    Library of Congress says to save the one with the highest quality.
  </>,
  <>
    <strong>Date first.</strong> File names that begin with the date as yyyymmdd, such as{' '}
    <span style={{ whiteSpace: 'nowrap' }}>20100915-Ceremony-001.jpg</span>, sort into date order on any computer.
  </>,
  <>
    <strong>Duplicates on iPhone.</strong> The Photos app lists them under Collections, then
    Utilities, then Duplicates, where you can merge each set.
  </>,
  <>
    <strong>Face labels stay private.</strong> Google Photos face labels are private to each account
    and are not shared when you share photos, so write names down too.
  </>,
  <>
    <strong>Two copies, checked yearly.</strong> Keep at least two copies, check them once a year
    and copy them to new media every five years (Library of Congress).
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'Library of Congress',
    title: 'Digital Photos: Personal Archiving',
    href: 'https://digitalpreservation.gov/personalarchiving/photos.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Scanning Your Personal Collections (Personal Digital Archiving series)',
    href: 'https://www.digitalpreservation.gov/personalarchiving/documents/PA_scanning.pdf',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'New York State Archives',
    title: 'Digital Media',
    href: 'https://www.archives.nysed.gov/preservation/family-records-digital-media',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Apple Support',
    title: 'Merge duplicate photos and videos on iPhone',
    href: 'https://support.apple.com/en-gb/guide/iphone/iph1978d9c23/ios',
    date: '2026',
  },
  {
    publisher: 'Apple Support',
    title: 'Find and name people and pets in Photos on iPhone',
    href: 'https://support.apple.com/en-gb/guide/iphone/iph9c7ee918c/ios',
    date: '2026',
  },
  {
    publisher: 'Apple Support',
    title: 'Import and export photos and videos on iPhone',
    href: 'https://support.apple.com/en-gb/guide/iphone/iph480caa1f3/ios',
    date: '2026',
  },
  {
    publisher: 'Google Photos Help',
    title: 'Set up and manage your face groups',
    href: 'https://support.google.com/photos/answer/6128838?hl=en-GB',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Google Account Help',
    title: 'How to download your Google data',
    href: 'https://support.google.com/accounts/answer/3024190?hl=en-GB',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Microsoft Learn',
    title: 'Naming Files, Paths, and Namespaces',
    href: 'https://learn.microsoft.com/en-gb/windows/win32/fileio/naming-a-file',
    date: '2024',
  },
];

// Space above a block that follows running text, and above the sources after the last section.
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function OrganiseFamilyPhotosPage() {
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
            { name: 'How to Organise Family Photos', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <GuideArticle
          crumb="How to Organise Family Photos"
          title={
            <>
              How to organise{' '}
              <br />
              <Accent>family photos.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              To organise family photos, gather them from every phone, computer, drive and box into one
              place, keep the best version of each and delete the duplicates, rename the files so they
              start with the date (yyyymmdd), sort them into folders by year and event, tag the people in
              them, and keep at least two copies in different places.
            </Lead>
            <p>
              That is close to the four-step method the Library of Congress recommends for keeping digital
              photos: identify, decide, organise, then make copies. It works for three hundred photos
              or thirty thousand, and you do not have to finish in one go.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <PullQuote>
            A photo nobody can find <Accent tone="blue">is a photo nobody looks at.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                Where should you <Accent tone="pink">start?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Start by finding everything. The Library of Congress’s first step is to identify all your
                digital photos, on cameras, computers and memory cards, including the ones you have put
                online. List every place before you move a file:
              </p>
            </Prose>
            <Tips>
              <Tip icon={Smartphone}>Phones, including old ones in drawers and your parents’ phones.</Tip>
              <Tip icon={Laptop}>Computers and laptops, old and new.</Tip>
              <Tip icon={HardDrive}>External drives, USB sticks, memory cards, and CDs or DVDs of photos.</Tip>
              <Tip icon={Cloud}>Online accounts: Google Photos, iCloud, Facebook, Instagram and old email attachments.</Tip>
              <Tip icon={Images}>Prints, slides and negatives in albums and boxes, which will need scanning.</Tip>
            </Tips>
            <Prose>
              <p>
                Then copy everything into one working folder on a computer or an external drive. Copy rather
                than move, so nothing is lost if a transfer fails. On an iPhone, select the photos in the
                Photos app, tap the Share button, then Export Unmodified Original to save the unedited
                originals straight to a connected drive. For Google Photos, Google’s Takeout page creates an
                archive you can download.
              </p>
              <p>
                Prints, slides and family papers are a bigger job. Our guide to{' '}
                <Link href="/guides/how-to-create-a-family-archive">creating a family archive</Link> covers
                them.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you decide <Accent tone="pink">what to keep?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                The Library of Congress’s second step is to decide which photos matter most, and it says that
                can be a few or many. Most phones hold bursts of near-identical shots, screenshots and photos
                of parking spaces, and none of those need a name.
              </p>
              <p>
                Where you have several versions of the same photo, keep the best one. The Library’s advice is
                to save the version with the highest quality, which is usually the largest file with the
                biggest pixel dimensions. You can see both in the photo’s information panel.
              </p>
              <p>
                A quick way through is three folders: Keep, Maybe and Delete. Move fast on the first pass and
                come back to Maybe later. If you are unsure about a photo, ask whether anyone in the family
                would miss it.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What is the best way <Accent tone="pink">to name photo files?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Start every file name with the date, written year, month, day. The Library of Congress
                suggests this yyyymmdd structure in its guide to scanning personal collections, with examples
                such as <span style={{ whiteSpace: 'nowrap' }}>20100914-Rehearsal-001.jpg</span> and <span style={{ whiteSpace: 'nowrap' }}>20100915-Ceremony-001.jpg</span>. Because the year comes first
                and every date has the same eight digits, files named this way line up in time order on any
                phone, Mac or Windows PC.
              </p>
              <p>
                After the date, add a word or two about the event and a number: <span style={{ whiteSpace: 'nowrap' }}>19870614-Spain-holiday-001.jpg</span>.
                If you only know the year, fill the month and day with zeros (<span style={{ whiteSpace: 'nowrap' }}>19870000-Spain-holiday-001.jpg</span>)
                so the file still sorts at the start of that year. The Library’s advice is to create your own
                system but be consistent.
              </p>
              <p>
                {'Stick to letters, numbers and hyphens. Windows does not allow nine characters in file names at all (< > : " / \\ | ? and *), so a name that works on one computer can fail when a relative copies it to theirs.'}
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Should folders go by <Accent tone="pink">year, event or person?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Go by year, then event, and leave people to tags. The New York State Archives suggests one
                main Photos folder, with the images from each event in a subfolder named with the event and
                its date. The Library of Congress’s example works the same way, a folder within a folder:
                Family, then a folder for the wedding, then the dated files inside it.
              </p>
              <p>
                Folders by person sound tidy but quickly fall apart. A photo of Nan with three grandchildren
                would need four copies, one in each person’s folder. A photo can only live in one folder, but
                it can carry as many names as you like.
              </p>
            </Prose>
            <Tips>
              <Tip icon={FolderTree}>One top folder for everything, such as Family Photos.</Tip>
              <Tip icon={CalendarDays}>Inside it, a folder for each year: 1986, 1987, 1988.</Tip>
              <Tip icon={FolderOpen}>Inside each year, a folder for each event, starting with its date: 1987-06 Spain holiday.</Tip>
              <Tip icon={FileImage}>Inside each event, the photos, named date first: 19870614-<span style={{ whiteSpace: 'nowrap' }}>Spain-holiday-001.jpg</span>.</Tip>
            </Tips>
            <Prose>
              <p>
                Add one more file at the top: a short note that explains the system, who looks after it and
                where the copies are. The Library of Congress recommends writing a brief description of your
                folder structure, and putting a copy of your photo inventory with your important papers.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you tag the people <Accent tone="pink">in your photos?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                The Library of Congress counts tagging as part of organising: add the names of the people in
                each photo, plus descriptive subjects such as a place or an occasion.
              </p>
              <p>
                Phone apps can do much of the work. In Apple’s Photos app, when you name a person in one
                photo, they are added to the People &amp; Pets collection and named in your other photos
                automatically. Google Photos groups similar faces so you can add a name to each group, in the
                regions and accounts where the feature is available.
              </p>
              <p>
                There is a catch. Google says face labels are private to each account and are not shared when
                you share photos. Treat face recognition as a shortcut, and write the names where the whole
                family can see them: in a caption, in the note in each event folder, or alongside the print.
                Our guide to <Link href="/guides/how-to-label-old-photos">labelling old photos</Link> covers
                prints.
              </p>
              <p>
                A good caption does three jobs: it says who is in the photo, why it matters and when it was
                taken. The photo below, from the family of Ancestorii’s founder, carries the caption he gave
                it.
              </p>
            </Prose>
            <GuideFigure
              src="/family.jpg"
              alt="Dante and his mum sitting on the floor"
              label={'Me and my mum · The woman behind everything · May\u00a02011'}
              color="var(--c2)"
              position="62% 50%"
            />
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you deal <Accent tone="pink">with duplicates?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Clear out duplicates before you rename anything, or you will name the same photo twice.
                Gathering from several phones always produces copies: the same picture backed up twice, or
                sent between relatives.
              </p>
              <p>
                On an iPhone, the Photos app collects them under Collections, Utilities, Duplicates, where
                Merge combines each set. On a computer, sort each folder by date and look for files of the
                same size side by side. When two copies differ, keep the larger one.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you get <Accent tone="pink">the whole family involved?</Accent>
              </>
            }
          >
            <Steps>
              <Step number="01" title="Agree the system first.">
                <p>Share the naming pattern and the folder structure before anyone sends a photo, so everything arrives in the same shape.</p>
              </Step>
              <Step number="02" title="Ask for the best, not everything.">
                <p>Ask each relative for their favourite photos of each event rather than their whole camera roll. It saves you a pile of duplicates.</p>
              </Step>
              <Step number="03" title="Split the work.">
                <p>One person takes the 1980s, another takes Nan’s albums. Small, clear jobs get finished.</p>
              </Step>
              <Step number="04" title="Pick one day a year.">
                <p>Choose a date you will remember, such as New Year’s Day or a family birthday, to add the year’s photos and check the copies. The Library of Congress suggests checking your photos at least once a year.</p>
              </Step>
            </Steps>
          </GuideSection>

          <GuideSection
            title={
              <>
                Where does <Accent tone="pink">Ancestorii fit?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Ancestorii’s <Link href="/features/family-library">family Library</Link> is built for the
                sorted, chosen part of a collection. It is one private library shared by everyone you invite
                to your family space. Folders have a name, a description and a date, such as “Holiday&nbsp;2026”.
                You can upload many photos and videos at once, and iPhone HEIC photos are converted to JPEG
                automatically. Photos uploaded straight into the Memory Book, canvas or acrylic editors are
                saved to the Library too, in an automatic Uncategorised folder.
              </p>
              <p>
                From the Library, photos go into{' '}
                <Link href="/features/family-photo-albums">family photo albums</Link>, where each picture can
                have a name, a date in plain words such as “Summer&nbsp;1994”, a thread called The Story where
                relatives add what they remember, and voice notes.
              </p>
              <p>
                Storage is one pool for the whole family: 1&nbsp;GB on the Free plan, which needs no card, and
                100&nbsp;GB on Premium at £3.99 a month per family. Keep your full set of originals in your own
                backups too, since converted HEIC photos are JPEG copies, not the original files. Our guide
                to{' '}
                <Link href="/guides/how-to-back-up-family-photos">backing up family photos</Link> explains how.
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
            <FaqList items={FAQ} variant="open" />
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
              Sort them once.
              <br />
              <Accent tone="pink">Share with family.</Accent>
            </>
          }
        >
          Start a free family Library and invite the people who were there.
        </GuideCta>
      </SiteShell>
    </>
  );
}
