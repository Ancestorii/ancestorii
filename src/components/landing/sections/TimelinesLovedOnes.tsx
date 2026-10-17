import Image from 'next/image';
import type { CSSProperties } from 'react';
import Fold from '../Fold';
import landing from '../landing.module.css';
import s from './timelinesLovedOnes.module.css';

// Timelines and Loved Ones. The timeline is drawn from Dante's four dated photos with his own
// captions and dates (WhyThisExists.tsx), the same family photos now in date order. The chapter
// names and prompts are the Loved Ones page's own (family/[id]/_components/StorySection.tsx).
// The Free plan's single loved one is the limit the family page enforces.


// Each frame takes the photo's colour on the founder's page. A no-break space keeps each "·"
// with the words before it.
const NODES = [
  {
    date: 'March 2010',
    dateTime: '2010-03',
    src: '/snow.jpg',
    alt: 'Dante as a boy in the snow with his little sister',
    caption: 'She still says she won the snowball fight',
    tone: 'var(--c1)',
    position: '35% 50%',
  },
  {
    date: 'July 2010',
    dateTime: '2010-07',
    src: '/outdoor.jpg',
    alt: 'Dante as a boy in a pink shirt and a cap, outdoors among the trees',
    caption: 'Me, pretending I was too cool to smile',
    tone: 'var(--c0)',
    position: '50% 50%',
  },
  {
    date: 'May 2011',
    dateTime: '2011-05',
    src: '/family.jpg',
    alt: 'Dante as a boy, sitting on the living room floor with his mum',
    caption: 'Me and my mum\u00a0· The woman behind everything',
    tone: 'var(--c2)',
    position: '50% 50%',
  },
  {
    date: 'May 2013',
    dateTime: '2013-05',
    src: '/garden.jpg',
    alt: 'Dante’s little sister on a red toy tractor in the garden, with Dante behind her',
    caption: 'Me and my sister in the garden\u00a0· Mum’s favourite photo of us',
    tone: 'var(--c3)',
    // A 4:3 window on a portrait photo: keeps Dante at the back and his sister's face.
    position: '50% 8%',
  },
];

const THUMB_SIZES =
  '(max-width: 599px) 100px, (max-width: 899px) 160px, (max-width: 1287px) calc(25vw - 44px), 278px';

const FACTS = [
  {
    lead: 'Moments with dates.',
    text: 'Each one has a title, a date and a photo or video, and the family can add comments and voice notes as memories come back.',
    dot: 'var(--c0)',
  },
  {
    lead: 'A PDF to keep.',
    text: 'Download the whole timeline as a PDF, with a photo for each moment.',
    dot: 'var(--c1)',
  },
  {
    lead: 'Unlimited on every plan.',
    text: 'In the app, or on the website on a laptop or desktop.',
    dot: 'var(--c2)',
  },
];

const CHAPTERS = [
  { name: 'Early years', prompt: 'Where were they born?', dot: 'var(--c0)' },
  { name: 'Important moments', prompt: 'What made them proud?', dot: 'var(--c2)' },
  { name: 'Special memories', prompt: 'Which memory still makes you smile?', dot: 'var(--c3)' },
  { name: 'Who they are', prompt: 'What little habits or phrases made them feel like them?', dot: 'var(--c1)' },
];

export default function TimelinesLovedOnes() {
  return (
    <section id="timelines" className={landing.section}>
      <div className={landing.wrap}>
        <div className={landing.head}>
          <div className={s.tags}>
            <span className={landing.badge}>
              <span
                className={landing.badgeDot}
                style={{ '--dot': 'var(--c3)' } as CSSProperties}
                aria-hidden="true"
              />
              Timelines and Loved Ones
            </span>
          </div>
          <h2 className={`${landing.h2} ${s.title}`}>Put a life in order.</h2>
          <p className={landing.headLead}>
            <span className={landing.leadFull}>
              Give each moment a date and see a life laid out from start to finish. Then give everyone
              who shaped your family a page of their own.
            </span>
            <span className={landing.leadShort}>A life in date order, and a page for everyone who shaped your family.</span>
          </p>
        </div>

        <figure className={s.timelineFigure}>
          <ol className={s.timeline}>
            {NODES.map((node) => (
              <li key={node.dateTime} className={s.node} style={{ '--tone': node.tone } as CSSProperties}>
                <time className={s.date} dateTime={node.dateTime}>
                  {node.date}
                </time>
                <span className={s.dot} aria-hidden="true" />
                <div className={s.thumbFrame}>
                  <div className={s.thumb}>
                    <Image
                      src={node.src}
                      alt={node.alt}
                      fill
                      sizes={THUMB_SIZES}
                      // Loaded up front at low priority, so a fast flick never reaches an empty frame.
                      loading="eager"
                      fetchPriority="low"
                      className={landing.coverImg}
                      style={{ objectPosition: node.position }}
                    />
                  </div>
                </div>
                <p className={s.caption}>{node.caption}</p>
              </li>
            ))}
          </ol>
          <figcaption className={s.credit}>Dante’s family photos, now in date order.</figcaption>
        </figure>

        <div className={s.split}>
          <Fold label="What timelines do">
          <ul className={s.facts}>
            {FACTS.map((fact) => (
              <li key={fact.lead} style={{ '--dot': fact.dot } as CSSProperties}>
                {/* One span, so the bold lead-in runs on into its sentence beside the dot. */}
                <span>
                  <strong>{fact.lead}</strong>{' '}{fact.text}
                </span>
              </li>
            ))}
          </ul>
          </Fold>

          <div className={s.people}>
            <h3 className={s.peopleTitle}>A page for everyone who shaped you.</h3>
            <p className={s.peopleText}>
              Add their photo, how they’re related and their dates, then tell their life story in four
              chapters, each with a photo and gentle questions to start you off. Every album, timeline
              and capsule they’re tagged in gathers on their page.
            </p>
            <Fold label="The four chapters">
            <ol className={s.chapters}>
              {CHAPTERS.map((chapter) => (
                <li key={chapter.name} style={{ '--dot': chapter.dot } as CSSProperties}>
                  <span className={s.chapterName}>{chapter.name}</span>
                  <span className={s.chapterPrompt}>“{chapter.prompt}”</span>
                </li>
              ))}
            </ol>
            </Fold>
            <p className={s.fine}>
              Story Assistance can suggest questions for each chapter. Free families can add one loved
              one; Premium families, as many as they like.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
