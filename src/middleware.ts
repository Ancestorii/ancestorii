import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // -----------------------------
  // PUBLIC ROUTES
  // -----------------------------
  const publicPaths = [
    "/",
    "/login",
    "/signup",
    "/join",
    "/auth",
    "/pricing",
    "/checkout",
    "/api",
  ];

  if (publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return res;
  }

  // -----------------------------
  // SUPABASE SSR CLIENT (✅ CORRECT)
  // -----------------------------
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ------------------------------------------------
  // ALLOW PROFILE + PLANS AFTER LOGIN (NO BILLING)
  // ------------------------------------------------
  if (
    pathname.startsWith("/dashboard/profile") ||
    pathname.startsWith("/dashboard/plans")
  ) {
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return res;
  }

  // -----------------------------
  // BLOCK EVERYTHING WITHOUT AUTH
  // -----------------------------
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // -----------------------------
  // BILLING GATE
  // -----------------------------
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/app")) {
    const { data: hasAccess } = await supabase.rpc("has_active_access", {
      uid: session.user.id,
    });

    if (!hasAccess) {
      const url = req.nextUrl.clone();
      url.pathname = "/signup";
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/app/:path*"],
};
