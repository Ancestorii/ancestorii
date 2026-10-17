import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import {
  AudioLines,
  BookOpen,
  Camera,
  ChefHat,
  Clock,
  CookingPot,
  Film,
  Footprints,
  Gift,
  Heart,
  Mail,
  Mailbox,
  MessageCircle,
  Mic,
  PartyPopper,
  Phone,
  Repeat,
  Ruler,
  Star,
  Sun,
  Users,
  UtensilsCrossed,
  Video,
} from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, FaqList, Prose, PullQuote } from '@/components/site/SiteBits';
import JsonLd from '@/components/site/seo/JsonLd';
import { AuthorBox, KeyFacts, Sources, type Source } from '@/components/site/seo/SeoBits';
import { SITE_URL, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { GuideArticle, GuideCta, GuideSection, Lead } from '../_components/GuideLayout';
import { GuideFigure, Point, Points, Prompt, Prompts, Tip, Tips } from '../_components/GuideBlocks';

const PATH = '/guides/family-traditions-ideas';
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = 'Family Tradition Ideas Worth Starting This Year';
const HEADLINE = 'Family tradition ideas worth starting this year';
const DESCRIPTION =
  'Small, repeatable family traditions, from a birthday photo to a recipe night, and what research says shared routines and family stories do for families.';
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
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Family tradition ideas' }],
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
// The research is correlational, so the copy says "linked with", never "causes".
const FAQ_PLAIN = [
  {
    q: 'What are some good family traditions to start?',
    a: 'Small ones you can repeat: the same photo on every birthday, one question at Sunday dinner, a weekly film night, a recipe cooked on the same day each year, a new decoration every Christmas or a letter written each New Year. Pick one and do it again next year.',
  },
  {
    q: 'Why are family traditions important?',
    a: 'A 2002 review of 50\u00a0years of research linked family routines and rituals with parenting competence, children’s adjustment and marital satisfaction, and Emory University research links family stories with children coping better. The studies show links rather than proof of cause, but traditions give a family shared time and shared stories.',
  },
  {
    q: 'How do you start a new family tradition?',
    a: 'Choose something small, fix a time and place, give everyone a part and say out loud that you will do it again next year. Take a photo each time, and write down who started it and why.',
  },
  {
    q: 'What traditions work for families who live apart?',
    a: 'A monthly video call with one question, the same photo taken by everyone on the same day, the same recipe cooked on the same night, birthday cards in the post and voice notes on birthdays. Save the best of them somewhere that lasts, because chat threads scroll away.',
  },
  {
    q: 'How do you keep a family tradition going?',
    a: 'Keep it small enough to survive a busy year, hand parts of it to the next generation, tell the story of how it started and record it every year. When the person who started it can no longer lead it, ask someone else to take it on.',
  },
];

const KEY_FACTS = [
  <>
    <strong>Routines and rituals.</strong> A 2002 review of 50&nbsp;years of research, covering 32
    publications, linked them with parenting competence, children’s adjustment and marital satisfaction
    (Fiese and colleagues, <em>Journal of Family Psychology</em>).
  </>,
  <>
    <strong>Family stories and coping.</strong> Emory University psychologists followed 10 to 12&nbsp;year
    olds for two years. Those whose families told more coherent, emotionally open stories about hard
    times coped better.
  </>,
  <>
    <strong>Knowing family history.</strong> In a 2010 Emory study of 66 teenagers, those who knew more
    family stories showed higher emotional well-being, though the authors called for more research.
  </>,
  <>
    <strong>“Old” traditions are often Victorian.</strong> Henry Cole sent the first Christmas card in
    1843; a thousand were printed and sold at a shilling each (V&amp;A).
  </>,
  <>
    <strong>Distance is no barrier.</strong> 74% of UK online adults used WhatsApp every day in May&nbsp;2025, up from 64% a year earlier (Ofcom).
  </>,
];

const SOURCES: Source[] = [
  {
    publisher: 'Journal of Family Psychology (via PubMed)',
    title:
      'A review of 50\u00a0years of research on naturally occurring family routines and rituals: cause for celebration? (Fiese, Tomcho, Douglas, Josephs, Poltrock and Baker)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/12561283/',
    date: '2002',
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
    publisher: 'V&A',
    title: 'The first Christmas card',
    href: 'https://www.vam.ac.uk/articles/the-first-christmas-card',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'The Church of England',
    title: 'Mothering Sunday, what are its origins in the Church?',
    href: 'https://www.churchofengland.org/media/stories-and-features/mothering-sunday-what-are-its-origins-church',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Debrett’s',
    title: 'Marital milestones: how to celebrate a wedding anniversary',
    href: 'https://debretts.com/marital-milestones-how-to-celebrate-a-wedding-anniversary/',
    date: 'accessed October\u00a02026',
  },
  {
    publisher: 'Ofcom',
    title: 'Online Nation 2025 report',
    href: 'https://www.ofcom.org.uk/siteassets/resources/documents/research-and-data/online-research/online-nation/2025/online-nations-report-2025.pdf',
    date: '10\u00a0December\u00a02025',
  },
];

// Space above a block that follows running text, and above the sources after the last section.
const STACK_GAP: CSSProperties = { marginTop: 'clamp(32px, 4vw, 44px)' };
const SECTION_GAP: CSSProperties = { marginTop: 'clamp(64px, 8vw, 104px)' };

export default function FamilyTraditionsPage() {
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
            { name: 'Family Tradition Ideas', path: PATH },
          ]),
          faqSchema(FAQ_PLAIN),
        ]}
      />

      <SiteShell>
        <GuideArticle
          crumb="Family Tradition Ideas"
          title={
            <>
              Family tradition ideas{' '}
              <br />
              <Accent>worth starting.</Accent>
            </>
          }
        >
          <Prose>
            <Lead>
              The family traditions that last are small and easy to repeat: the same photo on every
              birthday, one question asked over Sunday dinner, a recipe cooked on the same day each year, a
              letter written every New Year. Research links family routines and rituals with children’s
              adjustment and marital satisfaction, and family stories with children coping better, although
              it shows a link rather than proof that one causes the other.
            </Lead>
            <p>
              Below are ideas for every week, every birthday and every Christmas, traditions for families
              who live apart, and ways to make sure they outlast the people who started them.
            </p>
          </Prose>

          <div style={STACK_GAP}>
            <KeyFacts items={KEY_FACTS} />
          </div>

          <PullQuote>
            Every tradition started with someone saying{' '}
            <Accent tone="blue">“Let’s do this again next year.”</Accent>
          </PullQuote>

          <GuideSection
            title={
              <>
                What makes a family tradition <Accent tone="pink">stick?</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Researchers separate two kinds of repetition. In their 2002 review, Fiese and colleagues
                describe routines as the everyday things a family does, and rituals as the symbolic ones that
                mark shared family events. Both were linked with good outcomes, though the authors flagged
                inconsistent measures, convenience samples and no way to separate direct from indirect
                effects. Families with traditions tend to do well, but a tradition is not a cure. What the
                traditions that last have in common:
              </p>
            </Prose>
            <Points>
              <Point icon={Repeat} title="They are small.">
                A tradition that takes ten minutes survives a busy year. One that needs a week off does not.
              </Point>
              <Point icon={Clock} title="They happen at a fixed time.">
                Same day, same place, same order. The repetition is the point.
              </Point>
              <Point icon={Users} title="Everyone has a part.">
                The youngest lights the candle, Grandad carves. A part to play gives people a reason to turn
                up.
              </Point>
              <Point icon={BookOpen} title="Someone tells the story.">
                Say who started it and why, or in thirty years nobody will know.
              </Point>
              <Point icon={Camera} title="It gets recorded.">
                One photo or one line each year turns a habit into a history.
              </Point>
            </Points>
          </GuideSection>

          <GuideSection
            title={
              <>
                Everyday and <Accent tone="pink">weekly traditions.</Accent>
              </>
            }
          >
            <Prose>
              <p>These cost nothing and fill a year:</p>
            </Prose>
            <Tips>
              <Tip icon={UtensilsCrossed}>One question at Sunday dinner, asked by a different person each week. Try “Picture Sunday dinner when you were growing up. What was it like?”</Tip>
              <Tip icon={Film}>A Friday film night where a different person picks each week.</Tip>
              <Tip icon={Footprints}>A walk after Sunday lunch, on the same route, whatever the weather.</Tip>
              <Tip icon={Phone}>A weekly call to the grandparents at the same time, so it becomes part of their week as well as yours.</Tip>
            </Tips>
          </GuideSection>

          <GuideSection
            title={
              <>
                Birthday and <Accent tone="pink">milestone traditions.</Accent>
              </>
            }
          >
            <Prose>
              <p>Milestones come round once a year, which makes them easy to remember and easy to record:</p>
            </Prose>
            <Tips>
              <Tip icon={Camera}>The same photo in the same spot every birthday. After eighteen years you have a whole childhood in one doorway.</Tip>
              <Tip icon={Mail}>A birthday letter written every year and saved, sealed, for their 18th.</Tip>
              <Tip icon={Ruler}>Their height marked on the same doorframe, photographed before you ever move house.</Tip>
              <Tip icon={MessageCircle}>A birthday interview with the same five questions each year: best friend, favourite food, what you want to be, best day this year, and what you are looking forward to.</Tip>
              <Tip icon={Heart}>An anniversary ritual: watch the wedding video again, or add one new photo of the two of you each year.</Tip>
            </Tips>
            <Prose>
              <p>
                Anniversary customs are older than most. Debrett’s traces them to the Middle Ages, when 25th
                and 50th wedding anniversaries were marked with silver and gold wreaths, and says wood came to
                mean the fifth anniversary in the Victorian era.
              </p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                Christmas and <Accent tone="pink">holiday traditions.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Many traditions that feel ancient are younger than you might think. The V&amp;A’s founding
                director, Henry Cole, sent the first Christmas card in 1843; the artist John Callcott Horsley
                designed it, and a thousand copies were printed and sold at a shilling each. Mothering Sunday,
                on the fourth Sunday of Lent, began as a yearly journey to people’s “mother” church, and the
                Church of England says that in the 16th century it was less about mothers and more about
                church. Your family’s traditions can start this year.
              </p>
            </Prose>
            <Tips>
              <Tip icon={Gift}>A Christmas Eve box: new pyjamas, a film and hot chocolate.</Tip>
              <Tip icon={Star}>One new decoration each year, labelled with the year and who chose it.</Tip>
              <Tip icon={CookingPot}>One dish from a grandparent’s recipe, cooked while someone tells the story of who made it first.</Tip>
              <Tip icon={Mic}>One family story recorded every Christmas, told by whoever tells it best.</Tip>
              <Tip icon={PartyPopper}>Predictions for the year ahead, written on New Year’s Eve and read out the following December.</Tip>
            </Tips>
          </GuideSection>

          <GuideSection
            title={
              <>
                Traditions that keep <Accent tone="pink">family stories alive.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Some of the strongest evidence is about stories. Emory University psychologists Robyn Fivush
                and Marshall Duke followed children aged 10 to 12 for two years, starting just before 9/11.
                Children whose families told more coherent, emotionally open stories about hard times coped
                better, with better self-esteem, less anxiety and fewer behaviour problems reported by their
                parents. In a separate Emory study of 66 teenagers aged 14 to 16, those who could answer more
                of 20 yes-or-no questions about their family, such as how their parents met, showed higher
                emotional well-being, although it was the only study to use that scale.
              </p>
              <p>So build the stories into the traditions. When one comes round, ask about it:</p>
            </Prose>
            <Prompts>
              <Prompt
                question="Who started this, and why?"
                context="The origin is the part most likely to be lost. Ask the oldest person in the room first."
              />
              <Prompt
                question="What went wrong the year it nearly didn’t happen?"
                context="Disasters make the best stories, and they show how the family coped."
              />
              <Prompt
                question="What did this look like when you were little?"
                context="It shows how the tradition has changed, and who used to be at the table."
              />
              <Prompt
                question="What should never change about it?"
                context="The answer tells you what the tradition really means to them."
              />
            </Prompts>
            <Prose>
              <p>
                Our <Link href="/guides/questions-to-ask-your-parents-about-their-life">questions to ask your
                parents about their life</Link> include where the family’s traditions came from, and recipes
                deserve a record of their own: see{' '}
                <Link href="/guides/how-to-preserve-family-recipes">how to preserve family recipes</Link>.
                Some stories get told differently by everyone, like this one from our founder’s family album.
              </p>
            </Prose>
            {/* snow.jpg is 720 by 481: at 600px wide the 5:4 frame never enlarges it, so it stays sharp. */}
            <div style={{ maxWidth: 600, marginInline: 'auto' }}>
              <GuideFigure
                src="/snow.jpg"
                alt="Dante and his sister in the snow"
                label={'She still says she won the snowball fight · March\u00a02010'}
                color="var(--c1)"
              />
            </div>
          </GuideSection>

          <GuideSection
            title={
              <>
                Traditions for families <Accent tone="pink">who live apart.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Distance changes the shape of a tradition, not the point of it. Ofcom found that 74% of UK
                online adults used WhatsApp every day in May&nbsp;2025, so most families already have somewhere to
                meet. Give it a ritual:
              </p>
            </Prose>
            <Tips>
              <Tip icon={Sun}>The same photo on the same day: everyone sends a picture of their view at noon on New Year’s Day.</Tip>
              <Tip icon={Video}>A monthly video call with one question, chosen by a different branch of the family each time.</Tip>
              <Tip icon={ChefHat}>A long-distance dinner: everyone cooks the same recipe on the same night and compares results.</Tip>
              <Tip icon={Mailbox}>Birthday cards in the post as well as messages. A card can sit in a drawer for fifty years.</Tip>
              <Tip icon={AudioLines}>A voice-note chain on birthdays, so whoever is far away still hears everyone sing.</Tip>
            </Tips>
            <Prose>
              <p>One caution: chat threads scroll away. Once a year, save the best photos and voice notes somewhere that lasts.</p>
            </Prose>
          </GuideSection>

          <GuideSection
            title={
              <>
                How Ancestorii helps <Accent tone="pink">traditions last.</Accent>
              </>
            }
          >
            <Prose>
              <p>
                Traditions last when there is somewhere to keep them. In Ancestorii’s private My Family space,
                you can give a tradition its own timeline, such as Christmas Eve from the first year anyone
                remembers to now, and add a dated photo or video each year. The family can add comments and
                voice notes to the photos in each moment. Timelines are unlimited on every plan, and the family
                sees them on the website and in the phone app.
              </p>
              <p>
                You could also seal a capsule each New Year to open the next. Ancestorii sends no notification
                when a capsule opens, so put the date in the calendar. In the app, the Holidays &amp;
                Traditions chapter of ready-made questions has five you can send an older relative, such as
                “Every family’s got something that would completely baffle an outsider. What’s ours?”
              </p>
              <p>
                If you would like to share a tradition publicly, Our Stories has a free{' '}
                <Link href="/stories/topics/traditions">Traditions topic</Link> on the website. See how{' '}
                <Link href="/features/family-timeline">family timelines</Link> work, or start a yearly{' '}
                <Link href="/guides/what-to-put-in-a-time-capsule">time capsule</Link>.
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
              Start one this year.
              <br />
              <Accent tone="pink">Keep every year.</Accent>
            </>
          }
        >
          Give your family’s traditions a private home, with a timeline that grows every year.
        </GuideCta>
      </SiteShell>
    </>
  );
}
