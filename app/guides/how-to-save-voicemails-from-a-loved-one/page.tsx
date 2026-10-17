import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { Clock, MessageCircle, Mic, Phone, Smartphone, Voicemail } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { Compare, CompareRow, Point, Points, Step, Steps, Tip, Tips } from '../_components/GuideBlocks';

const PATH = '/guides/how-to-save-voicemails-from-a-loved-one';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Save Voicemails From a Loved One, for Good';
const HEADLINE = 'How to save voicemails from a loved one';
const DESCRIPTION =
  'Networks can erase voicemail and a new SIM can delete it. How to save a loved one’s voicemails and audio messages on iPhone, Android and landlines.';
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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to save voicemails from a loved one' }],
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
    q: 'Do voicemails expire?',
    a: 'Often, yes. BT Voicemail keeps saved messages for 30\u00a0days and unopened ones for 6\u00a0months, and Voicemail Essential from BT or EE keeps saved messages for 20\u00a0days. Mobile networks set their own limits, so save any message you want to keep as a file straight away.',
  },
  {
    q: 'How do I save a voicemail on my iPhone forever?',
    a: 'Open it in the Phone app, tap the Share button and choose Save to Files, or send it to yourself by email. Then copy the file to two more places, such as a computer and a cloud service. The voicemail itself lasts only until you delete it or your carrier erases it.',
  },
  {
    q: 'Can I recover a deleted voicemail?',
    a: 'Sometimes. On an iPhone, tap Deleted Messages, tap the message, then tap Undelete. But Apple warns that in some countries or regions deleted messages may be permanently erased by your carrier, and BT says a deleted voicemail can’t be retrieved.',
  },
  {
    q: 'Will I lose my voicemails if I change phone or SIM?',
    a: 'You might. Apple says your voice messages may be deleted if you change your SIM card. Save every voicemail you want to keep as a file, and check the copies play, before you switch phone, SIM or network.',
  },
  {
    q: 'How do I save a message from a landline answerphone?',
    a: 'On a BT or EE home phone, dial 1571 and play the message on speaker while a second phone records it with a voice recorder app, in a quiet room. Don’t wait: BT keeps saved messages for 30\u00a0days, or 20\u00a0days on Voicemail Essential.',
  },
];

const KEY_FACTS = [
  <>
    <strong>Networks can erase voicemail.</strong> Apple says iPhone voicemails are kept until you
    delete them, or until your carrier erases them if they aren’t stored in iCloud.
  </>,
  <>
    <strong>A new SIM can wipe it.</strong> Apple warns that voice messages may be deleted if you
    change your SIM card, and that in some regions deleted messages may be permanently erased.
  </>,
  <>
    <strong>Landline mailboxes are small.</strong> BT Voicemail holds up to 30 messages, keeping saved
    ones for 30&nbsp;days and unopened ones for 6&nbsp;months. Voicemail Essential keeps saved ones for 20&nbsp;days.
  </>,
  <>
    <strong>Audio messages vanish.</strong> On an iPhone, an audio message in Messages is deleted 2&nbsp;minutes after you listen to it unless you tap Keep, and an expired one can’t be recovered.
  </>,
  <>
    <strong>Keep three copies.</strong> US-CERT’s 3-2-1 rule: 3 copies of any important file, on 2
    different types of storage, with 1 kept away from home.
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'Apple Support',
    title: 'Check your voicemail on iPhone (iPhone User Guide, iOS 27)',
    href: 'https://support.apple.com/en-gb/guide/iphone/iph003dae603/ios',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Apple Support',
    title: 'Send and receive audio messages in Messages on iPhone',
    href: 'https://support.apple.com/en-gb/guide/iphone/iph2e42d3117/ios',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Apple Support',
    title: 'Recover deleted messages in Messages on iPhone',
    href: 'https://support.apple.com/en-gb/guide/iphone/iph16ecebf48/ios',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Phone app Help (Google)',
    title: 'How to check your voicemail',
    href: 'https://support.google.com/phoneapp/answer/2811844?hl=en-GB',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'BT',
    title: 'All about BT Voicemail',
    href: 'https://www.bt.com/help/landline/manage-service/voicemail-with-bt',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'EE',
    title: 'Home phone voicemail',
    href: 'https://ee.co.uk/help/home-phone/manage-use/voicemail-with-ee',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'WhatsApp Help Center',
    title: 'How to export your chat history',
    href: 'https://faq.whatsapp.com/1180414079177245',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Oral History Society',
    title: 'Equipment: choosing the right equipment',
    href: 'https://ohs.org.uk/for-beginners/equipment/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'US-CERT (now CISA)',
    title: 'Data Backup Options',
    href: 'https://www.cisa.gov/sites/default/files/publications/data_backup_options.pdf',
    date: '2012',
  },
  {
    publisher: 'Apple',
    title: 'iCloud Terms and Conditions',
    href: 'https://www.apple.com/uk/legal/internet-services/icloud/en/terms.html',
    date: 'last revised 14\u00a0September\u00a02026',
  },
];

// Space above a block that follows running text, and above the sources after the last section.
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function SaveVoicemailsPage() {
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
            { name: 'How to Save Voicemails From a Loved One', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <GuideArticle
          crumb="How to Save Voicemails From a Loved One"
          title={
            <>
              How to save voicemails{' '}
              <br />
              <Accent>from a loved one.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              To save a loved one’s voicemail, turn it into an audio file you own: on an iPhone, open it in
              the Phone app, tap the Share button and save it to Files, and in Google’s Phone app on Android,
              expand it and tap Send to. Then copy that file to at least two more places, because your
              network can delete voicemail and a new SIM card can wipe it.
            </Lead>
            <p>
              Do it soon. A voicemail isn’t kept like a photo in your camera roll: it can go without anyone
              pressing delete.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <PullQuote>
            Your network decides how long a voicemail lasts.{' '}
            <Accent tone="blue">A saved file lasts as long as you keep it.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                Why do voicemails <Accent tone="pink">disappear?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Because voicemail is usually held by your phone network, not by you. Networks limit how many
                messages a mailbox holds and how long they keep them, and when a message passes that limit,
                it goes. Apple adds that changing your SIM card may delete voice messages too.
              </p>
              <p>Here is what BT and EE say about their home phone voicemail:</p>
            </Prose>
            <Tips>
              <Tip icon={Phone}>BT Voicemail: up to 30 messages. Saved messages are kept for 30&nbsp;days, and unopened ones for 6&nbsp;months.</Tip>
              <Tip icon={Clock}>Voicemail Essential, from BT or EE: up to 20 messages. Saved messages are kept for 20&nbsp;days, and unheard ones for 60&nbsp;days.</Tip>
              <Tip icon={Voicemail}>EE Premium Voicemail: up to 30 messages. New messages are kept for 6&nbsp;months, and saved ones for 30&nbsp;days.</Tip>
              <Tip icon={Smartphone}>Mobile networks set their own limits, so ask yours how long it keeps a message before you rely on it.</Tip>
            </Tips>
            <Prose>
              <p>
                BT is plain about what happens after that: once a message has been deleted, there’s no way of
                retrieving it. Opening a message can shorten its life, too: on BT’s standard service, an
                unopened message is kept for 6&nbsp;months, but a saved one for 30&nbsp;days.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you save a voicemail <Accent tone="pink">on an iPhone?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                If you have Visual Voicemail, where your messages appear as a list in the Phone app, you can
                save each one as an audio file:
              </p>
            </Prose>
            <Steps>
              <Step number="01" title="Open the voicemail.">
                <p>Go to the Phone app. In the unified layout, tap Calls, then tap the message in Recents (tap the Filter button and choose Voicemails to see only voicemails). In the classic layout, tap Voicemail, then tap the message.</p>
              </Step>
              <Step number="02" title="Tap the Share button.">
                <p>Choose where it goes. Save to Files keeps a copy on your iPhone or in iCloud Drive, or send it to yourself by email or AirDrop so it lands on a computer.</p>
              </Step>
              <Step number="03" title="Keep the transcript too.">
                <p>Where a transcription is available, Apple shows it in the bottom half of the screen. Take a screenshot, so their words are saved alongside the recording.</p>
              </Step>
              <Step number="04" title="Play the saved copy.">
                <p>Open the file and listen all the way through before you delete anything from the Phone app.</p>
              </Step>
            </Steps>
            <Prose>
              <p>
                Deleted one by mistake? Tap Deleted Messages, tap the message, then tap Undelete. Apple warns
                that in some regions your carrier may already have erased it, so check today rather than
                later.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you save a voicemail <Accent tone="pink">on Android?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                It depends on your phone and your network, because Android phones come with different phone
                apps. On phones that use Google’s own Phone app, such as Pixel phones, Google’s help page gives
                these steps:
              </p>
            </Prose>
            <Steps>
              <Step number="01" title="Check visual voicemail is on.">
                <p>In the Phone app, tap More options, then Settings, then Voicemail, and turn on Visual voicemail. Not every network offers it; Google’s list includes O2.</p>
              </Step>
              <Step number="02" title="Expand the voicemail and tap Send to.">
                <p>Then choose an app, such as Google Drive or your email, to save the recording somewhere you control.</p>
              </Step>
              <Step number="03" title="Don’t switch visual voicemail off first.">
                <p>Google says turning off visual voicemail deletes the recordings from your Phone app, although your network might still keep a copy.</p>
              </Step>
            </Steps>
            <Prose>
              <p>
                Samsung and other makers have their own phone apps, and some networks have their own voicemail
                app: open the message and look for Share, Save or Export. If there’s no such option, record it
                as it plays (see below).
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What about iMessage and <Accent tone="pink">WhatsApp audio messages?</Accent>
              </>
            }
          >
            <Prose>
              <p>Audio messages sent in a chat aren’t voicemail, and they follow their own rules.</p>
            </Prose>
            <Points>
              <Point icon={MessageCircle} title="iPhone audio messages.">
                Apple deletes an audio message from the conversation 2&nbsp;minutes after you listen to it, unless
                you tap Keep. To keep them all, go to Settings, tap Apps, then Messages, tap Expire (below Audio
                Messages) and choose Never. To save one as a file, touch and hold it, then tap Save to Voice
                Memos.
              </Point>
              <Point icon={Mic} title="WhatsApp voice messages.">
                On Android, WhatsApp’s Export chat with media included attaches only the most recent media
                from that chat; on an iPhone you can choose all media or selected media. For the voice message
                that matters most, save it on its own as well: touch and hold it and look for the option to
                share it to your files.
              </Point>
            </Points>
            <Prose>
              <p>
                Our guide to{' '}
                <Link href="/guides/how-to-save-text-messages-from-a-loved-one">
                  saving text and WhatsApp messages from a loved one
                </Link>{' '}
                covers chat exports and their limits in full.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What if your phone won’t <Accent tone="pink">let you export it?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Record it as it plays. It isn’t elegant, but it works with any voicemail, any phone and any
                answerphone.
              </p>
            </Prose>
            <Steps>
              <Step number="01" title="Find a quiet room.">
                <p>Turn off the television, fans and notifications. Rest the phone that will play the message on something soft, so it doesn’t rattle.</p>
              </Step>
              <Step number="02" title="Record on a second device.">
                <p>Open a voice recorder app on another phone, or Voice Memos on an iPhone, and start recording a few seconds before the message begins.</p>
              </Step>
              <Step number="03" title="Play the message on speaker.">
                <p>For a mobile without visual voicemail, Apple’s advice for checking from another phone is to dial your own mobile number, press * or # (depending on your network) to skip your greeting, then enter your voicemail password. For a BT or EE home phone, dial 1571.</p>
              </Step>
              <Step number="04" title="Listen back before you hang up.">
                <p>Check the recording is clear and complete. If it isn’t, play the message and record it again.</p>
              </Step>
            </Steps>
            <Prose>
              <p>
                If an old answering machine still holds a message, record it in the same way, and keep the
                machine or its tape as well. If the voicemails are on your loved one’s phone rather than yours,
                read{' '}
                <Link href="/guides/what-happens-to-your-photos-when-you-die">
                  what happens to photos and accounts when someone dies
                </Link>{' '}
                for the routes Apple and Google offer families.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Where should you <Accent tone="pink">keep the recording?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Somewhere other than the phone it came from. US-CERT’s 3-2-1 rule works for a voicemail just as
                it does for photos: three copies, on two different kinds of storage, with one kept away from
                home. Our guide to{' '}
                <Link href="/guides/how-to-back-up-family-photos">backing up family photos</Link> explains how
                to set that up.
              </p>
            </Prose>
            <Compare labels={['What usually happens', 'What keeps a voice safe']}>
              <CompareRow left="Leave it in the voicemail inbox" right="Save it as a file the day you can" />
              <CompareRow left="Keep the only copy on one phone" right="Keep three copies, one of them away from home" />
              <CompareRow left="Convert it to MP3 to make it smaller" right="Keep the file exactly as it was saved" />
              <CompareRow left="Leave it named New Recording 14" right="Name it with who, what and when" />
            </Compare>
            <Prose>
              <p>
                Converting the file is a false saving. The Oral History Society notes that compressed files,
                such as MP3, can audibly degrade when they are converted to another format. If you are
                recording someone new, it recommends uncompressed PCM WAV files at 44.1kHz or 48kHz, 16-bit.
              </p>
              <p>
                Don’t rely on the phone’s own backup, either: Apple’s iCloud terms let it delete a device’s
                backups if it hasn’t backed up for 180&nbsp;days. And write a line about each recording: who left
                it, when, and why it matters.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How Ancestorii keeps a voice <Accent tone="pink">with the memory.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Once you have the file, you can upload it to Ancestorii as a voice note on an album photo, a
                timeline moment, a capsule or a private family memory, so the birthday message sits with the
                photo from that birthday. Relatives can add their own voice notes and replies, each showing
                who recorded it and when.
              </p>
              <p>
                Every new voice note is converted to M4A (AAC audio) automatically, so it plays on any phone.
                That conversion compresses the sound, so keep your original file in your own backups as well.
                Files can be up to 20&nbsp;MB each on the Free plan and 10&nbsp;GB on Premium, which costs £3.99 a month
                for the whole family.
              </p>
              <p>
                My Family is private to the people you invite, and nothing in it becomes public unless you
                choose to publish a story on Our Stories. See{' '}
                <Link href="/features/voice-notes">how voice notes work</Link>, or, if the person is still
                with you, read our guide to{' '}
                <Link href="/guides/how-to-save-family-voices">capturing family voices</Link> while you can.
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
              Save their voice
              <br />
              <Accent tone="pink">beside their story.</Accent>
            </>
          }
        >
          Add a saved voicemail as a voice note, next to the photos and memories it belongs with.
        </GuideCta>
      </SiteShell>
    </>
  );
}
