import { getServerClient } from "@/lib/supabase/server";

export type NewEventPayload = {
  timelineId: string;
  title: string;
  description?: string;
  eventDateISO: string; // YYYY-MM-DD
};

// Simple UUID validator
const isUuid = (v?: string) =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

export async function createTimelineEvent({
  timelineId,
  title,
  description,
  eventDateISO,
}: NewEventPayload) {
  const supabase = await getServerClient();

  // Auth must be present
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Guards
  if (!isUuid(timelineId)) throw new Error("Invalid timeline id");
  if (!title?.trim()) throw new Error("Title is required");
  if (!eventDateISO) throw new Error("Date is required");

  const { data, error } = await supabase
    .from("timeline_events")
    .insert({
      timeline_id: timelineId,
      title: title.trim(),
      description: description?.trim() || null,
      event_date: eventDateISO,
    })
    .select("id")
    .single();

  if (error) throw error;

  return data as { id: string };
}
