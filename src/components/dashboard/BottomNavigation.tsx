'use client'

import Link from "next/link";
import { Home, Users, Library, Gem, User, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";
import { memoriesLinks, heirloomsLinks, accountLinks } from "@/lib/dashboardNavigation";
import { btnClass, useDialog } from "@/components/dashboard/ui/AppBits";

// One round 44px button in the floating bar: ink with a white icon for the section you're in.
const tab = (on: boolean) =>
  `flex h-11 w-11 flex-none items-center justify-center rounded-full transition-[background-color,color,transform] duration-200 active:scale-90 ${
    on ? "bg-[var(--ink)] text-white" : "text-[var(--ink)] hover:bg-[var(--hover)]"
  }`;

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
const isOurFamily = pathname.startsWith("/dashboard/our-family");

const isMemories = memoriesLinks.some(link =>
  pathname === link.href || pathname.startsWith(link.href + "/")
);

const isHeirlooms = heirloomsLinks.some(link =>
  pathname === link.href || pathname.startsWith(link.href + "/")
);

const isAccount = accountLinks.some(link =>
  pathname === link.href || pathname.startsWith(link.href + "/")
);

const active = isHome ? "home" : isOurFamily ? "our-family" : isMemories ? "memories" : isHeirlooms ? "heirlooms" : isAccount ? "account" : "home";
  const router = useRouter();
  const supabase = getBrowserClient();

  const [confirmLogout, setConfirmLogout] = useState(false);
  // Escape cancels the log-out question, Tab stays inside it, focus returns to the button.
  const confirmRef = useDialog<HTMLDivElement>(confirmLogout, () => setConfirmLogout(false));

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
      <nav
        aria-label="Dashboard"
        className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 z-[200] pb-[max(16px,env(safe-area-inset-bottom))]"
      >

        <div className="flex items-center gap-1 rounded-full bg-white p-1.5 shadow-[0_0_0_1.5px_rgba(10,10,15,0.08),0_16px_40px_-14px_rgba(10,10,15,0.4)]">

            {/* OUR FAMILY */}
            <Link
              href="/dashboard/our-family"
              aria-label="My Family"
              aria-current={active === 'our-family' ? 'page' : undefined}
              className={tab(active === 'our-family')}
            >
              <Users className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </Link>

            {/* MEMORIES */}
            <button
              type="button"
              onClick={openMemories}
              aria-label="My Memories"
              aria-haspopup="dialog"
              className={tab(active === 'memories')}
            >
              <Library className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </button>

            {/* HEIRLOOMS */}
            <button
              type="button"
              onClick={openHeirlooms}
              aria-label="My Heirlooms"
              aria-haspopup="dialog"
              className={tab(active === 'heirlooms')}
            >
              <Gem className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </button>

            {/* ACCOUNT */}
            <button
              type="button"
              onClick={openAccount}
              aria-label="My Account"
              aria-haspopup="dialog"
              className={tab(active === 'account')}
            >
              <User className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </button>

            <span className="mx-0.5 h-6 w-[1.5px] flex-none rounded-full bg-[var(--rule)]" aria-hidden="true" />

            {/* LOGOUT */}
            <button
              type="button"
              onClick={() => setConfirmLogout(true)}
              aria-label="Log out"
              aria-haspopup="dialog"
              className={tab(false)}
            >
              <LogOut className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </button>

        </div>
      </nav>

      {/* LOGOUT CONFIRM MODAL */}
      {confirmLogout && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[rgba(10,10,15,0.45)] px-6">

          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-confirm-title"
            ref={confirmRef}
            className="w-full max-w-[340px] rounded-[24px] bg-white p-6 text-[var(--ink)] shadow-[0_30px_70px_-30px_rgba(10,10,15,0.45)]"
          >

            <p id="logout-confirm-title" className="text-[20px] font-extrabold leading-tight tracking-[-0.035em]">
              Log out of your account?
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2.5">

              <button
                type="button"
                onClick={() => setConfirmLogout(false)}
                className={btnClass({ variant: 'soft' })}
              >
                Cancel
              </button>

             <button
  type="button"
  onClick={async () => {
    await supabase.auth.signOut({ scope: 'local' });
    router.push("/login");
  }}
  className={btnClass({ variant: 'primary' })}
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
