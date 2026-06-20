// Canonical topic config for the public "Our Stories" feed.
//
// `key` is the value stored in stories.category (snake_case, matches the DB).
// `slug` is the SEO-readable URL segment used at /stories/topics/[slug].
// Everything else is evergreen editorial copy so each topic hub is content-rich
// even before it fills with stories. Shared by the topic pages, the topics index,
// and the sitemap — edit topics here only.

export type Topic = {
  key: string;
  slug: string;
  label: string;        // full label, e.g. "Food & Recipes"
  navLabel: string;     // short label for chips, e.g. "Recipes"
  heading: string;      // hero H1, first line
  headingAccent: string;// hero H1, italic second line
  intro: string;        // lead paragraph (unique, evergreen)
  secondary: string;    // supporting paragraph
  prompts: string[];    // story starters shown on the hub
  metaTitle: string;
  metaDescription: string;
};

export const TOPICS: Topic[] = [
  {
    key: 'family',
    slug: 'family',
    label: 'Family',
    navLabel: 'Family',
    heading: 'Family',
    headingAccent: 'and where we come from.',
    intro:
      'Family is the thread that runs through everything else. The people who shaped us, the ones we grew up beside, the relatives we only ever met through stories told at the kitchen table.',
    secondary:
      'These are the stories of where we come from. The grandmother who held everyone together. The uncle nobody could keep up with. The quiet moments that turned out to matter most of all.',
    prompts: [
      'The relative who shaped you most, and why',
      'A moment that brought your family closer together',
      'Something your parents did that you only understood years later',
    ],
    metaTitle: 'Family Stories from Real Families',
    metaDescription:
      'Real family stories shared by families around the world. The people who shaped us and the moments that mattered, kept and told together on Ancestorii.',
  },
  {
    key: 'food_and_recipes',
    slug: 'food-and-recipes',
    label: 'Food & Recipes',
    navLabel: 'Recipes',
    heading: 'Food, recipes',
    headingAccent: 'and the meals that stayed with us.',
    intro:
      'Every family has a dish that means far more than the sum of its ingredients. The recipe written on a stained index card. The smell that takes you straight back to a childhood kitchen.',
    secondary:
      'Recipes are memory you can taste. Share one here, in the words of the person who first made it, before it lives in nobody’s head.',
    prompts: [
      'The recipe only one person in your family could ever make',
      'A meal that brings everyone back to the same table',
      'The story behind a dish nobody ever wrote down',
    ],
    metaTitle: 'Family Food Stories & Treasured Recipes',
    metaDescription:
      'Real family food stories and the recipes worth keeping. The meals, smells, and kitchens that stay with us, shared by families on Ancestorii.',
  },
  {
    key: 'childhood',
    slug: 'childhood',
    label: 'Childhood',
    navLabel: 'Childhood',
    heading: 'Childhood',
    headingAccent: 'and the summers that felt endless.',
    intro:
      'The summers that seemed to last forever. The games invented in back gardens. The version of home that now exists only in memory.',
    secondary:
      'Childhood stories are the ones our own children love most. Write yours down while the details are still sharp, the ordinary afternoons as much as the big occasions.',
    prompts: [
      'A place from your childhood you can still picture perfectly',
      'A game or ritual you and your siblings invented',
      'The smell, sound, or song that takes you straight back',
    ],
    metaTitle: 'Childhood Memory Stories',
    metaDescription:
      'Real childhood memories shared by families. The endless summers, the back garden games, and the ordinary days worth keeping, on Ancestorii.',
  },
  {
    key: 'love',
    slug: 'love',
    label: 'Love',
    navLabel: 'Love',
    heading: 'Love',
    headingAccent: 'and how it began.',
    intro:
      'How they met. The letter that changed everything. Fifty years that started with a single ordinary afternoon nobody thought to mark.',
    secondary:
      'Love stories are the heart of every family. Capture the beginning before the details soften, so the people who come after know exactly how it all started.',
    prompts: [
      'How your parents or grandparents first met',
      'A small gesture that said everything',
      'The moment you knew this was the person',
    ],
    metaTitle: 'Family Love Stories',
    metaDescription:
      'Real love stories shared by families. How they met, how it lasted, and the moments that began everything, kept and told on Ancestorii.',
  },
  {
    key: 'life_lessons',
    slug: 'life-lessons',
    label: 'Life Lessons',
    navLabel: 'Life Lessons',
    heading: 'Life lessons',
    headingAccent: 'earned the long way.',
    intro:
      'The advice that turned out to be right. The mistake that taught more than any success ever could. Wisdom earned the long way, and worth passing on.',
    secondary:
      'Every generation learns the same lessons over again. Writing yours down is how you save someone you love a little of the hard part.',
    prompts: [
      'The best piece of advice you were ever given',
      'A lesson you only learned through getting it wrong',
      'Something you want the next generation to know',
    ],
    metaTitle: 'Life Lessons & Family Wisdom Stories',
    metaDescription:
      'Real life lessons and hard won wisdom shared by families. The advice worth passing on to the next generation, on Ancestorii.',
  },
  {
    key: 'traditions',
    slug: 'traditions',
    label: 'Traditions',
    navLabel: 'Traditions',
    heading: 'Traditions',
    headingAccent: 'and the rituals we keep.',
    intro:
      'The things your family does every year without quite remembering why. The rituals that hold a household together. The customs carried across generations and sometimes across oceans.',
    secondary:
      'Traditions only survive when someone explains them. Share the story behind yours, so it carries on long after the person who started it.',
    prompts: [
      'A tradition your family keeps every single year',
      'A custom carried from another country or generation',
      'The story behind a ritual nobody questions anymore',
    ],
    metaTitle: 'Family Tradition Stories',
    metaDescription:
      'Real stories of the traditions and rituals families keep. The customs carried across generations, shared and explained on Ancestorii.',
  },
  {
    key: 'travel',
    slug: 'travel',
    label: 'Travel',
    navLabel: 'Travel',
    heading: 'Travel',
    headingAccent: 'and the journeys that shaped us.',
    intro:
      'The journeys that became part of who your family is. The move to a new country. The trip everyone still talks about decades later.',
    secondary:
      'Some journeys change a family forever. Capture where you went, what it meant, and the people you became along the way.',
    prompts: [
      'A journey that changed your family’s direction',
      'The trip everyone still talks about',
      'A place that felt like home the moment you arrived',
    ],
    metaTitle: 'Family Travel & Journey Stories',
    metaDescription:
      'Real family travel stories and the journeys that shaped us. Moves, adventures, and trips worth remembering, shared on Ancestorii.',
  },
];

export const TOPIC_SLUGS = TOPICS.map((t) => t.slug);

export function getTopicBySlug(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}

export function getTopicByKey(key: string): Topic | undefined {
  return TOPICS.find((t) => t.key === key);
}
