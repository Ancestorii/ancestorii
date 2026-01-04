import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import DashboardClientLayout from "./_layout.client";

type Props = {
  children: React.ReactNode;
  searchParams?: { success?: string };
};

export default async function DashboardLayout({
  children,
  searchParams,
}: Props) {
  const supabase = await getServerClient();

  // --------------------------------------------------
  // 1️⃣ AUTH GATE
  // --------------------------------------------------
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const userId = session.user.id;

  // --------------------------------------------------
  // 2️⃣ SUBSCRIPTION FETCH
  // --------------------------------------------------
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status, current_period_end, created_at")
    .eq("user_id", userId)
    .maybeSingle();

  const now = new Date();

  // --------------------------------------------------
  // 3️⃣ STRIPE SUCCESS GRACE WINDOW
  // --------------------------------------------------
  const justPaid = searchParams?.success === "true";

  const withinGraceWindow =
    sub?.created_at &&
    now.getTime() - new Date(sub.created_at).getTime() < 1000 * 60 * 5; // 5 mins

  // --------------------------------------------------
  // 4️⃣ ACCESS DECISION
  // --------------------------------------------------
  const isActive =
    sub &&
    ["active", "trialing"].includes(sub.status) &&
    (!sub.current_period_end ||
      new Date(sub.current_period_end) > now);

  const allowAccess = isActive || justPaid || withinGraceWindow;

  if (!allowAccess) {
    redirect("/dashboard/plans");
  }

  // --------------------------------------------------
  // 5️⃣ RENDER
  // --------------------------------------------------
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
