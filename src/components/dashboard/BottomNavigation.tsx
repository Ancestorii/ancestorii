'use client'

import Link from "next/link";
import { Home, Library, Gem, User, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";
import { memoriesLinks, heirloomsLinks, accountLinks } from "@/lib/dashboardNavigation";

export default function BottomNavigation({
  setMemoriesOpen,
  setHeirloomsOpen,
  setAccountOpen
}: {
  setMemoriesOpen: (val: boolean) => void;
  setHeirloomsOpen: (val: boolean) => void;
  setAccountOpen: (val: boolean) => void;
}) {

  const pathname = usePathname();
  const isHome = pathname === "/dashboard/home";

const isMemories = memoriesLinks.some(link =>
  pathname === link.href || pathname.startsWith(link.href + "/")
);

const isHeirlooms = heirloomsLinks.some(link =>
  pathname === link.href || pathname.startsWith(link.href + "/")
);

const isAccount = accountLinks.some(link =>
  pathname === link.href || pathname.startsWith(link.href + "/")
);

const active = isHome ? "home" : isMemories ? "memories" : isHeirlooms ? "heirlooms" : isAccount ? "account" : "home";
  const router = useRouter();
  const supabase = getBrowserClient();
  
  const [confirmLogout, setConfirmLogout] = useState(false);

  const openMemories = () => {
  setMemoriesOpen(true);
};

const openHeirlooms = () => {
  setHeirloomsOpen(true);
};

const openAccount = () => {
  setAccountOpen(true);
};

const goHome = () => {};

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 z-[200] pb-4">

        <div className="bg-white/90 backdrop-blur-2xl border border-[#D4AF37]/40 shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-full px-1.5 py-1.5 transition">

          <div className="flex items-center gap-0.5">

            {/* HOME */}
            <Link
              href="/dashboard/home"
              onClick={goHome}
              className={`flex items-center justify-center h-9 w-9 rounded-full transition-all active:scale-90
              ${active === 'home' ? "bg-[#0F1A2E]" : "hover:bg-black/5"}`}
            >
              <Home
                className={`h-[17px] w-[17px] ${active === 'home' ? "text-[#D4AF37]" : "text-slate-700"}`}
                strokeWidth={1.8}
              />
            </Link>

            {/* MEMORIES */}
            <button
              onClick={openMemories}
              className={`flex items-center justify-center h-9 w-9 rounded-full transition-all active:scale-90
              ${active === 'memories' ? "bg-[#0F1A2E]" : "hover:bg-black/5"}`}
            >
              <Library
                className={`h-[17px] w-[17px] ${active === 'memories' ? "text-[#D4AF37]" : "text-slate-700"}`}
                strokeWidth={2}
              />
            </button>

            {/* HEIRLOOMS */}
            <button
              onClick={openHeirlooms}
              className={`flex items-center justify-center h-9 w-9 rounded-full transition-all active:scale-90
              ${active === 'heirlooms' ? "bg-[#0F1A2E]" : "hover:bg-black/5"}`}
            >
              <Gem
                className={`h-[17px] w-[17px] ${active === 'heirlooms' ? "text-[#D4AF37]" : "text-slate-700"}`}
                strokeWidth={1.8}
              />
            </button>

            {/* ACCOUNT */}
            <button
              onClick={openAccount}
              className={`flex items-center justify-center h-9 w-9 rounded-full transition-all active:scale-90
              ${active === 'account' ? "bg-[#0F1A2E]" : "hover:bg-black/5"}`}
            >
              <User
                className={`h-[17px] w-[17px] ${active === 'account' ? "text-[#D4AF37]" : "text-slate-700"}`}
                strokeWidth={1.8}
              />
            </button>

            {/* LOGOUT */}
            <button
              onClick={() => setConfirmLogout(true)}
              className="flex items-center justify-center h-9 w-9 rounded-full transition-all active:scale-90 hover:bg-red-50"
            >
              <LogOut
                className="h-[17px] w-[17px] text-red-400"
                strokeWidth={2}
              />
            </button>

          </div>
        </div>
      </div>

      {/* LOGOUT CONFIRM MODAL */}
      {confirmLogout && (
        <div className="fixed inset-0 z-[300] bg-black/30 backdrop-blur-sm flex items-center justify-center px-6">

          <div className="bg-white rounded-[22px] border-2 border-[#D4AF37]/50 shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-6 w-full max-w-[320px]">

            <p className="text-[15px] font-semibold text-slate-900 mb-4">
              Log out of your account?
            </p>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setConfirmLogout(false)}
                className="px-4 py-2 text-[13px] font-semibold text-slate-700"
              >
                Cancel
              </button>

             <button
  onClick={async () => {
    await supabase.auth.signOut();
    router.push("/");
  }}
  className="px-4 py-2 text-[13px] font-semibold text-red-600"
>
  Log out
</button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}