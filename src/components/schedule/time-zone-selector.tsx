"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useFetchTimeForZoneQuery } from "@/store/services/time-zone.service";

const timeZoneList = [
  "America/New_York", // Eastern Time
  "Asia/Dhaka", // Bangladesh Time
  "Asia/Shanghai", // Beijing Time
  "America/Los_Angeles", // Pacific Time
  "America/Chicago", // Central Time
  "Asia/Kolkata", // Indian Time
];

interface TimeZoneSelectorProps {
  readonly selectedTimeZone: string;
  readonly onTimeZoneChange: (timeZone: string) => void;
}

export default function TimeZoneSelector({
  selectedTimeZone,
  onTimeZoneChange,
}: TimeZoneSelectorProps) {
  const { isLoading, isError } = useFetchTimeForZoneQuery(selectedTimeZone);
  const [timeZones, setTimeZones] = useState<string[]>([]);

  useEffect(() => {
    setTimeZones(timeZoneList);
  }, []);

  const handleTimeZoneChange = (value: string) => {
    onTimeZoneChange(value);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <Label htmlFor="timezone" className="text-sm whitespace-nowrap">
          Time Zone:
        </Label>
        <Select value={selectedTimeZone} onValueChange={handleTimeZoneChange}>
          <SelectTrigger className="w-[220px]" id="timezone">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {timeZones.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Show the current time and UTC offset */}
      <div className="text-sm text-gray-600">
        {isLoading && <p>Loading current time...</p>}
        {isError && <p className="text-red-500">Failed to load time</p>}
      </div>
    </div>
  );
}
