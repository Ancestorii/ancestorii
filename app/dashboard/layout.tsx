import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import DashboardClientLayout from "./_layout.client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (!sub || !["active", "trialing"].includes(sub.status)) {
    redirect("/pricing");
  }

  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
