import { CronJob } from "cron";
import { addWeeks, addDays, format } from "date-fns";
import { connectToMongoDB } from "../mongodb";

import CalendarEventModel from "@/models/calendar-event.model";
import Platform from "@/models/platform.model";

// Function to generate recurring events
export async function generateRecurringEvents() {
  console.log(
    "Running recurring events generation job:",
    new Date().toISOString()
  );

  try {
    await connectToMongoDB();

    // Find all recurring events that don't have child events for the next 4 weeks
    const recurringEvents = await CalendarEventModel.find({
      isRecurring: true,
      // Only include events from the last 3 months to avoid processing very old events
      start: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    });

    console.log(`Found ${recurringEvents.length} recurring events to process`);

    for (const event of recurringEvents) {
      // Get the platform to check payment type
      const platform = await Platform.findOne({ name: event.platform });

      if (!platform) {
        console.error(`Platform not found for event: ${event._id}`);
        continue;
      }

      // Only process weekly and bi-weekly payment types
      if (
        platform.paymentType !== "Weekly" &&
        platform.paymentType !== "Bi-Weekly"
      ) {
        continue;
      }

      // Check if we already have child events for this recurring event
      const existingChildEvents = await CalendarEventModel.find({
        parentEventId: event._id,
      });

      // Calculate how many instances we should have
      const now = new Date();
      const startDate = new Date(event.start);
      const weeksToGenerate = 4; // Generate events for the next 4 weeks

      // Determine the interval based on recurrence pattern or platform payment type
      const interval =
        event.recurrencePattern === "bi-weekly" ||
        platform.paymentType === "Bi-Weekly"
          ? 2
          : 1;

      // Generate new instances if needed
      for (let i = 1; i <= weeksToGenerate; i++) {
        // Calculate the date for this instance
        const instanceDate = addWeeks(startDate, i * interval);

        // Skip if this instance is in the past
        if (instanceDate < now) continue;

        // Check if we already have an event for this date
        const dateString = format(instanceDate, "yyyy-MM-dd");
        const existingEvent = existingChildEvents.find(
          (child) => format(new Date(child.start), "yyyy-MM-dd") === dateString
        );

        if (!existingEvent) {
          // Create a new event instance
          const newEvent = new CalendarEventModel({
            platform: event.platform,
            start: instanceDate,
            end: addDays(instanceDate, 0), // Will be adjusted by pre-save hook
            hoursEngaged: event.hoursEngaged,
            status: "active",
            allDay: event.allDay,
            timeZone: event.timeZone,
            isRecurring: false, // Child events are not recurring themselves
            parentEventId: event._id,
          });

          await newEvent.save();
          console.log(
            `Created new recurring instance for event ${event._id} on ${dateString}`
          );
        }
      }
    }

    console.log("Completed recurring events generation");
  } catch (error) {
    console.error("Error generating recurring events:", error);
  }
}

// Initialize cron job to run daily at midnight
export function initRecurringEventsJob() {
  // Run at midnight every day
  const job = new CronJob(
    "0 0 * * *",
    generateRecurringEvents,
    null,
    false,
    "UTC"
  );

  // Start the job
  job.start();
  console.log("Recurring events cron job initialized");

  return job;
}
