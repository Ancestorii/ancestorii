import Link from 'next/link';
import type { Metadata } from 'next';
import { BookHeart, Infinity as InfinityIcon, Users, Waypoints } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent } from '@/components/site/SiteBits';
import {
  ArticleCta,
  ArticleHero,
  ArticleSection,
  CheckList,
  CompareTable,
  NumberedPanels,
  QuoteBlock,
  Reading,
} from '@/components/site/seo-articles/ArticleBits';

export const metadata: Metadata = {
  title: 'What Is a Living Library? | A New Way to Preserve Family Stories',
  description:
    'Discover what a living library is and how it differs from simple digital storage. Learn how stories, voices, and memories can grow over time in one intentional space.',
  alternates: {
    canonical: 'https://www.ancestorii.com/living-library',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const DIFFERENCES = [
  ['Files sit in folders', 'Memories connect to people'],
  ['Photos have no context', 'Every photo has a story behind it'],
  ['One person uploads everything', 'Your whole family contributes'],
  ['You forget it exists', 'You want to come back to it'],
  ['Organised by date', 'Organised by meaning'],
  ['A backup of what happened', 'A record of why it mattered'],
];

const LIVING = [
  {
    number: '01',
    title: 'It is never finished.',
    body: 'A living library does not have a deadline. You add a memory when it comes to you. A story after a phone call. A photo after a visit. It grows at your pace, on your terms, for as long as you want it to.',
    Icon: InfinityIcon,
  },
  {
    number: '02',
    title: 'It connects things.',
    body: 'A photo links to a person. A person links to a timeline. A timeline tells a life story. Nothing sits alone. Everything has context, and that context is what makes it worth returning to.',
    Icon: Waypoints,
  },
  {
    number: '03',
    title: 'More than one person builds it.',
    body: 'Your mum adds a recipe. Your brother uploads photos from a trip you forgot about. Your aunt fills in a name nobody else remembered. A living library is a shared act, not a solo project.',
    Icon: Users,
  },
  {
    number: '04',
    title: 'It survives beyond a device.',
    body: 'Phones break. Laptops get replaced. Social media accounts get abandoned. A living library is a permanent home for the things that matter. And if you want, you can turn it into a physical book you hold in your hands.',
    Icon: BookHeart,
  },
];

const FOR_YOU = [
  'You have thousands of photos on your phone but no idea what half of them mean anymore.',
  'You have a parent or grandparent whose stories you have been meaning to record for years.',
  'You have lost someone and realised too late how much you did not write down.',
  `You want your children to know where they come from, in your words, not a search engine's.`,
  `You have tried notebooks, cloud drives, shared albums, and none of them stuck.`,
];

export default function LivingLibraryPage() {
  return (
    <SiteShell>
      <ArticleHero
        eyebrow={"Living Library"}
        title={
          <>
            Not a vault.
            <br />
            <Accent>A living thing.</Accent>
          </>
        }
        intro={[
          'A living library is what happens when you stop treating family memories like files and start treating them like what they actually are. Stories. Voices. Context. The kind of detail that makes a photo worth looking at thirty years from now instead of just scrolling past it.',
          'It is not a backup. It is not a folder. It is a space that grows with your family, where every memory connects to the people and moments around it.',
        ]}
        cta={{ href: '/signup', label: 'Start For Free' }}
      />

      {/* Storage vs living library */}
      <ArticleSection
        id="the-difference"
        kicker={"The difference"}
        title={
          <>
            Storage keeps files. <Accent tone="blue">This keeps meaning.</Accent>
          </>
        }
      >
        <CompareTable
          head={['Traditional storage', 'A living library']}
          rows={DIFFERENCES}
          highlight={1}
          rowHeaders={false}
          struck={0}
          ticks
          size="fit"
          labelledBy="the-difference-title"
        />
      </ArticleSection>

      {/* What makes it living */}
      <ArticleSection
        id="what-makes-it-living"
        layout="wide"
        kicker={"What makes it living"}
        dot="var(--c2)"
        title={
          <>
            It grows with <Accent tone="pink">your family.</Accent>
          </>
        }
      >
        <NumberedPanels items={LIVING} />
      </ArticleSection>

      <QuoteBlock>
        A folder stores what happened.{' '}
        <Accent tone="blue">A living library preserves why it mattered.</Accent>
      </QuoteBlock>

      {/* Who is it for */}
      <ArticleSection
        id="who-this-is-for"
        kicker={"Who this is for"}
        dot="var(--c3)"
        title={
          <>
            You already know <Accent tone="blue">if this is for you.</Accent>
          </>
        }
      >
        <CheckList items={FOR_YOU} />
        <Reading>
          <p>
            If any of that sounds familiar, a living library is not a nice idea for someday. It is
            the thing you have been looking for. You just did not know it had a name.
          </p>
          <p>
            Learn more about <Link href="/digital-legacy">building a digital legacy</Link>, or see{' '}
            <Link href="/how-it-works">how Ancestorii works</Link>.
          </p>
        </Reading>
      </ArticleSection>

      <ArticleCta
        title={
          <>
            Start building something
            <br />
            your family can return to.
          </>
        }
        lead={"One memory. That is all it takes to begin."}
        primary={{ href: '/signup', label: 'Start For Free' }}
        note={"Free forever · No credit card · Takes 2 minutes"}
      />
    </SiteShell>
  );
}
