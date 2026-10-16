'use client';

import Image from 'next/image';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { Accent, ClosingCta, DotList, Eyebrow } from '@/components/site/SiteBits';
import landing from '@/components/landing/landing.module.css';
import site from '@/components/site/site.module.css';
import styles from '@/components/site/why-rewards/whyThisExists.module.css';

/* ─── Family photo in a solid colour frame, caption chip on its edge ─── */
function StoryPhoto({
  src,
  alt,
  caption,
  color,
  ratio,
  side = 'right',
  portrait = false,
}: {
  src: string;
  alt: string;
  caption: string;
  color: string;
  ratio: string;
  side?: 'left' | 'right';
  portrait?: boolean;
}) {
  return (
    <figure
      className={`${styles.photo} ${side === 'left' ? styles.photoLeft : ''} ${portrait ? styles.photoPortrait : ''}`}
      style={{ '--card': color } as CSSProperties}
    >
      <div className={site.photoFrame}>
        <div className={site.photoFrameInner} style={{ aspectRatio: ratio }}>
          <Image
            src={src}
            alt={alt}
            fill
            sizes={portrait ? '(max-width: 599px) 92vw, 440px' : '(max-width: 599px) 92vw, (max-width: 899px) 560px, 540px'}
            loading="lazy"
            className={landing.coverImg}
          />
        </div>
      </div>
      <figcaption className={styles.caption}>
        <span className={styles.captionDot} aria-hidden="true" />
        {/* Non-breaking space before each " · " so a wrapped line never starts with the dot. */}
        <span>{caption.replace(/ · /g, ' · ')}</span>
      </figcaption>
    </figure>
  );
}

/* ─── Photo + text row (the photo side alternates) ─── */
function Row({ photo, flip = false, children }: { photo: ReactNode; flip?: boolean; children: ReactNode }) {
  return (
    <div className={`${landing.wrap} ${styles.row} ${flip ? styles.rowFlip : ''}`}>
      {photo}
      <Body className={styles.rowText}>{children}</Body>
    </div>
  );
}

/* ─── Pull quote ─── */
function PullQuote({ children }: { children: ReactNode }) {
  return (
    <div className={landing.wrap}>
      <blockquote className={styles.quote}>
        <span className={styles.quoteMark} aria-hidden="true">
          “
        </span>
        <p className={styles.quoteText}>{children}</p>
      </blockquote>
    </div>
  );
}

/* ─── Body text wrapper ─── */
function Body({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${site.prose} ${className}`}>{children}</div>;
}

/* ─── Share button ─── */
function ShareButton() {
  const [copied, setCopied] = useState(false);
  const url = 'https://www.ancestorii.com/why-this-exists';
  const text = 'The story behind Ancestorii — why one person decided to build a place where families can share the moments that matter.';

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Our Roots — Why Ancestorii Exists', text, url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <button
      onClick={handleShare}
      className={`${site.btnLine} ${styles.share}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      {copied ? 'Link copied' : 'Share this story'}
    </button>
  );
}

/* ─── The founder's letter ─── */
export default function WhyThisExists() {
  return (
    <>
      <article className={styles.letter}>

        {/* Hero: the landing's big centred title, one gradient phrase */}
        <header className={`${site.hero} ${styles.hero}`}>
          <div className={`${site.heroInner} ${styles.heroInner}`}>
            <div className={site.heroTop}>
              <Eyebrow dot="var(--c0)">Our Roots</Eyebrow>
            </div>

            <h1 className={`${site.heroTitle} ${styles.title}`}>
              I built this because<br />
              <Accent>I was scared of forgetting.</Accent>
            </h1>

            {/* Byline */}
            <p className={styles.byline}>
              Written by Dante Leon, Founder of Ancestorii
            </p>
          </div>
        </header>

        <div className={styles.flow}>

          {/* ─── Opening ─── */}
          <Body className={styles.column}>
            <p className={site.proseLead}>
              Not the big things. You remember birthdays and weddings and holidays. I was scared of losing the small stuff. The way my grandmother used to hum when she was cooking. The way she would describe the village she grew up in, always with the same faraway look, always adding a detail she had never mentioned before. The sound of my mum laughing at her own jokes before she even gets to the punchline.
            </p>

            <p>
              Those moments are not written down anywhere. They do not exist in a photo album or a cloud folder or a social media post. They live in people&apos;s heads, and when those people are gone, the moments go with them. Quietly. Without anyone noticing until it is too late.
            </p>

            <p>
              That thought sat with me for a long time. It would come back to me at the strangest moments. During a phone call with my mum when she would mention something I had completely forgotten. At a family gathering when someone would start a story and the whole room would go quiet, leaning in, because everyone knew this was a good one.
            </p>
          </Body>

          <Row
            photo={
              <StoryPhoto src="/outdoor.jpg" alt="Dante posing outdoors" caption="Me, pretending I was too cool to smile · July 2010" color="var(--c0)" ratio="4 / 3" />
            }
          >
            <p>
              I grew up in a house full of stories. My family talked a lot. Around the dinner table, on car journeys, at every gathering that went on too long. There was always someone telling a story about something that happened years ago, and everyone would laugh or argue about whether that was really how it went. Someone would say &quot;no, that is not what happened at all&quot; and then tell their version, which was completely different but somehow just as true.
            </p>

            <p>
              But none of it was ever captured. Not the voices. Not the details. Not the way my grandmother described the recipe she never once measured but always got right, or the way she would wave her hand dismissively when you asked her how much of something to add, as if the question itself was ridiculous. We had photos, sure. Boxes of them, folders on phones, thousands sitting in cloud storage that nobody ever opens. But a photo only shows you what something looked like. It does not tell you what it felt like. It does not tell you the story behind it.
            </p>

            <p>
              A photo of my grandmother in her kitchen tells you nothing about the smell of that kitchen, or the sound of oil crackling in the pan, or the fact that she would sing under her breath while she cooked and pretend she was not singing when you pointed it out.
            </p>
          </Row>

          <PullQuote>
            A photo tells you what someone looked like.{' '}
            <Accent tone="blue">It does not tell you who they were.</Accent>
          </PullQuote>

          <Row
            flip
            photo={
              <StoryPhoto src="/snow.jpg" alt="Dante and his sister in the snow" caption="She still says she won the snowball fight · March 2010" color="var(--c1)" ratio="720 / 481" side="left" />
            }
          >
            <p>
              I kept thinking about that. About how every family has this invisible archive of moments that are slowly disappearing. Recipes that only one person knows. Stories that only get told when a certain aunt visits. Voices that you will one day only hear in your memory, and even that will start to fade.
            </p>

            <p>
              And I kept thinking, someone should build a place for all of this. Not a social media page where it gets buried under ads and algorithms. Not a notes app where it sits forgotten in a list. Not a shared Google Drive where files go to die. Something designed specifically for the things that families carry but never write down. Something that treats those moments with the weight they deserve.
            </p>

            <p>
              I looked for something like that. I looked for a long time. I found apps that store photos. I found apps that build family trees. I found apps that let you record audio. But I could not find a single place that brought all of it together. A place where you could write the story, attach the photo, record the voice, and know that it was all going to be there in ten, twenty, fifty years. A place that was not trying to sell your attention to advertisers or bury your memories behind a paywall.
            </p>

            <p className={styles.beat}>
              So I decided to build it myself.
            </p>
          </Row>

          <Body className={styles.column}>
            <p>
              I called it Ancestorii. Ancestors and story, blended into one word. The double &quot;i&quot; at the end was not a stylistic choice. It stands for two people. The one telling the story and the one receiving it. Because memory does not survive alone. It only survives in the handoff — from a grandmother to a grandchild, from a father to a son, from the person who lived it to the person who will carry it forward.
            </p>
          </Body>

          <PullQuote>
            Ancestors + Story = Ancestorii. The double &quot;i&quot; is the handoff —{' '}
            <Accent tone="blue">the moment a story stops belonging to one person and starts belonging to a family.</Accent>
          </PullQuote>

          <Row
            photo={
              <StoryPhoto src="/garden.jpg" alt="Dante and his sister in the garden" caption="Me and my sister in the garden · Mum's favourite photo of us · May 2013" color="var(--c3)" ratio="3 / 4" portrait />
            }
          >
            <p>
              I am 27 years old. I work full time as an aircraft mechanic for British Airways. I am not a Silicon Valley founder with a pitch deck and a trust fund. I do not have a team of engineers or investors writing cheques. I work shifts, four days on, four days off, and on my days off I build Ancestorii. Every feature, every page, every word you are reading right now was built by one person, on a laptop, in between maintaining aircraft and walking my dog.
            </p>

            <p>
              I tell you this not because it makes for a good story, but because I want you to understand something. This was not built to chase a trend or fill a gap in the market. This was not born out of a brainstorming session or a whiteboard full of sticky notes. This was built because I genuinely could not find anything like it, and I could not stop thinking about how much we lose when we do not write things down.
            </p>
          </Row>

          <PullQuote>
            I could not stop thinking about how much we lose{' '}
            <Accent tone="blue">when we do not write things down.</Accent>
          </PullQuote>

          <Row
            flip
            photo={
              <StoryPhoto src="/family.jpg" alt="Dante and his mum sitting on the floor" caption="Me and my mum · The woman behind everything · May 2011" color="var(--c2)" ratio="4 / 3" side="left" />
            }
          >
            <p>
              Think about your own family for a second. Think about the person who always tells the best stories. The one who remembers everything. The one who cooks that dish that nobody else can quite get right, no matter how many times they try. The one whose laugh you can hear in your head right now, even if you have not seen them in months.
            </p>

            <p>
              Now imagine all of that just gone. Not because something dramatic happened, but because nobody ever thought to write it down. Nobody pressed record. Nobody said, &quot;Tell me that story again, slowly, so I can keep it.&quot; Nobody took two minutes to type out the recipe, or describe the way the kitchen smelled on a Sunday afternoon, or explain why that one photograph on the mantelpiece means so much.
            </p>

            <p>
              That is what happens in most families. Not out of carelessness, but out of the quiet assumption that there will always be more time. That the person who knows the story will always be there to tell it again. Until one day they are not.
            </p>
          </Row>

          <Row
            photo={
              <StoryPhoto src="/sister.jpg" alt="A childhood memory" caption="A childhood memory · the kind of moment that disappears if nobody writes it down" color="var(--c0)" ratio="720 / 482" />
            }
          >
            <p className={styles.beat}>
              That is what Ancestorii is for.
            </p>

            <p>
              It is a place where you can share the story behind the photo. Where you can record your grandmother&apos;s voice telling that story one more time. Where you can write down the recipe that has been in your family for three generations but only exists in someone&apos;s head. Where you can describe what Christmas morning actually felt like in your house, not the version you post online, but the real one. The messy, loud, beautiful, chaotic real one.
            </p>

            <p>
              It is a place where your children, and their children, can come back one day and understand not just what your family looked like, but what your family was actually like. The inside jokes. The traditions that made no sense to anyone else. The arguments that became legendary. The quiet moments that mattered more than anyone realised at the time.
            </p>
          </Row>

          <Body className={styles.column}>
            <p>
              I did not build this for millions of users. I built this for the person who has been meaning to write things down but never has. For the family that has a hundred stories but nowhere to put them. For the person who lost a grandparent last year and realised, too late, how much went with them. For the person who picks up their phone to call someone who is no longer there, just because they heard a song or smelled something that brought it all back.
            </p>

            <p className={styles.beat}>
              If that is you, this is for you.
            </p>

            <p>
              Every family has moments worth sharing. Not with the whole internet. Not for likes or followers. But with the people who were there, and the people who will come after. The ones who will one day ask, &quot;What was she like?&quot; or &quot;How did we end up with that tradition?&quot; or &quot;Why does this recipe taste different when anyone else makes it?&quot;
            </p>

            <p>
              That is why Ancestorii exists. It exists because I believe the most important stories in the world are not the ones that make the news. They are the ones told around kitchen tables, on long drives, and at family gatherings that nobody wants to leave. They are the ones that start with &quot;Do you remember when...&quot; and end with everyone laughing so hard that someone has to leave the room.
            </p>
          </Body>

          <PullQuote>
            The most important stories in the world are not the ones that make the news.{' '}
            <Accent tone="blue">They are the ones told around kitchen tables.</Accent>
          </PullQuote>

          <Body className={styles.column}>
            <p>
              I am going to keep building this. I am going to keep making it better. I am going to keep adding features that make it easier to capture the things that matter, and I am going to keep fighting for the idea that your family&apos;s story is worth more than a folder of photos that nobody opens.
            </p>

            <p>
              And I hope that one day, when someone in your family asks &quot;Do you remember that story about...&quot; the answer will not be silence. It will not be &quot;I think so, but I cannot quite remember how it went.&quot; It will be, &quot;Yes. It is all here. Let me show you.&quot;
            </p>

            <p className={styles.beat}>
              That is all I wanted to build. A&nbsp;place where nothing gets lost.
            </p>
          </Body>

          {/* Sign off */}
          <footer className={`${styles.column} ${styles.signoff}`}>
            <div>
              <p className={styles.signName}>
                Dante Leon
              </p>
              <p className={styles.signRole}>Founder, Ancestorii</p>
            </div>
            <ShareButton />
          </footer>
        </div>
      </article>

      {/* CTA: the landing's closing slab */}
      <ClosingCta
        prefetch
        title={
          <>
            Every family has a story{' '}<Accent tone="pink">worth sharing.</Accent>
          </>
        }
        lead="Two minutes. Your words. A memory that lives on."
        primary={{ href: '/signup', label: 'Start For Free' }}
      >
        <DotList center items={['Free forever', 'No credit card', 'Takes 2 minutes']} />
      </ClosingCta>
    </>
  );
}
