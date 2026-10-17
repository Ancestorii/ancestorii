import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { Mail, MessageCircleQuestionMark, Send, Smartphone } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent } from '@/components/site/SiteBits';
import site from '@/components/site/site.module.css';
import {
  ArticleCta,
  ArticleHero,
  ArticleSection,
  CheckList,
  CompareTable,
  FaqBlock,
  NumberedPanels,
  QuoteBlock,
  Reading,
  TableNote,
} from '@/components/site/seo-articles/ArticleBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';

const PATH = '/features/family-questions';
const TITLE = 'Send Grandparents a Question to Answer in the App';
const DESCRIPTION =
  'Send Mum or Grandad one of 46 ready-made questions from the Ancestorii app. They answer on their phone, and you get an email when the answer arrives.';
const HEADLINE = 'Send a question, get a story back';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    title: `${TITLE} | Ancestorii`,
    description: DESCRIPTION,
    url: `${SITE_URL}${PATH}`,
    siteName: 'Ancestorii',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Send a family member a question in the Ancestorii app' }],
    locale: 'en_GB',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | Ancestorii`,
    description: DESCRIPTION,
    images: ['/og-default.jpg'],
  },
};

// Chapter names, counts and questions are quoted from the live question library
// (memory_prompt_chapters / memory_prompts, 46 questions in 10 chapters, October 2026).
const CHAPTERS = [
  ['Growing Up (6)', 'Think back to where you grew up. What do you still picture when it comes to mind?'],
  ['Holidays & Traditions (5)', 'Every family’s got something that would completely baffle an outsider. What’s ours?'],
  ['Around the Table (5)', 'Picture Sunday dinner when you were growing up. What was it like?'],
  ['Love & Relationships (4)', 'Every couple’s got a how-we-met story. Do you know the one for your parents or grandparents?'],
  ['Life Lessons (5)', 'If you could sit down with yourself at twenty, what would you say?'],
  ['The Stories We Retell (4)', 'You know how some stories get told a little differently by everyone? Which one’s that for us?'],
  ['Work & Purpose (4)', 'You never quite forget the first proper job. What was yours?'],
  ['Adventures & Travel (4)', 'Every family came from somewhere before here. Do you know where ours started?'],
  ['Only You Would Know (5)', 'You know how a certain smell or sound just drops you back somewhere? Which one does that to you?'],
  ['Music & Hobbies (4)', 'There’s always a song that brings someone straight to mind. Which one, and who?'],
];

const STEPS = [
  {
    number: '01',
    title: 'Choose a question.',
    body: 'Open the Ancestorii app on your iPhone or Android phone and pick one of the 46 ready-made questions, grouped into 10 chapters, or write one of your own.',
    Icon: MessageCircleQuestionMark,
  },
  {
    number: '02',
    title: 'Send it as a link.',
    body: 'The question travels as a short ancestorii.com/q/ link. If they have the app, it opens there. If not, their phone goes to the App Store or Google Play, and a computer shows a code to enter once the app is installed.',
    Icon: Send,
  },
  {
    number: '03',
    title: 'They answer in the app.',
    body: 'They answer in their own words in the free Ancestorii app, whenever it suits them. If they already use the app and haven’t answered after 24 hours, they get one reminder.',
    Icon: Smartphone,
  },
  {
    number: '04',
    title: 'You get an email.',
    body: 'Their answer is saved in your family’s private feed, marked ‘In response to’ your question, and you get an email saying they answered, with a button to read it.',
    Icon: Mail,
  },
];

const FAQ = [
  {
    q: 'Does the person I ask need to download the app?',
    a: 'Yes. Questions can only be answered in the Ancestorii app, which is free on iPhone and Android. If they don’t have it yet, the question link sends their phone to the App Store or Google Play, and on a computer it shows a code to enter once the app is installed.',
  },
  {
    q: 'Can I write my own question?',
    a: 'Yes. As well as the 46 ready-made questions in 10 chapters, you can write your own in the app. The email you get when it is answered quotes whichever question you sent.',
  },
  {
    q: 'How long does a question link stay open?',
    a: 'Question links are time-limited, so send one when the person is likely to have a few quiet minutes. If a link runs out before they get to it, send the question again.',
  },
  {
    q: 'Where do the answers go?',
    a: 'Each answer is saved as a memory in your family’s private My Family feed, marked ‘In response to’ your question. Only people invited into your family space can see it, and you get an email when it arrives.',
  },
  {
    q: 'Can I send questions from the website?',
    a: 'No. Sending and answering questions both happen in the Ancestorii app. The website is where you order printed keepsakes, change your plan and use Our Stories, the public story feed.',
  },
];

const SOURCES = [
  {
    publisher: 'Psychotherapy, via Europe PMC',
    title: 'Duke, Lazarus and Fivush: Knowledge of family history as a clinically useful index of psychological well-being and prognosis',
    href: 'https://europepmc.org/article/MED/22122420',
    date: '2008',
  },
  {
    publisher: 'Storyworth',
    title: 'Storyworth UK homepage: how weekly questions and replies work',
    href: 'https://welcome.storyworth.com/gb',
    date: 'accessed October 2026',
  },
  {
    publisher: 'Remento',
    title: 'Frequently asked questions',
    href: 'https://www.remento.co/faq',
    date: 'accessed October 2026',
  },
];

// Ways to make an answer more likely, shown as a check list after the reply section's text.
const ANSWER_TIPS = [
  <>
    <strong>Set up the app with them the first time.</strong> A short visit or video call to install
    it and open the first question together takes away the hardest part.
  </>,
  <>
    <strong>Start with a gentle chapter.</strong> Around the Table and Growing Up ask about food and
    childhood, which are easy places to begin.
  </>,
  <>
    <strong>Send one question at a time.</strong> One question feels like a conversation. A list of
    ten feels like a form.
  </>,
];

// Space above a block that follows long text (the same step the article kit uses after a check list).
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };

export default function FamilyQuestionsPage() {
  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            path: PATH,
            headline: HEADLINE,
            description: DESCRIPTION,
            datePublished: '2026-10-17',
            dateModified: '2026-10-17',
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Features', path: '/features' },
            { name: 'Family questions', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[
            { href: '/', label: 'Home' },
            { href: '/features', label: 'Features' },
            { label: 'Family questions' },
          ]}
          size="md"
          title={
            <>
              Send a question, <Accent>get a story back.</Accent>
            </>
          }
          intro={[
            'In the Ancestorii app, you choose one of 46 ready-made questions, or write your own, and send it to a relative as a link. They answer in the free app on their iPhone or Android phone, the answer arrives as a memory in your family’s private feed, and you get an email when it does.',
            'There is no weekly schedule to sign up to. You send a question when you want one answered, to whoever you want to hear from, and the answer is kept with the rest of your family’s memories rather than lost in a message thread.',
          ]}
          cta={{ href: '/signup', label: 'Start For Free' }}
        />

        {/* The quotable facts, beside why a small question works */}
        <ArticleSection
          aside={
            <KeyFacts
              items={[
                <>
                  <strong>46 ready-made questions</strong> in 10 chapters, from Growing Up to Music &amp;
                  Hobbies, or you can write your own.
                </>,
                'Questions are sent from the iPhone or Android app as a time-limited link. On a phone without the app, the link opens the App Store or Google Play.',
                <>
                  Questions are answered <strong>in the app only</strong>. There is no answer page on the
                  website.
                </>,
                'Each answer becomes a memory in your private My Family feed, marked ‘In response to’ your question, and you get an email when it arrives.',
                'If someone who already uses the app hasn’t answered after 24 hours, they get one reminder notification.',
                'A question can double as an invitation, bringing the person into your family space.',
              ]}
            />
          }
        >
          <Reading>
            <p>
              Asking a parent or grandparent about their life sounds simple, and it is easy to keep
              putting off. Phone calls drift to the weather and the news. Visits fill up with catching
              up. And a question as big as ‘tell me about your childhood’ is hard to answer on the spot,
              so it tends to get a short reply and a change of subject.
            </p>
            <p>
              A smaller, specific question is easier to say yes to. ‘Picture Sunday dinner when you were
              growing up. What was it like?’ can be answered in a few minutes, at the kitchen table,
              whenever the person has a quiet moment.
            </p>
            <p>
              Questions in Ancestorii are built on that idea: one question at a time, answered in the
              person’s own words, and kept somewhere the whole family can find it.
            </p>
          </Reading>
        </ArticleSection>

        {/* How it works */}
        <ArticleSection
          id="how-it-works"
          layout="wide"
          kicker="Step by step"
          dot="var(--c1)"
          title={
            <>
              How does sending <Accent tone="blue">a question work?</Accent>
            </>
          }
        >
          <NumberedPanels items={STEPS} />
        </ArticleSection>

        <QuoteBlock>
          A big question gets a short answer. <Accent tone="blue">A small one gets a story.</Accent>
        </QuoteBlock>

        {/* The question library */}
        <ArticleSection
          id="question-library"
          kicker="The question library"
          dot="var(--c2)"
          title={
            <>
              Which questions <Accent tone="pink">can you choose?</Accent>
            </>
          }
        >
          <CompareTable
            head={['Chapter (questions)', 'One of its questions']}
            rows={CHAPTERS}
            highlight={1}
            size="fit"
            labelledBy="question-library-title"
          />
          <TableNote>
            The number beside each chapter is how many of the 46 questions it holds. Every example is
            quoted from the app as of October&nbsp;2026. For more to ask in person, see our{' '}
            <Link href="/guides/questions-to-ask-your-parents-about-their-life" className={site.textLink}>
              questions to ask your parents about their life
            </Link>
            .
          </TableNote>
        </ArticleSection>

        {/* Does the person need the app? */}
        <ArticleSection
          id="needs-the-app"
          kicker="Answering"
          dot="var(--c1)"
          title={
            <>
              Does the person answering <Accent tone="blue">need the app?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Yes. Questions are answered in the Ancestorii app, which is free on iPhone and Android, and
              there is no way to answer on the website. If the person has never used the app, the link
              takes their phone straight to the right store. On a computer, it shows the code for that
              question, so they can find it once the app is installed.
            </p>
            <p>
              That is a real difference from the services built around email and text messages. As of
              October&nbsp;2026, Storyworth sends weekly questions by text or email, and storytellers reply by email, by
              recording their voice over the phone, or on its website. Remento sends a storytelling prompt
              by email or text message, once a week by default, and storytellers record by clicking the
              link, with no app to download and no password to remember.
            </p>
            <p>
              If the person you want to hear from will never install an app, one of those may suit them
              better; our <Link href="/compare/storyworth-alternative">Storyworth alternative</Link> and{' '}
              <Link href="/compare/remento-alternative">Remento alternative</Link> pages set out the
              differences. If they do have a smartphone, the app’s advantage is where the answer lands: in
              your family’s private space, next to your photos and voice notes, where the rest of the
              family can read it too.
            </p>
          </Reading>
        </ArticleSection>

        {/* What happens to the answer */}
        <ArticleSection
          id="the-answer"
          kicker="The answer"
          dot="var(--c3)"
          title={
            <>
              What happens <Accent tone="pink">to the answer?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              The answer is saved as a memory in your family’s private My Family feed. At the top it shows
              ‘In response to’ and the question you asked, so anyone reading it years from now knows what
              prompted it. Only the people you have invited into your family space can see it. It does not
              appear on Our Stories or in search results.
            </p>
            <p>
              You get an email headed with their name and ‘answered your question’. It quotes the question
              you asked and has a button to read their memory. From there it behaves like any other memory
              in the feed. Family can leave a heart or a comment, and anyone who remembers the moment
              differently can choose ‘Add your memory of this moment’ to add their own version, with up to
              10 photos.
            </p>
            <p>
              Each version sits on the same page as its own tab, so one question about Sunday dinner can
              end up holding three people’s memories of the same table. Read more about how the{' '}
              <Link href="/features/private-family-feed">private My Family feed</Link> works.
            </p>
          </Reading>
        </ArticleSection>

        {/* No reply */}
        <ArticleSection
          id="no-reply"
          kicker="No answer yet?"
          dot="var(--c2)"
          title={
            <>
              What if <Accent tone="blue">they don’t reply?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              If they already use the app and haven’t answered after 24&nbsp;hours, Ancestorii sends them
              one reminder notification. It only ever sends one, so nobody gets nagged. Question links
              are time-limited, so if a link runs out before they get to it, send the question again.
            </p>
            <p>A few things make an answer more likely:</p>
          </Reading>
          <div style={STACK_GAP}>
            <CheckList items={ANSWER_TIPS} />
          </div>
        </ArticleSection>

        {/* Why ask */}
        <ArticleSection
          id="why-ask"
          kicker="Why it matters"
          dot="var(--c0)"
          title={
            <>
              Why ask family <Accent tone="pink">questions at all?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Partly because the answers do not keep on their own. The name of the village, the reason the
              family moved, the song that was always on in the kitchen: details like these live in one
              person’s memory until somebody asks.
            </p>
            <p>
              There is research behind the habit too. In a 2008 brief report in the journal
              Psychotherapy, Marshall Duke of Emory University’s Department of Psychology and his
              co-authors Amber Lazarus and Robyn Fivush found that children’s and adolescents’
              knowledge of their family history was linked with an internal locus of control, higher
              self-esteem, better family functioning, lower anxiety and fewer behaviour problems. The
              study shows a link, not cause and effect, but it is a good reason to collect the stories
              while the people who hold them can still tell them.
            </p>
            <p>
              If you would rather ask face to face, our guide to{' '}
              <Link href="/guides/questions-to-ask-your-grandparents">questions to ask your grandparents</Link>{' '}
              has plenty more to start with.
            </p>
          </Reading>
        </ArticleSection>

        {/* Honest fit */}
        <ArticleSection
          id="where-ancestorii-helps"
          kicker="Honestly"
          dot="var(--c1)"
          title={
            <>
              Where Ancestorii helps, <Accent tone="blue">and where it doesn’t.</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Questions are one part of the private side of Ancestorii, called My Family. The same app
              holds your family’s memories, albums, timelines and voice notes, so an answer to ‘Every
              family came from somewhere before here. Do you know where ours started?’ can sit beside the
              photos of the place itself. You can start on the Free plan, which includes 1&nbsp;GB of
              family storage, or move to Premium, which is £3.99 a month for the whole family and includes
              100&nbsp;GB.
            </p>
            <p>
              What it does not do: it does not send questions on a schedule for you, it does not work by
              email or text alone, and it does not turn answers into a book by itself. If you want the
              stories on paper, you design a printed <Link href="/memory-books">Memory Book</Link>{' '}
              yourself, from £44.99 plus delivery.
            </p>
          </Reading>
        </ArticleSection>

        {/* FAQ */}
        <ArticleSection
          id="faq"
          kicker="Questions"
          dot="var(--c3)"
          title={
            <>
              Things people <Accent tone="pink">ask us.</Accent>
            </>
          }
        >
          <FaqBlock items={FAQ} variant="open" />
        </ArticleSection>

        {/* Sources and author */}
        <ArticleSection>
          <Sources items={SOURCES} />
          <div className={site.sectionBody}>
            <AuthorBox updated="17 October 2026" />
          </div>
        </ArticleSection>

        <ArticleCta
          title={
            <>
              A question today.
              <br />
              A story to keep.
            </>
          }
          lead="Start free on the website, then send your first question from the Ancestorii app on iPhone or Android."
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
