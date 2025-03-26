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
import HourMinuteInput from "@/components/ui/hour-minute";
import { useUpdateEventMutation } from "@/store/services/calendar-event.service";
import { toZonedTime } from "date-fns-tz";

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
  });

  const calculateEndTime = (start: string, hoursEngaged: number): string => {
    if (!start || hoursEngaged <= 0) return start;

    const startDate = parseISO(start);
    const endDate = addMinutes(startDate, hoursEngaged * 60);
    return endDate.toISOString();
  };

  const [updateEvent] = useUpdateEventMutation();
  const [platform, setPlatform] = useState<Platform["name"]>(
    event.platform || ""
  );
  const [totalHoursEngaged, setTotalHoursEngaged] = useState<number>(
    event?.hoursEngaged ?? 0
  );

  useEffect(() => {
    if (event) {
      setFormData({
        id: event.id || "",
        platform: event.platform || platform,
        start: toZonedTime(event.start, timeZone).toISOString() || "",
        end: toZonedTime(event.end, timeZone).toISOString() || "",
        allDay: event.allDay || false,
        hoursEngaged: event.hoursEngaged || totalHoursEngaged,
        status: event.status || "create",
        timeZone: event.timeZone || "UTC",
        backgroundColor: event.backgroundColor ?? "#3788d8",
      });
    }
  }, [event, totalHoursEngaged, platform, timeZone]);

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
                  value={platform}
                  onChange={(platform) => setPlatform(platform)}
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

            <div className="grid gap-2">
              <HourMinuteInput
                defaultTotal={event.hoursEngaged}
                onChange={(hours: number) => setTotalHoursEngaged(hours)}
              />
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
