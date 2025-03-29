import { connectToMongoDB } from "@/lib/mongodb";
import CalendarEventModel from "@/models/calendar-event.model";
import { NextResponse } from "next/server";
import { addWeeks } from "date-fns";
import Platform from "@/models/platform.model";
import mongoose from "mongoose";
import { generateRecurringEvents } from "@/lib/services/cron";

// GET all events
export async function GET() {
  try {
    await connectToMongoDB();

    // Fetch all events, including child recurring events
    const events = await CalendarEventModel.find().sort({ createdAt: -1 });

    // Transform the MongoDB _id to id for frontend compatibility
    const transformedEvents = events.map((event) => ({
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
      isRecurring: event.isRecurring,
      recurrencePattern: event.recurrencePattern,
      parentEventId: event.parentEventId
        ? event.parentEventId.toString()
        : undefined,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));

    return NextResponse.json(transformedEvents);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST a new event
export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Received request:", data);

    await connectToMongoDB();

    let isRecurring = Boolean(data.isRecurring);
    let recurrencePattern = data.recurrencePattern;

    // If recurring, validate platform payment type
    if (isRecurring) {
      const platform = await Platform.findOne({ name: data.platform });

      if (
        !platform ||
        (platform.paymentType !== "Weekly" &&
          platform.paymentType !== "Bi-Weekly")
      ) {
        isRecurring = false;
        recurrencePattern = undefined;
      } else if (!recurrencePattern) {
        recurrencePattern =
          platform.paymentType === "Weekly" ? "weekly" : "bi-weekly";
      }
    }

    const event = await CalendarEventModel.create({
      platform: data.platform,
      start: data.start,
      end: data.end,
      backgroundColor: data.backgroundColor,
      displayStart: data.displayStart,
      displayEnd: data.displayEnd,
      hoursEngaged: data.hoursEngaged,
      status: data.status,
      allday: data.allday,
      timeZone: data.timeZone,
      isRecurring,
      recurrencePattern,
    });

    // If this is a recurring event, generate future instances
    if (isRecurring) {
      const interval = recurrencePattern === "bi-weekly" ? 2 : 1;
      const weeksToGenerate = 4;

      for (let i = 1; i <= weeksToGenerate; i++) {
        const instanceDate = addWeeks(new Date(data.start), i * interval);

        await CalendarEventModel.create({
          platform: data.platform,
          start: instanceDate,
          end: addWeeks(new Date(data.end), i * interval),
          backgroundColor: data.backgroundColor,
          displayStart: data.displayStart,
          displayEnd: data.displayEnd,
          hoursEngaged: data.hoursEngaged,
          status: "active",
          allday: data.allday,
          timeZone: data.timeZone,
          isRecurring: false, // Child events are not recurring
          parentEventId: event._id,
        });
      }
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
      isRecurring,
      recurrencePattern,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };

    return NextResponse.json(transformedEvent, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectToMongoDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

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

    if (event.isRecurring) {
      // Delete all child events first
      await CalendarEventModel.deleteMany({ parentEventId: event._id });
    }

    // Delete the parent or standalone event
    await CalendarEventModel.findByIdAndDelete(id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    console.log("Received request:", data);
    if (!data) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    await connectToMongoDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid event ID format" },
        { status: 400 }
      );
    }

    const existingEvent = await CalendarEventModel.findById(id);
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Determine recurrence settings
    const isRecurring = Boolean(data.isRecurring);
    const recurrencePattern = isRecurring
      ? data.recurrencePattern || "weekly"
      : undefined;

    // Update the main event
    const updatedEvent = await CalendarEventModel.findByIdAndUpdate(
      id,
      { ...data, isRecurring, recurrencePattern },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return NextResponse.json(
        { error: "Failed to update event" },
        { status: 500 }
      );
    }

    // Handle updates for child events if recurrence is enabled
    if (isRecurring) {
      const childEvents = await CalendarEventModel.find({
        parentEventId: updatedEvent._id,
      });

      for (const event of childEvents) {
        const newStart = new Date(event.start);
        const newEnd = new Date(
          newStart.getTime() + updatedEvent.hoursEngaged * 60 * 60 * 1000
        );

        await CalendarEventModel.findByIdAndUpdate(event._id, {
          platform: updatedEvent.platform,
          start: newStart,
          end: newEnd, // Dynamically set end time
          hoursEngaged: updatedEvent.hoursEngaged,
          allday: updatedEvent.allday,
          timeZone: updatedEvent.timeZone,
        });
      }

      // Generate new recurring events asynchronously
      generateRecurringEvents().catch((err) =>
        console.error("Error generating recurring events:", err)
      );
    } else if (existingEvent.isRecurring) {
      // If event was previously recurring, determine how to handle child events
      const updateChildren = searchParams.get("updateChildren") === "true";

      if (updateChildren) {
        // Keep child events but mark them as non-recurring
        await CalendarEventModel.updateMany(
          { parentEventId: updatedEvent._id },
          { isRecurring: false, recurrencePattern: undefined }
        );
      } else {
        // Remove future recurring instances
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
