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

    // Check if user wants to make this event recurring
    const isRecurring = Boolean(data.isRecurring);
    let recurrencePattern = data.recurrencePattern;

    if (isRecurring && !recurrencePattern) {
      recurrencePattern = "weekly"; // Default recurrence pattern
    }

    // Update only the current event
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

    // If the event was converted to a recurring event, generate future occurrences
    if (isRecurring && !existingEvent.isRecurring) {
      setTimeout(() => {
        generateRecurringEvents().catch((err) =>
          console.error("Error generating recurring events:", err)
        );
      }, 1000);
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
  context: { params: { id: string } }
) {
  try {
    await connectToMongoDB();

    const { params } = context;
    console.log(params.id); // ✅ Ensure `params` is accessed from `context`
    const id = params?.id;
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
          { parentEventId: null }
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
