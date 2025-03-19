import { NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import Platform from "@/models/platform.model";

// Create a new platform (POST)
export async function POST(req: Request) {
  await connectToMongoDB();

  try {
    const { name, paymentType, hourlyRate, nextPayDate, day, events } =
      await req.json();

    if (!name || !paymentType || !hourlyRate || !nextPayDate) {
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

    return NextResponse.json(newPlatform, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}

// Get all platforms (GET)
export async function GET() {
  await connectToMongoDB();

  try {
    const platforms = await Platform.find().populate("events");
    return NextResponse.json(platforms, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
