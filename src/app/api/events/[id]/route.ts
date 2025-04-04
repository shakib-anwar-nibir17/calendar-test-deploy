import { NextResponse } from "next/server";

import CalendarEventModel from "@/models/calendar-event.model";
import mongoose from "mongoose";
import { connectToMongoDB } from "@/lib/mongodb";
import { generateRecurringEventsForEvent } from "@/lib/services/cron";
import { addDays } from "date-fns";
import Platform from "@/models/platform.model";

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
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure params is awaited properly
    const eventId = (await context.params).id;

    if (!eventId) {
      return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
    }

    await connectToMongoDB();

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json(
        { error: "Invalid event ID format" },
        { status: 400 }
      );
    }

    const existingEvent = await CalendarEventModel.findById(eventId);
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Parse the incoming data
    const data = await request.json();
    console.log("Received request:", data);

    const isRecurring = Boolean(data.isRecurring);
    let recurrencePattern = data.recurrencePattern;

    // Default recurrence pattern if not provided
    if (isRecurring && !recurrencePattern) {
      recurrencePattern = "weekly";
    }

    // Update the event with the new details
    const updatedEvent = await CalendarEventModel.findByIdAndUpdate(
      eventId,
      { ...data, isRecurring, recurrencePattern },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return NextResponse.json(
        { error: "Failed to update event" },
        { status: 500 }
      );
    }

    // Handle the recurring event logic
    const platform = await Platform.findOne({ name: updatedEvent.platform });

    if (platform) {
      // If payment type is "Upfront", generate 4 daily events
      if (platform.paymentType === "Upfront") {
        const instancesToGenerate = 4;

        // Generate 4 daily events for Upfront payments
        for (let i = 0; i < instancesToGenerate; i++) {
          const instanceDate = addDays(new Date(updatedEvent.start), i);

          await CalendarEventModel.create({
            platform: updatedEvent.platform,
            start: instanceDate,
            end: addDays(instanceDate, updatedEvent.hoursEngaged), // Adjust the end time accordingly
            backgroundColor: updatedEvent.backgroundColor,
            displayStart: updatedEvent.displayStart,
            displayEnd: updatedEvent.displayEnd,
            hoursEngaged: updatedEvent.hoursEngaged,
            status: "active",
            allday: updatedEvent.allday,
            timeZone: updatedEvent.timeZone,
            isRecurring: false, // Child events are not recurring
            parentEventId: updatedEvent._id,
          });
        }
      } else if (isRecurring && !existingEvent.isRecurring) {
        // If it's not Upfront and it's being converted to a recurring event
        await generateRecurringEventsForEvent(updatedEvent._id);
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
