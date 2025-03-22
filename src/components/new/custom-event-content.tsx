import { EventContentArg } from "@fullcalendar/core";

export const CustomEventContent = (eventInfo: EventContentArg) => {
  return (
    <div
      style={{ backgroundColor: eventInfo.event.backgroundColor }}
      className="p-1 text-white rounded-md shadow-md"
    >
      <p className="text-sm font-semibold">{eventInfo.event.startStr}</p>
      <p className="text-xs">{eventInfo.event.title}</p>
    </div>
  );
};
