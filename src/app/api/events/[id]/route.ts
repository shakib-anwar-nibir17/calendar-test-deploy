import { NextResponse } from "next/server";

import CalendarEventModel from "@/models/calendar-event.model";
import mongoose from "mongoose";
import { connectToMongoDB } from "@/lib/mongodb";
import { addDays, addMonths, addWeeks } from "date-fns";
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
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    console.log(params.id); // ✅ Ensure `params` is accessed from `context`
    const id = params?.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid event ID format" },
        { status: 400 }
      );
    }

    const data = await request.json();
    console.log("Received update:", data);

    await connectToMongoDB();

    const eventId = id;
    const existingEvent = await CalendarEventModel.findById(eventId);
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const platform = await Platform.findOne({ name: data.platform });
    if (!platform) {
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 400 }
      );
    }

    // Determine updated recurrence
    let isRecurring = Boolean(data.isRecurring);
    let recurrencePattern = data.recurrencePattern;

    switch (platform.paymentType) {
      case "Weekly":
      case "Bi-Weekly":
      case "Monthly":
        recurrencePattern = recurrencePattern || platform.paymentType;
        break;
      case "Upfront":
        recurrencePattern = "Upfront";
        break;
      default:
        isRecurring = false;
        recurrencePattern = undefined;
    }

    // Update the main event
    existingEvent.platform = data.platform;
    existingEvent.start = data.start;
    existingEvent.end = data.end;
    existingEvent.backgroundColor = data.backgroundColor;
    existingEvent.displayStart = data.displayStart;
    existingEvent.displayEnd = data.displayEnd;
    existingEvent.hoursEngaged = data.hoursEngaged;
    existingEvent.status = data.status;
    existingEvent.allday = data.allday;
    existingEvent.timeZone = data.timeZone;
    existingEvent.isRecurring = isRecurring;
    existingEvent.recurrencePattern = recurrencePattern;

    await existingEvent.save();

    // Delete old recurring children
    await CalendarEventModel.deleteMany({ parentEventId: eventId });

    // Re-generate recurring children if still recurring
    if (isRecurring) {
      let instancesToGenerate = 4;
      let intervalValue = 1;
      let intervalType: "Weekly" | "Bi-Weekly" | "Monthly" | "Upfront";

      switch (platform.paymentType) {
        case "Bi-Weekly":
          intervalType = "Bi-Weekly";
          intervalValue = 2;
          break;
        case "Monthly":
          intervalType = "Monthly";
          break;
        case "Upfront":
          intervalType = "Upfront";
          intervalValue = 1;
          instancesToGenerate = 4;
          break;
        default:
          intervalType = "Weekly";
          intervalValue = 1;
      }

      let instanceDate = new Date(data.start);

      for (let i = 1; i <= instancesToGenerate; i++) {
        switch (intervalType) {
          case "Bi-Weekly":
            instanceDate = addWeeks(instanceDate, intervalValue);
            break;
          case "Monthly":
            instanceDate = addMonths(instanceDate, intervalValue);
            break;
          case "Upfront":
            instanceDate = addDays(instanceDate, intervalValue);
            break;
          default:
            instanceDate = addWeeks(instanceDate, intervalValue);
        }

        if (instanceDate < new Date()) continue;

        await CalendarEventModel.create({
          platform: data.platform,
          start: instanceDate,
          end: instanceDate, // Adjust in pre-save hook
          backgroundColor: data.backgroundColor,
          displayStart: data.displayStart,
          displayEnd: data.displayEnd,
          hoursEngaged: data.hoursEngaged,
          status: "active",
          allday: data.allday,
          timeZone: data.timeZone,
          isRecurring: false,
          parentEventId: existingEvent._id,
          recurrencePattern,
        });
      }
    }

    const updatedEvent = {
      id: existingEvent._id.toString(),
      platform: existingEvent.platform,
      start: existingEvent.start,
      end: existingEvent.end,
      backgroundColor: existingEvent.backgroundColor,
      displayStart: existingEvent.displayStart,
      displayEnd: existingEvent.displayEnd,
      hoursEngaged: existingEvent.hoursEngaged,
      status: existingEvent.status,
      allday: existingEvent.allday,
      timeZone: existingEvent.timeZone,
      isRecurring: existingEvent.isRecurring,
      recurrencePattern: existingEvent.recurrencePattern,
      createdAt: existingEvent.createdAt,
      updatedAt: existingEvent.updatedAt,
    };

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to update event:", error);
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
