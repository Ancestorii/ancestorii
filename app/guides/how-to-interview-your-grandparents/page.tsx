import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Ear, Heart, Images, MessageCircleQuestion, Pause } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { Compare, CompareRow, Point, Points, Step, Steps } from '../_components/GuideBlocks';

const PATH = '/guides/how-to-interview-your-grandparents';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Interview Your Grandparents and Record It';
const HEADLINE = 'How to interview your grandparents and record it well';
const DESCRIPTION =
  'Agree one theme, ask open questions, record WAV with a clip-on mic and agree in writing how it will be used. Oral History Society advice for families.';
const PUBLISHED = '2026-10-17';
const CRUMB = 'How to Interview Your Grandparents';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to interview your grandparents' }],
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
    q: 'Should I record my grandparents on my phone?',
    a: 'The Oral History Society and the British Library don’t recommend phones for oral history, because most record severely compressed audio and phones are easily lost or stolen. A recorder that saves uncompressed WAV files, with a tie-clip microphone, is better. If a phone is all you have, use it rather than miss the story, and copy the file somewhere safe the same day.',
  },
  {
    q: 'What questions should I ask my grandparents in an interview?',
    a: 'Open questions that need more than a yes or no answer, on one theme at a time: the house they grew up in, school, their first job, how they met. Keep each question short, wait for a pause before the next one, and follow up with ‘Why?’ and ‘How did you feel?’, as the Oral History Society suggests.',
  },
  {
    q: 'Do I need permission to record my grandparents?',
    a: 'Always ask first, and explain why you are recording, where it will be kept and how it will be used. The Oral History Society recommends a Joint Statement of Intent, filled in by both of you after the recording, setting out its purpose, who owns the copyright and any limits on access. This is guidance, not legal advice.',
  },
  {
    q: 'Can I record a phone call with my grandparents?',
    a: 'On an iPhone, in some countries and regions (not the European Union), you can record a call with one other person. You both hear an audio notice, and the recording is saved in the Notes app. Apple says to make sure the other person is willing to be recorded.',
  },
  {
    q: 'What should I do with the recording afterwards?',
    a: 'Make backup copies the same day, ideally on more than one external hard drive, and write a short summary of what was said, with rough times. Keep the signed agreement and their full name and date of birth with the recording, then thank them and give them a copy.',
  },
];

const KEY_FACTS = [
  <>
    Ask <strong>open questions</strong>, ones that need more than a yes or no answer (Oral History
    Society).
  </>,
  <>
    Before you record, explain the <strong>purpose</strong>, where it will be <strong>stored</strong> and
    how you plan to <strong>use</strong> it.
  </>,
  <>
    For one-to-one interviews indoors, the best microphone is a <strong>small tie-clip or lapel mic</strong>.
  </>,
  <>
    Record <strong>uncompressed WAV</strong> files at 44.1kHz or 48kHz, 16-bit.
  </>,
  <>
    The British Library and the Oral History Society <strong>don’t recommend phones</strong>: most record
    severely compressed audio.
  </>,
  <>
    Afterwards, you both fill in a <strong>Joint Statement of Intent</strong> covering the purpose,
    copyright and who can listen.
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'Oral History Society',
    title: 'Oral history and family history',
    href: 'https://ohs.org.uk/for-family-historians/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Oral History Society',
    title: 'Choosing the right equipment',
    href: 'https://ohs.org.uk/for-beginners/equipment/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Oral History Society',
    title: 'Interviewing',
    href: 'https://ohs.org.uk/for-beginners/interviewing/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Oral History Society',
    title: 'After the interview',
    href: 'https://ohs.org.uk/for-beginners/after-the-interview/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Oral History Society',
    title: 'Interviewing at a distance (remote recording advice, version 7)',
    href: 'https://ohs.org.uk/covid-19-remote-recording/',
    date: '8\u00a0February\u00a02021',
  },
  {
    publisher: 'Oral History Society',
    title: 'Is your oral history legal and ethical?',
    href: 'https://ohs.org.uk/legal-and-ethical-advice/',
    date: '2019',
  },
  {
    publisher: 'Apple Support',
    title: 'Record and transcribe a call on iPhone',
    href: 'https://support.apple.com/en-gb/guide/iphone/iph57c6590e9/ios',
    date: 'accessed October\u00a02026',
  },
];

// Room above the key facts and the author box, and above the sources (a section's step).
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function HowToInterviewYourGrandparentsPage() {
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
              How to interview{' '}
              <br />
              <Accent>your grandparents.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              To interview your grandparents, agree a time and one theme, record in a quiet room with a clip-on microphone, ask open questions and let them talk. Save the recording as an uncompressed WAV file, then agree together, in writing, how it can be used and shared.
            </Lead>
            <p>
              Here is how to prepare, what to record with, how to ask and what to do with the recording, based on advice from the Oral History Society.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <GuideSection
            title={
              <>
                How do you prepare <Accent tone="pink">for the interview?</Accent>
              </>
            }
          >
            <Steps>
              <Step number="01" title="Ask them, and explain why.">
                <p>Tell them you want the family to keep their stories, and let them pick a time when they won’t be tired or rushed.</p>
              </Step>
              <Step number="02" title="Choose one theme.">
                <p>Childhood, work, how they met, the war years. A whole life is too much for one sitting. One theme is plenty, the tangents are often the best part, and you can come back for the next.</p>
              </Step>
              <Step number="03" title="Do your homework.">
                <p>Look through photos and papers first. Jot down the names, places and dates you want to ask about, and keep a list of spellings to check at the end.</p>
              </Step>
              <Step number="04" title="Pick a quiet room.">
                <p>The Oral History Society suggests a room that isn’t on a busy road, with the radio and television switched off. Its advice for remote interviews adds a softly furnished, comfortable space; hard kitchens echo.</p>
              </Step>
              <Step number="05" title="Say how it will be used.">
                <p>Before you press record, the Society says to explain the purpose of the recording, that it will be stored (by you or in an archive) and how you plan to use it, and that you will ask them to sign a form at the end.</p>
              </Step>
            </Steps>
          </GuideSection>

          <GuideSection
            title={
              <>
                What equipment <Accent tone="pink">do you need?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Better equipment than you might expect, because their voice matters as much as their words (see{' '}
                <Link href="/guides/how-to-save-family-voices">how to save family voices</Link>). The Oral History Society is blunt: if a recorder costs £20, it is unlikely to make audible recordings, so buy the best you can for your budget. For one-to-one interviews indoors, it says the best external microphone is a small tie-clip or lapel mic, and the recorder should save uncompressed PCM WAV files at 44.1kHz or 48kHz, 16-bit.
              </p>
              <p>
                Phones are the sticking point. The British Library and the Oral History Society don’t recommend them, because most phones record severely compressed audio, keeping as little as a twentieth of the original data, and because phones are easily lost or stolen. If a phone is all you have, use it rather than lose the story, and copy the file somewhere safe the same day.
              </p>
            </Prose>
            <Compare labels={['Avoid', 'Do instead']}>
              <CompareRow left="A phone propped up on the table" right="A recorder with a tie-clip mic on their collar" />
              <CompareRow left="Compressed audio, like most phone recordings" right="Uncompressed WAV at 44.1kHz or 48kHz, 16-bit" />
              <CompareRow left="The only copy left on the recorder" right="Copies on more than one external hard drive" />
            </Compare>
            <Prose>
              <p>
                Do a one-minute test first and play it back on headphones, to catch a humming fridge or a ticking clock you stopped hearing years ago.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you ask questions <Accent tone="pink">that get stories?</Accent>
              </>
            }
          >
            <Points>
              <Point icon={MessageCircleQuestion} title="Ask open questions.">
                The Oral History Society tells family historians to ask open questions, ones that need more than a yes or no. ‘Did you like school?’ gets one word. ‘What was your walk to school like?’ gets a street, a season and a friend.
              </Point>
              <Point icon={Ear} title="Keep questions short, then listen.">
                The Society’s interviewing advice is to keep questions short and clear, not to interrupt and not to ask too many. Nod instead of saying ‘yes’ over their answers, so the recording is their voice, not yours.
              </Point>
              <Point icon={Pause} title="Wait for the pause.">
                Always wait for a pause before the next question, as the Society puts it. Silence feels long to you. To them it is thinking time, and the best detail often comes just after it.
              </Point>
              <Point icon={Heart} title="Ask why, and how it felt.">
                Facts are the start. The Society suggests exploring motives and feelings with ‘Why?’ and ‘How did you feel?’.
              </Point>
              <Point icon={Images} title="Bring something to hold.">
                A photograph, a wedding invitation or an old payslip gives them something to talk about other than themselves. Ask ‘What was happening here?’ rather than ‘Do you remember this?’.
              </Point>
            </Points>
            <Prose>
              <p>
                For questions to bring, see{' '}
                <Link href="/guides/questions-to-ask-your-grandparents">questions to ask your grandparents</Link>, with sets for each decade from rationing to Decimal Day.
              </p>
            </Prose>
          </GuideSection>

          <PullQuote>
            Ask a short question,{' '}
            <Accent tone="blue">then let the silence do the work.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                Can you interview them <Accent tone="pink">by phone or video call?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                You can, but treat it as second best. In its remote recording advice, written during the pandemic, the Oral History Society notes that oral historians have traditionally favoured face-to-face interviews and discouraged remote ones. If distance leaves no choice, it advises against the recording buttons built into video-call apps, which tend to make poor-quality files. Better is a ‘double-ender’, where each person’s audio is recorded at their own end, ideally with external microphones and both of you wearing headphones.
              </p>
              <p>
                For a quick phone call, an iPhone can help. Apple says that in some countries and regions you can record a call with one other person. Both of you hear an audio notice that the call is being recorded, and the recording is saved to a Call Recordings folder in the Notes app, with a transcript in some languages. It isn’t available in the European Union, and Apple’s own advice is to make sure the other person is willing to be recorded. Ask first, every time.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What should you agree <Accent tone="pink">before sharing it?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Who can listen, and to what. The Oral History Society recommends a Joint Statement of Intent: a short form that sets out the purpose of the interview, who owns the copyright and any restrictions on access. It strongly recommends that you both fill it in after the recording is complete, and that a copy stays with the recording at all times. The Society publishes a sample for family researchers on its website.
              </p>
              <p>
                Talk about the awkward parts too. If a family secret might come up, the Society suggests discussing in advance how you will handle it. Agree whether the recording stays with close family, can go to cousins, or can ever go online. If you plan to share it beyond the family, read the Society’s guide, ‘Is your oral history legal and ethical?’. Nothing here is legal advice.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What do you do with <Accent tone="pink">the recording afterwards?</Accent>
              </>
            }
          >
            <Steps>
              <Step number="01" title="Make copies the same day.">
                <p>Copy the file off the recorder or phone and back it up. The Oral History Society says several external hard drives are now favoured over CDs and DVDs for long-term storage, and that a memory stick for the family is handy but isn’t an archival copy.</p>
              </Step>
              <Step number="02" title="Write a summary.">
                <p>The Society calls a written summary of the interview the minimum, and full transcription hugely time-consuming. Note the rough time of each story, such as ‘14:20, moving to Leeds’, so anyone can find it.</p>
              </Step>
              <Step number="03" title="Keep their details with it.">
                <p>Give each person a file with their full name and date of birth, as the Society suggests, plus the date of the recording and the signed form.</p>
              </Step>
              <Step number="04" title="Say thank you, and share it.">
                <p>Thank them, give them a copy and play a favourite part to the family. The Society also suggests offering a copy to your local library or archive.</p>
              </Step>
            </Steps>
            <Prose>
              <p>
                If older recordings of them turn up on tape, see{' '}
                <Link href="/guides/how-to-digitize-cassette-tapes">how to digitise cassette tapes</Link>. For everyday ways to catch stories outside a formal interview, see{' '}
                <Link href="/guides/how-to-record-family-stories">how to record family stories</Link>.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How Ancestorii helps <Accent tone="pink">between interviews.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                A planned interview is an occasion, and plenty of stories come out in smaller moments. Between visits, you can send your grandparents one question at a time from the Ancestorii app. There are 46 ready-made questions in 10 chapters, such as ‘Picture Sunday dinner when you were growing up. What was it like?’, or you can write your own. They answer in the free iPhone or Android app, you get an email when they do, and the answer becomes a memory in your family’s private feed, where a cousin can add their own version of the same moment. See{' '}
                <Link href="/features/family-questions">how family questions work</Link>.
              </p>
              <p>
                You can also add short clips from the interview as{' '}
                <Link href="/features/voice-notes">voice notes</Link> on the memory or album photo they belong to. Ancestorii converts voice notes to M4A so they play on any phone, which is one more reason to keep the full WAV file in your own backups. Only the people you invite into your family space can see or hear any of it. If your grandparents don’t use a smartphone, ask the question in person and add their answer yourself.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions about <Accent tone="pink">interviewing grandparents.</Accent>
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
              Their stories,
              <br />
              <Accent tone="pink">in their own voice.</Accent>
            </>
          }
        >
          Keep the answers, the clips and the photos together, where only your family can find them.
        </GuideCta>
      </SiteShell>
    </>
  );
}
