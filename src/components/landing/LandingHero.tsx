import HeroRing, { type RingCard } from './HeroRing';
import StoryCta from './StoryCta';
import SmoothAnchor from './SmoothAnchor';
import styles from './landing.module.css';

const PINK = '#FF2D87';
const BLUE = '#2B4BFF';
const ORANGE = '#FF7A1A';
const AQUA = '#12D3AC';
const INK = '#0A0A0F';

// The approved hero from Claude Design: a photo card, then something a family
// member said, round the ring. Quote text is ink on pink, orange and aqua, white on blue and ink.
const CARDS: RingCard[] = [
  { kind: 'photo', label: 'Nan with the twins', src: '/landing/hero-nan-twins.jpg', color: PINK },
  { kind: 'quote', text: 'I knew the moment he asked me to dance.', who: 'Nan, on meeting Grandad', color: BLUE, fg: '#FFFFFF' },
  { kind: 'photo', label: "Tom's sixth birthday", src: '/landing/hero-sixth-birthday.jpg', color: ORANGE },
  { kind: 'quote', text: 'You were the loudest baby on the whole ward.', who: 'Mum', color: PINK, fg: INK },
  { kind: 'photo', label: 'The Day I Became a Dad', src: '/landing/hero-became-a-dad.jpg', color: AQUA },
  { kind: 'quote', text: 'We had nothing, and we had everything.', who: 'Grandad', color: INK, fg: '#FFFFFF' },
  { kind: 'photo', label: "Sunday dinner at Nan's", src: '/landing/hero-sunday-dinner.jpg', color: BLUE },
  { kind: 'quote', text: 'Always leave the kitchen cleaner than you found it.', who: 'Nan', color: ORANGE, fg: INK },
  { kind: 'photo', label: 'Oma and baby Rose', src: '/landing/hero-oma-baby-rose.jpg', color: PINK },
  { kind: 'quote', text: 'Your dad cried more than you did.', who: 'Mum', color: AQUA, fg: INK },
  { kind: 'photo', label: 'The whole family, Easter', src: '/landing/hero-family-easter.jpg', color: ORANGE },
  { kind: 'quote', text: 'Never go to bed on an argument.', who: 'Grandma June', color: BLUE, fg: '#FFFFFF' },
];

export default function LandingHero() {
  return (
    <section id="top" className={styles.hero}>
      <div className={styles.heroText}>
        <h1 className={styles.heroTitle}>
          Every family has a story <span className={styles.gradientText}>worth sharing.</span>
        </h1>
        <p className={styles.heroLead}>
          Photos sit on phones. Stories stay in your head. Voices fade. This is where families
          share the moments that matter.
        </p>
        <div className={styles.heroCtas}>
          <StoryCta className={styles.btnShadow}>Share Your Story</StoryCta>
          <SmoothAnchor href="#how" className={styles.btnOutline}>
            See how it works
          </SmoothAnchor>
        </div>
      </div>

      <HeroRing cards={CARDS} />
    </section>
  );
}
