import Link from 'next/link';
import type { Metadata } from 'next';
import { ImagePlus, Monitor, PenLine, Send } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent } from '@/components/site/SiteBits';
import site from '@/components/site/site.module.css';
import {
  ArticleCta,
  ArticleHero,
  ArticleSection,
  FaqBlock,
  NumberedPanels,
  QuoteBlock,
  Reading,
} from '@/components/site/seo-articles/ArticleBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';

const PATH = '/features/our-stories';
const TITLE = 'Share Family Stories Online for Free: Our Stories';
const DESCRIPTION =
  'Publish a family story with up to 10 photos, a video and a voice note on Our Stories, Ancestorii’s free public feed. Anyone can read it, no account needed.';
const HEADLINE = 'Our Stories: share a family story anyone can read';

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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Our Stories, the free public feed on Ancestorii' }],
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

const STEPS = [
  {
    number: '01',
    title: 'Sign in on the website.',
    body: 'Our Stories lives on ancestorii.com, not in the phone app. Anyone can read it. To publish, you need a free Ancestorii account, and no card is asked for.',
    Icon: Monitor,
  },
  {
    number: '02',
    title: 'Write it.',
    body: 'Choose ‘Share Your Memory’ on the feed, pick a topic, add a title and write. If you get stuck, Story Assistance can ask you a few questions to help you start, go deeper or find an ending.',
    Icon: PenLine,
  },
  {
    number: '03',
    title: 'Add photos, a video or your voice.',
    body: 'Add up to 10 photos and one video, or record a voice note so readers can hear the story told in your own voice.',
    Icon: ImagePlus,
  },
  {
    number: '04',
    title: 'Publish.',
    body: 'An automated check reads the story against the community standards. If it passes, it goes live straight away. If it is flagged, it waits for a person to review it, and you get an email.',
    Icon: Send,
  },
];

const FAQ = [
  {
    q: 'Is it free to publish on Our Stories?',
    a: 'Yes. Reading, publishing, hearting, commenting and sharing on Our Stories are free, for good. To publish you need a free Ancestorii account, and no card is needed to sign up.',
  },
  {
    q: 'Do readers need an account?',
    a: 'No. Anyone can read a story without signing in. A free account is only needed to publish, to leave a heart or a comment, or to report a story.',
  },
  {
    q: 'Can I take a story down after publishing it?',
    a: 'Yes. You can edit or delete any story you have published, at any time. Deleting your Ancestorii account also deletes your public stories.',
  },
  {
    q: 'Will my private memories ever appear on Our Stories?',
    a: 'No. Stories are written in their own editor on the website, and nothing from your private My Family space appears on Our Stories unless you choose to publish it.',
  },
  {
    q: 'What topics can I write about?',
    a: 'Every story goes under one of seven topics: Family, Food & Recipes, Childhood, Love, Life Lessons, Traditions or Travel. Religious or political content, self-promotion and anything that is not a genuine family memory are not allowed.',
  },
  {
    q: 'Can I publish from the phone app?',
    a: 'No. Our Stories is on the Ancestorii website only. The iPhone and Android app is for your family’s private archive.',
  },
];

const SOURCES = [
  {
    publisher: 'GOV.UK (Intellectual Property Office)',
    title: 'Copyright notice: digital images, photographs and the internet',
    href: 'https://www.gov.uk/government/publications/copyright-notice-digital-images-photographs-and-the-internet/copyright-notice-digital-images-photographs-and-the-internet',
    date: 'updated 4 January 2021',
  },
];

export default function OurStoriesFeaturePage() {
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
            { name: 'Our Stories', path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <SiteShell>
        <ArticleHero
          crumbs={[
            { href: '/', label: 'Home' },
            { href: '/features', label: 'Features' },
            { label: 'Our Stories' },
          ]}
          size="md"
          title={
            <>
              Our Stories: share a family story <Accent>anyone can read.</Accent>
            </>
          }
          intro={[
            'Our Stories is Ancestorii’s free public feed for family memories: you write a story on the website with up to 10 photos, a video and a voice note, choose one of seven topics, and publish it for anyone to read, no account needed. Nothing from your private My Family space appears there unless you choose to publish it.',
            'It is the open side of Ancestorii, made for the stories you are happy for anyone to find: how your grandparents met, the recipe that caused an argument every Christmas, the journey that brought the family to a new country.',
          ]}
          cta={{ href: '/stories', label: 'Read Our Stories' }}
        />

        {/* The quotable facts, beside what the two sides are for */}
        <ArticleSection
          aside={
            <KeyFacts
              items={[
                <>
                  <strong>Free forever</strong> to read, publish, react, comment and share. Reading needs no
                  account; publishing needs a free Ancestorii account.
                </>,
                'Every story sits under one of seven topics: Family, Food & Recipes, Childhood, Love, Life Lessons, Traditions or Travel.',
                <>
                  A story can hold <strong>up to 10 photos and 1 video</strong>, plus a recorded or uploaded
                  voice note. Videos can run to 5&nbsp;minutes on the Free plan (20&nbsp;MB per file) and
                  15 on Premium.
                </>,
                'An automated check reads each story when you publish. Stories that pass go live straight away; flagged stories wait for a person to review them.',
                'Story pages are public and can appear in search results. Nothing from My Family goes public unless you publish it.',
                'Our Stories is on the website only. The phone app is for your private family archive.',
              ]}
            />
          }
        >
          <Reading>
            <p>
              Ancestorii has two sides, and they never mix by accident. My Family is private: only the
              people you invite can see what is in it. Our Stories is public: when you publish there, the
              story gets its own page that anyone can open, share or find through a search engine.
            </p>
            <p>
              That split is the point. Some memories belong to the family, like the photos you would never
              post or a voice note of your mum telling a story one more time. Others are worth sharing
              beyond it, because a stranger reading about your grandad’s first job might recognise their
              own family in it.
            </p>
            <p>
              Our Stories is for the second kind, and you decide, story by story, what goes there. You can
              see what other families have shared on the <Link href="/stories">Our Stories feed</Link>.
            </p>
          </Reading>
        </ArticleSection>

        {/* What a story can include */}
        <ArticleSection
          id="what-a-story-includes"
          kicker="What you can add"
          dot="var(--c1)"
          title={
            <>
              What can <Accent tone="blue">a story include?</Accent>
            </>
          }
        >
          <Reading>
            <p>A story is a title and your words, with as much or as little around them as you like:</p>
            <ul>
              <li>
                <strong>A topic</strong>, chosen from the seven. The Publish button only works once you have
                a topic, a title and some text.
              </li>
              <li>
                <strong>A preview line</strong>, if you want one. It shows on the story’s card in the feed;
                without one, the card shows the opening of your story.
              </li>
              <li>
                <strong>Up to 10 photos</strong>, including iPhone HEIC photos, which the editor accepts
                directly.
              </li>
              <li>
                <strong>One video</strong>, as an MP4, MOV or WebM file: up to 5&nbsp;minutes and
                20&nbsp;MB on the Free plan, or up to 15&nbsp;minutes on Premium.
              </li>
              <li>
                <strong>A voice note</strong>, recorded straight into the editor or uploaded, and converted
                automatically so it plays on any device.
              </li>
            </ul>
            <p>
              Your story shows your display name and profile photo, plus a short title if you add one to
              your profile, such as ‘Retired teacher’. On a wide screen, a live preview beside the editor
              shows how the story will look before you publish. If you are writing something longer, our
              guide on <Link href="/guides/how-to-write-a-life-story">how to write a life story</Link> may
              help.
            </p>
          </Reading>
        </ArticleSection>

        {/* How to publish */}
        <ArticleSection
          id="how-to-publish"
          layout="wide"
          kicker="Step by step"
          dot="var(--c2)"
          title={
            <>
              How do you publish <Accent tone="pink">a story?</Accent>
            </>
          }
        >
          <NumberedPanels items={STEPS} />
        </ArticleSection>

        {/* Moderation */}
        <ArticleSection
          id="community-standards"
          kicker="Community standards"
          dot="var(--c3)"
          title={
            <>
              How are stories checked <Accent tone="blue">before they go live?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Our Stories is only for genuine family memories: anecdotes, tributes, recipes, traditions and
              reflections on family life. When you press Publish, an automated check, which uses Claude, an
              AI model made by Anthropic, reads the title and text and looks for anything outside the
              rules:
            </p>
            <ul>
              <li>religious or political content, where preaching or campaigning is the point of the story</li>
              <li>hate speech, harassment or discriminatory language</li>
              <li>spam, self-promotion or commercial content</li>
              <li>anything that is not really a family memory</li>
            </ul>
            <p>
              Mentioning a church wedding, a Christmas tradition or a relative’s career in politics is fine.
              The check is looking for stories whose main purpose is something other than remembering.
            </p>
            <p>
              Stories that pass go live straight away. Flagged stories are held as ‘pending review’ until a
              person looks at them, and the author gets an email saying so. That means not every story is
              read by a person before it appears, and if the automated check cannot run, the story is
              published anyway. Signed-in readers can report any story, for anything that slips through.
            </p>
            <p>If a published story breaks the rules, a three-strike policy applies:</p>
            <ol>
              <li>The story is removed and you get an email explaining why.</li>
              <li>
                The story is removed, you get a final warning, and you cannot publish on Our Stories for
                seven days.
              </li>
              <li>You are permanently banned from Our Stories.</li>
            </ol>
            <p>
              Strikes only ever affect the public feed. Your private My Family library is never touched.
              The full standards are set out on{' '}
              <Link href="/how-it-works">how Ancestorii works</Link>.
            </p>
          </Reading>
        </ArticleSection>

        {/* Feed order */}
        <ArticleSection
          id="feed-order"
          kicker="The feed"
          dot="var(--c0)"
          title={
            <>
              How does the feed decide <Accent tone="pink">what you see first?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Newest stories come first by default, and everyone sees the same feed: it is not personalised,
              and there are no follower counts. Readers can switch the order to Most Loved, which ranks
              stories by hearts, or Most Discussed, which ranks them by comments. Beside the feed, a Trending
              Stories box shows the five most-hearted stories from the latest 50, and the Ancestorii team can
              feature a story.
            </p>
            <p>
              Each of the seven topics also has its own page, so a story about your grandmother’s recipes
              appears under Food &amp; Recipes as well as in the main feed. You can browse them all on the{' '}
              <Link href="/stories/topics">Our Stories topics page</Link>.
            </p>
            <p>
              Readers can heart a story, reply in comment threads and share it. You get a notification when
              they do, and an email when someone comments.
            </p>
          </Reading>
        </ArticleSection>

        <QuoteBlock>
          Some memories belong to the family.{' '}
          <Accent tone="blue">Some are worth sharing with everyone.</Accent>
        </QuoteBlock>

        {/* Permission and copyright */}
        <ArticleSection
          id="permission"
          kicker="Before you post"
          dot="var(--c2)"
          title={
            <>
              Do you need permission to <Accent tone="blue">publish an old family photo?</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Often, yes, and it is worth a thought before a photo goes on a public page. The UK
              Intellectual Property Office’s copyright notice on digital images explains that the person
              who takes a photo is generally the first owner of its copyright, and that copyright in images
              lasts for the life of the creator plus 70&nbsp;years, although the exact period depends on when
              the image was made. So having the print in your family album does not make you the copyright
              owner.
            </p>
            <p>The same notice covers the situations families meet most:</p>
            <ul>
              <li>
                <strong>Photos taken by relatives.</strong> Its example is photos a relative took at a
                recent family event, which would need the photographer’s permission to use online. In most
                families, that is a quick message to whoever took them.
              </li>
              <li>
                <strong>Studio and wedding photos.</strong> When a photographer was commissioned, copyright
                usually stays with the photographer. If the photos were commissioned for private and
                domestic purposes, the person who commissioned them also has a right to stop them being
                issued to the public without their permission.
              </li>
              <li>
                <strong>Photos with no known photographer.</strong> Copyright does not disappear just because
                the owner cannot be found. After a diligent search, you can apply to the Intellectual
                Property Office for an orphan works licence.
              </li>
            </ul>
            <p>
              Photos on a published story can be seen by anyone, so add only the ones you are comfortable
              sharing, and check with living relatives before you post photos of them or stories about
              them. You keep ownership of everything you upload; Ancestorii holds only a limited licence to
              run the service and show what you choose to publish. This is general information, not legal
              advice.
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
              Where Ancestorii helps, <Accent tone="pink">and where it doesn’t.</Accent>
            </>
          }
        >
          <Reading>
            <p>
              Our Stories costs nothing to use, carries no ads and gives each story a page of its own that
              relatives can find and share. If you want help with the words, Story Assistance can ask you
              questions as you write; our <Link href="/features/writing-help">writing help</Link> page
              explains how it works. And when a memory is not for strangers, it belongs on the private side
              instead, where the <Link href="/features/private-family-feed">My Family feed</Link> keeps it
              between the people you invite.
            </p>
            <p>
              The limits are worth knowing too. Our Stories is on the website, not in the phone app. It is a
              small, new community rather than a big social network, so it is a place to keep and share a
              story, not to build an audience. And it is public: once a story is live, anyone can read it,
              and like any web page it can be copied or saved, so publish only what you are happy for anyone
              to see.
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
              Things people <Accent tone="blue">ask us.</Accent>
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
          size="md"
          title={
            <>
              Write the story.
              <br />
              Let anyone read it.
            </>
          }
          lead="Our Stories is free to read and free to publish. Create a free account to share your first story."
          primary={{ href: '/signup', label: 'Start For Free' }}
          note="Free forever · No credit card · Takes 2 minutes"
        />
      </SiteShell>
    </>
  );
}
