import { NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import Platform from "@/models/platform.model";
import { sendResponse } from "@/utils/server/response.handler";
import { HTTP_STATUS_CODES } from "@/utils/server/http-status-codes";
import { sendError } from "@/utils/server/error.handler";

// Create a new platform (POST)
export async function POST(req: Request) {
  await connectToMongoDB();

  try {
    const body = await req.json();
    console.log("Received payload:", body);

    const { name, paymentType, hourlyRate, nextPayDate, day, events } = body;

    if (!name || !paymentType || !hourlyRate) {
      console.error("Missing required fields:", {
        name,
        paymentType,
        hourlyRate,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newPlatform = new Platform({
      name,
      paymentType,
      hourlyRate,
      nextPayDate,
      day,
      events,
    });
    await newPlatform.save();

    return sendResponse(
      newPlatform,
      HTTP_STATUS_CODES.CREATED,
      "Platform created successfully"
    );
  } catch (error) {
    return sendError(
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Error",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

// Get all platforms (GET)
export async function GET() {
  await connectToMongoDB();

  try {
    const platforms = await Platform.find().populate("events");

    return sendResponse(
      platforms,
      HTTP_STATUS_CODES.OK,
      "Platforms fetched successfully"
    );
  } catch (error) {
    return sendError(
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Error",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
