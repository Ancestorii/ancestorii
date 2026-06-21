'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';

type Limits = {
  max_albums: number | null;
  max_timelines: number | null;
  max_capsules: number | null;
  max_storage: number | null;
  max_upload_size: number | null;
  max_video_length: number | null;
};

type Counts = {
  albums: number;
  timelines: number;
  capsules: number;
};

// Last-resort fallback if the plans table can't be read (matches the Free tier video cap).
const DEFAULT_VIDEO_LENGTH = 300;

export function usePlanLimits() {
  const supabase = getBrowserClient();
  const [loading, setLoading] = useState(true);
  const [limits, setLimits] = useState<Limits | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess?.session?.user?.id;
      if (!uid) {
        setLoading(false);
        return;
      }

      // 🔑 Active Premium plan limits — the RPC returns no rows for free users.
      const { data: limitData } = await supabase
        .rpc('get_user_plan_limits', { uid });
      const premiumRow = (Array.isArray(limitData) ? limitData[0] : limitData) as Limits | null;

      // 🔑 Free-tier baseline read straight from the plans table, so the cap
      // always comes from the tier column rather than a hardcoded constant.
      const { data: freePlan } = await supabase
        .from('plans')
        .select('max_albums, max_timelines, max_capsules, max_storage, max_upload_size, max_video_length')
        .eq('name', 'Free')
        .maybeSingle();

      // Premium wins when present; otherwise fall back to the Free tier row.
      const effective = (premiumRow ?? (freePlan as Limits | null) ?? null);

      // 🔑 get counts
      const [{ count: albums }, { count: timelines }, { count: capsules }] =
        await Promise.all([
          supabase
            .from('albums')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', uid),

          supabase
            .from('timelines')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', uid),

          supabase
            .from('capsules')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', uid),
        ]);

      setLimits(effective);
      setCounts({
        albums: albums ?? 0,
        timelines: timelines ?? 0,
        capsules: capsules ?? 0,
      });

      setLoading(false);
    })();
  }, []);

  return {
    loading,
    limits,
    counts,
    // Per-tier video length cap in SECONDS (Premium via RPC, otherwise the Free baseline).
    maxVideoLength: limits?.max_video_length ?? DEFAULT_VIDEO_LENGTH,
    canCreate: {
      album:
        limits?.max_albums == null ||
        (counts != null && counts.albums < limits.max_albums),
      timeline:
        limits?.max_timelines == null ||
        (counts != null && counts.timelines < limits.max_timelines),
      capsule:
        limits?.max_capsules == null ||
        (counts != null && counts.capsules < limits.max_capsules),
    },
  };
}
