import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { TOPICS, getTopicByKey } from '@/lib/stories/topics';
import type { LandingStory } from '@/lib/stories/landing';
import { topicToneClass } from '@/components/site/stories-browse/topicTone';
import Fold from './Fold';
import StoryCta from './StoryCta';
import styles from './landing.module.css';
import st from './stories.module.css';

// Real public stories, drawn like the hero ring's photo cards at rest: each photo sits in a solid
// colour frame with a white chip, and the words sit on white underneath.
const FRAMES = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c0)'];

// What Our Stories is, checked against the product: free to read, publish, heart, comment and
// share; up to 10 photos and 1 video per story plus a voice note; the editor's three writing-help
// buttons; no followers; an automatic check on publish (never "reviewed before it goes live").
const FACTS = [
  { text: 'Free to read, publish, heart, comment and share', dot: 'var(--c0)' },
  { text: 'Up to 10 photos, a video and a voice note in each story', dot: 'var(--c1)' },
  { text: 'Writing help built in: Help me start, Help me go deeper, Help me end it', dot: 'var(--c2)' },
  {
    text: 'No follower counts, no politics or religion, and stories are checked automatically when they’re published',
    dot: 'var(--c3)',
  },
];


function byline(story: LandingStory) {
  // A no-break space keeps the dot with the name, so a wrapped byline never starts with "·".
  return story.authorTitle ? `By ${story.authorName}\u00a0· ${story.authorTitle}` : `By ${story.authorName}`;
}

function topicLabel(story: LandingStory) {
  return story.category ? getTopicByKey(story.category)?.label ?? null : null;
}

function Cover({ story, sizes }: { story: LandingStory; sizes: string }) {
  return story.coverUrl ? (
    // Loaded up front at low priority, so a fast flick never reaches an empty frame
    // (lazy photos pop in late on Safari).
    <Image
      src={story.coverUrl}
      alt=""
      fill
      sizes={sizes}
      loading="eager"
      fetchPriority="low"
      className={styles.coverImg}
    />
  ) : (
    // No photo: a solid frame-coloured panel with a quote mark, never a stock image.
    <div className={styles.storyFallback} aria-hidden="true">
      “
    </div>
  );
}

export default function LandingStories({ stories }: { stories: LandingStory[] }) {
  const [lead, ...rest] = stories;
  const leadTopic = lead ? topicLabel(lead) : null;

  return (
    <section id="stories" className={styles.section}>
      <div className={styles.wrap}>
        <div className={styles.head}>
          <div className={st.tags}>
            <span className={styles.badge}>
              <span className={styles.badgeDot} style={{ '--dot': 'var(--c3)' } as CSSProperties} />
              {'Our Stories\u00a0· Public'}
            </span>
          </div>
          <h2 className={`${styles.h2} ${styles.headTitle} ${styles.storiesTitle} ${st.title}`}>
            Real stories from real families.
          </h2>
          <p className={styles.headLead}>
            <span className={styles.leadFull}>
              Our Stories is the public side of Ancestorii. Anyone can read it free, without an
              account, and you choose which of your stories go on it.
            </span>
            <span className={styles.leadShort}>The public side of Ancestorii. Free to read, and you choose what goes on it.</span>
          </p>
        </div>

        {/* Stories, topics and the feed link load on tap: none of them prefetch as they scroll into view. */}
        {lead && (
          <div className={`${styles.storyGrid} ${rest.length ? '' : styles.storyGridSolo}`}>
            <Link
              href={`/stories/${lead.slug}`}
              prefetch={false}
              className={styles.storyLead}
              style={{ '--frame': 'var(--c0)' } as CSSProperties}
              aria-labelledby={`story-${lead.slug}`}
            >
              <div className={`${styles.storyFrame} ${styles.storyFrameLead}`}>
                <div className={styles.storyPhoto}>
                  <Cover
                    story={lead}
                    sizes="(max-width: 599px) calc(100vw - 62px), (max-width: 699px) 100vw, (max-width: 1099px) 54vw, 610px"
                  />
                </div>
                <span className={styles.storyChip}>
                  <span className={styles.storyChipDot} />
                  {leadTopic ? `${lead.badge} · ${leadTopic}` : lead.badge}
                </span>
              </div>
              <div className={styles.storyLeadBody}>
                <h3 id={`story-${lead.slug}`} className={styles.storyLeadTitle}>
                  {lead.title}
                </h3>
                {lead.excerpt && <p className={styles.storyLeadExcerpt}>{lead.excerpt}</p>}
                <p className={styles.storyLeadMeta}>
                  <span>{byline(lead)}</span>
                  <span className={styles.storyRead}>
                    Read story <ArrowRight size={17} strokeWidth={2.6} aria-hidden="true" />
                  </span>
                </p>
              </div>
            </Link>

            {rest.length > 0 && (
              <div className={styles.storyList}>
                {rest.map((story, i) => {
                  const topic = topicLabel(story);
                  return (
                    <Link
                      key={story.slug}
                      href={`/stories/${story.slug}`}
                      prefetch={false}
                      className={styles.storyItem}
                      style={{ '--frame': FRAMES[i % FRAMES.length] } as CSSProperties}
                      aria-labelledby={`story-${story.slug}`}
                    >
                      <div className={styles.storyFrame}>
                        <div className={styles.storyPhoto}>
                          <Cover
                            story={story}
                            sizes="(max-width: 599px) calc(40vw - 29px), (max-width: 1099px) 46vw, 420px"
                          />
                        </div>
                        {topic && (
                          <span className={styles.storyChip}>
                            <span className={styles.storyChipDot} />
                            {topic}
                          </span>
                        )}
                      </div>
                      <div className={styles.storyItemBody}>
                        <h3 id={`story-${story.slug}`} className={styles.storyItemTitle}>
                          {story.title}
                        </h3>
                        <p className={styles.storyItemBy}>{byline(story)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <Fold label="How Our Stories works">
        <ul className={st.facts}>
          {FACTS.map((fact) => (
            <li key={fact.text} style={{ '--dot': fact.dot } as CSSProperties}>
              {fact.text}
            </li>
          ))}
        </ul>
        </Fold>

        <div className={styles.storiesFoot}>
          <nav className={styles.storyTopics} aria-label="Story topics">
            <span className={styles.storyTopicsLabel}>Browse by topic</span>
            {TOPICS.map((topic) => (
              <Link
                key={topic.key}
                href={`/stories/topics/${topic.slug}`}
                prefetch={false}
                className={`${styles.storyTopicLink} ${topicToneClass(topic.key)}`}
              >
                {topic.label}
              </Link>
            ))}
          </nav>
          <div className={st.actions}>
            <StoryCta prefetch={false}>Share Your Story</StoryCta>
            {/* The hero's pair: the outline button matches the arrow button's height and corners. */}
            <Link href="/stories" prefetch={false} className={styles.btnOutline}>
              Read Our Stories
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
