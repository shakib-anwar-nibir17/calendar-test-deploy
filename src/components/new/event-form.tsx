"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { addHours, format, parseISO, set } from "date-fns";
import { CalendarEvent } from "@/store/states/calender";
import { useGetPlatformsQuery } from "@/store/services/platform.service";

// Define the hours engaged options
const hoursEngagedOptions = [
  { value: 0.5, label: "30 minutes" },
  { value: 0.75, label: "45 minutes" },
  { value: 1, label: "1 hour" },
  { value: 2, label: "2 hours" },
];

interface EventFormProps {
  event: Partial<CalendarEvent> | null;
  onSave: (event: CalendarEvent) => void;
  onDelete: () => void;
  isNew: boolean;
  currentTimezone: string;
}

export default function EventForm({
  event,
  onSave,
  onDelete,
  isNew,
  currentTimezone,
}: EventFormProps) {
  // Use RTK Query to fetch platforms
  const { data: platforms } = useGetPlatformsQuery();

  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    platform: "",
    start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    hoursEngaged: 1,
    status: "active",
    allDay: false,
    timeZone: currentTimezone,
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string>("12:00");

  // Update the timeZone when currentTimezone changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      timeZone: currentTimezone,
    }));
  }, [currentTimezone]);

  useEffect(() => {
    if (event) {
      console.log("Event data received in form:", event);

      try {
        // Format the start date for the datetime-local input
        let formattedStart = event.start;
        if (typeof event.start === "string") {
          // Parse the ISO string to a Date object
          const startDate = parseISO(event.start);
          // Format it for the datetime-local input (YYYY-MM-DDTHH:MM)
          formattedStart = format(startDate, "yyyy-MM-dd'T'HH:mm");

          // Set the selected date and time for our custom picker
          setSelectedDate(startDate);
          setSelectedTime(format(startDate, "HH:mm"));
        }

        // Ensure hoursEngaged is one of our predefined options
        let hoursEngaged = event.hoursEngaged || 1;
        // Find the closest match in our options
        if (
          !hoursEngagedOptions.some((option) => option.value === hoursEngaged)
        ) {
          const closestOption = hoursEngagedOptions.reduce((prev, curr) =>
            Math.abs(curr.value - hoursEngaged) <
            Math.abs(prev.value - hoursEngaged)
              ? curr
              : prev
          );
          hoursEngaged = closestOption.value;
        }

        setFormData({
          ...event,
          start: formattedStart,
          hoursEngaged,
          timeZone: currentTimezone,
        });
      } catch (error) {
        console.error("Error formatting event date:", error);
        setFormData({
          ...event,
          start:
            typeof event.start === "string"
              ? event.start
              : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          hoursEngaged: 1,
          timeZone: currentTimezone,
        });
      }
    }
  }, [event, currentTimezone]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number.parseFloat(value)
          : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleHoursEngagedChange = (value: string) => {
    setFormData({
      ...formData,
      hoursEngaged: Number(value),
    });
  };

  const calculateEndTime = (start: string, hoursEngaged: number): string => {
    if (!start || !hoursEngaged) return "";

    try {
      const startDate = parseISO(start);
      const endDate = addHours(startDate, hoursEngaged);
      return endDate.toISOString();
    } catch (error) {
      console.error("Error calculating end time:", error);
      return new Date().toISOString();
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(e.target.value);
  };

  const handleAddDateTime = () => {
    if (!selectedDate) return;

    // Parse the time string
    const [hours, minutes] = selectedTime.split(":").map(Number);

    // Create a new date with the selected date and time
    const newDate = set(selectedDate, { hours, minutes });

    // Update the form data
    setFormData({
      ...formData,
      start: format(newDate, "yyyy-MM-dd'T'HH:mm"),
    });

    // Close the popover
    setDatePickerOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure start is in ISO format
    let startISO = formData.start as string;
    if (!startISO.includes("Z") && !startISO.includes("+")) {
      startISO = new Date(startISO).toISOString();
    }

    // Calculate end time based on start time and hours engaged
    const end = calculateEndTime(startISO, formData.hoursEngaged as number);

    const eventToSave = {
      ...formData,
      id: formData.id,
      end,
      start: startISO,
      platform: formData.platform as string,
      hoursEngaged: formData.hoursEngaged as number,
      status: formData.status as "active" | "completed" | "create",
      allDay: Boolean(formData.allDay),
      timeZone: currentTimezone,
    } as CalendarEvent;

    console.log("Submitting event:", eventToSave);
    onSave(eventToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="platform">Platform</Label>
        <Select
          value={formData.platform}
          onValueChange={(value) => handleSelectChange("platform", value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            {platforms?.data.map((platform) => (
              <SelectItem key={platform._id} value={platform.name}>
                {platform.name} (${platform.hourlyRate}/hr)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="start">Start Time</Label>
        <div className="flex flex-col space-y-2">
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                  !formData.start && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.start ? (
                  format(new Date(formData.start), "PPP p")
                ) : (
                  <span>Select date and time</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card" align="start">
              <div className="p-4 border-b border-border">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="rounded-md border-0"
                />
                <div className="mt-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={selectedTime}
                    onChange={handleTimeChange}
                    className="w-full focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDatePickerOpen(false)}
                    className="flex items-center border border-input hover:bg-accent"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Close
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddDateTime}
                    className="flex items-center bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Add Time
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Keep the original input but hide it for form submission */}
          <Input
            id="start"
            name="start"
            type="datetime-local"
            value={formData.start}
            onChange={handleChange}
            required
            className="hidden"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hoursEngaged">Hours Engaged</Label>
        <Select
          value={formData.hoursEngaged?.toString()}
          onValueChange={handleHoursEngagedChange}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            {hoursEngagedOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          End time will be calculated automatically based on hours engaged
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) =>
            handleSelectChange(
              "status",
              value as "active" | "completed" | "create"
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="create">Create</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="allDay"
          name="allDay"
          checked={formData.allDay}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, allDay: checked as boolean })
          }
        />
        <Label htmlFor="allDay">All Day Event</Label>
      </div>

      <div className="text-sm text-muted-foreground mt-2">
        Using timezone: <span className="font-medium">{currentTimezone}</span>
      </div>

      <div className="flex justify-between pt-4">
        {!isNew && (
          <Button type="button" variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        )}
        <div className="flex gap-2 ml-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onSave({
                ...formData,
                end: calculateEndTime(
                  formData.start as string,
                  formData.hoursEngaged as number
                ),
                platform: formData.platform as string,
                start: formData.start as string,
                hoursEngaged: formData.hoursEngaged as number,
                status: formData.status as "active" | "completed" | "create",
                allDay: Boolean(formData.allDay),
                timeZone: currentTimezone,
              } as CalendarEvent)
            }
          >
            Cancel
          </Button>
          <Button type="submit">{isNew ? "Create" : "Update"}</Button>
        </div>
      </div>
    </form>
  );
}
