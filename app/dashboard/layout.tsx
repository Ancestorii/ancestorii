import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import DashboardClientLayout from "./_layout.client";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", session.user.id)
    .maybeSingle();

  // ✅ If webhook hasn’t landed yet, send them to finalizing (NOT pricing)
  if (!sub) redirect("/dashboard/finalizing");

  // ✅ If status is good, allow access
  if (["active", "trialing"].includes(sub.status)) {
    return <DashboardClientLayout>{children}</DashboardClientLayout>;
  }

  // ✅ Everything else -> pricing
  redirect("/pricing");
}
