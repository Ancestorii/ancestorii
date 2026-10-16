import type { LandingStory } from '@/lib/stories/landing';
import { jakarta } from './fonts';
import LandingNav from './LandingNav';
import LandingHero from './LandingHero';
import LandingHowItWorks from './LandingHowItWorks';
import LandingStories from './LandingStories';
import LandingQuestions from './LandingQuestions';
import LandingMemoryBooks from './LandingMemoryBooks';
import LandingReviews from './LandingReviews';
import LandingCta from './LandingCta';
import LandingFooter from './LandingFooter';
import styles from './landing.module.css';

export default function LandingPage({
  stories,
  isLoggedIn,
}: {
  stories: LandingStory[];
  isLoggedIn: boolean;
}) {
  return (
    <div className={`${jakarta.variable} ${styles.page}`}>
      <div className={styles.glows} aria-hidden="true">
        <div className={styles.glowTop} />
        <div className={styles.glowBottom} />
      </div>

      <LandingNav isLoggedIn={isLoggedIn} />

      <main>
        <LandingHero isLoggedIn={isLoggedIn} />
        <LandingHowItWorks />
        <LandingStories stories={stories} />
        <LandingQuestions />
        <LandingMemoryBooks />
        <LandingReviews />
        <LandingCta isLoggedIn={isLoggedIn} />
      </main>

      <LandingFooter />
    </div>
  );
}
