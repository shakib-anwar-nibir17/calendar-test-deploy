import { connectToMongoDB } from "@/lib/mongodb";
import CalendarEventModel from "@/models/calendar-event.model";
import { NextResponse } from "next/server";
import { addDays, addMonths, addWeeks } from "date-fns";
import Platform from "@/models/platform.model";
import mongoose from "mongoose";

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

    // Validate platform and determine recurrence type
    const platform = await Platform.findOne({ name: data.platform });

    if (!platform) {
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 400 }
      );
    }

    switch (platform.paymentType) {
      case "Weekly":
        recurrencePattern = recurrencePattern || "weekly";
        break;
      case "Bi-Weekly":
        recurrencePattern = recurrencePattern || "bi-weekly";
        break;
      case "Monthly":
        recurrencePattern = recurrencePattern || "monthly";
        break;
      case "Upfront":
        recurrencePattern = "daily"; // Upfront is always daily
        break;
      default:
        isRecurring = false;
        recurrencePattern = undefined;
    }

    // Create the main event
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

    // Generate recurring instances if applicable
    if (isRecurring) {
      let instancesToGenerate = 4;
      let intervalType: "weekly" | "bi-weekly" | "monthly" | "daily";
      let intervalValue: number;

      switch (platform.paymentType) {
        case "Bi-Weekly":
          intervalType = "bi-weekly";
          intervalValue = 2;
          break;
        case "Monthly":
          intervalType = "monthly";
          intervalValue = 1;
          break;
        case "Upfront":
          intervalType = "daily";
          intervalValue = 1;
          instancesToGenerate = 4; // Only 4 daily events
          break;
        default:
          intervalType = "weekly";
          intervalValue = 1;
      }

      let instanceDate = new Date(data.start);

      for (let i = 1; i <= instancesToGenerate; i++) {
        switch (intervalType) {
          case "bi-weekly":
            instanceDate = addWeeks(instanceDate, intervalValue);
            break;
          case "monthly":
            instanceDate = addMonths(instanceDate, intervalValue);
            break;
          case "daily":
            instanceDate = addDays(instanceDate, intervalValue);
            break;
          default:
            instanceDate = addWeeks(instanceDate, intervalValue);
        }

        if (instanceDate < new Date()) continue; // Prevent past events

        await CalendarEventModel.create({
          platform: data.platform,
          start: instanceDate,
          end: instanceDate, // Adjusted in pre-save hook
          backgroundColor: data.backgroundColor,
          displayStart: data.displayStart,
          displayEnd: data.displayEnd,
          hoursEngaged: data.hoursEngaged,
          status: "active",
          allday: data.allday,
          timeZone: data.timeZone,
          isRecurring: false,
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
    console.error("❌ Failed to create event:", error);
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

    // Get platform details
    const platform = await Platform.findOne({ name: data.platform });
    if (!platform) {
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 400 }
      );
    }

    let isRecurring = Boolean(data.isRecurring);
    let recurrencePattern;

    // Set the correct recurrence pattern based on payment type
    switch (platform.paymentType) {
      case "Weekly":
        recurrencePattern = "weekly";
        break;
      case "Bi-Weekly":
        recurrencePattern = "bi-weekly";
        break;
      case "Monthly":
        recurrencePattern = "monthly";
        break;
      case "Upfront":
        recurrencePattern = "daily";
        break;
      default:
        isRecurring = false;
        recurrencePattern = undefined;
    }

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

    // Handle child events if recurrence is updated
    if (isRecurring) {
      // Remove future child events and regenerate them
      await CalendarEventModel.deleteMany({
        parentEventId: updatedEvent._id,
        start: { $gt: new Date() },
      });

      const instancesToGenerate = 4; // 4 weeks for weekly/bi-weekly/monthly, 4 days for upfront
      let intervalType: "weekly" | "bi-weekly" | "monthly" | "daily";
      let intervalValue: number;

      switch (platform.paymentType) {
        case "Bi-Weekly":
          intervalType = "bi-weekly";
          intervalValue = 2;
          break;
        case "Monthly":
          intervalType = "monthly";
          intervalValue = 1;
          break;
        case "Upfront":
          intervalType = "daily";
          intervalValue = 1;
          break;
        default:
          intervalType = "weekly";
          intervalValue = 1;
      }

      let instanceDate = new Date(updatedEvent.start);

      for (let i = 1; i <= instancesToGenerate; i++) {
        switch (intervalType) {
          case "bi-weekly":
            instanceDate = addWeeks(instanceDate, intervalValue);
            break;
          case "monthly":
            instanceDate = addMonths(instanceDate, intervalValue);
            break;
          case "daily":
            instanceDate = addDays(instanceDate, intervalValue);
            break;
          default:
            instanceDate = addWeeks(instanceDate, intervalValue);
        }

        if (instanceDate < new Date()) continue; // Prevent past event creation

        await CalendarEventModel.create({
          platform: updatedEvent.platform,
          start: instanceDate,
          end: instanceDate, // Adjusted in pre-save hook
          backgroundColor: updatedEvent.backgroundColor,
          displayStart: updatedEvent.displayStart,
          displayEnd: updatedEvent.displayEnd,
          hoursEngaged: updatedEvent.hoursEngaged,
          status: "active",
          allday: updatedEvent.allday,
          timeZone: updatedEvent.timeZone,
          isRecurring: false,
          parentEventId: updatedEvent._id,
        });
      }
    } else if (existingEvent.isRecurring) {
      // If the event was previously recurring, handle child events based on user preference
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
