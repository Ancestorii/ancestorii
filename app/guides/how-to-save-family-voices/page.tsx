import type { Metadata } from 'next';
import Script from 'next/script';
import {
  Cake,
  CookingPot,
  FolderHeart,
  House,
  MegaphoneOff,
  MessageCircleQuestion,
  Phone,
  Speech,
  StickyNote,
} from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, Prose, PullQuote } from '@/components/site/SiteBits';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { Point, Points, Tip, Tips } from '../_components/GuideBlocks';

export const metadata: Metadata = {
  title: 'How to Capture and Keep Family Voices | Ancestorii',
  description:
    'A practical guide to capturing family voices and recordings while life is happening. Learn simple ways to record tone, personality, and presence as part of a growing family library.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides/how-to-save-family-voices',
  },
};

export default function SaveFamilyVoicesPage() {
  return (
    <>
      <Script id="article-schema-voices" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Article',
          headline: 'How to capture family voices',
          description: 'A practical guide to capturing and preserving family voices.',
          author: { '@type': 'Organization', name: 'Ancestorii' },
          publisher: { '@type': 'Organization', name: 'Ancestorii', logo: { '@type': 'ImageObject', url: 'https://www.ancestorii.com/logo.png' } },
          mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.ancestorii.com/guides/how-to-save-family-voices' },
          datePublished: '2026-02-10', dateModified: '2026-05-22',
        })}
      </Script>

      <Script id="breadcrumb-schema-voices" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ancestorii.com/' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://www.ancestorii.com/guides' },
            { '@type': 'ListItem', position: 3, name: 'How to Save Family Voices', item: 'https://www.ancestorii.com/guides/how-to-save-family-voices' },
          ],
        })}
      </Script>

      <SiteShell>
        <GuideArticle
          crumb="How to Save Family Voices"
          title={
            <>
              How to save{' '}
              <br />
              <Accent>family voices.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              You know the way your mum says your name when she is annoyed. The way your dad clears his throat before he tells a long story. The way your grandmother hums something under her breath while she cooks. These are not things you can capture in a photograph. They live in sound, and sound is the first thing we forget.
            </Lead>
            <p>
              We lose the way someone laughed before we lose their face. We lose the rhythm of their voice before we lose their words. And once it is gone, no amount of photographs will bring it back.
            </p>
          </Prose>

          <PullQuote>
            A photograph shows you what someone looked like.{' '}
            <Accent tone="blue">A voice reminds you who they were.</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                Why we never think <Accent tone="pink">to press record.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Because voices feel permanent. You hear them every day, every phone call, every visit. They are so present in your life that it never occurs to you they could disappear. You take a hundred photos at a family gathering but you do not think to record thirty seconds of your uncle telling that story everyone has heard before.
              </p>
              <p>
                And then one day you are trying to remember exactly how they sounded, and you cannot. You can remember what they said, roughly. But the tone, the timing, the way they would pause for effect before the punchline. That is gone.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                What is worth <Accent tone="pink">recording.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                It does not need to be a formal interview. It does not need a script or a plan or studio quality audio. Some of the most valuable voice recordings in the world are shaky, noisy, and imperfect. What makes them valuable is that they exist at all.
              </p>
            </Prose>

            <Tips>
              <Tip icon={Speech}>Your dad telling the story he has told a hundred times. Record it the hundred and first time. That is the version your grandchildren will hear.</Tip>
              <Tip icon={CookingPot}>Your mum explaining how she makes that dish. Not the recipe. The explanation. The way she talks about it, the shortcuts she takes, the bits she makes up as she goes.</Tip>
              <Tip icon={House}>Your grandparent describing where they grew up. Not the facts. The feeling. What the street looked like, what the air smelled like, who lived next door.</Tip>
              <Tip icon={Cake}>A birthday message. A bedtime story. A laugh. Thirty seconds of someone being themselves, unscripted, unplanned.</Tip>
              <Tip icon={Phone}>A phone call you did not expect to matter. Save it. Add a note about when it happened and why it stuck with you.</Tip>
            </Tips>
          </GuideSection>

          <GuideSection
            title={
              <>
                How to actually <Accent tone="pink">do it.</Accent>
              </>
            }
          >
            <Points>
              <Point icon={MegaphoneOff} title="Do not announce it.">
                The moment you say &quot;I am going to record this&quot; most people freeze. They start performing instead of being themselves. Just open your voice recorder app during a conversation and let it run. You can trim it later.
              </Point>
              <Point icon={MessageCircleQuestion} title="Ask one question.">
                &quot;Tell me about when you first moved here.&quot; &quot;What do you remember about your mum&apos;s kitchen?&quot; &quot;What is the funniest thing that ever happened at a family gathering?&quot; One question is all it takes. People will talk for ten minutes if the question is right.
              </Point>
              <Point icon={FolderHeart} title="Save it somewhere that lasts.">
                Not in your voice memos app where it will get buried under grocery reminders and random recordings. Somewhere intentional, private, and connected to the person it belongs to. Somewhere your family can find it in twenty years.
              </Point>
              <Point icon={StickyNote} title="Add context while it is fresh.">
                Who is speaking. When it was recorded. What was happening around it. A voice recording without context becomes a mystery in five years. A voice recording with three sentences of explanation becomes a treasure.
              </Point>
            </Points>
          </GuideSection>

          <PullQuote>
            You do not need perfect audio.{' '}
            <Accent tone="blue">You just need to press record before it is too late.</Accent>
          </PullQuote>
        </GuideArticle>

        <GuideCta
          title={
            <>
              Capture a voice while it&apos;s
              <br />
              <Accent tone="pink">still here to be heard.</Accent>
            </>
          }
        >
          A thirty second recording today. A lifetime of meaning later.
        </GuideCta>
      </SiteShell>
    </>
  );
}
