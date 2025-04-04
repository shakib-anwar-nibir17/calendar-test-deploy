import { CronJob } from "cron";
import { addWeeks, format, addHours } from "date-fns";
import { connectToMongoDB } from "../mongodb";

import CalendarEventModel from "@/models/calendar-event.model";
import Platform from "@/models/platform.model";

export async function generateRecurringEvents() {
  console.log(
    "Running recurring events generation job:",
    new Date().toISOString()
  );

  try {
    await connectToMongoDB();

    const now = new Date();
    const futureDate = addWeeks(now, 4); // Generate for the next 4 weeks

    // Find all recurring events from the last 3 months that need child events
    const recurringEvents = await CalendarEventModel.find({
      isRecurring: true,
      start: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }, // Avoid old events
    });

    console.log(`Found ${recurringEvents.length} recurring events to process`);

    for (const event of recurringEvents) {
      // Get platform details
      const platform = await Platform.findOne({ name: event.platform });

      if (!platform) {
        console.warn(`Skipping event ${event._id} - Platform not found`);
        continue;
      }

      if (!["Weekly", "Bi-Weekly"].includes(platform.paymentType)) {
        continue; // Only process if the payment type is Weekly or Bi-Weekly
      }

      const interval =
        platform.paymentType === "Bi-Weekly" ||
        event.recurrencePattern === "bi-weekly"
          ? 2
          : 1;

      // Fetch existing child events only within the 4-week range
      const existingChildDates = new Set(
        (
          await CalendarEventModel.find({
            parentEventId: event._id,
            start: { $gte: now, $lte: futureDate },
          }).select("start")
        ).map((child) => format(new Date(child.start), "yyyy-MM-dd"))
      );

      // Generate missing instances
      for (let i = 1; i <= 4; i++) {
        const instanceDate = addWeeks(event.start, i * interval);

        if (instanceDate < now) continue; // Skip past events

        const dateString = format(instanceDate, "yyyy-MM-dd");
        if (existingChildDates.has(dateString)) continue; // Skip if already exists

        try {
          await CalendarEventModel.create({
            platform: event.platform,
            start: instanceDate,
            end: instanceDate, // Presumed adjusted in pre-save hook
            hoursEngaged: event.hoursEngaged,
            status: "active",
            allDay: event.allDay,
            timeZone: event.timeZone,
            isRecurring: false,
            parentEventId: event._id,
            backgroundColor: event.backgroundColor,
          });

          console.log(`✅ Created event for ${event._id} on ${dateString}`);
        } catch (error) {
          console.error(
            `❌ Failed to create event for ${event._id} on ${dateString}`,
            error
          );
        }
      }
    }

    console.log("✅ Completed recurring events generation");
  } catch (error) {
    console.error("❌ Error in recurring events job:", error);
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
