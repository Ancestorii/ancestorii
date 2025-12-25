// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  /**
   * ------------------------------------------------------------
   * 1️⃣ Public routes
   * ------------------------------------------------------------
   */
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

  /**
   * ------------------------------------------------------------
   * 2️⃣ Require auth
   * ------------------------------------------------------------
   */
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const allowWithoutBilling = [
  "/dashboard/profile",
  "/dashboard/plans",
];

if (allowWithoutBilling.includes(pathname)) {
  return res;
}

  /**
   * ------------------------------------------------------------
   * 3️⃣ Billing gate (ALLOW Stripe success redirect)
   * ------------------------------------------------------------
   */
  const isDashboard =
    pathname.startsWith("/dashboard") || pathname.startsWith("/app");

  // 🔥 allow first Stripe return BEFORE webhook finishes
  const isStripeReturn =
    pathname === "/dashboard/profile" &&
    req.nextUrl.searchParams.get("success") === "true";

  if (isDashboard && !isStripeReturn) {
    const { data: hasAccess } = await supabase.rpc(
      "has_active_access",
      { uid: session.user.id }
    );

    if (!hasAccess) {
      const url = req.nextUrl.clone();
      url.pathname = "/signup";
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/app/:path*",
  ],
};
