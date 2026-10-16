import { Baby, Compass, Flame, Heart, Sparkles, Users, UtensilsCrossed } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import tones from './tones.module.css';

// Each topic (stories.category) wears one of the four landing colours, so a topic looks the
// same on the feed, the topic pages and the story cards. Neighbouring topics never share one.
const TOPIC_TONE: Record<string, number> = {
  family: 0, // pink
  food_and_recipes: 2, // orange
  childhood: 1, // blue
  love: 0, // pink
  life_lessons: 3, // aqua
  traditions: 2, // orange
  travel: 3, // aqua
};

const TONES = [tones.tone0, tones.tone1, tones.tone2, tones.tone3];

/** Class that sets --tone / --tone-fg for one of the four colours (0 pink, 1 blue, 2 orange, 3 aqua). */
export function toneClass(index: number): string {
  return TONES[((index % 4) + 4) % 4];
}

/** Tone class for a topic key; stories without a topic are pink. */
export function topicToneClass(key: string | null | undefined): string {
  return toneClass(key ? TOPIC_TONE[key] ?? 0 : 0);
}

// The same symbols the feed's topic list uses.
const TOPIC_ICONS: Record<string, LucideIcon> = {
  family: Users,
  food_and_recipes: UtensilsCrossed,
  childhood: Baby,
  love: Heart,
  life_lessons: Sparkles,
  traditions: Flame,
  travel: Compass,
};

export function topicIcon(key: string): LucideIcon {
  return TOPIC_ICONS[key] ?? Heart;
}
