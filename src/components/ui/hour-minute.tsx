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
      <Label>Select Hours</Label>
      <Select
        onValueChange={handleChange}
        defaultValue={String(defaultTotal)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue>
            {hours ? `${hours} Hour${hours > 1 ? "s" : ""}` : "Select hours"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {[1, 2, 3, 4, 5].map((hour) => (
            <SelectItem key={hour} value={String(hour)}>
              {hour} Hour{hour > 1 ? "s" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
