import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { Clock, HardDrive, Heart, Hourglass, Images, Printer, Users } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { GuideFigure, Point, Points, Step, Steps, Tip, Tips } from '../_components/GuideBlocks';

const PATH = '/guides/what-happens-to-your-photos-when-you-die';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'What Happens to Your Photos When You Die?';
const HEADLINE = 'What happens to your photos when you die?';
const DESCRIPTION =
  'Without a plan, cloud photos can be locked away or deleted. How Apple Legacy Contact, Google Inactive Account Manager and Facebook legacy contacts work.';
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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'What happens to your photos when you die' }],
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
    q: 'Can my family access my iCloud photos after I die?',
    a: 'Yes, if you add a Legacy Contact. With your access key and death certificate, they can request your data, including iCloud Photos, and download it within three years of Apple’s first approval. Without a Legacy Contact, Apple generally needs a death certificate and may require a court order.',
  },
  {
    q: 'What happens to Google Photos when someone dies?',
    a: 'If they set up Inactive Account Manager, up to 10 people they chose get a download link once the account has been inactive for the time they picked. If not, family can ask Google for data, which it may provide in certain circumstances, and Google can delete an account that is inactive for two years.',
  },
  {
    q: 'How do I set up a Legacy Contact on my iPhone?',
    a: 'Go to Settings, tap your name, then Sign-In & Security, then Legacy Contact, and tap Add Legacy Contact. You need iOS 15.2 or later. Share the access key by iMessage or print it, and keep a copy with your important papers.',
  },
  {
    q: 'What happens to Facebook photos when you die?',
    a: 'Facebook memorialises the account once it is told. A legacy contact you chose can download an archive of the photos, posts and profile information you shared, if you gave permission, but can’t log in or read your private messages. You can choose permanent deletion instead.',
  },
  {
    q: 'How long do we have to download a loved one’s photos?',
    a: 'It depends where they are. Apple Legacy Contact access lasts three years from approval, and Google can delete an account inactive for two years. An Android phone’s backup is erased after 57\u00a0days without use, though photos in Google Photos stay, and iCloud device backups can go after 180\u00a0days. Start with the phones.',
  },
];

const KEY_FACTS = [
  <>
    <strong>Apple Legacy Contact.</strong> Needs your access key and death certificate. Access lasts
    three years from Apple’s first approval, and then the account is permanently deleted.
  </>,
  <>
    <strong>No plan, no rights.</strong> Apple’s iCloud terms say that, outside Digital Legacy, rights
    to your account end when you die, and it may be deleted once Apple receives a death certificate.
  </>,
  <>
    <strong>Google’s two-year rule.</strong> Google may delete an account that is inactive for two
    years. Its Inactive Account Manager can share your data with up to 10 people.
  </>,
  <>
    <strong>Facebook legacy contact.</strong> Can download an archive of the photos, posts and profile
    information you shared, if you allow it, but can’t log in or read your messages (Meta).
  </>,
  <>
    <strong>Locked phones stay locked.</strong> Apple says it can’t help remove a passcode lock without
    erasing the device.
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'Apple Support',
    title: 'How to add a Legacy Contact for your Apple Account',
    href: 'https://support.apple.com/en-gb/102631',
    date: '22\u00a0September\u00a02026',
  },
  {
    publisher: 'Apple Support',
    title: 'Data that a Legacy Contact can access',
    href: 'https://support.apple.com/en-gb/103128',
    date: '16\u00a0April\u00a02026',
  },
  {
    publisher: 'Apple Support',
    title: 'Request access to an Apple Account as a Legacy Contact',
    href: 'https://support.apple.com/en-gb/102678',
    date: '24\u00a0August\u00a02026',
  },
  {
    publisher: 'Apple Support',
    title: 'Request access to a deceased family member’s Apple Account',
    href: 'https://support.apple.com/en-gb/102431',
    date: '24\u00a0August\u00a02026',
  },
  {
    publisher: 'Apple',
    title: 'iCloud Terms and Conditions',
    href: 'https://www.apple.com/uk/legal/internet-services/icloud/en/terms.html',
    date: 'last revised 14\u00a0September\u00a02026',
  },
  {
    publisher: 'Google Account Help',
    title: 'About Inactive Account Manager',
    href: 'https://support.google.com/accounts/answer/3036546?hl=en-GB',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Google Account Help',
    title: 'Inactive Google Account Policy',
    href: 'https://support.google.com/accounts/answer/12418290?hl=en-GB',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Google Account Help',
    title: 'Submit a request regarding a deceased user’s account',
    href: 'https://support.google.com/accounts/troubleshooter/6357590?hl=en-GB',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Google One Help',
    title: 'Back up your device',
    href: 'https://support.google.com/googleone/answer/9149304?hl=en-GB',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Meta',
    title: 'Adding a Legacy Contact',
    href: 'https://about.fb.com/news/2015/02/adding-a-legacy-contact/',
    date: '12\u00a0February\u00a02015, updated 7\u00a0November\u00a02019',
  },
  {
    publisher: 'Meta Help Centre',
    title: 'Settings that you can manage across your accounts in an Accounts Centre',
    href: 'https://www.meta.com/en-gb/help/accounts-center/1894490827562393/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Library of Congress',
    title: 'Digital Photos: Personal Archiving',
    href: 'https://digitalpreservation.gov/personalarchiving/photos.html',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Apple Support',
    title: 'Set up or join an iCloud Shared Photo Library on iPhone',
    href: 'https://support.apple.com/en-gb/guide/iphone/iph28ac9ea81/ios',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Google Photos Help',
    title: 'Set up Partner Sharing',
    href: 'https://support.google.com/photos/answer/7378858?hl=en-GB',
    date: 'accessed October\u00a02026',
  },
];

// Space above a block that follows running text, and above the sources after the last section.
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function PhotosWhenYouDiePage() {
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
            { name: 'What Happens to Your Photos When You Die?', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <GuideArticle
          crumb="What Happens to Your Photos When You Die?"
          title={
            <>
              What happens to your photos{' '}
              <br />
              <Accent>when you die?</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              Unless you’ve set something up, your photos stay locked inside your devices and accounts, and
              can eventually be deleted: Google can delete an account that has been inactive for two years,
              and Apple’s terms let it delete an account once it receives a death certificate. To prevent
              that, add an Apple Legacy Contact, set up Google’s Inactive Account Manager, choose a Facebook
              legacy contact, and share copies of the photos that matter while you can.
            </Lead>
            <p>
              This guide goes account by account: what Apple, Google and Facebook let a family do, how long
              they have, and what to set up now. For why a digital legacy needs planning at all, see our page
              on <Link href="/digital-legacy">digital legacy</Link>.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <PullQuote>
            A photo behind a password nobody knows{' '}
            <Accent tone="blue">is a photo nobody sees.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                What happens to iCloud photos <Accent tone="pink">when you die?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                It depends on whether you added a Legacy Contact. If you did, they can request access with the
                access key you gave them and your death certificate. Apple reviews every request. Once it
                approves one, the contact gets a special Legacy Contact Apple Account, your original Apple
                Account stops working, and Activation Lock is removed from your devices.
              </p>
              <p>
                Apple lists what a Legacy Contact can reach: iCloud Photos, Messages in iCloud, Notes, Mail,
                files in iCloud Drive, Voice Memos and anything in an iCloud Backup, which can include photos
                and videos stored on the device. They can’t get purchased films, music or books,
                subscriptions, or passwords in iCloud Keychain.
              </p>
            </Prose>
            <Tips>
              <Tip icon={Hourglass}>Access lasts three years from when Apple approves the first request. After that, the account is permanently deleted, so download everything you want to keep.</Tip>
              <Tip icon={Users}>If you add more than one Legacy Contact, any of them can make decisions about your data on their own, including deleting the account permanently.</Tip>
              <Tip icon={Clock}>Backups are on a shorter clock: Apple can delete a device’s iCloud backups if it hasn’t backed up for 180&nbsp;days.</Tip>
            </Tips>
            <Prose>
              <p>
                Without a Legacy Contact, it’s harder. Apple says it needs legal documentation, generally a
                death certificate, and may also require a court order naming the person asking as the rightful
                inheritor of the dead person’s personal information. Only one person can make that request,
                and some data is end-to-end encrypted, which Apple can’t decrypt. Families can also ask Apple
                to delete the account. For texts and WhatsApp chats, see our guide to{' '}
                <Link href="/guides/how-to-save-text-messages-from-a-loved-one">
                  saving text messages from a loved one
                </Link>
                .
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What happens to Google Photos <Accent tone="pink">when you die?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                If you set up Google’s Inactive Account Manager, your plan runs once your account has been
                inactive for the length of time you chose. Up to 10 people you picked get an email with a link
                to download the data you chose for them, and Google checks each one with a phone number you
                gave for them. You can share different data with different people, and use the same tool to
                say whether your account should be deleted.
              </p>
              <p>
                Without a plan, your photos sit in an account nobody can sign in to. Google’s inactive account
                policy lets it delete an account and its data if it has been inactive across Google for at
                least two years. Families can ask Google to close the account, request funds from it, or ask
                for data, and Google says that in certain circumstances it may provide content, after a careful
                review. It can’t give out passwords.
              </p>
              <p>
                Ask for the photos before you ask for closure: once an account is closed, Google says it can’t
                turn over the contents later. Phone backups go sooner still: if an Android phone isn’t used
                for 57&nbsp;days, its backed-up data is erased, though photos and videos already in Google Photos
                stay.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What happens to <Accent tone="pink">Facebook photos?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                When Facebook is told that someone has died, it memorialises the account. If they chose a
                legacy contact, that person can pin a post to the top of the profile, respond to new friend
                requests, and update the profile picture and cover photo. If they gave permission, the legacy
                contact can also download an archive of the photos, posts and profile information they shared.
              </p>
              <p>
                A legacy contact can’t log in as them or see their private messages, and people can choose to
                have their account permanently deleted after death instead. That comes from Meta’s announcement
                of the feature, last updated in 2019. Meta’s Help Centre now places memorialisation settings in
                Accounts Centre, under Personal details.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What about photos on phones, <Accent tone="pink">drives and memory cards?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                A phone is the hardest place of all. Apple says a device locked with a passcode is protected by
                passcode encryption, and it can’t help remove the passcode lock without erasing the device,
                which deletes the photos on it. So photos on a locked phone can only be reached if they were
                also backed up to an account the family can get into.
              </p>
              <p>
                Drives, memory cards and old computers don’t usually have that problem, but someone has to know
                they exist, and they don’t last forever. The Library of Congress advises checking your photos at
                least once a year, making new copies every five years, and putting a copy of your photo
                inventory with your important papers. Our guide to{' '}
                <Link href="/guides/how-to-back-up-family-photos">backing up family photos</Link> sets out the
                3-2-1 rule.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What should you <Accent tone="pink">set up now?</Accent>
              </>
            }
          >
            <Steps>
              <Step number="01" title="Add an Apple Legacy Contact.">
                <p>On an iPhone, go to Settings, tap your name, then Sign-In &amp; Security, then Legacy Contact, and tap Add Legacy Contact. You need iOS 15.2, iPadOS 15.2 or macOS Monterey 12.1 or later; your contact doesn’t need an Apple device.</p>
              </Step>
              <Step number="02" title="Keep the access key safe.">
                <p>Share it by iMessage or print it. Apple suggests keeping a printed copy with your estate planning documents, and it can’t replace a key that’s been lost.</p>
              </Step>
              <Step number="03" title="Set up Google’s Inactive Account Manager.">
                <p>Go to myaccount.google.com/inactive, choose how long Google should wait, add up to 10 people and pick what each of them receives.</p>
              </Step>
              <Step number="04" title="Choose a Facebook legacy contact.">
                <p>Find memorialisation in Accounts Centre, under Personal details, and decide whether your legacy contact may download an archive of what you shared.</p>
              </Step>
              <Step number="05" title="Write down where your photos are.">
                <p>List your accounts, drives and memory cards, and keep the list with your important papers. Our guide to <Link href="/guides/how-to-write-a-legacy-letter">writing a legacy letter</Link> covers what else to leave with it.</p>
              </Step>
            </Steps>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you make sure the family <Accent tone="pink">already has the important ones?</Accent>
              </>
            }
          >
            <Prose>
              <p>Access routes take paperwork and time. The simplest protection is copies the family can already open.</p>
            </Prose>
            <Points>
              <Point icon={Images} title="iCloud Shared Photo Library.">
                Share photos and videos with up to five other people. Everyone can view, edit and delete what’s
                in it, anyone who leaves can copy everything into their own library first, and it all counts
                towards the organiser’s iCloud storage.
              </Point>
              <Point icon={Heart} title="Google Photos Partner Sharing.">
                Share your library, or photos of chosen people, with one partner, who can save them into their
                own Google Photos account.
              </Point>
              <Point icon={HardDrive} title="A drive in someone else’s home.">
                Give a relative a copy on an external drive. It needs no account, and it doubles as your
                off-site backup.
              </Point>
              <Point icon={Printer} title="Prints.">
                A printed photo needs no password, no subscription and no Legacy Contact.
              </Point>
            </Points>
            <Prose>
              <p>
                Photos like this one, of Ancestorii’s founder in July&nbsp;2010, can’t be taken again. They belong
                where the whole family can see them, not inside one account.
              </p>
            </Prose>
            <div style={{ maxWidth: 640, marginInline: 'auto' }}>
              <GuideFigure
                src="/outdoor.jpg"
                alt="Dante posing outdoors"
                label={'Me, pretending I was too cool to smile · July\u00a02010'}
                color="var(--c0)"
                position="50% 40%"
              />
            </div>
          </GuideSection>

          <GuideSection
            title={
              <>
                How Ancestorii handles <Accent tone="pink">a shared family library.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Ancestorii is built around a family space rather than one person’s account. Everyone you invite
                to My Family can see everything in it, so the photos you add to the shared Library, albums and
                memories are already in front of the people who will need them.
              </p>
              <p>
                Two details matter when someone dies. If Premium stops being paid for, nothing is deleted:
                everything stays viewable, and only new uploads beyond the Free limits stop. And if a member’s
                account is deleted while others remain in the family, their memories, Library photos and albums
                stay with the family; their capsules, profile images and public stories are removed. If the
                only member deletes their account, the whole family space goes with it, so invite at least one
                other person.
              </p>
              <p>
                It doesn’t replace a Legacy Contact or Inactive Account Manager, and it isn’t a backup: iPhone
                HEIC photos are converted to JPEG on upload, so keep your originals in your own backups.
                Storage is one shared pool, 1&nbsp;GB on Free and 100&nbsp;GB on Premium at £3.99 a month per family, and
                Ancestorii is a memory-keeping service, not a legal or estate-planning one. See how{' '}
                <Link href="/features/family-library">the family Library</Link> works, or{' '}
                <Link href="/pricing">compare plans</Link>.
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
              Not locked away.
              <br />
              <Accent tone="pink">Share them now.</Accent>
            </>
          }
        >
          Keep the photos that matter in one private place your whole family can open.
        </GuideCta>
      </SiteShell>
    </>
  );
}
