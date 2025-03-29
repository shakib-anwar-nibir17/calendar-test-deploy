"use client";

import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetPlatformsQuery } from "@/store/services/platform.service";
import {
  useDeleteParentEventMutation,
  useGetEventsQuery,
  useGlobalUpdateEventMutation,
} from "@/store/services/calendar-event.service";
import { CalendarEvent } from "@/store/states/calender";
import { Platform } from "@/store/states/platforms";
import EventList from "./event-list";
import { EventForm } from "./event-form";
import { useTimeZone } from "@/contexts/time-zone-context";
import { toast } from "sonner";

export default function EventDashboard() {
  const { data: platforms } = useGetPlatformsQuery();
  const { data: allEvents, refetch } = useGetEventsQuery();
  const [updateEvent] = useGlobalUpdateEventMutation();
  const [deleteParentEvent] = useDeleteParentEventMutation();
  const { currentTimeZone } = useTimeZone();

  const recurringEvents =
    allEvents?.events.filter(
      (event) => event.isRecurring || !event.parentEventId
    ) ?? [];

  const [selectedPlatform, setSelectedPlatform] = useState<
    Platform["name"] | string
  >(platforms?.data?.[0]?.name ?? "all");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent>(
    {} as CalendarEvent
  );

  // Filter events based on selected platform
  const filteredEvents =
    recurringEvents?.filter(
      (event) =>
        selectedPlatform === "all" || event.platform === selectedPlatform
    ) ?? [];

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleSaveEvent = async (eventData: CalendarEvent) => {
    if (selectedEvent) {
      const response = await updateEvent(eventData);
      console.log(response);
    }
    setSelectedEvent({} as CalendarEvent);
    await refetch();
  };

  const handleDeleteEvent = async (eventId: string) => {
    const response = await deleteParentEvent(eventId);
    if (response) {
      toast.success("Event deleted successfully.");
      setSelectedEvent({} as CalendarEvent);
    } else {
      toast.error("Failed to delete event.");
    }
    refetch();
  };

  const handlePlatformChange = (name: string) => {
    setSelectedPlatform(name);
    setSelectedEvent({} as CalendarEvent);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Platform Events</h2>
          <Select value={selectedPlatform} onValueChange={handlePlatformChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a platform" />
            </SelectTrigger>
            <SelectContent>
              {platforms?.data.map((platform) => (
                <SelectItem key={platform._id} value={platform.name}>
                  {platform.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <EventList
          events={filteredEvents}
          onSelectEvent={handleSelectEvent}
          onDeleteEvent={handleDeleteEvent}
          selectedEventId={selectedEvent?.id}
          platforms={platforms?.data || []}
        />
      </div>

      <div className="lg:col-span-2">
        {selectedEvent ? (
          <EventForm
            event={selectedEvent}
            onSubmit={handleSaveEvent}
            timeZone={currentTimeZone || "UTC"}
          />
        ) : (
          <div className="bg-muted/40 p-6 rounded-lg text-center">
            <p className="text-muted-foreground">Select an event to edit</p>
          </div>
        )}
      </div>
    </div>
  );
}
