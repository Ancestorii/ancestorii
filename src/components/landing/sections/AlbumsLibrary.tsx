import Image from 'next/image';
import type { CSSProperties } from 'react';
import Fold from '../Fold';
import landing from '../landing.module.css';
import s from './albumsLibrary.module.css';

// Albums and the family Library. Dante's real photo and his own three-part caption
// (WhyThisExists.tsx), set out under an album photo's real fields: its title, the panel's
// 'When Was This?' date and its 'The Story' thread (albums/_components/StoryPanel.tsx).
// Type beside a real photo, not a screenshot; the credit line says so.


const LABEL = [
  { term: 'Title', value: 'Me and my sister in the garden' },
  { term: 'When was this?', value: 'May 2013' },
  { term: 'The Story', value: 'Mum’s favourite photo of us.' },
];

const FACTS = [
  {
    lead: 'Upload in one go.',
    text: 'Add a whole batch of photos and videos at once. iPhone photos are converted for you.',
    dot: 'var(--c0)',
  },
  { lead: 'A date, written your way.', text: 'Something as loose as ‘Summer 1994’ works.', dot: 'var(--c1)' },
  {
    lead: 'The story under every photo.',
    text: 'The family adds what they remember, in writing or as a voice note.',
    dot: 'var(--c2)',
  },
  { lead: 'Tag the people in it.', text: 'The album then appears on their Loved Ones page.', dot: 'var(--c3)' },
];

// Only what's added to the Library itself is in it: photos put straight into an album, capsule,
// timeline moment or memory stay there, and only print-editor uploads land in 'Uncategorised'.
const LIBRARY_FACTS = [
  'Every photo and video you add to it, sorted into folders like ‘Holiday 2026’',
  'Photos you add while designing a book or print wait in ‘Uncategorised’',
  'Pick from it for any album, timeline moment, capsule or print',
];

export default function AlbumsLibrary() {
  return (
    <section id="albums" className={landing.section}>
      <div className={landing.wrap}>
        <div className={s.layout}>
          <div className={`${landing.head} ${s.headArea}`}>
            <div className={s.tags}>
              <span className={landing.badge}>
                <span
                  className={landing.badgeDot}
                  style={{ '--dot': 'var(--c2)' } as CSSProperties}
                  aria-hidden="true"
                />
                Albums and Library
              </span>
            </div>
            <h2 className={`${landing.h2} ${s.title}`}>Photos with the story still attached.</h2>
            <p className={landing.headLead}>
              <span className={landing.leadFull}>
                Gather the photos from one chapter of life into an album, then let the family add what
                a picture can’t say. Albums are unlimited on every plan.
              </span>
              <span className={landing.leadShort}>One chapter of life in an album, with the story under every photo.</span>
          </p>
          </div>

          <figure className={s.figure}>
            <div className={s.frame} style={{ '--frame': 'var(--c2)' } as CSSProperties}>
              {/* The photo's own 3:4 shape, so nothing is cropped. */}
              <div className={s.photo}>
                <Image
                  src="/garden.jpg"
                  alt="Dante’s little sister on a red toy tractor in the garden, with Dante playing behind her"
                  fill
                  sizes="(max-width: 359px) 228px, (max-width: 599px) calc(44vw - 40px), (max-width: 1023px) calc(40vw - 46px), (max-width: 1287px) calc(25vw - 41px), 280px"
                  // Loaded up front at low priority, so a fast flick never reaches an empty frame.
                  loading="eager"
                  fetchPriority="low"
                  className={landing.coverImg}
                  style={{ objectPosition: '50% 50%' }}
                />
              </div>
              <span className={`${landing.storyChip} ${s.chip}`}>
                <span className={landing.storyChipDot} aria-hidden="true" />
                Dante’s family
              </span>
            </div>

            <dl className={s.label}>
              {LABEL.map((row) => (
                <div key={row.term} className={s.row}>
                  <dt className={s.term}>{row.term}</dt>
                  <dd className={s.value}>{row.value}</dd>
                </div>
              ))}
            </dl>

            <figcaption className={s.credit}>
              Dante’s photo and his own caption, set out the way an album photo holds them.
            </figcaption>
          </figure>

          <Fold label="What albums do" className={s.factsFold}>
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
        </div>

        <div className={s.library}>
          <h3 className={s.libraryTitle}>One Library for the whole family.</h3>
          <Fold label="What goes in it" className={s.libraryFold}>
          <ul className={s.libraryFacts}>
            {LIBRARY_FACTS.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
          </Fold>
          <p className={s.fine}>
            Everyone you invite shares it, with 1GB of storage on the free plan and 100GB on Premium.
          </p>
        </div>
      </div>
    </section>
  );
}
