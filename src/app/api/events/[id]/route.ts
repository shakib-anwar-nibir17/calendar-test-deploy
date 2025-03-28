import { NextResponse } from "next/server";

import CalendarEventModel from "@/models/calendar-event.model";
import mongoose from "mongoose";
import { connectToMongoDB } from "@/lib/mongodb";
import { generateRecurringEvents } from "@/lib/services/cron";

// GET a specific event
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid event ID format" },
        { status: 400 }
      );
    }

    const event = await CalendarEventModel.findById(params.id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const transformedEvent = {
      id: event._id.toString(),
      platform: event.platform,
      start: event.start,
      end: event.end,
      backgroundColor: event.backgroundColor,
      displayStart: event.displayStart,
      displayEnd: event.displayEnd,
      hoursEngaged: event.hoursEngaged,
      status: event.status,
      allday: event.allday,
      timeZone: event.timeZone,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };

    return NextResponse.json(transformedEvent);
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    await connectToMongoDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid event ID format" },
        { status: 400 }
      );
    }

    const existingEvent = await CalendarEventModel.findById(params.id);
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if the event is recurring
    const isRecurring = Boolean(data.isRecurring);
    let recurrencePattern = data.recurrencePattern;

    if (isRecurring) {
      if (!recurrencePattern) {
        recurrencePattern = "weekly"; // Default to weekly if not provided
      }
    } else {
      recurrencePattern = undefined;
    }

    // Update the main event
    const updatedEvent = await CalendarEventModel.findByIdAndUpdate(
      params.id,
      { ...data, isRecurring, recurrencePattern },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return NextResponse.json(
        { error: "Failed to update event" },
        { status: 500 }
      );
    }

    // Handle recurring event updates
    if (isRecurring) {
      const childEvents = await CalendarEventModel.find({
        parentEventId: updatedEvent._id,
      });
      for (const childEvent of childEvents) {
        await CalendarEventModel.findByIdAndUpdate(childEvent._id, {
          platform: updatedEvent.platform,
          end: updatedEvent.end,
          hoursEngaged: updatedEvent.hoursEngaged,
          allday: updatedEvent.allday,
          timeZone: updatedEvent.timeZone,
        });
      }

      // Generate new recurring events if necessary
      setTimeout(() => {
        generateRecurringEvents().catch((err) =>
          console.error("Error generating recurring events:", err)
        );
      }, 1000);
    } else if (existingEvent.isRecurring) {
      const url = new URL(request.url);
      const updateChildren = url.searchParams.get("updateChildren") === "true";

      if (updateChildren) {
        await CalendarEventModel.updateMany(
          { parentEventId: updatedEvent._id },
          { isRecurring: false, recurrencePattern: undefined }
        );
      } else {
        await CalendarEventModel.deleteMany({
          parentEventId: updatedEvent._id,
          start: { $gt: new Date() },
        });
      }
    }

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Failed to update event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();

    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid event ID format" },
        { status: 400 }
      );
    }

    const event = await CalendarEventModel.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const parentId = event.parentEventId;

    // Delete the event
    await CalendarEventModel.findByIdAndDelete(id);

    // If it was a child event, check if the parent still exists
    if (parentId) {
      const parentExists = await CalendarEventModel.findById(parentId);
      if (!parentExists) {
        await CalendarEventModel.updateMany(
          { parentEventId: parentId },
          { parentEventId: "" }
        );
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
