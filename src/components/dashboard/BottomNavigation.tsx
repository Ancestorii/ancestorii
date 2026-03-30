'use client'

import Link from "next/link";
import { Home, Library, User, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";
import { memoriesLinks, booksLinks, accountLinks } from "@/lib/dashboardNavigation";

export default function BottomNavigation({
  setMemoriesOpen,
  setAccountOpen
}: {
  setMemoriesOpen: (val: boolean) => void;
  setAccountOpen: (val: boolean) => void;
}) {

  const pathname = usePathname();
  const isHome = pathname === "/dashboard/home";

const isMemories = [...memoriesLinks, ...booksLinks].some(link =>
  pathname === link.href || pathname.startsWith(link.href + "/")
);

const isAccount = accountLinks.some(link =>
  pathname === link.href || pathname.startsWith(link.href + "/")
);

const active = isHome ? "home" : isMemories ? "memories" : isAccount ? "account" : "home";
  const router = useRouter();
  const supabase = getBrowserClient();
  
  const [confirmLogout, setConfirmLogout] = useState(false);

  const openMemories = () => {
  setMemoriesOpen(true);
};

const openAccount = () => {
  setAccountOpen(true);
};

const goHome = () => {};

  return (
    <>
      <div className="xl:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[520px] z-[200] px-2 pb-3">

        <div className="bg-white/90 backdrop-blur-2xl border-2 border-[#D4AF37]/60 shadow-[0_20px_50px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.7)_inset] rounded-[30px] p-2 active:scale-[0.99] transition">

          <div className="flex items-center justify-between gap-1">

            {/* HOME */}
            <Link
              href="/dashboard/home"
              onClick={goHome}
              className={`flex flex-col items-center justify-center flex-1 py-3 md:py-3 rounded-[20px] transition-all active:scale-95
              ${active === 'home' ? "bg-[#0F1A2E]" : ""}`}
            >
              <Home
                className={`h-[18px] w-[18px] ${active === 'home' ? "text-[#D4AF37]" : "text-slate-900"}`}
                strokeWidth={1.8}
              />

              <span className={`text-[10px] font-bold uppercase tracking-[0.1em] mt-1.5
                ${active === 'home' ? "text-[#D4AF37]" : "text-slate-900"}`}
              >
                Home
              </span>
            </Link>

            <div className="h-7 w-px bg-[#D4AF37]/40" />

            {/* MEMORIES */}
            <button
              onClick={openMemories}
              className={`flex flex-col items-center justify-center flex-1 py-3 md:py-3 px-1 rounded-[20px] transition-all active:scale-95
              ${active === 'memories' ? "bg-[#0F1A2E]" : ""}`}
            >
              <Library
                className={`h-[18px] w-[18px] ${active === 'memories' ? "text-[#D4AF37]" : "text-slate-900"}`}
                strokeWidth={2}
              />

              <span className={`text-[10px] font-bold uppercase tracking-[0.1em] mt-1.5
                ${active === 'memories' ? "text-[#D4AF37]" : "text-slate-900"}`}
              >
                Memories
              </span>
            </button>

            <div className="h-7 w-px bg-[#D4AF37]/40" />

            {/* ACCOUNT */}
            <button
              onClick={openAccount}
              className={`flex flex-col items-center justify-center flex-1 py-3 md:py-3 rounded-[20px] transition-all active:scale-95
              ${active === 'account' ? "bg-[#0F1A2E]" : ""}`}
            >
              <User
                className={`h-[18px] w-[18px] ${active === 'account' ? "text-[#D4AF37]" : "text-slate-900"}`}
                strokeWidth={1.8}
              />

              <span className={`text-[10px] font-bold uppercase tracking-[0.1em] mt-1.5
                ${active === 'account' ? "text-[#D4AF37]" : "text-slate-900"}`}
              >
                Account
              </span>
            </button>

            <div className="h-7 w-px bg-[#D4AF37]/40" />

            {/* LOGOUT */}
            <button
              onClick={() => setConfirmLogout(true)}
              className="flex flex-col items-center justify-center flex-1 py-3 md:py-3 rounded-[20px] transition-all active:scale-95"
            >
              <LogOut
                className="h-[18px] w-[18px] text-red-500"
                strokeWidth={2}
              />

              <span className="text-[10px] font-bold uppercase tracking-[0.1em] mt-1.5 text-red-500">
                Logout
              </span>
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