'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItemProps = {
  href: string;
  label: string;
  Icon: any;
  onClick?: () => void;
};

export default function NavItem({
  href,
  label,
  Icon,
  onClick,
}: NavItemProps) {
  const pathname = usePathname();

  const active =
    href === '/dashboard/home'
      ? pathname === '/dashboard' || pathname === '/dashboard/home'
      : pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        group relative flex items-center gap-2.5 px-3 py-2.5
        border transition-all duration-200
        ${active
          ? 'border-[#d4af37] bg-white text-[#111827] shadow-sm'
          : 'border-transparent text-[#1f2937] hover:border-[#ead7a0] hover:bg-white/80 hover:text-[#111827]'}
      `}
    >
      <Icon
  className={`
    h-[18px] w-[18px] transition-colors duration-200
    ${active ? 'text-[#d4af37]' : 'text-[#374151] group-hover:text-[#d4af37]'}
  `}
  strokeWidth={active ? 2.5 : 2}
/>

      <span
        className={`text-[15px] leading-none ${active ? 'font-semibold' : 'font-medium'}`}
      >
        {label}
      </span>
    </Link>
  );
}