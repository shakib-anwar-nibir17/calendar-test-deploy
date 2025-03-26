"use client";

import { EventContentArg } from "@fullcalendar/core";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const CustomEventContent = (
  eventInfo: EventContentArg,
  currentTimeZone: string
) => {
  // Convert the start time to the current time zone if available.
  const zonedDate = eventInfo.event.start
    ? toZonedTime(eventInfo.event.start, currentTimeZone)
    : null;

  return (
    <div className="p-1 text-white rounded-md  w-full">
      <p className="text-sm font-semibold">
        {zonedDate ? format(zonedDate, "h:mm a") : ""}
      </p>
      <p className="text-xs">{eventInfo.event.extendedProps.platform}</p>
      <p className="text-xs">
        <strong>HOURS ENGAGED:</strong>{" "}
        {eventInfo.event.extendedProps.hoursEngaged} Hours
      </p>
    </div>
  );
};
