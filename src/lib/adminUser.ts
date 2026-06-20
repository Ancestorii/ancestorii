/**
 * Single source of truth for the founder/admin user id.
 *
 * This is the only account that can nominate (feature) and moderate stories.
 * Both the client (which tabs are shown) and the server routes
 * (feature-story, unfeature-story, admin/moderate) read from here, so the
 * cosmetic gate and the real gate can never drift apart.
 *
 * This id is a public user identifier, not a secret — it is safe to ship to
 * the client. To change the admin, update this one value.
 */
export const ADMIN_USER_ID = 'f5d224ef-2314-418a-8d8f-44d0fb304320';
