"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { addMinutes, format, parseISO } from "date-fns";
import { CalendarEvent } from "@/store/states/calender";
import { SelectMenu } from "../main/select-menu";
import { useGetPlatformsQuery } from "@/store/services/platform.service";
import { Platform } from "@/store/states/platforms";
import { useUpdateEventMutation } from "@/store/services/calendar-event.service";
import { toZonedTime } from "date-fns-tz";
import { Switch } from "../ui/switch";

const hoursEngagedOptions = [
  { value: 0.5, label: "30 minutes" },
  { value: 0.75, label: "45 minutes" },
  { value: 1, label: "1 hour" },
  { value: 2, label: "2 hours" },
];

interface EventModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly event: CalendarEvent;
  readonly onSubmit: (event: CalendarEvent) => void;
  readonly onDelete: (id: string) => void;
  readonly mode: "add" | "edit";
  readonly timeZone: string;
  readonly refetch: () => void;
}

export function EventModal({
  isOpen,
  onClose,
  event,
  onSubmit,
  onDelete,
  mode,
  timeZone,
  refetch,
}: EventModalProps) {
  const { data: platforms } = useGetPlatformsQuery();
  const [formData, setFormData] = useState<CalendarEvent>({
    id: "",
    platform: "",
    start: "",
    end: "",
    allDay: false,
    backgroundColor: "#3788d8",
    hoursEngaged: 0,
    status: "create",
    timeZone: "UTC",
    isRecurring: false,
    recurrencePattern: "weekly",
  });
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    null
  );

  const calculateEndTime = (start: string, hoursEngaged: number): string => {
    if (!start || hoursEngaged <= 0) return start;

    const startDate = parseISO(start);
    const endDate = addMinutes(startDate, hoursEngaged * 60);
    return endDate.toISOString();
  };

  const [updateEvent] = useUpdateEventMutation();

  useEffect(() => {
    if (event) {
      setFormData({
        id: event.id || "",
        platform: event.platform || "",
        start: toZonedTime(event.start, timeZone).toISOString() || "",
        end: toZonedTime(event.end, timeZone).toISOString() || "",
        allDay: event.allDay || false,
        hoursEngaged: event.hoursEngaged || 0.5,
        status: event.status || "create",
        timeZone: event.timeZone || "UTC",
        backgroundColor: event.backgroundColor ?? "#3788d8",
        isRecurring: event.isRecurring ?? false,
        recurrencePattern: event.recurrencePattern ?? "weekly",
      });
    }
  }, [event, timeZone]);

  useEffect(() => {
    if (platforms) {
      setSelectedPlatform(
        platforms.data.find(
          (platform) => platform.name === formData.platform
        ) || null
      );
    }
  }, [platforms, formData.platform]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = parseISO(dateString);
      return format(date, "yyyy-MM-dd'T'HH:mm");
    } catch (error) {
      console.error("Failed to parse date:", error);
      return dateString;
    }
  };

  const handleStatusCheckboxChange = async (checked: boolean) => {
    if (formData.status === "completed") return;

    setFormData((prev) => ({
      ...prev,
      status: checked ? "completed" : "create",
    }));

    const response = await updateEvent({
      id: formData.id,
      status: "completed",
      backgroundColor: "#A0C878",
    });
    if (response.error) return;
    refetch();
    onClose();
  };

  const handleHoursEngagedChange = (value: string) => {
    setFormData({
      ...formData,
      hoursEngaged: Number(value),
    });
  };

  const handleRecurringChange = (checked: boolean) => {
    const platform = platforms?.data?.find((p) => p.name === formData.platform);

    setFormData((prev) => ({
      ...prev,
      isRecurring: checked,
      recurrencePattern: checked
        ? (() => {
            if (platform?.paymentType === "Weekly") return "weekly";
            if (platform?.paymentType === "Bi-Weekly") return "bi-weekly";
            return "weekly"; // Default fallback
          })()
        : undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const endLocal = calculateEndTime(formData.start, formData.hoursEngaged);

    onSubmit({
      ...formData,
      end: endLocal,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Event" : "Edit Event"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              {(platforms?.data ?? []).length > 0 && (
                <SelectMenu
                  label="Platform"
                  options={platforms?.data ?? []}
                  getOptionLabel={(p: Platform) => p.name}
                  getOptionValue={(p: Platform) => p.name}
                  value={formData.platform}
                  onChange={(platform) =>
                    setFormData({ ...formData, platform })
                  }
                  className="w-full"
                />
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="start">Start ({timeZone})</Label>
              <Input
                id="start"
                name="start"
                type="datetime-local"
                value={formatDateForInput(formData.start)}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2 bg-white w-[300px]">
              <SelectMenu
                label="Hours Engaged"
                options={hoursEngagedOptions}
                value={formData.hoursEngaged.toString()}
                onChange={handleHoursEngagedChange}
                className="w-[300px]"
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.value}
                placeholder="Select an option"
              />
              <p className="text-xs text-muted-foreground">
                End time will be calculated automatically based on hours engaged
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="backgroundColor">Color</Label>
              <Input
                id="backgroundColor"
                name="backgroundColor"
                type="color"
                value={formData.backgroundColor}
                onChange={handleChange}
              />
            </div>

            <div className="gap-2 flex items-center">
              <Switch
                id="isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={handleRecurringChange}
                disabled={
                  !["Weekly", "Bi-Weekly"].includes(
                    selectedPlatform?.paymentType ?? ""
                  )
                }
              />
              <Label htmlFor="isRecurring">This is a recurring event</Label>
            </div>

            {mode === "edit" && (
              <div className="grid gap-2">
                <div className="flex gap-2">
                  <Checkbox
                    id="status"
                    checked={formData.status === "completed"}
                    onCheckedChange={handleStatusCheckboxChange}
                    disabled={formData.status === "completed"}
                  />
                  <Label htmlFor="allDay">Mark as Complete</Label>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            {mode === "edit" && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(formData.id)}
              >
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{mode === "add" ? "Add" : "Update"}</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
