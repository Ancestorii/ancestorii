import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function getServerClient() {
  const cookieStore = await cookies();

  // The getAll/setAll shape @supabase/ssr asks for (the middleware uses the same one). The old
  // get/set/remove methods still work in 0.7.0 but are deprecated, and read only the first five
  // chunks of a large session cookie.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component context: middleware refreshes the cookie on the next request
          }
        },
      },
    }
  );
}
