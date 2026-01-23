import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import DashboardClientLayout from "./_layout.client";

type Props = {
  children: React.ReactNode;
};

export default async function DashboardLayout({ children }: Props) {
  const supabase = await getServerClient();

  // 1️⃣ AUTH GATE (keep)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  // 2️⃣ NO SUBSCRIPTION GATE HERE
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
