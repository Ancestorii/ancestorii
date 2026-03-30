'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavItem({
  href,
  label,
  Icon,
  onClick,
  badge,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  badge?: string;
}) {
  const pathname = usePathname();

  const active =
    href === '/dashboard/home'
      ? pathname === '/dashboard' || pathname === '/dashboard/home'
      : pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative flex items-center justify-between group rounded-xl transition-all duration-300 ease-out

      /* MOBILE */
      px-3 py-2.5 xl:px-4 xl:py-3 2xl:py-4
      ${active
        ? 'bg-[#0F1A2E] border border-[#D4AF37]/40 text-white shadow-sm'
        : 'bg-white/[0.02] border border-transparent text-white/85 active:scale-[0.98]'}

      /* DESKTOP (unchanged feel) */
      lg:px-5 lg:py-3.5
      lg:border-none
      lg:bg-transparent
      lg:${active ? 'text-white bg-white/5' : 'hover:text-white hover:bg-white/[0.04]'}
      `}
    >
      {/* Gold Accent Pillar (desktop mainly) */}
      <span
        className={`absolute left-2 top-1/2 -translate-y-1/2 w-[4px] rounded-full bg-[#D4AF37] transition-all duration-300
        ${active
          ? 'h-6 opacity-100'
          : 'h-0 opacity-0 lg:group-hover:h-4 lg:group-hover:opacity-40'}
        `}
      />

      {/* Icon + Label */}
      <div className="flex items-center gap-4">
        <Icon
          className={`h-4 w-4 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6 transition-colors duration-300
          ${active ? 'text-[#D4AF37]' : 'group-hover:text-[#D4AF37]'}`}
        />

        <span
          className={`text-[13px] xl:text-[14px] 2xl:text-[15px] tracking-[0.2px]
          ${active ? 'font-semibold text-white' : 'font-medium'}`}
        >
          {label}
        </span>
      </div>

      {badge && (
        <span className="text-[12px] px-2 py-0.5 rounded-full bg-white/5 text-white/60 font-medium">
          {badge}
        </span>
      )}
    </Link>
  );
}