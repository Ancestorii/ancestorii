import Image from 'next/image';
import type { CSSProperties } from 'react';
import { LockKeyhole } from 'lucide-react';
import Fold from '../Fold';
import landing from '../landing.module.css';
import s from './myFamily.module.css';



// Every line is checked against the product: memories take up to 10 photos, one video (5 minutes
// on Free, 15 on Premium) and a voice note, and the private feed is in the app; one heart each,
// threaded text or voice comments; a reusable invite link or an email invite, with no member limit
// on any plan; alerts for hearts, comments, added perspectives and joins (nothing creates one for
// an answered question), and emails for answered questions and new members only (no "family
// activity" emails).
const CARDS: { dot: string; title: string; text: string }[] = [
  {
    dot: 'var(--c0)',
    title: 'Memories in your own words',
    text: 'Write a moment down with up to 10 photos, a video and a voice note. Videos run up to 5 minutes, or 15 on Premium.',
  },
  {
    dot: 'var(--c1)',
    title: 'Hearts, comments and voice replies',
    text: 'One heart each, threaded comments, and replies you can record instead of typing.',
  },
  {
    dot: 'var(--c2)',
    title: 'Bring everyone in',
    text: 'Share one invite link on WhatsApp or by text, or send a personal email invite. There’s no limit on family members, on any plan.',
  },
  {
    dot: 'var(--c3)',
    title: 'Know when it happens',
    text: 'Your phone and the website tell you when someone hearts or comments, adds their side of a memory or joins. Answered questions and new members come by email too.',
  },
];

// My Family, the private side, made concrete with a real photo: Dante (who built Ancestorii) and
// his sister in March 2010, a snowball fight they still remember differently. The caption and date
// are his own (WhyThisExists.tsx), and the story leads into Multiple Perspectives. No drawn UI.
export default function MyFamily() {
  return (
    <section id="my-family" className={landing.section}>
      <div className={landing.wrap}>
        <div className={landing.head}>
          <div className={s.tags}>
            <span className={landing.badge}>
              <span className={landing.badgeDot} style={{ '--dot': 'var(--c0)' } as CSSProperties} />
              {'My Family\u00a0· Private'}
            </span>
          </div>
          <h2 className={`${landing.h2} ${s.title}`}>Share it with the people who were there.</h2>
          <p className={landing.headLead}>
            <span className={landing.leadFull}>
              My Family is your family’s private space. Everyone you invite can share memories, photos
              and voice notes, and nobody else can get in. The private feed lives in the iPhone and
              Android app.
            </span>
            <span className={landing.leadShort}>A private space for the people you invite. Nobody else can get in.</span>
          </p>
        </div>

        <div className={s.feature}>
          <figure className={s.figure}>
            <div className={s.frame} style={{ '--frame': 'var(--c1)' } as CSSProperties}>
              <div className={s.photo}>
                <Image
                  src="/snow.jpg"
                  alt="Dante as a boy in the snow with his little sister, a snowball in his hand"
                  fill
                  sizes="(max-width: 599px) calc(100vw - 62px), (max-width: 759px) calc(100vw - 64px), (max-width: 1023px) calc(50vw - 60px), (max-width: 1287px) calc(47.5vw - 44px), 568px"
                  // Loaded up front at low priority, so a fast flick never reaches an empty frame.
                  loading="eager"
                  fetchPriority="low"
                  className={landing.coverImg}
                  style={{ objectPosition: '35% 50%' }}
                />
              </div>
              <span className={landing.storyChip}>
                <span className={landing.storyChipDot} />
                Dante’s family
              </span>
            </div>
            <figcaption className={s.caption}>
              <span className={s.captionQuote}>She still says she won the snowball fight.</span>
              <span className={s.captionBy}>
                {'Dante, who built Ancestorii, with his sister\u00a0· March\u00a02010'}
              </span>
            </figcaption>
          </figure>

          <div className={s.text}>
            <div className={s.kickerRow}>
              <span className={s.kicker}>Multiple perspectives</span>
            </div>
            <h3 className={s.textTitle}>Remember it differently? Keep both.</h3>
            <p className={s.textBody}>
              Anyone in the family can add their own version of a memory, in their own words and
              with up to 10 photos of their own, and each version sits on the same page as its own
              tab.
            </p>
          </div>
        </div>

        <Fold label="What you can do">
        <ul className={s.cards}>
          {CARDS.map((card) => (
            <li key={card.title} className={s.card} style={{ '--dot': card.dot } as CSSProperties}>
              <span className={s.cardDot} aria-hidden="true" />
              <div>
                <h3 className={s.cardTitle}>{card.title}</h3>
                <p className={s.cardText}>{card.text}</p>
              </div>
            </li>
          ))}
        </ul>
        </Fold>

        {/* "No ads" is on /pricing. Never "no tracking": the website loads marketing pixels. */}
        <p className={s.privacy}>
          <span className={s.lock} aria-hidden="true">
            <LockKeyhole size={20} strokeWidth={2.5} />
          </span>
          <span>
            <strong>Private to your family.</strong> Only the people you invite can see inside.
            Nothing goes public unless you choose to publish it on Our Stories, only the person who
            added something can delete it, and there are no ads.
          </span>
        </p>
      </div>
    </section>
  );
}
