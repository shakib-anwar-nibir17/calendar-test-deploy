import { CronJob } from "cron";
import { addWeeks, addDays, format, addHours } from "date-fns";
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
            backgroundColor: event.backgroundColor,
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

export async function generateRecurringEventsForEvent(eventId: string) {
  try {
    // Fetch the event
    const event = await CalendarEventModel.findById(eventId);
    if (!event) {
      return { message: "Event not found" };
    }

    if (event.isRecurring && !event.parentEventId) {
      // Parent event logic: Check for 4 weeks of child events
      const childEvents = await CalendarEventModel.find({
        parentEventId: event._id,
      });

      return {
        message: `Parent event has ${childEvents.length} child events for recurring`,
      };
    } else if (event.parentEventId) {
      // Child event logic: Find parent and generate additional events
      const parentEvent = await CalendarEventModel.findById(
        event.parentEventId
      );
      if (!parentEvent) {
        return { message: "Parent event not found" };
      }

      // Get all children to determine the sequence position
      const siblingEvents = await CalendarEventModel.find({
        parentEventId: parentEvent._id,
      }).sort({ start: 1 });

      const childIndex = siblingEvents.findIndex((e) =>
        e._id.equals(event._id)
      );
      if (childIndex === -1) {
        return { message: "Child event not found in sequence" };
      }

      const eventsToGenerate = childIndex + 1;
      const startDate = new Date(parentEvent.start);
      const interval = parentEvent.recurrencePattern === "bi-weekly" ? 2 : 1;
      const now = new Date();

      let generatedCount = 0;
      for (let i = 1; i <= eventsToGenerate; i++) {
        const instanceDate = addWeeks(
          startDate,
          (siblingEvents.length + i) * interval
        );
        if (instanceDate < now) continue;

        const existingEvent = await CalendarEventModel.findOne({
          parentEventId: parentEvent._id,
          start: instanceDate,
        });

        if (!existingEvent) {
          await new CalendarEventModel({
            platform: parentEvent.platform,
            start: instanceDate,
            end: addHours(instanceDate, parentEvent.hoursEngaged),
            hoursEngaged: parentEvent.hoursEngaged,
            status: "active",
            allDay: parentEvent.allDay,
            timeZone: parentEvent.timeZone,
            isRecurring: false,
            parentEventId: parentEvent._id,
            backgroundColor: parentEvent.backgroundColor,
          }).save();
          generatedCount++;
        }
      }

      return { message: `Generated ${generatedCount} additional events` };
    }

    return { message: "Event is neither a parent nor a child" };
  } catch (error) {
    console.error("Error handling event edit:", error);
    return { message: "Error processing event" };
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
