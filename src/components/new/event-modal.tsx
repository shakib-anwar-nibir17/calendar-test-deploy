"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { SelectMenu } from "../main/select-menu";
import { useAppSelector } from "@/store/hooks";
import HourMinuteInput from "../ui/hour-minute";
import { CalendarEvent } from "@/store/states/calender";
import { Platform } from "@/store/states/platforms";

interface EventModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly event: CalendarEvent;
  readonly onSave: (event: CalendarEvent) => void;
  readonly onDelete: (eventId: string) => void;
  readonly timeZone: string;
}

export default function EventModal({
  isOpen,
  onClose,
  event,
  onSave,
  onDelete,
  timeZone,
}: EventModalProps) {
  const platforms = useAppSelector((state) => state.platforms.platforms);
  const [platform, setPlatform] = useState<Platform["name"]>("");
  const [eventData, setEventData] = useState<CalendarEvent>({
    id: "",
    platform: platform,
    start: new Date(),
    end: new Date(),
    status: "active",
    hoursEngaged: event?.hoursEngaged ?? 0,
    color: "#3174ad",
    timeZone: timeZone,
  });

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<string>("");
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<string>("");
  const [totalHoursEngaged, setTotalHoursEngaged] = useState<number>(
    event?.hoursEngaged ?? 0
  );

  const isEditable = eventData.status !== "completed";

  useEffect(() => {
    if (event) {
      setEventData(event);
      setStartDate(event.start);
      setEndDate(event.end);
      setPlatform(event.platform ?? (platforms[0]?.name || ""));

      // Format times for inputs
      setStartTime(format(event.start, "HH:mm"));
      setEndTime(format(event.end, "HH:mm"));
    }
  }, [event, platforms]);

  // Sync platform selection with event data
  useEffect(() => {
    setEventData((prev) => ({ ...prev, platform }));
  }, [platform]);

  // Sync hours engaged with event data
  useEffect(() => {
    setEventData((prev) => ({ ...prev, hoursEngaged: totalHoursEngaged }));
  }, [totalHoursEngaged]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (!date || !isEditable) return;
    setStartDate(date);
    updateEventDates(date, startTime, endDate, endTime);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (!date || !isEditable) return;
    setEndDate(date);
    updateEventDates(startDate, startTime, date, endTime);
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditable) return;
    setStartTime(e.target.value);
    updateEventDates(startDate, e.target.value, endDate, endTime);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditable) return;
    setEndTime(e.target.value);
    updateEventDates(startDate, startTime, endDate, e.target.value);
  };

  const updateEventDates = (
    startDate: Date,
    startTimeStr: string,
    endDate: Date,
    endTimeStr: string
  ) => {
    if (!startDate || !endDate || !startTimeStr || !endTimeStr) return;

    const [startHours, startMinutes] = startTimeStr.split(":").map(Number);
    const [endHours, endMinutes] = endTimeStr.split(":").map(Number);

    const newStart = new Date(startDate);
    newStart.setHours(startHours, startMinutes, 0);

    const newEnd = new Date(endDate);
    newEnd.setHours(endHours, endMinutes, 0);

    setEventData((prev) => ({
      ...prev,
      start: newStart,
      end: newEnd,
    }));
  };

  const handleSave = () => {
    // Validation
    if (!eventData.platform) {
      alert("Please add a platform");
      return;
    }

    if (eventData.end < eventData.start) {
      alert("End time cannot be earlier than start time");
      return;
    }

    // Call the parent component's onSave function
    onSave({
      ...eventData,
      timeZone: timeZone, // Ensure timeZone is updated to current
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this event?")) {
      onDelete(eventData.id);
    }
  };

  const handleStatusChange = (status: CalendarEvent["status"]) => {
    setEventData((prev) => ({ ...prev, status, color: "#40FF40" }));
    onSave({ ...eventData, status: status, color: "#40FF40" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {eventData.status === "active" ? "Edit Event" : "Create New Event"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <SelectMenu
              label="Platform"
              options={platforms}
              getOptionLabel={(p) => p.name}
              getOptionValue={(p) => p.name}
              value={platforms.length > 0 ? platform : ""}
              onChange={(p) => setPlatform(p)}
              className="w-full"
              disabled={!isEditable}
            />
          </div>

          {eventData.status === "active" && (
            <div className="grid gap-2">
              <SelectMenu
                label="Status"
                options={[
                  { id: "active", name: "Active" },
                  { id: "completed", name: "Complete" },
                ]}
                getOptionLabel={(s) => s.name}
                getOptionValue={(s) => s.id}
                value={eventData.status || "active"}
                onChange={(status) =>
                  handleStatusChange(
                    status as "active" | "completed" | "create"
                  )
                }
                className="w-full"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarPicker
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <div className="flex w-full items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={handleStartTimeChange}
                  disabled={!isEditable}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <HourMinuteInput
              defaultTotal={eventData.hoursEngaged}
              onChange={(hours, minutes, totalHours) =>
                setTotalHoursEngaged(totalHours)
              }
              disabled={!isEditable}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="color">Event Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="color"
                name="color"
                type="color"
                value={eventData.color}
                onChange={handleInputChange}
                className="w-12 h-8 p-1"
                disabled={!isEditable}
              />
              <div
                className="w-8 h-8 rounded"
                style={{ backgroundColor: eventData.color }}
              />
              <span className="text-sm text-gray-500">{eventData.color}</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Time Zone</Label>
            <div className="text-sm">{timeZone}</div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {eventData.status === "active" && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete Event
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {eventData.status === "active" ? "Update" : "Create"} Event
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
