"use client";

import {
  format,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
} from "date-fns";
import { Clock, AlertCircle, CheckCircle, NotebookPen } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CalendarEvent } from "@/store/states/calender";
import { getRecentClasses } from "@/utils/event-filter";
import { useGetEventsQuery } from "@/store/services/calendar-event.service";

// Types
// Helper function to format date display
const formatEventDate = (date: Date): string => {
  const now = new Date();

  if (date > now) return ""; // Ignore future dates

  const minutesAgo = differenceInMinutes(now, date);
  const hoursAgo = differenceInHours(now, date);
  const daysAgo = differenceInDays(now, date);

  if (minutesAgo < 60) {
    return `${minutesAgo} min ago`;
  } else if (hoursAgo < 24) {
    return `${hoursAgo} hr ago`;
  } else if (daysAgo < 7) {
    return `${daysAgo} days ago`;
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

export function RecentActivity() {
  const { data: events, isLoading, error } = useGetEventsQuery();

  // Process and sort events
  const sortedEvents = getRecentClasses(events?.events || []);
  console.log(sortedEvents);

  if (isLoading) return <p>Loading events...</p>;
  if (error) return <p>Error loading events.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <NotebookPen className="h-5 w-5 text-primary" />
          Recent Classes
        </CardTitle>
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
          } else if (sortedEvents.length > 0) {
            return (
              <ScrollArea className=" pr-4">
                <div className="space-y-4">
                  {sortedEvents.map((event: CalendarEvent, index: number) => {
                    return (
                      <div key={event.id} className="group">
                        <div className="flex items-start gap-3">
                          <div
                            className="flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center"
                            style={{ backgroundColor: `#AFE1AF` }}
                          >
                            <CheckCircle
                              className="h-6 w-6"
                              style={{ color: "#088F8F" }}
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
                        {index < sortedEvents.length - 1 && (
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
                  No recent classes scheduled
                </p>
              </div>
            );
          }
        })()}
      </CardContent>

      {sortedEvents.length > 0 && (
        <CardFooter className="border-t pt-4 flex justify-between">
          <p className="text-xs text-muted-foreground">
            {sortedEvents.length} recent{" "}
            {sortedEvents.length === 1 ? "class" : "classes"}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
