'use client';

import { useLinkStatus } from 'next/link';

// Goes inside a story card's <Link>. While the tapped story loads it carries data-pending,
// which dims the card at once (feed.module.css), so a tap is answered before the page arrives.
export default function LinkPending() {
  const { pending } = useLinkStatus();
  return <span hidden data-pending={pending || undefined} />;
}
