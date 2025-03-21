"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  EventClickArg,
  DateSelectArg,
  EventChangeArg,
} from "@fullcalendar/core";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTimeZone } from "@/contexts/time-zone-context";
import { EventModal } from "./event-modal";
import { CalendarEvent } from "@/store/states/calender";
import {
  useCreateEventMutation,
  useDeleteEventMutation,
  useGetEventsQuery,
  useUpdateEventMutation,
} from "@/store/services/calendar-event.service";
import { toast } from "sonner";
import { CurrentTime } from "./current-time";
import { TimeZoneSelector } from "./time-zone-selector";

export default function Calendar() {
  const { data: events, isLoading, refetch, isError } = useGetEventsQuery();
  const [addEvent] = useCreateEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent>(
    {} as CalendarEvent
  );
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const { currentTimeZone } = useTimeZone();

  // Handle date selection for creating a new event
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setModalMode("add");
    setSelectedEvent({
      id: "",
      platform: "",
      hoursEngaged: 0,
      status: "create",
      timeZone: currentTimeZone,
      backgroundColor: "#3b82f6",
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
    });
    setIsModalOpen(true);
  };

  // Handle event click for editing
  const handleEventClick = (clickInfo: EventClickArg) => {
    setModalMode("edit");
    setSelectedEvent({
      id: clickInfo.event.id,
      platform: clickInfo.event.extendedProps.platform,
      hoursEngaged: clickInfo.event.extendedProps.hoursEngaged,
      status: clickInfo.event.extendedProps.status,
      timeZone: clickInfo.event.extendedProps.timeZone,
      backgroundColor: clickInfo.event.backgroundColor,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      allDay: clickInfo.event.allDay,
    });
    setIsModalOpen(true);
  };

  // Handle event drag and resize
  const handleEventChange = async (changeInfo: EventChangeArg) => {
    try {
      await updateEvent({
        id: changeInfo.event.id,
        start: changeInfo.event.startStr,
        end: changeInfo.event.endStr,
        allDay: changeInfo.event.allDay,
      }).unwrap();

      toast.success("Event updated successfully.");
    } catch (error) {
      toast.error(`Failed to update event.${error}`);
      changeInfo.revert();
    }
  };

  // Handle form submission for adding/editing events
  const handleFormSubmit = async (eventData: CalendarEvent) => {
    console.log(eventData);
    try {
      if (modalMode === "add") {
        await addEvent(eventData).unwrap();
        toast.success("Event added successfully.");
      } else {
        await updateEvent(eventData).unwrap();
        toast.success("Event updated successfully.");
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      toast.error(
        `Failed to ${
          modalMode === "add" ? "add" : "update"
        } event. error = ${error}`
      );
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id).unwrap();
      toast.success("Event deleted successfully.");
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      toast.error(`Failed to delete event. error = ${error}`);
    }
  };

  // Show error if API fetch fails
  useEffect(() => {
    if (isError) {
      toast.error("Failed to fetch events. Please try again later.");
    }
  }, [isError]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="calendar-container space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <CurrentTime />
        </div>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium">Time Zone</span>
            <TimeZoneSelector />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setModalMode("add");
                setSelectedEvent({
                  id: "",
                  platform: "math",
                  hoursEngaged: 0,
                  status: "create",
                  timeZone: currentTimeZone,
                  backgroundColor: "#3b82f6",
                  start: new Date().toISOString(),
                  end: new Date().toISOString(),
                  allDay: false,
                });
                setIsModalOpen(true);
              }}
            >
              Add Event
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          events={events || []}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventChange={handleEventChange}
          height="auto"
          timeZone={currentTimeZone} // Use the selected time zone
        />
      </div>

      {isModalOpen && (
        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          event={selectedEvent}
          onSubmit={handleFormSubmit}
          onDelete={handleDeleteEvent}
          mode={modalMode}
          timeZone={currentTimeZone}
        />
      )}
    </div>
  );
}
