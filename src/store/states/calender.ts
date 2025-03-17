import { Platform } from "./platforms";

export interface CalendarEvent {
  id: string;
  platform: Platform["name"];
  start: Date;
  end: Date;
  color?: string;
  displayStart?: Date;
  displayEnd?: Date;
  hoursEngaged?: number;
  status: "active" | "completed" | "create";
  timeZone: string;
}

export interface SlotInfo {
  start: Date;
  end: Date;
  slots: Date[];
  action: "select" | "click" | "doubleClick";
}
