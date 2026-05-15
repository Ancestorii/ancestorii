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
        group flex items-center gap-3 rounded-[14px] px-4 py-3
        transition-all duration-[180ms] ease-in-out
        ${active
          ? 'bg-[#FBF3E0] text-[#92710E]'
          : 'text-[#374151] hover:bg-[#F9F5ED] hover:text-[#92710E]'}
      `}
    >
      <Icon
        className={`
          h-5 w-5 flex-shrink-0 transition-colors duration-[180ms]
          ${active ? 'text-[#B8924A]' : 'text-[#9CA3AF] group-hover:text-[#B8924A]'}
        `}
        strokeWidth={1.5}
      />

      <span className={`text-[15px] leading-none ${active ? 'font-semibold' : 'font-medium'}`}>
        {label}
      </span>
    </Link>
  );
}