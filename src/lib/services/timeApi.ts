"use client";

export interface TimeApiResponse {
  dateTime: string;
  date: string;
  time: string;
  timeZone: string;
  dayOfWeek: string;
  dstActive: boolean;
}

export async function fetchCurrentTime(
  timeZone = "UTC"
): Promise<TimeApiResponse> {
  try {
    const response = await fetch(
      `https://timeapi.io/api/Time/current/zone?timeZone=${encodeURIComponent(
        timeZone
      )}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching time: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch time from timeapi.io:", error);
    throw error;
  }
}

// Function to convert a date to a different timezone
export async function convertTimeZone(
  dateTime: string,
  fromTimeZone: string,
  toTimeZone: string
): Promise<TimeApiResponse> {
  try {
    const response = await fetch(
      "https://timeapi.io/api/Conversion/ConvertTimeZone",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateTime,
          fromTimeZone,
          toTimeZone,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error converting time zone: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to convert time zone:", error);
    throw error;
  }
}

// Function to get available time zones
export async function getTimeZones(): Promise<string[]> {
  try {
    const response = await fetch(
      "https://timeapi.io/api/TimeZone/AvailableTimeZones"
    );

    if (!response.ok) {
      throw new Error(`Error fetching time zones: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch time zones:", error);
    return [];
  }
}

// Mock function to fetch events from time API
export async function fetchTimeApiEvents() {
  return [];
}
