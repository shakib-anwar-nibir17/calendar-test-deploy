"use client";

import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatInTimeZone } from "date-fns-tz";
import TimeZoneSelector from "../schedule/time-zone-selector";
import CalendarComponent from "../schedule/calender-component";
import EventModal from "../schedule/event-modal";
import { useTimeZone } from "../schedule/time-zone-context";
import { TimeDisplay } from "../schedule/time-display";
import { CalendarEvent } from "@/store/states/calender";
import { SlotInfo } from "react-big-calendar";
import { useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
// Assuming you have a toast component

export default function ScheduleContainer() {
  const platforms = useAppSelector((state) => state.platforms.platforms);
  const { currentTimeZone, setCurrentTimeZone, timeData } = useTimeZone();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null);
  const [selectedTimeZone, setSelectedTimeZone] =
    useState<string>(currentTimeZone);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isAddingEvent, setIsAddingEvent] = useState<boolean>(false);

  // Load events from localStorage on initial load
  useEffect(() => {
    const savedEvents = localStorage.getItem("calendarEvents");
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents).map(
          (event: CalendarEvent) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
          })
        );
        setEvents(parsedEvents);
      } catch (error) {
        console.error("Error parsing events from localStorage:", error);
        localStorage.removeItem("calendarEvents");
      }
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem("calendarEvents", JSON.stringify(events));
    } else {
      // Clear storage if no events
      localStorage.removeItem("calendarEvents");
    }
  }, [events]);

  const handleAddNewEvent = () => {
    setIsAddingEvent(true);
    setCurrentEvent({
      id: Date.now().toString(),
      platform: platforms[0]?.name || "",
      start: new Date(),
      end: new Date(new Date().setHours(new Date().getHours() + 1)),
      status: "create",
      color: "#3174ad",
      timeZone: selectedTimeZone,
    });
    setIsModalOpen(true);
  };

  const handleSelectSlot = ({ start, end }: SlotInfo) => {
    setIsAddingEvent(true);
    setCurrentEvent({
      id: Date.now().toString(),
      platform: platforms[0]?.name || "",
      start,
      end,
      status: "create",
      color: "#3174ad",
      timeZone: currentTimeZone,
    });
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (event.status === "completed") {
      toast.error("This event has already been completed.");
    } else {
      setIsAddingEvent(false);
      setCurrentEvent(event);
      setIsModalOpen(true);
    }
  };

  const handleSaveEvent = (eventData: CalendarEvent) => {
    // For new events or existing events, ensure status is set appropriately
    const updatedEventData = {
      ...eventData,
      // Set status to "active" for new events
      status: events.find((e) => e.id === eventData.id)
        ? eventData.status
        : "active",
    };

    if (events.find((e) => e.id === eventData.id)) {
      // Update existing event
      setEvents(
        events.map((e) => (e.id === eventData.id ? updatedEventData : e))
      );
      toast.success("Event Updated");
    } else {
      // Add new event
      setEvents([...events, updatedEventData]);
      toast.success("Your new calendar event has been created successfully.");
    }
    setIsModalOpen(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter((event) => event.id !== eventId));
    toast("Your calendar event has been deleted successfully.");
    setIsModalOpen(false);
  };

  const handleTimeZoneChange = (newTimeZone: string) => {
    setSelectedTimeZone(newTimeZone);
    setCurrentTimeZone(newTimeZone);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentEvent(null);
  };

  // Convert events to the selected timezone for display
  const eventsInSelectedTimeZone = events
    .map((event) => {
      if (!event.start || !event.end) {
        return null;
      }

      return {
        ...event,
        displayStart: new Date(
          formatInTimeZone(
            new Date(event.start),
            selectedTimeZone,
            "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
          )
        ),
        displayEnd: new Date(
          formatInTimeZone(
            new Date(event.end),
            selectedTimeZone,
            "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
          )
        ),
      };
    })
    .filter(Boolean); // Remove null values if any

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-gray-50">
      <Card className="w-full shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Calendar App</CardTitle>
          <div className="flex items-center gap-4">
            <TimeZoneSelector
              selectedTimeZone={selectedTimeZone}
              onTimeZoneChange={handleTimeZoneChange}
            />
            <Button onClick={handleAddNewEvent}>Add Event</Button>
          </div>
          <TimeDisplay
            seconds={timeData.seconds}
            hour={timeData.hour}
            minute={timeData.minute}
            milliSeconds={timeData.milliSeconds}
            timeZone={timeData.timeZone}
            showLocalTime
          />
        </CardHeader>
        <CardContent>
          <CalendarComponent
            events={eventsInSelectedTimeZone.filter((event) => event !== null)}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectedTimeZone={selectedTimeZone}
          />
        </CardContent>
      </Card>

      {isModalOpen && currentEvent && (
        <EventModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          event={currentEvent}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          timeZone={selectedTimeZone}
        />
      )}
    </main>
  );
}
