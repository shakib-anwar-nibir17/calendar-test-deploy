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
import { format, parseISO, addHours } from "date-fns";
import { convertTimeZone } from "@/lib/services/timeApi";
import { Loader2 } from "lucide-react";
import { CalendarEvent } from "@/store/states/calender";
import { SelectMenu } from "../main/select-menu";
import { useGetPlatformsQuery } from "@/store/services/platform.service";
import { Platform } from "@/store/states/platforms";
import HourMinuteInput from "@/components/ui/hour-minute";

interface EventModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly event: CalendarEvent;
  readonly onSubmit: (event: CalendarEvent) => void;
  readonly onDelete: (id: string) => void;
  readonly mode: "add" | "edit";
  readonly timeZone: string;
}

export function EventModal({
  isOpen,
  onClose,
  event,
  onSubmit,
  onDelete,
  mode,
  timeZone,
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
  const [isConverting, setIsConverting] = useState(false);
  const [platform, setPlatform] = useState<Platform["name"]>("");
  const [totalHoursEngaged, setTotalHoursEngaged] = useState<number>(
    event?.hoursEngaged ?? 0
  );

  useEffect(() => {
    if (event) {
      setFormData({
        id: event.id || "",
        platform: event.platform || "",
        start: event.start || "",
        end: event.start
          ? format(
              addHours(
                parseISO(event.start),
                event.hoursEngaged || totalHoursEngaged
              ),
              "yyyy-MM-dd'T'HH:mm"
            )
          : "",
        allDay: event.allDay || false,
        hoursEngaged: event.hoursEngaged || totalHoursEngaged,
        status: event.status || "create",
        timeZone: event.timeZone || "UTC",
        backgroundColor: event.backgroundColor ?? "#3788d8",
      });
    }
  }, [event, totalHoursEngaged]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, allDay: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      end: formData.start
        ? format(
            addHours(parseISO(formData.start), totalHoursEngaged),
            "yyyy-MM-dd'T'HH:mm"
          )
        : "",
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
                value={formData.start}
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="allDay"
                checked={formData.allDay}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="allDay">All Day</Label>
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
