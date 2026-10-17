import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import {
  Camera,
  Clock,
  CloudUpload,
  FileDown,
  Heart,
  KeyRound,
  Laugh,
  Lock,
  MessageCircle,
  Mic,
  PenLine,
  RefreshCw,
  Shield,
  Smartphone,
  Trash2,
  Users,
} from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { Point, Points, Step, Steps, Tip, Tips } from '../_components/GuideBlocks';

const PATH = '/guides/how-to-save-text-messages-from-a-loved-one';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Save Text Messages From a Loved One';
const HEADLINE = 'How to save text and WhatsApp messages from a loved one';
const DESCRIPTION =
  'Phone settings can delete old chats, and unused backups can be deleted after 57 or 180 days. How to save a loved one’s texts, iMessages and WhatsApp chats.';
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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to save text messages from a loved one' }],
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
    q: 'How do I keep text messages forever on an iPhone?',
    a: 'Go to Settings, tap Apps, then Messages, and set Keep Messages to Forever. Any other option deletes conversations, including attachments, once they are older than 30\u00a0days or a year. Then screenshot the messages that matter and keep copies off the phone.',
  },
  {
    q: 'How do I save a WhatsApp chat from someone who has died?',
    a: 'Open the chat on your own phone and use Export chat (on Android: More options, More, Export chat; on an iPhone: tap their name, then Export chat). WhatsApp says the export is a text file, not a backup, so it can’t be imported back into WhatsApp. On Android only the most recent media are attached, so save the photos and voice messages that matter most separately as well.',
  },
  {
    q: 'What happens to a person’s text messages when they die?',
    a: 'The messages they sent you stay on your phone unless you, or a setting such as Keep Messages, delete them. Their own copies stay on their phone and in any backups, but an iPhone’s iCloud backups can be deleted after 180\u00a0days without a new backup, and an Android phone’s backup after 57\u00a0days without use, so save what you need early.',
  },
  {
    q: 'Can I get into a loved one’s iCloud after they die?',
    a: 'Yes, if they made you a Legacy Contact. With the access key and their death certificate you can request their data, including Messages in iCloud, and access lasts three years from Apple’s first approval. Without one, Apple generally asks for a death certificate and may require a court order.',
  },
  {
    q: 'Will their messages disappear if their phone stays switched off?',
    a: 'Not from the phone itself, but backups can. Google erases an Android phone’s backed-up data, apart from photos and videos in Google Photos, after 57\u00a0days without use, and Apple can delete an iPhone’s iCloud backups if it hasn’t backed up for 180\u00a0days.',
  },
];

const KEY_FACTS = [
  <>
    <strong>Set Keep Messages to Forever.</strong> On an iPhone, any other setting removes
    conversations, attachments included, once they’re older than 30&nbsp;days or a year (Apple).
  </>,
  <>
    <strong>30&nbsp;days to undo.</strong> Deleted iPhone messages stay in Recently Deleted for up to 30&nbsp;days and can be recovered in that time.
  </>,
  <>
    <strong>Unused backups expire.</strong> Google erases an Android phone’s backed-up data, except
    photos and videos, if it isn’t used for 57&nbsp;days. Apple can delete iCloud backups after 180&nbsp;days
    without a new one.
  </>,
  <>
    <strong>A WhatsApp export isn’t a backup.</strong> WhatsApp says the export is a text file, so it
    can’t be re-imported, and on Android only the most recent media are attached.
  </>,
  <>
    <strong>A Legacy Contact can ask.</strong> With the access key and a death certificate, an Apple
    Legacy Contact can request data including Messages in iCloud.
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'Apple Support',
    title: 'Delete messages and attachments in Messages on iPhone',
    href: 'https://support.apple.com/en-gb/guide/iphone/iph2c9c4bfcb/ios',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Apple Support',
    title: 'Recover deleted messages in Messages on iPhone',
    href: 'https://support.apple.com/en-gb/guide/iphone/iph16ecebf48/ios',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Apple Support',
    title: 'Send and receive audio messages in Messages on iPhone',
    href: 'https://support.apple.com/en-gb/guide/iphone/iph2e42d3117/ios',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Apple',
    title: 'iCloud Terms and Conditions',
    href: 'https://www.apple.com/uk/legal/internet-services/icloud/en/terms.html',
    date: 'last revised 14\u00a0September\u00a02026',
  },
  {
    publisher: 'Android Help',
    title: 'Back up or restore data on your Android device',
    href: 'https://support.google.com/android/answer/2819582?hl=en-GB',
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
    publisher: 'SyncTech',
    title: 'SMS Backup & Restore',
    href: 'https://www.synctech.com.au/sms-backup-restore/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'WhatsApp Help Center',
    title: 'How to export your chat history',
    href: 'https://faq.whatsapp.com/1180414079177245',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Ofcom',
    title: 'Online Nation 2025 report',
    href: 'https://www.ofcom.org.uk/siteassets/resources/documents/research-and-data/online-research/online-nation/2025/online-nations-report-2025.pdf',
    date: '10\u00a0December\u00a02025',
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
    publisher: 'Google Account Help',
    title: 'Submit a request regarding a deceased user’s account',
    href: 'https://support.google.com/accounts/troubleshooter/6357590?hl=en-GB',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Meta',
    title: 'Adding a Legacy Contact',
    href: 'https://about.fb.com/news/2015/02/adding-a-legacy-contact/',
    date: '12\u00a0February\u00a02015, updated 7\u00a0November\u00a02019',
  },
];

// Space above a block that follows running text, and above the sources after the last section.
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function SaveTextMessagesPage() {
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
            { name: 'How to Save Text Messages From a Loved One', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <GuideArticle
          crumb="How to Save Text Messages From a Loved One"
          title={
            <>
              How to save text messages{' '}
              <br />
              <Accent>from a loved one.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              To save messages from a loved one, first stop anything deleting them (on an iPhone, set Keep
              Messages to Forever), then make copies you control: export WhatsApp chats, screenshot or back
              up texts, and save voice messages as files. Keep those copies in at least two places, because a
              phone backup that stops updating can be deleted.
            </Lead>
            <p>
              Start with your own phone. The messages they sent you are already on it, so you don’t need
              their phone or their passwords to keep their words. Check WhatsApp as well as Messages: Ofcom
              found that 90% of UK online adults used WhatsApp in 2025, and on an average day in May&nbsp;2025, 74%
              did.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <PullQuote>
            Their messages are already on your phone.{' '}
            <Accent tone="blue">Make sure they don’t only live there.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                What can delete <Accent tone="pink">a loved one’s messages?</Accent>
              </>
            }
          >
            <Prose>
              <p>Rarely one big event. Usually a setting, or time. These are the things to check first:</p>
            </Prose>
            <Points>
              <Point icon={Clock} title="Auto-delete settings.">
                On an iPhone, Keep Messages can be set to 30&nbsp;days or 1&nbsp;year, and audio messages expire 2&nbsp;minutes after they’re played unless you keep them. Check both today.
              </Point>
              <Point icon={RefreshCw} title="Syncing.">
                With Messages in iCloud turned on, deleting a message or conversation on your iPhone deletes it
                from every device where Messages in iCloud is on.
              </Point>
              <Point icon={Smartphone} title="A phone nobody uses.">
                Google erases an Android phone’s backed-up data, apart from photos and videos in Google
                Photos, after 57&nbsp;days without use. Apple can delete an iPhone’s iCloud backups if it hasn’t
                backed up for 180&nbsp;days.
              </Point>
              <Point icon={KeyRound} title="Account rules.">
                Apple’s iCloud terms say that, outside its Digital Legacy scheme, rights to an account end at
                death, and it may be deleted once Apple receives a death certificate. Google can delete an
                account that has been inactive for two years.
              </Point>
              <Point icon={Trash2} title="Clearing out a phone.">
                Resetting, selling or recycling a phone wipes what’s on it, so save what matters before anyone
                does.
              </Point>
            </Points>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you save <Accent tone="pink">iPhone texts and iMessages?</Accent>
              </>
            }
          >
            <Steps>
              <Step number="01" title="Set Keep Messages to Forever.">
                <p>Go to Settings, tap Apps, then Messages. Scroll down, tap Keep Messages (below Message History) and choose Forever.</p>
              </Step>
              <Step number="02" title="Keep their audio messages.">
                <p>In the same settings, tap Expire (below Audio Messages) and choose Never. For each one that matters, touch and hold it, then tap Save to Voice Memos.</p>
              </Step>
              <Step number="03" title="Screenshot the messages that matter.">
                <p>A screenshot keeps the words, the time and their way of writing, and it’s an ordinary image you can copy anywhere.</p>
              </Step>
              <Step number="04" title="Check Recently Deleted.">
                <p>If something has gone, tap the Filter button in the conversation list, then Recently Deleted, select the conversation and tap Recover. Apple keeps deleted messages there for up to 30&nbsp;days.</p>
              </Step>
            </Steps>
            <Prose>
              <p>
                If brothers, sisters or a parent were in the same conversations, ask them to do the same.
                Apple notes that deleting and recovering only affects your own devices: you can’t recover
                messages on anyone else’s.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you save <Accent tone="pink">texts on Android?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Android backs up your texts automatically, but that backup lives in your Google Account for
                restoring a phone, and it doesn’t last forever. Make a copy of your own as well.
              </p>
            </Prose>
            <Tips>
              <Tip icon={CloudUpload}>
                <strong>Check the backup is on.</strong> Android Help says your phone backs up SMS and MMS messages to your Google Account automatically, and RCS messages when you use Google Messages. To back up now, open Settings, tap Google, then All services, then Backup, then Back up now. Menus vary between phones.
              </Tip>
              <Tip icon={FileDown}>
                <strong>Save a copy you control.</strong> An app such as SMS Backup &amp; Restore, from SyncTech, saves SMS and MMS messages and call logs as an XML file, on the phone or in Google Drive, Dropbox or OneDrive. The basic version is free.
              </Tip>
              <Tip icon={Camera}>
                <strong>Screenshot the ones that matter.</strong> Just as on an iPhone, a screenshot keeps their words exactly as they appeared on screen.
              </Tip>
            </Tips>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you export <Accent tone="pink">a WhatsApp chat?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                WhatsApp’s Export chat option turns a conversation into a text file you can email to yourself
                or save. Its help centre gives these steps:
              </p>
            </Prose>
            <Steps>
              <Step number="01" title="On Android.">
                <p>Open the chat, tap More options, then More, then Export chat, and choose Include media or Without media.</p>
              </Step>
              <Step number="02" title="On an iPhone.">
                <p>Open the chat, tap the contact or group name, then Export chat. If the chat contains media, choose With all media, With selected media or Without media.</p>
              </Step>
              <Step number="03" title="Send it somewhere safe.">
                <p>Pick an app such as Mail and send the export to yourself, then copy it off the phone.</p>
              </Step>
            </Steps>
            <Prose>
              <p>
                Know what you get. On Android, WhatsApp attaches only the most recent media when you include
                media. On an iPhone, the chat is exported as a ZIP file, and view once messages are left out.
                Either way, the export is a text file rather than a backup, so it can’t be imported back into
                WhatsApp. Save the photos and voice messages that matter most on their own as well.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Can you get into a loved one’s <Accent tone="pink">phone or accounts?</Accent>
              </>
            }
          >
            <Prose>
              <p>Only through the routes the companies offer, so it helps to know them before you need them.</p>
            </Prose>
            <Points>
              <Point icon={Lock} title="A locked phone stays locked.">
                Apple says a device locked with a passcode is protected by passcode encryption, and it can’t
                help remove the passcode lock without erasing the device.
              </Point>
              <Point icon={KeyRound} title="Apple Legacy Contact.">
                If they named you, you can request access with the access key and their death certificate.
                Apple lists Messages in iCloud, iCloud Photos, Voice Memos and iCloud Backup content among the
                data you can get, and access lasts three years from Apple’s first approval.
              </Point>
              <Point icon={Shield} title="Without a Legacy Contact.">
                Apple says it needs legal documentation, generally a death certificate, and possibly a court
                order naming you as the rightful inheritor of their personal information.
              </Point>
              <Point icon={Users} title="Google and Facebook.">
                Google says that in certain circumstances it may provide content from a deceased user’s
                account, after a careful review, but it can’t provide passwords. Meta says a Facebook legacy
                contact can’t log in as the person or see their private messages.
              </Point>
            </Points>
            <Prose>
              <p>
                Our guide to{' '}
                <Link href="/guides/what-happens-to-your-photos-when-you-die">
                  what happens to your photos when you die
                </Link>{' '}
                covers each of these routes step by step, including how to set them up for yourself.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you keep the words <Accent tone="pink">that matter most?</Accent>
              </>
            }
          >
            <Prose>
              <p>You don’t need to keep every message. Choose the ones that sound like them:</p>
            </Prose>
            <Tips>
              <Tip icon={Heart}>The way they signed off every time, and the nicknames only they used.</Tip>
              <Tip icon={Laugh}>A running joke, or a photo they sent with a one-line caption that still makes you laugh.</Tip>
              <Tip icon={PenLine}>Advice they gave you, word for word, and the message you read again on hard days.</Tip>
              <Tip icon={MessageCircle}>The last messages, even the ordinary ones about lifts and shopping.</Tip>
              <Tip icon={Mic}>Voice messages and voicemails. Our guide to <Link href="/guides/how-to-save-voicemails-from-a-loved-one">saving voicemails from a loved one</Link> shows how.</Tip>
            </Tips>
            <Prose>
              <p>
                For each one, note the date and what was happening, copy the text into a document you can
                print, and keep the screenshots in a folder named after them. Then store it all the way you
                would photos: three copies, one of them away from home, as our guide to{' '}
                <Link href="/guides/how-to-back-up-family-photos">backing up family photos</Link> explains.
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
                The messages that sound like them deserve a better home than one phone. In the Ancestorii app,
                you can copy a favourite message into a family memory, with the photo it belongs with, so it
                lives with the story rather than in a chat. Screenshots upload to an album like any other
                photo, and saved voice messages can be added as voice notes, converted to M4A automatically so
                they play on any phone.
              </p>
              <p>
                Each Loved One profile tells a life in four chapters: Early years, Important moments, Special
                memories and Who they are. A message in their own words fits naturally in Who they are. The
                Free plan includes one Loved One profile; Premium, at £3.99 a month per family, includes as
                many as you need.
              </p>
              <p>
                My Family is private to the people you invite, and nothing is shared publicly unless you choose
                to publish a story on Our Stories. See how{' '}
                <Link href="/features/loved-ones">Loved One profiles</Link> work.
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
              Keep their words
              <br />
              <Accent tone="pink">with their story.</Accent>
            </>
          }
        >
          Their messages, photos and voice, in one private place your family shares.
        </GuideCta>
      </SiteShell>
    </>
  );
}
