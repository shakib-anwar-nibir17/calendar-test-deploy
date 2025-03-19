import { CalendarEvent } from "@/store/states/calender";

export const getUpcomingAndRecentEvents = (events: CalendarEvent[]) => {
  const now = new Date();

  // Filter upcoming events (only active events)
  const upcoming = events
    .filter((event) => new Date(event.start) > now && event.status === "active")
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 3);

  // Filter recent completed events
  const recentCompleted = events
    .filter(
      (event) => new Date(event.end) < now && event.status === "completed"
    )
    .sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime())
    .slice(0, 3);

  return { upcoming, recentCompleted };
};
