"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Calendar,
  Clock,
  Repeat,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarEvent } from "@/store/states/calender";
import { Platform } from "@/store/states/platforms";

interface EventListProps {
  readonly events: CalendarEvent[];
  readonly onSelectEvent: (event: CalendarEvent) => void;
  readonly onDeleteEvent: (eventId: string) => void;
  readonly selectedEventId: string | null;
  readonly platforms: Platform[];
}

export default function EventList({
  events,
  onSelectEvent,
  onDeleteEvent,
  selectedEventId,
  platforms = [],
}: EventListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(
    null
  );

  const handleDeleteClick = (event: CalendarEvent) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      onDeleteEvent(eventToDelete.id);
    }
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
        {events.length > 0 ? (
          events.map((event) => (
            <Card
              key={event.id}
              className={`cursor-pointer transition-colors ${
                selectedEventId === event.id ? "border-primary" : ""
              }`}
              onClick={() => onSelectEvent(event)}
            >
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base font-medium line-clamp-1">
                    {event.platform}
                  </CardTitle>
                  {event.isRecurring && (
                    <Badge variant="outline" className="mt-1">
                      <Repeat className="h-3 w-3 mr-1" />
                      {event.recurrencePattern}
                    </Badge>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(event);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="grid grid-cols-[16px_1fr] gap-x-2 gap-y-1 text-xs">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(new Date(event.start))}</span>

                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formatTime(new Date(event.start))} -
                    {formatTime(new Date(event.end))}
                  </span>

                  {event.platform && (
                    <div className="col-span-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {platforms.find((p) => p._id === event.platform)
                          ?.name ?? event.platform}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No events found</p>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Event
            </AlertDialogTitle>
            <AlertDialogDescription>
              {eventToDelete?.isRecurring
                ? "This is a recurring event. Deleting this event will delete  all occurrences in the series?"
                : "Are you sure you want to delete this event? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {eventToDelete?.isRecurring && (
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() => confirmDelete()}
              >
                Delete Event
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
