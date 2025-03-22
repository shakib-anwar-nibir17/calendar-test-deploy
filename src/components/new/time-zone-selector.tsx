"use client";

import { useState } from "react";
import { useTimeZone } from "@/contexts/time-zone-context";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const timeZoneList = [
  "America/New_York", // Eastern Time
  "Asia/Dhaka", // Bangladesh Time
  "Asia/Shanghai", // Beijing Time
  "America/Los_Angeles", // Pacific Time
  "America/Chicago", // Central Time
  "Asia/Kolkata", // Indian Time
];

export function TimeZoneSelector() {
  const { currentTimeZone, availableTimeZones, setCurrentTimeZone, isLoading } =
    useTimeZone();
  const [open, setOpen] = useState(false);

  // Filter available time zones
  const filteredTimeZones = availableTimeZones.filter((tz) =>
    timeZoneList.includes(tz)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between"
          disabled={isLoading}
        >
          {isLoading ? "Loading time zones..." : currentTimeZone}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search time zone..." />
          <CommandList>
            <CommandEmpty>No time zone found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {filteredTimeZones.map((timeZone) => (
                <CommandItem
                  key={timeZone}
                  value={timeZone}
                  onSelect={() => {
                    setCurrentTimeZone(timeZone);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentTimeZone === timeZone ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {timeZone}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
