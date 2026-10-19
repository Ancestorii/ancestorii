import type { Metadata } from 'next';
import { Mic, PenLine, Quote, UserRound } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { Point, Points, Prompt, Prompts } from '../_components/GuideBlocks';

const PATH = '/guides/how-to-record-family-stories';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'How to Record Family Stories and Voices';
const DESCRIPTION =
  'Learn how to record family stories in a simple, meaningful way. Capture personal memories while life is happening and grow a living family collection over time.';
const PUBLISHED = '2026-02-10';
const MODIFIED = '2026-05-22';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `${TITLE} | Ancestorii`,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: 'Ancestorii',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How to record family stories' }],
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

export default function RecordFamilyStoriesPage() {
  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            path: PATH,
            headline: 'How to record family stories',
            description: 'A practical guide to recording family stories while life is happening.',
            datePublished: PUBLISHED,
            dateModified: MODIFIED,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Guides', path: '/guides' },
            { name: 'How to Record Family Stories', path: PATH },
          ]),
        ]}
      />

      <SiteShell>
        <GuideArticle
          crumb="How to Record Family Stories"
          title={
            <>
              How to record{' '}
              <br />
              <Accent>family stories.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              Every family has a storyteller. The one who starts talking at dinner and does not stop until someone reminds them their food is cold. The one who remembers the name of every person at a gathering that happened twenty years ago. The one who turns a ten second anecdote into a fifteen minute performance and nobody minds because they are that good at telling it.
            </Lead>
            <p>
              That person is holding half your family history in their head. And none of it is written down.
            </p>
          </Prose>

          <PullQuote>
            Every family has a storyteller.{' '}
            <Accent tone="blue">Most of their stories exist nowhere but their own memory.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                Why &quot;tell me a story&quot; <Accent tone="pink">never works.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                If you sit someone down and say &quot;I want to record your stories,&quot; they will freeze. They will say they cannot think of any. They will say their life is not that interesting. They will suddenly become the most modest person on earth, despite having told the same eight stories at every family event for the last thirty years.
              </p>
              <p>
                That is because stories do not work on demand. They come out naturally, triggered by a place, a smell, a photo, a question they were not expecting. The trick is not to make someone tell a story. The trick is to ask the right question and get out of the way.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Questions that <Accent tone="pink">open doors.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                You do not need a list of fifty questions. You need five or six good ones and the patience to let someone talk. Here are some that tend to unlock the stories nobody thought to tell.
              </p>
            </Prose>

            <Prompts>
              <Prompt question="What is the earliest thing you remember?" context="This almost always leads somewhere unexpected. People remember strange, specific details from childhood that reveal more about a time and place than any history book." />
              <Prompt question="What did your house smell like growing up?" context="Sensory questions bypass the filter. Nobody rehearses an answer about smell. It pulls real, unscripted memories out of people." />
              <Prompt question="What is something your parents did that you did not understand until you were older?" context="This one goes deep. It connects generations and often reveals the quiet sacrifices and decisions that shaped a family without anyone noticing." />
              <Prompt question="What was the funniest thing that ever happened at a family gathering?" context="Laughter opens people up. Once they start laughing about one thing, three more stories follow. Some of the best recordings start here." />
              <Prompt question="What is a tradition your family had that nobody else would understand?" context="Every family has strange rituals. The specific way something was done at Christmas. The game nobody else played. These are the details that make a family story feel real." />
              <Prompt question="Who in the family do you think about the most, and why?" context="This question is quiet and personal. It often leads to the most meaningful stories because it is about connection, not events." />
            </Prompts>
          </GuideSection>

          <GuideSection
            title={
              <>
                Making it <Accent tone="pink">stick.</Accent>
              </>
            }
          >
            <Points>
              <Point icon={PenLine} title="Write it down the same day.">
                You will remember the details right after the conversation. A week later you will remember that someone told you something good but you will not remember the specifics. Write it while it is fresh. Even bullet points are better than nothing.
              </Point>
              <Point icon={Quote} title="Do not edit their words.">
                If your grandmother says something in a roundabout way, keep it roundabout. The way someone tells a story is part of the story. Clean it up too much and you lose the person inside it.
              </Point>
              <Point icon={Mic} title="Record more than you think you need.">
                The best part of a conversation is almost never the part you expected. Let it run. You can always trim later, but you cannot go back and capture something you missed.
              </Point>
              <Point icon={UserRound} title="Connect it to a person.">
                A story floating in a folder is easy to lose. A story attached to a person, a timeline, a chapter of their life, becomes part of something bigger. It has a place. It has context. It means something to the next person who finds it.
              </Point>
            </Points>
          </GuideSection>

          <PullQuote>
            The right question at the right moment{' '}
            <Accent tone="blue">can unlock thirty years of stories.</Accent>
          </PullQuote>
          <div style={{ marginTop: 'clamp(64px, 8vw, 104px)' }}>
            <AuthorBox updated="22 May 2026" />
          </div>
        </GuideArticle>

        <GuideCta
          title={
            <>
              Record the stories
              <br />
              <Accent tone="pink">while they’re told.</Accent>
            </>
          }
        >
          One story. One question. That is all it takes.
        </GuideCta>
      </SiteShell>
    </>
  );
}
