"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchCurrentTime, type TimeApiResponse } from "@/lib/services/timeApi";
import { useTimeZone } from "@/contexts/time-zone-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CurrentTime() {
  const { currentTimeZone } = useTimeZone();
  const [timeData, setTimeData] = useState<TimeApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTime = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchCurrentTime(currentTimeZone);
      setTimeData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to fetch current time. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentTimeZone]);

  // Fetch time when component mounts or time zone changes
  useEffect(() => {
    fetchTime();

    // Set up interval to update time every minute
    const intervalId = setInterval(fetchTime, 60000);

    return () => clearInterval(intervalId);
  }, [currentTimeZone, fetchTime]);

  let content;

  if (isLoading) {
    content = (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  } else if (error) {
    content = (
      <div className="text-center py-4">
        <p className="text-destructive mb-2">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchTime}>
          Try Again
        </Button>
      </div>
    );
  } else if (timeData) {
    content = (
      <div className="space-y-2">
        <div className="text-3xl font-bold">{timeData.time}</div>
        <div className="text-sm text-muted-foreground">
          {timeData.date} ({timeData.dayOfWeek})
        </div>
        {timeData.dstActive && (
          <div className="text-xs bg-yellow-100 dark:bg-yellow-900 p-1 rounded text-yellow-800 dark:text-yellow-200">
            Daylight Saving Time is active
          </div>
        )}
        {lastUpdated && (
          <div className="text-xs text-muted-foreground mt-4">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    );
  } else {
    content = null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Current Time
        </CardTitle>
        <CardDescription>Time in {currentTimeZone} time zone</CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
