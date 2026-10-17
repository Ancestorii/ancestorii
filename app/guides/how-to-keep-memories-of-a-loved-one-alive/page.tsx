import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import {
  CookingPot,
  Gift,
  LifeBuoy,
  MapPin,
  Music,
  PenLine,
  Phone,
  Smartphone,
  Stethoscope,
  TreeDeciduous,
  Users,
  Wrench,
} from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import site from '@/components/site/site.module.css';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { GuideFigure, Point, Points, Prompt, Prompts, Step, Steps, Tip, Tips } from '../_components/GuideBlocks';

const PATH = '/guides/how-to-keep-memories-of-a-loved-one-alive';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Keep Memories of a Loved One Alive';
const HEADLINE = 'How to keep memories of a loved one alive';
const DESCRIPTION =
  'Save their voice and messages, write down stories while they’re fresh, mark the dates that mattered and keep talking about them. Gentle, practical ideas.';
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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to keep memories of a loved one alive' }],
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
    q: 'How can I keep my mum’s memory alive?',
    a: 'Save her voice and messages first, because they can disappear, then write down her stories and sayings while they are fresh and ask relatives for theirs. Cook her recipes, mark her birthday, and keep talking about her with the people who knew her.',
  },
  {
    q: 'Is it normal to talk to someone who has died?',
    a: 'Yes. Since the 1990s, grief researchers have argued that a continuing bond with the person who died can be part of healthy grieving, and Cruse suggests writing them a letter as one way to feel connected. If grief feels overwhelming, talk to your GP or call Cruse on 0808\u00a0808\u00a01677.',
  },
  {
    q: 'What should I do with a loved one’s voicemails?',
    a: 'Save copies straight away. Apple says iPhone voicemails can be erased by your carrier if they aren’t stored in iCloud, and may be deleted if you change SIM card. In the Phone app, open each message and tap Share to save it somewhere else, then keep it in two places.',
  },
  {
    q: 'How do I remember someone on their birthday or anniversary?',
    a: 'Choose something you can repeat each year. Cruse’s ideas include cooking their favourite food, visiting a place that was special to them, writing them a letter, planting a tree and donating to a charity they cared about. Agree on one small thing the family does together.',
  },
  {
    q: 'Where can I get bereavement support in the UK?',
    a: 'Cruse Bereavement Support’s free helpline is 0808\u00a0808\u00a01677, open Monday, Wednesday, Thursday and Friday 9.30am to 5pm and Tuesday 1pm to 8pm. Samaritans answer 116\u00a0123 free, 24\u00a0hours a day. The NHS says to see a GP if you have had a low mood for more than 2\u00a0weeks.',
  },
];

const KEY_FACTS = [
  <>
    <strong>Staying connected can be healthy.</strong> The 1996 book Continuing Bonds challenged the idea that
    grief means cutting ties, arguing that healthy grieving can include a continuing bond with the person who
    died.
  </>,
  <>
    <strong>Audio messages vanish.</strong> On iPhone, an audio message in Messages is deleted 2&nbsp;minutes after you
    listen to it unless you tap Keep (Apple).
  </>,
  <>
    <strong>Voicemails can go too.</strong> Apple says voicemails not stored in iCloud last until you delete them
    or your carrier erases them, and may be deleted if you change SIM card.
  </>,
  <>
    <strong>Unused phones lose backups.</strong> If an Android phone isn’t used for 57&nbsp;days, its Google backup,
    except photos and videos, is erased (Google).
  </>,
  <>
    <strong>Free support.</strong> Cruse Bereavement Support’s helpline,{' '}
    <a href="tel:08088081677">0808&nbsp;808&nbsp;1677</a>, is free from UK landlines and mobiles.
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'Routledge',
    title: 'Continuing Bonds: New Understandings of Grief (Klass, Silverman and Nickman)',
    href: 'https://www.routledge.com/Continuing-Bonds-New-Understandings-of-Grief/Klass-Nickman-Silverman/p/book/9781560323396',
    date: '1996',
  },
  {
    publisher: 'Cruse Bereavement Support',
    title: 'Ways to remember',
    href: 'https://www.cruse.org.uk/understanding-grief/managing-grief/ways-to-remember-someone-who-has-died/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Cruse Bereavement Support',
    title: 'Helpline',
    href: 'https://www.cruse.org.uk/get-support/helpline/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Apple Support',
    title: 'Check your voicemail on iPhone',
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
    publisher: 'Google One Help',
    title: 'Back up your device',
    href: 'https://support.google.com/googleone/answer/9149304?hl=en-GB',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Meta',
    title: 'Adding a Legacy Contact',
    href: 'https://about.fb.com/news/2015/02/adding-a-legacy-contact/',
    date: '12\u00a0February\u00a02015',
  },
  {
    publisher: 'Apple Support',
    title: 'Request access to an Apple Account as a Legacy Contact',
    href: 'https://support.apple.com/en-gb/102678',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Samaritans',
    title: 'Contact us',
    href: 'https://www.samaritans.org/how-we-can-help/contact-samaritan/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'NHS',
    title: 'Get help with grief after bereavement or loss',
    href: 'https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/grief-bereavement-loss/',
    date: 'reviewed 14\u00a0July\u00a02026',
  },
];

// Space above a block that follows running text, and above the sources after the last section.
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function KeepMemoriesOfALovedOneAlivePage() {
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
            { name: 'How to Keep Memories of a Loved One Alive', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <GuideArticle
          crumb="How to Keep Memories of a Loved One Alive"
          title={
            <>
              How to keep memories{' '}
              <br />
              <Accent>of a loved one alive.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              Keep a loved one’s memory alive by saving the things that sound and look like them, such as
              voicemails, messages and photos, writing down their stories while they are fresh and asking others
              for theirs, marking the dates that mattered, and keeping them part of family conversation.
            </Lead>
            <p>
              Since the 1990s, grief researchers have challenged the idea that “letting go” is the goal. Staying
              connected to someone who has died can be a healthy part of grieving, and these are gentle, practical
              ways to do it.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <PullQuote>
            Remembering them is not a failure to move on.{' '}
            <Accent tone="blue">It is part of how people grieve.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                Is it healthy to stay connected <Accent tone="pink">to someone who has died?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Yes. For much of the 20th century, the usual view was that grief exists to cut your ties with the
                person who died. In 1996, the book Continuing Bonds, edited by Dennis Klass, Phyllis Silverman and
                Steven Nickman, challenged that view, arguing that it rested more on cultural values than on
                evidence, and that healthy grieving can include a continuing bond with the person who died.
              </p>
              <p>
                So talking about them, keeping their things, cooking their recipes and marking their birthday are not
                signs that you are stuck. Cruse Bereavement Support says it is natural to worry about losing the
                memories you have of someone, and suggests finding concrete ways to honour them. There is no
                timetable either: the NHS says that for most people grief becomes less intense over time, but for
                some it lasts many months or years.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What should you <Accent tone="pink">save first?</Accent>
              </>
            }
          >
            <Prose>
              <p>Start with the things that can disappear without anyone choosing to delete them.</p>
            </Prose>
            <Steps>
              <Step number="01" title="Voicemails.">
                <p>
                  Apple says iPhone voicemails are kept until you delete them, or until your carrier erases them if
                  they aren’t stored in iCloud, and may be deleted if you change your SIM card. Open each one in the
                  Phone app and tap Share to save a copy somewhere else.
                </p>
              </Step>
              <Step number="02" title="Audio messages.">
                <p>
                  In Messages on iPhone, an audio message is deleted 2&nbsp;minutes after you listen to it unless you tap
                  Keep. To keep them all, go to Settings, then Apps, then Messages, and set Expire under Audio
                  Messages to Never.
                </p>
              </Step>
              <Step number="03" title="Their phone.">
                <p>
                  Google says that if an Android phone isn’t used for 57&nbsp;days, the data backed up from it, except
                  photos and videos, is erased. Copy anything you want to keep before then.
                </p>
              </Step>
              <Step number="04" title="Photos and videos.">
                <p>Gather them from everyone’s phones, not just yours, keep copies in two places, and add names and dates while people still know them.</p>
              </Step>
              <Step number="05" title="Handwriting and recipes.">
                <p>Scan or photograph cards, letters and recipe notes. Their handwriting is part of them too.</p>
              </Step>
            </Steps>
            <Prose>
              <p>
                Our guide to <Link href="/guides/how-to-save-family-voices">saving family voices</Link> covers
                recordings in more detail.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you capture their stories <Accent tone="pink">before they fade?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Write things down while they are fresh, even as rough notes: the phrase they always used, the story
                they told every Christmas. Then ask other people. Cruse suggests getting together to share stories
                and favourite memories, and says you can learn things about the person you never expected.
              </p>
            </Prose>
            <Prompts>
              <Prompt
                question="What’s a story about them you always come back to?"
                context="One story is easier to give than a description, and it shows who they were."
              />
              <Prompt
                question="What did they always say?"
                context="Write down the exact words. Sayings are quick to capture and easy to lose."
              />
              <Prompt
                question="When did you first meet them?"
                context="Friends and colleagues knew a side of them the family may never have seen."
              />
              <Prompt
                question="What did they teach you?"
                context="It is often a skill as much as a value: a recipe, a knot, a card game."
              />
            </Prompts>
            <Prose>
              <p>
                If the stories are for a funeral, our guide on{' '}
                <Link href="/guides/how-to-write-a-eulogy">how to write a eulogy</Link> shows how to shape them.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How can you remember them <Accent tone="pink">on the days that matter?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Give them a day each year. Cruse suggests choosing a day to dedicate to the person, perhaps their
                birthday. Its other ideas include:
              </p>
            </Prose>
            <Tips>
              <Tip icon={CookingPot}>Make their favourite food, from one of their recipes.</Tip>
              <Tip icon={MapPin}>Visit a place that was special to them.</Tip>
              <Tip icon={PenLine}>Write them a letter. Cruse says it can help you organise your thoughts and feel a sense of connection.</Tip>
              <Tip icon={TreeDeciduous}>Plant a tree or dedicate a bench in their name.</Tip>
              <Tip icon={Music}>Learn to play their favourite song, or make a video montage with it playing.</Tip>
              <Tip icon={Wrench}>Have something of theirs repaired, such as a ring or an old teddy.</Tip>
              <Tip icon={Gift}>Donate to a charity that mattered to them.</Tip>
            </Tips>
            <Prose>
              <p>
                People in the same family may want different things on the same day. Agree on one small thing
                everyone can join, and let each person mark the rest in their own way.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What happens to their <Accent tone="pink">social media and photos?</Accent>
              </>
            }
          >
            <Prose>
              <p>Each service has its own rules, and some have time limits.</p>
            </Prose>
            <Points>
              <Point icon={Users} title="Facebook.">
                A profile can be memorialised, with “Remembering” shown above the name. When Facebook introduced
                legacy contacts in 2015, it said the person chosen can pin a post to the top of the profile, respond
                to new friend requests and update the profile and cover photos, and download an archive if allowed,
                but cannot log in or read private messages.
              </Point>
              <Point icon={Smartphone} title="Apple.">
                If they made you a Legacy Contact, you can request access to their Apple Account with the access key
                they created and a death certificate. Access lasts three years from Apple’s approval, then the account
                is permanently deleted, so download what you want to keep.
              </Point>
            </Points>
            <Prose>
              <p>
                Our guide to{' '}
                <Link href="/guides/what-happens-to-your-photos-when-you-die">
                  what happens to your photos when you die
                </Link>{' '}
                covers iCloud, Google Photos and Facebook in more detail.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Where can you <Accent tone="pink">find support?</Accent>
              </>
            }
          >
            <Points>
              <Point icon={Phone} title="Cruse Bereavement Support.">
                A free helpline on{' '}
                <a href="tel:08088081677" className={site.textLink}>
                  0808&nbsp;808&nbsp;1677
                </a>{' '}
                for anyone in the UK affected by grief, open Monday, Wednesday,
                Thursday and Friday 9.30am to 5pm and Tuesday 1pm to 8pm, closed at weekends. You can also contact
                Cruse through its website at any time.
              </Point>
              <Point icon={LifeBuoy} title="Samaritans.">
                If you are struggling right now, call{' '}
                <a href="tel:116123" className={site.textLink}>
                  116&nbsp;123
                </a>, free from any phone, 24&nbsp;hours a day, every day of the year.
              </Point>
              <Point icon={Stethoscope} title="Your GP.">
                The NHS says to see a GP if you are struggling to cope, have had a low mood for more than 2&nbsp;weeks, or
                the things you are trying are not helping. If you are 18 or over (16 in some areas), you can also
                refer yourself to NHS talking therapies.
              </Point>
            </Points>
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
                Give them a <Link href="/features/loved-ones">Loved One profile</Link> in your family’s private space:
                their name, photo, relationship and dates, and their life told in four chapters, Early years,
                Important moments, Special memories and Who they are, each with guiding questions. Invite relatives
                into the family space to add their own memories of them. When two people remember the same moment
                differently, both versions sit side by side on one page.
              </p>
              <p>
                Upload a saved voicemail as a voice note on the photo it belongs with, so their voice sits next to
                their face. You can also seal a <Link href="/features/digital-time-capsule">capsule</Link> of
                letters, photos and recordings to open on a birthday or anniversary. No notification is sent when it
                opens, so note the date.
              </p>
              <p>
                Some families also turn the photos and stories into a printed{' '}
                <Link href="/memory-books">Memory Book</Link>, from £44.99 plus delivery. Andrea, from Dudley, made one after losing her dad: “It captured the essence of him
                and the life he lived.” The Free plan includes one Loved One profile; Premium, £3.99 a month for the
                whole family, covers as many as you need.
              </p>
            </Prose>
            {/* testimonial4.png is 639 by 655: at 639px wide the 5:4 frame never enlarges it, so it stays sharp. */}
            <div style={{ maxWidth: 639, marginInline: 'auto' }}>
              <GuideFigure
                src="/testimonial4.png"
                alt="Andrea holding her printed Ancestorii Memory Book about her dad"
                label="Andrea · Dudley, UK"
                color="var(--c3)"
                position="50% 35%"
              />
            </div>
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
              Keep their stories.
              <br />
              <Accent tone="pink">Keep their voice.</Accent>
            </>
          }
        >
          Give them a page of their own, and let the whole family add what they remember.
        </GuideCta>
      </SiteShell>
    </>
  );
}
