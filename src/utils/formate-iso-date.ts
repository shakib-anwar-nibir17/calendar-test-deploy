import { format, parseISO } from "date-fns";

/**
 * Formats an ISO date string into a readable format.
 * @param isoDate - The ISO date string (e.g., "2025-03-13T12:30:00.000Z").
 * @param dateFormat - Optional format string (default: "PPP").
 * @returns Formatted date string or "Invalid Date" if input is invalid.
 */
export const formatDate = (
  isoDate?: string,
  dateFormat: string = "PPP"
): string => {
  if (!isoDate) return "Invalid Date";
  try {
    return format(parseISO(isoDate), dateFormat);
  } catch (error) {
    console.error("Invalid ISO date format:", isoDate, error);
    return "Invalid Date";
  }
};
