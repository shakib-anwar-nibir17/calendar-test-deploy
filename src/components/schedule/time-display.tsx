"use client";

import { useState, useEffect } from "react";
import { Clock, Globe } from "lucide-react";

interface TimeDisplayProps {
  readonly timeZone: string;
  readonly hour?: number;
  readonly minute?: number;
  readonly seconds?: number;
  readonly milliSeconds?: number;
  readonly showLocalTime?: boolean;
  readonly use24Hour?: boolean;
  readonly className?: string;
}

export function TimeDisplay({
  timeZone,
  hour,
  minute,
  seconds,
  milliSeconds,
  showLocalTime = true,
  use24Hour = true,
  className = "",
}: TimeDisplayProps) {
  const [localTime, setLocalTime] = useState(new Date());
  const [timezoneTime, setTimezoneTime] = useState({
    hour: hour ?? 0,
    minute: minute ?? 0,
    seconds: seconds ?? 0,
    milliSeconds: milliSeconds ?? 0,
  });
  const [timezoneDate, setTimezoneDate] = useState({
    date: "",
    dayOfWeek: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Initialize and update times
  useEffect(() => {
    // Initial update
    updateTimes();

    // Set interval for updates
    const intervalId = setInterval(updateTimes, 10);

    return () => clearInterval(intervalId);

    // Function to update all time values
    function updateTimes() {
      try {
        // Update local time
        const now = new Date();
        setLocalTime(now);

        // Get current time in the specified timezone
        const timeOptions: Intl.DateTimeFormatOptions = {
          timeZone,
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
        };

        const timeFormatter = new Intl.DateTimeFormat("en-US", timeOptions);
        const tzTimeStr = timeFormatter.format(now);

        // Parse the timezone time
        const [tzHours, tzMinutes, tzSeconds] = tzTimeStr
          .split(":")
          .map(Number);

        // Get milliseconds (approximation since Intl API doesn't provide ms)
        const ms = now.getMilliseconds();

        setTimezoneTime({
          hour: tzHours,
          minute: tzMinutes,
          seconds: tzSeconds,
          milliSeconds: ms,
        });

        // Get date in the timezone
        const dateOptions: Intl.DateTimeFormatOptions = {
          timeZone,
          year: "numeric",
          month: "numeric",
          day: "numeric",
          weekday: "long",
        };

        const dateFormatter = new Intl.DateTimeFormat("en-US", dateOptions);
        const parts = dateFormatter.formatToParts(now);

        const month = parts.find((part) => part.type === "month")?.value ?? "";
        const day = parts.find((part) => part.type === "day")?.value ?? "";
        const year = parts.find((part) => part.type === "year")?.value ?? "";
        const weekday =
          parts.find((part) => part.type === "weekday")?.value ?? "";

        setTimezoneDate({
          date: `${month}/${day}/${year}`,
          dayOfWeek: weekday,
        });

        // Clear any previous errors
        if (error) setError(null);
      } catch (err) {
        console.error(err);
        setError("Invalid timezone");
      }
    }
  }, [timeZone, error]);

  // Format time based on 12/24 hour preference
  const formatTimezoneTime = () => {
    if (use24Hour) {
      return `${timezoneTime.hour
        .toString()
        .padStart(2, "0")}:${timezoneTime.minute
        .toString()
        .padStart(2, "0")}:${timezoneTime.seconds.toString().padStart(2, "0")}`;
    } else {
      const h = timezoneTime.hour % 12 || 12;
      const ampm = timezoneTime.hour >= 12 ? "PM" : "AM";
      return `${h.toString().padStart(2, "0")}:${timezoneTime.minute
        .toString()
        .padStart(2, "0")}:${timezoneTime.seconds
        .toString()
        .padStart(2, "0")} ${ampm}`;
    }
  };

  // Format local time
  const formatLocalTime = () => {
    const h = use24Hour
      ? localTime.getHours()
      : localTime.getHours() % 12 || 12;
    const m = localTime.getMinutes();
    const s = localTime.getSeconds();
    const ampm = localTime.getHours() >= 12 ? "PM" : "AM";

    const timeStr = `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return use24Hour ? timeStr : `${timeStr} ${ampm}`;
  };

  // Calculate time difference
  const getTimeDifference = () => {
    const localHours = localTime.getHours();
    const tzHours = timezoneTime.hour;

    let hourDiff = tzHours - localHours;

    // Adjust for day boundary crossings
    if (hourDiff > 12) hourDiff -= 24;
    if (hourDiff < -12) hourDiff += 24;

    // Format the difference
    const sign = hourDiff >= 0 ? "+" : "";
    return `${sign}${hourDiff}:00`;
  };

  if (error) {
    return (
      <div
        className={`w-[150px] p-2 text-center text-destructive border border-destructive rounded-md ${className}`}
      >
        {error}: {timeZone}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-center">
        <h2 className="text-sm font-semibold">{timeZone}</h2>
      </div>

      <div style={{ width: `[150px]` }} className="mx-auto">
        <div className="text-lg font-bold text-center tracking-tight">
          {formatTimezoneTime()}
        </div>

        <div className="flex flex-col items-center gap-1 pt-2 border-t border-border mt-2">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs">{timezoneDate.date}</span>
          </div>

          {showLocalTime && (
            <>
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">Local: {formatLocalTime()}</span>
              </div>

              <div className="text-[10px] text-muted-foreground">
                Offset: {getTimeDifference()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
