'use client';

import type { SupabaseClient } from '@supabase/supabase-js';

export type NewEventPayload = {
  timelineId: string;
  title: string;
  description?: string;
  eventDateISO: string; // YYYY-MM-DD
};

// Simple UUID validator
const isUuid = (v?: string) =>
  typeof v === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

export async function createTimelineEvent(
  supabase: SupabaseClient,
  { timelineId, title, description, eventDateISO }: NewEventPayload
) {
  // Auth must be present
  const { data: au, error: auErr } = await supabase.auth.getUser();
  if (auErr || !au?.user) throw new Error('Not authenticated');

  // Hard guard to prevent empty-string UUIDs from hitting Postgres
  if (!isUuid(timelineId)) {
    throw new Error('Invalid timeline id');
  }

  // Basic input sanity (keep it simple)
  if (!title?.trim()) throw new Error('Title is required');
  if (!eventDateISO) throw new Error('Date is required');

  const { data, error } = await supabase
    .from('timeline_events')
    .insert({
      timeline_id: timelineId,
      title: title.trim(),
      description: description?.trim?.() || null,
      event_date: eventDateISO,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data as { id: string };
}
