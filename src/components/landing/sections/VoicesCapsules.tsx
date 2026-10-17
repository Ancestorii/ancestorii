import Image from 'next/image';
import type { CSSProperties } from 'react';
import landing from '../landing.module.css';
import s from './voicesCapsules.module.css';


const CAPSULE_CONTENTS = ['Photos', 'Videos', 'A letter', 'Voice notes', 'Loved ones'];

// The two features that keep what a photo can't. Voice notes are told through Dante's own words
// (his letter, WhyThisExists.tsx; the ellipsis marks the cut) beside his real photo with his mum.
// The capsule card is type and colour only, built from the product's own strings: 'Dear future me…'
// is the capsule letter's prompt. Checked against the product: voice notes are recorded or
// uploaded on all five surfaces and converted to M4A; capsules are web only, unlimited on every
// plan, and the seal lives in the interface, so no "not even us" and no unlock alerts.
export default function VoicesCapsules() {
  return (
    <section id="voices" className={landing.section}>
      <div className={landing.wrap}>
        <div className={landing.head}>
          <div className={s.tags}>
            <span className={landing.badge}>
              <span className={landing.badgeDot} style={{ '--dot': 'var(--c1)' } as CSSProperties} />
              Voice notes and Capsules
            </span>
          </div>
          <h2 className={`${landing.h2} ${s.title}`}>Keep what a photo can’t.</h2>
          <p className={landing.headLead}>
            <span className={landing.leadFull}>
              A photo shows you what someone looked like. A voice note keeps how they sounded, and a
              capsule keeps what you want to say to each other years from now.
            </span>
            <span className={landing.leadShort}>A voice note keeps how they sounded. A capsule keeps what you want to say years from now.</span>
          </p>
        </div>

        <div className={s.pair}>
          <div className={s.voices}>
            <div className={s.frame} style={{ '--frame': 'var(--c2)' } as CSSProperties}>
              <div className={s.photo}>
                {/* family.jpg is 2048x1536, already 4:3, so nothing is cropped. */}
                <Image
                  src="/family.jpg"
                  alt="Dante as a boy, sitting on the living room floor with his mum"
                  fill
                  sizes="(max-width: 599px) calc(100vw - 62px), (max-width: 899px) calc(100vw - 64px), (max-width: 1023px) calc(50vw - 60px), (max-width: 1287px) calc(47.5vw - 44px), 568px"
                  // Loaded up front at low priority, so a fast flick never reaches an empty frame.
                  loading="eager"
                  fetchPriority="low"
                  className={landing.coverImg}
                  style={{ objectPosition: '50% 50%' }}
                />
              </div>
              <span className={`${landing.storyChip} ${s.chip}`}>
                <span className={landing.storyChipDot} />
                {'Me and my mum\u00a0· May 2011'}
              </span>
            </div>

            <div className={s.block}>
              <h3 className={s.blockTitle}>Voice notes</h3>
              <p className={s.blockText}>
                Record or upload a voice note on album photos, timeline moments, capsules, family
                memories and Our Stories posts, or reply to a comment out loud. Every recording is
                converted so it plays on any phone.
              </p>
            </div>

            {/* Dante's words after the Voice notes block, so that block starts level with the
                Capsules block beside it. */}
            <figure className={s.figure}>
              <blockquote className={s.quote}>
                <span className={s.mark} aria-hidden="true">
                  “
                </span>
                <p>
                  The way my grandmother used to hum when she was cooking. … The sound of my mum
                  laughing at her own jokes before she even gets to the punchline.
                </p>
              </blockquote>
              <figcaption className={s.quoteBy}>Dante Leon, who built Ancestorii</figcaption>
            </figure>
          </div>

          <div className={s.capsules} id="capsules">
            <div className={s.capsule}>
              <p className={s.capsuleLabel}>Inside a capsule</p>
              <p className={s.capsuleLine}>Dear future me…</p>
              <ul className={s.capsuleChips}>
                {CAPSULE_CONTENTS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className={s.capsuleFoot}>Sealed until the date you choose</p>
            </div>

            <div className={s.block}>
              <h3 className={s.blockTitle}>Capsules</h3>
              <p className={s.blockText}>
                Fill a capsule with photos, videos, a letter and voice notes, tag the loved ones it’s
                for and pick the day it opens. Once it’s sealed, it stays shut until then. Unlimited on
                every plan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
