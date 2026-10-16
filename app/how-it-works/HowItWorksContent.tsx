import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Ban,
  BookOpen,
  Gem,
  HeartHandshake,
  ImageIcon,
  Layers,
  ListOrdered,
  LockKeyhole,
  MessageCircleQuestionMark,
  Monitor,
  ShieldCheck,
  Smartphone,
  UserPlus,
} from 'lucide-react';
import StoreBadges from '@/components/StoreBadges';
import landing from '@/components/landing/landing.module.css';
import site from '@/components/site/site.module.css';
import {
  Accent,
  ArrowLink,
  ClosingCta,
  DotList,
  Eyebrow,
  PageHero,
  PanelCard,
  PhotoFrame,
  Prose,
  PullQuote,
} from '@/components/site/SiteBits';
import styles from './how-it-works.module.css';

type Tone = 'pink' | 'blue' | 'orange' | 'aqua';

/* ─── Rule card (for Our Stories rules): solid colour card, tilted icon tile ─── */
function RuleCard({
  title,
  Icon,
  tone,
  tilt,
  children,
}: {
  title: string;
  Icon: LucideIcon;
  tone: Tone;
  tilt: string;
  children: ReactNode;
}) {
  return (
    <li className={`${site.colorCard} ${styles.rule} ${styles[tone]}`} style={{ '--tilt': tilt } as CSSProperties}>
      <span className={styles.ruleTile} aria-hidden="true">
        <Icon size={30} strokeWidth={2.5} />
      </span>
      <p className={styles.ruleText}>
        <strong className={styles.ruleTitle}>{title}</strong>{' '}{children}
      </p>
    </li>
  );
}

/* ─── Product card (for My Heirlooms): white card, coloured icon tile ─── */
function ProductCard({
  title,
  Icon,
  tone,
  tilt,
  children,
}: {
  title: string;
  Icon: LucideIcon;
  tone: Tone;
  tilt: string;
  children: ReactNode;
}) {
  return (
    <li className={`${site.card} ${styles.product} ${styles[tone]}`} style={{ '--tilt': tilt } as CSSProperties}>
      <span className={styles.productTile} aria-hidden="true">
        <Icon size={28} strokeWidth={2.5} />
      </span>
      <div>
        <h4 className={site.cardTitle}>{title}</h4>
        <p className={site.cardText}>{children}</p>
      </div>
    </li>
  );
}

/* ─── Strike step (for three-strike policy) ─── */
function StrikeStep({
  step,
  label,
  tone,
  children,
}: {
  step: string;
  label: string;
  tone: Tone;
  children: ReactNode;
}) {
  return (
    <li className={`${site.card} ${styles.strike} ${styles[tone]}`}>
      <span className={styles.strikeNum} aria-hidden="true">
        {step}
      </span>
      <div>
        <p className={styles.strikeLabel}>{label}</p>
        <p className={styles.strikeText}>{children}</p>
      </div>
    </li>
  );
}

export default function HowItWorksContent() {
  return (
    <>
      {/* ━━━ HERO ━━━ */}
      <PageHero
        eyebrow="How It Works"
        eyebrowDot="var(--c1)"
        title={
          <>
            Two sides.
            <br />
            <Accent>One family.</Accent>
          </>
        }
        lead={
          <>
            Ancestorii is built around a simple idea. Some memories are meant to be shared with the world. Others are meant to stay in the family.
          </>
        }
      >
        <ArrowLink href="/signup" className={landing.btnShadow}>
          Start For Free
        </ArrowLink>
        <Link href="/stories" className={landing.btnOutline}>
          Our Stories
        </Link>
      </PageHero>

      {/* ━━━ TWO SIDES ━━━ */}
      <div className={styles.pair}>
        <div className={`${styles.side} ${styles.sidePublic}`}>
          <PhotoFrame
            src="/landing/hero-sunday-dinner.jpg"
            alt="Sunday dinner at Nan's"
            label="Our Stories"
            color="var(--c0)"
            aspect="5 / 4"
            sizes="(max-width: 599px) 84vw, (max-width: 999px) 46vw, 430px"
            preload
          />
        </div>
        <div className={`${styles.side} ${styles.sidePrivate}`}>
          <PhotoFrame
            src="/landing/hero-nan-twins.jpg"
            alt="Nan with the twins"
            label="My Family"
            color="var(--c1)"
            aspect="5 / 4"
            position="62% 40%"
            sizes="(max-width: 599px) 84vw, (max-width: 999px) 46vw, 430px"
          />
        </div>
      </div>

      <div className={styles.intro}>
        <p>
          So we gave you both. A public feed called <strong>Our Stories</strong>, where families share memories openly and anyone can read them. And a private side called <strong>My Family</strong>, where everything stays between the people you invite. Nobody else gets in.
        </p>
        <p className={styles.introBridge}>
          They work side by side, but they do very different things. Here is how.
        </p>
      </div>

      {/* ━━━ ONE PRODUCT, ONE LOGIN ━━━ */}
      <section className={site.section} id="one-login">
        <div className={landing.wrap}>
          <div className={styles.headRow}>
            <div className={styles.head}>
              <Eyebrow dot="var(--c3)">The app and the website</Eyebrow>
              <h2 className={landing.h2}>
                One product. <Accent tone="blue">One login.</Accent>
              </h2>
            </div>
            <p className={styles.headLead}>
              Ancestorii is one product with one account. There is a phone app and there is this website. You log in to both with the same email and password. What your family adds in one place is there in the other.
            </p>
          </div>

          <div className={styles.panelGrid}>
            <PanelCard
              Icon={Smartphone}
              title="In the app"
              text={
                <>
                  Your family writes and shares stories, adds photos and voice notes, answers questions, and earns rewards as your library grows. The app is on iPhone and Android.
                </>
              }
              color="var(--c0)"
              tilt="-4deg"
            />
            <PanelCard
              Icon={Monitor}
              title="On the website"
              text={
                <>
                  You upgrade your plan, redeem the rewards your family has earned, and order printed keepsakes: Memory Books, Canvas Prints, and Acrylic Prints.
                </>
              }
              color="var(--c1)"
              tilt="3deg"
            />
          </div>

          <div className={styles.strip}>
            <p className={styles.stripText}>One family. One account. Two places to use it.</p>
            <StoreBadges theme="light" className={styles.stripBadges} />
          </div>
        </div>
      </section>

      {/* ━━━ OUR STORIES ━━━ */}
      <section className={site.section} id="our-stories">
        <div className={landing.wrap}>
          <div className={styles.head}>
            <Eyebrow dot="var(--c0)">Public</Eyebrow>
            <h2 className={landing.h2}>Our Stories</h2>
          </div>

          <div className={styles.split}>
            <Prose className={styles.copy}>
              <p>
                This is the open side of Ancestorii. When you publish a story here, anyone on the platform can read it. They can react to it. They can leave a comment. They can share it with someone who needs to hear it.
              </p>
              <p>
                Think of it as a place for the stories you want to pass on beyond your own family. Your grandparents&rsquo; journey to a new country. The tradition your family kept alive for decades. The recipe that started arguments every Christmas. These are the memories that connect people across families, across cultures, across generations.
              </p>
              <p>
                You decide what goes public. Nothing is ever pushed there without your say.
              </p>
            </Prose>
            <div className={styles.aside}>
              <PullQuote>
                This is not social media.{' '}
                <span className={styles.quoteLine}>
                  <Accent tone="blue">It is a memory space with a door that stays open.</Accent>
                </span>
              </PullQuote>
            </div>
          </div>

          <p className={styles.leadIn}>
            We stripped out everything that makes sharing exhausting on other platforms.
          </p>

          {/* ── Rules as cards ── */}
          <ul className={styles.cardGrid}>
            <RuleCard title="There is no algorithm." Icon={ListOrdered} tone="pink" tilt="-4deg">
              Stories appear in the order they are published. Nobody&rsquo;s memory gets buried because it did not perform well. Nobody&rsquo;s story gets boosted because it went viral. Every family gets the same treatment.
            </RuleCard>
            <RuleCard title="There are no follower counts." Icon={HeartHandshake} tone="blue" tilt="3deg">
              You are not building an audience. You are not competing with anyone. There are no metrics, no vanity numbers, no pressure to perform. You share a memory because it matters to you, and that is enough.
            </RuleCard>
            <RuleCard title="There is no religion or politics." Icon={Ban} tone="orange" tilt="-3deg">
              This is a hard rule. Our Stories exists for memories only. Faith and political views are personal, and they belong in personal conversations. Not here. This space is for the stuff that brings families together, not the stuff that tears people apart.
            </RuleCard>
          </ul>

          <p className={styles.closing}>
            Just memories. A first day of school. A Sunday dinner tradition. The way your grandfather held his cup of tea. That is what this space is for. Nothing else.
          </p>
        </div>
      </section>

      {/* ━━━ MY FAMILY ━━━ */}
      <section className={site.section} id="my-family">
        <div className={landing.wrap}>
          <div className={styles.head}>
            <Eyebrow dot="var(--c1)">Private</Eyebrow>
            <h2 className={landing.h2}>My Family</h2>
          </div>

          <div className={`${styles.split} ${styles.splitFlip}`}>
            <Prose className={styles.copy}>
              <p>
                This is the closed side. Your family&rsquo;s private feed. When you write a memory here, only your family sees it. The photos you would never post anywhere. The voice your mum uses when she tells that story one more time. The details that only mean something to the people who were there.
              </p>
              <p>
                Only family members you invite can see what is inside. Nobody else can browse it, search for it, or stumble into it. There is no discovery feed for private content. There is no &ldquo;suggested families&rdquo; feature. The family feed is a locked room and the only people with a key are the ones you hand it to.
              </p>
            </Prose>
            <div className={styles.aside}>
              <PullQuote>
                When a family knows a space is private, they speak differently.{' '}
                <span className={styles.quoteLine}>
                  <Accent tone="blue">They tell the real story.</Accent>
                </span>
              </PullQuote>
            </div>
          </div>

          <p className={styles.leadInBody}>
            Your family writes memories in the app. A moment, a person, a feeling you do not want to lose. Each one becomes an entry in your family&rsquo;s feed. From there the library grows, not because you are building content, but because you are asking the right questions.
          </p>

          {/* ── Features as cards in a grid ── */}
          <div className={styles.panelGrid}>
            <PanelCard
              Icon={LockKeyhole}
              num="01"
              title="The Private Feed"
              text={
                <>
                  Every memory your family writes appears here — photos, text, voice notes. Same visual feel as the public feed, but locked to your family. No algorithm deciding what you see. No strangers reading your stories. Just the people you trust, sharing the moments that matter.
                </>
              }
              color="var(--c1)"
              tilt="-4deg"
            />
            <PanelCard
              Icon={MessageCircleQuestionMark}
              num="02"
              title="Question Prompts"
              text={
                <>
                  Pick from dozens of curated questions across chapters like Growing Up, Holidays, Around the Table, and The Stories We Always Retell. Send a question to a family member. When they answer, their memory appears in your feed. They do not even need an account — they click the link, write their answer, and they are in.
                </>
              }
              color="var(--c0)"
              tilt="3deg"
            />
            <PanelCard
              Icon={Layers}
              num="03"
              title="Multiple Perspectives"
              text={
                <>
                  When two people remember the same moment differently, both versions live on the same page as tabs. Nicole&rsquo;s Memory. Dante&rsquo;s Memory. Maria&rsquo;s Memory. Click a tab and the entire story changes — different words, different photos, different feelings about the same moment. That is what makes a family archive feel alive.
                </>
              }
              color="var(--c3)"
              tilt="-3deg"
            />
            <PanelCard
              Icon={UserPlus}
              num="04"
              title="Invite &amp; Collaborate"
              text={
                <>
                  Send a question or share a link. Family members join your library and start contributing — their own memories, their own photos, their reactions and comments on yours. Everyone adds their piece. The collection grows richer because no single person holds the whole story.
                </>
              }
              color="var(--c2)"
              tilt="4deg"
            />
          </div>

          <p className={styles.closing}>
            You also have albums to group memories by chapter — a wedding, a childhood home, a decade of Sunday mornings — and timelines to place a life in order, so your children do not have to guess what happened when or why it mattered.
          </p>

          {/* ── MY HEIRLOOMS ── */}
          <div className={styles.heirlooms}>
            <div className={styles.heirloomsCopy}>
              <div className={styles.head}>
                <Eyebrow dot="var(--c2)">Physical</Eyebrow>
                <h3 className={styles.heirloomsTitle}>My Heirlooms</h3>
              </div>
              <p className={styles.heirloomsLead}>
                Digital memories are fragile. Platforms close. Devices break. Accounts get lost. My Heirlooms lets you turn your family&rsquo;s library into something real. Something you can hold, hang on a wall, and pass down.
              </p>
            </div>
            <div className={styles.heirloomsPhoto}>
              <PhotoFrame
                src="/testimonial4.png"
                alt="Andrea holding her printed Ancestorii Memory Book about her dad"
                label="Andrea · Dudley, UK"
                color="var(--c2)"
                aspect="1 / 1"
                position="58% 50%"
                sizes="(max-width: 599px) 90vw, 420px"
              />
            </div>
          </div>

          {/* ── Products as cards ── */}
          <ul className={styles.cardGrid}>
            <ProductCard title="Memory Book" Icon={BookOpen} tone="orange" tilt="-4deg">
              A printed, hardcover book built from your family&rsquo;s stories, photos, and timelines. You design it in our book editor, we print it at professional quality and deliver it to your door. Three tiers available, from a single chapter to a full legacy edition.
            </ProductCard>
            <ProductCard title="Canvas Print" Icon={ImageIcon} tone="pink" tilt="3deg">
              A meaningful photo turned into a gallery quality canvas. The kind of image that belongs on a wall, not buried in a camera roll. Museum grade print on stretched canvas.
            </ProductCard>
            <ProductCard title="Acrylic Print" Icon={Gem} tone="aqua" tilt="-3deg">
              A photo printed behind polished acrylic glass. Vivid colour, clean edges, and the kind of weight that makes a memory feel permanent. High definition UV print with a contemporary finish.
            </ProductCard>
          </ul>

          <p className={styles.closing}>
            Everything you create in My Heirlooms is built from the memories already in your private library. The physical product is the final step, not the starting point.
          </p>
        </div>
      </section>

      {/* ━━━ COMMUNITY STANDARDS ━━━ */}
      <section className={site.section} id="standards">
        <div className={landing.wrap}>
          <div className={styles.head}>
            <Eyebrow dot="var(--c3)">Standards</Eyebrow>
            <h2 className={landing.h2}>
              Keeping the space{' '}
              <Accent tone="pink">safe.</Accent>
            </h2>
          </div>

          <div className={styles.split}>
            <Prose className={styles.copy}>
              <p>
                Our Stories is a shared space. And shared spaces only work when everyone agrees on what belongs there.
              </p>
              <p>
                Every story published to the public feed is reviewed before it goes live. If it does not meet our standards, it does not appear. Simple as that.
              </p>
              <p>
                We review for religious or political content of any kind, hate speech, harassment, discriminatory language, spam, self promotion, commercial content, and anything that is not a genuine family memory. If it is not a memory, it does not belong.
              </p>
            </Prose>
            <div className={styles.aside}>
              <PullQuote>
                A space for family memories only works{' '}
                <span className={styles.quoteLine}>
                  <Accent tone="blue">if it stays that way.</Accent>
                </span>
              </PullQuote>
            </div>
          </div>

          <p className={styles.leadIn}>
            If a published story breaks the rules, we follow a three strike policy.
          </p>

          {/* ── Three-strike policy as visual steps ── */}
          <ol className={styles.cardGrid}>
            <StrikeStep step="1" label="First time" tone="aqua">
              The story is removed and we send you an email explaining what happened and why. Everyone makes mistakes.
            </StrikeStep>
            <StrikeStep step="2" label="Second time" tone="orange">
              The story is removed, you get a final warning, and you are suspended from publishing to Our Stories for seven days.
            </StrikeStep>
            <StrikeStep step="3" label="Third time" tone="pink">
              You are permanently banned from Our Stories. You can no longer publish, comment, or interact with the public feed.
            </StrikeStep>
          </ol>

          <div className={styles.promise}>
            <span className={styles.promiseTile} aria-hidden="true">
              <ShieldCheck size={36} strokeWidth={2.5} />
            </span>
            <p className={styles.promiseText}>
              <strong>One thing that will never happen:</strong> your private library is never touched. Strikes only affect the public side. My Family is yours. We do not go near it.
            </p>
          </div>

          <p className={styles.closing}>
            We also have a report button on every story, so if something slips through, the community can flag it. When you open Our Stories, you should find exactly what you came for. Real memories from real families. Nothing else.
          </p>
        </div>
      </section>

      {/* ━━━ CTA ━━━ */}
      <ClosingCta
        wide
        size="md"
        prefetch
        className={styles.cta}
        title={
          <>
            <span className={styles.ctaLine}>Some memories are for everyone.</span>{' '}
            <span className={`${styles.ctaLine} ${site.accentPink}`}>Some are just for your family.</span>
          </>
        }
        lead="Share stories with the world. Keep memories with your family. Build something that lasts."
        primary={{ href: '/signup', label: 'Start For Free' }}
      >
        <DotList center items={['Free forever', 'No credit card', 'Takes 2 minutes']} />
        <StoreBadges theme="dark" className={styles.ctaBadges} />
      </ClosingCta>
    </>
  );
}
