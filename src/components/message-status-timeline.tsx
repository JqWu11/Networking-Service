type TimelineEvent = {
  id: string;
  eventType: string;
  eventAt: string | Date;
};

type MessageStatusTimelineProps = {
  events: TimelineEvent[];
};

function formatEventType(eventType: string): string {
  return eventType
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function MessageStatusTimeline({ events }: MessageStatusTimelineProps) {
  if (events.length === 0) {
    return <p className="text-xs text-slate-500">No timeline events yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {events.map((event) => (
        <li key={event.id} className="flex items-start gap-2 text-xs text-slate-600">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400" />
          <span>
            <span className="font-medium text-slate-800">{formatEventType(event.eventType)}</span>{" "}
            <span className="text-slate-500">
              {new Date(event.eventAt).toLocaleString()}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
