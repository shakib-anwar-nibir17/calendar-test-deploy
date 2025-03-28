import { connectToMongoDB } from "@/lib/mongodb";
import CalendarEventModel from "@/models/calendar-event.model";
import { NextResponse } from "next/server";
import { addWeeks } from "date-fns";
import Platform from "@/models/platform.model";

// GET all events
export async function GET() {
  try {
    await connectToMongoDB();

    // // Fetch all events excluding child recurring events
    // const events = await CalendarEventModel.find({
    //   parentEventId: { $exists: false },
    // }).sort({ createdAt: -1 });

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
