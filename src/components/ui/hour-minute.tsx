"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

interface TimeInputProps {
  readonly onChange?: (hours: number) => void;
  readonly className?: string;
  readonly defaultTotal?: number;
  readonly disabled?: boolean;
}

const timeOptions = [
  { label: "30 mins", value: 0.5 },
  { label: "45 mins", value: 0.75 },
  { label: "1 Hour", value: 1 },
  { label: "2 Hours", value: 2 },
];

export default function HourSelectInput({
  onChange,
  className,
  defaultTotal = 1,
  disabled = false,
}: TimeInputProps) {
  const [hours, setHours] = useState<number>(defaultTotal);

  const handleChange = (value: string) => {
    const selectedHours = Number(value);
    setHours(selectedHours);
    onChange?.(selectedHours);
  };

  useEffect(() => onChange?.(hours), [hours, onChange]);

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <Label>Total Hours</Label>
      <Select
        onValueChange={handleChange}
        defaultValue={String(defaultTotal)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue>
            {timeOptions.find((option) => option.value === hours)?.label ??
              "Select time"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {timeOptions.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
