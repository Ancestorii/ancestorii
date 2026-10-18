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

  // Ink when it's the page you're on; otherwise ink text on white with a soft grey hover.
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`
        flex min-h-[46px] items-center gap-3 rounded-[14px] px-[14px] py-2
        text-[15px] leading-tight
        transition-colors duration-150 ease-out
        ${active
          ? 'bg-[var(--ink)] font-bold text-white'
          : 'font-semibold text-[var(--ink)] hover:bg-[var(--hover)]'}
      `}
    >
      <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={2} aria-hidden="true" />

      <span className="min-w-0 truncate">
        {label}
      </span>
    </Link>
  );
}
