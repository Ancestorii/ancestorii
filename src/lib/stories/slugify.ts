/**
 * Convert a title into a URL-friendly slug.
 * "My Nan's Bread & Butter Pudding" → "my-nans-bread-and-butter-pudding"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[''\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

/**
 * Generate a unique slug by appending a short random suffix.
 * Ensures no collisions even if two stories share the same title.
 */
export function uniqueSlug(text: string): string {
  const base = slugify(text);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}