import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import DashboardClientLayout from "./_layout.client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getServerClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // ⚠️ ONLY check auth here, NOT subscription
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
