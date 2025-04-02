"use client";

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
import { getUpcomingClasses } from "@/utils/event-filter";
import { useGetEventsQuery } from "@/store/services/calendar-event.service";
import { DateRange } from "react-day-picker";

const formatEventDate = (date: Date): string => {
  if (isToday(date)) return `Today, ${format(date, "h:mm a")}`;
  if (isTomorrow(date)) return `Tomorrow, ${format(date, "h:mm a")}`;
  if (date < addDays(new Date(), 7)) return format(date, "EEEE, h:mm a");
  return format(date, "MMM d, h:mm a");
};

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

const getPlatformColor = (platform: string, defaultColor = "#6366f1") => {
  const colorMap: Record<string, string> = {
    "Platform A": "#3b82f6",
    "Platform B": "#8b5cf6",
    "Platform C": "#ec4899",
    "Platform D": "#10b981",
  };
  return colorMap[platform] || defaultColor;
};

export function UpcomingClasses({
  date,
}: Readonly<{ date: DateRange | undefined }>) {
  const { data: events, isLoading } = useGetEventsQuery();
  const comingEvents = getUpcomingClasses(events?.events || [], date);
  console.log(comingEvents);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="h-5 w-5 text-primary" /> Upcoming Classes
        </CardTitle>
        <CardDescription>
          Your scheduled classes for the next few days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(() => {
          if (isLoading) {
            return (
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
          }

          if (comingEvents.length > 0) {
            return (
              <ScrollArea className="pr-4">
                <div className="space-y-4">
                  {comingEvents.map((event, index) => (
                    <div key={event.id} className="group">
                      <div className="flex items-start gap-3">
                        <div
                          className="flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center"
                          style={{
                            backgroundColor: `${getPlatformColor(
                              event.platform
                            )}20`,
                          }}
                        >
                          <CalendarClock
                            className="h-6 w-6"
                            style={{ color: getPlatformColor(event.platform) }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">
                              {event.platform}
                            </h4>
                            <Badge
                              variant="outline"
                              className={`ml-2 ${getStatusColor(event.status)}`}
                            >
                              {event.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-xs mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />{" "}
                            {formatEventDate(new Date(event.start))}
                          </p>
                        </div>
                      </div>
                      {index < comingEvents.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            );
          }

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
