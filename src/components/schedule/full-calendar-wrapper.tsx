"use client";

import { useEffect, useRef } from "react";
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";
import { CalendarEvent } from "@/store/states/calender";

interface FullCalendarWrapperProps {
  readonly events: CalendarEvent[];
  readonly timezone: string;
  readonly onEventClick: (info: unknown) => void;
  readonly onDateSelect: (info: unknown) => void;
}

export function FullCalendarWrapper({
  events,
  timezone,
  onEventClick,
  onDateSelect,
}: FullCalendarWrapperProps) {
  const calendarElRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<Calendar | null>(null);

  useEffect(() => {
    if (!calendarElRef.current) return;

    // Create a new calendar instance
    const calendarApi = new Calendar(calendarElRef.current, {
      plugins: [
        dayGridPlugin,
        timeGridPlugin,
        interactionPlugin,
        momentTimezonePlugin,
      ],
      initialView: "dayGridMonth",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      events: events,
      eventClick: onEventClick,
      select: onDateSelect,
      timeZone: timezone,
      height: "auto",
      slotMinTime: "00:00:00",
      slotMaxTime: "24:00:00",
      nowIndicator: true,
      eventTimeFormat: {
        hour: "2-digit",
        minute: "2-digit",
        meridiem: false,
      },
    });

    // Render the calendar
    calendarApi.render();

    // Save the calendar instance
    calendarRef.current = calendarApi;

    // Cleanup function
    return () => {
      if (calendarRef.current) {
        calendarRef.current.destroy();
        calendarRef.current = null;
      }
    };
  }, []); // Empty dependency array to run only once on mount

  // Update events when they change
  useEffect(() => {
    if (!calendarRef.current) return;

    // Remove all events
    calendarRef.current.removeAllEvents();

    // Add new events
    calendarRef.current.addEventSource(events);
  }, [events]);

  // Update timezone when it changes
  useEffect(() => {
    if (!calendarRef.current) return;

    calendarRef.current.setOption("timeZone", timezone);
  }, [timezone]);

  return <div ref={calendarElRef} />;
}
