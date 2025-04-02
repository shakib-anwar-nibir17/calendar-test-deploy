import { connectToMongoDB } from "@/lib/mongodb";
import CalendarEventModel from "@/models/calendar-event.model";
import Platform from "@/models/platform.model";
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

    const platforms = await Platform.find().lean();
    console.log("Platforms found:", platforms);
    const platformStats: Record<
      string,
      {
        totalClasses: number;
        totalHours: number;
        upcomingClasses: number;
        completedClasses: number;
        totalEarnings: number;
      }
    > = {};

    for (const platform of platforms) {
      const events = await CalendarEventModel.find({
        platform: platform.name,
        start: { $gte: start },
        end: { $lte: end },
      });

      const totalClasses = events.length;
      const totalHours = events
        .filter((event) => event.status === "completed") // Filter only completed events
        .reduce((sum, event) => sum + (event.hoursEngaged || 0), 0);

      const totalEarnings = events
        .filter((event) => event.status === "completed")
        .reduce(
          (sum, event) => sum + (event.hoursEngaged || 0) * platform.hourlyRate,
          0
        );

      const upcomingClasses = events.filter(
        (event) => event.status !== "completed"
      ).length;
      const completedClasses = events.filter(
        (event) => event.status === "completed"
      ).length;

      platformStats[platform.name] = {
        totalClasses,
        totalHours,
        upcomingClasses,
        completedClasses,
        totalEarnings,
      };
    }

    return NextResponse.json(platformStats, { status: 200 });
  } catch (error) {
    console.error("Error fetching platform-wise stats:", error);
    return NextResponse.json({ error: "Internal Server Error", status: 500 });
  }
}
