import { CalendarEvent } from "@/store/states/calender";
import { DateRange } from "react-day-picker";

export const getUpcomingClasses = (
  events: CalendarEvent[],
  dateRange: DateRange | undefined
): CalendarEvent[] => {
  if (!dateRange) return [];

  return events.filter(
    (event) =>
      event.status === "create" &&
      new Date(event.start) >= dateRange.from! &&
      new Date(event.start) <= dateRange.to!
  );
};

export const getRecentClasses = (
  events: CalendarEvent[],
  dateRange: DateRange | undefined
): CalendarEvent[] => {
  if (!dateRange) return [];

  return events.filter(
    (event) =>
      event.status === "completed" &&
      new Date(event.start) >= dateRange.from! &&
      new Date(event.start) <= dateRange.to!
  );
};
