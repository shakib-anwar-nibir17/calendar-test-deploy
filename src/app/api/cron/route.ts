import { connectToMongoDB } from "@/lib/mongodb";
import { generateRecurringEvents } from "@/lib/services/cron";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToMongoDB();
    await generateRecurringEvents();
    return NextResponse.json({
      success: true,
      message: "Recurring events generated successfully",
    });
  } catch (error) {
    console.error("Error generating recurring events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate recurring events" },
      { status: 500 }
    );
  }
}
