import { connectToMongoDB } from "@/lib/mongodb";
import CalendarEventModel from "@/models/calendar-event.model";
import { NextResponse } from "next/server";

// GET all events
export async function GET() {
  try {
    await connectToMongoDB();
    const events = await CalendarEventModel.find({}).sort({ createdAt: -1 });

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
    console.log("Received request:", data);

    await connectToMongoDB();

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
    });

    // Transform the response to match the expected format
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

    return NextResponse.json(transformedEvent, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
