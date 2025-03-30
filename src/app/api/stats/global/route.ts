import { connectToMongoDB } from "@/lib/mongodb";
import CalendarEventModel from "@/models/calendar-event.model";
import { startOfWeek, endOfWeek, parseISO } from "date-fns";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await connectToMongoDB();

  try {
    const searchParams = new URLSearchParams(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const start = startDate ? parseISO(startDate) : startOfWeek(new Date());
    const end = endDate ? parseISO(endDate) : endOfWeek(new Date());

    const events = await CalendarEventModel.find({
      start: { $gte: start },
      end: { $lte: end },
    }).populate("platform");

    let totalEarnings = 0;
    let totalHours = 0;
    const totalClasses = events.length;
    const upcomingClasses = events.filter(
      (event) => event.status !== "completed"
    ).length;
    const completedClasses = events.filter(
      (event) => event.status === "completed"
    ).length;

    for (const event of events) {
      if (!event.platform) continue;
      const platform = event.platform;
      totalEarnings += (event.hoursEngaged || 0) * (platform.hourlyRate || 0);
      totalHours += event.hoursEngaged || 0;
    }

    return NextResponse.json(
      {
        totalEarnings,
        totalHours,
        totalClasses,
        upcomingClasses,
        completedClasses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching global stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
