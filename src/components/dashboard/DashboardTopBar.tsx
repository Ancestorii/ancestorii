'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Users, Calendar, Image as ImageIcon, Package, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';
import NotificationBell from '@/components/dashboard/NotificationBell';

type SearchResult = {
  id: string;
  title: string;
  type: 'loved_one' | 'timeline' | 'album' | 'capsule';
  href: string;
};

const TYPE_META: Record<SearchResult['type'], { label: string; icon: typeof Users; color: string }> = {
  loved_one: { label: 'Loved One', icon: Users, color: '#C8A557' },
  timeline: { label: 'Timeline', icon: Calendar, color: '#7C8B6A' },
  album: { label: 'Album', icon: ImageIcon, color: '#8B7355' },
  capsule: { label: 'Capsule', icon: Package, color: '#A9782F' },
};

export default function DashboardTopBar() {
  const supabase = getBrowserClient();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);

      const pattern = `%${trimmed}%`;

      const [lovedOnes, timelines, albums, capsules] = await Promise.all([
        supabase
          .from('family_members')
          .select('id, full_name')
          .ilike('full_name', pattern)
          .limit(5),
        supabase
          .from('timelines')
          .select('id, title')
          .ilike('title', pattern)
          .limit(5),
        supabase
          .from('albums')
          .select('id, title')
          .ilike('title', pattern)
          .limit(5),
        supabase
          .from('memory_capsules')
          .select('id, title')
          .ilike('title', pattern)
          .limit(5),
      ]);

      const combined: SearchResult[] = [
        ...(lovedOnes.data ?? []).map((r) => ({
          id: r.id,
          title: r.full_name || 'Unnamed',
          type: 'loved_one' as const,
          href: `/dashboard/family/${r.id}`,
        })),
        ...(timelines.data ?? []).map((r) => ({
          id: r.id,
          title: r.title || 'Untitled',
          type: 'timeline' as const,
          href: `/dashboard/timeline/${r.id}`,
        })),
        ...(albums.data ?? []).map((r) => ({
          id: r.id,
          title: r.title || 'Untitled',
          type: 'album' as const,
          href: `/dashboard/albums/${r.id}`,
        })),
        ...(capsules.data ?? []).map((r) => ({
          id: r.id,
          title: r.title || 'Untitled',
          type: 'capsule' as const,
          href: `/dashboard/capsules/${r.id}`,
        })),
      ];

      setResults(combined);
      setOpen(combined.length > 0);
      setSearching(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, supabase]);

  const handleSelect = (result: SearchResult) => {
    setQuery('');
    setOpen(false);
    router.push(result.href);
  };

  return (
    <header className="h-14 bg-white border-b border-stone-200 hidden md:flex items-center justify-end gap-3 px-6 sticky top-0 z-30">
      <NotificationBell />

      <div ref={wrapperRef} className="flex-1 max-w-md hidden sm:block relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setOpen(true); }}
            placeholder="Search memories, people, places..."
            className="w-full pl-9 pr-9 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results dropdown */}
        {open && (
          <div
            className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.1)] overflow-hidden z-50"
          >
            {searching && (
              <div className="px-4 py-3 text-sm text-stone-500">Searching...</div>
            )}

            {!searching && results.length === 0 && query.trim().length >= 2 && (
              <div className="px-4 py-3 text-sm text-stone-500">No results found.</div>
            )}

            {!searching && results.length > 0 && (
              <div className="py-1.5 max-h-[320px] overflow-y-auto">
                {results.map((result) => {
                  const meta = TYPE_META[result.type];
                  const Icon = meta.icon;

                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-stone-50 transition-colors"
                    >
                      <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                        style={{ background: `${meta.color}15` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: meta.color }} strokeWidth={1.6} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-800 truncate">{result.title}</p>
                        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: meta.color }}>
                          {meta.label}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}