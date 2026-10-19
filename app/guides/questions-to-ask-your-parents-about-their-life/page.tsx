import type { Metadata } from 'next';
import { Baby, Briefcase, Heart, Lightbulb, TreeDeciduous } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { QuestionSet, QuestionSets, Step, Steps } from '../_components/GuideBlocks';

const PATH = '/guides/questions-to-ask-your-parents-about-their-life';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Questions to Ask Your Parents About Their Life';
const DESCRIPTION =
  'Thirty questions to ask your parents and grandparents about their lives, grouped by theme, plus how to have the conversation before the stories are gone.';
const PUBLISHED = '2026-06-20';
const MODIFIED = '2026-06-20';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `${TITLE} | Ancestorii`,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: 'Ancestorii',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Questions to ask your parents about their life' }],
    locale: 'en_GB',
    type: 'article',
    publishedTime: PUBLISHED,
    modifiedTime: MODIFIED,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | Ancestorii`,
    description: DESCRIPTION,
    images: ['/og-default.jpg'],
  },
};

// Thirty questions in all (five themes of six). The copy says "Thirty" in the metadata, the
// Article schema, the section heading and the card on /guides: change those with the count.
const SETS = [
  {
    title: 'Childhood and the early years',
    questions: [
      'Where did you grow up, and what was the house like?',
      'What is your earliest memory?',
      'Who were your friends, and what did you do together?',
      'What were your parents like when you were small?',
      'Was there a place you loved to go as a child?',
      'What did a normal day look like when you were ten?',
    ],
  },
  {
    title: 'Family and where we come from',
    questions: [
      'Where did our family originally come from?',
      'What do you remember about your grandparents?',
      'Are there any family stories that got passed down to you?',
      'What was your mother like? What was your father like?',
      'Is there a relative you wish I had been able to meet?',
      'What traditions did your family keep, and where did they come from?',
    ],
  },
  {
    title: 'Love and the people who mattered',
    questions: [
      'How did you and Mum or Dad meet?',
      'What did you think the first time you saw them?',
      'What was your wedding day actually like?',
      'Who was your best friend over the years?',
      'What does a good marriage take, in your experience?',
      'Is there someone who shaped the person you became?',
    ],
  },
  {
    title: 'Work, money, and the world changing',
    questions: [
      'What was your first job, and what did it pay?',
      'What did you want to be when you were young?',
      'What is the hardest you ever worked?',
      'How has the world changed most in your lifetime?',
      'What did you worry about at my age?',
      'Was there a moment that changed the direction of your life?',
    ],
  },
  {
    title: 'Lessons and looking back',
    questions: [
      'What are you proudest of?',
      'What would you do differently if you could?',
      'What is the best advice you were ever given?',
      'What do you know now that you wish you had known at thirty?',
      'What do you want your grandchildren to remember about you?',
      'When have you been happiest?',
    ],
  },
];

// An icon for each theme above, in the same order.
const SET_ICONS = [Baby, TreeDeciduous, Heart, Briefcase, Lightbulb];

export default function QuestionsToAskParentsPage() {
  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            path: PATH,
            headline: 'Questions to ask your parents about their life',
            description: 'Thirty questions to ask your parents and grandparents about their lives, grouped by theme, plus how to have the conversation.',
            datePublished: PUBLISHED,
            dateModified: MODIFIED,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Guides', path: '/guides' },
            { name: 'Questions to Ask Your Parents About Their Life', path: PATH },
          ]),
        ]}
      />

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How to ask your parents about their life',
          description: 'A simple way to have the conversation and keep the answers, before the stories are gone.',
          step: [
            { '@type': 'HowToStep', position: 1, name: 'Pick one theme, not all of them', text: 'Do not try to cover a whole life in one sitting. Choose one area, such as childhood, and let the conversation wander from there.' },
            { '@type': 'HowToStep', position: 2, name: 'Ask open questions', text: 'Ask questions that cannot be answered with yes or no. The best ones begin with what, how, or why, and invite a story rather than a fact.' },
            { '@type': 'HowToStep', position: 3, name: 'Record it. Do not interrupt it', text: 'Use a voice recording so you can listen rather than scribble. The way someone tells a story matters as much as the story itself.' },
            { '@type': 'HowToStep', position: 4, name: 'Put the answers somewhere that lasts', text: 'Save the answers somewhere intentional and private, so the whole family can find them in years to come rather than losing them in a phone.' },
          ],
        }}
      />

      <SiteShell>
        <GuideArticle
          guideLink
          crumb="Questions to Ask Your Parents About Their Life"
          title={
            <>
              Questions to ask{' '}
              <br />
              <Accent>your parents.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              There is a particular kind of regret that arrives too late. It is the realisation that the person who knew the answers is no longer here to ask. The name of the village. The story behind the photograph. The reason the family left in the first place.
            </Lead>
            <p>
              Most of us mean to ask. We assume there will be time. And then one ordinary day there is not. The questions below exist so that you ask while you still can, and so that the answers do not disappear with the person who held them.
            </p>
          </Prose>

          <PullQuote>
            The questions are easy.{' '}
            <Accent tone="blue">It is the asking we keep putting off.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                Why these questions <Accent tone="pink">matter.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Your parents are not a list of dates. They were children once, frightened and hopeful and unsure, long before they were anyone’s mother or father. The stories that made them are the stories that, in part, made you.
              </p>
              <p>
                Ask the right question and something shifts. A parent who never talks about the past suddenly does. You learn things you were never told. And the next generation inherits not just names on a tree, but the voices and feelings behind them.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Thirty questions <Accent tone="pink">to begin with.</Accent>
              </>
            }
          >
            <Prose>
              <p>Grouped by theme. Start anywhere. One good question is enough for an afternoon.</p>
            </Prose>

            <QuestionSets>
              {SETS.map((set, i) => (
                <QuestionSet
                  key={i}
                  icon={SET_ICONS[i % SET_ICONS.length]}
                  title={set.title}
                  questions={set.questions}
                />
              ))}
            </QuestionSets>
          </GuideSection>

          <GuideSection
            title={
              <>
                How to actually <Accent tone="pink">have it.</Accent>
              </>
            }
          >
            <Steps>
              <Step number="01" title="Pick one theme, not all of them.">
                <p>Do not try to cover a whole life in one sitting. Choose one area, sit down with a cup of tea, and let the conversation wander from there. The tangents are usually where the best stories hide.</p>
              </Step>
              <Step number="02" title="Ask open questions.">
                <p>Ask questions that cannot be answered with yes or no. The best ones begin with what, how, or why, and invite a story rather than a fact. If an answer is short, simply ask what happened next.</p>
              </Step>
              <Step number="03" title="Record it. Do not interrupt it.">
                <p>Use a voice recording so you can listen properly instead of scribbling. The way your mother laughs telling a story, the pause before your father answers, all of that is worth keeping too.</p>
              </Step>
              <Step number="04" title="Put the answers somewhere that lasts.">
                <p>A voice note buried in a phone is one lost handset away from gone. Save the stories somewhere intentional and private, where the whole family can return to them for generations.</p>
              </Step>
            </Steps>
          </GuideSection>

          <PullQuote>
            You are not interviewing them.{' '}
            <Accent tone="blue">You are making sure they are remembered.</Accent>
          </PullQuote>

          <Prose>
            <p>
              Ancestorii gives every story a home. Record the answer in your parent’s own voice, add the photograph it belongs with, and keep it in a private family space that only the people you invite can see. Years from now, your children will be able to hear their grandparents tell it themselves.
            </p>
          </Prose>
          <div style={{ marginTop: 'clamp(64px, 8vw, 104px)' }}>
            <AuthorBox updated="20 June 2026" />
          </div>
        </GuideArticle>

        <GuideCta
          title={
            <>
              Ask them today.
              <br />
              <Accent tone="pink">Keep their stories.</Accent>
            </>
          }
        >
          It takes two minutes to start.
        </GuideCta>
      </SiteShell>
    </>
  );
}
