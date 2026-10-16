import type { Metadata } from 'next';
import SiteShell from '@/components/site/SiteShell';
import { Accent, PullQuote } from '@/components/site/SiteBits';
import {
  ArticleCta,
  ArticleHero,
  ArticleSection,
  CaptionedPhoto,
  FaqBlock,
  Reading,
} from '@/components/site/seo-articles/ArticleBits';

export const metadata: Metadata = {
  title: 'Digital Legacy: Capture and Grow Your Family Story Digitally',
  description:
    'Discover how to build a living digital legacy by capturing family stories, voices, and everyday moments as they happen — and growing a library your family can return to.',
  alternates: {
    canonical: 'https://www.ancestorii.com/digital-legacy',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const QUESTIONS = [
  {
    q: 'Is cloud storage not enough?',
    a: 'Cloud storage keeps files safe. It does not organise your history, add meaning to your photos, or help your grandchildren understand who someone was. It is a hard drive in the sky. A digital legacy is a living collection with structure, context, and intention.',
  },
  {
    q: 'What if I do not have old photos or documents?',
    a: 'You do not need them. Start with what you have right now. A memory in your head. A story someone told you last week. A photo on your phone from this morning. A legacy is not an archive of the past. It is a record of everything that matters, including today.',
  },
  {
    q: 'What should I capture first?',
    a: "Whatever you are most afraid of forgetting. The story your dad always tells. The sound of someone's laugh. The reason behind a tradition that has been in your family for years. Start with the thing that would hurt most to lose.",
  },
  {
    q: 'Can my family contribute?',
    a: 'Yes. Ancestorii lets you invite family members into your private library so they can add their own memories, fill in gaps, and help build something together. The best family histories are never built by one person alone.',
  },
];

export default function DigitalLegacyPage() {
  return (
    <SiteShell>
      <ArticleHero
        eyebrow={"Digital Legacy"}
        size="md"
        title={
          <>
            Your family already has
            <br />
            <Accent>a story worth keeping.</Accent>
          </>
        }
        intro={[
          'A digital legacy is not something you sit down and create in an afternoon. It is something that builds slowly, one memory at a time, while life is still happening around you.',
        ]}
        cta={{ href: '/signup', label: 'Start For Free' }}
      />

      {/* Why it matters, beside a real family photo */}
      <ArticleSection
        aside={
          <CaptionedPhoto
            src="/Testimonial2.png"
            alt="Family sharing stories across generations"
            label="Alison · Nevada, US"
            color="var(--c3)"
            caption={"The moments between the moments. That is where the real story lives."}
            priority
          />
        }
      >
        <Reading>
          <p>
            It is your dad&apos;s voice telling a story he has told a hundred times. It is the photo
            your mum keeps in her purse and the reason she keeps it there. It is the recipe your
            grandmother never measured, the nickname only your uncle uses, the argument at Christmas
            dinner that became family legend.
          </p>
          <p>
            None of that exists in a cloud folder. None of it survives on social media. And none of
            it writes itself down.
          </p>
          <p>
            Most families lose their history without realising it is happening. Not in one dramatic
            moment, but slowly. A detail here, a voice there. A story that used to get told at every
            gathering until the person who told it was no longer around, and nobody could quite
            remember how it went.
          </p>
          <p>
            We assume there will always be more time. That the person who knows the recipe will
            always be there to make it. That the stories will keep getting told. That someone,
            eventually, will write it all down.
          </p>
          <p>But they rarely do. And by the time you notice what is missing, it is already gone.</p>

          <PullQuote>
            You do not lose a family&apos;s history all at once.{' '}
            <Accent tone="blue">You lose it one forgotten detail at a time.</Accent>
          </PullQuote>

          <p>
            A digital legacy changes that. Not by turning your family into a project, but by giving
            you a place to put the things that matter as they come to you. A photo with a few
            sentences about why it is important. A voice recording of someone you love telling a
            story in their own words. A date, a name, a detail that would otherwise disappear into
            the back of someone&apos;s memory and stay there until it fades.
          </p>
          <p>
            It does not need to be perfect. It does not need to be complete. It just needs to exist.
          </p>
        </Reading>
      </ArticleSection>

      {/* What gets lost */}
      <ArticleSection
        id="the-problem"
        kicker={"The problem"}
        title={
          <>
            Photos are not <Accent tone="pink">enough.</Accent>
          </>
        }
      >
        <Reading>
          <p>
            Every family has thousands of photos. On phones, on hard drives, in cloud accounts nobody
            checks. But a photo without a story is just an image. It tells you what someone looked
            like, not who they were. It tells you where they stood, not why that place mattered.
          </p>
          <p>
            Cloud storage keeps your files safe. It does not keep your history alive. There is no
            context, no structure, no connection between one image and the next. Just rows of
            thumbnails that nobody scrolls through, getting older and more meaningless with every
            passing year.
          </p>
          <p>
            Social media is worse. Your family memories are wedged between advertisements and
            strangers&apos; opinions, controlled by an algorithm that decides who sees what and when.
            You do not own that space. You are borrowing it. And one day the platform will change, or
            close, or bury your posts so deep that nobody will ever find them again.
          </p>
          <p>
            A digital legacy is different. It is intentional. It is organised. And it belongs to your
            family.
          </p>
        </Reading>
      </ArticleSection>

      {/* How to start */}
      <ArticleSection
        id="getting-started"
        kicker={"Getting started"}
        dot="var(--c1)"
        title={
          <>
            Start with <Accent tone="blue">one thing.</Accent>
          </>
        }
      >
        <Reading>
          <p>
            The biggest reason families never build a legacy is because it feels overwhelming. Where
            do you even begin? Do you start from the beginning? Do you need to scan every old
            photograph? Do you need to sit down with a recorder and interview your grandparents for
            hours?
          </p>
          <p>No. You start with one thing.</p>
          <p>
            One photo that means something. One story you have heard a thousand times and can write
            in five minutes. One detail about a person you love that you do not want to forget. That
            is it. That is a digital legacy. Everything else builds from there.
          </p>

          <PullQuote>
            You do not need to do everything today.{' '}
            <Accent tone="blue">You just need to start before the stories are gone.</Accent>
          </PullQuote>

          <p>
            Over time, those small additions stack up. A photo becomes an album. An album becomes a
            timeline. A timeline becomes the story of someone&apos;s life told by the people who knew
            them best. Not a biography written by a stranger. Not a Wikipedia summary. The real
            thing, in the words of the people who were actually there.
          </p>
          <p>
            That is what a digital legacy becomes when you give it time. Not a task you complete, but
            a collection that grows alongside your family.
          </p>
        </Reading>
      </ArticleSection>

      {/* Common questions */}
      <ArticleSection
        id="questions"
        kicker={"Questions"}
        dot="var(--c3)"
        title={
          <>
            Things people <Accent tone="pink">ask us.</Accent>
          </>
        }
      >
        <FaqBlock items={QUESTIONS} variant="open" />
      </ArticleSection>

      <ArticleCta
        title={
          <>
            One memory today.
            <br />
            A lifetime preserved.
          </>
        }
        lead={"Free to start. No credit card. Takes two minutes."}
        primary={{ href: '/signup', label: 'Start For Free' }}
        note={"Free forever · No credit card · Takes 2 minutes"}
      />
    </SiteShell>
  );
}
