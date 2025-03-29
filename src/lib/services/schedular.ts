import { CronJob } from "cron";
import { initRecurringEventsJob } from "./cron";

let isInitialized = false;
let cronJob: CronJob | null = null;

export function initScheduler() {
  if (isInitialized) return;

  // Initialize the cron job
  cronJob = initRecurringEventsJob();
  isInitialized = true;

  console.log("Scheduler initialized");
}

export function stopScheduler() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    isInitialized = false;
    console.log("Scheduler stopped");
  }
}
