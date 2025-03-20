"use client";

import {
  Calendar,
  dateFnsLocalizer,
  EventPropGetter,
  Components,
  SlotInfo,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useTheme } from "next-themes";
import { CalendarEvent } from "@/store/states/calender";
import { useFetchTimeForZoneQuery } from "@/store/services/time-zone.service";
import { useState, useEffect } from "react";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarComponentProps {
  readonly events: CalendarEvent[];
  readonly onSelectSlot: (slotInfo: SlotInfo) => void;
  readonly onSelectEvent: (event: CalendarEvent) => void;
  readonly selectedTimeZone: string;
}

export default function CalendarComponent({
  events,
  onSelectSlot,
  onSelectEvent,
  selectedTimeZone,
}: CalendarComponentProps) {
  const { theme } = useTheme();
  const { data: timeData, isLoading } =
    useFetchTimeForZoneQuery(selectedTimeZone);
  const [adjustedEvents, setAdjustedEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    if (!isLoading && timeData) {
      const convertedEvents = events.map((event) => {
        const adjustedStart = new Date(event.start).toLocaleString("en-US", {
          timeZone: selectedTimeZone,
        });

        const adjustedEnd = new Date(event.end).toLocaleString("en-US", {
          timeZone: selectedTimeZone,
        });

        return {
          ...event,
          start: new Date(adjustedStart),
          end: new Date(adjustedEnd),
        };
      });

      setAdjustedEvents(convertedEvents);
    }
  }, [events, timeData, isLoading, selectedTimeZone]);

  // Apply custom event styling based on event color
  const eventStyleGetter: EventPropGetter<CalendarEvent> = (event) => {
    return {
      style: {
        backgroundColor: event.color ?? "#3174ad",
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  // Enhanced Event Component to show timezone debug info
  const components: Components<CalendarEvent, object> = {
    event: (props) => {
      const { event } = props;

      return (
        <div className="rbc-event-content">
          <strong>{event.platform}</strong>
          <br />
          <span>{event.start.toLocaleString()}</span>
        </div>
      );
    },
  };

  return (
    <div className="h-screen max-h-[700px] w-full">
      <Calendar
        localizer={localizer}
        events={adjustedEvents}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        components={components}
        views={["month", "week", "day", "agenda"]}
        defaultView="week"
        className={theme === "dark" ? "rbc-calendar-dark" : ""}
      />
    </div>
  );
}
