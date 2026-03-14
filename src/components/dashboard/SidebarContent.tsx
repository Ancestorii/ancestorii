'use client'

import { memoriesLinks, accountLinks } from "@/lib/dashboardNavigation";
import NavItem from "@/components/dashboard/NavItem";
import { Home } from "lucide-react";

export default function SidebarContent({ closeDrawer }: any) {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#0F2040] to-[#182C54] border-r border-[#D4AF37]/15 text-white/80">

      <div className="pt-5 lg:pt-12 pb-4" />

      <nav className="flex-1 px-3 space-y-5 overflow-y-auto">

        <div className="space-y-1 pb-4">
  <NavItem
    href="/dashboard/home"
    label="Home"
    Icon={Home}
    onClick={closeDrawer}
  />
</div>

        <section>
          <div className="px-4 mb-2 flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-[#D4AF37]/20" />
            <p className="text-[13px] font-semibold tracking-[0.14em] text-[#D4AF37] uppercase">
              My Memories
            </p>
            <div className="h-[1px] flex-1 bg-[#D4AF37]/20" />
          </div>

          <div className="space-y-1">
            {memoriesLinks.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                Icon={item.icon}
                onClick={closeDrawer}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="px-4 mb-3 flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-[#D4AF37]/20" />
            <p className="text-[13px] font-semibold tracking-[0.14em] text-[#D4AF37] uppercase">
              Account
            </p>
            <div className="h-[1px] flex-1 bg-[#D4AF37]/20" />
          </div>

          <div className="space-y-1">
            {accountLinks.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                Icon={item.icon}
                onClick={closeDrawer}
              />
            ))}
          </div>
        </section>

      </nav>
    </div>
  );
}