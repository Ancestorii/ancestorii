import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { TOPICS, getTopicByKey } from '@/lib/stories/topics';
import type { LandingStory } from '@/lib/stories/landing';
import styles from './landing.module.css';


function byline(story: LandingStory) {
  return story.authorTitle ? `By ${story.authorName} · ${story.authorTitle}` : `By ${story.authorName}`;
}

function topicLabel(story: LandingStory) {
  return story.category ? getTopicByKey(story.category)?.label ?? null : null;
}

export default function LandingStories({ stories }: { stories: LandingStory[] }) {
  const [lead, ...rest] = stories;
  const leadTopic = lead ? topicLabel(lead) : null;

  return (
    <section id="stories" className={styles.storiesSection}>
      <div className={styles.wrap}>
        <div className={styles.sectionHead}>
          <h2 className={`${styles.h2} ${styles.storiesTitle}`}>Real stories from real families.</h2>
          <Link href="/stories" className={styles.btnGhost}>
            Read all stories <span className={styles.arrowGlyph}>→</span>
          </Link>
        </div>

        <nav className={styles.topics} aria-label="Story topics">
          <Link href="/stories" className={`${styles.topic} ${styles.topicActive}`}>
            All Stories
          </Link>
          {TOPICS.map((topic) => (
            <Link key={topic.key} href={`/stories/topics/${topic.slug}`} className={styles.topic}>
              {topic.label}
            </Link>
          ))}
        </nav>

        {lead && (
          <div
            className={styles.storiesGrid}
            style={rest.length ? undefined : { gridTemplateColumns: 'minmax(0, 1fr)' }}
          >
            <Link
              href={`/stories/${lead.slug}`}
              className={styles.featured}
              style={{ '--card': 'var(--c0)' } as CSSProperties}
            >
              <div className={styles.featuredMedia}>
                {lead.coverUrl ? (
                  <Image
                    src={lead.coverUrl}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1099px) 56vw, 620px"
                    className={styles.coverImg}
                  />
                ) : (
                  <div
                    className={styles.mediaFallback}
                    style={{ '--fallback-bg': '#FFFFFF', '--fallback-fg': 'var(--c0)' } as CSSProperties}
                    aria-hidden="true"
                  >
                    “
                  </div>
                )}
                <span className={styles.featuredBadge}>
                  {leadTopic ? `${lead.badge} · ${leadTopic}` : lead.badge}
                </span>
              </div>
              <div className={styles.featuredBody}>
                <div className={styles.featuredTitle}>{lead.title}</div>
                {lead.excerpt && <p className={styles.featuredExcerpt}>{lead.excerpt}</p>}
                <div className={styles.featuredMeta}>
                  <span>{byline(lead)}</span>
                  <span>
                    Read story <span className={styles.arrowGlyph}>→</span>
                  </span>
                </div>
              </div>
            </Link>

            {rest.length > 0 && (
              <div className={styles.smallGrid}>
                {rest.map((story) => {
                  const color = 'var(--c0)';
                  const topic = topicLabel(story);
                  return (
                    <Link
                      key={story.slug}
                      href={`/stories/${story.slug}`}
                      className={styles.storyCard}
                      style={{ '--card': color } as CSSProperties}
                    >
                      <div className={styles.storyMedia}>
                        {story.coverUrl ? (
                          <Image
                            src={story.coverUrl}
                            alt=""
                            fill
                            sizes="(max-width: 599px) 40vw, (max-width: 1099px) 50vw, 310px"
                            className={styles.coverImg}
                          />
                        ) : (
                          <div
                            className={styles.mediaFallback}
                            style={{ '--fallback-bg': color, '--fallback-fg': '#FFFFFF' } as CSSProperties}
                            aria-hidden="true"
                          >
                            “
                          </div>
                        )}
                      </div>
                      <div className={styles.storyBody}>
                        {topic && (
                          <div className={styles.storyTopic}>
                            <span className={styles.storyTopicDot} />
                            {topic}
                          </div>
                        )}
                        <div className={styles.storyTitle}>{story.title}</div>
                        <div className={styles.storyBy}>{byline(story)}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
