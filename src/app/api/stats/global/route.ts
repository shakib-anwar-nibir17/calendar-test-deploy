import { connectToMongoDB } from "@/lib/mongodb";
import CalendarEventModel from "@/models/calendar-event.model";
import Platform from "@/models/platform.model";
import { startOfWeek, endOfWeek, parseISO } from "date-fns";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  console.log("Fetching global stats...");
  await connectToMongoDB();

  try {
    console.log("Request URL:", req.url);
    const searchParams = new URLSearchParams(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    console.log("Start date:", startDate);
    console.log("End date:", endDate);

    const start = startDate ? parseISO(startDate) : startOfWeek(new Date());
    const end = endDate ? parseISO(endDate) : endOfWeek(new Date());

    console.log("Start:", start);
    console.log("End:", end);

    const events = await CalendarEventModel.find({
      start: { $gte: start },
      end: { $lte: end },
    }).populate("platform");

    console.log("Events found:", events.length);

    const completedClasses = events.filter(
      (event) => event.status === "completed"
    );

    let totalEarnings = 0;
    let totalHours = 0;
    const totalClasses = events.length;
    const upcomingClasses = events.length - completedClasses.length;

    for (const event of completedClasses) {
      if (!event.platform) continue;
      const platform = await Platform.findOne({ name: event.platform });
      totalEarnings += (event.hoursEngaged || 0) * (platform?.hourlyRate || 0);
      totalHours += event.hoursEngaged || 0;
    }

    console.log("Completed Classes:", completedClasses.length);
    console.log("Total Earnings:", totalEarnings);
    console.log("Total Hours:", totalHours);

    return NextResponse.json(
      {
        totalEarnings,
        totalHours,
        totalClasses,
        upcomingClasses,
        completedClasses: completedClasses.length,
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
