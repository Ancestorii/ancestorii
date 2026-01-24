'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';

type Limits = {
  max_albums: number | null;
  max_timelines: number | null;
  max_capsules: number | null;
};

type Counts = {
  albums: number;
  timelines: number;
  capsules: number;
};

export function usePlanLimits() {
  const supabase = getBrowserClient();
  const [loading, setLoading] = useState(true);
  const [limits, setLimits] = useState<Limits | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess?.session?.user?.id;
      if (!uid) return;

      // 🔑 get plan limits
      const { data: limitData } = await supabase
        .rpc('get_user_plan_limits', { uid });

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


      setLimits(limitData);
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
    canCreate: {
      album:
        limits?.max_albums == null ||
        counts!.albums < limits.max_albums,
      timeline:
        limits?.max_timelines == null ||
        counts!.timelines < limits.max_timelines,
      capsule:
        limits?.max_capsules == null ||
        counts!.capsules < limits.max_capsules,
    },
  };
}
