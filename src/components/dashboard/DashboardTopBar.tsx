'use client';

import { Search } from 'lucide-react';
import NotificationBell from '@/components/dashboard/NotificationBell';

export default function DashboardTopBar() {
  return (
    <header className="h-14 bg-white border-b border-stone-200 hidden md:flex items-center justify-end gap-3 px-6 sticky top-0 z-30">
      {/* Bell — full dropdown with realtime */}
      <NotificationBell />

      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search memories, people, places..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
          />
        </div>
      </div>
    </header>
  );
}