/**
 * Utility functions to filter calendar events
 */

import { CalendarEvent } from "@/store/states/calender";

/**
 * Filters calendar events to find upcoming classes (status: "create")
 * @param events Array of calendar events to filter
 * @returns Array of upcoming calendar events
 */
export const getUpcomingClasses = (
  events: CalendarEvent[]
): CalendarEvent[] => {
  return events.filter((event) => event.status === "create");
};

/**
 * Filters calendar events to find recent classes (status: "completed")
 * @param events Array of calendar events to filter
 * @returns Array of completed calendar events
 */
export const getRecentClasses = (events: CalendarEvent[]): CalendarEvent[] => {
  return events.filter((event) => event.status === "completed");
};
