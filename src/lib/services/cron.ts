import { CronJob } from "cron";
import { addWeeks, addHours, addMonths, addDays } from "date-fns";
import { connectToMongoDB } from "../mongodb";

import CalendarEventModel from "@/models/calendar-event.model";

export async function generateRecurringEvents() {
  console.log(
    "Running recurring events generation job:",
    new Date().toISOString()
  );

  try {
    await connectToMongoDB();

    const now = new Date();

    // Step 1: Find all parent recurring events
    const recurringEvents = await CalendarEventModel.find({
      isRecurring: true,
      start: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    });

    console.log(`Found ${recurringEvents.length} recurring events to process`);

    // Step 2: Process each parent event
    for (const event of recurringEvents) {
      console.log(
        `Processing event ${event._id} - Platform: ${event.platform} - Start: ${event.start}`
      );

      // Step 3: Get all child events for the parent event
      const childEvents = await CalendarEventModel.find({
        parentEventId: event._id,
        start: { $gte: now }, // Only consider future child events
      }).sort({ start: -1 }); // Sort by latest date first

      // If no child events exist, create the first one
      const latestChild = childEvents[0]; // The latest child event

      // Step 4: Determine the next recurrence date based on the parent event's recurrence pattern
      let nextRecurrenceDate: Date | null = null;
      if (latestChild) {
        switch (event.recurrencePattern) {
          case "Weekly":
            nextRecurrenceDate = addWeeks(new Date(latestChild.start), 1);
            break;
          case "Bi-Weekly":
            nextRecurrenceDate = addWeeks(new Date(latestChild.start), 2);
            break;
          case "Monthly":
            nextRecurrenceDate = addMonths(new Date(latestChild.start), 1);
            break;
          case "Upfront":
            nextRecurrenceDate = addDays(new Date(latestChild.start), 1); // Assuming upfront events are 1 day apart
            break;
          default:
            console.warn(
              `Unsupported recurrence pattern for event ${event._id}: ${event.recurrencePattern}`
            );
        }
      }

      // Step 5: If the next recurrence date is valid, create a new event
      if (nextRecurrenceDate && nextRecurrenceDate > now) {
        // Ensure no duplicates by checking if the next date already exists
        const existingChildEvent = await CalendarEventModel.findOne({
          parentEventId: event._id,
          start: nextRecurrenceDate,
        });

        if (!existingChildEvent) {
          try {
            // Create a new child event for the calculated recurrence date
            await CalendarEventModel.create({
              platform: event.platform,
              start: nextRecurrenceDate,
              end: nextRecurrenceDate, // Adjust in pre-hook if necessary
              hoursEngaged: event.hoursEngaged,
              status: "active", // Or inherit the parent status if needed
              allDay: event.allDay,
              timeZone: event.timeZone, // Same timezone as parent
              isRecurring: false, // This is a child event, not recurring
              parentEventId: event._id,
              backgroundColor: event.backgroundColor,
            });

            console.log(
              `✅ Created event for ${
                event._id
              } on ${nextRecurrenceDate.toISOString()}`
            );
          } catch (error) {
            console.error(
              `❌ Failed to create event for ${
                event._id
              } on ${nextRecurrenceDate.toISOString()}`,
              error
            );
          }
        } else {
          console.log(
            `⚠️ Event for ${
              event._id
            } already exists on ${nextRecurrenceDate.toISOString()}`
          );
        }
      } else {
        console.log(
          `⚠️ Skipping generation for ${event._id}, no valid next recurrence date.`
        );
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
