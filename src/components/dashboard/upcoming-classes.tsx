"use client";

import { useState, useEffect } from "react";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { Calendar, Clock, CalendarClock, AlertCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CalendarEvent } from "@/store/states/calender";
import { getUpcomingAndRecentEvents } from "@/utils/event-filter";

// Types
// Helper function to format date display
const formatEventDate = (date: Date): string => {
  if (isToday(date)) {
    return `Today, ${format(date, "h:mm a")}`;
  } else if (isTomorrow(date)) {
    return `Tomorrow, ${format(date, "h:mm a")}`;
  } else if (date < addDays(new Date(), 7)) {
    return format(date, "EEEE, h:mm a"); // Day of week for next 7 days
  } else {
    return format(date, "MMM d, h:mm a");
  }
};

// Helper to get status badge color
const getStatusColor = (status: CalendarEvent["status"]) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "completed":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    case "create":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

// Helper to get platform color
const getPlatformColor = (platform: string, defaultColor = "#6366f1") => {
  // This could be expanded to map specific platforms to specific colors
  const colorMap: Record<string, string> = {
    "Platform A": "#3b82f6", // blue
    "Platform B": "#8b5cf6", // purple
    "Platform C": "#ec4899", // pink
    "Platform D": "#10b981", // green
  };

  return colorMap[platform] || defaultColor;
};

export function UpcomingClasses() {
  const [comingEvents, setComingEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a small loading delay for better UX
    const timer = setTimeout(() => {
      const storedEvents = localStorage.getItem("calendarEvents") ?? "[]";
      let parsedEvents: CalendarEvent[] = [];

      try {
        // Parse the events and convert string dates to Date objects
        parsedEvents = JSON.parse(storedEvents, (key, value) => {
          if (
            key === "start" ||
            key === "end" ||
            key === "displayStart" ||
            key === "displayEnd"
          ) {
            return value ? new Date(value) : null;
          }
          return value;
        });
      } catch (error) {
        console.error("Error parsing calendar events:", error);
      }

      if (parsedEvents.length === 0) {
        setIsLoading(false);
        return;
      }

      // Sort upcoming events by start date
      const { upcoming } = getUpcomingAndRecentEvents(parsedEvents);
      const sortedEvents = [...upcoming].sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      );

      setComingEvents(sortedEvents);
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []); // ✅ Runs only on mount

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Classes
        </CardTitle>
        <CardDescription>
          Your scheduled classes for the next few days
        </CardDescription>
      </CardHeader>

      <CardContent>
        {(() => {
          if (isLoading) {
            return (
              // Loading skeleton
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            );
          } else if (comingEvents.length > 0) {
            return (
              <ScrollArea className=" pr-4">
                <div className="space-y-4">
                  {comingEvents.map((event, index) => {
                    const platformColor = getPlatformColor(event.platform);
                    return (
                      <div key={event.id} className="group">
                        <div className="flex items-start gap-3">
                          <div
                            className="flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center"
                            style={{ backgroundColor: `${platformColor}20` }}
                          >
                            <CalendarClock
                              className="h-6 w-6"
                              style={{ color: platformColor }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm truncate">
                                {event.platform}
                              </h4>
                              <Badge
                                variant="outline"
                                className={`ml-2 ${getStatusColor(
                                  event.status
                                )}`}
                              >
                                {event.status}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-xs mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatEventDate(new Date(event.start))}
                            </p>
                          </div>
                        </div>
                        {index < comingEvents.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            );
          } else {
            return (
              <div className="py-12 text-center space-y-3">
                <div className="mx-auto bg-muted rounded-full w-12 h-12 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  No upcoming classes scheduled
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Browse available classes
                </Button>
              </div>
            );
          }
        })()}
      </CardContent>

      {comingEvents.length > 0 && (
        <CardFooter className="border-t pt-4 flex justify-between">
          <p className="text-xs text-muted-foreground">
            {comingEvents.length} upcoming{" "}
            {comingEvents.length === 1 ? "class" : "classes"}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
