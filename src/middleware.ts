import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // -----------------------------
  // PUBLIC ROUTES (NO AUTH)
  // -----------------------------
  // Only /dashboard, /app and /onboarding reach this file (see `config` below), so of these only
  // "/dashboard/finalizing" ever matches; the rest are kept for when the matcher widens.
  const publicPaths = [
    "/",
    "/login",
    "/signup",
    "/join",
    "/auth",
    "/pricing",
    "/checkout",
    "/api",
    "/dashboard/finalizing", // optional
  ];

  if (publicPaths.some(p => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  // -----------------------------
  // SUPABASE SERVER CLIENT
  // -----------------------------
  // When Supabase refreshes an expired session here, the new cookies go on the response (to the
  // browser) AND on the request (to the server components and route handlers behind this
  // middleware), so they read the refreshed session instead of refreshing it a second time.
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // -----------------------------
  // REDIRECT HELPER (KEEP COOKIES)
  // -----------------------------
  // Sends the visitor to `path`, carrying where they were going as ?redirect=<path+query>, which
  // app/login/page.tsx honours through src/lib/safeRedirect.ts (same-site paths only).
  const redirect = (path: string) => {
    const url = req.nextUrl.clone();
    url.pathname = path;
    url.search = `?redirect=${encodeURIComponent(pathname + req.nextUrl.search)}`;

    const redirectRes = NextResponse.redirect(url);

    // Whole cookie objects, so a refreshed or cleared auth cookie keeps its path, expiry,
    // SameSite and Secure flags (copying name and value alone dropped them).
    res.cookies.getAll().forEach(c => {
      redirectRes.cookies.set(c);
    });

    return redirectRes;
  };

  // -----------------------------
  // BLOCK EVERYTHING WITHOUT AUTH
  // -----------------------------
  if (!session) {
    return redirect("/login");
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/app/:path*", "/onboarding/:path*"],
};
