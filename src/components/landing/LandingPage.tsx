import type { LandingStory } from '@/lib/stories/landing';
import { jakarta } from './fonts';
import LandingNav from './LandingNav';
import LandingHero from './LandingHero';
import LandingTrust from './LandingTrust';
import FeatureIndex from './sections/FeatureIndex';
import MyFamily from './sections/MyFamily';
import Reviews from './sections/Reviews';
import LandingQuestions from './LandingQuestions';
import AlbumsLibrary from './sections/AlbumsLibrary';
import TimelinesLovedOnes from './sections/TimelinesLovedOnes';
import VoicesCapsules from './sections/VoicesCapsules';
import LandingStories from './LandingStories';
import Heirlooms from './sections/Heirlooms';
import LandingCta from './LandingCta';
import LandingFooter from './LandingFooter';
import styles from './landing.module.css';
import pageGlow from '@/components/site/glow.module.css';

export default function LandingPage({
  stories,
  isLoggedIn,
}: {
  stories: LandingStory[];
  isLoggedIn: boolean;
}) {
  return (
    <div className={`${jakarta.variable} ${styles.page} ${pageGlow.glowPage}`}>
      <div className={styles.glows} aria-hidden="true">
        <div className={styles.glowTop} />
        <div className={styles.glowBottom} />
      </div>

      <LandingNav isLoggedIn={isLoggedIn} />

      <main className={styles.landingMain}>
        <LandingHero isLoggedIn={isLoggedIn} />
        <LandingTrust />
        <FeatureIndex />
        <MyFamily />
        <Reviews />
        <LandingQuestions />
        <AlbumsLibrary />
        <TimelinesLovedOnes />
        <VoicesCapsules />
        <LandingStories stories={stories} isLoggedIn={isLoggedIn} />
        <Heirlooms />
        <LandingCta isLoggedIn={isLoggedIn} />
      </main>

      <LandingFooter />
    </div>
  );
}
