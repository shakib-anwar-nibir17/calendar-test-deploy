import { connectToMongoDB } from "@/lib/mongodb";
import CalendarEventModel from "@/models/calendar-event.model";
import { sendResponse } from "@/utils/server/response.handler";
import { HTTP_STATUS_CODES } from "@/utils/server/http-status-codes";
import { sendError } from "@/utils/server/error.handler";

// Create a new event (POST)
export async function POST(req: Request) {
  await connectToMongoDB();

  try {
    const body = await req.json();
    console.log("Received payload:", body);

    const { title, date, description, location } = body;

    if (!title || !date) {
      console.error("Missing required fields:", { title, date });
      return sendError(
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Missing required fields"
      );
    }

    const newEvent = new CalendarEventModel({
      title,
      date,
      description,
      location,
    });
    await newEvent.save();

    return sendResponse(
      newEvent,
      HTTP_STATUS_CODES.CREATED,
      "Event created successfully"
    );
  } catch (error) {
    return sendError(
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Error creating event",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

// Get all events (GET)
export async function GET() {
  await connectToMongoDB();

  try {
    const events = await CalendarEventModel.find();

    return sendResponse(
      events,
      HTTP_STATUS_CODES.OK,
      "Events fetched successfully"
    );
  } catch (error) {
    return sendError(
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Error fetching events",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
