"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Label } from "@radix-ui/react-dropdown-menu";
import { convertToHoursMinutes } from "@/utils/convert-to-hours-minutes";

interface TimeInputProps {
  readonly onChange?: (
    hours: number,
    minutes: number,
    totalHours: number
  ) => void;
  readonly className?: string;
  readonly defaultTotal?: number;
  readonly disabled?: boolean;
}

export default function HourMinuteInput({
  onChange,
  className,
  defaultTotal = 0,
  disabled = false,
}: TimeInputProps) {
  const result = convertToHoursMinutes(defaultTotal);
  const [hours, setHours] = useState<number>(result.hours);
  const [minutes, setMinutes] = useState<number>(result.minutes);

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    const clampedValue = isNaN(value) ? 0 : Math.max(0, Math.min(23, value));

    setHours(clampedValue);
    const total = clampedValue + minutes / 60;
    onChange?.(clampedValue, minutes, total);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    const clampedValue = isNaN(value) ? 0 : Math.max(0, Math.min(59, value));

    setMinutes(clampedValue);
    const total = hours + clampedValue / 60;
    onChange?.(hours, clampedValue, total);
  };

  const totalString = (hours + minutes / 60).toFixed(2);
  const totalHours = Number.parseFloat(totalString);

  useEffect(
    () => onChange?.(hours, minutes, totalHours),
    [totalHours, onChange, hours, minutes]
  );

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <Label>Select Hours </Label>
      <div className="flex items-end gap-2 w-full">
        <div className="flex flex-col space-y-1 w-full">
          <Input
            id="hours"
            type="number"
            min={0}
            max={23}
            value={hours}
            onChange={handleHoursChange}
            placeholder="0"
            disabled={disabled}
          />
        </div>
        <span className="mb-2.5 text-xl">:</span>
        <div className="flex flex-col space-y-1 w-full">
          <Input
            id="minutes"
            type="number"
            min={0}
            max={59}
            value={minutes}
            onChange={handleMinutesChange}
            placeholder="0"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
