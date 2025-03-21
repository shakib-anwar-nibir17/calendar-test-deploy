import { Platform } from "./platforms";

export interface CalendarEvent {
  id: string;
  platform: Platform["name"];
  start: string;
  end: string;
  backgroundColor?: string;
  displayStart?: Date;
  displayEnd?: Date;
  hoursEngaged: number;
  status: "active" | "completed" | "create";
  allDay: boolean;
  timeZone: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SlotInfo {
  start: Date;
  end: Date;
  slots: Date[];
  action: "select" | "click" | "doubleClick";
}

export interface CalendarEventResponse {
  success: boolean;
  code: number;
  data: CalendarEvent[];
  message?: string;
}
