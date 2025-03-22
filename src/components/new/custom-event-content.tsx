"use client";

import { EventContentArg } from "@fullcalendar/core";
import { format } from "date-fns";

export const CustomEventContent = (eventInfo: EventContentArg) => {
  return (
    <div
      style={{ backgroundColor: eventInfo.event.backgroundColor }}
      className="p-1 text-white rounded-md shadow-md"
    >
      <p className="text-sm font-semibold">
        {eventInfo.event.start !== null
          ? format(eventInfo.event.start, "h:mm a")
          : ""}
      </p>
      <p className="text-xs">{eventInfo.event.id}</p>
    </div>
  );
};
