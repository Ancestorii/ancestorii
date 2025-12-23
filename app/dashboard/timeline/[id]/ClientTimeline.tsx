'use client';

import HorizontalTimeline, { TimelineEvent } from '../_components/HorizontalTimeline';

export default function ClientTimeline({
  events,
  startYear,
  endYear,
}: {
  events: TimelineEvent[];
  startYear?: number | null;
  endYear?: number | null;
}) {
  return (
    <div className="h-[calc(100vh-112px)]">
      <HorizontalTimeline
        events={events}
        startYear={startYear ?? null}
        endYear={endYear ?? null}
        onCreateMemory={() => {
          // open your composer modal here
          console.log('Open Add Memory');
        }}
        onEventClick={(ev) => {
          // open details drawer here
          console.log('Open details for', ev.id);
        }}
      />
    </div>
  );
}
