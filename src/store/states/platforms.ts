import { CalendarEvent } from "./calender";

type paymentType = "Weekly" | "Bi-Weekly" | "Monthly" | "Upfront";

export type DayValue =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type Platform = {
  id: string;
  name: string;
  paymentType: paymentType;
  hourlyRate: number;
  nextPayData: string;
  day?: DayValue;
  events: CalendarEvent[];
};

export type PlatformsState = {
  platforms: Platform[];
};
