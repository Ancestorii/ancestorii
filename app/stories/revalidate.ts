'use server';

import { updateTag } from 'next/cache';
import { STORIES_TAG } from '@/lib/stories/publicFeed';

/**
 * Drops the cached public lists (the feed, the topic pages, the topic counts) so a story the
 * reader has just published or deleted shows, or goes, at once instead of within the minute.
 * Called from the browser after those two actions. Anyone could call it; all it can do is make
 * the next request read the lists afresh, which is what every request did before they were cached.
 */
export async function revalidateStories(): Promise<void> {
  updateTag(STORIES_TAG);
}
