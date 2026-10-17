import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import {
  Archive,
  Baby,
  Camera,
  Ear,
  Heart,
  Layers,
  Mail,
  MessageCircleQuestion,
  PenLine,
  Phone,
  Repeat,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react';
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
  Prompt,
  Prompts,
  Step,
  Steps,
  Tip,
  Tips,
} from '../_components/GuideBlocks';

const PATH = '/guides/how-to-get-family-to-share-memories';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Get Your Family to Share Their Memories';
const HEADLINE = 'How to get your family to share their memories';
const DESCRIPTION =
  'Ask one small question at a time, meet relatives on the phone they already use and welcome different versions of a story. What works, and why.';
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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to get your family to share their memories' }],
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
    q: 'How do I get my family to share old photos?',
    a: 'Ask for one photo at a time, with a question attached, such as “What was happening here?”, instead of asking everyone to send everything. Agree on one place for the photos to go. If you use an Apple shared album, Apple says the organiser provides the iCloud storage for everything in it, unless it is set as temporary, and a temporary album expires after 30\u00a0days.',
  },
  {
    q: 'How do I get older relatives to share their stories?',
    a: 'Start small and specific, ideally with a photo in front of them, and ask open questions that need more than a yes or no answer, as the Oral History Society advises. If they would rather talk than type, record a conversation with their permission, or call them and write it up straight afterwards.',
  },
  {
    q: 'What’s the best way to collect memories from relatives who live far away?',
    a: 'Use the phone they already have. Ofcom found that 90% of UK online adults used WhatsApp in May\u00a02025, so one question at a time in the family chat is often the easiest start. Then move each answer somewhere it won’t sink under new messages, and keep a backup.',
  },
  {
    q: 'What if family members remember things differently?',
    a: 'Keep both versions instead of deciding who is right, and note who told each one and when. The differences are part of the story, because they show how each person saw it.',
  },
  {
    q: 'Is a WhatsApp group a good place to keep family memories?',
    a: 'It is a good place to ask, because nearly everyone is already there, but a poor place to keep things. Stories sink under new messages, and on Android, Google says WhatsApp backups that haven’t been updated in five months may be deleted automatically. Ask in the group, then save the answers somewhere built to last.',
  },
];

const KEY_FACTS = [
  <>
    <strong>Most families are already on WhatsApp.</strong> Ofcom’s Online Nation 2025 report found that
    90% of UK online adults used it in May&nbsp;2025, and on an average day 74% did.
  </>,
  <>
    <strong>Older relatives too.</strong> Among UK smartphone users aged 55 and over, WhatsApp was the
    most-used app in May&nbsp;2025, reaching 93% (Ofcom).
  </>,
  <>
    <strong>Some are offline.</strong> 13% of people in the UK aged 65 and over have no internet at home,
    rising to 20% of those aged 75 and over (Ofcom, 2025).
  </>,
  <>
    <strong>Ask open questions.</strong> The Oral History Society advises questions “which require more
    than a yes or no answer”.
  </>,
  <>
    <strong>Stories help children.</strong> In an Emory University study, children aged 10 to 12 in
    families that talked about hard times in more coherent, emotionally open ways coped better over two
    years.
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'Ofcom',
    title: 'Online Nation Report 2025',
    href: 'https://www.ofcom.org.uk/siteassets/resources/documents/research-and-data/online-research/online-nation/2025/online-nations-report-2025.pdf',
    date: '10\u00a0December\u00a02025',
  },
  {
    publisher: 'Oral History Society',
    title: 'Oral history and family history',
    href: 'https://ohs.org.uk/for-family-historians/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Emory University',
    title: 'How family stories help children weather hard times',
    href: 'https://news.emory.edu/stories/2020/04/how-family-stories-help-children-weather-hard-times',
    date: '29\u00a0April\u00a02020',
  },
  {
    publisher: 'Phys.org',
    title: 'Children benefit if they know about their relatives, study finds',
    href: 'https://phys.org/news/2010-03-children-benefit-relatives.html',
    date: '4\u00a0March\u00a02010',
  },
  {
    publisher: 'Journal of Family Psychology (PubMed)',
    title: 'A review of 50\u00a0years of research on naturally occurring family routines and rituals (Fiese and others)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/12561283/',
    date: '2002',
  },
  {
    publisher: 'Apple Support',
    title: 'Create shared albums in Photos on iPhone',
    href: 'https://support.apple.com/en-gb/guide/iphone/iph3d2676c9/ios',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Google One Help',
    title: 'Manage your storage in Drive, Gmail and Photos',
    href: 'https://support.google.com/googleone/answer/9312312?hl=en-GB',
    date: 'accessed October\u00a02026',
  },
];

// Space above a block that follows running text, and above the sources after the last section.
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function GetFamilyToShareMemoriesPage() {
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
            { name: 'How to Get Your Family to Share Memories', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <GuideArticle
          crumb="How to Get Your Family to Share Memories"
          title={
            <>
              How to get your family{' '}
              <br />
              <Accent>to share their memories.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              Families share memories when it is easy and specific. Ask one small question at a time instead of
              “tell me about your life”, let people answer from their phone in their own words or voice, show
              them what others have added, and welcome different versions of the same story.
            </Lead>
            <p>
              If you are starting with your own memories, begin with our guide to{' '}
              <Link href="/guides/how-to-preserve-family-memories">preserving family memories</Link>. This one
              is about getting everyone else to join in.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <PullQuote>
            Nobody can answer “tell me everything”.{' '}
            <Accent tone="blue">Everybody can answer “what was Sunday dinner like?”</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                Why do most families <Accent tone="pink">never get round to it?</Accent>
              </>
            }
          >
            <Prose>
              <p>It is rarely because nobody cares. It is usually the way the asking happens.</p>
            </Prose>
            <Points>
              <Point icon={MessageCircleQuestion} title="The question is too big.">
                “Tell me about your childhood” asks someone to sum up decades on the spot. Most people freeze, or
                say there is nothing interesting to tell.
              </Point>
              <Point icon={Archive} title="There is nowhere for it to go.">
                A story told at a birthday is gone by Monday, and one posted in the group chat sinks under the next
                hundred messages.
              </Point>
              <Point icon={Sparkles} title="People think their memories are too ordinary.">
                They assume only big events count. Emory University psychologist Robyn Fivush, who studies family
                stories, says it is “the really mundane, everyday stories” that reassure teenagers that life is
                stable.
              </Point>
              <Point icon={Users} title="It all falls on one person.">
                One relative ends up chasing everyone, and when life gets busy, it stops.
              </Point>
            </Points>
            <Prose>
              <p>
                It is worth pushing past all four. In a study Fivush ran with fellow psychologist Marshall Duke,
                children in families that talked about hard times openly and coherently coped better over two
                years, with better self-esteem and less anxiety.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What should you <Accent tone="pink">ask first?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                One small, specific question. The Oral History Society, which supports people recording memories,
                advises open questions, ones “which require more than a yes or no answer”. Specific beats general,
                because it gives people somewhere to start.
              </p>
            </Prose>
            <Compare labels={['Hard to answer', 'Easy to answer']}>
              <CompareRow left="Tell me about your childhood." right="What did you have for tea on a school night?" />
              <CompareRow left="What was Grandad like?" right="What did Grandad say every time he lost at cards?" />
              <CompareRow left="Do you remember the old house?" right="Which room in the old house can you still picture?" />
              <CompareRow left="Can you write down your life story?" right="What was your first proper job, and what did it pay?" />
            </Compare>
            <Prose>
              <p>
                Small questions add up. Emory psychologists built a 20-question “Do You Know” scale from questions
                like these, such as whether a child knows how their parents met. Teenagers who knew more of the
                answers showed higher emotional well-being, though the researchers said more research was needed.
                Five to start with:
              </p>
            </Prose>
            <Prompts>
              <Prompt
                question="What did a normal Saturday look like when you were ten?"
                context="An ordinary day is easier to describe than a special one, and full of detail."
              />
              <Prompt
                question="Who taught you to cook, and what did you make first?"
                context="Food questions work at any age and lead straight to people and places."
              />
              <Prompt
                question="Which story do we always tell about you that isn’t quite right?"
                context="It invites a correction, and you get their version in their own words."
              />
              <Prompt
                question="What was happening in this photo?"
                context="Send it with an old picture. Something to look at is easier than searching your memory cold."
              />
              <Prompt
                question="How did you and Grandma meet?"
                context="Knowing how your parents met is one of the items on Emory’s “Do You Know” scale. Ask the people who were there."
              />
            </Prompts>
            <Prose>
              <p>
                For more, our{' '}
                <Link href="/guides/questions-to-ask-your-grandparents">questions to ask your grandparents</Link>{' '}
                are grouped by theme, so you can send a different one each week.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you make it easy <Accent tone="pink">to answer from a phone?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Ask where people already are. Ofcom’s Online Nation 2025 report found that 90% of UK online adults
                used WhatsApp in May&nbsp;2025, and among smartphone users aged 55 and over it was the most-used app of
                all, at 93%. For most families, the phone in their pocket is where a question gets answered.
              </p>
            </Prose>
            <Steps>
              <Step number="01" title="Send one question, not a list.">
                <p>A list feels like homework. One question can be answered while the kettle boils.</p>
              </Step>
              <Step number="02" title="Let them talk instead of type.">
                <p>Typing a long answer on a phone is slow. A voice note takes a minute and keeps the way they tell it.</p>
              </Step>
              <Step number="03" title="Attach a photo.">
                <p>Send an old picture with “What was happening here?” It gives them something to react to.</p>
              </Step>
              <Step number="04" title="Say where it will be kept.">
                <p>Tell them who will see it and where it will live, so nobody has to wonder.</p>
              </Step>
            </Steps>
            <Prose>
              <p>
                The group chat is a fine place to ask but a poor place to keep the answers. Our comparison of{' '}
                <Link href="/compare/ancestorii-vs-whatsapp">Ancestorii and WhatsApp</Link> explains why.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What if people <Accent tone="pink">remember it differently?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                They will, and that is a good sign. Two people at the same Christmas often remember different
                things. Our founder grew up with this: in his letter about why he built Ancestorii, he remembers how
                someone would say “no, that is not what happened at all” and then tell a version that was
                “completely different but somehow just as true”.
              </p>
            </Prose>
            <Tips>
              <Tip icon={Ear}>Ask “What do you remember?”, not “Is that right?”</Tip>
              <Tip icon={Layers}>Keep both versions side by side instead of merging them into one.</Tip>
              <Tip icon={PenLine}>Note who told each version, and when.</Tip>
              <Tip icon={Heart}>If the person the story is about is still here, let them have the last word.</Tip>
            </Tips>
            <Prose>
              <p>The photo below is from our founder’s family album, and its caption is one of those stories.</p>
            </Prose>
            {/* snow.jpg is 720 by 481: at 600px wide the 5:4 frame never enlarges it, so it stays sharp. */}
            <div style={{ maxWidth: 600, marginInline: 'auto' }}>
              <GuideFigure
                src="/snow.jpg"
                alt="Dante and his sister in the snow"
                label={'She still says she won the snowball fight · March\u00a02010'}
                color="var(--c1)"
                position="50% 50%"
              />
            </div>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you keep <Accent tone="pink">people sharing?</Accent>
              </>
            }
          >
            <Prose>
              <p>People keep sharing when they can see that it mattered.</p>
            </Prose>
            <Points>
              <Point icon={Heart} title="Reply to every answer.">
                A heart, a line back or a voice note tells them it landed. Silence is what makes people stop.
              </Point>
              <Point icon={Share2} title="Share it back.">
                Read a story aloud at the next get-together, or send it to the cousin it mentions.
              </Point>
              <Point icon={Repeat} title="Make it a ritual.">
                One question every Sunday, or a new one on each birthday. A 2002 review of 50&nbsp;years of research,
                covering 32 publications, found family routines and rituals were related to parenting competence,
                children’s adjustment and marital satisfaction.
              </Point>
              <Point icon={Baby} title="Bring the children in.">
                Give a grandchild one question to ask their grandparent. It turns the asking into something they do
                together.
              </Point>
              <Point icon={Users} title="Share the load.">
                Ask a sibling or cousin to look after one side of the family.
              </Point>
            </Points>
          </GuideSection>

          <GuideSection
            title={
              <>
                How do you include relatives <Accent tone="pink">who don’t like screens?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Not everyone is online. Ofcom found that 13% of people aged 65 and over have no internet at home,
                and 20% of those aged 75 and over. Their stories matter just as much, so take the question to them.
              </p>
            </Prose>
            <Tips>
              <Tip icon={Phone}>Call and ask one question. Record it with their permission, or write it up straight afterwards while it is fresh.</Tip>
              <Tip icon={Camera}>Visit with a box of photos and ask what was happening in each one.</Tip>
              <Tip icon={Mail}>Post a letter with one question and a stamped addressed envelope.</Tip>
              <Tip icon={Users}>Ask a grandchild to type up the answer or upload the recording for them.</Tip>
            </Tips>
            <Prose>
              <p>
                The Oral History Society suggests a chat before you start recording, and reminds anyone who
                records an interview that the audio file needs to be stored and backed up. Our guide to{' '}
                <Link href="/guides/how-to-interview-your-grandparents">interviewing your grandparents</Link>{' '}
                covers recording in more detail.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How Ancestorii <Accent tone="pink">is built for this.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Ancestorii is built around these habits. Owners and Admins can invite the family with one reusable
                share link, made for the WhatsApp group, or a personal email invite that expires after 7&nbsp;days, with
                no limit on how many relatives join. See how{' '}
                <Link href="/features/invite-family">inviting your family</Link> works.
              </p>
              <p>
                In the free iPhone and Android app, you can send anyone one of 46 ready-made questions in 10
                chapters, such as “Picture Sunday dinner when you were growing up. What was it like?”, or write your
                own. Sending a question can invite the person into your family at the same time. They answer in the
                app, and you get an email when they do. Read more about{' '}
                <Link href="/features/family-questions">sending a question</Link>.
              </p>
              <p>
                Each answer becomes a memory in your family’s private feed, which only the people you invite can see.
                Family can heart it and reply in writing or with a voice note, and anyone who remembers the moment
                differently can add their own memory of it: both versions sit on one page as tabs, marked
                “2&nbsp;perspectives”. Memories with a photo, a voice note or a sentence or two of text also count towards
                family rewards in the app, including a Verified Family badge at 5 memories and 10% off a print at
                10. Premium, if you need more space, is £3.99 a month for the whole family, not per person.
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
              Ask one question.
              <br />
              <Accent tone="pink">Keep the answers.</Accent>
            </>
          }
        >
          Invite your family with one link and let their stories gather in one private place.
        </GuideCta>
      </SiteShell>
    </>
  );
}
