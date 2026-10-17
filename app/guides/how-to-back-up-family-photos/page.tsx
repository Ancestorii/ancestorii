import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { Clock, Cloud, Disc3, HardDrive, KeyRound, Smartphone, Usb } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import {
  Compare,
  CompareRow,
  GuideFigure,
  Point,
  Points,
  Step,
  Steps,
  Tip,
  Tips,
} from '../_components/GuideBlocks';

const PATH = '/guides/how-to-back-up-family-photos';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Back Up Family Photos: The 3-2-1 Rule';
const HEADLINE = 'How to back up family photos: the 3-2-1 rule';
const DESCRIPTION =
  'Keep three copies on two kinds of storage with one off-site, check them yearly and refresh every few years. The 3-2-1 rule for family photos, explained.';
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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to back up family photos' }],
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
    q: 'What is the 3-2-1 backup rule for photos?',
    a: 'Keep three copies of every important photo (one primary copy and two backups), on two different types of storage, with one copy stored off-site, outside your home. US-CERT recommends the rule for any important file.',
  },
  {
    q: 'Is Google Photos or iCloud a backup?',
    a: 'Count it as one copy at most. Both keep your library the same on every device, so a photo deleted on one device is deleted on every synced device. Apple says photos in iCloud Photos are not duplicated in your iCloud backup and advises keeping backup copies, so keep at least one more copy on a drive you control.',
  },
  {
    q: 'How long do external hard drives last?',
    a: 'There is no fixed lifespan: the New York State Archives says there is no certain way to tell how long an individual drive will last, and Backblaze recorded a 1.36% annualised failure rate across its data centre drives in 2025. Check drives every year and copy everything to new storage every three to five years.',
  },
  {
    q: 'Are DVDs a good way to store photos?',
    a: 'Only as an extra copy. The Canadian Conservation Institute estimates that a typical silver DVD-R lasts 10 to 20\u00a0years on average, and that ignoring its advice on choosing, recording, handling and storing discs can lead to failure in as little as 2 to 10\u00a0years. Avoid rewritable discs, store discs somewhere cool and dry, and keep a working disc drive.',
  },
  {
    q: 'How often should I check my photo backups?',
    a: 'At least once a year, as the Library of Congress recommends. Open a sample of photos from each copy, add the year’s new photos to every copy, and move everything to new storage every three to five years.',
  },
];

const KEY_FACTS = [
  <>
    <strong>3-2-1.</strong> Keep 3 copies of any important file (1 primary and 2 backups), on 2
    different media types, with 1 copy off-site. That is how US-CERT puts it.
  </>,
  <>
    <strong>Check yearly, refresh often.</strong> The Library of Congress says check your photos at
    least once a year and make new copies every five years; the New York State Archives says every
    three to five.
  </>,
  <>
    <strong>Drives fail.</strong> Backblaze recorded a 1.36% annualised failure rate across 344,196
    hard drives in its data centres in 2025.
  </>,
  <>
    <strong>Free cloud space is small.</strong> A Google Account includes up to 15&nbsp;GB, shared across
    Gmail, Drive and Photos. Apple gives 5&nbsp;GB of free iCloud storage.
  </>,
  <>
    <strong>Sync is not a backup.</strong> Apple says a photo deleted on one device is deleted
    everywhere you use iCloud Photos, and those photos are not duplicated in your iCloud backup.
  </>,
  <>
    <strong>Dormant accounts can be deleted.</strong> Google can delete an account inactive for two
    years, and Apple can delete an iPhone’s iCloud backups after 180&nbsp;days without a new one.
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'US-CERT (now CISA)',
    title: 'Data Backup Options',
    href: 'https://www.cisa.gov/sites/default/files/publications/data_backup_options.pdf',
    date: '2012',
  },
  {
    publisher: 'Library of Congress',
    title: 'Digital Photos: Personal Archiving',
    href: 'https://digitalpreservation.gov/personalarchiving/photos.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'New York State Archives',
    title: 'Digital Media',
    href: 'https://www.archives.nysed.gov/preservation/family-records-digital-media',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Backblaze',
    title: 'Backblaze Publishes 2025 Drive Stats Report',
    href: 'https://ir.backblaze.com/news/news-details/2026/Backblaze-Publishes-2025-Drive-Stats-Report-13-Years-of-Data-Show-a-Growing-Healthier-Drive-Fleet/default.aspx',
    date: '12\u00a0February\u00a02026',
  },
  {
    publisher: 'Canadian Conservation Institute',
    title: 'Longevity of Recordable CDs, DVDs and Blu-rays (CCI Notes 19/1)',
    href: 'https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/longevity-recordable-cds-dvds.html',
    date: '2019',
  },
  {
    publisher: 'Oral History Society',
    title: 'Equipment: choosing the right equipment',
    href: 'https://ohs.org.uk/for-beginners/equipment/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Apple Support',
    title: 'Set up and use iCloud Photos',
    href: 'https://support.apple.com/en-gb/108782',
    date: '21\u00a0September\u00a02026',
  },
  {
    publisher: 'Apple',
    title: 'iCloud',
    href: 'https://www.apple.com/uk/icloud/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Apple',
    title: 'iCloud Terms and Conditions',
    href: 'https://www.apple.com/legal/internet-services/icloud/en/terms.html',
    date: 'last revised 14\u00a0September\u00a02026',
  },
  {
    publisher: 'Google One Help',
    title: 'How your Google storage works',
    href: 'https://support.google.com/googleone/answer/9312312?hl=en-GB',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Google Photos Help',
    title: 'Delete photos and videos',
    href: 'https://support.google.com/photos/answer/6128858?hl=en-GB',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Google One Help',
    title: 'Back up your device',
    href: 'https://support.google.com/googleone/answer/9149304?hl=en-GB',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Google Account Help',
    title: 'Inactive Google Account Policy',
    href: 'https://support.google.com/accounts/answer/12418290?hl=en-GB',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Apple Support',
    title: 'How to add a Legacy Contact for your Apple Account',
    href: 'https://support.apple.com/en-gb/102631',
    date: '22\u00a0September\u00a02026',
  },
  {
    publisher: 'Google Account Help',
    title: 'About Inactive Account Manager',
    href: 'https://support.google.com/accounts/answer/3036546?hl=en-GB',
    date: 'accessed October\u00a02026',
  },
];

// Space above a block that follows running text, and above the sources after the last section.
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function BackUpFamilyPhotosPage() {
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
            { name: 'How to Back Up Family Photos', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <GuideArticle
          crumb="How to Back Up Family Photos"
          title={
            <>
              How to back up{' '}
              <br />
              <Accent>family photos.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              Back up family photos with the 3-2-1 rule: keep three copies of every photo that matters (the
              original and two backups), on two different kinds of storage, with one copy kept away from your
              home. Then check the copies once a year and move them to new storage every few years, because no
              drive, disc or account lasts forever.
            </Lead>
            <p>
              US-CERT, the American government’s computer emergency team, recommends the rule to everyone from
              home users to security professionals, and cites a 2009 handbook for photographers, Peter Krogh’s
              The DAM Book, as the source.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <PullQuote>
            One copy is a photo. <Accent tone="blue">Three copies is a plan.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                What is the <Accent tone="pink">3-2-1 backup rule?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Three copies, because any one copy can fail. Two kinds of storage, which in US-CERT’s words
                protects “against different types of hazards”. One copy off-site, because a fire, flood or
                burglary takes everything in the building. If your photos are still scattered, start with our
                guide to <Link href="/guides/how-to-organize-family-photos">organising family photos</Link>.
              </p>
            </Prose>
            <Steps>
              <Step number="01" title="Copy one: your working library.">
                <p>The photos on your computer, or in the photo library you use every day.</p>
              </Step>
              <Step number="02" title="Copy two: a drive at home.">
                <p>An external hard drive you copy everything to, kept somewhere cool and dry. US-CERT advises disconnecting removable drives once the backup is finished.</p>
              </Step>
              <Step number="03" title="Copy three: away from home.">
                <p>A cloud backup service, or a second drive kept at a relative’s house. The Library of Congress advises storing copies as far apart as practical, so one disaster does not take every copy.</p>
              </Step>
            </Steps>
            <Prose>
              <p>
                Photos like this one, from the family of Ancestorii’s founder, cannot be taken again. That is
                the whole case for three copies.
              </p>
            </Prose>
            <div style={{ maxWidth: 720, marginInline: 'auto' }}>
              <GuideFigure
                src="/snow.jpg"
                alt="Dante and his sister in the snow"
                label={'She still says she won the snowball fight · March\u00a02010'}
                color="var(--c1)"
                position="40% 50%"
              />
            </div>
          </GuideSection>

          <GuideSection
            title={
              <>
                Which storage <Accent tone="pink">should you use?</Accent>
              </>
            }
          >
            <Prose>
              <p>Use more than one kind. Each has a weakness the others cover.</p>
            </Prose>
            <Points>
              <Point icon={HardDrive} title="External hard drives.">
                Plenty of space for the money. The Oral History Society notes that expert advice now favours
                several external hard drives over CDs and DVDs for long-term storage.
              </Point>
              <Point icon={Cloud} title="Cloud backup.">
                Off-site by design. The New York State Archives suggests an online service for a second set
                of backups, but warns that services can go out of business or change their terms.
              </Point>
              <Point icon={Disc3} title="Discs.">
                Fine as an extra copy. The New York State Archives recommends gold CD-R and DVD-R discs, and
                advises against rewritable ones as your main backup.
              </Point>
              <Point icon={Usb} title="USB sticks and memory cards.">
                Handy for moving photos between devices, but the same archivists advise against using them
                as your main backup.
              </Point>
            </Points>
          </GuideSection>

          <GuideSection
            title={
              <>
                How long do hard drives <Accent tone="pink">and discs last?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Nobody can tell you how long your particular drive will last. The New York State Archives
                puts it plainly: some media remain readable for a long time, others fail within a few years,
                and there is no certain way to know which you have.
              </p>
              <p>
                What we do have are failure rates. Backblaze, a cloud storage company that publishes data on
                the drives in its data centres, recorded an annualised failure rate of 1.36% across 344,196
                hard drives in 2025, down from 1.55% in 2024. That is roughly one or two failures for every
                hundred drives running for a year. Low, but not zero.
              </p>
              <p>
                Discs vary even more. The Canadian Conservation Institute estimates that recordable discs
                last anywhere from a couple of years to more than 200, depending on the type: on average 10 to
                20&nbsp;years for a typical silver DVD-R, 5 to 10&nbsp;years for most recordable Blu-ray discs, and over
                100&nbsp;years for the best gold CD-Rs. Ignore its advice on choosing, recording, handling and
                storing discs, and one can fail in as little as 2 to 10&nbsp;years. Our guide to{' '}
                <Link href="/guides/how-long-do-photos-last">how long photos last</Link> covers prints too.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Why one cloud account <Accent tone="pink">isn’t a backup plan.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                iCloud Photos and Google Photos are very good at keeping your library the same on every
                device, which is exactly why they are not a second copy. Apple says that when you delete
                photos on one device, they are deleted everywhere you use iCloud Photos, and after 30&nbsp;days in
                Recently Deleted they are gone for good. Google says a backed-up photo deleted in Google
                Photos is removed from every device with backup turned on. Apple even tells you to keep
                backup copies of your library, because iCloud Photos is not duplicated in your iCloud backup.
              </p>
              <p>Accounts come with rules, too:</p>
            </Prose>
            <Tips>
              <Tip icon={Cloud}>Google includes up to 15&nbsp;GB per account. Over that, you can’t back up new photos to Google Photos, and content can become eligible for deletion after two years over quota.</Tip>
              <Tip icon={Clock}>Google can delete a personal account that has been inactive across Google for at least two years.</Tip>
              <Tip icon={Smartphone}>If an Android phone isn’t used for 57&nbsp;days, its Google backup is erased, except the photos and videos already in Google Photos.</Tip>
              <Tip icon={KeyRound}>Apple gives 5&nbsp;GB free. Its terms let it delete data over your limit after 30&nbsp;days’ notice, and an iPhone’s iCloud backups if it hasn’t backed up for 180&nbsp;days.</Tip>
            </Tips>
            <Prose>
              <p>
                None of this makes the cloud a bad idea. It makes it one copy, not the plan. US-CERT adds a
                quieter risk: backups that update themselves can silently copy corruption or malware from
                the original files to the backup, which is a good reason for at least one copy that does not
                update automatically.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How often should you <Accent tone="pink">check your backups?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Check once a year and refresh every three to five years. The Library of Congress recommends
                checking your photos at least once a year to make sure you can still read them, and making
                new copies every five years or when needed. The New York State Archives suggests copying files
                from older media to newer media every three to five years, because the risk of failure rises
                with each year that passes.
              </p>
              <p>
                The yearly check can be quick: plug in each drive and open a handful of photos from different
                years, confirm the cloud backup ran recently, add the year’s new photos to every copy, and
                note the date.
              </p>
            </Prose>
            <Compare labels={['What usually happens', 'What keeps photos safe']}>
              <CompareRow left="Copy everything to one drive once, then forget it" right="Update every copy on a fixed day, and check them each year" />
              <CompareRow left="Keep the backup drive next to the computer" right="Keep one copy in a different building" />
              <CompareRow left="Store the drive in the loft, cellar or garage" right="Keep it somewhere cool and dry; archivists warn against basements, attics and garages" />
              <CompareRow left="Trust one cloud account with everything" right="Count the cloud as one copy of three" />
            </Compare>
          </GuideSection>

          <GuideSection
            title={
              <>
                Who else should know <Accent tone="pink">where the photos are?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                A perfect backup that only one person can find is not much use to the family. The Library of
                Congress suggests putting a copy of your photo inventory with your important papers in a
                secure place. Write down where each copy is and which accounts hold photos, and tell at least
                one other person.
              </p>
              <p>
                Apple lets you add a Legacy Contact, who can request access to your Apple Account data after
                your death, including photos and device backups. Google’s Inactive Account Manager lets you
                choose up to 10 people to receive data from your account if it becomes inactive. Our guide
                to{' '}
                <Link href="/guides/what-happens-to-your-photos-when-you-die">
                  what happens to your photos when you die
                </Link>{' '}
                goes further.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Where Ancestorii fits, <Accent tone="pink">and where it doesn’t.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Ancestorii is not a backup service, and it shouldn’t be treated as one. It is where your
                family’s chosen photos live with their stories, dates and voices, in a private space everyone
                you invite can see and add to. Storing photos and keeping them are different jobs, as our
                guide to{' '}
                <Link href="/guides/living-library-vs-digital-vault">living libraries and digital vaults</Link>{' '}
                explains.
              </p>
              <p>
                It can be one more place your best photos are kept, off your own devices. But keep your full
                set of originals in your own 3-2-1 backups: iPhone HEIC photos are converted to JPEG when they
                upload, so the copy in Ancestorii is not the original file, and each plan has a file-size
                allowance (20&nbsp;MB per file on Free, 10&nbsp;GB on Premium).
              </p>
              <p>
                Storage is one shared pool for the family: 1&nbsp;GB on the Free plan and 100&nbsp;GB on Premium, which
                costs £3.99 a month per family, paid monthly. If you stop Premium, nothing is deleted:
                everything stays viewable, and only new uploads beyond the Free limits stop. See{' '}
                <Link href="/pricing">pricing</Link> for details.
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
              Back them up.
              <br />
              <Accent tone="pink">Add their stories.</Accent>
            </>
          }
        >
          Keep the photos that matter with their stories, in one private place your family shares.
        </GuideCta>
      </SiteShell>
    </>
  );
}
