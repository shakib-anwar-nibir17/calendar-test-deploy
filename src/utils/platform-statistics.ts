import { CalendarEvent } from "@/store/states/calender";
import { Platform } from "@/store/states/platforms";

type PlatformSummary = {
  totalClasses: number;
  upcomingClasses: number;
  completedClasses: number;
  moneyEarned: number;
  nextClass: Date | null;
};

export function extractPlatformStatistics(
  events: CalendarEvent[],
  platforms: Platform[]
) {
  const platformSummary: Record<string, PlatformSummary> = {};

  const totalSummary: PlatformSummary = {
    totalClasses: 0,
    upcomingClasses: 0,
    completedClasses: 0,
    moneyEarned: 0,
    nextClass: null,
  };

  // Convert platforms array to a Map for quick lookup
  const platformMap = new Map(platforms.map((p) => [p.name, p]));

  events.forEach((event) => {
    const { platform, status, hoursEngaged = 0, start } = event;
    const platformData = platformMap.get(platform);
    const hourlyRate = platformData?.hourlyRate ?? 0;

    // Initialize platform if not already in summary
    if (!platformSummary[platform]) {
      platformSummary[platform] = {
        totalClasses: 0,
        upcomingClasses: 0,
        completedClasses: 0,
        moneyEarned: 0,
        nextClass: null,
      };
    }

    // Increment total class count
    platformSummary[platform].totalClasses++;
    totalSummary.totalClasses++;

    if (status === "completed") {
      platformSummary[platform].completedClasses++;
      platformSummary[platform].moneyEarned += hoursEngaged * hourlyRate;

      totalSummary.completedClasses++;
      totalSummary.moneyEarned += hoursEngaged * hourlyRate;
    } else if (status === "active") {
      platformSummary[platform].upcomingClasses++;
      totalSummary.upcomingClasses++;

      const eventStartDate = new Date(start);

      // Update next class if earlier than stored one
      if (
        !platformSummary[platform].nextClass ||
        eventStartDate < platformSummary[platform].nextClass
      ) {
        platformSummary[platform].nextClass = eventStartDate;
      }

      // Update global next class
      if (!totalSummary.nextClass || eventStartDate < totalSummary.nextClass) {
        totalSummary.nextClass = eventStartDate;
      }
    }
  });

  // Convert platformSummary to an array
  const platformsArray = Object.entries(platformSummary).map(
    ([name, data]) => ({
      name,
      ...data,
    })
  );

  return {
    total: totalSummary,
    platforms: platformsArray,
  };
}
