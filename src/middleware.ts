// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Public routes that never need gating
  const publicPaths = ["/", "/login", "/join", "/pricing", "/checkout", "/api/stripe"];
  if (publicPaths.some((p) => req.nextUrl.pathname.startsWith(p))) {
    return res;
  }

  // Supabase session from cookies (no extra setup needed)
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // No session -> send to join
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/join";
    url.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Check DB gate: active or trialing-with-card
  const { data: access } = await supabase.rpc("has_active_access", { uid: session.user.id });

  if (!access) {
    const url = req.nextUrl.clone();
    url.pathname = "/pricing";
    url.searchParams.set("reason", "upgrade_required");
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/app/:path*"], // protect your app routes here
};

