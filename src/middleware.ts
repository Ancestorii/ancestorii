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

  if (publicPaths.some(p => pathname === p || pathname.startsWith(`${p}/`))) {
    return res;
  }

  // -----------------------------
  // SUPABASE SERVER CLIENT
  // -----------------------------
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: cookies => {
          cookies.forEach(c => {
            res.cookies.set(c.name, c.value);
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // -----------------------------
  // REDIRECT HELPER (PRESERVE COOKIES)
  // -----------------------------
  const redirect = (path: string) => {
    const url = req.nextUrl.clone();
    url.pathname = path;

    const redirectRes = NextResponse.redirect(url);

    res.cookies.getAll().forEach(c => {
      redirectRes.cookies.set(c.name, c.value);
    });

    return redirectRes;
  };

  // -----------------------------
  // ALLOW PROFILE + PLANS
  // -----------------------------
  if (
    pathname.startsWith("/dashboard/profile") ||
    pathname.startsWith("/dashboard/plans")
  ) {
    if (!session) return redirect("/login");
    return res;
  }

  // -----------------------------
  // BLOCK UNAUTHENTICATED
  // -----------------------------
  if (!session) {
    return redirect("/login");
  }

  // -----------------------------
  // BILLING GATE
  // -----------------------------
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/app")) {
    const { data: hasAccess } = await supabase.rpc("has_active_access", {
      uid: session.user.id,
    });

    if (!hasAccess) {
      return redirect("/signup");
    }
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/app/:path*"],
};
