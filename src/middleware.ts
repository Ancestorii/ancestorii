// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  /**
   * ------------------------------------------------------------
   * 1️⃣ Public routes (NO auth, NO billing)
   * ------------------------------------------------------------
   */
  const publicPaths = [
    "/",                 // landing
    "/login",
    "/signup",
    "/join",
    "/auth/confirm",     // email confirmation
    "/pricing",          // marketing pricing page
    "/checkout",         // stripe redirect helpers
    "/api",              // api routes
  ];

  if (publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return res;
  }

  /**
   * ------------------------------------------------------------
   * 2️⃣ Require authenticated session for EVERYTHING ELSE
   * ------------------------------------------------------------
   */
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  /**
   * ------------------------------------------------------------
   * 3️⃣ Billing gate — ONLY for app/dashboard routes
   * ------------------------------------------------------------
   */
  const isAppRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/app");

  if (isAppRoute) {
    const { data: hasAccess, error } = await supabase.rpc(
      "has_active_access",
      { uid: session.user.id }
    );

    if (error || !hasAccess) {
      const url = req.nextUrl.clone();
      url.pathname = "/signup";
      return NextResponse.redirect(url);
    }
  }

  return res;
}

/**
 * ------------------------------------------------------------
 * Only run middleware where it matters
 * ------------------------------------------------------------
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/app/:path*",
  ],
};
